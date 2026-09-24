
create table if not exists public.dd_owner_fulfillment_authorizations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  capability_key text not null,
  authorization_status text not null check(authorization_status in ('ACTIVE','SCOPED','HOLD','RETIRED')),
  evidence_status text not null check(evidence_status in ('OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED')),
  scope_guardrails jsonb not null default '{}'::jsonb,
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_user_id,service_id,capability_key,effective_from)
);
alter table public.dd_owner_fulfillment_authorizations enable row level security;
revoke all on public.dd_owner_fulfillment_authorizations from anon,authenticated;
grant select,insert,update,delete on public.dd_owner_fulfillment_authorizations to service_role;

insert into public.dd_owner_fulfillment_authorizations(owner_user_id,service_id,capability_key,authorization_status,evidence_status,scope_guardrails,effective_from)
select ur.user_id,lp.service_id,
       case when lp.canonical_sku in ('DNI-11A-017','DNI-11A-018') then 'DTF_APPAREL_PRODUCTION'
            when lp.canonical_sku like 'DNI-01F-%' then 'SEASONAL_DECOR'
            else 'CLEANING' end,
       case when lp.capability_status='SCOPED' then 'SCOPED' else 'ACTIVE' end,
       'OWNER_CONFIRMED',lp.scope_guardrails,'2026-09-22 00:00:00+00'
from public.dd_launch_portfolio lp
join public.dd_portal_user_roles ur on ur.role::text='OWNER_OPERATOR'
where lp.launch_wave=1 and lp.fulfillment_lane in ('DANIELLE','EITHER')
  and lp.canonical_sku not in ('DNI-01A-041','DNI-01F-002','DNI-01F-005')
  and not exists(select 1 from public.dd_owner_fulfillment_authorizations a where a.owner_user_id=ur.user_id and a.service_id=lp.service_id and a.effective_to is null);

insert into private.dd_work_order_routing(capability_key,service_id,eligible_provider_org_ids,eligible_provider_ids,offer_status,routing_reason,notification_status,notification_attempts)
select
  case when s.sku in ('DNI-11A-017','DNI-11A-018') then 'DTF_APPAREL_PRODUCTION'
       when s.sku like 'DNI-01F-%' then 'SEASONAL_DECOR'
       else 'CLEANING' end,
  s.id,
  coalesce((select array_agg(distinct p.org_id) filter(where p.org_id is not null) from public.dd_provider_capabilities pc join public.dd_providers p on p.id=pc.provider_id where pc.service_id=s.id and pc.is_authorized=true and p.is_active=true and coalesce(p.role_title,'') not in ('Owner','Owner/Operator')),array[]::uuid[]),
  coalesce((select array_agg(distinct p.id) from public.dd_provider_capabilities pc join public.dd_providers p on p.id=pc.provider_id where pc.service_id=s.id and pc.is_authorized=true and p.is_active=true and coalesce(p.role_title,'') not in ('Owner','Owner/Operator')),array[]::uuid[]),
  'PENDING',
  case when exists(select 1 from public.dd_owner_fulfillment_authorizations a where a.service_id=s.id and a.authorization_status in ('ACTIVE','SCOPED') and a.effective_to is null)
       then 'OWNER_OR_AUTHORIZED_PROVIDER_ROUTING_TEMPLATE' else 'AUTHORIZED_PROVIDER_ROUTING_TEMPLATE' end,
  'PENDING',0
from public.services s
join public.dd_launch_portfolio lp on lp.service_id=s.id and lp.launch_wave=1
where s.sku not in ('DNI-01A-001','DNI-01A-002','DNI-01A-003','DNI-01F-002','DNI-01F-005')
  and not exists(select 1 from private.dd_work_order_routing r where r.service_id=s.id and r.request_id is null and r.job_id is null);

insert into public.dd_service_requirements(service_id,requirement_type,requirement_code,required,minimum_level,notes)
select s.id,'CAPABILITY','SEASONAL_DECOR',true,'OWNER_OR_AUTHORIZED_PROVIDER',
       'Owner-confirmed seasonal decorating fulfillment; high-access/electrical work remains outside this authorization.'
from public.services s
where s.sku in ('DNI-01F-003','DNI-01F-004')
  and not exists(select 1 from public.dd_service_requirements r where r.service_id=s.id and r.required=true);

update public.services set is_active=true,updated_at=now() where sku in ('DNI-01F-003','DNI-01F-004');

update public.dd_governed_service_offers
set commercial_offer_status='SELL_NOW',fulfillment_gate_status='READY',
    offer_basis=offer_basis || ' | 2026-09-22 OWNER CONFIRMATION: Danielle direct seasonal decorating capability established; prior no-provider quarantine premise superseded. Release contract still controls sale.',
    source_authority='OWNER_CONFIRMED_LAUNCH_PORTFOLIO',updated_at=now()
where canonical_sku in ('DNI-01F-003','DNI-01F-004');

comment on table public.dd_owner_fulfillment_authorizations is 'Explicit owner fulfiller authorization. Separate from the external provider network; owner-direct capability does not require representing Danielle as an external provider.';
