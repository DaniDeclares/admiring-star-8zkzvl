-- Provider payout/connect foundation.
-- Additive only. Does not create live Stripe connected accounts or initiate payouts.
-- Stripe remains authority for connected-account verification/bank details;
-- DANI stores only operational references/status and the provider earnings/AP ledger.
create table if not exists public.dd_provider_stripe_connect_accounts (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.dd_providers(id) on delete cascade,
  stripe_account_id text,
  connect_api_model text not null default 'ACCOUNTS_V2',
  onboarding_mode text not null default 'EMBEDDED',
  onboarding_status text not null default 'NOT_STARTED',
  transfers_status text not null default 'NOT_REQUESTED',
  tax_reporting_status text not null default 'NOT_STARTED',
  payout_destination_status text not null default 'NOT_STARTED',
  payouts_enabled boolean not null default false,
  requirements_due jsonb not null default '[]'::jsonb,
  last_stripe_event_at timestamptz,
  last_sync_at timestamptz,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider_id)
);

create table if not exists public.dd_provider_earnings_ledger (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.dd_providers(id),
  provider_org_id uuid references public.dd_provider_organizations(id),
  work_order_id uuid,
  payable_id uuid references public.dd_accounts_payable_ledger(id),
  earning_type text not null,
  source_id text,
  base_amount numeric(12,2) not null default 0,
  bonus_amount numeric(12,2) not null default 0,
  reimbursement_amount numeric(12,2) not null default 0,
  adjustment_amount numeric(12,2) not null default 0,
  total_approved_amount numeric(12,2) not null default 0,
  currency text not null default 'USD',
  earning_status text not null default 'PENDING',
  hold_reason text,
  qa_approved_at timestamptz,
  approved_at timestamptz,
  scheduled_payout_date date,
  paid_at timestamptz,
  stripe_transfer_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dd_provider_payout_runs (
  id uuid primary key default gen_random_uuid(),
  run_name text not null,
  period_start date not null,
  period_end date not null,
  scheduled_for date not null,
  payout_status text not null default 'DRAFT',
  provider_count integer not null default 0,
  total_amount numeric(12,2) not null default 0,
  currency text not null default 'USD',
  approved_by uuid,
  approved_at timestamptz,
  initiated_at timestamptz,
  completed_at timestamptz,
  failure_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(run_name,period_start,period_end)
);

create index if not exists dd_provider_earnings_provider_status_idx on public.dd_provider_earnings_ledger(provider_id,earning_status);
create index if not exists dd_provider_earnings_payable_idx on public.dd_provider_earnings_ledger(payable_id);
create index if not exists dd_provider_payout_runs_scheduled_idx on public.dd_provider_payout_runs(scheduled_for,payout_status);