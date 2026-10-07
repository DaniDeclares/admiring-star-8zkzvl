-- FORENSIC RECOVERY FROM THE PRODUCTION CATALOG (read-only). Not a redesign.
-- Authority: Danielle, 2026-10-02 13:45 UTC (read-only Production catalog recovery into #520).
-- Source: Production project ajxezpczaemunlcmqlgl, pg_catalog read on 2026-10-02.
-- Why: 20260830025610_harden_governance_access_and_fk_indexes alters
--   public.dd_governed_commercial_offers, which no source file creates. It exists in Production.
-- Omitted on purpose (source stays the authority): RLS enablement and grants (20260830025610).
-- Included: policy staff_admin_select_dd_governed_commercial_offers, which exists in
--   Production and is created by no source file.

create table if not exists public.dd_governed_commercial_offers (
  id uuid default gen_random_uuid() not null,
  service_id uuid not null,
  canonical_sku text not null,
  service_name text not null,
  offer_status text not null,
  customer_price_cents integer,
  pricing_model text,
  channel_scope text[] default '{}'::text[] not null,
  subchannel_scope text[] default '{}'::text[] not null,
  market_scope text[] default '{}'::text[] not null,
  buyer_scope text[] default '{}'::text[] not null,
  pricing_evidence_count integer default 0 not null,
  channel_evidence_count integer default 0 not null,
  customer_routing_count integer default 0 not null,
  fulfillment_gate text not null,
  compliance_gate text not null,
  sop_gate text not null,
  economics_gate text not null,
  dispatch_status text default 'FAIL_CLOSED'::text not null,
  authority_source text default 'services + pricing/channel/routing controls'::text not null,
  notes text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint dd_governed_commercial_offers_service_id_key UNIQUE (service_id),
  constraint dd_governed_commercial_offers_pkey PRIMARY KEY (id)
);

do $$ begin
  alter table public.dd_governed_commercial_offers add constraint dd_governed_commercial_offers_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy staff_admin_select_dd_governed_commercial_offers on public.dd_governed_commercial_offers as permissive for select to authenticated using ((EXISTS ( SELECT 1
     FROM dd_portal_identities pi
    WHERE ((pi.auth_user_id = auth.uid()) AND (pi.is_active = true) AND (pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text]))))));
exception when duplicate_object then null; end $$;
