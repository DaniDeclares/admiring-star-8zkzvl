-- FORENSIC RECOVERY FROM THE PRODUCTION CATALOG (read-only). Not a redesign.
-- Authority: Danielle, 2026-10-02 13:45 UTC: "Production live schema -> read-only forensic
--   recovery -> checked-in/reviewable #520 source -> isolated replay -> evidence."
-- Source: Production project ajxezpczaemunlcmqlgl, pg_catalog read on 2026-10-02
--   (format_type, pg_get_expr, pg_get_constraintdef, pg_get_indexdef, pg_policies, relacl).
-- Why: replay of 20260828005156_enable_rls_provider_sensitive_tables fails because no
--   source file creates these objects. Production has them; no Production ledger entry
--   carries their CREATE. Tester corroborates the same objects in its ledger version
--   20260922205434_restore_provider_evidence_baseline (evidence only, not authority).
-- Omitted on purpose: RLS enablement and the three *_service_role policies, because the
--   very next source migration (20260828005156) creates exactly those.
-- Every column, default, constraint and index below matches the live Production object.

do $$ begin
  create type public.dd_compensation_model as enum ('HOURLY', 'FLAT_PER_JOB', 'TIERED_UNIT', 'BLOCK_TIME', 'VOLUME_LOAD', 'SOW_QUOTE');
exception when duplicate_object then null; end $$;

create table if not exists public.dd_provider_compliance_items (
  id uuid default gen_random_uuid() not null,
  provider_org_id uuid not null,
  requirement_code text not null,
  requirement_name text not null,
  required boolean default true not null,
  status text default 'PENDING'::text not null,
  evidence_uri text,
  issuing_authority text,
  document_number text,
  jurisdiction text,
  issue_date date,
  expiration_date date,
  verification_method text,
  verified_at timestamp with time zone,
  reviewer_notes text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint dd_provider_compliance_items_provider_org_id_requirement_co_key UNIQUE (provider_org_id, requirement_code),
  constraint dd_provider_compliance_items_pkey PRIMARY KEY (id),
  constraint dd_provider_compliance_items_status_check CHECK ((status = ANY (ARRAY['PENDING'::text, 'SUBMITTED'::text, 'UNDER_REVIEW'::text, 'VERIFIED'::text, 'REJECTED'::text, 'EXPIRED'::text, 'NOT_APPLICABLE'::text, 'HOLD'::text])))
);
CREATE INDEX IF NOT EXISTS idx_dd_provider_compliance_org_status ON public.dd_provider_compliance_items USING btree (provider_org_id, status);

create table if not exists public.dd_provider_rate_cards (
  id uuid default gen_random_uuid() not null,
  provider_org_id uuid not null,
  service_line text not null,
  rate_type text not null,
  amount numeric(12,2),
  unit text,
  minimum_charge numeric(12,2),
  travel_terms text,
  overtime_terms text,
  cancellation_terms text,
  notes text,
  status text default 'PENDING'::text not null,
  effective_date date,
  expiration_date date,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  canonical_sku text,
  comp_model public.dd_compensation_model,
  minimum_payable_floor numeric(10,2) default 0 not null,
  quantity_basis_unit text,
  travel_reimbursement_rule jsonb default '{}'::jsonb not null,
  material_markup_percentage numeric(5,2) default 0 not null,
  overtime_trigger_threshold interval,
  is_contracted boolean default false not null,
  constraint dd_provider_rate_cards_pkey PRIMARY KEY (id),
  constraint dd_provider_rate_cards_status_check CHECK ((status = ANY (ARRAY['PENDING'::text, 'SUBMITTED'::text, 'UNDER_REVIEW'::text, 'APPROVED'::text, 'RETIRED'::text])))
);
CREATE INDEX IF NOT EXISTS idx_dd_provider_rate_cards_org_status ON public.dd_provider_rate_cards USING btree (provider_org_id, status);

create table if not exists public.dd_provider_source_evidence (
  id uuid default gen_random_uuid() not null,
  provider_org_id uuid not null,
  source_type text not null,
  source_reference text not null,
  source_url text,
  evidence_summary text,
  permission_basis text,
  captured_at timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null,
  constraint dd_provider_source_evidence_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_dd_provider_source_evidence_org ON public.dd_provider_source_evidence USING btree (provider_org_id);

-- Foreign keys (Production: ON DELETE CASCADE to dd_provider_organizations).
do $$ begin
  alter table public.dd_provider_compliance_items add constraint dd_provider_compliance_items_provider_org_id_fkey FOREIGN KEY (provider_org_id) REFERENCES public.dd_provider_organizations(id) ON DELETE CASCADE;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.dd_provider_rate_cards add constraint dd_provider_rate_cards_provider_org_id_fkey FOREIGN KEY (provider_org_id) REFERENCES public.dd_provider_organizations(id) ON DELETE CASCADE;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.dd_provider_source_evidence add constraint dd_provider_source_evidence_provider_org_id_fkey FOREIGN KEY (provider_org_id) REFERENCES public.dd_provider_organizations(id) ON DELETE CASCADE;
exception when duplicate_object then null; end $$;

-- Grants: Production relacl on all three is
--   {postgres=arwdDxtm, anon=rm, authenticated=arwdDxtm, service_role=arwdDxtm}.
-- Supabase default privileges give anon full rights, so narrow anon to match Production.
revoke insert, update, delete, truncate, references, trigger on public.dd_provider_compliance_items, public.dd_provider_rate_cards, public.dd_provider_source_evidence from anon;
