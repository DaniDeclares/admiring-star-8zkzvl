-- FORENSIC RECOVERY FROM THE PRODUCTION CATALOG (read-only). Not a redesign.
-- Authority: Danielle, 2026-10-02 13:45 UTC (read-only Production catalog recovery into #520).
-- Source: Production project ajxezpczaemunlcmqlgl, pg_catalog read on 2026-10-02.
-- Why: 20260914074109_add_staff_admin_policies_unpoliced_rls_tables creates a policy on
--   public.dd_dani_specials_underwriting_register, which no source file creates. It exists
--   in Production. No rows are recovered.
-- Omitted on purpose: policy staff_admin_all_dd_dani_specials_underwriting_register
--   (created by 20260914074109).

create table if not exists public.dd_dani_specials_underwriting_register (
  id uuid default gen_random_uuid() not null,
  special_id text not null,
  legacy_service_id text not null,
  legacy_name text not null,
  family text,
  market text,
  legacy_price numeric,
  active boolean not null,
  canonical_sku text,
  canonical_name text,
  mapping_status text not null,
  underwriting_status text not null,
  commercial_authority text not null,
  evidence_basis text not null,
  blocker text,
  reviewed_at timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint dd_dani_specials_underwriting_register_special_id_key UNIQUE (special_id),
  constraint dd_dani_specials_underwriting_register_pkey PRIMARY KEY (id)
);
alter table public.dd_dani_specials_underwriting_register enable row level security;

-- Grants: Production relacl is {postgres=arwdDxtm, anon=rm, authenticated=arwdDxtm, service_role=arwdDxtm}.
revoke insert, update, delete, truncate, references, trigger on public.dd_dani_specials_underwriting_register from anon;
