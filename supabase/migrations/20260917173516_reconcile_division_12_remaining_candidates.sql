-- Division 12 (Logistics, Courier & Asset Sourcing) has 7 PRESERVED_CANDIDATE rows
-- against 24 already-canonical, mostly generic-stub Division-12A services.
--
-- 1 is a duplicate of an already-live service:
--   - Asset Staging & Placement Logistics -> Asset Deployment (DNI-12A-012) (deploying/
--     placing assets per client instructions is exactly what "Asset Deployment" names)
--
-- The other 6 are genuinely distinct:
--   - Event Load-In & Load-Out Logistics: on-site setup/breakdown movement coordination,
--     distinct from the simple point-to-point Event Delivery SKU.
--   - Guest Transportation Coordination: administrative coordination of transportation
--     providers/schedules for guests, no existing equivalent.
--   - Multi-Stop Route Coordination: ad-hoc planning/sequencing of a multi-stop run for a
--     given day, distinct from Scheduled Route Delivery (a standing recurring route).
--   - Property Supply Procurement & Delivery: a bundled sourcing-plus-delivery
--     coordination premium for property clients specifically, above the single-step
--     Supply Delivery / Material Sourcing / Product Sourcing SKUs it combines.
--   - Wedding Logistics Coordination: a wedding-specific coordination premium spanning
--     transportation, deliveries, pickups and load-in/out for wedding vendors/assets.
--   - Wedding Welcome Bag Assembly & Delivery: a specific assembly-plus-delivery product
--     with no existing equivalent.
-- Priced against the existing $45-$145 Division-12A rate ladder.
-- Danielle holds zero authorized capabilities anywhere in Division 12 (checked before
-- writing this) -- no authorizations added.

UPDATE public.services SET description = 'Movement and placement coordination for approved assets at properties, offices, venues or events according to client instructions.', updated_at = now()
WHERE id = 'f86f17d4-c7d1-414f-a2a6-780caab37b11'; -- Asset Deployment

UPDATE public.dd_master_service_universe
SET lifecycle_status = 'SUPERSEDED',
    conflict_register = 'Merged 2026-09-17: duplicate of already-live Asset Deployment (DNI-12A-012).'
WHERE service_name = 'Asset Staging & Placement Logistics' AND lifecycle_status = 'PRESERVED_CANDIDATE';

CREATE TEMP TABLE tmp_d12_new (
  service_name text PRIMARY KEY,
  canonical_sku text,
  price_dollars numeric,
  description text
);

INSERT INTO tmp_d12_new (service_name, canonical_sku, price_dollars, description) VALUES
  ('Event Load-In & Load-Out Logistics', 'DNI-12A-029', 150,
   'Operational movement coordination for event equipment, decor, materials and supplies during setup and breakdown windows.'),
  ('Guest Transportation Coordination', 'DNI-12A-030', 95,
   'Administrative coordination of approved guest transportation providers, schedules, pickup points and itinerary communication.'),
  ('Multi-Stop Route Coordination', 'DNI-12A-031', 110,
   'Planning and coordination of multi-stop pickup and delivery routes for approved assets, documents, supplies or event materials.'),
  ('Property Supply Procurement & Delivery', 'DNI-12A-032', 125,
   'Sourcing and delivery coordination for approved property supplies, materials and consumables.'),
  ('Wedding Logistics Coordination', 'DNI-12A-033', 250,
   'Coordination of transportation, deliveries, pickups, load-in/load-out and timing for wedding-related assets and vendors.'),
  ('Wedding Welcome Bag Assembly & Delivery', 'DNI-12A-034', 95,
   'Assembly and coordinated delivery of approved welcome bags, guest materials, gifts and itinerary packets.')
;

UPDATE public.dd_master_service_universe m
SET lifecycle_status = 'CANONICAL_ACTIVE', canonical_sku = t.canonical_sku, commercial_object_type = 'SERV', updated_at = now()
FROM tmp_d12_new t
WHERE m.service_name = t.service_name AND m.lifecycle_status = 'PRESERVED_CANDIDATE';

UPDATE public.services s
SET commercial_status = 'CANONICAL_ACTIVE', pricing_type = 'FIXED', billing_cycle = 'ONETIME',
    starting_price = t.price_dollars, description = t.description, resident_discount_eligible = false,
    service_family = 'Logistics, Courier & Asset Sourcing', updated_at = now()
FROM tmp_d12_new t
WHERE s.name = t.service_name AND s.commercial_status = 'PENDING_RECONCILIATION';

INSERT INTO public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT s.id, ch, 'FIXED', round(t.price_dollars * 100)::int, 'USD', 'ONETIME', 'LOCKED', false, 'STANDARD', current_date, 'ACTIVE'
FROM tmp_d12_new t
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
  'Reconciled from PRESERVED_CANDIDATE 2026-09-17: distinct from existing Division-12A services after side-by-side adjudication (see migration notes). No authorized provider yet -- Danielle has not confirmed she performs this work; priced and catalogued but intentionally not checkout-eligible until a real provider is authorized.',
  'OWNER_DIRECTED_CATALOG_COMPLETION'
FROM tmp_d12_new t
JOIN public.services s ON s.name = t.service_name
JOIN public.dd_master_service_universe m ON m.canonical_sku = t.canonical_sku;

DROP TABLE tmp_d12_new;
