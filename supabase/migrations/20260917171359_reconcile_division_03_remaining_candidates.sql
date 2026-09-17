-- Division 03 (Real Estate & Closing Support) has 8 PRESERVED_CANDIDATE rows against 20
-- already-canonical, generic-stub Division-03A services. Same adjudication process as
-- Division 01/02: check each candidate against the existing 20 for genuine duplication
-- before pricing it as a new SKU.
--
-- 2 of the 8 are the same real-world job as an already-live service:
--   - Open House Guest Experience Management -> Open House Staffing (DNI-03A-013)
--     (guest flow/registration/refreshments during the event IS the staffing job)
--   - Property Showing Concierge -> Showing Preparation (DNI-03A-018)
--     (near-identical: prep a property for a scheduled showing per agent instructions)
--
-- The other 6 are genuinely distinct -- either a different phase of the transaction than
-- any existing SKU, or a real, separately-recognized real-estate industry service:
--   - Buyer/Seller Closing Packet Support: pre-appointment paperwork prep, distinct from
--     Buyer/Seller Document Run (delivery/courier) and Closing Appointment Support (day-of).
--   - Listing Launch Coordination: a coordination layer across photo/signage scheduling +
--     readiness + launch tracking, priced above the single Listing Readiness task it
--     orchestrates (same "coordination premium" pattern as Multi-Unit Turnover Management
--     in Division 02).
--   - Real Estate Client Concierge: broad, variable-scope white-glove support for
--     buyers/sellers/agents -- priced hourly like other concierge-tier services rather
--     than matched to any single existing fixed-scope SKU.
--   - Real Estate Transaction Coordination: "Transaction Coordinator" is a distinct,
--     widely-recognized outsourced real-estate role/service nationally, priced per file
--     in the real market range for that specific, well-known service -- not the same as
--     the narrower Inspection Access Support.
--   - Real Estate Vendor Coordination: a vendor-dispatch coordinator role (photographers,
--     stagers, sign installers, couriers) with no existing single-SKU equivalent.
--   - Relocation & Move Coordination for Real Estate Clients: move-coordination scoped to
--     a real-estate transaction specifically (vendors, access, deliveries, household
--     setup) -- a real-estate-specific counterpart to Division 02's narrower
--     resident-only Resident Move Coordination ($85), priced up for the broader scope.
--
-- Danielle currently holds zero authorized capabilities anywhere in Division 03 (checked
-- before writing this). None of these 6 are cleaning/notary/officiant work she has
-- confirmed she performs, so consistent with that existing posture, none of the 6 new
-- services get a provider authorization here -- priced and catalogued, not checkout-eligible
-- until a real real-estate-support provider is onboarded.

CREATE TEMP TABLE tmp_d03_merges (
  target_service_id uuid,
  candidate_master_id uuid,
  new_description text
);

INSERT INTO tmp_d03_merges VALUES
  ((SELECT s.id FROM services s JOIN dd_governed_service_offers o ON o.runtime_service_id = s.id WHERE o.canonical_sku = 'DNI-03A-013'),
   '5b6d9b82-1373-4e22-93c8-b4d62564568a',
   'Support for guest flow, registration, refreshments or material placement, property readiness, signage and post-event reset for open houses.'),
  ((SELECT s.id FROM services s JOIN dd_governed_service_offers o ON o.runtime_service_id = s.id WHERE o.canonical_sku = 'DNI-03A-018'),
   '40516495-ba37-4770-a4cb-0ae6efc2619a',
   'Preparation of a property for scheduled showings plus access, presentation, supply placement, signage and post-showing reset according to agent instructions.')
;

UPDATE public.services s SET description = t.new_description, updated_at = now()
FROM tmp_d03_merges t WHERE s.id = t.target_service_id;

