-- FORENSIC RECOVERY FROM THE PRODUCTION CATALOG (read-only). Not a redesign.
-- Authority: Danielle, 2026-10-02 13:45 UTC (read-only Production catalog recovery into #520).
-- Source: Production project ajxezpczaemunlcmqlgl, pg_catalog read on 2026-10-02.
-- Why: replay of 20260828234918_harden_public_schema_rls_and_views fails with
--   relation "public.dd_provider_service_reconciliation" does not exist; no source file
--   creates it or dd_division_reconciliation_register, and both exist in Production.
-- Omitted on purpose (created by later source migrations, which stay the authority):
--   RLS enablement (20260828234918) and the restrictive deny_anon_all /
--   deny_authenticated_all policies (20260829224427_lock_private_catalog_rls_public_roles).

create table if not exists public.dd_division_reconciliation_register (
  division_code text not null,
  division_name text,
  source_basis text,
  authority_status text default 'PENDING_RECONCILIATION'::text not null,
  master_record_count integer default 0 not null,
  provider_evidence_count integer default 0 not null,
  notes text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint dd_division_reconciliation_register_pkey PRIMARY KEY (division_code)
);

create table if not exists public.dd_provider_service_reconciliation (
  id uuid default gen_random_uuid() not null,
  provider_service_evidence_id uuid not null,
  provider_id uuid,
  provider_code text,
  provider_name text,
  source_service text,
  source_cluster text,
  proposed_division text,
  canonical_service_id uuid,
  canonical_sku text,
  reconciliation_decision text default 'PENDING_RECONCILIATION'::text not null,
  channel_decision text default 'PENDING_RECONCILIATION'::text not null,
  fulfillment_decision text default 'PENDING_RECONCILIATION'::text not null,
  compliance_decision text default 'PENDING_RECONCILIATION'::text not null,
  economics_decision text default 'PENDING_RECONCILIATION'::text not null,
  rationale text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint dd_provider_service_reconcilia_provider_service_evidence_id_key UNIQUE (provider_service_evidence_id),
  constraint dd_provider_service_reconciliation_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_dd_provider_service_reconciliation_canonical ON public.dd_provider_service_reconciliation USING btree (canonical_service_id);

do $$ begin
  alter table public.dd_provider_service_reconciliation add constraint dd_provider_service_reconcili_provider_service_evidence_id_fkey FOREIGN KEY (provider_service_evidence_id) REFERENCES public.dd_provider_service_universe(id) ON DELETE RESTRICT;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.dd_provider_service_reconciliation add constraint dd_provider_service_reconciliation_canonical_service_id_fkey FOREIGN KEY (canonical_service_id) REFERENCES public.dd_master_service_universe(id) ON DELETE RESTRICT;
exception when duplicate_object then null; end $$;

-- Grants: Production relacl on both is {postgres=arwdDxtm, anon=rm, authenticated=arwdDxtm, service_role=arwdDxtm}.
revoke insert, update, delete, truncate, references, trigger on public.dd_division_reconciliation_register, public.dd_provider_service_reconciliation from anon;
