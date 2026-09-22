-- DANI DECLARES component economics + pre-dispatch provider negotiation contract
-- Owner-approved 2026-09-22. No rates/costs are seeded by this migration.
-- Existing dd_jobs remains production dispatch authority.

create table if not exists public.dd_service_components (
  id uuid primary key default gen_random_uuid(),
  component_code text not null unique,
  component_name text not null,
  description text,
  unit_type text not null,
  cost_category text not null,
  tax_classification text,
  default_fulfillment_mode text not null default 'IN_HOUSE',
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dd_service_components_mode_chk check (default_fulfillment_mode in ('IN_HOUSE','PROVIDER','PROCURED','SUBCONTRACTED','ADMINISTRATIVE','LOGISTICS'))
);

create table if not exists public.dd_service_package_components (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  component_id uuid not null references public.dd_service_components(id) on delete restrict,
  component_role text not null default 'INCLUDED',
  included_quantity numeric not null default 1,
  quantity_input_key text,
  is_required boolean not null default true,
  is_optional boolean not null default false,
  allowance_definition jsonb not null default '{}'::jsonb,
  exclusion_definition jsonb not null default '[]'::jsonb,
  fulfillment_mode text,
  sort_order integer not null default 100,
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(service_id, component_id, component_role, effective_from),
  constraint dd_service_package_components_mode_chk check (fulfillment_mode is null or fulfillment_mode in ('IN_HOUSE','PROVIDER','PROCURED','SUBCONTRACTED','ADMINISTRATIVE','LOGISTICS'))
);

create table if not exists public.dd_provider_compensation_rules (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.dd_providers(id) on delete cascade,
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
  constraint dd_provider_comp_rules_type_chk check (compensation_type in ('FLAT','HOURLY','PER_UNIT','PER_SEAT','PER_DEVICE','PER_GARMENT','MILEAGE','PERCENTAGE','NEGOTIATED_PROJECT','COMBINATION')),
  constraint dd_provider_comp_rules_status_chk check (status in ('DRAFT','ACTIVE','PAUSED','RETIRED')),
  constraint dd_provider_comp_rules_evidence_chk check (evidence_status in ('UNRESOLVED','OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED'))
);

create table if not exists public.dd_estimate_economics_snapshots (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.dd_estimates(id) on delete cascade,
  version integer not null,
  economics_status text not null default 'UNRESOLVED',
  customer_price numeric not null default 0,
  owner_compensation numeric not null default 0,
  provider_compensation numeric not null default 0,
  materials_cost numeric not null default 0,
  procurement_cost numeric not null default 0,
  subcontract_cost numeric not null default 0,
  travel_cost numeric not null default 0,
  payment_processing_cost numeric not null default 0,
  other_variable_cost numeric not null default 0,
  overhead_recovery_requirement numeric not null default 0,
  minimum_viable_price numeric,
  expected_contribution numeric,
  expected_margin_percent numeric,
  working_capital_required numeric not null default 0,
  discount_amount numeric not null default 0,
  tax_amount numeric not null default 0,
  snapshot_payload jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now(),
  captured_by uuid references auth.users(id),
  unique(estimate_id, version),
  constraint dd_estimate_econ_status_chk check (economics_status in ('UNRESOLVED','NEEDS_REVIEW','PASS','FAIL','SUPERSEDED'))
);

