-- 20 SELL_NOW services were priced on only 1 of 5 channels (17 Division-01
-- detail tasks priced CH01-only, 2 bookkeeping services + 1 carrier
-- back-office service priced CH04-only) despite comparable services in the
-- same division already being priced identically across all 5 channels.
-- Extending each to the missing channels at the same price/terms as its
-- existing row, so Property Management/Real Estate/Business/Government
-- buyers can book the same work residents already can.

INSERT INTO dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT r.service_id, ch.channel_code, r.pricing_type, r.base_price_cents, r.currency, r.billing_cycle, r.lock_status, r.resident_discount_eligible, r.tax_class, current_date, 'ACTIVE'
FROM dd_service_pricing_rules r
JOIN dd_governed_service_offers o ON o.runtime_service_id = r.service_id
CROSS JOIN (VALUES ('CH01'), ('CH02'), ('CH03'), ('CH04'), ('CH05')) AS ch(channel_code)
WHERE r.status = 'ACTIVE'
  AND o.commercial_offer_status = 'SELL_NOW'
  AND o.canonical_sku IN (
    SELECT o2.canonical_sku FROM dd_governed_service_offers o2
    JOIN dd_service_pricing_rules r2 ON r2.service_id = o2.runtime_service_id AND r2.status='ACTIVE'
    GROUP BY o2.canonical_sku HAVING count(DISTINCT r2.channel_code) = 1
  )
  AND NOT EXISTS (
    SELECT 1 FROM dd_service_pricing_rules existing
    WHERE existing.service_id = r.service_id AND existing.channel_code = ch.channel_code AND existing.status='ACTIVE'
  );
