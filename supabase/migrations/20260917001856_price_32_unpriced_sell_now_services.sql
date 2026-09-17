CREATE TEMP TABLE tmp_new_prices (
  canonical_sku text PRIMARY KEY,
  price_dollars numeric,
  pricing_type text,
  billing_cycle text,
  resident_discount_eligible boolean
);

INSERT INTO tmp_new_prices (canonical_sku, price_dollars, pricing_type, billing_cycle, resident_discount_eligible) VALUES
  ('DNI-01A-036', 65,  'FIXED',          'ONETIME', true),
  ('DNI-01A-038', 75,  'FIXED',          'ONETIME', true),
  ('DNI-01A-041', 65,  'FIXED',          'ONETIME', true),
  ('DNI-01A-037', 125, 'FIXED',          'ONETIME', true),
  ('DNI-01A-026', 45,  'FIXED',          'ONETIME', true),
  ('DNI-01D-005', 125, 'FIXED',          'ONETIME', true),
  ('DNI-01D-006', 55,  'FIXED',          'ONETIME', true),
  ('DNI-01B-001', 30,  'FIXED',          'ONETIME', true),
  ('DNI-01B-002', 30,  'FIXED',          'ONETIME', true),
  ('DNI-01B-003', 25,  'FIXED',          'ONETIME', true),
  ('DNI-01B-004', 45,  'FIXED',          'ONETIME', true),
  ('DNI-01B-005', 35,  'FIXED',          'ONETIME', true),
  ('DNI-01B-006', 45,  'FIXED',          'ONETIME', true),
  ('DNI-01B-007', 40,  'FIXED',          'ONETIME', true),
  ('DNI-01B-009', 75,  'FIXED',          'ONETIME', true),
  ('DNI-01B-010', 95,  'FIXED',          'ONETIME', true),
  ('DNI-04A-024', 275, 'FIXED',          'ONETIME', false),
  ('DNI-04A-025', 250, 'FIXED',          'ONETIME', false),
  ('DNI-09A-021', 199, 'FIXED',          'ONETIME', false),
  ('DNI-09A-022', 249, 'FIXED',          'ONETIME', false),
  ('DNI-09A-023', 299, 'FIXED',          'ONETIME', false),
  ('DNI-09A-025', 299, 'FIXED',          'ONETIME', false),
  ('DNI-12A-021', 145, 'FIXED',          'ONETIME', false),
  ('DNI-01G-001', 149, 'FIXED',          'MONTHLY', true),
  ('DNI-04A-023', 400, 'FIXED',          'MONTHLY', false),
  ('DNI-04A-026', 350, 'FIXED',          'MONTHLY', false),
  ('DNI-09A-024', 249, 'FIXED',          'MONTHLY', false),
  ('DNI-01D-001', 60,  'VARIABLE_QUOTE', 'HOURLY',  true),
  ('DNI-01E-001', 65,  'VARIABLE_QUOTE', 'HOURLY',  true),
  ('DNI-01F-001', 65,  'VARIABLE_QUOTE', 'HOURLY',  true),
  ('DNI-01A-040', 55,  'VARIABLE_QUOTE', 'HOURLY',  true),
  ('DNI-10A-021', 175, 'VARIABLE_QUOTE', 'ONETIME', false)
;

CREATE TEMP TABLE tmp_offer_services AS
SELECT DISTINCT canonical_sku, runtime_service_id FROM dd_governed_service_offers WHERE canonical_sku IN (SELECT canonical_sku FROM tmp_new_prices);

UPDATE services s
SET starting_price = t.price_dollars,
    pricing_type = t.pricing_type,
    billing_cycle = t.billing_cycle,
    resident_discount_eligible = t.resident_discount_eligible,
    updated_at = now()
FROM tmp_new_prices t
JOIN tmp_offer_services o ON o.canonical_sku = t.canonical_sku
WHERE s.id = o.runtime_service_id;

INSERT INTO dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT o.runtime_service_id, ch.channel_code, t.pricing_type, round(t.price_dollars * 100)::int, 'USD', t.billing_cycle, 'LOCKED', t.resident_discount_eligible, 'STANDARD', current_date, 'ACTIVE'
FROM tmp_new_prices t
JOIN tmp_offer_services o ON o.canonical_sku = t.canonical_sku
CROSS JOIN (VALUES ('CH01'), ('CH02'), ('CH03'), ('CH04'), ('CH05')) AS ch(channel_code);

DROP TABLE tmp_offer_services;
DROP TABLE tmp_new_prices;
