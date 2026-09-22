-- Multi-provider / resource-aware fulfillment architecture.
-- A customer-facing service can decompose into one or more work packages.
-- Each work package can require one or more providers, capabilities, and verified assets.
-- This preserves dd_jobs as production dispatch authority while allowing component-level assignment.

create table if not exists public.dd_fulfillment_work_packages (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.dd_jobs(id) on delete cascade,
  estimate_id uuid references public.dd_estimates(id) on delete cascade,
  service_request_id uuid references public.service_requests(id) on delete cascade,
  canonical_sku text not null,
  package_code text not null,
  package_name text not null,
  scope_description text not null,
  inclusions jsonb not null default '[]'::jsonb,
  exclusions jsonb not null default '[]'::jsonb,
  completion_criteria jsonb not null default '[]'::jsonb,
  evidence_requirements jsonb not null default '[]'::jsonb,
  required_provider_count integer not null default 1 check(required_provider_count >= 1),
  assignment_strategy text not null default 'SINGLE_PROVIDER'
    check(assignment_strategy in ('SINGLE_PROVIDER','MULTI_PROVIDER_SAME_CAPABILITY','MULTI_PROVIDER_MIXED_CAPABILITY','SEQUENTIAL_SPECIALISTS')),
  coordination_mode text not null default 'INDEPENDENT'
    check(coordination_mode in ('INDEPENDENT','SIMULTANEOUS','SEQUENTIAL')),
  scheduled_start_at timestamptz,
  scheduled_end_at timestamptz,
  status text not null default 'PLANNED'
    check(status in ('PLANNED','READY_TO_OFFER','PARTIALLY_ASSIGNED','FULLY_ASSIGNED','IN_PROGRESS','COMPLETE','BLOCKED','CANCELLED')),
  economics_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(estimate_id,package_code)
);

create table if not exists public.dd_work_package_requirements (
  id uuid primary key default gen_random_uuid(),
  work_package_id uuid not null references public.dd_fulfillment_work_packages(id) on delete cascade,
  requirement_type text not null check(requirement_type in ('CAPABILITY','ASSET','CREDENTIAL','HEADCOUNT','VEHICLE','SUPPLY')),
  requirement_code text not null,
  requirement_name text not null,
  required boolean not null default true,
  minimum_quantity integer not null default 1 check(minimum_quantity >= 1),
  fulfillment_source text not null default 'PROVIDER'
    check(fulfillment_source in ('PROVIDER','DANI','CUSTOMER','EITHER')),
  compensation_treatment text not null default 'INCLUDED_IN_PAYOUT'
    check(compensation_treatment in ('INCLUDED_IN_PAYOUT','REIMBURSABLE_APPROVED_COST','PASS_THROUGH_CUSTOMER','DANI_SUPPLIED','CUSTOMER_SUPPLIED')),
  verification_required boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  unique(work_package_id,requirement_type,requirement_code)
);

