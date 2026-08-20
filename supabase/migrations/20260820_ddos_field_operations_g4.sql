-- PR G4: Field Operations & Provider Dispatch
-- Relational provider network + immutable dispatch audit ledger.
-- Intentionally does not alter pricing or financial tables.

create table if not exists public.dd_provider_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  vendor_type text not null check (vendor_type in ('PARTNER','SUBCONTRACTOR','EMPLOYEE')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.dd_providers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.dd_provider_organizations(id) on delete restrict,
  first_name text not null,
  last_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dd_provider_capabilities (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.dd_providers(id) on delete cascade,
  service_line text not null,
  is_authorized boolean not null default true,
  created_at timestamptz not null default now(),
  unique(provider_id, service_line)
);

create table if not exists public.dd_provider_coverage (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.dd_providers(id) on delete cascade,
  territory_id text not null,
  created_at timestamptz not null default now(),
  unique(provider_id, territory_id)
);

create table if not exists public.dd_job_assignments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.dd_jobs(id) on delete cascade,
  provider_id uuid not null references public.dd_providers(id) on delete restrict,
  assignment_status text not null default 'OFFERED' check (assignment_status in ('OFFERED','ACCEPTED','REJECTED','CANCELLED')),
  rejection_reason text,
  admin_notes text,
  provider_notes text,
  offered_at timestamptz not null default now(),
  accepted_at timestamptz,
  rejected_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dd_dispatch_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.dd_jobs(id) on delete cascade,
  actor_id uuid,
  event_type text not null,
  description text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_dd_providers_org_active on public.dd_providers(org_id, is_active);
create index if not exists idx_dd_provider_capabilities_line on public.dd_provider_capabilities(service_line, is_authorized);
create index if not exists idx_dd_provider_coverage_territory on public.dd_provider_coverage(territory_id);
create index if not exists idx_dd_job_assignments_job_status on public.dd_job_assignments(job_id, assignment_status);
create index if not exists idx_dd_job_assignments_provider_status on public.dd_job_assignments(provider_id, assignment_status);
create index if not exists idx_dd_dispatch_events_job_created on public.dd_dispatch_events(job_id, created_at);

-- A job may have many historical assignment attempts, but only one active accepted
-- assignment at a time. Rejected offers remain auditable.
create unique index if not exists uq_dd_job_assignments_one_accepted
  on public.dd_job_assignments(job_id)
  where assignment_status = 'ACCEPTED';

-- Keep updated_at deterministic for direct SQL updates.
create or replace function public.dd_fieldops_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_dd_providers_updated_at on public.dd_providers;
create trigger trg_dd_providers_updated_at
before update on public.dd_providers
for each row execute function public.dd_fieldops_touch_updated_at();

drop trigger if exists trg_dd_job_assignments_updated_at on public.dd_job_assignments;
create trigger trg_dd_job_assignments_updated_at
before update on public.dd_job_assignments
for each row execute function public.dd_fieldops_touch_updated_at();

-- The dispatch ledger is append-only from the application boundary. No update/delete
-- policy is installed here so RLS/admin policy can be applied consistently with the
-- existing Supabase security model.