UPDATE public.dd_master_service_universe m
SET lifecycle_status = 'SUPERSEDED',
    conflict_register = 'Merged 2026-09-17: duplicate of an already-live Division-03A service (same real-world job under a different name). Description consolidated onto the live SKU; this candidate retired rather than priced separately.'
FROM tmp_d03_merges t WHERE m.id = t.candidate_master_id;

DROP TABLE tmp_d03_merges;

CREATE TEMP TABLE tmp_d03_new (
  service_name text PRIMARY KEY,
  canonical_sku text,
  price_dollars numeric,
  pricing_type text,
  billing_cycle text,
  description text
);

INSERT INTO tmp_d03_new (service_name, canonical_sku, price_dollars, pricing_type, billing_cycle, description) VALUES
  ('Buyer/Seller Closing Packet Support', 'DNI-03A-021', 125, 'FIXED', 'ONETIME',
   'Administrative preparation and organization of client-provided real-estate closing packets, appointment materials and delivery checklists; does not replace title or attorney functions.'),
  ('Listing Launch Coordination', 'DNI-03A-022', 350, 'FIXED', 'ONETIME',
   'Operational launch coordination for a listing, including preparation checklists, photography and signage scheduling, property readiness, listing materials and launch-day tracking.'),
  ('Real Estate Client Concierge', 'DNI-03A-023', 65, 'VARIABLE_QUOTE', 'HOURLY',
   'White-glove administrative and logistical support for buyers, sellers and agents, including scheduling, document runs, property-preparation coordination, closing-day support and approved errands.'),
  ('Real Estate Transaction Coordination', 'DNI-03A-024', 395, 'FIXED', 'ONETIME',
   'Administrative coordination of transaction milestones, documents, appointments, communications, deadlines, inspection access and closing logistics for real-estate professionals.'),
  ('Real Estate Vendor Coordination', 'DNI-03A-025', 175, 'FIXED', 'ONETIME',
   'Coordination of photographers, cleaners, stagers, handymen, sign installers, couriers and other approved vendors around a listing or transaction.'),
  ('Relocation & Move Coordination for Real Estate Clients', 'DNI-03A-026', 150, 'FIXED', 'ONETIME',
   'Coordination of move-related vendors, access, deliveries, household setup, errands and transition tasks before and after a real-estate transaction.')
;

UPDATE public.dd_master_service_universe m
SET lifecycle_status = 'CANONICAL_ACTIVE', canonical_sku = t.canonical_sku, commercial_object_type = 'SERV', updated_at = now()
FROM tmp_d03_new t
WHERE m.service_name = t.service_name AND m.lifecycle_status = 'PRESERVED_CANDIDATE';

UPDATE public.services s
SET commercial_status = 'CANONICAL_ACTIVE', pricing_type = t.pricing_type, billing_cycle = t.billing_cycle,
    starting_price = t.price_dollars, description = t.description, resident_discount_eligible = false,
    service_family = 'Real Estate & Closing Support', updated_at = now()
FROM tmp_d03_new t
WHERE s.name = t.service_name AND s.commercial_status = 'PENDING_RECONCILIATION';

INSERT INTO public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT s.id, ch, t.pricing_type, round(t.price_dollars * 100)::int, 'USD', t.billing_cycle, 'LOCKED', false, 'STANDARD', current_date, 'ACTIVE'
FROM tmp_d03_new t
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
  'Reconciled from PRESERVED_CANDIDATE 2026-09-17: distinct from existing Division-03A services after side-by-side adjudication (see migration notes). No authorized provider yet -- real-estate transaction/vendor-coordination work Danielle has not confirmed she performs herself; priced and catalogued but intentionally not checkout-eligible until a real provider is authorized.',
  'OWNER_DIRECTED_CATALOG_COMPLETION'
FROM tmp_d03_new t
JOIN public.services s ON s.name = t.service_name
JOIN public.dd_master_service_universe m ON m.canonical_sku = t.canonical_sku;

DROP TABLE tmp_d03_new;
