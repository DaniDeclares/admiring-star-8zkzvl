-- Codify runtime relations already authoritative in Production so clean migration replay is deterministic.
-- CREATE IF NOT EXISTS is intentionally non-destructive for environments where these relations already exist.

create table if not exists public.dd_accounts_payable_ledger (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null,
  provider_id uuid not null,
  base_payout_amount numeric not null,
  travel_allowance numeric not null default 0,
  approved_change_order_addition numeric not null default 0,
  total_final_payable numeric not null,
  is_cleared_for_payout boolean not null default false,
  payment_reference_id varchar,
  accrued_at timestamptz not null default now(),
  settled_at timestamptz
);

create table if not exists public.dd_provider_payout_clearance_policy (
  policy_key text primary key,
  clearance_mode text not null,
  owner_approved boolean not null default false,
  external_payout_authorized boolean not null default false,
  rationale text,
  effective_from timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.dd_audit_proof_receipts (
  id uuid primary key default gen_random_uuid(),
  work_id uuid,
  work_key text not null,
  proof_key text not null,
  proof_version text not null default 'v1',
  environment text not null default 'PRODUCTION',
  status text not null,
  assertions_total integer not null default 0,
  assertions_passed integer not null default 0,
  assertions_failed integer not null default 0,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.dd_lead_source_performance_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_date date not null,
  source text not null,
  lead_count integer not null default 0,
  quoted_count integer not null default 0,
  converted_count integer not null default 0,
  quoted_amount numeric not null default 0,
  amount_collected numeric not null default 0,
  created_at timestamptz not null default now()
);
create unique index if not exists dd_lead_source_performance_snapshots_day_source_uidx
  on public.dd_lead_source_performance_snapshots(snapshot_date,source);

create table if not exists public.dd_provider_performance_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_date date not null,
  provider_key text not null,
  offers integer not null default 0,
  accepts integer not null default 0,
  rejects integer not null default 0,
  expired_unanswered integer not null default 0,
  acceptance_rate numeric,
  created_at timestamptz not null default now()
);
create unique index if not exists dd_provider_performance_snapshots_day_provider_uidx
  on public.dd_provider_performance_snapshots(snapshot_date,provider_key);

revoke all on public.dd_accounts_payable_ledger from anon,authenticated;
revoke all on public.dd_provider_payout_clearance_policy from anon,authenticated;
revoke all on public.dd_audit_proof_receipts from anon,authenticated;
revoke all on public.dd_lead_source_performance_snapshots from anon,authenticated;
revoke all on public.dd_provider_performance_snapshots from anon,authenticated;
