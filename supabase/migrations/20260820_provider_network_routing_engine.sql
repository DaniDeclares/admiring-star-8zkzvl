begin;

-- Provider Network + Intelligent Work-Order Routing.
-- This migration extends the existing G4 provider model; it does not create a second
-- public provider system and it does not expose provider economics to the frontend.

alter table public.dd_provider_organizations
  add column if not exists internal_alias text,
  add column if not exists legal_name text,
  add column if not exists compliance_status text not null default 'PENDING',
  add column if not exists insurance_expiry date,
  add column if not exists routing_priority integer not null default 100,
  add column if not exists accepts_new_work boolean not null default true,
  add column if not exists capacity_status text not null default 'AVAILABLE';

create unique index if not exists dd_provider_organizations_internal_alias_uidx
  on public.dd_provider_organizations (internal_alias)
  where internal_alias is not null;

alter table public.dd_provider_capabilities
  alter column provider_id drop not null,
  add column if not exists provider_org_id uuid references public.dd_provider_organizations(id) on delete cascade,
  add column if not exists service_id uuid references public.services(id) on delete set null,
  add column if not exists capability_key text,
  add column if not exists tier_availability jsonb not null default '{}'::jsonb;

alter table public.dd_provider_capabilities
  drop constraint if exists dd_provider_capabilities_owner_check;

alter table public.dd_provider_capabilities
  add constraint dd_provider_capabilities_owner_check
  check (provider_id is not null or provider_org_id is not null);

create index if not exists dd_provider_capabilities_org_idx
  on public.dd_provider_capabilities(provider_org_id);
create index if not exists dd_provider_capabilities_service_idx
  on public.dd_provider_capabilities(service_id);
create index if not exists dd_provider_capabilities_key_idx
  on public.dd_provider_capabilities(capability_key);

alter table public.dd_provider_coverage
  alter column provider_id drop not null,
  add column if not exists provider_org_id uuid references public.dd_provider_organizations(id) on delete cascade,
  add column if not exists zip_code text;

alter table public.dd_provider_coverage
  drop constraint if exists dd_provider_coverage_owner_check;

alter table public.dd_provider_coverage
  add constraint dd_provider_coverage_owner_check
  check (provider_id is not null or provider_org_id is not null);

create index if not exists dd_provider_coverage_org_zip_idx
  on public.dd_provider_coverage(provider_org_id, zip_code);
create index if not exists dd_provider_coverage_provider_zip_idx
  on public.dd_provider_coverage(provider_id, zip_code);

-- Provider economics and private routing destinations never belong in the public API schema.
create schema if not exists private;

create table if not exists private.dd_provider_commercial_terms (
  id uuid primary key default gen_random_uuid(),
  provider_org_id uuid references public.dd_provider_organizations(id) on delete cascade,
  provider_id uuid references public.dd_providers(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  capability_key text,
  base_rate numeric(12,2),
  rate_unit text,
  minimum_charge numeric(12,2),
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  terms_status text not null default 'ACTIVE',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dd_provider_commercial_terms_owner_check
    check (provider_org_id is not null or provider_id is not null)
);

create index if not exists dd_provider_commercial_terms_org_service_idx
  on private.dd_provider_commercial_terms(provider_org_id, service_id);
create index if not exists dd_provider_commercial_terms_provider_service_idx
  on private.dd_provider_commercial_terms(provider_id, service_id);

create table if not exists private.dd_provider_routing_destinations (
  id uuid primary key default gen_random_uuid(),
  provider_org_id uuid not null references public.dd_provider_organizations(id) on delete cascade,
  channel text not null,
  destination text not null,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider_org_id, channel, destination)
);

create index if not exists dd_provider_routing_destinations_org_idx
  on private.dd_provider_routing_destinations(provider_org_id, is_active);

