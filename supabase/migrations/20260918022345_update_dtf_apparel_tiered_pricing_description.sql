-- Updates DTF/Heat Press Apparel descriptions with the real tiered volume pricing from the
-- Dani Declares Master Pricebook (June 21, 2026) -- the most disciplined, self-sourced pricing
-- document reviewed this session (it cites its own sources and flags unconfirmed claims rather
-- than overstating them). starting_price stays at $25, matching the real "Single Custom Item"
-- entry-tier price; the tiered batch structure is documented since services.starting_price
-- cannot hold multiple tiers.

UPDATE public.services
SET description = 'Direct-to-film custom apparel printing, fulfilled by Christopher Walker. Real tiered pricing per the Dani Declares Master Pricebook: Single Custom Item $25 setup + $18/item; Small Batch (12 shirts) $300 (100% materials + 50% labor deposit); Standard Batch (24 shirts) $540; Event Merch Batch (50 shirts) $1,050. Extra placements, rush, and blank garments are add-ons.',
    updated_at = now()
WHERE sku IN ('DNI-11A-017', 'DNI-11A-018');
