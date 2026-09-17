-- Division 06 (Business Formation & Digital Infrastructure) has 8 PRESERVED_CANDIDATE
-- rows against 20 already-canonical services.
--
-- 1 is a duplicate of an already-live service:
--   - Website Launch & Migration Support -> Website Setup (DNI-06A-014)
-- 1 pair of candidates duplicate EACH OTHER (both describe auditing a business's
-- digital tools/workflows and recommending improvements) -- consolidated into one:
--   - Digital Business Systems Audit -> merged into Business Technology Assessment
--
-- The remaining 6 are genuinely distinct from anything already live and from each
-- other: Business Technology Assessment (the audit survivor above), Cloud Storage
-- Setup & Migration, CRM & Client Portal Setup, Digital Security & Account
-- Organization, Online Booking System Setup, Payment System Setup Support. Priced
-- against the existing $99-$399 Division-06A IT/business-setup rate ladder.
-- Danielle holds zero authorized capabilities anywhere in Division 06 (checked before
-- writing this) -- none of these are work she's confirmed she performs.

-- Merge the 1 duplicate-of-canonical.
UPDATE public.services
SET description = 'Operational support for launching or migrating a business website, including content transfer, domain coordination, testing and launch readiness.', updated_at = now()
WHERE id = '40fce802-e98d-4d9f-9a90-d64b6fe95a51'; -- Website Setup

UPDATE public.dd_master_service_universe
SET lifecycle_status = 'SUPERSEDED',
    conflict_register = 'Merged 2026-09-17: duplicate of already-live Website Setup (DNI-06A-014). Description consolidated onto the live SKU.'
WHERE id = '2721a3a4-ccbb-4a03-860c-14568826ce91'; -- Website Launch & Migration Support

-- Merge the candidate-to-candidate duplicate: Digital Business Systems Audit folds
-- into Business Technology Assessment (which is priced as new below).
UPDATE public.dd_master_service_universe
SET lifecycle_status = 'SUPERSEDED',
    conflict_register = 'Merged 2026-09-17: duplicate of Business Technology Assessment (both candidates describe the same business-tech-audit-with-improvement-plan job). Retired in favor of that one, which is reconciled as the canonical service.'
WHERE id = '0a5ed1d6-9949-4e7f-9398-b490481d4fd7'; -- Digital Business Systems Audit

CREATE TEMP TABLE tmp_d06_new (
  service_name text PRIMARY KEY,
  canonical_sku text,
  price_dollars numeric,
  description text
);

INSERT INTO tmp_d06_new (service_name, canonical_sku, price_dollars, description) VALUES
  ('Business Technology Assessment', 'DNI-06A-021', 275,
   'Structured review of a small-business technology setup, workflows, tools and basic infrastructure with a prioritized improvement plan, including identification of duplication, gaps, manual bottlenecks and systemization opportunities.'),
  ('Cloud Storage Setup & Migration', 'DNI-06A-022', 175,
   'Setup and organization of cloud storage, folders, permissions and migration of authorized files between supported systems.'),
  ('CRM & Client Portal Setup', 'DNI-06A-023', 325,
   'Configuration of CRM and client-management structures, intake forms, pipelines, basic automations and portal organization.'),
  ('Digital Security & Account Organization', 'DNI-06A-024', 175,
   'Administrative organization of business accounts, access records, password-manager structure and basic security hygiene; no offensive security work.'),
  ('Online Booking System Setup', 'DNI-06A-025', 199,
   'Configuration of scheduling tools, service types, availability, intake questions, confirmations and client-facing booking workflows.'),
  ('Payment System Setup Support', 'DNI-06A-026', 249,
   'Administrative setup support for approved payment processors, products, checkout configuration and operational testing; account authorization remains client-controlled.')
;

UPDATE public.dd_master_service_universe m
SET lifecycle_status = 'CANONICAL_ACTIVE', canonical_sku = t.canonical_sku, commercial_object_type = 'SERV', updated_at = now()
FROM tmp_d06_new t
WHERE m.service_name = t.service_name AND m.lifecycle_status = 'PRESERVED_CANDIDATE';

UPDATE public.services s
SET commercial_status = 'CANONICAL_ACTIVE', pricing_type = 'FIXED', billing_cycle = 'ONETIME',
    starting_price = t.price_dollars, description = t.description, resident_discount_eligible = false,
    service_family = 'Business Formation & Digital Infrastructure', updated_at = now()
FROM tmp_d06_new t
WHERE s.name = t.service_name AND s.commercial_status = 'PENDING_RECONCILIATION';

INSERT INTO public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT s.id, ch, 'FIXED', round(t.price_dollars * 100)::int, 'USD', 'ONETIME', 'LOCKED', false, 'STANDARD', current_date, 'ACTIVE'
FROM tmp_d06_new t
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
  'Reconciled from PRESERVED_CANDIDATE 2026-09-17: distinct from existing Division-06A services after side-by-side adjudication (see migration notes). No authorized provider yet -- Danielle has not confirmed she performs this work; priced and catalogued but intentionally not checkout-eligible until a real provider is authorized.',
  'OWNER_DIRECTED_CATALOG_COMPLETION'
FROM tmp_d06_new t
JOIN public.services s ON s.name = t.service_name
JOIN public.dd_master_service_universe m ON m.canonical_sku = t.canonical_sku;

DROP TABLE tmp_d06_new;