create table if not exists public.dd_work_package_provider_slots (
  id uuid primary key default gen_random_uuid(),
  work_package_id uuid not null references public.dd_fulfillment_work_packages(id) on delete cascade,
  slot_number integer not null check(slot_number >= 1),
  required_capability_key text,
  provider_id uuid references public.dd_providers(id) on delete set null,
  provider_org_id uuid references public.dd_provider_organizations(id) on delete set null,
  assignment_offer_id uuid references public.dd_estimate_assignment_offers(id) on delete set null,
  assignment_id uuid references public.dd_job_assignments(id) on delete set null,
  slot_status text not null default 'OPEN'
    check(slot_status in ('OPEN','OFFERED','ACCEPTED','DECLINED','COUNTERED','ASSIGNED','COMPLETE','CANCELLED')),
  route_distance_miles numeric,
  service_payout_amount numeric,
  travel_payout_amount numeric,
  equipment_premium_amount numeric not null default 0,
  total_provider_offer numeric generated always as (
    coalesce(service_payout_amount,0)+coalesce(travel_payout_amount,0)+coalesce(equipment_premium_amount,0)
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(work_package_id,slot_number)
);

alter table public.dd_estimate_assignment_offers
  add column if not exists work_package_id uuid references public.dd_fulfillment_work_packages(id) on delete set null,
  add column if not exists provider_slot_id uuid references public.dd_work_package_provider_slots(id) on delete set null,
  add column if not exists scope_acknowledgement_required boolean not null default true,
  add column if not exists scope_acknowledged_at timestamptz,
  add column if not exists resource_requirements_snapshot jsonb not null default '[]'::jsonb;

alter table public.dd_job_assignments
  add column if not exists work_package_id uuid references public.dd_fulfillment_work_packages(id) on delete set null,
  add column if not exists provider_slot_id uuid references public.dd_work_package_provider_slots(id) on delete set null;

alter table public.dd_provider_assets
  add column if not exists asset_code text,
  add column if not exists ownership_type text not null default 'PROVIDER_OWNED'
    check(ownership_type in ('PROVIDER_OWNED','PROVIDER_LEASED','DANI_OWNED','CUSTOMER_PROVIDED')),
  add column if not exists quantity integer not null default 1 check(quantity >= 1),
  add column if not exists serviceable boolean not null default true,
  add column if not exists verified_at timestamptz,
  add column if not exists verification_notes text;

create unique index if not exists dd_provider_assets_provider_asset_code_uq
  on public.dd_provider_assets(provider_id,asset_code)
  where asset_code is not null and is_active;

create index if not exists dd_work_packages_job_idx on public.dd_fulfillment_work_packages(job_id);
create index if not exists dd_work_packages_estimate_idx on public.dd_fulfillment_work_packages(estimate_id);
create index if not exists dd_work_package_requirements_pkg_idx on public.dd_work_package_requirements(work_package_id);
create index if not exists dd_work_package_slots_pkg_idx on public.dd_work_package_provider_slots(work_package_id);

create or replace function public.dd_provider_meets_work_package_requirements(p_provider_id uuid,p_work_package_id uuid)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_missing jsonb := '[]'::jsonb;
  v_req record;
  v_count integer;
begin
  for v_req in
    select * from public.dd_work_package_requirements
    where work_package_id=p_work_package_id and required
  loop
    if v_req.requirement_type='CAPABILITY' then
      select count(*) into v_count
      from public.dd_provider_capabilities pc
      where pc.provider_id=p_provider_id
        and pc.is_authorized
        and pc.capability_key=v_req.requirement_code;
    elsif v_req.requirement_type='ASSET' then
      select coalesce(sum(pa.quantity),0)::integer into v_count
      from public.dd_provider_assets pa
      where pa.provider_id=p_provider_id
        and pa.is_active and pa.serviceable
        and pa.verification_status in ('VERIFIED','APPROVED')
        and pa.asset_code=v_req.requirement_code;
    else
      v_count := 1;
    end if;
    if coalesce(v_count,0) < v_req.minimum_quantity then
      v_missing := v_missing || jsonb_build_array(jsonb_build_object(
        'type',v_req.requirement_type,'code',v_req.requirement_code,'requiredQuantity',v_req.minimum_quantity,'availableQuantity',coalesce(v_count,0)
      ));
    end if;
  end loop;
  return jsonb_build_object('eligible',jsonb_array_length(v_missing)=0,'missing',v_missing);
end;
$$;

comment on table public.dd_fulfillment_work_packages is 'Component-level production plan allowing one service/job to require multiple specialists or multiple providers of the same capability.';
comment on table public.dd_work_package_requirements is 'Capability, equipment, credential, headcount and supply requirements that must be satisfied before a provider slot may be offered.';
comment on table public.dd_work_package_provider_slots is 'One assignable provider seat within a work package. Multiple slots support crews; different capability keys support specialist collaboration.';
comment on column public.dd_provider_assets.ownership_type is 'DANI does not operate an equipment-rental program by default. Provider-owned/leased assets are independent-business resources; DANI/customer assets require explicit job-level handling.';


alter table public.dd_sales_queue
  add column if not exists front_door_code text,
  add column if not exists front_door_notes text;

comment on column public.dd_sales_queue.front_door_code is
'Problem-led sales entry point from dd_channel_front_doors. Sales discovery starts with the buyer problem/front door, then composes only authorized canonical services.';
