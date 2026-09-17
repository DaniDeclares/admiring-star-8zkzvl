-- Division 10 (Events & Experiences) has 6 PRESERVED_CANDIDATE rows, all wedding-related,
-- against 22 already-canonical services (mostly generic SOW-priced event-service stubs,
-- plus the real Wedding Day Coordination and Wedding Officiant Services SKUs).
--
-- All 6 are genuinely distinct from the generic stubs and from each other -- weddings are
-- a separately-recognized service line on this site (dedicated Weddings page/gallery) and
-- each candidate covers a different phase or specific product within it, none duplicating
-- the day-of-only scope of Wedding Day Coordination or the officiant-only scope of Wedding
-- Officiant Services:
--   - Elopement Ceremony Coordination: a bounded, fixed-scope intimate-ceremony package
--   - Vow Renewal Ceremonies: a distinct life-event ceremony, including officiation support
--   - Wedding Rehearsal Management: the rehearsal event specifically, not wedding day itself
--   - Wedding Guest Concierge: ongoing guest-facing lodging/travel/communications support
--     across the event window, distinct from day-of Guest Flow Planning
--   - Destination Wedding Planning: broadest scope (travel, lodging, venue sourcing) --
--     priced above Corporate Event Coordination given the added destination complexity
--   - Wedding Weekend Experience Management: a coordination-premium package bundling
--     rehearsal + welcome events + ceremony + reception across a whole weekend, priced
--     above the single-day Wedding Day Coordination it partially spans
-- Priced against the existing $175-$1500 Division-10A rate ladder, using services-level
-- pricing_type='SOW' (which maps to dd_service_pricing_rules.pricing_type='VARIABLE_QUOTE',
-- the existing precedent for this division's SOW-priced services) for the higher-variance
-- services, and 'FIXED' for the two bounded-scope ceremony packages.
--
-- Danielle already holds one real authorized capability in this division --
-- OFFICIANT_ORDAINED, tied to the live Wedding Officiant Services SKU. Vow Renewal
-- Ceremonies is fundamentally the same skill (an ordained officiant performing a
-- ceremony), just for a different life event, so she is authorized on it too using the
-- identical capability_key. The other 5 are coordination/planning/logistics roles she has
-- not confirmed she performs, consistent with the posture in every other division --
-- no authorization added for those.

CREATE TEMP TABLE tmp_d10_new (
  service_name text PRIMARY KEY,
  canonical_sku text,
  price_dollars numeric,
  pricing_type text,
  rule_pricing_type text,
  description text
);

INSERT INTO tmp_d10_new (service_name, canonical_sku, price_dollars, pricing_type, rule_pricing_type, description) VALUES
  ('Elopement Ceremony Coordination', 'DNI-10A-023', 450, 'FIXED', 'FIXED',
   'Planning and coordination of intimate elopement ceremonies, including timeline, location logistics, officiation coordination and guest details.'),
  ('Vow Renewal Ceremonies', 'DNI-10A-024', 350, 'FIXED', 'FIXED',
   'Planning and officiation support for vow-renewal ceremonies, including ceremony structure, personalization and event coordination.'),
  ('Wedding Rehearsal Management', 'DNI-10A-025', 300, 'FIXED', 'FIXED',
   'On-site rehearsal coordination including participant flow, ceremony cues, timing, vendor communication and rehearsal-day readiness.'),
  ('Wedding Guest Concierge', 'DNI-10A-026', 350, 'SOW', 'VARIABLE_QUOTE',
   'Guest-facing support for lodging information, itineraries, transportation coordination, welcome materials, local recommendations and event communications.'),
  ('Destination Wedding Planning', 'DNI-10A-027', 2500, 'SOW', 'VARIABLE_QUOTE',
   'End-to-end coordination for weddings outside the client''s home market, including vendors, travel, lodging, venue, guest logistics and event execution through approved partners.'),
  ('Wedding Weekend Experience Management', 'DNI-10A-028', 1750, 'SOW', 'VARIABLE_QUOTE',
   'Integrated coordination of rehearsal, welcome events, ceremony, reception and guest experiences across a wedding weekend.')
;

UPDATE public.dd_master_service_universe m
SET lifecycle_status = 'CANONICAL_ACTIVE', canonical_sku = t.canonical_sku, commercial_object_type = 'SERV', updated_at = now()
FROM tmp_d10_new t
WHERE m.service_name = t.service_name AND m.lifecycle_status = 'PRESERVED_CANDIDATE';

UPDATE public.services s
SET commercial_status = 'CANONICAL_ACTIVE', pricing_type = t.pricing_type, billing_cycle = 'ONETIME',
    starting_price = t.price_dollars, description = t.description, resident_discount_eligible = false,
    service_family = 'Events & Experiences', updated_at = now()
FROM tmp_d10_new t
WHERE s.name = t.service_name AND s.commercial_status = 'PENDING_RECONCILIATION';

INSERT INTO public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT s.id, ch, t.rule_pricing_type, round(t.price_dollars * 100)::int, 'USD', 'ONETIME', 'LOCKED', false, 'STANDARD', current_date, 'ACTIVE'
FROM tmp_d10_new t
JOIN public.services s ON s.name = t.service_name
CROSS JOIN unnest(ARRAY['CH01','CH02','CH03','CH04','CH05']) AS ch;

INSERT INTO public.dd_governed_service_offers (
  master_record_id, canonical_sku, service_name, division, commercial_object_type, runtime_service_id,
  pricing_rule_count, market_rule_count, channel_availability_count, authorized_provider_capability_count,
  priced_channel_count, ch01_a_priced, ch01_b_priced, commercial_offer_status, fulfillment_gate_status,
  offer_basis, source_authority
)
SELECT m.id, m.canonical_sku, m.service_name, m.division, m.commercial_object_type, s.id,
  5, 0, 0,
  CASE WHEN t.service_name = 'Vow Renewal Ceremonies' THEN 1 ELSE 0 END,
  5, true, false,
  'SELL_NOW',
  'READY',
  CASE WHEN t.service_name = 'Vow Renewal Ceremonies'
    THEN 'Reconciled from PRESERVED_CANDIDATE 2026-09-17: distinct wedding-line service after side-by-side adjudication (see migration notes). Authorized to Danielle under her existing OFFICIANT_ORDAINED capability -- same ceremony-officiating skill already confirmed for Wedding Officiant Services, applied to a vow-renewal ceremony.'
    ELSE 'Reconciled from PRESERVED_CANDIDATE 2026-09-17: distinct wedding-line service after side-by-side adjudication (see migration notes). No authorized provider yet -- coordination/planning role Danielle has not confirmed she performs herself; priced and catalogued but intentionally not checkout-eligible until a real provider is authorized.'
  END,
  'OWNER_DIRECTED_CATALOG_COMPLETION'
FROM tmp_d10_new t
JOIN public.services s ON s.name = t.service_name
JOIN public.dd_master_service_universe m ON m.canonical_sku = t.canonical_sku;

-- Authorize Danielle on Vow Renewal Ceremonies using her existing officiant capability.
INSERT INTO public.dd_provider_capabilities (provider_org_id, service_id, service_line, capability_key, is_authorized, tier_availability)
SELECT '19c10267-898f-4c10-a25e-186f6aff8771', s.id, 'Vow Renewal Ceremonies', 'OFFICIANT_ORDAINED', true, '{}'::jsonb
FROM public.services s WHERE s.name = 'Vow Renewal Ceremonies';

DROP TABLE tmp_d10_new;
