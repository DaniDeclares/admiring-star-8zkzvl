-- Applies a real, dated, owner-approved pricing decision that never reached the live catalog.
-- Airtable's "04 Service Economics" table has 20 records explicitly dated 2026-09-02 and labeled
-- "OWNER-APPROVED D04 PRICING LOCK" -- a real customer-price decision Danielle already approved
-- five days before this session started -- but services.starting_price for these exact 20 SKUs
-- was still showing older, much lower numbers (e.g. Virtual Assistant locked at $149, live at
-- $45; Vendor Administration locked at $275, live at $85). This is not a new price being invented
-- here -- it is fixing a real sync failure between an already-made decision and the live system,
-- the same category of fix as the earlier D02/D03 NULL-channel-price backfill. Surfaced by the
-- background pass that built Division 04's draft cost model
-- (20260918122223_division_04_draft_cost_model_tiered_labor_rates.sql), which correctly declined
-- to resolve it itself and flagged it for a human decision instead.
--
-- Updates: services.starting_price to the real locked value; propagates into
-- dd_service_pricing_rules.base_price_cents across all 5 channels (avoiding the stale-price-row
-- bug found and fixed earlier today); recomputes margin_economics against the corrected price
-- using the exact same hours/tier basis the prior migration already established, since the
-- negative-looking draft margins it reported were an artifact of comparing real cost against the
-- stale price, not a real problem with the cost model itself.

CREATE TEMP TABLE tmp_d04_lock (
  canonical_sku text PRIMARY KEY, new_price numeric, est_hours numeric, tier int
);
INSERT INTO tmp_d04_lock (canonical_sku, new_price, est_hours, tier) VALUES
  ('DNI-04A-001', 149,  1,   2),
  ('DNI-04A-002', 275,  2,   2),
  ('DNI-04A-003', 129,  1,   2),
  ('DNI-04A-004', 129,  1,   2),
  ('DNI-04A-005', 129,  1,   2),
  ('DNI-04A-006', 179,  1.5, 2),
  ('DNI-04A-007', 139,  1,   2),
  ('DNI-04A-008', 225,  1.5, 2),
  ('DNI-04A-009', 225,  1.5, 3),
  ('DNI-04A-010', 275,  1.5, 3),
  ('DNI-04A-011', 425,  3,   3),
  ('DNI-04A-012', 550,  4,   3),
  ('DNI-04A-013', 425,  3,   3),
  ('DNI-04A-014', 475,  3,   3),
  ('DNI-04A-015', 275,  2,   2),
  ('DNI-04A-016', 129,  1,   2),
  ('DNI-04A-017', 275,  2,   2),
  ('DNI-04A-018', 275,  2,   2),
  ('DNI-04A-019', 325,  2,   3),
  ('DNI-04A-020', 1095, 8,   3)
;

UPDATE public.services s
SET starting_price = t.new_price
FROM tmp_d04_lock t
WHERE s.sku = t.canonical_sku;

UPDATE public.dd_service_pricing_rules r
SET base_price_cents = round(t.new_price * 100)::int
FROM tmp_d04_lock t
JOIN public.services s ON s.sku = t.canonical_sku
WHERE r.service_id = s.id;

UPDATE public.dd_master_service_universe m
SET internal_cost = format('%s hrs @ $%s/hr (Tier %s) = $%s.',
    t.est_hours, to_char((CASE t.tier WHEN 1 THEN 60 WHEN 2 THEN 75 ELSE 90 END), 'FM999990'), t.tier,
    to_char(t.est_hours * (CASE t.tier WHEN 1 THEN 60 WHEN 2 THEN 75 ELSE 90 END), 'FM999999990.00')),
  margin_economics = format('RESOLVED 2026-09-18: price corrected to the real 2026-09-02 owner-approved lock ($%s), replacing the stale live figure this SKU previously showed. Draft cost basis unchanged: $%s - $%s cost = $%s (%s%%). Still a draft hour estimate, not an audited figure, but the PRICE itself is now real and owner-approved, not stale.',
    to_char(t.new_price, 'FM999999990.00'),
    to_char(t.new_price, 'FM999999990.00'),
    to_char(t.est_hours * (CASE t.tier WHEN 1 THEN 60 WHEN 2 THEN 75 ELSE 90 END), 'FM999999990.00'),
    to_char(t.new_price - (t.est_hours * (CASE t.tier WHEN 1 THEN 60 WHEN 2 THEN 75 ELSE 90 END)), 'FM999999990.00'),
    to_char(round(((t.new_price - (t.est_hours * (CASE t.tier WHEN 1 THEN 60 WHEN 2 THEN 75 ELSE 90 END))) / nullif(t.new_price,0)) * 100, 1), 'FM999990.0')
  ),
  conflict_register = coalesce(conflict_register, '') || ' PRICE SYNCED 2026-09-18: live services.starting_price corrected to match the real 2026-09-02 owner-approved lock. Was previously showing a stale, much lower figure.',
  updated_at = now()
FROM tmp_d04_lock t
WHERE m.canonical_sku = t.canonical_sku;

DROP TABLE tmp_d04_lock;
