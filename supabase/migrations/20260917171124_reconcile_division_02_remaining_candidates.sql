-- Division 02's remaining 5 PRESERVED_CANDIDATE rows were explicitly paused by an earlier
-- migration (authorize_danielle_division_02_property_reset_services) pending a real
-- side-by-side adjudication against the 20 already-canonical Division-02A generic-stub
-- services, rather than a unilateral guess. Doing that adjudication now:
--
-- 3 of the 5 are the same real-world job as an already-live generic-stub service, just
-- described in more detail -- merging rather than selling twice, same pattern as the
-- consolidate_duplicate_services_and_fix_notary_pricing migration:
--   - Property Photo & Condition Reporting  -> Photo Documentation (DNI-02A-013)
--   - Property Supply Closet & Inventory Reset -> Facility Supply Replenishment (DNI-02A-006)
--   - Apartment Common-Area Reset -> Common Area Detail (DNI-02A-005)
--
-- The other 2 are genuinely distinct from anything already live:
--   - Resident Move Coordination: single-resident move-in/out logistics coordination
--     (access, scheduling, key handoff, status updates) -- distinct from Move-In/Move-Out
--     Readiness, which is the physical unit reset/cleaning work, not the coordination layer.
--   - Multi-Unit Turnover Management: portfolio-level coordination across MULTIPLE unit
--     turns (sequencing, dispatch, tracking, exceptions) -- distinct from Apartment Turn,
--     which is a single unit.
-- Priced using the existing Division-02A SOW_PROCUREMENT rate ladder as the anchor
-- (Property Transition Support $95, Common Area Detail/Facility Supply $125, Apartment
-- Turn $150, Work Order Coordination $225 -- all real prices already live in this
-- division). Resident Move Coordination priced just under Property Transition Support's
-- $95 (narrower, single-move scope); Multi-Unit Turnover Management priced above Work
-- Order Coordination's $225 (portfolio-wide scope, not a single job).
--
-- Per the same precedent as the paused migration -- Danielle is not authorized on
-- coordination/admin-only Division-02 roles (Vendor Coordination, Work Order
-- Coordination, Property Transition Support) because she hasn't confirmed she performs
-- that kind of coordination work herself -- these two new services get the same
-- treatment: priced and catalogued, zero authorized providers, not checkout-eligible
-- until a real one exists.

-- 1. Merge the 3 duplicates onto their live canonical services.
CREATE TEMP TABLE tmp_d02_merges (
  target_service_id uuid,
  candidate_master_id uuid,
  new_description text
);

INSERT INTO tmp_d02_merges VALUES
  ('2ef63d4d-a512-441d-8475-6f08e236a276', 'bcc0af11-efbf-4be2-ba41-cd573e567316',
   'Structured field documentation using photographs and written observations for property condition, turnover status, vendor completion or management review; not a licensed inspection or appraisal.'),
  ('587d9d69-771b-4d9e-9db0-b42602f24b6c', 'b0163fc2-87be-41da-896d-46eb9c1b91d5',
   'Organization of property supply areas, routine inventory counts, labeling, replenishment identification and procurement-request preparation.'),
  ('6c42a2dc-f9f0-44f0-a268-97df0a0428d1', 'da99a733-fa7c-43c7-8431-edd38bf22947',
   'Recurring or project-based reset of lobbies, corridors, amenity spaces and common areas, including cleaning, organization, visual readiness and completion documentation.')
;

UPDATE public.services s SET description = t.new_description, updated_at = now()
FROM tmp_d02_merges t WHERE s.id = t.target_service_id;

UPDATE public.dd_master_service_universe m
SET lifecycle_status = 'SUPERSEDED',
    conflict_register = 'Merged 2026-09-17: duplicate of an already-live Division-02A service (same real-world job under a different name). Description consolidated onto the live SKU; this candidate retired rather than priced separately.'
FROM tmp_d02_merges t WHERE m.id = t.candidate_master_id;

DROP TABLE tmp_d02_merges;

-- 2. Reconcile the 2 genuinely new services.
CREATE TEMP TABLE tmp_d02_new (
  service_name text PRIMARY KEY,
  canonical_sku text,
  price_dollars numeric,
  pricing_type text,
  description text
);

INSERT INTO tmp_d02_new (service_name, canonical_sku, price_dollars, pricing_type, description) VALUES
  ('Resident Move Coordination', 'DNI-02A-021', 85, 'STARTING_AT',
   'Operational coordination around a single resident move-in or move-out window, including access, scheduling, readiness tasks, key logistics and status communication. Distinct from the physical unit reset (see Move-In/Move-Out Readiness).'),
  ('Multi-Unit Turnover Management', 'DNI-02A-022', 295, 'STARTING_AT',
   'Portfolio-level coordination for multiple apartment or property turns, including unit lists, priority sequencing, dispatch, progress tracking, exceptions and completion reporting across an entire turnover cycle.')
;

UPDATE public.dd_master_service_universe m
SET lifecycle_status = 'CANONICAL_ACTIVE', canonical_sku = t.canonical_sku, commercial_object_type = 'SERV', updated_at = now()
FROM tmp_d02_new t
WHERE m.service_name = t.service_name AND m.lifecycle_status = 'PRESERVED_CANDIDATE';

UPDATE public.services s
SET commercial_status = 'CANONICAL_ACTIVE', pricing_type = t.pricing_type, billing_cycle = 'ONETIME',
    starting_price = t.price_dollars, description = t.description, resident_discount_eligible = true,
    service_family = 'Property, Facilities & Field Operations', updated_at = now()
FROM tmp_d02_new t
WHERE s.name = t.service_name AND s.commercial_status = 'PENDING_RECONCILIATION';

INSERT INTO public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT s.id, ch, t.pricing_type, round(t.price_dollars * 100)::int, 'USD', 'ONETIME', 'LOCKED', true, 'STANDARD', current_date, 'ACTIVE'
FROM tmp_d02_new t
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
  'Reconciled from PRESERVED_CANDIDATE 2026-09-17: distinct from existing Division-02A services after side-by-side adjudication (see migration notes). Priced against the existing SOW_PROCUREMENT rate ladder for this division. No authorized provider yet -- coordination/admin role Danielle has not confirmed she performs herself, consistent with the existing Division-02 authorization policy; priced and catalogued but intentionally not checkout-eligible until a real provider is authorized.',
  'OWNER_DIRECTED_CATALOG_COMPLETION'
FROM tmp_d02_new t
JOIN public.services s ON s.name = t.service_name
JOIN public.dd_master_service_universe m ON m.canonical_sku = t.canonical_sku;

DROP TABLE tmp_d02_new;
