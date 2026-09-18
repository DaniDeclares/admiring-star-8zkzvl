-- Prices and authorizes all 7 remaining Division 05 notary candidates that were deliberately
-- left unpriced pending Danielle's own real rates (per her standing instruction that notary
-- market research has been unreliable and she'd provide her own numbers). Two real sources now
-- exist:
--   1. A real, signed "Exclusive Notary Service Agreement" + addendum between Dani Declares LLC
--      and an actual client (Estate Plan Greenville), executed 08/27/2025. Real contracted
--      rates: Trust/Loan Signing Fee $150/appointment (explicitly covers "Trust and Estate
--      Signings"), POA Documents $25/appointment.
--   2. Real historical rates Danielle has charged, found in her own Google Drive documents
--      earlier this session: Apostille $175, Vehicle Title/DMV notarization $50.
-- Mapped as: Loan Modification/Refinance & HELOC/Reverse Mortgage/Estate Planning Document
-- Signing -> $150 (same real Trust/Loan/Estate Signing Fee); Power of Attorney & Advance
-- Directive Signing -> $25 (real contracted POA rate, superseding an earlier $35 Drive figure
-- since this is the more current, actually-contracted number); Apostille & Authentication
-- Assistance -> $175; Vehicle Title & DMV Document Notarization -> $50. All authorized
-- immediately to Danielle (NOTARY_COMMISSIONED), consistent with her existing 20 live Division
-- 05 notary services.

CREATE TEMP TABLE tmp_notary_pricing (
  service_name text PRIMARY KEY,
  canonical_sku text,
  price_dollars numeric,
  source_note text
);

INSERT INTO tmp_notary_pricing (service_name, canonical_sku, price_dollars, source_note) VALUES
  ('Loan Modification Signing Support', 'DNI-05A-021', 150, 'Real signed Estate Plan Greenville contract: Trust/Loan Signing Fee $150/appointment'),
  ('Refinance & HELOC Signing Support', 'DNI-05A-022', 150, 'Real signed Estate Plan Greenville contract: Trust/Loan Signing Fee $150/appointment'),
  ('Reverse Mortgage Signing Support', 'DNI-05A-023', 150, 'Real signed Estate Plan Greenville contract: Trust/Loan Signing Fee $150/appointment (same loan-signing category)'),
  ('Estate Planning Document Signing', 'DNI-05A-024', 150, 'Real signed Estate Plan Greenville contract explicitly covers Trust AND Estate Signings at $150/appointment'),
  ('Apostille & Authentication Assistance', 'DNI-05A-025', 175, 'Real historical rate Danielle has charged, found in her Google Drive pricing documents'),
  ('Vehicle Title & DMV Document Notarization', 'DNI-05A-026', 50, 'Real historical rate Danielle has charged, found in her Google Drive pricing documents'),
  ('Power of Attorney & Advance Directive Signing', 'DNI-05A-027', 25, 'Real signed Estate Plan Greenville contract: POA Documents $25/appointment (supersedes earlier $35 Drive estimate as the actual contracted rate)')
;

UPDATE public.dd_master_service_universe m
SET lifecycle_status = 'CANONICAL_ACTIVE',
    canonical_sku = t.canonical_sku,
    source_authority = 'OWNER_REAL_CONTRACT_AND_HISTORICAL_RATES_2026-09-18',
    updated_at = now()
FROM tmp_notary_pricing t
WHERE m.service_name = t.service_name AND m.division = '05' AND m.lifecycle_status = 'PRESERVED_CANDIDATE';

INSERT INTO public.services (id, name, slug, sku, division_id, service_family, commercial_status, pricing_type, billing_cycle, starting_price, description, resident_discount_eligible, created_at, updated_at)
SELECT gen_random_uuid(), t.service_name, lower(t.canonical_sku), t.canonical_sku, 5, '05A Notary & Signing Services', 'CANONICAL_ACTIVE', 'FIXED', 'ONETIME', t.price_dollars,
  t.service_name || ' -- priced from real Dani Declares rates: ' || t.source_note || '.', false, now(), now()
FROM tmp_notary_pricing t;

INSERT INTO public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT s.id, ch, 'FIXED', round(t.price_dollars * 100)::int, 'USD', 'ONETIME', 'LOCKED', false, 'STANDARD', current_date, 'ACTIVE'
FROM tmp_notary_pricing t
JOIN public.services s ON s.sku = t.canonical_sku
CROSS JOIN unnest(ARRAY['CH01','CH02','CH03','CH04','CH05']) AS ch;

INSERT INTO public.dd_governed_service_offers (
  master_record_id, canonical_sku, service_name, division, commercial_object_type, runtime_service_id,
  pricing_rule_count, market_rule_count, channel_availability_count, authorized_provider_capability_count,
  priced_channel_count, ch01_a_priced, ch01_b_priced, commercial_offer_status, fulfillment_gate_status,
  offer_basis, source_authority
)
SELECT m.id, m.canonical_sku, m.service_name, m.division, m.commercial_object_type, s.id,
  5, 0, 0, 1,
  5, true, false, 'SELL_NOW', 'READY',
  'Priced 2026-09-18 from real Dani Declares rates (signed client contract and historical Drive rates), per owner instruction to use her own real numbers for notary pricing rather than market research.',
  'OWNER_REAL_CONTRACT_AND_HISTORICAL_RATES_2026-09-18'
FROM tmp_notary_pricing t
JOIN public.services s ON s.sku = t.canonical_sku
JOIN public.dd_master_service_universe m ON m.canonical_sku = t.canonical_sku;

INSERT INTO public.dd_provider_capabilities (provider_org_id, provider_id, service_id, service_line, capability_key, is_authorized, tier_availability)
SELECT '19c10267-898f-4c10-a25e-186f6aff8771', 'acba894f-a8c7-4156-b981-fa08acc9e65b', s.id, t.service_name, 'NOTARY_COMMISSIONED', true, '{}'::jsonb
FROM tmp_notary_pricing t
JOIN public.services s ON s.sku = t.canonical_sku;

DROP TABLE tmp_notary_pricing;
