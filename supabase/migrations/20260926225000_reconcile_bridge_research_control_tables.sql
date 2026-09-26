-- Reconcile live bridge/research control-plane tables into GitHub version authority.
-- Matches current Production schema; all tables remain server-only with RLS enabled.

create table if not exists public.dd_environment_bridge_receipts (
  id uuid primary key default gen_random_uuid(),
  bridge_key text not null unique,
  direction text not null,
  artifact_type text not null,
  artifact_key text not null,
  source_environment text not null,
  target_environment text not null,
  source_state jsonb not null default '{}'::jsonb,
  target_state jsonb not null default '{}'::jsonb,
  bridge_status text not null default 'OBSERVED',
  requires_owner_approval boolean not null default false,
  autonomous_mutation_allowed boolean not null default false,
  source_observed_at timestamptz not null default now(),
  reconciled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists dd_environment_bridge_receipts_direction_status_idx
  on public.dd_environment_bridge_receipts(direction,bridge_status,updated_at desc);

create table if not exists public.dd_learning_evidence_intake (
  id uuid primary key default gen_random_uuid(),
  evidence_key text not null unique,
  evidence_origin text not null,
  domain text not null,
  source_system text not null,
  source_reference text,
  observation text not null,
  evidence_payload jsonb not null default '{}'::jsonb,
  authority_class text not null default 'EVIDENCE',
  candidate_key text,
  requires_new_test boolean not null default true,
  status text not null default 'NEW',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dd_promotion_candidates (
  id uuid primary key default gen_random_uuid(),
  candidate_key text not null unique,
  component_domain text not null,
  component_name text not null,
  source_environment text not null default 'TESTER',
  target_environment text not null default 'PRODUCTION',
  source_reference text,
  classification text not null default 'PROMOTE_AFTER_FIX',
  proof_status text not null default 'UNPROVEN',
  dependency_status text not null default 'UNCHECKED',
  security_status text not null default 'UNCHECKED',
  production_diff_status text not null default 'UNCHECKED',
  rollback_status text not null default 'UNDEFINED',
  owner_approval_status text not null default 'NOT_REQUESTED',
  production_verification_status text not null default 'NOT_RUN',
  blocking_reason text,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dd_research_coverage_gaps (
  gap_key text primary key,
  program_key text not null,
  open_work_items integer not null default 0,
  p0_open integer not null default 0,
  p1_open integer not null default 0,
  active_sources integer not null default 0,
  gap_status text not null default 'OPEN',
  priority text not null default 'P1',
  next_action text not null,
  observed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dd_research_discovery_targets (
  id uuid primary key default gen_random_uuid(),
  program_key text not null,
  target_key text not null unique,
  company_name text not null,
  homepage_url text not null,
  github_org_or_repo_url text,
  target_type text not null default 'PEER_COMPANY',
  status text not null default 'ACTIVE',
  discovery_interval_minutes integer not null default 1440,
  next_discovery_at timestamptz not null default now(),
  last_discovered_at timestamptz,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dd_environment_bridge_receipts enable row level security;
alter table public.dd_learning_evidence_intake enable row level security;
alter table public.dd_promotion_candidates enable row level security;
alter table public.dd_research_coverage_gaps enable row level security;
alter table public.dd_research_discovery_targets enable row level security;

revoke all on public.dd_environment_bridge_receipts from anon,authenticated;
revoke all on public.dd_learning_evidence_intake from anon,authenticated;
revoke all on public.dd_promotion_candidates from anon,authenticated;
revoke all on public.dd_research_coverage_gaps from anon,authenticated;
revoke all on public.dd_research_discovery_targets from anon,authenticated;

grant all on public.dd_environment_bridge_receipts to service_role;
grant all on public.dd_learning_evidence_intake to service_role;
grant all on public.dd_promotion_candidates to service_role;
grant all on public.dd_research_coverage_gaps to service_role;
grant all on public.dd_research_discovery_targets to service_role;
