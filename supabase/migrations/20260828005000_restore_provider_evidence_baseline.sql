-- Restore the provider reference tables that exist in the production schema
-- but were not captured in the repository's initial migration sequence.
-- This precedes 20260828005156_enable_rls_provider_sensitive_tables.

do $$ begin
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid=t.typnamespace
                 where n.nspname='public' and t.typname='dd_compensation_model') then
    create type public.dd_compensation_model as enum
      ('HOURLY','FLAT_PER_JOB','TIERED_UNIT','BLOCK_TIME','VOLUME_LOAD','SOW_QUOTE');
  end if;
end $$;

create table if not exists public.dd_provider_compliance_items (
  id uuid primary key default gen_random_uuid(),
  provider_org_id uuid not null references public.dd_provider_organizations(id) on delete cascade,
  requirement_code text not null,
  requirement_name text not null,
  required boolean not null default true,
  status text not null default 'PENDING' check (status in
    ('PENDING','SUBMITTED','UNDER_REVIEW','VERIFIED','REJECTED','EXPIRED','NOT_APPLICABLE','HOLD')),
  evidence_uri text,
  issuing_authority text,
  document_number text,
  jurisdiction text,
  issue_date date,
  expiration_date date,
  verification_method text,
  verified_at timestamptz,
  reviewer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider_org_id, requirement_code)
);

create table if not exists public.dd_provider_rate_cards (
  id uuid primary key default gen_random_uuid(),
  provider_org_id uuid not null references public.dd_provider_organizations(id) on delete cascade,
  service_line text not null,
  rate_type text not null,
  amount numeric(12,2),
  unit text,
  minimum_charge numeric(12,2),
  travel_terms text,
  overtime_terms text,
  cancellation_terms text,
  notes text,
  status text not null default 'PENDING' check (status in ('PENDING','SUBMITTED','UNDER_REVIEW','APPROVED','RETIRED')),
  effective_date date,
  expiration_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  canonical_sku text,
  comp_model public.dd_compensation_model,
  minimum_payable_floor numeric(10,2) not null default 0,
  quantity_basis_unit text,
  travel_reimbursement_rule jsonb not null default '{}'::jsonb,
  material_markup_percentage numeric(5,2) not null default 0,
  overtime_trigger_threshold interval,
  is_contracted boolean not null default false
);

create table if not exists public.dd_provider_source_evidence (
  id uuid primary key default gen_random_uuid(),
  provider_org_id uuid not null references public.dd_provider_organizations(id) on delete cascade,
  source_type text not null,
  source_reference text not null,
  source_url text,
  evidence_summary text,
  permission_basis text,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_dd_provider_compliance_org_status
  on public.dd_provider_compliance_items(provider_org_id,status);
create index if not exists idx_dd_provider_rate_cards_org_status
  on public.dd_provider_rate_cards(provider_org_id,status);
create index if not exists idx_dd_provider_source_evidence_org
  on public.dd_provider_source_evidence(provider_org_id);

alter table public.dd_provider_compliance_items enable row level security;
alter table public.dd_provider_rate_cards enable row level security;
alter table public.dd_provider_source_evidence enable row level security;