create table if not exists public.dd_estimate_component_snapshots (
  id uuid primary key default gen_random_uuid(),
  economics_snapshot_id uuid not null references public.dd_estimate_economics_snapshots(id) on delete cascade,
  estimate_id uuid not null references public.dd_estimates(id) on delete cascade,
  line_index integer not null default 0,
  canonical_sku text not null,
  service_id uuid references public.services(id) on delete set null,
  component_id uuid references public.dd_service_components(id) on delete set null,
  component_code text not null,
  component_name text not null,
  quantity numeric not null default 1,
  unit_type text not null,
  fulfillment_mode text not null,
  fulfiller_type text not null,
  provider_id uuid references public.dd_providers(id) on delete set null,
  owner_user_id uuid references auth.users(id) on delete set null,
  proposed_compensation numeric not null default 0,
  compensation_basis_snapshot jsonb not null default '{}'::jsonb,
  expected_labor_cost numeric not null default 0,
  expected_material_cost numeric not null default 0,
  expected_travel_cost numeric not null default 0,
  expected_procurement_cost numeric not null default 0,
  expected_subcontract_cost numeric not null default 0,
  expected_processing_cost numeric not null default 0,
  expected_other_cost numeric not null default 0,
  customer_price_allocated numeric not null default 0,
  tax_classification text,
  economic_status text not null default 'UNRESOLVED',
  scope_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint dd_estimate_component_fulfillment_chk check (fulfillment_mode in ('IN_HOUSE','PROVIDER','PROCURED','SUBCONTRACTED','ADMINISTRATIVE','LOGISTICS')),
  constraint dd_estimate_component_fulfiller_chk check (fulfiller_type in ('OWNER','PROVIDER','VENDOR','SUBCONTRACTOR','UNASSIGNED')),
  constraint dd_estimate_component_status_chk check (economic_status in ('UNRESOLVED','NEEDS_REVIEW','PASS','FAIL'))
);

create table if not exists public.dd_estimate_assignment_offers (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.dd_estimates(id) on delete cascade,
  economics_snapshot_id uuid not null references public.dd_estimate_economics_snapshots(id) on delete cascade,
  assignment_type text not null,
  provider_id uuid references public.dd_providers(id) on delete cascade,
  owner_user_id uuid references auth.users(id) on delete cascade,
  status text not null default 'PROPOSED',
  component_snapshot_ids uuid[] not null default '{}',
  scope_snapshot jsonb not null default '{}'::jsonb,
  proposed_compensation numeric not null default 0,
  proposed_basis jsonb not null default '{}'::jsonb,
  counter_compensation numeric,
  counter_basis jsonb,
  counter_reason text,
  economic_impact_status text not null default 'NOT_EVALUATED',
  offer_version integer not null default 1,
  offered_at timestamptz,
  responded_at timestamptz,
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id),
  resolution text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dd_estimate_assignment_type_chk check (assignment_type in ('OWNER','PROVIDER','VENDOR','SUBCONTRACTOR')),
  constraint dd_estimate_assignment_status_chk check (status in ('PROPOSED','OFFERED','ACCEPTED','DECLINED','COUNTEROFFERED','OWNER_ACCEPTED_COUNTER','OWNER_REJECTED_COUNTER','REVISED','CANCELLED','SUPERSEDED')),
  constraint dd_estimate_assignment_impact_chk check (economic_impact_status in ('NOT_EVALUATED','WITHIN_FLOOR','BREAKS_FLOOR','REQUIRES_REPRICE','REQUIRES_CUSTOMER_REAPPROVAL')),
  constraint dd_estimate_assignment_actor_chk check (
    (assignment_type='PROVIDER' and provider_id is not null and owner_user_id is null)
    or (assignment_type='OWNER' and owner_user_id is not null and provider_id is null)
    or (assignment_type in ('VENDOR','SUBCONTRACTOR'))
  )
);

