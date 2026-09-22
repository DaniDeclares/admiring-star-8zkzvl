begin;

-- Historical baseline recovered from the production schema on 2026-09-22.
-- This migration restores repository replayability only; it does not seed production data.
create table if not exists public.dd_governed_commercial_offers (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null unique references public.services(id),
  canonical_sku text not null,
  service_name text not null,
  offer_status text not null,
  customer_price_cents integer,
  pricing_model text,
  channel_scope text[] not null default '{}'::text[],
  subchannel_scope text[] not null default '{}'::text[],
  market_scope text[] not null default '{}'::text[],
  buyer_scope text[] not null default '{}'::text[],
  pricing_evidence_count integer not null default 0,
  channel_evidence_count integer not null default 0,
  customer_routing_count integer not null default 0,
  fulfillment_gate text not null,
  compliance_gate text not null,
  sop_gate text not null,
  economics_gate text not null,
  dispatch_status text not null default 'FAIL_CLOSED',
  authority_source text not null default 'services + pricing/channel/routing controls',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

commit;
