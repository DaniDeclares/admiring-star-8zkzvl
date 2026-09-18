-- A parallel Airtable-based cost-underwriting audit (Business Finance & Capital Ledger /
-- D01 Commercial Approval Audit process) flagged that two live D02 services are priced
-- below their own already-documented internal cost model:
--   - Apartment Turn (DNI-02A-002): price $150 vs modeled cost $170.00 (2.5hrs @ $60/hr Tier 1
--     + $20 supplies) = -$20.00 loss (-13.3%) per job at the posted price.
--   - Commercial Space Reset (DNI-02A-004): price $75 vs modeled cost $100.00 (1.5hrs @ $60/hr
--     Tier 1 + $10 supplies) = -$25.00 loss (-33.3%) per job at the posted price.
-- Verified directly against dd_master_service_universe.margin_economics (not fabricated by
-- the audit) -- both were sitting at commercial_offer_status=SELL_NOW / fulfillment_gate_status
-- =READY, meaning a real customer could have booked either at a guaranteed loss. This does not
-- invent a new price (that would repeat the fabrication problem); it pulls both from checkout
-- until Danielle either raises the price to cover the documented cost or revises the scope,
-- consistent with "the only thing I won't do is what will hurt."

UPDATE public.dd_governed_service_offers
SET commercial_offer_status = 'DO_NOT_SELL',
    offer_basis = offer_basis || ' PULLED 2026-09-18: priced below own documented internal cost model (see dd_master_service_universe.margin_economics) -- verified real loss at posted price, not a fabricated audit finding. Re-enable only after a price increase or scope revision closes the gap.'
WHERE canonical_sku IN ('DNI-02A-002', 'DNI-02A-004');

UPDATE public.dd_master_service_universe
SET conflict_register = coalesce(conflict_register, '') ||
  ' PULLED FROM SELL_NOW 2026-09-18: a parallel Airtable cost-underwriting audit caught this' ||
  ' service selling below its own documented internal cost. Confirmed real against this row''s' ||
  ' own margin_economics field. dd_governed_service_offers.commercial_offer_status set to' ||
  ' DO_NOT_SELL pending a price increase or scope revision.',
  updated_at = now()
WHERE canonical_sku IN ('DNI-02A-002', 'DNI-02A-004');
