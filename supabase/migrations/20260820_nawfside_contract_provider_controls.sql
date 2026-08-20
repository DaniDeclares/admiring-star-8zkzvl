begin;

-- Contract-backed provider controls for NawfSide Roadside Enterprise LLC.
-- Records contractual scope without fabricating licenses, insurance evidence,
-- ZIP coverage, private rates, or private contact destinations.

alter table public.dd_provider_organizations
  add column if not exists agreement_status text not null default 'NOT_ON_FILE',
  add column if not exists agreement_effective_date date,
  add column if not exists agreement_type text,
  add column if not exists compliance_verified_at timestamptz;

-- Organization-level fulfillment is intentional: a company can receive an offer
-- before an individual provider login/person record is provisioned.
alter table public.dd_job_assignments
  alter column provider_id drop not null,
  add column if not exists provider_org_id uuid references public.dd_provider_organizations(id) on delete restrict;

alter table public.dd_job_assignments
  drop constraint if exists dd_job_assignments_provider_owner_check;

alter table public.dd_job_assignments
  add constraint dd_job_assignments_provider_owner_check
  check (provider_id is not null or provider_org_id is not null);

create index if not exists idx_dd_job_assignments_provider_org_status
  on public.dd_job_assignments(provider_org_id, assignment_status);

-- Provider documents are internal compliance evidence only.
create table if not exists private.dd_provider_documents (
  id uuid primary key default gen_random_uuid(),
  provider_org_id uuid not null references public.dd_provider_organizations(id) on delete cascade,
  document_type text not null,
  status text not null default 'PENDING',
  document_reference text,
  issued_on date,
  expires_on date,
  verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dd_provider_documents_org_type_idx
  on private.dd_provider_documents(provider_org_id, document_type, status);

revoke all on private.dd_provider_documents from public, anon, authenticated;
grant all on private.dd_provider_documents to service_role;

-- The executed agreement establishes these service lanes. They remain inactive
-- for automated routing until the corresponding capability/compliance evidence
-- is verified in the provider registry.
insert into public.dd_provider_capabilities (provider_org_id, service_line, capability_key, is_authorized)
select o.id, x.service_line, x.capability_key, false
from public.dd_provider_organizations o
cross join (values
  ('property_maintenance', 'PROPERTY_MAINTENANCE'),
  ('apartment_quick_turns', 'APARTMENT_QUICK_TURNS'),
  ('water_heater_installation', 'WATER_HEATER_INSTALLATION'),
  ('punch_list_labor', 'PUNCH_LIST_LABOR'),
  ('mobile_vending_placement', 'MOBILE_VENDING_PLACEMENT')
) as x(service_line, capability_key)
where o.internal_alias = 'nawfside'
  and not exists (
    select 1
    from public.dd_provider_capabilities c
    where c.provider_org_id = o.id
      and c.capability_key = x.capability_key
  );

update public.dd_provider_organizations
set agreement_status = 'EXECUTED',
    agreement_effective_date = date '2026-08-11',
    agreement_type = 'SUBCONTRACTOR_AGREEMENT',
    compliance_status = 'PENDING'
where internal_alias = 'nawfside';

insert into private.dd_provider_documents (provider_org_id, document_type, status, notes)
select o.id, x.document_type, 'PENDING', x.notes
from public.dd_provider_organizations o
cross join (values
  ('W9', 'W-9 required before deployment.'),
  ('GENERAL_LIABILITY_COI', 'Contract requires minimum $2,000,000 CGL aggregate and DANI DECLARES as additional insured.'),
  ('GEORGIA_GOOD_STANDING', 'Georgia entity good-standing evidence required.'),
  ('LOCAL_LICENSES_PERMITS', 'Applicable local licenses/permits/credentials must be verified by scope.'),
  ('TRADE_CERTIFICATIONS', 'Applicable EPA, CPO, or specialized trade certifications must be verified before deployment.')
) as x(document_type, notes)
where o.internal_alias = 'nawfside'
  and not exists (
    select 1 from private.dd_provider_documents d
    where d.provider_org_id = o.id and d.document_type = x.document_type
  );

commit;