create table if not exists private.dd_work_order_routing (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.service_requests(id) on delete set null,
  job_id uuid references public.dd_jobs(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  capability_key text,
  location_zip text,
  eligible_provider_org_ids uuid[] not null default '{}'::uuid[],
  eligible_provider_ids uuid[] not null default '{}'::uuid[],
  selected_provider_org_id uuid references public.dd_provider_organizations(id) on delete set null,
  selected_provider_id uuid references public.dd_providers(id) on delete set null,
  offer_status text not null default 'PENDING',
  routing_reason text,
  assignment_id uuid references public.dd_job_assignments(id) on delete set null,
  assignment_timestamp timestamptz,
  offer_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dd_work_order_routing_request_idx
  on private.dd_work_order_routing(request_id, created_at desc);
create index if not exists dd_work_order_routing_job_idx
  on private.dd_work_order_routing(job_id, created_at desc);
create index if not exists dd_work_order_routing_selected_org_idx
  on private.dd_work_order_routing(selected_provider_org_id, offer_status);

-- Only backend/service-role callers may invoke this resolver. It returns internal
-- routing identifiers and never becomes an anon/authenticated API capability.
create or replace function public.dd_route_work_order(
  p_request_id uuid default null,
  p_job_id uuid default null,
  p_service_id uuid default null,
  p_capability_key text default null,
  p_zip_code text default null,
  p_offer_expiry_minutes integer default 30
)
returns table(
  routing_id uuid,
  selected_provider_org_id uuid,
  selected_provider_id uuid,
  assignment_id uuid,
  offer_status text,
  routing_reason text
)
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_routing_id uuid;
  v_selected_org uuid;
  v_selected_provider uuid;
  v_assignment_id uuid;
  v_reason text;
  v_offer_status text;
  v_eligible_orgs uuid[];
  v_eligible_providers uuid[];
begin
  select coalesce(array_agg(distinct o.id order by o.routing_priority, o.id), '{}'::uuid[])
    into v_eligible_orgs
  from public.dd_provider_organizations o
  join public.dd_provider_capabilities c
    on c.provider_org_id = o.id
   and c.is_authorized = true
  left join public.dd_provider_coverage cv
    on cv.provider_org_id = o.id
  where o.is_active = true
    and o.accepts_new_work = true
    and o.compliance_status = 'ACTIVE'
    and (p_service_id is null or c.service_id = p_service_id)
    and (p_capability_key is null or c.capability_key = p_capability_key or c.service_line = p_capability_key)
    and (p_zip_code is null or cv.zip_code = p_zip_code or cv.territory_id = p_zip_code);

  select coalesce(array_agg(distinct p.id), '{}'::uuid[])
    into v_eligible_providers
  from public.dd_providers p
  join public.dd_provider_organizations o on o.id = p.org_id
  join public.dd_provider_capabilities c on c.provider_id = p.id and c.is_authorized = true
  left join public.dd_provider_coverage cv on cv.provider_id = p.id
  where p.is_active = true
    and o.is_active = true
    and o.accepts_new_work = true
    and o.compliance_status = 'ACTIVE'
    and (p_service_id is null or c.service_id = p_service_id)
    and (p_capability_key is null or c.capability_key = p_capability_key or c.service_line = p_capability_key)
    and (p_zip_code is null or cv.zip_code = p_zip_code or cv.territory_id = p_zip_code);

  select o.id
    into v_selected_org
  from public.dd_provider_organizations o
  where o.id = any(v_eligible_orgs)
  order by o.routing_priority asc, o.id
  limit 1;

  if v_selected_org is not null then
    v_reason := 'PRIMARY_PROVIDER_PRIORITY';
  elsif coalesce(array_length(v_eligible_providers, 1), 0) > 0 then
    select p.id into v_selected_provider
    from public.dd_providers p
    join public.dd_provider_organizations o on o.id = p.org_id
    where p.id = any(v_eligible_providers)
    order by o.routing_priority asc, p.id
    limit 1;
    v_selected_org := (select org_id from public.dd_providers where id = v_selected_provider);
    v_reason := 'PRIMARY_PROVIDER_PRIORITY';
  else
    v_reason := 'NO_ELIGIBLE_PROVIDER';
  end if;

  v_offer_status := case when v_selected_org is null then 'NO_ELIGIBLE_PROVIDER' else 'OFFERED' end;

  insert into private.dd_work_order_routing (
    request_id, job_id, service_id, capability_key, location_zip,
    eligible_provider_org_ids, eligible_provider_ids,
    selected_provider_org_id, selected_provider_id, offer_status,
    routing_reason, offer_expires_at
  ) values (
    p_request_id, p_job_id, p_service_id, p_capability_key, p_zip_code,
    v_eligible_orgs, v_eligible_providers,
    v_selected_org, v_selected_provider, v_offer_status,
    v_reason, case when v_selected_org is null then null else now() + make_interval(mins => greatest(p_offer_expiry_minutes, 1)) end
  ) returning id into v_routing_id;

  return query select v_routing_id, v_selected_org, v_selected_provider, v_assignment_id, v_offer_status, v_reason;
end;
$$;

-- Backend-only invocation boundary.
revoke all on function public.dd_route_work_order(uuid, uuid, uuid, text, text, integer) from public, anon, authenticated;
grant execute on function public.dd_route_work_order(uuid, uuid, uuid, text, text, integer) to service_role;

revoke all on private.dd_provider_commercial_terms from public, anon, authenticated;
revoke all on private.dd_provider_routing_destinations from public, anon, authenticated;
revoke all on private.dd_work_order_routing from public, anon, authenticated;
grant all on private.dd_provider_commercial_terms to service_role;
grant all on private.dd_provider_routing_destinations to service_role;
grant all on private.dd_work_order_routing to service_role;

-- Seed identities only. Do not fabricate capability, coverage, rates, credentials,
-- or contact destinations; those are intentionally data-entry gates.
insert into public.dd_provider_organizations (name, vendor_type, internal_alias, legal_name, compliance_status, routing_priority)
select 'NawfSide Roadside Enterprise LLC', 'PARTNER', 'nawfside', 'NawfSide Roadside Enterprise LLC', 'ACTIVE', 10
where not exists (select 1 from public.dd_provider_organizations where internal_alias = 'nawfside');

insert into public.dd_provider_organizations (name, vendor_type, internal_alias, legal_name, compliance_status, routing_priority)
select 'Cass — Business & Financial Support Partner', 'PARTNER', 'cass', null, 'PENDING', 20
where not exists (select 1 from public.dd_provider_organizations where internal_alias = 'cass');

commit;
