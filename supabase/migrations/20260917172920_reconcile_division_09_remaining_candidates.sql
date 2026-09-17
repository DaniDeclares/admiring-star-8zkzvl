-- Division 09 (Classes, Workshops & Training) has 8 PRESERVED_CANDIDATE rows against
-- 25 already-canonical, generic-stub Division-09A services.
--
-- 5 of the 8 are the same real-world class as an already-live generic-stub workshop:
--   - Concierge Services Training -> Household Concierge Workshop (DNI-09A-016)
--   - Event Coordination Training -> Event Planning Workshop (DNI-09A-017)
--   - Pricing & Service Productization Workshop -> Pricing Fundamentals Workshop (DNI-09A-011)
--   - Real Estate Support Operations Training -> Real Estate Support Workshop (DNI-09A-014)
--   - Small Business AI Implementation Workshop -> AI for Business Workshop (DNI-09A-009)
--
-- The other 3 are genuinely distinct:
--   - Notary & Document Services Training: a notary/document-process training class, no
--     existing Division-09 workshop covers this subject at all.
--   - Provider Operations & Dispatch Training: trains WORKERS/PROVIDERS on operational
--     standards, dispatch and documentation -- a fundamentally different buyer/purpose
--     than every existing Division-09 offer, which trains clients/business owners.
--   - Wedding Planning Training: weddings are a distinct, separately-recognized service
--     line on this site (see the dedicated Weddings page/gallery) with different content
--     (vendor coordination, timelines, event-day execution for a wedding specifically)
--     than the general Event Planning Workshop.
-- Priced at $199, matching the existing "advanced workshop" tier (Startup Systems
-- Workshop, Event Planning Workshop) rather than the $99/$149 basics tiers, since all
-- three are more specialized subject matter.
-- Danielle holds zero authorized capabilities anywhere in Division 09 (checked before
-- writing this) -- no new authorizations added.

CREATE TEMP TABLE tmp_d09_merges (
  target_service_id uuid,
  candidate_master_id uuid,
  new_description text
);

INSERT INTO tmp_d09_merges VALUES
  ('006f1697-7470-4e9f-859e-a0c89756e5b3', '8c8ab406-6c99-4b9b-8fe7-4bf657f5ee2b',
   'Instruction on household and lifestyle concierge workflows, service boundaries, client experience and operational organization.'),
  ('0a1ad3e6-7d3a-46d4-847b-be08887ddaf6', '3524282b-d8f2-4464-9bcc-d866bafa0aa0',
   'Training on event planning fundamentals, logistics, vendor coordination, guest flow, setup and teardown.'),
  ('ade6bf71-c26b-4b99-b9d9-7a9d43675e53', '9edeb831-1452-4465-bf6e-089092ee37e9',
   'Training on defining service scope, outcomes, packages, pricing models, cost structures and commercial offers.'),
  ('546b764c-7724-4a70-9f0c-4bb94e8a9977', '614dad34-d905-4cb5-8b7e-d3f986509fde',
   'Training on listing support, transaction administration, property logistics, client service and coordination boundaries.'),
  ('b89e7535-58e0-46ac-8cde-802a49b84e88', 'cb3d0456-8e3c-4760-99d8-3e3f25759d79',
   'Hands-on education on practical AI use for administrative, marketing and business workflows, with privacy and human-review practices.')
;

UPDATE public.services s SET description = t.new_description, updated_at = now()
FROM tmp_d09_merges t WHERE s.id = t.target_service_id;

UPDATE public.dd_master_service_universe m
SET lifecycle_status = 'SUPERSEDED',
    conflict_register = 'Merged 2026-09-17: duplicate of an already-live Division-09A workshop (same real-world class under a different name). Description consolidated onto the live SKU; this candidate retired rather than priced separately.'
FROM tmp_d09_merges t WHERE m.id = t.candidate_master_id;

DROP TABLE tmp_d09_merges;

CREATE TEMP TABLE tmp_d09_new (
  service_name text PRIMARY KEY,
  canonical_sku text,
  price_dollars numeric,
  description text
);

INSERT INTO tmp_d09_new (service_name, canonical_sku, price_dollars, description) VALUES
  ('Notary & Document Services Training', 'DNI-09A-026', 199,
   'Educational instruction covering general notary and document-services concepts, workflows, client intake and professional practices within appropriate training boundaries.'),
  ('Provider Operations & Dispatch Training', 'DNI-09A-027', 199,
   'Training for workers and providers on service standards, dispatch workflow, documentation, customer communication and completion evidence.'),
  ('Wedding Planning Training', 'DNI-09A-028', 199,
   'Practical instruction in wedding planning workflows, timelines, vendor coordination, client management and event-day execution.')
;

UPDATE public.dd_master_service_universe m
SET lifecycle_status = 'CANONICAL_ACTIVE', canonical_sku = t.canonical_sku, commercial_object_type = 'SERV', updated_at = now()
FROM tmp_d09_new t
WHERE m.service_name = t.service_name AND m.lifecycle_status = 'PRESERVED_CANDIDATE';

UPDATE public.services s
SET commercial_status = 'CANONICAL_ACTIVE', pricing_type = 'FIXED', billing_cycle = 'ONETIME',
    starting_price = t.price_dollars, description = t.description, resident_discount_eligible = false,
    service_family = 'Classes, Workshops & Training', updated_at = now()
FROM tmp_d09_new t
WHERE s.name = t.service_name AND s.commercial_status = 'PENDING_RECONCILIATION';

INSERT INTO public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT s.id, ch, 'FIXED', round(t.price_dollars * 100)::int, 'USD', 'ONETIME', 'LOCKED', false, 'STANDARD', current_date, 'ACTIVE'
FROM tmp_d09_new t
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
  'Reconciled from PRESERVED_CANDIDATE 2026-09-17: distinct from existing Division-09A workshops after side-by-side adjudication (see migration notes). No authorized provider yet -- Danielle has not confirmed she performs this work; priced and catalogued but intentionally not checkout-eligible until a real provider is authorized.',
  'OWNER_DIRECTED_CATALOG_COMPLETION'
FROM tmp_d09_new t
JOIN public.services s ON s.name = t.service_name
JOIN public.dd_master_service_universe m ON m.canonical_sku = t.canonical_sku;

DROP TABLE tmp_d09_new;
