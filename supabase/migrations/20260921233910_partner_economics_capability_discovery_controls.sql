
-- Partner/provider relationships remain independent but may coexist.
alter table public.dd_partners
  add column if not exists provider_org_id uuid references public.dd_provider_organizations(id) on delete set null;

create unique index if not exists dd_partners_provider_org_unique
  on public.dd_partners(provider_org_id) where provider_org_id is not null;

create table if not exists public.dd_partner_programs (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.dd_partners(id) on delete cascade,
  program_code text not null,
  program_type text not null check (program_type in ('REFERRAL','CHANNEL','FULFILLMENT','SUPPLIER_VENDOR','STRATEGIC','COMMUNITY_PROPERTY','OTHER')),
  status text not null default 'DRAFT' check (status in ('DRAFT','PENDING_APPROVAL','ACTIVE','SUSPENDED','ENDED')),
  compensation_method text check (compensation_method in ('FLAT','PERCENT_GROSS','PERCENT_NET','REVENUE_SHARE','INVOICE','NONE','CUSTOM')),
  compensation_value numeric(12,4),
  attribution_method text not null default 'CONTRACT_RULES',
  attribution_window_days integer check (attribution_window_days is null or attribution_window_days >= 0),
  clearing_days integer check (clearing_days is null or clearing_days >= 0),
  dispute_window_days integer check (dispute_window_days is null or dispute_window_days >= 0),
  rule_config jsonb not null default '{}'::jsonb,
  effective_from timestamptz,
  effective_to timestamptz,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(partner_id, program_code)
);

