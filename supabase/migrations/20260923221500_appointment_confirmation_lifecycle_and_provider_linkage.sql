-- Booking lifecycle recovery: canonical provider linkage + appointment for the
-- first live Thumbtack sale (Krystal Livingston, DD-KRYSTAL-20260924), plus the
-- Confirm Appointment / Request a Change customer lifecycle, plus the missing
-- governed-projection surface for the console's weekly collection target.
--
-- This migration does NOT send any email and does NOT touch dd_sales_queue,
-- dd_research_leads, or any Email Lead Miner / provenance-ledger table.
--
-- Run this against the production project (ajxezpczaemunlcmqlgl) and then run
-- the verification SELECTs at the bottom.

-- ============================================================================
-- 1. Confirm Appointment / Request a Change lifecycle columns
-- ============================================================================
alter table public.dd_job_appointments
  add column if not exists confirmation_token_hash text,
  add column if not exists confirmation_token_expires_at timestamptz,
  add column if not exists customer_confirmed_at timestamptz,
  add column if not exists change_requested_at timestamptz;

comment on column public.dd_job_appointments.confirmation_token_hash is
  'SHA-256 hex digest of the customer-facing confirmation token. The raw token is never stored -- only ever returned once, at mint time, to the staff action or the outbound email.';
comment on column public.dd_job_appointments.customer_confirmed_at is
  'Set once, idempotently, when the customer clicks Confirm Appointment. Never recalculates or authorizes pricing -- confirmation is acknowledgement only.';
comment on column public.dd_job_appointments.change_requested_at is
  'Set when the customer clicks Request a Change. Recorded as an exception for owner review in dd_appointment_change_requests -- never silently modifies starts_at/ends_at/provider_id.';

-- Owner-facing exception queue. A change request never mutates the
-- appointment itself; the owner reviews and re-schedules manually through the
-- existing schedule_appointment action.
create table if not exists public.dd_appointment_change_requests (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.dd_job_appointments(id) on delete cascade,
  job_id uuid not null references public.dd_jobs(id) on delete cascade,
  customer_message text,
  status text not null default 'OPEN',
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id),
  resolution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dd_appt_change_requests_status_chk check (status in ('OPEN','RESOLVED'))
);
create index if not exists idx_dd_appt_change_requests_open
  on public.dd_appointment_change_requests(status, created_at)
  where status = 'OPEN';

alter table public.dd_appointment_change_requests enable row level security;
revoke all on public.dd_appointment_change_requests from anon, authenticated;
grant select, insert, update, delete on public.dd_appointment_change_requests to service_role;
drop policy if exists dd_appt_change_requests_staff_all on public.dd_appointment_change_requests;
create policy dd_appt_change_requests_staff_all on public.dd_appointment_change_requests
  for all using (private.dd_is_staff_admin()) with check (private.dd_is_staff_admin());

