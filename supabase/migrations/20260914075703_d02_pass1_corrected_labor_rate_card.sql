
UPDATE dd_master_service_universe AS m
SET internal_cost = v.internal_cost, updated_at = now()
FROM (VALUES
  ('DNI-02A-001','1.25 hrs @ $60/hr (Tier 1 Field/Routine, DEC-LABOR-001) + ~$10 supplies = $85.00 — corrected from earlier erroneous $25/hr calc'),
  ('DNI-02A-002','2.5 hrs @ $60/hr (Tier 1 Field/Routine) + ~$20 supplies = $170.00 — corrected from earlier erroneous $25/hr calc'),
  ('DNI-02A-003','1.5 hrs @ $75/hr (Tier 2 Coordination/QA) + ~$5 materials = $117.50 — corrected from earlier erroneous $25/hr calc'),
  ('DNI-02A-004','1.5 hrs @ $60/hr (Tier 1 Field/Routine) + ~$10 supplies = $100.00 — corrected from earlier erroneous $25/hr calc'),
  ('DNI-02A-005','2 hrs @ $60/hr (Tier 1 Field/Routine) + ~$15 supplies = $135.00 — corrected from earlier erroneous $25/hr calc'),
  ('DNI-02A-006','1 hr @ $60/hr (Tier 1 Field/Routine) + handling $10 (supply cost pass-through, not included) = $70.00 — corrected from earlier erroneous $25/hr calc'),
  ('DNI-02A-007','1 hr @ $75/hr (Tier 2 Coordination/QA) + ~$5 materials = $80.00 — corrected from earlier erroneous $25/hr calc'),
  ('DNI-02A-008','1 hr @ $60/hr (Tier 1 Field/Routine, general handyman/trade) + ~$20 parts allowance = $80.00 — corrected from earlier erroneous $25/hr calc'),
  ('DNI-02A-009','2.25 hrs @ $60/hr (Tier 1 Field/Routine) + ~$20 supplies = $155.00 — corrected from earlier erroneous $25/hr calc'),
  ('DNI-02A-010','2 hrs @ $60/hr (Tier 1 Field/Routine) + ~$15 supplies = $135.00 — corrected from earlier erroneous $25/hr calc'),
  ('DNI-02A-011','1.5 hrs @ $60/hr (Tier 1 Field/Routine) + ~$10 supplies = $100.00 — corrected from earlier erroneous $25/hr calc'),
  ('DNI-02A-012','2 hrs @ $60/hr (Tier 1 Field/Routine) + ~$15 supplies = $135.00 — corrected from earlier erroneous $25/hr calc'),
  ('DNI-02A-013','1 hr @ $75/hr (Tier 2 Coordination/QA) + ~$5 materials = $80.00 — corrected from earlier erroneous $25/hr calc'),
  ('DNI-02A-014','1.25 hrs @ $75/hr (Tier 2 Coordination/QA) + ~$5 materials = $98.75 — corrected from earlier erroneous $25/hr calc'),
  ('DNI-02A-015','1 hr @ $75/hr (Tier 2 Coordination/PM) + ~$5 materials = $80.00 — corrected from earlier erroneous $25/hr calc'),
  ('DNI-02A-016','1.5 hrs @ $60/hr (Tier 1 Field/Routine, walk + minor fix) + ~$15 minor-parts allowance = $105.00 — corrected from earlier erroneous $25/hr calc'),
  ('DNI-02A-017','1 hr @ $75/hr (Tier 2 Coordination/QA) + ~$5 materials = $80.00 — corrected from earlier erroneous $25/hr calc'),
  ('DNI-02A-018','1 hr @ $75/hr (Tier 2 Coordination/QA) + ~$5 materials = $80.00 — corrected from earlier erroneous $25/hr calc'),
  ('DNI-02A-019','1 hr @ $75/hr (Tier 2 Coordination/PM), no materials = $75.00 — corrected from earlier erroneous $25/hr calc'),
  ('DNI-02A-020','1.5 hrs @ $75/hr (Tier 2 Coordination/PM/Dispatch) + ~$10 materials = $122.50 — LOW CONFIDENCE: scope/quantity per charge still undefined; corrected from earlier erroneous $25/hr calc')
) AS v(sku, internal_cost)
WHERE m.canonical_sku = v.sku;

UPDATE dd_master_service_universe AS m
SET margin_economics = v.margin_economics, updated_at = now()
FROM (VALUES
  ('DNI-02A-001','Price $95 - cost $85.00 = $10.00 margin (10.5%) — THIN: consider price increase or confirm 1.25hr scope is achievable'),
  ('DNI-02A-002','Price $150 - cost $170.00 = -$20.00 margin (-13.3%) — LOSS at posted price using Tier 1 $60/hr rate. Needs price increase or scope revision before selling at this price.'),
  ('DNI-02A-003','Price $175 - cost $117.50 = $57.50 margin (32.9%) — PASS 1 candidate at base tier'),
  ('DNI-02A-004','Price $75 - cost $100.00 = -$25.00 margin (-33.3%) — LOSS at posted price. Needs price increase or scope revision before selling at this price.'),
  ('DNI-02A-005','Price $125 - cost $135.00 = -$10.00 margin (-8.0%) — LOSS at posted price. Needs price increase or scope revision before selling at this price.'),
  ('DNI-02A-006','Price $125 - cost $70.00 = $55.00 margin (44.0%) — PASS 1 candidate; assumes supply cost billed as separate pass-through'),
  ('DNI-02A-007','Price $95 - cost $80.00 = $15.00 margin (15.8%) — THIN: consider price increase'),
  ('DNI-02A-008','Price $175 - cost $80.00 = $95.00 margin (54.3%) — PASS 1 candidate at base tier'),
  ('DNI-02A-009','Price $175 - cost $155.00 = $20.00 margin (11.4%) — THIN: consider price increase or confirm 2.25hr scope is achievable'),
  ('DNI-02A-010','Price $225 - cost $135.00 = $90.00 margin (40.0%) — PASS 1 candidate at base tier'),
  ('DNI-02A-011','Price $150 - cost $100.00 = $50.00 margin (33.3%) — PASS 1 candidate at base tier'),
  ('DNI-02A-012','Price $125 - cost $135.00 = -$10.00 margin (-8.0%) — LOSS at posted price. Needs price increase or scope revision before selling at this price.'),
  ('DNI-02A-013','Price $125 - cost $80.00 = $45.00 margin (36.0%) — PASS 1 candidate at base tier'),
  ('DNI-02A-014','Price $150 - cost $98.75 = $51.25 margin (34.2%) — PASS 1 candidate at base tier'),
  ('DNI-02A-015','Price $95 - cost $80.00 = $15.00 margin (15.8%) — THIN: consider price increase'),
  ('DNI-02A-016','Price $125 - cost $105.00 = $20.00 margin (16.0%) — THIN: consider price increase or confirm 1.5hr scope is achievable'),
  ('DNI-02A-017','Price $150 - cost $80.00 = $70.00 margin (46.7%) — PASS 1 candidate at base tier'),
  ('DNI-02A-018','Price $175 - cost $80.00 = $95.00 margin (54.3%) — PASS 1 candidate at base tier'),
  ('DNI-02A-019','Price $125 - cost $75.00 = $50.00 margin (40.0%) — PASS 1 candidate at base tier'),
  ('DNI-02A-020','Price $225 - cost $122.50 = $102.50 margin (45.6%) — DO NOT treat as PASS 1 yet: scope/time basis still low-confidence')
) AS v(sku, margin_economics)
WHERE m.canonical_sku = v.sku;
