-- Builds a DRAFT cost/margin model for all 20 canonical, SKU-bearing Division 13 services
-- (DNI-13A-001..020; 021-025 have no live services row and are out of scope), using the same
-- Tier 1/2/3 labor-rate methodology established for Division 08/04 this session:
--   Tier 1 ($60/hr) hands-on field/routine work -- not used (no field labor in this division)
--   Tier 2 ($75/hr) coordination/QA work -- routine, mechanical tracking/document handling
--   Tier 3 ($90/hr) strategic/consulting work -- 2026 market research, $75-150/hr entry tier
--     for general small-business consulting; PROVISIONAL, not an audited company rate.
-- Tier assignment per SKU below is this pass's own judgment call, applying the rule "Tier 3
-- unless clearly hands-on field work (Tier 1) or clearly coordination/QA (Tier 2)."
--
-- No Airtable "04 Service Economics" table records exist for any DNI-13A-* SKU (confirmed via
-- filtered query returning zero rows), so every hour estimate below is this migration's own
-- reasonable planning assumption -- NOT an audited company figure -- exactly as flagged for
-- Division 08's Tier 3 pass. No price is second-guessed or changed; live services.starting_price
-- is used as-is. Nothing is pulled from SELL_NOW regardless of the resulting draft margin.

CREATE TEMP TABLE tmp_d13_econ (
  canonical_sku text PRIMARY KEY, est_hours numeric, tier int, notes text
);
INSERT INTO tmp_d13_econ (canonical_sku, est_hours, tier, notes) VALUES
  ('DNI-13A-001', 5.0,  3, 'SAM.gov registration readiness: info compilation + document checklist + field-by-field review.'),
  ('DNI-13A-002', 5.0,  3, 'UEI/CAGE readiness: document compilation + application review.'),
  ('DNI-13A-003', 4.5,  3, 'Government vendor profile setup, one portal.'),
  ('DNI-13A-004', 3.5,  3, 'One-page capability statement drafting.'),
  ('DNI-13A-005', 2.5,  3, 'Government market research brief, one market/agency.'),
  ('DNI-13A-006', 3.0,  3, 'NAICS code research and recommendation.'),
  ('DNI-13A-007', 3.0,  3, 'Solicitation research/compilation, one search window.'),
  ('DNI-13A-008', 3.5,  3, 'Bid/no-bid analysis, one solicitation.'),
  ('DNI-13A-009', 6.5,  3, 'Proposal readiness: content/attachment organization for one solicitation.'),
  ('DNI-13A-010', 16.0, 3, 'Full proposal coordination: timeline, sections, compiled submission package.'),
  ('DNI-13A-011', 3.0,  3, 'Vendor registration support, one registration.'),
  ('DNI-13A-012', 3.0,  2, 'Procurement document support: compile/format/checklist one submission.'),
  ('DNI-13A-013', 3.5,  2, 'Contract administration tracking, one contract, one billing period.'),
  ('DNI-13A-014', 3.5,  2, 'Invoice/deliverable tracker maintenance, one contract, one billing period.'),
  ('DNI-13A-015', 4.5,  3, 'Compliance documentation organization against a requirements checklist.'),
  ('DNI-13A-016', 3.5,  2, 'Government reporting support, one report/period.'),
  ('DNI-13A-017', 7.0,  2, 'Institutional janitorial coordination, one facility/contract, one billing period.'),
  ('DNI-13A-018', 13.0, 2, 'Facilities support coordination, one facility/contract, one billing period.'),
  ('DNI-13A-019', 7.0,  2, 'Administrative support contract execution, one workflow, one billing period.'),
  ('DNI-13A-020', 8.5,  3, 'Solicitation-specific coordination: research + document prep + submission logistics.')
;

UPDATE public.dd_master_service_universe m
SET internal_cost = format('DRAFT: %s hrs @ $%s/hr (Tier %s %s, %s) = $%s. Hours are this pass''s own planning estimate (no Airtable "04 Service Economics" record exists for any Division 13 SKU) -- NOT an audited figure. %s',
    t.est_hours,
    (CASE t.tier WHEN 1 THEN 60 WHEN 2 THEN 75 ELSE 90 END),
    t.tier,
    (CASE t.tier WHEN 1 THEN 'Field/Routine' WHEN 2 THEN 'Coordination/QA' ELSE 'Strategic/Consulting' END),
    (CASE WHEN t.tier = 3 THEN 'sourced from 2026 market research -- independent consultants doing general small-business work run $75-150/hr entry tier' ELSE 'real company audit rate established this session' END),
    to_char(t.est_hours * (CASE t.tier WHEN 1 THEN 60 WHEN 2 THEN 75 ELSE 90 END), 'FM999999990.00'),
    t.notes
  ),
  margin_economics = format('DRAFT: price $%s - draft cost $%s = $%s (%s%%) -- hour estimate is this pass''s own planning assumption, NOT an audited figure like Division 02''s. Needs Danielle''s confirmation before any offer-status change.',
    to_char(s.starting_price, 'FM999999990.00'),
    to_char(t.est_hours * (CASE t.tier WHEN 1 THEN 60 WHEN 2 THEN 75 ELSE 90 END), 'FM999999990.00'),
    to_char(s.starting_price - (t.est_hours * (CASE t.tier WHEN 1 THEN 60 WHEN 2 THEN 75 ELSE 90 END)), 'FM999999990.00'),
    to_char(round(((s.starting_price - (t.est_hours * (CASE t.tier WHEN 1 THEN 60 WHEN 2 THEN 75 ELSE 90 END))) / nullif(s.starting_price,0)) * 100, 1), 'FM999990.0')
  ),
  conflict_register = coalesce(conflict_register, '') || format(' DRAFT COST MODEL 2026-09-18: Tier %s $%s/hr + this pass''s own hour estimate. Not yet confirmed by Danielle; do not treat as audited.',
    t.tier, (CASE t.tier WHEN 1 THEN 60 WHEN 2 THEN 75 ELSE 90 END)
  ),
  updated_at = now()
FROM tmp_d13_econ t
JOIN public.services s ON s.sku = t.canonical_sku
WHERE m.canonical_sku = t.canonical_sku;

DROP TABLE tmp_d13_econ;
