-- Both are named as ongoing "Management" services but were priced/billed as
-- ONETIME, far below real monthly retainer rates (social media management
-- $500-5000/mo market-wide; local SEO management commonly $1000-3000+/mo).
-- Converting to MONTHLY billing at a defensible accessible-entry-tier price.

CREATE TEMP TABLE tmp_corrections (canonical_sku text PRIMARY KEY, price_dollars numeric, billing_cycle text);
INSERT INTO tmp_corrections VALUES
  ('DNI-07A-005', 650, 'MONTHLY'),
  ('DNI-07A-011', 450, 'MONTHLY');

CREATE TEMP TABLE tmp_offer_services AS
SELECT DISTINCT canonical_sku, runtime_service_id FROM dd_governed_service_offers WHERE canonical_sku IN (SELECT canonical_sku FROM tmp_corrections);

UPDATE services s
SET starting_price = t.price_dollars, billing_cycle = t.billing_cycle, updated_at = now()
FROM tmp_corrections t JOIN tmp_offer_services o ON o.canonical_sku = t.canonical_sku
WHERE s.id = o.runtime_service_id;

UPDATE dd_service_pricing_rules r
SET base_price_cents = round(t.price_dollars * 100)::int, billing_cycle = t.billing_cycle, updated_at = now()
FROM tmp_corrections t JOIN tmp_offer_services o ON o.canonical_sku = t.canonical_sku
WHERE r.service_id = o.runtime_service_id AND r.status = 'ACTIVE';

DROP TABLE tmp_offer_services;
DROP TABLE tmp_corrections;
