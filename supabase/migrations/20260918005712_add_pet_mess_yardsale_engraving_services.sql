-- Adds 4 genuinely new services identified as real gaps against the live catalog (verified
-- directly, not from reconstructed history) and confirmed by Danielle as work she performs:
--   - Severe Pet Mess Cleaning (Division 01A) -- an upcharge tier above standard/deep
--     cleaning for pet messes beyond normal scope, explicitly excluding regulated biohazard/
--     hazmat remediation (that requires certification DANI does not hold and is referred out).
--   - Yard Sale & Small-Scale Estate Sale Management (Division 01D) -- flat-fee staging and
--     day-of management of a household yard/small estate sale, explicitly excluding
--     professional appraisal/auction/high-value-estate liquidation (a different, specialized
--     business DANI has not confirmed).
--   - Custom Laser Engraving (General Items) and Custom Jewelry & Wearables Engraving
--     (Division 11) -- xTool/laser-based personalization services, scoped as engraving/
--     personalization of client-provided or DANI-provided items, not jewelry design/
--     fabrication (a metalsmithing skill not confirmed).
-- Priced using real market research (see chat) anchored to each division's existing rate
-- ladder. Danielle confirmed she performs all 4, so authorized immediately -- unlike the
-- still-open notary candidates, which remain deliberately unpriced per her standing
-- instruction to provide her own rates for that division specifically.

CREATE TEMP TABLE tmp_new_svcs (
  service_name text PRIMARY KEY,
  canonical_sku text,
  division text,
  service_family text,
  price_dollars numeric,
  capability_key text,
  description text
);

INSERT INTO tmp_new_svcs (service_name, canonical_sku, division, service_family, price_dollars, capability_key, description) VALUES
  ('Severe Pet Mess Cleaning', 'DNI-01A-042', '01', '01A Home & Cleaning', 225, 'CLEANING',
   'Cleaning and odor treatment for pet messes beyond standard cleaning scope (extensive accidents, soiled carpet/flooring, heavy odor). Does not include regulated biohazard remediation, bodily-fluid/crime-scene cleanup, or hazmat-certified decontamination -- those situations are referred to a licensed biohazard remediation company.'),
  ('Yard Sale & Small-Scale Estate Sale Management', 'DNI-01D-017', '01', '01D Household Concierge', 295, 'CONCIERGE',
   'Flat-fee staging, organization, item-pricing guidance and day-of management of a household yard sale or small-scale estate sale. Does not include professional appraisal, antique/collectible valuation, auction services, or buyer-network liquidation of high-value estates -- those are referred to a specialized estate-sale/appraisal company.'),
  ('Custom Laser Engraving', 'DNI-11A-028', '11', 'Creative Design & Production', 45, 'LASER_ENGRAVING',
   'Custom laser engraving on tumblers, cutting boards, nameplates and similar personalized items using client-approved artwork or text; materials and item cost quoted separately unless provided by DANI DECLARES.'),
  ('Custom Jewelry & Wearables Engraving', 'DNI-11A-029', '11', 'Creative Design & Production', 65, 'LASER_ENGRAVING',
   'Custom laser engraving and personalization on jewelry and wearable metal items (rings, bracelets, pendants) using client-approved design; this is engraving/personalization of existing pieces, not jewelry design or fabrication. Materials and item cost quoted separately unless provided by DANI DECLARES.')
;

INSERT INTO public.services (id, name, slug, sku, division_id, service_family, commercial_status, pricing_type, billing_cycle, starting_price, description, resident_discount_eligible, created_at, updated_at)
SELECT gen_random_uuid(), t.service_name, lower(t.canonical_sku), t.canonical_sku, t.division::int, t.service_family, 'CANONICAL_ACTIVE', 'FIXED', 'ONETIME', t.price_dollars, t.description, false, now(), now()
FROM tmp_new_svcs t;

INSERT INTO public.dd_master_service_universe (id, division, service_name, scope, canonical_sku, commercial_object_type, lifecycle_status, source_authority, created_at, updated_at)
SELECT gen_random_uuid(), t.division, t.service_name, t.description, t.canonical_sku, 'SERV', 'CANONICAL_ACTIVE', 'OWNER_CONFIRMED_MARKET_RESEARCH_2026-09-18', now(), now()
FROM tmp_new_svcs t;

INSERT INTO public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT s.id, ch, 'FIXED', round(t.price_dollars * 100)::int, 'USD', 'ONETIME', 'LOCKED', false, 'STANDARD', current_date, 'ACTIVE'
FROM tmp_new_svcs t
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
  'Added 2026-09-18 from a confirmed real catalog gap (verified against live data, not reconstructed history). Priced from real market research anchored to the existing division rate ladder. Danielle confirmed she personally performs this work -- authorized immediately.',
  'OWNER_CONFIRMED_MARKET_RESEARCH_2026-09-18'
FROM tmp_new_svcs t
JOIN public.services s ON s.sku = t.canonical_sku
JOIN public.dd_master_service_universe m ON m.canonical_sku = t.canonical_sku;

INSERT INTO public.dd_provider_capabilities (provider_org_id, provider_id, service_id, service_line, capability_key, is_authorized, tier_availability)
SELECT '19c10267-898f-4c10-a25e-186f6aff8771', 'acba894f-a8c7-4156-b981-fa08acc9e65b', s.id, t.service_name, t.capability_key, true, '{}'::jsonb
FROM tmp_new_svcs t
JOIN public.services s ON s.sku = t.canonical_sku;

DROP TABLE tmp_new_svcs;
