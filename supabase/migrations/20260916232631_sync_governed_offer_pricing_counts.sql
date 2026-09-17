-- dd_governed_service_offers.pricing_rule_count / priced_channel_count / ch01_a_priced
-- are a denormalized snapshot of dd_service_pricing_rules with no refresh mechanism.
-- 258 of 316 rows had drifted (some undercounted, blocking already-priced services
-- from checkout; some overcounted, showing phantom pricing that no longer exists).
-- This backfills the snapshot from live data and installs a trigger so it can no
-- longer drift going forward.

CREATE OR REPLACE FUNCTION dd_sync_governed_offer_pricing_counts()
RETURNS trigger AS $$
DECLARE
  affected_service_id uuid;
BEGIN
  affected_service_id := COALESCE(NEW.service_id, OLD.service_id);
  UPDATE dd_governed_service_offers o
  SET pricing_rule_count = (SELECT count(*) FROM dd_service_pricing_rules r WHERE r.service_id = affected_service_id AND r.status = 'ACTIVE'),
      priced_channel_count = (SELECT count(DISTINCT channel_code) FROM dd_service_pricing_rules r WHERE r.service_id = affected_service_id AND r.status = 'ACTIVE'),
      ch01_a_priced = EXISTS(SELECT 1 FROM dd_service_pricing_rules r WHERE r.service_id = affected_service_id AND r.status = 'ACTIVE' AND r.channel_code = 'CH01'),
      updated_at = now()
  WHERE o.runtime_service_id = affected_service_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_governed_offer_pricing_counts ON dd_service_pricing_rules;
CREATE TRIGGER trg_sync_governed_offer_pricing_counts
AFTER INSERT OR UPDATE OR DELETE ON dd_service_pricing_rules
FOR EACH ROW EXECUTE FUNCTION dd_sync_governed_offer_pricing_counts();

UPDATE dd_governed_service_offers o
SET pricing_rule_count = sub.rule_count,
    priced_channel_count = sub.channel_count,
    ch01_a_priced = sub.ch01_priced,
    updated_at = now()
FROM (
  SELECT o2.id AS offer_id,
    (SELECT count(*) FROM dd_service_pricing_rules r WHERE r.service_id = o2.runtime_service_id AND r.status='ACTIVE') AS rule_count,
    (SELECT count(DISTINCT channel_code) FROM dd_service_pricing_rules r WHERE r.service_id = o2.runtime_service_id AND r.status='ACTIVE') AS channel_count,
    EXISTS(SELECT 1 FROM dd_service_pricing_rules r WHERE r.service_id = o2.runtime_service_id AND r.status='ACTIVE' AND r.channel_code='CH01') AS ch01_priced
  FROM dd_governed_service_offers o2
) sub
WHERE o.id = sub.offer_id;
