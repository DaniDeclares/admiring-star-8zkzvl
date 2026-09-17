-- Standard Maintenance Cleaning was priced well below the real Atlanta market
-- average ($187, range $130-252) -- raising to a defensible value-tier price.
-- Plant Care was priced as a one-time $149 task, well above real per-visit
-- rates ($20-90); converting it to a monthly recurring program instead, which
-- both matches how plant care is actually consumed and lands mid-range on
-- real monthly plant-care program pricing ($100-600/mo).

CREATE TEMP TABLE tmp_corrections (canonical_sku text PRIMARY KEY, price_dollars numeric, pricing_type text, billing_cycle text);
INSERT INTO tmp_corrections VALUES
  ('DNI-01A-001', 140, 'FIXED', 'ONETIME'),
  ('DNI-01C-001', 89,  'FIXED', 'MONTHLY');

CREATE TEMP TABLE tmp_offer_services AS
SELECT DISTINCT canonical_sku, runtime_service_id FROM dd_governed_service_offers WHERE canonical_sku IN (SELECT canonical_sku FROM tmp_corrections);

UPDATE services s
SET starting_price = t.price_dollars, pricing_type = t.pricing_type, billing_cycle = t.billing_cycle, updated_at = now()
FROM tmp_corrections t JOIN tmp_offer_services o ON o.canonical_sku = t.canonical_sku
WHERE s.id = o.runtime_service_id;

UPDATE dd_service_pricing_rules r
SET base_price_cents = round(t.price_dollars * 100)::int, pricing_type = t.pricing_type, billing_cycle = t.billing_cycle, updated_at = now()
FROM tmp_corrections t JOIN tmp_offer_services o ON o.canonical_sku = t.canonical_sku
WHERE r.service_id = o.runtime_service_id AND r.status = 'ACTIVE';

DROP TABLE tmp_offer_services;
DROP TABLE tmp_corrections;
