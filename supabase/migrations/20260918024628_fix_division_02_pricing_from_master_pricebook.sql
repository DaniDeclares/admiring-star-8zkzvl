-- Fixes the long-flagged Division 02 underpricing ("It is too low. Fix it.") by adding the real
-- Property Operations & Turnover, Documentation & Reporting, Field Support/Logistics/Courier,
-- and Resident Services & Leasing Office package tiers from the Dani Declares Master Pricebook
-- (June 21, 2026) -- the most disciplined, self-sourced pricing document reviewed this session.
-- These are coordination/package-tier SKUs distinct from (and priced well above) the existing
-- granular per-task Division 02 services; they coexist rather than replace. All authorized
-- immediately to Danielle -- these are admin/coordination/documentation services she performs
-- personally, same pattern as her existing Division 02/04 authorizations.

CREATE TEMP TABLE tmp_div02 (
  service_name text PRIMARY KEY,
  canonical_sku text,
  price_dollars numeric,
  description text
);

INSERT INTO tmp_div02 (service_name, canonical_sku, price_dollars, description) VALUES
  ('Turnover Scout', 'DNI-02A-023', 125, 'One local walkthrough, basic photos, issue notes, readiness blockers, and same-day summary. Excludes cleaning, hauling, repair work, or vendor payment.'),
  ('Final Walkthrough Prep Package', 'DNI-02A-024', 175, 'Readiness checklist, light staging/reset notes, photos, and handoff list before leasing/showing. Excludes repairs, deep cleaning, or trash hauling.'),
  ('Turnover Ready Basic', 'DNI-02A-025', 375, 'Coordination and light readiness support for one small unit: checklist, photo documentation, reset coordination, final report. Excludes heavy cleaning, repairs, hauling, pest, hazardous material.'),
  ('Turnover Ready Standard', 'DNI-02A-026', 650, 'Expanded turnover coordination, before/after documentation, light admin coordination, vendor handoff, final readiness report. Excludes licensed trades, heavy trash-out, guaranteed occupancy approval.'),
  ('Turnover Ready Premium', 'DNI-02A-027', 950, 'Priority turnover support with kickoff, vendor coordination, documentation, progress updates, final walkthrough, and management-ready report. Excludes repairs, regulated remediation, or unconfirmed crew labor.'),
  ('Trash-Out Coordination Package', 'DNI-02A-028', 225, 'Scope intake, photo documentation, vendor coordination, removal schedule, and completion confirmation. Vendor/dump/pass-through costs billed separately. Excludes self-hauling unless confirmed; hazardous material.'),
  ('Move-In / Move-Out Photo Report', 'DNI-02A-029', 150, 'Structured photo capture, room-by-room labels, basic condition notes, and PDF summary. Excludes formal inspection certification or repair estimates.'),
  ('Before & After Report', 'DNI-02A-030', 225, 'Before/after photo set, completion notes, timestamped summary, and issue escalation list. Excludes inspection certification or warranty of vendor work.'),
  ('Property Condition Report', 'DNI-02A-031', 275, 'Expanded condition documentation with photos, issue categories, risk flags, and recommended next actions. Excludes licensed inspection, appraisal, or legal compliance finding.'),
  ('Vendor Verification Photo Report', 'DNI-02A-032', 175, 'Visit/photo verification that vendor appeared, work status, visible completion notes, and management update. Excludes quality certification or contractor supervision.'),
  ('Damage Documentation Pack', 'DNI-02A-033', 225, 'Photo capture, visible damage notes, location labels, and incident documentation packet. Excludes insurance adjusting, causation opinion, or legal conclusion.'),
  ('Local Field Visit', 'DNI-02A-034', 95, 'One local site visit for check, pickup, delivery, photo, or confirmation task within base area. Excludes transporting people, hazardous items, or regulated goods.'),
  ('Notice Posting Run', 'DNI-02A-035', 125, 'Posting support at one property, basic proof photo, date/time log, and completion note ($125 first door + $10/additional). Excludes legal service of process or eviction/legal advice.'),
  ('Document Courier Run', 'DNI-02A-036', 95, 'Pickup/drop-off of documents or small business items with proof-of-delivery note ($95 first stop + $35/additional). Excludes courier insurance claims, medical specimens, people transport.'),
  ('Supply Run', 'DNI-02A-037', 125, 'Pickup, purchase coordination from approved list, delivery, receipt photo, and completion note, plus reimbursement. Excludes unapproved purchases or large hauling.'),
  ('After-Hours Field Support', 'DNI-02A-038', 175, 'Urgent evening/weekend field support for one defined task and completion update. Excludes emergency services, security, or regulated work.'),
  ('Move-In Packet Assembly', 'DNI-02A-039', 175, 'Print/sort/assemble packet from approved materials, checklist, and handoff bundle for first 25 packets ($3 each additional). Excludes content drafting unless quoted.'),
  ('Resident Document Collection Support', 'DNI-02A-040', 225, 'Collection checklist, resident follow-up script, document status tracker, and handoff report. Excludes legal notices, collections, or advice.'),
  ('Leasing Office Half-Day Support', 'DNI-02A-041', 325, 'Up to 4 hours of on-site/remote admin support, filing, scanning, packets, data entry, and office overflow. Excludes employee staffing guarantee or licensed property management.'),
  ('Leasing Office Full-Day Support', 'DNI-02A-042', 575, 'Up to 8 hours of admin/office overflow support with task list, completion notes, and handoff. Excludes leasing authority, signing contracts, or regulated property management.')
