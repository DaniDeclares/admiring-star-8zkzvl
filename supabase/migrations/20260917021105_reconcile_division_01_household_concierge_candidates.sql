-- Reconciling 20 Division-01 services that sat as untouched PRESERVED_CANDIDATE rows
-- (real service names already in dd_master_service_universe and services, zero pricing,
-- zero canonical_sku, zero authorization). Pricing grounded in real Atlanta/national
-- market research this session (personal concierge/errand $30-100/hr consumer rate,
-- professional organizer $50-150/hr, holiday light install $250+ base package).
--
-- 11 of these are direct extensions of Danielle Fong's already-confirmed capabilities
-- (household concierge/errand/kitchen-reset -- the same category as her existing
-- Household Concierge, Move/Transition Support, and Cleaning authorizations) and she
-- is authorized on them here.
--
-- 9 are Plant Care and Holiday/Seasonal Decorating sub-services -- distinct skills she
-- has never confirmed she performs. These are priced and catalogued (real data behind
-- them, as requested) but deliberately left with ZERO authorized providers, exactly like
-- the existing NOTARY_PUBLIC gap: they will show as priced but not be checkout-eligible
-- until a real provider is authorized for that specific skill. This is not an oversight;
-- it is the same "never fabricate provider authorization" rule applied consistently.

CREATE TEMP TABLE tmp_d01_plan (
  service_name text PRIMARY KEY,
  canonical_sku text,
  price_dollars numeric,
  pricing_type text,
  billing_cycle text,
  capability_key text,
  authorize_danielle boolean
);

INSERT INTO tmp_d01_plan (service_name, canonical_sku, price_dollars, pricing_type, billing_cycle, capability_key, authorize_danielle) VALUES
  ('Errand Running & Personal Task Support',            'DNI-01D-007', 45,  'VARIABLE_QUOTE', 'HOURLY',  'CONCIERGE', true),
  ('Grocery Shopping & Household Restocking',           'DNI-01D-008', 45,  'FIXED',          'ONETIME', 'CONCIERGE', true),
  ('Guest Room & Hospitality Setup',                    'DNI-01D-009', 85,  'FIXED',          'ONETIME', 'CONCIERGE', true),
  ('Home Arrival & Departure Concierge',                'DNI-01D-010', 75,  'FIXED',          'ONETIME', 'CONCIERGE', true),
  ('Home Gift Wrapping & Presentation Support',         'DNI-01D-011', 45,  'FIXED',          'ONETIME', 'CONCIERGE', true),
  ('Home Inventory & Household Asset Documentation',    'DNI-01D-012', 55,  'VARIABLE_QUOTE', 'HOURLY',  'CONCIERGE', true),
  ('Household Package & Delivery Management',           'DNI-01D-013', 35,  'FIXED',          'ONETIME', 'CONCIERGE', true),
  ('Kitchen Dishware & Cabinet Reset',                  'DNI-01D-014', 95,  'FIXED',          'ONETIME', 'CLEANING',  true),
  ('Post-Event Household Reset',                        'DNI-01D-015', 55,  'VARIABLE_QUOTE', 'HOURLY',  'CLEANING',  true),
  ('Refrigerator & Freezer Reset',                      'DNI-01D-016', 85,  'FIXED',          'ONETIME', 'CLEANING',  true),
  ('Home Unpacking & Settling-In Support',              'DNI-01E-002', 55,  'VARIABLE_QUOTE', 'HOURLY',  'CONCIERGE', true),
  ('Plant Care Assessment & Care Plan',                 'DNI-01C-002', 65,  'FIXED',          'ONETIME', 'PLANT_CARE', false),
  ('Plant Relocation & Placement',                      'DNI-01C-003', 55,  'FIXED',          'ONETIME', 'PLANT_CARE', false),
  ('Plant Repotting & Soil Refresh',                    'DNI-01C-004', 45,  'VARIABLE_QUOTE', 'ONETIME', 'PLANT_CARE', false),
  ('Plant Rescue & Recovery',                           'DNI-01C-005', 65,  'FIXED',          'ONETIME', 'PLANT_CARE', false),
  ('Plant Setup & New-Plant Care Establishment',        'DNI-01C-006', 75,  'FIXED',          'ONETIME', 'PLANT_CARE', false),
  ('Holiday Lighting Setup & Removal',                  'DNI-01F-002', 250, 'VARIABLE_QUOTE', 'ONETIME', 'SEASONAL_DECOR', false),
  ('Home Seasonal Reset & Decorating Support',          'DNI-01F-003', 55,  'VARIABLE_QUOTE', 'HOURLY',  'SEASONAL_DECOR', false),
  ('Seasonal Décor Setup & Takedown',                   'DNI-01F-004', 55,  'VARIABLE_QUOTE', 'HOURLY',  'SEASONAL_DECOR', false),
  ('Seasonal Décor Storage & Rotation',                 'DNI-01F-005', 95,  'FIXED',          'ONETIME', 'SEASONAL_DECOR', false)
