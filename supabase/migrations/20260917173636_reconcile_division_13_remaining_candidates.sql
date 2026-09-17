-- Division 13 (Government & Institutional Procurement) has 6 PRESERVED_CANDIDATE rows
-- against 20 already-canonical, mostly generic-stub Division-13A services.
--
-- 1 is a duplicate of an already-live service:
--   - Government Janitorial Program Coordination -> Institutional Janitorial Coordination
--     (DNI-13A-017) (same real-world janitorial-program coordination job under a
--     "government" vs. "institutional" naming variant)
--
-- The other 5 are genuinely distinct:
--   - Government Contract Closeout Support: end-of-contract closeout documentation, a
--     distinct phase from the ongoing Contract Administration Support / Invoice-
--     Deliverable Tracking SKUs.
--   - Government Event & Community Support: operational event/community-program support
--     scoped to government contracts, with no existing equivalent in this division.
--   - Government Property Documentation: field photo/checklist documentation of property
--     condition for government contracts, distinct from the general Compliance
--     Documentation SKU.
--   - Government Supply & Materials Support: physical supply/materials procurement and
--     logistics, distinct from the document-focused Procurement Document Support SKU.
--   - Government Work Order Coordination: general contract task-order coordination,
--     distinct from the facilities-specific work orders under Facilities Support
--     Coordination.
-- Priced against the existing $250-$1999 Division-13A SOW rate ladder, using services-
-- level pricing_type='SOW' (mapping to dd_service_pricing_rules.pricing_type=
-- 'VARIABLE_QUOTE', the existing precedent for this division's SOW-priced services).
-- Danielle holds zero authorized capabilities anywhere in Division 13 (checked before
-- writing this) -- no authorizations added.

UPDATE public.services SET description = 'Administrative coordination of janitorial service programs, schedules, quality documentation, supply requirements and contractor workflows for government or institutional clients.', updated_at = now()
WHERE id = 'edab6307-9133-401b-8230-c9a558cc856d'; -- Institutional Janitorial Coordination

UPDATE public.dd_master_service_universe
SET lifecycle_status = 'SUPERSEDED',
    conflict_register = 'Merged 2026-09-17: duplicate of already-live Institutional Janitorial Coordination (DNI-13A-017).'
WHERE service_name = 'Government Janitorial Program Coordination' AND lifecycle_status = 'PRESERVED_CANDIDATE';

CREATE TEMP TABLE tmp_d13_new (
  service_name text PRIMARY KEY,
  canonical_sku text,
  price_dollars numeric,
  description text
);

INSERT INTO tmp_d13_new (service_name, canonical_sku, price_dollars, description) VALUES
  ('Government Contract Closeout Support', 'DNI-13A-021', 500,
   'Administrative organization of completion documentation, deliverables, invoice-support records and closeout checklists.'),
  ('Government Event & Community Support', 'DNI-13A-022', 750,
   'Operational support for government and institutional events, community programs, setup, guest flow, materials and post-event tasks.'),
  ('Government Property Documentation', 'DNI-13A-023', 350,
   'Field documentation of property and facility status using photographs, checklists and reports according to the contracting scope.'),
  ('Government Supply & Materials Support', 'DNI-13A-024', 500,
   'Procurement and logistics coordination for approved government and institutional supplies and materials, subject to procurement requirements.'),
  ('Government Work Order Coordination', 'DNI-13A-025', 750,
   'Administrative coordination of task orders, assignments, schedules, completion evidence and issue escalation for approved contracts.')
;

UPDATE public.dd_master_service_universe m
SET lifecycle_status = 'CANONICAL_ACTIVE', canonical_sku = t.canonical_sku, commercial_object_type = 'SERV', updated_at = now()
FROM tmp_d13_new t
WHERE m.service_name = t.service_name AND m.lifecycle_status = 'PRESERVED_CANDIDATE';

UPDATE public.services s
SET commercial_status = 'CANONICAL_ACTIVE', pricing_type = 'SOW', billing_cycle = 'ONETIME',
    starting_price = t.price_dollars, description = t.description, resident_discount_eligible = false,
    service_family = 'Government & Institutional Procurement', updated_at = now()
FROM tmp_d13_new t
WHERE s.name = t.service_name AND s.commercial_status = 'PENDING_RECONCILIATION';

INSERT INTO public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT s.id, ch, 'VARIABLE_QUOTE', round(t.price_dollars * 100)::int, 'USD', 'ONETIME', 'LOCKED', false, 'STANDARD', current_date, 'ACTIVE'
FROM tmp_d13_new t
JOIN public.services s ON s.name = t.service_name
CROSS JOIN unnest(ARRAY['CH01','CH02','CH03','CH04','CH05']) AS ch;

INSERT INTO public.dd_governed_service_offers (
  master_record_id, canonical_sku, service_name, division, commercial_object_type, runtime_service_id,
  pricing_rule_count, market_rule_count, channel_availability_count, authorized_provider_capability_count,
  priced_channel_count, ch01_a_priced, ch01_b_priced, commercial_offer_status, fulfillment_gate_status,
  offer_basis, source_authority
)
SELECT m.id, m.canonical_sku, m.service_name, m.division, m.commercial_object_type, s.id,
  5, 0, 0, 0,
  5, true, false, 'SELL_NOW', 'READY',
  'Reconciled from PRESERVED_CANDIDATE 2026-09-17: distinct from existing Division-13A services after side-by-side adjudication (see migration notes). No authorized provider yet -- Danielle has not confirmed she performs this work; priced and catalogued but intentionally not checkout-eligible until a real provider is authorized.',
  'OWNER_DIRECTED_CATALOG_COMPLETION'
FROM tmp_d13_new t
JOIN public.services s ON s.name = t.service_name
JOIN public.dd_master_service_universe m ON m.canonical_sku = t.canonical_sku;

DROP TABLE tmp_d13_new;
