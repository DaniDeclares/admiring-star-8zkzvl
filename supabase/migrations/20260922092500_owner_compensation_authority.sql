-- Owner compensation is a fulfillment-cost authority, separate from DANI retained contribution and owner withdrawals.
create table if not exists public.dd_owner_compensation_rules (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid references public.services(id) on delete cascade,
  component_id uuid references public.dd_service_components(id) on delete cascade,
  compensation_type text not null,
  rate_amount numeric,
  percent_rate numeric,
  percent_basis text,
  minimum_amount numeric,
  maximum_amount numeric,
  currency text not null default 'USD',
  evidence_status text not null default 'UNRESOLVED',
  source_reference text,
  status text not null default 'DRAFT',
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dd_owner_comp_rules_type_chk check (compensation_type in ('FLAT','HOURLY','PER_UNIT','PER_SEAT','PER_DEVICE','PER_GARMENT','MILEAGE','PERCENTAGE','NEGOTIATED_PROJECT','COMBINATION')),
  constraint dd_owner_comp_rules_status_chk check (status in ('DRAFT','ACTIVE','PAUSED','RETIRED')),
  constraint dd_owner_comp_rules_evidence_chk check (evidence_status in ('UNRESOLVED','OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED'))
);
create index if not exists idx_dd_owner_comp_rules_owner_service on public.dd_owner_compensation_rules(owner_user_id,service_id,status,effective_from desc);
alter table public.dd_owner_compensation_rules enable row level security;
revoke all on public.dd_owner_compensation_rules from anon, authenticated;
grant select,insert,update,delete on public.dd_owner_compensation_rules to service_role;
comment on table public.dd_owner_compensation_rules is 'Effective-dated owner fulfillment compensation authority. Owner fulfillment compensation is a direct economic allocation and remains separate from DANI retained contribution, profit/distributions, and owner withdrawals.';
