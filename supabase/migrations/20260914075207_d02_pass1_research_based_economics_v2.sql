
UPDATE dd_master_service_universe AS m
SET internal_cost = v.internal_cost, updated_at = now()
FROM (VALUES
  ('DNI-02A-001','1.25 hrs @ $25/hr owner-direct labor benchmark + ~$10 supplies = $41.25 — estimated scope (no published benchmark for "amenity reset"; assumed light common-amenity touch-up)'),
  ('DNI-02A-002','2.5 hrs @ $25/hr + ~$20 supplies = $82.50 — grounded in published apartment-turn cleaning benchmarks (2-4 hrs for 1BR/studio, ISSA/industry sources), base-tier (smallest unit) assumption'),
  ('DNI-02A-003','1.5 hrs @ $25/hr + ~$5 materials = $42.50 — estimated scope (no published benchmark for "asset verification"; assumed inventory/condition count walk)'),
  ('DNI-02A-004','1.5 hrs @ $25/hr + ~$10 supplies = $47.50 — estimated scope, modeled on small commercial-space light-reset cleaning'),
  ('DNI-02A-005','2 hrs @ $25/hr + ~$15 supplies = $65.00 — estimated scope, modeled on common-area cleaning benchmarks'),
  ('DNI-02A-006','1 hr @ $25/hr + handling only ($10); supply cost itself assumed pass-through/billed separately, not included = $35.00 base — estimated scope'),
  ('DNI-02A-007','1 hr @ $25/hr + ~$5 materials = $30.00 — estimated scope (no published benchmark for "field data collection")'),
  ('DNI-02A-008','1 hr @ $25/hr (minimum-call assumption) + ~$20 parts/materials allowance = $45.00 — grounded in handyman industry benchmarks (national min service call $100-200 charged; this is internal labor+materials cost only, not market rate)'),
  ('DNI-02A-009','2.25 hrs @ $25/hr + ~$20 supplies = $76.25 — grounded in published deep-clean/turnover cleaning benchmarks for small unit'),
  ('DNI-02A-010','2 hrs @ $25/hr + ~$15 supplies = $65.00 — estimated scope, modeled on final move-in touch-up/prep benchmarks'),
  ('DNI-02A-011','1.5 hrs @ $25/hr + ~$10 supplies = $47.50 — estimated scope, modeled on move-out prep/inspection'),
  ('DNI-02A-012','2 hrs @ $25/hr + ~$15 supplies = $65.00 — grounded in general office-cleaning time benchmarks'),
  ('DNI-02A-013','1 hr @ $25/hr + ~$5 materials = $30.00 — estimated scope (walkthrough + photo documentation)'),
  ('DNI-02A-014','1.25 hrs @ $25/hr + ~$5 materials = $36.25 — estimated scope, modeled on standard property-inspection walk time'),
  ('DNI-02A-015','1 hr @ $25/hr + ~$5 materials = $30.00 — estimated scope (no published benchmark; assumed coordination/admin visit)'),
  ('DNI-02A-016','1.5 hrs @ $25/hr + ~$15 minor-parts allowance = $52.50 — estimated scope, modeled on punch-list walk + minor fixes'),
  ('DNI-02A-017','1 hr @ $25/hr + ~$5 materials = $30.00 — estimated scope (no published benchmark; assumed quick verification visit)'),
  ('DNI-02A-018','1 hr @ $25/hr + ~$5 materials = $30.00 — estimated scope, modeled on vacant-property check-visit assumption'),
  ('DNI-02A-019','1 hr @ $25/hr, no materials = $25.00 — estimated scope (admin/coordination call, no published benchmark)'),
  ('DNI-02A-020','1.5 hrs @ $25/hr + ~$10 materials = $47.50 — LOW CONFIDENCE: no defined scope for how many work orders this covers; owner should confirm before treating as final')
) AS v(sku, internal_cost)
WHERE m.canonical_sku = v.sku;

UPDATE dd_master_service_universe AS m
SET provider_payout = 'N/A — owner-direct fulfillment (no provider currently assigned to D02 base services)', updated_at = now()
WHERE m.division = '02' AND m.canonical_sku LIKE 'DNI-02A-%';

UPDATE dd_master_service_universe AS m
SET margin_economics = v.margin_economics, updated_at = now()
FROM (VALUES
  ('DNI-02A-001','Price $95 - cost $41.25 = $53.75 margin (56.6%) — PASS 1 candidate at base tier'),
  ('DNI-02A-002','Price $150 - cost $82.50 = $67.50 margin (45.0%) — PASS 1 candidate at base tier'),
  ('DNI-02A-003','Price $175 - cost $42.50 = $132.50 margin (75.7%) — PASS 1 candidate at base tier'),
  ('DNI-02A-004','Price $75 - cost $47.50 = $27.50 margin (36.7%) — thinnest margin in division; PASS 1 candidate but monitor if scope runs over base assumption'),
  ('DNI-02A-005','Price $125 - cost $65.00 = $60.00 margin (48.0%) — PASS 1 candidate at base tier'),
  ('DNI-02A-006','Price $125 - cost $35.00 = $90.00 margin (72.0%) — PASS 1 candidate; assumes supply cost billed as separate pass-through'),
  ('DNI-02A-007','Price $95 - cost $30.00 = $65.00 margin (68.4%) — PASS 1 candidate at base tier'),
  ('DNI-02A-008','Price $175 - cost $45.00 = $130.00 margin (74.3%) — PASS 1 candidate; margin favorable at $25/hr internal benchmark vs $45-75/hr regional market handyman rate'),
  ('DNI-02A-009','Price $175 - cost $76.25 = $98.75 margin (56.4%) — PASS 1 candidate at base tier'),
  ('DNI-02A-010','Price $225 - cost $65.00 = $160.00 margin (71.1%) — PASS 1 candidate at base tier'),
  ('DNI-02A-011','Price $150 - cost $47.50 = $102.50 margin (68.3%) — PASS 1 candidate at base tier'),
  ('DNI-02A-012','Price $125 - cost $65.00 = $60.00 margin (48.0%) — PASS 1 candidate at base tier'),
  ('DNI-02A-013','Price $125 - cost $30.00 = $95.00 margin (76.0%) — PASS 1 candidate at base tier'),
  ('DNI-02A-014','Price $150 - cost $36.25 = $113.75 margin (75.8%) — PASS 1 candidate at base tier'),
  ('DNI-02A-015','Price $95 - cost $30.00 = $65.00 margin (68.4%) — PASS 1 candidate at base tier'),
  ('DNI-02A-016','Price $125 - cost $52.50 = $72.50 margin (58.0%) — PASS 1 candidate at base tier'),
  ('DNI-02A-017','Price $150 - cost $30.00 = $120.00 margin (80.0%) — PASS 1 candidate at base tier'),
  ('DNI-02A-018','Price $175 - cost $30.00 = $145.00 margin (82.9%) — PASS 1 candidate at base tier'),
  ('DNI-02A-019','Price $125 - cost $25.00 = $100.00 margin (80.0%) — PASS 1 candidate at base tier'),
  ('DNI-02A-020','Price $225 - cost $47.50 = $177.50 margin (78.9%) — DO NOT treat as PASS 1 yet: scope/time basis is low-confidence, confirm before relying on this margin')
) AS v(sku, margin_economics)
WHERE m.canonical_sku = v.sku;
