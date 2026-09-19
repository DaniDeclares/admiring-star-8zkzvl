create table if not exists public.dd_governed_service_offers (
  id uuid primary key default gen_random_uuid(),
  master_record_id uuid not null references public.dd_master_service_universe(id),
  canonical_sku text not null,
  service_name text not null,
  division text not null,
  commercial_object_type text,
  runtime_service_id uuid references public.services(id),
  pricing_rule_count integer not null default 0,
  market_rule_count integer not null default 0,
  channel_availability_count integer not null default 0,
  authorized_provider_capability_count integer not null default 0,
  priced_channel_count integer not null default 0,
  ch01_a_priced boolean not null default false,
  ch01_b_priced boolean not null default false,
  commercial_offer_status text not null default 'PENDING_RECONCILIATION' check (commercial_offer_status in ('SELL_NOW','INTAKE_ONLY','FULFILLMENT_GATED','DO_NOT_SELL','PENDING_RECONCILIATION')),
  fulfillment_gate_status text not null default 'FULFILLMENT_GATED' check (fulfillment_gate_status in ('READY','FULFILLMENT_GATED','BLOCKED')),
  offer_basis text,
  source_authority text not null default 'MASTER_COMMERCIAL_UNIVERSE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(master_record_id)
);
create index if not exists idx_dd_governed_service_offers_sku on public.dd_governed_service_offers(canonical_sku);
create index if not exists idx_dd_governed_service_offers_status on public.dd_governed_service_offers(commercial_offer_status);
create index if not exists idx_dd_governed_service_offers_division on public.dd_governed_service_offers(division);

insert into public.dd_governed_service_offers (
  master_record_id, canonical_sku, service_name, division, commercial_object_type,
  runtime_service_id, pricing_rule_count, market_rule_count, channel_availability_count,
  authorized_provider_capability_count, priced_channel_count, ch01_a_priced, ch01_b_priced,
  commercial_offer_status, fulfillment_gate_status, offer_basis, source_authority
)
select
  m.id,
  m.canonical_sku,
  m.service_name,
  m.division,
  m.commercial_object_type,
  s.id,
  coalesce(pr.pricing_rule_count,0),
  coalesce(mpr.market_rule_count,0),
  coalesce(ca.channel_availability_count,0),
  coalesce(pc.authorized_provider_capability_count,0),
  coalesce(pr.priced_channel_count,0),
  coalesce(pr.ch01_a_priced,false),
  coalesce(pr.ch01_b_priced,false),
  case
    when coalesce(pr.priced_channel_count,0) > 0 and coalesce(mpr.market_rule_count,0) > 0 then 'SELL_NOW'
    when coalesce(pr.pricing_rule_count,0) > 0 then 'INTAKE_ONLY'
    when m.lifecycle_status in ('INACTIVE','ARCHIVED','DO_NOT_SELL') then 'DO_NOT_SELL'
    else 'PENDING_RECONCILIATION'
  end,
  case when coalesce(pc.authorized_provider_capability_count,0) > 0 then 'READY' else 'FULFILLMENT_GATED' end,
  'Derived non-destructively from Master Service Universe + existing service pricing rules + market commercial rules + channel availability + authorized provider capability counts.',
  'MASTER_COMMERCIAL_UNIVERSE'
from public.dd_master_service_universe m
left join public.services s on s.sku = m.canonical_sku
left join lateral (
  select count(*)::int pricing_rule_count,
         count(distinct channel_code)::int priced_channel_count,
         bool_or(channel_code='CH01' and resident_discount_eligible=false) ch01_a_priced,
         bool_or(channel_code='CH01' and resident_discount_eligible=true) ch01_b_priced
  from public.dd_service_pricing_rules x where x.service_id=s.id and x.status='ACTIVE'
) pr on true
left join lateral (
  select count(*)::int market_rule_count from public.dd_market_service_commercial_rules x where x.service_id=s.id
) mpr on true
left join lateral (
  select count(*)::int channel_availability_count from public.dd_service_channel_availability x where x.service_id=s.id
) ca on true
left join lateral (
  select count(*) filter (where x.is_authorized=true)::int authorized_provider_capability_count from public.dd_provider_capabilities x where x.service_id=s.id
) pc on true
on conflict (master_record_id) do update set
  canonical_sku=excluded.canonical_sku,
  service_name=excluded.service_name,
  division=excluded.division,
  commercial_object_type=excluded.commercial_object_type,
  runtime_service_id=excluded.runtime_service_id,
  pricing_rule_count=excluded.pricing_rule_count,
  market_rule_count=excluded.market_rule_count,
  channel_availability_count=excluded.channel_availability_count,
  authorized_provider_capability_count=excluded.authorized_provider_capability_count,
  priced_channel_count=excluded.priced_channel_count,
  ch01_a_priced=excluded.ch01_a_priced,
  ch01_b_priced=excluded.ch01_b_priced,
  commercial_offer_status=excluded.commercial_offer_status,
  fulfillment_gate_status=excluded.fulfillment_gate_status,
  offer_basis=excluded.offer_basis,
  updated_at=now();