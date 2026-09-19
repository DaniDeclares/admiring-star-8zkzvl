-- Task #35: Christopher Walker's DTF/Heat-Press services (DNI-11A-017/018) have been live since
-- this morning with zero materials/press-time/payout cost basis anywhere. Builds a DRAFT cost
-- model for the one cleanly-computable part of the real tiered price (the Single Custom Item:
-- $25 setup + $18/item) using real, sourced 2026 market data for DTF consumables (small-to-medium
-- chest-print transfer consumables run $0.45-$8 depending on design size, per 2026 DTF industry
-- cost guides -- WebSearch: ninjatransfers.com, wemust.com, bestpricedtf.com, craftstrack.app) and
-- the same real Tier 1 ($60/hr, hands-on production work) labor rate already established this
-- session. The service's own description explicitly states blank garments are billed as a
-- separate add-on, NOT included in the $18/item price -- so garment cost is correctly excluded
-- here, not omitted by mistake.
--
-- IMPORTANT LIMITATION, documented rather than guessed around: the batch tiers (Small Batch $300,
-- Standard Batch $540, Event Merch Batch $1,050) are explicitly described as a "100% materials +
-- 50% labor DEPOSIT" structure, not a flat per-item price -- the remaining labor is billed
-- separately on completion, at an amount not captured in any visible field. Computing a per-item
-- margin for the batch tiers from the deposit amount alone would be misleading, so this migration
-- intentionally does NOT attempt one; only the single-item tier (an unambiguous flat setup + per-
-- item fee) gets a draft cost model.

UPDATE public.dd_master_service_universe
SET internal_cost = 'DRAFT (Single Custom Item tier only -- see conflict_register for why batch tiers are not modeled here): Setup ~20 min @ $60/hr (Tier 1, file prep/positioning) = $20.00. Per-item: DTF transfer consumable ~$1.50 (2026 market range $0.45-$8 depending on design size/placement; blank garment is explicitly a separate add-on per this service''s own description, correctly excluded) + ~5 min press/peel/QA labor @ $60/hr = $5.00 = $6.50/item direct cost.',
    margin_economics = 'DRAFT: Setup $25.00 - $20.00 cost = $5.00 (20.0%) margin on setup, THIN. Per-item: $18.00 - $6.50 draft cost = $11.50 (63.9%) margin, healthy -- but consumable cost assumes a small-to-medium design; a large placement could push actual cost materially higher. Batch tiers (Small/Standard/Event Merch) are NOT modeled here -- they are a materials+partial-labor deposit structure, not a flat per-item price, and a defensible per-item margin cannot be computed without the real remaining-labor billing amount.',
    conflict_register = coalesce(conflict_register, '') || ' DRAFT COST MODEL 2026-09-18 (single-item tier only): real market-sourced consumable range + Tier 1 labor rate. Batch tiers intentionally left unmodeled -- their "100% materials + 50% labor deposit" structure means the visible $300/$540/$1050 figures are not comparable to a flat per-item price; needs Christopher''s or Danielle''s real remaining-labor billing figures before those tiers can be honestly cost-modeled.',
    updated_at = now()
WHERE canonical_sku IN ('DNI-11A-017', 'DNI-11A-018');
