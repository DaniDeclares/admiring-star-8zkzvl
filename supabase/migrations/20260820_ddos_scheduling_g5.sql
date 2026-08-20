-- G5 — Scheduling & Availability
-- Operational only: this migration does not read, write, or recalculate pricing.

create table if not exists public.dd_provider_availability (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.dd_providers(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  timezone text not null default 'America/New_York',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index if not exists idx_dd_provider_availability_lookup
  on public.dd_provider_availability(provider_id, weekday, is_active);

create table if not exists public.dd_job_appointments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.dd_jobs(id) on delete cascade,
  provider_id uuid not null references public.dd_providers(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'America/New_York',
  appointment_status text not null default 'SCHEDULED'
    check (appointment_status in ('SCHEDULED','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED')),
  customer_notes text,
  internal_notes text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists idx_dd_job_appointments_provider_time
  on public.dd_job_appointments(provider_id, starts_at, ends_at)
  where appointment_status <> 'CANCELLED';

create index if not exists idx_dd_job_appointments_job
  on public.dd_job_appointments(job_id);

alter table public.dd_provider_availability enable row level security;
alter table public.dd_job_appointments enable row level security;

-- G5 deliberately does not create public booking policies. Provider scheduling
-- is an authenticated operational surface and must use the existing staff/auth
-- boundary before production enablement.

comment on table public.dd_provider_availability is
  'G5 operational availability windows. No pricing data or pricing calculations.';
comment on table public.dd_job_appointments is
  'G5 appointment ledger. Customer commercial amounts remain upstream in dd_estimates.';