create table if not exists public.dd_estimate_assignment_events (
  id uuid primary key default gen_random_uuid(),
  assignment_offer_id uuid not null references public.dd_estimate_assignment_offers(id) on delete cascade,
  event_type text not null,
  actor_user_id uuid references auth.users(id),
  actor_provider_id uuid references public.dd_providers(id),
  from_status text,
  to_status text,
  compensation_before numeric,
  compensation_after numeric,
  reason text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.dd_job_cost_actuals (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.dd_jobs(id) on delete cascade,
  estimate_component_snapshot_id uuid references public.dd_estimate_component_snapshots(id) on delete set null,
  provider_id uuid references public.dd_providers(id) on delete set null,
  owner_user_id uuid references auth.users(id) on delete set null,
  cost_type text not null,
  quantity numeric not null default 1,
  unit_cost numeric,
  amount numeric not null,
  source_type text not null,
  source_reference text,
  status text not null default 'RECORDED',
  incurred_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint dd_job_cost_type_chk check (cost_type in ('OWNER_LABOR','PROVIDER_LABOR','MATERIAL','PROCUREMENT','SUBCONTRACT','TRAVEL','PAYMENT_PROCESSING','REFUND','CHARGEBACK','REWORK','OTHER')),
  constraint dd_job_cost_status_chk check (status in ('ESTIMATED','RECORDED','APPROVED','VOID'))
);

alter table public.dd_estimates
  add column if not exists economics_status text not null default 'UNRESOLVED',
  add column if not exists assignment_readiness_status text not null default 'UNRESOLVED',
  add column if not exists active_economics_snapshot_id uuid references public.dd_estimate_economics_snapshots(id) on delete set null;

create index if not exists idx_dd_package_components_service on public.dd_service_package_components(service_id) where is_active;
create index if not exists idx_dd_comp_rules_provider_service on public.dd_provider_compensation_rules(provider_id,service_id,status);
create index if not exists idx_dd_estimate_econ_estimate on public.dd_estimate_economics_snapshots(estimate_id,version desc);
create index if not exists idx_dd_estimate_component_estimate on public.dd_estimate_component_snapshots(estimate_id);
create index if not exists idx_dd_estimate_assignment_provider on public.dd_estimate_assignment_offers(provider_id,status) where provider_id is not null;
create index if not exists idx_dd_estimate_assignment_owner on public.dd_estimate_assignment_offers(owner_user_id,status) where owner_user_id is not null;
create index if not exists idx_dd_estimate_assignment_estimate on public.dd_estimate_assignment_offers(estimate_id,status);
create index if not exists idx_dd_assignment_events_offer on public.dd_estimate_assignment_events(assignment_offer_id,created_at);
create index if not exists idx_dd_job_cost_actuals_job on public.dd_job_cost_actuals(job_id,cost_type);

alter table public.dd_service_components enable row level security;
alter table public.dd_service_package_components enable row level security;
alter table public.dd_provider_compensation_rules enable row level security;
alter table public.dd_estimate_economics_snapshots enable row level security;
alter table public.dd_estimate_component_snapshots enable row level security;
alter table public.dd_estimate_assignment_offers enable row level security;
alter table public.dd_estimate_assignment_events enable row level security;
alter table public.dd_job_cost_actuals enable row level security;

revoke all on public.dd_service_components from anon, authenticated;
revoke all on public.dd_service_package_components from anon, authenticated;
revoke all on public.dd_provider_compensation_rules from anon, authenticated;
revoke all on public.dd_estimate_economics_snapshots from anon, authenticated;
revoke all on public.dd_estimate_component_snapshots from anon, authenticated;
revoke all on public.dd_estimate_assignment_offers from anon, authenticated;
revoke all on public.dd_estimate_assignment_events from anon, authenticated;
revoke all on public.dd_job_cost_actuals from anon, authenticated;

grant select,insert,update,delete on public.dd_service_components to service_role;
grant select,insert,update,delete on public.dd_service_package_components to service_role;
grant select,insert,update,delete on public.dd_provider_compensation_rules to service_role;
grant select,insert,update,delete on public.dd_estimate_economics_snapshots to service_role;
grant select,insert,update,delete on public.dd_estimate_component_snapshots to service_role;
grant select,insert,update,delete on public.dd_estimate_assignment_offers to service_role;
grant select,insert on public.dd_estimate_assignment_events to service_role;
grant select,insert,update,delete on public.dd_job_cost_actuals to service_role;

comment on table public.dd_service_components is 'Reusable atomic work/cost components used to compose DANI services and packages. No customer price authority.';
comment on table public.dd_service_package_components is 'Governed bill-of-work/material composition for a canonical runtime service. Defines inclusion, not customer price.';
comment on table public.dd_provider_compensation_rules is 'Provider compensation authority, separate from customer pricing and DANI margin requirements.';
comment on table public.dd_estimate_economics_snapshots is 'Immutable-versioned expected economics frozen for an estimate before customer delivery.';
comment on table public.dd_estimate_component_snapshots is 'Frozen component-level economics and fulfillment composition for an estimate version.';
comment on table public.dd_estimate_assignment_offers is 'Pre-dispatch owner/provider assignment and compensation negotiation. Does not itself change customer price or dispatch.';
comment on table public.dd_estimate_assignment_events is 'Append-only negotiation/audit history for estimate assignment offers.';
comment on table public.dd_job_cost_actuals is 'Actual job-cost ledger for estimate-vs-actual variance and accounting reconciliation.';

