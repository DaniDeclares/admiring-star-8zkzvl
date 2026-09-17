-- Division 11 (Creative Design & Production) has 7 PRESERVED_CANDIDATE rows against 20
-- already-canonical, mostly generic-stub Division-11A print/design/production services.
--
-- All 7 are genuinely distinct from the existing 20 and from each other -- unlike most
-- other divisions, this one's canonical list covers a specific, non-overlapping set of
-- print/design products (logos, business cards, flyers, brochures, apparel, generic
-- signage/packaging-adjacent items) that none of these 7 duplicate:
--   - Custom Gift Design: personalized gift concepts/artwork/packaging, distinct from the
--     physical Custom Product Fabrication SKU (this is design, not fabrication).
--   - Digital Template Design: REUSABLE branded template systems (documents, social,
--     presentations, forms), distinct from one-off Presentation Design / Social Graphic
--     Design / Digital Workbook Design, which are single finished deliverables.
--   - Event Signage Production: a coordination-premium bundle across several sign types
--     (welcome boards, directional, table signs) plus production coordination for an
--     event, distinct from the single-item, generic Signage Design SKU -- same
--     "coordination premium" pattern used in Divisions 02/03/07/08.
--   - NFC & QR Product Design: modern tech-enabled branded product design with no
--     existing equivalent SKU.
--   - Packaging Design: no packaging-design SKU exists in the canonical 20 at all.
--   - Wedding & Event Keepsake Design: a distinct wedding/event-specific product niche
--     (favors, commemorative pieces), narrower and market-specific vs. the general
--     Custom Gift Design.
--   - Wedding Stationery Design: a distinct, well-recognized wedding-paper-goods product
--     category with no existing equivalent.
-- Priced against the existing $25-$399 Division-11A rate ladder.
-- Danielle holds zero authorized capabilities anywhere in Division 11 (checked before
-- writing this) -- no authorizations added.

CREATE TEMP TABLE tmp_d11_new (
  service_name text PRIMARY KEY,
  canonical_sku text,
  price_dollars numeric,
  description text
);

INSERT INTO tmp_d11_new (service_name, canonical_sku, price_dollars, description) VALUES
  ('Custom Gift Design', 'DNI-11A-021', 150,
   'Design of personalized gift concepts, artwork, packaging and presentation components for clients, employees, residents or event guests.'),
  ('Digital Template Design', 'DNI-11A-022', 199,
   'Creation of reusable branded templates for documents, social graphics, presentations, forms or client communications.'),
  ('Event Signage Production', 'DNI-11A-023', 225,
   'Design and production coordination of event signs, welcome boards, directional signs, table signs and related display materials.'),
  ('NFC & QR Product Design', 'DNI-11A-024', 150,
   'Design and configuration of branded NFC and QR-enabled cards, stands, tags and related customer-experience products.'),
  ('Packaging Design', 'DNI-11A-025', 199,
   'Design of branded packaging concepts, labels, inserts and production-ready artwork for approved products.'),
  ('Wedding & Event Keepsake Design', 'DNI-11A-026', 125,
   'Design of personalized keepsakes, favors, commemorative pieces and related artwork for weddings and events.'),
  ('Wedding Stationery Design', 'DNI-11A-027', 225,
   'Design of coordinated invitations, programs, menus, place cards, signage and related wedding paper goods.')
;

UPDATE public.dd_master_service_universe m
SET lifecycle_status = 'CANONICAL_ACTIVE', canonical_sku = t.canonical_sku, commercial_object_type = 'SERV', updated_at = now()
FROM tmp_d11_new t
WHERE m.service_name = t.service_name AND m.lifecycle_status = 'PRESERVED_CANDIDATE';

UPDATE public.services s
SET commercial_status = 'CANONICAL_ACTIVE', pricing_type = 'FIXED', billing_cycle = 'ONETIME',
    starting_price = t.price_dollars, description = t.description, resident_discount_eligible = false,
    service_family = 'Creative Design & Production', updated_at = now()
FROM tmp_d11_new t
WHERE s.name = t.service_name AND s.commercial_status = 'PENDING_RECONCILIATION';

INSERT INTO public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT s.id, ch, 'FIXED', round(t.price_dollars * 100)::int, 'USD', 'ONETIME', 'LOCKED', false, 'STANDARD', current_date, 'ACTIVE'
FROM tmp_d11_new t
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
  'Reconciled from PRESERVED_CANDIDATE 2026-09-17: distinct from existing Division-11A services after side-by-side adjudication (see migration notes). No authorized provider yet -- Danielle has not confirmed she performs this work; priced and catalogued but intentionally not checkout-eligible until a real provider is authorized.',
  'OWNER_DIRECTED_CATALOG_COMPLETION'
FROM tmp_d11_new t
JOIN public.services s ON s.name = t.service_name
JOIN public.dd_master_service_universe m ON m.canonical_sku = t.canonical_sku;

DROP TABLE tmp_d11_new;
