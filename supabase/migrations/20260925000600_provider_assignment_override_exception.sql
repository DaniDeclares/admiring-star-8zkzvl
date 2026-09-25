-- Adds a narrowly scoped, audited one-job provider assignment exception.
-- This does NOT change general provider readiness or organization compliance.
-- An override is valid only for the exact job + provider + work package + provider slot
-- and capability represented by that slot. Any mismatch falls back to the normal
-- qualification/compliance/agreement/capability checks.

create table if not exists public.dd_provider_assignment_overrides (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.dd_jobs(id),
  provider_id uuid not null references public.dd_providers(id),
  work_package_id uuid not null references public.dd_fulfillment_work_packages(id),
  provider_slot_id uuid not null references public.dd_work_package_provider_slots(id),
  capability_key text not null,
  status text not null default 'ACTIVE'
    check (status in ('ACTIVE','COMPLETED','REVOKED','EXPIRED')),
  approved_by text not null,
  approved_at timestamptz not null default now(),
  reason text not null,
  scope_notes text,
  outstanding_gates jsonb not null default '{}'::jsonb,
  compensation_amount numeric(12,2),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  revoked_at timestamptz,
  expires_at timestamptz not null,
  constraint dd_provider_assignment_overrides_scope_uniq
    unique (job_id, provider_id, provider_slot_id)
);

alter table public.dd_provider_assignment_overrides enable row level security;
revoke all on public.dd_provider_assignment_overrides from public, anon, authenticated;
grant select, insert, update, delete on public.dd_provider_assignment_overrides to service_role;

create index if not exists dd_provider_assignment_overrides_active_lookup
  on public.dd_provider_assignment_overrides(job_id, provider_id, work_package_id, provider_slot_id)
  where status = 'ACTIVE';

create or replace function public.dd_guard_provider_assignment()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  p record;
  o record;
  j record;
  wo record;
  ov record;
begin
  select id, is_active, org_id
    into p
    from public.dd_providers
   where id = new.provider_id;

  if p.id is null or p.is_active is not true then
    raise exception 'PROVIDER_NOT_ACTIVE';
  end if;
  if p.org_id is null then
    raise exception 'PROVIDER_ORGANIZATION_REQUIRED';
  end if;

  select id, is_active, qualification_status, compliance_status, agreement_status, accepts_new_work
    into o
    from public.dd_provider_organizations
   where id = p.org_id;

  if o.id is null or o.is_active is not true then
    raise exception 'PROVIDER_ORGANIZATION_NOT_ACTIVE';
  end if;

  -- Fail closed: an exception is recognized only when the incoming assignment
  -- names the exact work package and slot and that slot itself belongs to this
  -- provider/package and carries the explicitly authorized capability.
  select x.id
    into ov
    from public.dd_provider_assignment_overrides x
    join public.dd_work_package_provider_slots s
      on s.id = x.provider_slot_id
     and s.work_package_id = x.work_package_id
     and s.provider_id = x.provider_id
     and s.required_capability_key = x.capability_key
    join public.dd_fulfillment_work_packages wp
      on wp.id = x.work_package_id
     and wp.job_id = x.job_id
   where x.job_id = new.job_id
     and x.provider_id = new.provider_id
     and x.work_package_id = new.work_package_id
     and x.provider_slot_id = new.provider_slot_id
     and x.status = 'ACTIVE'
     and x.approved_at <= now()
     and x.expires_at > now()
   limit 1;

  if ov.id is null then
    if upper(coalesce(o.qualification_status,'')) <> 'QUALIFIED' then
      raise exception 'PROVIDER_NOT_QUALIFIED';
    end if;
    if upper(coalesce(o.compliance_status,'')) <> 'VERIFIED' then
      raise exception 'PROVIDER_COMPLIANCE_NOT_VERIFIED';
    end if;
    if upper(coalesce(o.agreement_status,'')) not in ('ACTIVE','EXECUTED') then
      raise exception 'PROVIDER_AGREEMENT_NOT_ACTIVE';
    end if;
    if coalesce(o.accepts_new_work,false) is not true then
      raise exception 'PROVIDER_NOT_ACCEPTING_WORK';
    end if;
  end if;

  select work_order_id into j from public.dd_jobs where id = new.job_id;
  if j.work_order_id is not null then
    select service_id into wo from public.dd_work_orders where id = j.work_order_id;
    if wo.service_id is not null and ov.id is null and not exists (
      select 1
        from public.dd_provider_capabilities pc
       where pc.provider_org_id = p.org_id
         and pc.service_id = wo.service_id
         and pc.is_authorized is true
    ) then
      raise exception 'PROVIDER_SERVICE_NOT_AUTHORIZED';
    end if;
  end if;

  return new;
end;
$function$;

revoke execute on function public.dd_guard_provider_assignment() from public, anon, authenticated;
grant execute on function public.dd_guard_provider_assignment() to service_role;
