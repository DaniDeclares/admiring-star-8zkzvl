-- The existing dd_guard_provider_assignment() trigger hard-blocks any
-- dd_job_assignments insert unless the provider's ORG is generally
-- QUALIFIED/VERIFIED/EXECUTED/accepting work. There is no existing
-- mechanism for a narrow, audited, one-job exception -- confirmed by
-- attempting Shiletha Tucker's provisional assignment directly and hitting
-- PROVIDER_NOT_QUALIFIED. The owner-approved model requires exactly that:
-- an explicit, scoped, auditable exception that does NOT touch the
-- provider's general qualification/compliance/agreement status (faking
-- those would be indistinguishable from real clearance to every other
-- query that reads them).
--
-- This migration adds a narrow override table and extends the guard to
-- also pass when a live, matching override row exists for that exact
-- (job_id, provider_id) pair. It changes no other behavior: a provider
-- who is genuinely QUALIFIED/VERIFIED/EXECUTED/accepting-work still passes
-- exactly as before; this only adds a second, explicitly-recorded path in.

create table if not exists public.dd_provider_assignment_overrides (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.dd_jobs(id),
  provider_id uuid not null references public.dd_providers(id),
  approved_by text not null,
  reason text not null,
  scope_notes text,
  outstanding_gates jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  unique (job_id, provider_id)
);

alter table public.dd_provider_assignment_overrides enable row level security;
revoke all on public.dd_provider_assignment_overrides from public, anon, authenticated;
grant select, insert, update, delete on public.dd_provider_assignment_overrides to service_role;

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
  select id, is_active, org_id into p from public.dd_providers where id = new.provider_id;
  if p.id is null or p.is_active is not true then raise exception 'PROVIDER_NOT_ACTIVE'; end if;
  if p.org_id is null then raise exception 'PROVIDER_ORGANIZATION_REQUIRED'; end if;
  select id, is_active, qualification_status, compliance_status, agreement_status, accepts_new_work into o
    from public.dd_provider_organizations where id = p.org_id;
  if o.id is null or o.is_active is not true then raise exception 'PROVIDER_ORGANIZATION_NOT_ACTIVE'; end if;

  select id into ov from public.dd_provider_assignment_overrides
    where job_id = new.job_id and provider_id = new.provider_id
      and (expires_at is null or expires_at > now());

  if ov.id is null then
    if upper(coalesce(o.qualification_status,'')) <> 'QUALIFIED' then raise exception 'PROVIDER_NOT_QUALIFIED'; end if;
    if upper(coalesce(o.compliance_status,'')) <> 'VERIFIED' then raise exception 'PROVIDER_COMPLIANCE_NOT_VERIFIED'; end if;
    if upper(coalesce(o.agreement_status,'')) not in ('ACTIVE','EXECUTED') then raise exception 'PROVIDER_AGREEMENT_NOT_ACTIVE'; end if;
    if coalesce(o.accepts_new_work,false) is not true then raise exception 'PROVIDER_NOT_ACCEPTING_WORK'; end if;
  end if;

  select work_order_id into j from public.dd_jobs where id = new.job_id;
  if j.work_order_id is not null then
    select service_id into wo from public.dd_work_orders where id = j.work_order_id;
    if wo.service_id is not null and ov.id is null and not exists (
      select 1 from public.dd_provider_capabilities pc
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
