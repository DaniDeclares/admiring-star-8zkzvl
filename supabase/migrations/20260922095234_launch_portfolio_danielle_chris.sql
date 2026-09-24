
create table if not exists public.dd_launch_portfolio (
  service_id uuid primary key references public.services(id) on delete cascade,
  canonical_sku text not null unique,
  fulfillment_lane text not null check (fulfillment_lane in ('DANIELLE','CHRIS','EITHER','DANIELLE_MANAGED','JOINT_COMPOSABLE')),
  capability_status text not null check (capability_status in ('VERIFIED','SCOPED','MANAGED','NEEDS_RESOURCE_VERIFICATION')),
  evidence_status text not null check (evidence_status in ('OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED')),
  evidence_basis text not null,
  launch_wave integer not null default 3 check (launch_wave between 1 and 9),
  jurisdiction_scope text,
  scope_guardrails jsonb not null default '{}'::jsonb,
  portfolio_status text not null default 'AUDIT' check (portfolio_status in ('AUDIT','BLOCKED','READY_FOR_RELEASE_VERIFICATION','LIVE_READY','DEFERRED')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dd_launch_portfolio enable row level security;
revoke all on public.dd_launch_portfolio from anon, authenticated;
grant select,insert,update,delete on public.dd_launch_portfolio to service_role;

create or replace view public.dd_launch_portfolio_readiness_v1
with (security_invoker=true) as
select lp.*, s.name as service_name, s.service_family, s.pricing_type, s.base_price_cents,
       rc.release_state, rc.blocking_gate, rc.canonical_identity_ok, rc.commercial_definition_ok,
       rc.pricing_engine_ok, rc.quote_path_ok, rc.channel_authorization_ok, rc.fulfillment_matrix_ok,
       rc.payment_ledger_ok, rc.runtime_accuracy_ok, rc.production_smoke_verified, rc.regression_verified
from public.dd_launch_portfolio lp
join public.services s on s.id=lp.service_id
left join public.dd_service_release_contract_v1 rc on rc.canonical_sku=lp.canonical_sku;

revoke all on public.dd_launch_portfolio_readiness_v1 from anon, authenticated;
grant select on public.dd_launch_portfolio_readiness_v1 to service_role;

-- Wave 1: Danielle cleaning + holiday work already owner-confirmed.
insert into public.dd_launch_portfolio(service_id,canonical_sku,fulfillment_lane,capability_status,evidence_status,evidence_basis,launch_wave,scope_guardrails,notes)
select id,sku,'DANIELLE',
       case when sku in ('DNI-01A-025','DNI-01A-042') then 'SCOPED' else 'VERIFIED' end,
       'OWNER_CONFIRMED','Owner-confirmed direct cleaning/steam/carpet/reset capability',1,
       case when sku='DNI-01A-025' then '{"safety":"high-reach limited to safe accessible work; no hazardous access"}'::jsonb
            when sku='DNI-01A-042' then '{"underwriting":"biohazard or unsafe contamination requires review; ordinary severe pet mess only"}'::jsonb
            else '{}'::jsonb end,
       'Cleaning launch cohort'
from public.services where service_family='01A Home & Cleaning'
on conflict(canonical_sku) do update set fulfillment_lane=excluded.fulfillment_lane,capability_status=excluded.capability_status,evidence_status=excluded.evidence_status,evidence_basis=excluded.evidence_basis,launch_wave=excluded.launch_wave,scope_guardrails=excluded.scope_guardrails,notes=excluded.notes,updated_at=now();

insert into public.dd_launch_portfolio(service_id,canonical_sku,fulfillment_lane,capability_status,evidence_status,evidence_basis,launch_wave,scope_guardrails,notes)
select id,sku,
       case when sku='DNI-01F-002' then 'DANIELLE_MANAGED' else 'DANIELLE' end,
       case when sku='DNI-01F-002' then 'SCOPED' else 'VERIFIED' end,
       'OWNER_CONFIRMED','Owner-confirmed holiday/seasonal setup, decorating and takedown priority',1,
       case when sku='DNI-01F-002' then '{"guardrail":"no electrical alteration or unsafe/high-access installation; qualified fulfillment where required"}'::jsonb else '{}'::jsonb end,
       'Holiday launch priority'
from public.services where service_family='01F Seasonal & Holiday Home Services'
on conflict(canonical_sku) do update set fulfillment_lane=excluded.fulfillment_lane,capability_status=excluded.capability_status,evidence_status=excluded.evidence_status,evidence_basis=excluded.evidence_basis,launch_wave=excluded.launch_wave,scope_guardrails=excluded.scope_guardrails,notes=excluded.notes,updated_at=now();

-- Wave 1: DTF/heat press can be fulfilled by either Danielle or Chris.
insert into public.dd_launch_portfolio(service_id,canonical_sku,fulfillment_lane,capability_status,evidence_status,evidence_basis,launch_wave,notes)
select id,sku,'EITHER','VERIFIED','OWNER_CONFIRMED','Owner-confirmed Danielle and Chris DTF/heat-press capability',1,'Either owner or authorized provider route; economics differ by fulfiller'
from public.services where sku in ('DNI-11A-017','DNI-11A-018')
on conflict(canonical_sku) do update set fulfillment_lane=excluded.fulfillment_lane,capability_status=excluded.capability_status,evidence_status=excluded.evidence_status,evidence_basis=excluded.evidence_basis,launch_wave=excluded.launch_wave,notes=excluded.notes,updated_at=now();

-- Wave 2: Chris technical and specifically confirmed media/content lanes.
insert into public.dd_launch_portfolio(service_id,canonical_sku,fulfillment_lane,capability_status,evidence_status,evidence_basis,launch_wave,scope_guardrails,notes)
select id,sku,'CHRIS','VERIFIED','OWNER_CONFIRMED',
       case when sku like 'DNI-06A-%' then 'Owner-confirmed Chris computer/workstation/peripheral capability' else 'Owner-confirmed Chris social/content/video capability' end,
       2,
       case when sku like 'DNI-06A-%' then '{"excludes":["advanced networking","cybersecurity","penetration testing","data recovery","licensed IT claims"]}'::jsonb else '{}'::jsonb end,
       'Chris launch lane'
from public.services where sku in ('DNI-06A-016','DNI-06A-017','DNI-06A-018','DNI-07A-005','DNI-07A-007','DNI-07A-020','DNI-07A-022')
on conflict(canonical_sku) do update set fulfillment_lane=excluded.fulfillment_lane,capability_status=excluded.capability_status,evidence_status=excluded.evidence_status,evidence_basis=excluded.evidence_basis,launch_wave=excluded.launch_wave,scope_guardrails=excluded.scope_guardrails,notes=excluded.notes,updated_at=now();

-- Wave 2: Danielle property/turnover/field support. Specialty scopes remain bounded.
insert into public.dd_launch_portfolio(service_id,canonical_sku,fulfillment_lane,capability_status,evidence_status,evidence_basis,launch_wave,scope_guardrails,notes)
select id,sku,
       case when sku in ('DNI-02A-019','DNI-02A-020','DNI-02A-028') then 'DANIELLE_MANAGED' else 'DANIELLE' end,
       case when sku in ('DNI-02A-008','DNI-02A-014','DNI-02A-016','DNI-02A-038') then 'SCOPED'
            when sku in ('DNI-02A-034','DNI-02A-035','DNI-02A-036','DNI-02A-037') then 'NEEDS_RESOURCE_VERIFICATION'
            when sku in ('DNI-02A-019','DNI-02A-020','DNI-02A-028') then 'MANAGED'
            else 'VERIFIED' end,
       'OWNER_CONFIRMED','Owner-confirmed turnover/readiness, cleaning, field documentation, photo logs, light punch-list, vendor/work-order coordination and property support',2,
       case when sku='DNI-02A-014' then '{"guardrail":"observational condition documentation only; not licensed inspection, engineering, appraisal or code certification"}'::jsonb
            when sku in ('DNI-02A-008','DNI-02A-016') then '{"guardrail":"light non-licensed maintenance/punch-list tasks only; licensed trades excluded"}'::jsonb
            when sku in ('DNI-02A-034','DNI-02A-035','DNI-02A-036','DNI-02A-037') then '{"resource_gate":"current transportation/dispatch resource must be verified before release"}'::jsonb
            else '{}'::jsonb end,
       'Property/field launch cohort'
from public.services
where service_family in ('Property, Facilities & Field Operations','02A Property Operations & Turnover Packages')
on conflict(canonical_sku) do update set fulfillment_lane=excluded.fulfillment_lane,capability_status=excluded.capability_status,evidence_status=excluded.evidence_status,evidence_basis=excluded.evidence_basis,launch_wave=excluded.launch_wave,scope_guardrails=excluded.scope_guardrails,notes=excluded.notes,updated_at=now();

-- Wave 3: Danielle core administrative operations; financial-provider SKUs 021-026 deliberately excluded.
insert into public.dd_launch_portfolio(service_id,canonical_sku,fulfillment_lane,capability_status,evidence_status,evidence_basis,launch_wave,notes)
select id,sku,'DANIELLE','VERIFIED','OWNER_CONFIRMED','Owner-confirmed administrative/business operations capability',3,'Core owner administrative lane'
from public.services
where sku ~ '^DNI-04A-0(0[1-9]|1[0-9]|20)$'
on conflict(canonical_sku) do update set fulfillment_lane=excluded.fulfillment_lane,capability_status=excluded.capability_status,evidence_status=excluded.evidence_status,evidence_basis=excluded.evidence_basis,launch_wave=excluded.launch_wave,notes=excluded.notes,updated_at=now();

-- Wave 3: Danielle business formation/digital administration through website maintenance; computer SKUs remain Chris-only.
insert into public.dd_launch_portfolio(service_id,canonical_sku,fulfillment_lane,capability_status,evidence_status,evidence_basis,launch_wave,scope_guardrails,notes)
select id,sku,'DANIELLE',
       case when sku in ('DNI-06A-014','DNI-06A-015') then 'SCOPED' else 'VERIFIED' end,
       'OWNER_CONFIRMED','Owner-issued catalog confirms owner fulfillment for business formation and digital infrastructure support',3,
       '{"guardrail":"administrative/implementation support only; no legal, tax, CPA or other licensed-professional representation"}'::jsonb,
       'Owner business-launch lane'
from public.services
where sku ~ '^DNI-06A-0(0[1-9]|1[0-5])$'
on conflict(canonical_sku) do update set fulfillment_lane=excluded.fulfillment_lane,capability_status=excluded.capability_status,evidence_status=excluded.evidence_status,evidence_basis=excluded.evidence_basis,launch_wave=excluded.launch_wave,scope_guardrails=excluded.scope_guardrails,notes=excluded.notes,updated_at=now();

-- Wave 3: events Danielle can personally plan/coordinate/execute. Staffing/procurement-like lines remain managed.
insert into public.dd_launch_portfolio(service_id,canonical_sku,fulfillment_lane,capability_status,evidence_status,evidence_basis,launch_wave,scope_guardrails,notes)
select id,sku,
       case when sku in ('DNI-10A-006','DNI-10A-007','DNI-10A-013','DNI-10A-014','DNI-10A-015','DNI-10A-035','DNI-10A-037') then 'DANIELLE_MANAGED' else 'DANIELLE' end,
       case when sku in ('DNI-10A-006','DNI-10A-007','DNI-10A-013','DNI-10A-014','DNI-10A-015','DNI-10A-035','DNI-10A-037') then 'MANAGED' else 'VERIFIED' end,
       'OWNER_CONFIRMED','Owner-confirmed event planning, setup/breakdown, guest flow, vendor coordination and officiant capability',3,
       case when sku='DNI-10A-022' then '{"jurisdiction":"ceremony/officiant authority must be verified for event location"}'::jsonb else '{}'::jsonb end,
       'Events launch cohort'
from public.services
where sku in (
'DNI-10A-001','DNI-10A-002','DNI-10A-003','DNI-10A-004','DNI-10A-005','DNI-10A-006','DNI-10A-007','DNI-10A-008','DNI-10A-009','DNI-10A-010','DNI-10A-011','DNI-10A-012','DNI-10A-013','DNI-10A-014','DNI-10A-015','DNI-10A-016','DNI-10A-017','DNI-10A-018','DNI-10A-019','DNI-10A-020','DNI-10A-022','DNI-10A-023','DNI-10A-024','DNI-10A-025','DNI-10A-026','DNI-10A-027','DNI-10A-028','DNI-10A-029','DNI-10A-030','DNI-10A-031','DNI-10A-032','DNI-10A-033','DNI-10A-034','DNI-10A-035','DNI-10A-037')
on conflict(canonical_sku) do update set fulfillment_lane=excluded.fulfillment_lane,capability_status=excluded.capability_status,evidence_status=excluded.evidence_status,evidence_basis=excluded.evidence_basis,launch_wave=excluded.launch_wave,scope_guardrails=excluded.scope_guardrails,notes=excluded.notes,updated_at=now();

-- Wave 3: SC notary/signing lane; I-9 intentionally excluded from this portfolio.
insert into public.dd_launch_portfolio(service_id,canonical_sku,fulfillment_lane,capability_status,evidence_status,evidence_basis,launch_wave,jurisdiction_scope,scope_guardrails,notes)
select id,sku,'DANIELLE',
       case when sku in ('DNI-05A-008','DNI-05A-009','DNI-05A-021','DNI-05A-022','DNI-05A-023','DNI-05A-024','DNI-05A-026','DNI-05A-027') then 'SCOPED' else 'VERIFIED' end,
       'OWNER_CONFIRMED','Owner-confirmed South Carolina notary/signing authority; Georgia commissioned lines remain separately gated',3,'SC',
       '{"guardrail":"state-specific authority and document type must be verified; no legal advice; Georgia commissioned lines remain held unless separately verified"}'::jsonb,
       'South Carolina notary/signing launch lane'
from public.services
where sku in ('DNI-05A-001','DNI-05A-002','DNI-05A-003','DNI-05A-004','DNI-05A-005','DNI-05A-006','DNI-05A-008','DNI-05A-009','DNI-05A-010','DNI-05A-011','DNI-05A-012','DNI-05A-013','DNI-05A-014','DNI-05A-015','DNI-05A-016','DNI-05A-017','DNI-05A-018','DNI-05A-019','DNI-05A-020','DNI-05A-021','DNI-05A-022','DNI-05A-023','DNI-05A-024','DNI-05A-025','DNI-05A-026','DNI-05A-027')
on conflict(canonical_sku) do update set fulfillment_lane=excluded.fulfillment_lane,capability_status=excluded.capability_status,evidence_status=excluded.evidence_status,evidence_basis=excluded.evidence_basis,launch_wave=excluded.launch_wave,jurisdiction_scope=excluded.jurisdiction_scope,scope_guardrails=excluded.scope_guardrails,notes=excluded.notes,updated_at=now();

-- Ordinary courier only; regulated medical/healthcare transport deliberately excluded.
insert into public.dd_launch_portfolio(service_id,canonical_sku,fulfillment_lane,capability_status,evidence_status,evidence_basis,launch_wave,scope_guardrails,notes)
select id,sku,'DANIELLE','NEEDS_RESOURCE_VERIFICATION','OWNER_CONFIRMED','Owner-confirmed ordinary local courier/mobile field capability',3,
       '{"resource_gate":"current transportation/dispatch resource must be verified before release","excludes":["biological samples","hazardous materials","prescription pharmaceuticals","temperature-validated items","critical biological materials"]}'::jsonb,
       'Ordinary courier launch candidate; regulated medical courier excluded'
from public.services where sku in ('DNI-12A-001','DNI-12A-002','DNI-12A-003')
on conflict(canonical_sku) do update set fulfillment_lane=excluded.fulfillment_lane,capability_status=excluded.capability_status,evidence_status=excluded.evidence_status,evidence_basis=excluded.evidence_basis,launch_wave=excluded.launch_wave,scope_guardrails=excluded.scope_guardrails,notes=excluded.notes,updated_at=now();

-- Managed merchandise/fabrication is allowed as a DANI managed outcome but not represented as owner equipment capability.
insert into public.dd_launch_portfolio(service_id,canonical_sku,fulfillment_lane,capability_status,evidence_status,evidence_basis,launch_wave,scope_guardrails,notes)
select id,sku,'DANIELLE_MANAGED','MANAGED','OWNER_CONFIRMED','Owner-confirmed managed/sourced merchandise and custom product outcome',3,
       '{"guardrail":"do not represent DANI as owning specialty fabrication equipment unless separately verified; source/subcontract as required"}'::jsonb,
       'Managed production route'
from public.services where sku in ('DNI-11A-019','DNI-11A-020')
on conflict(canonical_sku) do update set fulfillment_lane=excluded.fulfillment_lane,capability_status=excluded.capability_status,evidence_status=excluded.evidence_status,evidence_basis=excluded.evidence_basis,launch_wave=excluded.launch_wave,scope_guardrails=excluded.scope_guardrails,notes=excluded.notes,updated_at=now();

comment on table public.dd_launch_portfolio is 'Evidence-governed Danielle + Chris launch cohort. Inclusion is capability evidence, not release authorization. dd_service_release_contract_v1 remains production release authority.';
comment on view public.dd_launch_portfolio_readiness_v1 is 'Launch cohort joined to canonical production release authority; do not treat portfolio inclusion as LIVE_READY.';
