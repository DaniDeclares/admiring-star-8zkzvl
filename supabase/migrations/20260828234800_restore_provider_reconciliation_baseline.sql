-- The production table predates the tracked RLS/index migrations below.
create table if not exists public.dd_provider_service_reconciliation (
  id uuid primary key default gen_random_uuid(),
  provider_service_evidence_id uuid not null unique references public.dd_provider_service_universe(id) on delete restrict,
  provider_id uuid,
  provider_code text,
  provider_name text,
  source_service text,
  source_cluster text,
  proposed_division text,
  canonical_service_id uuid references public.dd_master_service_universe(id) on delete restrict,
  canonical_sku text,
  reconciliation_decision text not null default 'PENDING_RECONCILIATION',
  channel_decision text not null default 'PENDING_RECONCILIATION',
  fulfillment_decision text not null default 'PENDING_RECONCILIATION',
  compliance_decision text not null default 'PENDING_RECONCILIATION',
  economics_decision text not null default 'PENDING_RECONCILIATION',
  rationale text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dd_provider_service_reconciliation enable row level security;

create table if not exists public.dd_division_reconciliation_register (
  division_code text primary key,
  division_name text,
  source_basis text,
  authority_status text not null default 'PENDING_RECONCILIATION',
  master_record_count integer not null default 0,
  provider_evidence_count integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dd_division_reconciliation_register enable row level security;
