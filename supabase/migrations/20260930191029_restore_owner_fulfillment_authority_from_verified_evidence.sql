-- Restore the current-generation owner fulfillment authority schema from existing verified owner/service evidence.
-- This migration does not manufacture owner authority. It projects only launch-portfolio rows that already
-- authorize the OWNER_OPERATOR fulfillment lane as DANIELLE/EITHER with VERIFIED/SCOPED capability state.

create table if not exists public.dd_owner_fulfillment_authorizations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  capability_key text not null,
  authorization_status text not null check (authorization_status in ('ACTIVE','SCOPED','HOLD','RETIRED')),
  evidence_status text not null check (evidence_status in ('OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED')),
  scope_guardrails jsonb not null default '{}'::jsonb,
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_dd_owner_fulfillment_current
  on public.dd_owner_fulfillment_authorizations(owner_user_id,service_id,capability_key)
  where effective_to is null;

alter table public.dd_owner_fulfillment_authorizations enable row level security;
revoke all on public.dd_owner_fulfillment_authorizations from anon, authenticated;
grant select, insert, update, delete on public.dd_owner_fulfillment_authorizations to service_role;

insert into public.dd_owner_fulfillment_authorizations
  (owner_user_id,service_id,capability_key,authorization_status,evidence_status,scope_guardrails,effective_from)
select
  ur.user_id,
  lp.service_id,
  'CLEANING',
  case when lp.capability_status='SCOPED' then 'SCOPED' else 'ACTIVE' end,
  'OWNER_CONFIRMED',
  coalesce(lp.scope_guardrails,'{}'::jsonb),
  '2026-09-22 00:00:00+00'
from public.dd_launch_portfolio lp
cross join lateral (
  select user_id
  from public.dd_portal_user_roles
  where role::text='OWNER_OPERATOR'
  order by created_at
  limit 1
) ur
where lp.canonical_sku in ('DNI-01A-001','DNI-01A-002','DNI-01A-003')
  and lp.fulfillment_lane in ('DANIELLE','EITHER')
  and lp.capability_status in ('VERIFIED','SCOPED')
  and not exists (
    select 1
    from public.dd_owner_fulfillment_authorizations a
    where a.owner_user_id=ur.user_id
      and a.service_id=lp.service_id
      and a.capability_key='CLEANING'
      and a.effective_to is null
  );