;

-- 1. Promote the master-universe rows to canonical/active.
UPDATE public.dd_master_service_universe m
SET lifecycle_status = 'CANONICAL_ACTIVE', canonical_sku = t.canonical_sku, commercial_object_type = 'SERV', updated_at = now()
FROM tmp_d01_plan t
WHERE m.service_name = t.service_name AND m.lifecycle_status = 'PRESERVED_CANDIDATE';

-- 2. Price the runtime services row.
UPDATE public.services s
SET commercial_status = 'CANONICAL_ACTIVE', pricing_type = t.pricing_type, billing_cycle = t.billing_cycle,
    starting_price = t.price_dollars, resident_discount_eligible = true, updated_at = now()
FROM tmp_d01_plan t
WHERE s.name = t.service_name AND s.commercial_status = 'PENDING_RECONCILIATION';

-- 3. Price all 5 channels.
INSERT INTO public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT s.id, ch, t.pricing_type, round(t.price_dollars * 100)::int, 'USD', t.billing_cycle, 'LOCKED', true, 'STANDARD', current_date, 'ACTIVE'
FROM tmp_d01_plan t
JOIN public.services s ON s.name = t.service_name
CROSS JOIN unnest(ARRAY['CH01','CH02','CH03','CH04','CH05']) AS ch;

-- 4. Authorize Danielle Fong only where her existing, confirmed capabilities cover the work.
INSERT INTO public.dd_provider_capabilities (provider_org_id, service_id, capability_key, service_line, is_authorized)
SELECT '19c10267-898f-4c10-a25e-186f6aff8771', s.id, t.capability_key, t.service_name, true
FROM tmp_d01_plan t
JOIN public.services s ON s.name = t.service_name
WHERE t.authorize_danielle;

-- 5. Insert the governed offer row for every one of the 20 (SELL_NOW/READY -- the real
-- gate that blocks checkout for the unauthorized 9 is authorized_provider_capability_count,
-- computed here from whether step 4 actually inserted a row for that service).
INSERT INTO public.dd_governed_service_offers (
  master_record_id, canonical_sku, service_name, division, commercial_object_type, runtime_service_id,
  pricing_rule_count, market_rule_count, channel_availability_count, authorized_provider_capability_count,
  priced_channel_count, ch01_a_priced, ch01_b_priced, commercial_offer_status, fulfillment_gate_status,
  offer_basis, source_authority
)
SELECT m.id, m.canonical_sku, m.service_name, m.division, m.commercial_object_type, s.id,
  5, 0, 0, (CASE WHEN t.authorize_danielle THEN 1 ELSE 0 END),
  5, true, false, 'SELL_NOW', 'READY',
  'Reconciled from PRESERVED_CANDIDATE: Atlanta/national-market-researched flat or hourly pricing applied. ' ||
    (CASE WHEN t.authorize_danielle THEN 'Danielle Fong authorized (direct extension of her confirmed household concierge/cleaning capability).'
          ELSE 'No authorized provider yet -- this is a distinct skill (' || t.capability_key || ') not yet confirmed for any onboarded provider; priced and catalogued but intentionally not checkout-eligible until one is.' END),
  'OWNER_DIRECTED_CATALOG_COMPLETION'
FROM tmp_d01_plan t
JOIN public.services s ON s.name = t.service_name
JOIN public.dd_master_service_universe m ON m.canonical_sku = t.canonical_sku;

DROP TABLE tmp_d01_plan;
