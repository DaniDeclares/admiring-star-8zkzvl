-- Adds the real Website, Booking & Payments packages from the Dani Declares Master Pricebook,
-- per Danielle's "yes to pricebook pass." Authorized to Danielle.

CREATE TEMP TABLE tmp_div06 (
  service_name text PRIMARY KEY, canonical_sku text, price_dollars numeric, description text
);
INSERT INTO tmp_div06 (service_name, canonical_sku, price_dollars, description) VALUES
  ('Website Copy Refresh', 'DNI-06A-027', 450, 'Copy cleanup for one page, service positioning, CTA language, and risk-safe wording notes. Excludes website development or platform setup unless quoted.'),
  ('Service Menu / Pricing Page Copy', 'DNI-06A-028', 375, 'Public-facing service menu or pricing summary copy based on approved locked prices. Excludes publishing live updates unless approved.'),
  ('Booking + Payment Setup Map', 'DNI-06A-029', 350, 'Recommended booking flow, payment terms, deposit rules, intake fields, and automation checklist. Excludes payment processor underwriting or legal terms review.')
;
INSERT INTO public.services (id, name, slug, sku, division_id, service_family, commercial_status, pricing_type, billing_cycle, starting_price, description, resident_discount_eligible, created_at, updated_at)
SELECT gen_random_uuid(), t.service_name, lower(t.canonical_sku), t.canonical_sku, 6, '06A Website, Booking & Payments', 'CANONICAL_ACTIVE', 'FIXED', 'ONETIME', t.price_dollars, t.description, false, now(), now()
FROM tmp_div06 t;
INSERT INTO public.dd_master_service_universe (id, division, service_name, scope, canonical_sku, commercial_object_type, lifecycle_status, source_authority, created_at, updated_at)
SELECT gen_random_uuid(), '06', t.service_name, t.description, t.canonical_sku, 'SERV', 'CANONICAL_ACTIVE', 'OWNER_MASTER_PRICEBOOK_2026-09-18', now(), now()
FROM tmp_div06 t;
INSERT INTO public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT s.id, ch, 'FIXED', round(t.price_dollars * 100)::int, 'USD', 'ONETIME', 'LOCKED', false, 'STANDARD', current_date, 'ACTIVE'
FROM tmp_div06 t JOIN public.services s ON s.sku = t.canonical_sku CROSS JOIN unnest(ARRAY['CH01','CH02','CH03','CH04','CH05']) AS ch;
INSERT INTO public.dd_governed_service_offers (master_record_id, canonical_sku, service_name, division, commercial_object_type, runtime_service_id, pricing_rule_count, market_rule_count, channel_availability_count, authorized_provider_capability_count, priced_channel_count, ch01_a_priced, ch01_b_priced, commercial_offer_status, fulfillment_gate_status, offer_basis, source_authority)
SELECT m.id, m.canonical_sku, m.service_name, m.division, m.commercial_object_type, s.id, 5, 0, 0, 1, 5, true, false, 'SELL_NOW', 'READY', 'Added 2026-09-18 from the Dani Declares Master Pricebook per owner instruction.', 'OWNER_MASTER_PRICEBOOK_2026-09-18'
FROM tmp_div06 t JOIN public.services s ON s.sku = t.canonical_sku JOIN public.dd_master_service_universe m ON m.canonical_sku = t.canonical_sku;
INSERT INTO public.dd_provider_capabilities (provider_org_id, provider_id, service_id, service_line, capability_key, is_authorized, tier_availability)
SELECT '19c10267-898f-4c10-a25e-186f6aff8771', 'acba894f-a8c7-4156-b981-fa08acc9e65b', s.id, t.service_name, 'BUSINESS_OPERATIONS_CONSULTING', true, '{}'::jsonb
FROM tmp_div06 t JOIN public.services s ON s.sku = t.canonical_sku;
DROP TABLE tmp_div06;
