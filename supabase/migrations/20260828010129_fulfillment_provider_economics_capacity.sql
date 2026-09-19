create table if not exists public.dd_provider_capacity_profiles (
 id uuid primary key default gen_random_uuid(),
 provider_id uuid,
 provider_org_id uuid,
 max_jobs_per_day integer,
 max_concurrent_jobs integer default 1,
 max_hours_per_day numeric,
 crew_size integer default 1,
 capacity_status text not null default 'ACTIVE',
 notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.dd_provider_payables (
 id uuid primary key default gen_random_uuid(),
 job_id uuid not null,
 provider_id uuid,
 provider_org_id uuid,
 rate_card_id uuid,
 compensation_type text not null,
 base_amount numeric not null default 0,
 travel_amount numeric not null default 0,
 overtime_amount numeric not null default 0,
 bonus_amount numeric not null default 0,
 expense_amount numeric not null default 0,
 adjustment_amount numeric not null default 0,
 total_amount numeric generated always as (base_amount + travel_amount + overtime_amount + bonus_amount + expense_amount + adjustment_amount) stored,
 currency text not null default 'USD',
 status text not null default 'PENDING',
 approved_at timestamptz,
 paid_at timestamptz,
 payout_reference text,
 notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.dd_provider_payouts (
 id uuid primary key default gen_random_uuid(),
 provider_id uuid,
 provider_org_id uuid,
 payable_id uuid,
 amount numeric not null,
 currency text not null default 'USD',
 payout_method text,
 payout_status text not null default 'PENDING',
 processor text,
 processor_reference text,
 initiated_at timestamptz,
 completed_at timestamptz,
 failure_reason text,
 created_at timestamptz not null default now()
);

create table if not exists public.dd_job_exceptions (
 id uuid primary key default gen_random_uuid(),
 job_id uuid not null,
 assignment_id uuid,
 provider_id uuid,
 exception_type text not null,
 severity text not null default 'MEDIUM',
 status text not null default 'OPEN',
 description text not null,
 resolution text,
 requires_reassignment boolean not null default false,
 resolved_by uuid,
 resolved_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.dd_provider_performance (
 id uuid primary key default gen_random_uuid(),
 provider_id uuid,
 provider_org_id uuid,
 period_start date,
 period_end date,
 jobs_offered integer not null default 0,
 jobs_accepted integer not null default 0,
 jobs_completed integer not null default 0,
 jobs_cancelled integer not null default 0,
 jobs_reworked integer not null default 0,
 qa_passed integer not null default 0,
 qa_failed integer not null default 0,
 on_time_count integer not null default 0,
 avg_response_seconds numeric,
 avg_completion_minutes numeric,
 acceptance_rate numeric,
 completion_rate numeric,
 cancellation_rate numeric,
 rework_rate numeric,
 qa_pass_rate numeric,
 on_time_rate numeric,
 customer_rating numeric,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

alter table public.dd_provider_capacity_profiles enable row level security;
alter table public.dd_provider_payables enable row level security;
alter table public.dd_provider_payouts enable row level security;
alter table public.dd_job_exceptions enable row level security;
alter table public.dd_provider_performance enable row level security;

create policy dd_provider_capacity_profiles_service_role on public.dd_provider_capacity_profiles for all to service_role using (true) with check (true);
create policy dd_provider_payables_service_role on public.dd_provider_payables for all to service_role using (true) with check (true);
create policy dd_provider_payouts_service_role on public.dd_provider_payouts for all to service_role using (true) with check (true);
create policy dd_job_exceptions_service_role on public.dd_job_exceptions for all to service_role using (true) with check (true);
create policy dd_provider_performance_service_role on public.dd_provider_performance for all to service_role using (true) with check (true);

create index if not exists idx_dd_provider_payables_job on public.dd_provider_payables(job_id);
create index if not exists idx_dd_provider_payables_provider on public.dd_provider_payables(provider_id);
create index if not exists idx_dd_provider_payouts_provider on public.dd_provider_payouts(provider_id);
create index if not exists idx_dd_job_exceptions_job on public.dd_job_exceptions(job_id);
create index if not exists idx_dd_provider_performance_provider_period on public.dd_provider_performance(provider_id, period_start, period_end);