-- ============================================================================
-- 2. Governed financial-target projection (replaces the hard-coded
--    WEEKLY_TARGET=1200 constant in OperationsConsolePage.jsx)
-- ============================================================================
-- This is the missing link the checkpoint calls for: canonical decision ->
-- governed DB projection -> runtime dashboard. It intentionally does NOT seed
-- a replacement number -- 1200/3000/4000 were all superseded and none of them
-- is re-asserted here. The console will show "target not set" until the
-- accounting authority (Dani / the canonical accounting decision) inserts or
-- updates the real current value. Do not populate target_amount from this
-- migration.
create table if not exists public.dd_financial_target_authority (
  id uuid primary key default gen_random_uuid(),
  metric_key text not null unique,
  target_amount numeric,
  currency text not null default 'USD',
  effective_from timestamptz not null default now(),
  set_by text,
  source_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.dd_financial_target_authority enable row level security;
revoke all on public.dd_financial_target_authority from anon, authenticated;
grant select on public.dd_financial_target_authority to authenticated;
grant select, insert, update, delete on public.dd_financial_target_authority to service_role;
drop policy if exists dd_financial_target_authority_staff_select on public.dd_financial_target_authority;
create policy dd_financial_target_authority_staff_select on public.dd_financial_target_authority
  for select using (private.dd_is_staff_admin());

insert into public.dd_financial_target_authority (metric_key, target_amount, set_by, source_note)
values (
  'WEEKLY_COLLECTED_TARGET',
  null,
  'migration_20260923221500',
  'Placeholder row only. The console previously hard-coded $1,200; that figure and the earlier $3,000/$4,000 figures were all superseded by canonical accounting decisions this migration does not have visibility into. Leave target_amount NULL (console will show "target not set") until the accounting authority sets the real current value via an UPDATE to this row.'
)
on conflict (metric_key) do nothing;

-- ============================================================================
-- 3. Danielle founder/provider identity linkage + Krystal's canonical
--    appointment (DD-KRYSTAL-20260924), created once, idempotently.
-- ============================================================================
do $$
declare
  v_provider_id uuid;
  v_job_id uuid;
  v_job_scheduled_start timestamptz;
  v_job_scope text;
  v_appointment_id uuid;
begin
  -- Danielle's canonical, active, owner-authorized provider record.
  -- Verified live 2026-09-23: exactly one match.
  select id into v_provider_id
  from public.dd_providers
  where is_active = true
    and lower(coalesce(first_name,'')) = 'danielle'
    and lower(coalesce(last_name,'')) = 'fong'
  order by created_at asc
  limit 1;

  if v_provider_id is null then
    raise notice 'Danielle provider record not found or not active -- skipping appointment creation. Resolve provider identity manually before re-running.';
    return;
  end if;

  select id, scheduled_start, scope_summary into v_job_id, v_job_scheduled_start, v_job_scope
  from public.dd_jobs
  where public_reference = 'DD-KRYSTAL-20260924'
  limit 1;

  if v_job_id is null then
    raise notice 'Krystal job DD-KRYSTAL-20260924 not found -- nothing to link.';
    return;
  end if;

  -- Fix the free-text "Danielle" placeholder on dd_jobs.assigned_to to the
  -- canonical provider id, but only if it is still the placeholder -- never
  -- clobber a value staff may have already corrected by hand.
  update public.dd_jobs
  set assigned_to = v_provider_id::text, updated_at = now()
  where id = v_job_id and assigned_to = 'Danielle';

  -- Create the canonical appointment once. Duration: scope is "two bathrooms
  -- + light bedroom clean" with no explicit scheduled_end on record, so this
  -- uses a 2-hour estimate consistent with similar-scope jobs elsewhere in
  -- dd_owner_booking_requests.duration_minutes. Adjust ends_at by hand if the
  -- real crew estimate differs.
  if not exists (select 1 from public.dd_job_appointments where job_id = v_job_id) then
    insert into public.dd_job_appointments (job_id, provider_id, starts_at, ends_at, timezone, appointment_status, customer_notes)
    select v_job_id, v_provider_id, v_job_scheduled_start, v_job_scheduled_start + interval '2 hours', 'America/New_York', 'SCHEDULED', v_job_scope
    into v_appointment_id;

    raise notice 'Created canonical appointment % for job % (provider %).', v_appointment_id, v_job_id, v_provider_id;
  else
    raise notice 'Appointment already exists for job % -- left untouched.', v_job_id;
  end if;
end $$;

-- ============================================================================
-- 4. Verification -- run after applying, confirm before treating this GREEN
-- ============================================================================
-- select j.public_reference, j.assigned_to, j.job_status, a.id as appointment_id,
--        a.provider_id, a.starts_at, a.ends_at, a.appointment_status,
--        a.customer_confirmed_at, a.change_requested_at
-- from public.dd_jobs j
-- left join public.dd_job_appointments a on a.job_id = j.id
-- where j.public_reference = 'DD-KRYSTAL-20260924';
--
-- select * from public.dd_financial_target_authority where metric_key = 'WEEKLY_COLLECTED_TARGET';
