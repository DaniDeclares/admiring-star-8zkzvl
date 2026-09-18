-- Adds the real Events & Community Support packages from the Dani Declares Master Pricebook,
-- plus a new premium "Full-Service Destination Event Planning & Budget Management" tier per
-- Danielle's explicit request ("full destination events and things that could utilize my other
-- services and divisions"). The premium tier is priced as a 15% planning-fee-of-budget model,
-- matching the real precedent from her actual $80,000-budget Wiseman wedding contract (15%/
-- $12,000 non-refundable planning fee) -- not a guessed number. It is explicitly designed to
-- pull in cross-division services (property/venue turnover prep, cleaning, notary/officiant,
-- DTF merch, courier/field support) as part of one coordinated package. Authorized to Danielle.

CREATE TEMP TABLE tmp_div10 (
  service_name text PRIMARY KEY, canonical_sku text, price_dollars numeric,
  pricing_type text, description text
);
INSERT INTO tmp_div10 (service_name, canonical_sku, price_dollars, pricing_type, description) VALUES
  ('Event Admin Planning Pack', 'DNI-10A-029', 275, 'FIXED', 'Event checklist, vendor/contact sheet, supply list, timeline, and day-of task map. Excludes venue booking, permits, or purchases.'),
  ('Resident Appreciation Micro Event', 'DNI-10A-030', 750, 'FIXED', 'Planning support, setup map, vendor coordination, check-in plan, and 3-hour event support (coordination base; supplies/food/rentals/extra staff separate). Excludes permits, security, alcohol service, or licensed catering.'),
  ('Setup / Breakdown Support', 'DNI-10A-031', 450, 'FIXED', 'Up to 3 hours setup/breakdown support for tables, signage, packets, guest flow, and cleanup coordination. Excludes large equipment rental or janitorial deep clean.'),
  ('Vendor Fair Operations Pack', 'DNI-10A-032', 950, 'FIXED', 'Vendor outreach tracker, layout, check-in materials, day-of support, vendor coordination, and post-event report. Excludes guaranteed vendor attendance or sponsorship sales.'),
  ('Day-Of Coordination', 'DNI-10A-033', 1250, 'FIXED', 'Timeline management, vendor check-in, client updates, guest flow support, issue log, and end-of-event handoff. Excludes wedding planner liability, permits, security, alcohol, or licensed services.'),
  ('Full-Service Destination Event Planning & Budget Management', 'DNI-10A-034', 0, 'VARIABLE_QUOTE', 'Full-service event/wedding planning and client-budget management for destination or large-scale events, coordinated across Dani Declares'' other divisions (property/venue turnover prep, cleaning, notary/officiant services, DTF custom merch, courier and field support). Planning fee is 15% of the total event budget, non-refundable, matching Danielle''s real prior contract structure -- not a flat price; quoted per event after budget, location, and scope are confirmed. Dani Declares holds and disburses vendor funds per the signed agreement for that event.')
;
INSERT INTO public.services (id, name, slug, sku, division_id, service_family, commercial_status, pricing_type, billing_cycle, starting_price, description, resident_discount_eligible, created_at, updated_at)
SELECT gen_random_uuid(), t.service_name, lower(t.canonical_sku), t.canonical_sku, 10, '10A Events & Community Support', 'CANONICAL_ACTIVE', t.pricing_type, 'ONETIME', t.price_dollars, t.description, false, now(), now()
FROM tmp_div10 t;
INSERT INTO public.dd_master_service_universe (id, division, service_name, scope, canonical_sku, commercial_object_type, lifecycle_status, source_authority, created_at, updated_at)
SELECT gen_random_uuid(), '10', t.service_name, t.description, t.canonical_sku, 'SERV', 'CANONICAL_ACTIVE', 'OWNER_MASTER_PRICEBOOK_AND_REAL_CONTRACT_2026-09-18', now(), now()
FROM tmp_div10 t;
INSERT INTO public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT s.id, ch, t.pricing_type, round(t.price_dollars * 100)::int, 'USD', 'ONETIME', 'LOCKED', false, 'STANDARD', current_date, 'ACTIVE'
FROM tmp_div10 t JOIN public.services s ON s.sku = t.canonical_sku CROSS JOIN unnest(ARRAY['CH01','CH02','CH03','CH04','CH05']) AS ch;
INSERT INTO public.dd_governed_service_offers (master_record_id, canonical_sku, service_name, division, commercial_object_type, runtime_service_id, pricing_rule_count, market_rule_count, channel_availability_count, authorized_provider_capability_count, priced_channel_count, ch01_a_priced, ch01_b_priced, commercial_offer_status, fulfillment_gate_status, offer_basis, source_authority)
SELECT m.id, m.canonical_sku, m.service_name, m.division, m.commercial_object_type, s.id, 5, 0, 0, 1, 5,
  CASE WHEN t.pricing_type = 'VARIABLE_QUOTE' THEN false ELSE true END, false,
  CASE WHEN t.pricing_type = 'VARIABLE_QUOTE' THEN 'INTAKE_ONLY' ELSE 'SELL_NOW' END,
  'READY',
  'Added 2026-09-18 from the Dani Declares Master Pricebook and (for the destination tier) the real Wiseman contract precedent, per owner instruction to upgrade the event division for full destination events.',
  'OWNER_MASTER_PRICEBOOK_AND_REAL_CONTRACT_2026-09-18'
FROM tmp_div10 t JOIN public.services s ON s.sku = t.canonical_sku JOIN public.dd_master_service_universe m ON m.canonical_sku = t.canonical_sku;
INSERT INTO public.dd_provider_capabilities (provider_org_id, provider_id, service_id, service_line, capability_key, is_authorized, tier_availability)
SELECT '19c10267-898f-4c10-a25e-186f6aff8771', 'acba894f-a8c7-4156-b981-fa08acc9e65b', s.id, t.service_name, 'EVENT_PLANNING', true, '{}'::jsonb
FROM tmp_div10 t JOIN public.services s ON s.sku = t.canonical_sku;
DROP TABLE tmp_div10;
