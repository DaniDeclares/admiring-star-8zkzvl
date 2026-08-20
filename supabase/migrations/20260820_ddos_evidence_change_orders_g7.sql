-- G7 — Evidence, Completion Verification & Change Orders
-- Operational/commercial bridge only. Change orders create isolated pricing deltas;
-- they never mutate the original estimate or invoice totals.

create table if not exists public.dd_job_evidence (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.dd_jobs(id) on delete cascade,
  task_id uuid references public.dd_job_tasks(id) on delete set null,
  provider_id uuid not null,
  evidence_type text not null,
  storage_url text not null,
  file_metadata jsonb,
  verification_status text not null default 'PENDING',
  verified_by uuid,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_dd_job_evidence_job
  on public.dd_job_evidence(job_id, created_at desc);
create index if not exists idx_dd_job_evidence_task
  on public.dd_job_evidence(task_id, created_at desc);

create table if not exists public.dd_change_orders (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.dd_jobs(id) on delete cascade,
  requested_by text not null,
  requested_by_id uuid,
  reason text not null,
  status text not null default 'DRAFT',
  pricing_status text not null default 'UNRESOLVED',
  resolved_channel text,
  resolved_offer_id text,
  catalog_version text,
  disclaimer_id text,
  pricing_context jsonb not null default '{}'::jsonb,
  delta_base_subtotal numeric(10,2) not null default 0,
  delta_addon_subtotal numeric(10,2) not null default 0,
  delta_travel numeric(10,2) not null default 0,
  delta_rush numeric(10,2) not null default 0,
  delta_supplies numeric(10,2) not null default 0,
  delta_tax numeric(10,2) not null default 0,
  delta_estimated_total numeric(10,2) not null default 0,
  frozen_delta_modifiers jsonb,
  approval_reference text,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz
);

create index if not exists idx_dd_change_orders_job
  on public.dd_change_orders(job_id, created_at desc);
create index if not exists idx_dd_change_orders_status
  on public.dd_change_orders(status, created_at desc);

create table if not exists public.dd_completion_reviews (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.dd_jobs(id) on delete cascade,
  reviewer_id uuid,
  review_type text not null,
  status text not null default 'PENDING',
  notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists idx_dd_completion_reviews_job
  on public.dd_completion_reviews(job_id, created_at desc);

alter table public.dd_job_evidence enable row level security;
alter table public.dd_change_orders enable row level security;
alter table public.dd_completion_reviews enable row level security;

-- No anonymous/public write policies are introduced. Server-side authenticated
-- operations remain responsible for evidence, approval, and verification writes.
