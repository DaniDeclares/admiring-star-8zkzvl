-- Expands Division 10 per Danielle's decision on the pasted "Events & Hospitality
-- universe" / "no money left on the table" material: she confirmed that document is
-- non-authoritative audit input, not an implementation source, and asked only to
-- "expand Events division from it" -- meaning take the STRUCTURAL idea (turn real
-- event touchpoints into billable line items) without importing any of its unsourced
-- pricing or its conflicting division taxonomy. These 3 add-ons are genuinely missing
-- coordination touchpoints for destination/large-scale events (cross-selling with the
-- real DNI-10A-034 destination tier and Cass's real Division 04 bookkeeping role), and
-- since no real sourced dollar figure exists for any of them, they are priced as
-- VARIABLE_QUOTE / INTAKE_ONLY rather than inventing a flat price -- consistent with
-- how DNI-10A-034 was handled, and with Danielle's standing rule to never fabricate
-- pricing. Authorized to Danielle; quoted per engagement.

CREATE TEMP TABLE tmp_div10b (
  service_name text PRIMARY KEY, canonical_sku text, description text
);
INSERT INTO tmp_div10b (service_name, canonical_sku, description) VALUES
  ('Guest Travel & Lodging Coordination', 'DNI-10A-035', 'Coordinates guest travel logistics, lodging-block recommendations, and multi-day itinerary planning for destination or multi-day events. Excludes booking guest travel/lodging directly or paying on a guest''s behalf; quoted per event based on guest count and complexity.'),
  ('Event Vendor Fund Disbursement & Reconciliation', 'DNI-10A-036', 'Administrative holding and disbursement of event vendor payments per the signed event agreement, with a post-event reconciliation report -- the same fund-holding structure used in Danielle''s real destination-event contract precedent. Coordinates with Division 04 bookkeeping. Excludes acting as a licensed escrow agent; quoted per event based on vendor count and total funds handled.'),
  ('Event Permit & Insurance Coordination', 'DNI-10A-037', 'Research and coordination of venue/event permit and insurance requirements, including a checklist of what''s needed and who to contact. Excludes procuring insurance, filing permits, or accepting liability on the client''s behalf; quoted per event based on venue and jurisdiction.')
;
INSERT INTO public.services (id, name, slug, sku, division_id, service_family, commercial_status, pricing_type, billing_cycle, starting_price, description, resident_discount_eligible, created_at, updated_at)
SELECT gen_random_uuid(), t.service_name, lower(t.canonical_sku), t.canonical_sku, 10, '10A Events & Community Support', 'CANONICAL_ACTIVE', 'VARIABLE_QUOTE', 'ONETIME', NULL, t.description, false, now(), now()
FROM tmp_div10b t;
INSERT INTO public.dd_master_service_universe (id, division, service_name, scope, canonical_sku, commercial_object_type, lifecycle_status, source_authority, created_at, updated_at)
SELECT gen_random_uuid(), '10', t.service_name, t.description, t.canonical_sku, 'SERV', 'CANONICAL_ACTIVE', 'OWNER_DECISION_2026-09-18_EVENTS_EXPANSION_NON_AUTHORITATIVE_PASTE_STRUCTURE_ONLY', now(), now()
FROM tmp_div10b t;
INSERT INTO public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT s.id, ch, 'VARIABLE_QUOTE', NULL, 'USD', 'ONETIME', 'LOCKED', false, 'STANDARD', current_date, 'ACTIVE'
FROM tmp_div10b t JOIN public.services s ON s.sku = t.canonical_sku CROSS JOIN unnest(ARRAY['CH01','CH02','CH03','CH04','CH05']) AS ch;
INSERT INTO public.dd_governed_service_offers (master_record_id, canonical_sku, service_name, division, commercial_object_type, runtime_service_id, pricing_rule_count, market_rule_count, channel_availability_count, authorized_provider_capability_count, priced_channel_count, ch01_a_priced, ch01_b_priced, commercial_offer_status, fulfillment_gate_status, offer_basis, source_authority)
SELECT m.id, m.canonical_sku, m.service_name, m.division, m.commercial_object_type, s.id, 5, 0, 0, 1, 5, false, false, 'INTAKE_ONLY', 'READY',
  'Added 2026-09-18: structural expansion of Division 10 per owner decision to use the pasted Events/Hospitality material as an idea source only, not a pricing or taxonomy source -- no dollar figure is asserted since none is sourced.',
  'OWNER_DECISION_2026-09-18_EVENTS_EXPANSION_NON_AUTHORITATIVE_PASTE_STRUCTURE_ONLY'
FROM tmp_div10b t JOIN public.services s ON s.sku = t.canonical_sku JOIN public.dd_master_service_universe m ON m.canonical_sku = t.canonical_sku;
INSERT INTO public.dd_provider_capabilities (provider_org_id, provider_id, service_id, service_line, capability_key, is_authorized, tier_availability)
SELECT '19c10267-898f-4c10-a25e-186f6aff8771', 'acba894f-a8c7-4156-b981-fa08acc9e65b', s.id, t.service_name, 'EVENT_PLANNING', true, '{}'::jsonb
FROM tmp_div10b t JOIN public.services s ON s.sku = t.canonical_sku;
DROP TABLE tmp_div10b;
