-- Division 07 (Marketing, Content & Media Production) has 8 PRESERVED_CANDIDATE rows
-- against 20 already-canonical services.
--
-- 3 are duplicates of already-live services:
--   - Email Newsletter Management -> Newsletter Production (DNI-07A-009)
--   - Review Response & Reputation Support -> Reputation Workflow (DNI-07A-013)
--   - Short-Form Video Production -> Short-Form Content (DNI-07A-007)
--
-- The other 5 are genuinely distinct: Content Performance Reporting (recurring
-- metrics/reporting, distinct from the one-time Marketing Audit), Content
-- Repurposing, Local Search Content Development (content CREATION for local
-- discoverability, distinct from the technical Local SEO Setup/Management
-- services), Real Estate Listing Media Package Coordination (a vendor-coordination
-- role spanning several already-existing Division-03 media services -- same
-- "coordination premium" pattern as Listing Launch Coordination), and Social Media
-- Content Strategy (channel-specific strategy, narrower than the general Marketing
-- Strategy SKU). Priced against the existing $75-$650 Division-07A rate ladder.
-- Danielle holds zero authorized capabilities anywhere in Division 07 (checked
-- before writing this).

UPDATE public.services SET description = 'Planning, formatting, scheduling and operational management of recurring newsletters using approved content and lists.', updated_at = now()
WHERE id = '845a7cd1-d0f8-4545-819a-ec67ba019a16'; -- Newsletter Production

UPDATE public.services SET description = 'Administrative monitoring and drafting of customer-review responses using approved brand guidelines and escalation rules.', updated_at = now()
WHERE id = '4d926698-2843-4e72-a736-6c345c35915e'; -- Reputation Workflow

UPDATE public.services SET description = 'Planning, editing and packaging of short-form social videos from client-provided or approved footage.', updated_at = now()
WHERE id = '56987a25-c84f-4222-ab67-710ef6cf44a5'; -- Short-Form Content

UPDATE public.dd_master_service_universe
SET lifecycle_status = 'SUPERSEDED', conflict_register = 'Merged 2026-09-17: duplicate of already-live Newsletter Production (DNI-07A-009).'
WHERE id = '371c58f0-0ee9-4039-b91b-7a10571c7d66'; -- Email Newsletter Management

UPDATE public.dd_master_service_universe
SET lifecycle_status = 'SUPERSEDED', conflict_register = 'Merged 2026-09-17: duplicate of already-live Reputation Workflow (DNI-07A-013).'
WHERE id = '11b32ade-ab3c-4532-b193-427e480ae3eb'; -- Review Response & Reputation Support

UPDATE public.dd_master_service_universe
SET lifecycle_status = 'SUPERSEDED', conflict_register = 'Merged 2026-09-17: duplicate of already-live Short-Form Content (DNI-07A-007).'
WHERE id = 'f21cc4cd-c259-414e-a846-ebe34932f1e5'; -- Short-Form Video Production

CREATE TEMP TABLE tmp_d07_new (
  service_name text PRIMARY KEY,
  canonical_sku text,
  price_dollars numeric,
  description text
);

INSERT INTO tmp_d07_new (service_name, canonical_sku, price_dollars, description) VALUES
  ('Content Performance Reporting', 'DNI-07A-021', 150,
   'Compilation and interpretation of content metrics, engagement trends and campaign performance into recurring reports.'),
  ('Content Repurposing', 'DNI-07A-022', 199,
   'Transformation of approved existing content into posts, captions, short-form scripts, email content and website snippets.'),
  ('Local Search Content Development', 'DNI-07A-023', 299,
   'Creation of location-focused content designed to support local discoverability across websites, profiles and related channels.'),
  ('Real Estate Listing Media Package Coordination', 'DNI-07A-024', 250,
   'Coordination of photography, video, floor plans, virtual tours and related listing-media deliverables across approved vendors.'),
  ('Social Media Content Strategy', 'DNI-07A-025', 275,
   'Development of channel-specific content themes, posting cadence, content pillars, audience positioning and campaign direction.')
;

UPDATE public.dd_master_service_universe m
SET lifecycle_status = 'CANONICAL_ACTIVE', canonical_sku = t.canonical_sku, commercial_object_type = 'SERV', updated_at = now()
FROM tmp_d07_new t
WHERE m.service_name = t.service_name AND m.lifecycle_status = 'PRESERVED_CANDIDATE';

UPDATE public.services s
SET commercial_status = 'CANONICAL_ACTIVE', pricing_type = 'FIXED', billing_cycle = 'ONETIME',
    starting_price = t.price_dollars, description = t.description, resident_discount_eligible = false,
    service_family = 'Marketing, Content & Media Production', updated_at = now()
FROM tmp_d07_new t
WHERE s.name = t.service_name AND s.commercial_status = 'PENDING_RECONCILIATION';

INSERT INTO public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT s.id, ch, 'FIXED', round(t.price_dollars * 100)::int, 'USD', 'ONETIME', 'LOCKED', false, 'STANDARD', current_date, 'ACTIVE'
FROM tmp_d07_new t
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
  'Reconciled from PRESERVED_CANDIDATE 2026-09-17: distinct from existing Division-07A services after side-by-side adjudication (see migration notes). No authorized provider yet -- Danielle has not confirmed she performs this work; priced and catalogued but intentionally not checkout-eligible until a real provider is authorized.',
  'OWNER_DIRECTED_CATALOG_COMPLETION'
FROM tmp_d07_new t
JOIN public.services s ON s.name = t.service_name
JOIN public.dd_master_service_universe m ON m.canonical_sku = t.canonical_sku;

DROP TABLE tmp_d07_new;