;

INSERT INTO public.services (id, name, slug, sku, division_id, service_family, commercial_status, pricing_type, billing_cycle, starting_price, description, resident_discount_eligible, created_at, updated_at)
SELECT gen_random_uuid(), t.service_name, lower(t.canonical_sku), t.canonical_sku, 2, '02A Property Operations & Turnover Packages', 'CANONICAL_ACTIVE', 'FIXED', 'ONETIME', t.price_dollars, t.description, false, now(), now()
FROM tmp_div02 t;

INSERT INTO public.dd_master_service_universe (id, division, service_name, scope, canonical_sku, commercial_object_type, lifecycle_status, source_authority, created_at, updated_at)
SELECT gen_random_uuid(), '02', t.service_name, t.description, t.canonical_sku, 'SERV', 'CANONICAL_ACTIVE', 'OWNER_MASTER_PRICEBOOK_2026-09-18', now(), now()
FROM tmp_div02 t;

INSERT INTO public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT s.id, ch, 'FIXED', round(t.price_dollars * 100)::int, 'USD', 'ONETIME', 'LOCKED', false, 'STANDARD', current_date, 'ACTIVE'
FROM tmp_div02 t
JOIN public.services s ON s.sku = t.canonical_sku
CROSS JOIN unnest(ARRAY['CH01','CH02','CH03','CH04','CH05']) AS ch;

INSERT INTO public.dd_governed_service_offers (
  master_record_id, canonical_sku, service_name, division, commercial_object_type, runtime_service_id,
  pricing_rule_count, market_rule_count, channel_availability_count, authorized_provider_capability_count,
  priced_channel_count, ch01_a_priced, ch01_b_priced, commercial_offer_status, fulfillment_gate_status,
  offer_basis, source_authority
)
SELECT m.id, m.canonical_sku, m.service_name, m.division, m.commercial_object_type, s.id,
  5, 0, 0, 1, 5, true, false, 'SELL_NOW', 'READY',
  'Added 2026-09-18 to fix underpriced Division 02: real package pricing from the Dani Declares Master Pricebook.',
  'OWNER_MASTER_PRICEBOOK_2026-09-18'
FROM tmp_div02 t
JOIN public.services s ON s.sku = t.canonical_sku
JOIN public.dd_master_service_universe m ON m.canonical_sku = t.canonical_sku;

INSERT INTO public.dd_provider_capabilities (provider_org_id, provider_id, service_id, service_line, capability_key, is_authorized, tier_availability)
SELECT '19c10267-898f-4c10-a25e-186f6aff8771', 'acba894f-a8c7-4156-b981-fa08acc9e65b', s.id, t.service_name, 'CONCIERGE', true, '{}'::jsonb
FROM tmp_div02 t
JOIN public.services s ON s.sku = t.canonical_sku;

DROP TABLE tmp_div02;
