-- FORENSIC RECOVERY FROM THE PRODUCTION CATALOG (read-only). Not a redesign.
-- Authority: Danielle, 2026-10-02 13:45 UTC (read-only Production catalog recovery into #520).
-- Source: Production project ajxezpczaemunlcmqlgl, pg_catalog read on 2026-10-02.
-- Why: 20260914073818_enable_rls_dd_stripe_launch_register alters
--   public.dd_stripe_launch_register, which no source file creates. It exists in Production.
-- Omitted on purpose: RLS + policy staff_admin_select_dd_stripe_launch_register (20260914073818).
-- Holds Stripe object IDs only as columns; no rows or secrets are recovered.

create table if not exists public.dd_stripe_launch_register (
  canonical_sku text not null,
  service_name text not null,
  commercial_status text not null,
  pricing_status text not null,
  fulfillment_status text not null,
  stripe_product_id text,
  stripe_price_id text,
  stripe_payment_link_id text,
  checkout_mode text not null,
  source_authority text not null,
  specials_evidence_status text,
  activation_decision text not null,
  blockers text,
  last_verified_at timestamp with time zone default now() not null,
  constraint dd_stripe_launch_register_pkey PRIMARY KEY (canonical_sku)
);

-- Grants: Production relacl is {postgres=arwdDxtm, anon=rm, authenticated=arwdDxtm, service_role=arwdDxtm}.
revoke insert, update, delete, truncate, references, trigger on public.dd_stripe_launch_register from anon;