create table if not exists public.dd_partner_attribution_events (
  id uuid primary key default gen_random_uuid(),
  partner_program_id uuid references public.dd_partner_programs(id) on delete set null,
  payment_event_id uuid references public.dd_payment_events(id) on delete set null,
  request_id uuid references public.service_requests(id) on delete set null,
  job_id uuid references public.dd_jobs(id) on delete set null,
  invoice_id uuid references public.dd_invoices(id) on delete set null,
  evidence_type text not null,
  evidence_payload jsonb not null default '{}'::jsonb,
  evidence_strength integer,
  candidate_partner_id uuid references public.dd_partners(id) on delete set null,
  resolution_status text not null default 'CAPTURED' check (resolution_status in ('CAPTURED','RESOLVED','REJECTED','DISPUTED','SUPERSEDED')),
  resolved_partner_id uuid references public.dd_partners(id) on delete set null,
  resolution_rule text,
  resolution_notes text,
  captured_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.dd_partner_accruals (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.dd_partners(id) on delete restrict,
  partner_program_id uuid not null references public.dd_partner_programs(id) on delete restrict,
  attribution_event_id uuid not null references public.dd_partner_attribution_events(id) on delete restrict,
  payment_event_id uuid references public.dd_payment_events(id) on delete set null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'usd',
  status text not null default 'ACCRUED' check (status in ('ACCRUED','CLEARED','DISPUTED','REVERSED','PAID','CANCELLED')),
  accrued_at timestamptz not null default now(),
  clearing_at timestamptz,
  cleared_at timestamptz,
  reversed_at timestamptz,
  reversal_reason text,
  calculation_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dd_partner_settlements (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.dd_partners(id) on delete restrict,
  partner_program_id uuid references public.dd_partner_programs(id) on delete restrict,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'usd',
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','PROCESSING','PAID','FAILED','VOID')),
  processor text,
  processor_reference text,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.dd_partner_settlement_items (
  settlement_id uuid not null references public.dd_partner_settlements(id) on delete cascade,
  accrual_id uuid not null unique references public.dd_partner_accruals(id) on delete restrict,
  amount numeric(12,2) not null check (amount >= 0),
  primary key (settlement_id, accrual_id)
);

-- Preserve provider/applicant language as provenance. This never writes to services.
create table if not exists public.dd_provider_capability_claims (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.dd_provider_applications(id) on delete cascade,
  application_capability_id uuid references public.dd_provider_application_capabilities(id) on delete cascade,
  provider_id uuid references public.dd_providers(id) on delete set null,
  provider_org_id uuid references public.dd_provider_organizations(id) on delete set null,
  raw_stated_capability text not null,
  normalized_capability_key text,
  matched_service_id uuid references public.services(id) on delete set null,
  discovery_id uuid references public.dd_provider_capability_discovery(id) on delete set null,
  normalization_status text not null default 'PENDING' check (normalization_status in ('PENDING','MATCHED_EXISTING','DISCOVERY_CANDIDATE','NEEDS_REVIEW','REJECTED')),
  authorization_status text not null default 'UNVERIFIED' check (authorization_status in ('UNVERIFIED','PENDING_VERIFICATION','AUTHORIZED','SUSPENDED','REJECTED')),
  evidence jsonb not null default '{}'::jsonb,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  check (application_id is not null or provider_id is not null or provider_org_id is not null)
);

create index if not exists dd_partner_attr_payment_idx on public.dd_partner_attribution_events(payment_event_id);
create index if not exists dd_partner_attr_request_idx on public.dd_partner_attribution_events(request_id);
create index if not exists dd_partner_accrual_status_idx on public.dd_partner_accruals(status, clearing_at);
create index if not exists dd_provider_capability_claims_norm_idx on public.dd_provider_capability_claims(normalization_status, normalized_capability_key);

-- Internal financial/governance tables: no anonymous access; staff-admin UI may read/write,
-- trusted server/service-role remains available for controlled automation.
alter table public.dd_partner_programs enable row level security;
alter table public.dd_partner_attribution_events enable row level security;
alter table public.dd_partner_accruals enable row level security;
alter table public.dd_partner_settlements enable row level security;
alter table public.dd_partner_settlement_items enable row level security;
alter table public.dd_provider_capability_claims enable row level security;

revoke all on public.dd_partner_programs, public.dd_partner_attribution_events,
 public.dd_partner_accruals, public.dd_partner_settlements, public.dd_partner_settlement_items,
 public.dd_provider_capability_claims from anon;

grant select,insert,update,delete on public.dd_partner_programs, public.dd_partner_attribution_events,
 public.dd_partner_accruals, public.dd_partner_settlements, public.dd_partner_settlement_items,
 public.dd_provider_capability_claims to authenticated, service_role;

create policy dd_partner_programs_staff_all on public.dd_partner_programs for all to authenticated
 using (private.dd_is_staff_admin()) with check (private.dd_is_staff_admin());
create policy dd_partner_attribution_staff_all on public.dd_partner_attribution_events for all to authenticated
 using (private.dd_is_staff_admin()) with check (private.dd_is_staff_admin());
create policy dd_partner_accruals_staff_all on public.dd_partner_accruals for all to authenticated
 using (private.dd_is_staff_admin()) with check (private.dd_is_staff_admin());
create policy dd_partner_settlements_staff_all on public.dd_partner_settlements for all to authenticated
 using (private.dd_is_staff_admin()) with check (private.dd_is_staff_admin());
create policy dd_partner_settlement_items_staff_all on public.dd_partner_settlement_items for all to authenticated
 using (private.dd_is_staff_admin()) with check (private.dd_is_staff_admin());
create policy dd_provider_capability_claims_staff_all on public.dd_provider_capability_claims for all to authenticated
 using (private.dd_is_staff_admin()) with check (private.dd_is_staff_admin());

-- Repair critical audit-ledger exposure without guessing client write semantics.
-- Cross-agent/server mutation remains through service_role/postgres; staff admins retain read visibility.
revoke all on public.dd_agent_change_ledger from anon;
revoke insert, update, delete, truncate, references, trigger on public.dd_agent_change_ledger from authenticated;
grant select on public.dd_agent_change_ledger to authenticated;
alter table public.dd_agent_change_ledger enable row level security;
create policy dd_agent_change_ledger_staff_read on public.dd_agent_change_ledger
 for select to authenticated using (private.dd_is_staff_admin());
