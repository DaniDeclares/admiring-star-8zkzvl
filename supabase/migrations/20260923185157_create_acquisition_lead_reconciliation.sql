
create table if not exists public.dd_acquisition_lead_reconciliation (
  id uuid primary key default gen_random_uuid(),
  source_system text not null,
  source_contact_key text not null,
  customer_name text,
  phone text,
  contact_date date,
  business_name text,
  source_category text,
  zip_code text,
  state text,
  source_job_status text,
  response_time_minutes numeric,
  net_cost numeric,
  lead_cost numeric,
  sales_tax numeric,
  refunded boolean,
  charge_state text,
  reconciled_revenue numeric,
  revenue_evidence_status text not null default 'UNRECONCILED',
  revenue_evidence_note text,
  source_snapshot text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source_system, source_contact_key)
);
alter table public.dd_acquisition_lead_reconciliation enable row level security;
comment on table public.dd_acquisition_lead_reconciliation is 'Canonical acquisition/contact reconciliation. Read before re-deriving lead spend, lead outcome, or source-attributed revenue from external systems.';
create index if not exists dd_acq_lead_source_date_idx on public.dd_acquisition_lead_reconciliation(source_system,contact_date);
create index if not exists dd_acq_lead_customer_idx on public.dd_acquisition_lead_reconciliation(lower(customer_name));
