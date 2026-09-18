-- Adds the real Company Foundation & Operations, Administrative & Document Services, Document
-- Preparation & Submission Support, I-9 Verification, Government/Vendor Readiness &
-- Subcontracting, R.E.A.C.H. & Outside Company Buildouts, and Money/CRM/Follow-Up packages from
-- the Dani Declares Master Pricebook (June 21, 2026), per Danielle's explicit "yes to R.E.A.C.H."
-- and "yes to pricebook pass." R.E.A.C.H. is a real, coherent consulting line (auditing/launching
-- other people's businesses) not previously modeled anywhere in the catalog. All authorized to
-- Danielle -- these are admin/consulting/business-support services she performs personally.

CREATE TEMP TABLE tmp_div04 (
  service_name text PRIMARY KEY,
  canonical_sku text,
  price_dollars numeric,
  is_monthly boolean,
  family text,
  description text
);

INSERT INTO tmp_div04 (service_name, canonical_sku, price_dollars, is_monthly, family, description) VALUES
  ('Operations Reset Sprint', 'DNI-04A-031', 450, false, '04A Business Operations Support', 'One focused cleanup of operating priorities, admin backlog map, service-lane cleanup, and 7-day action list. Excludes legal, tax, insurance, or bookkeeping advice.'),
  ('SOP + Tracker Bundle', 'DNI-04A-032', 650, false, '04A Business Operations Support', 'One SOP, one working tracker, intake fields, status definitions, and handoff checklist. Excludes live software setup unless quoted.'),
  ('Monthly HQ Support - Lite', 'DNI-04A-033', 650, true, '04A Business Operations Support', 'Up to 6 hours/month for admin coordination, tracker upkeep, document organization, and follow-up support. Excludes licensed professional services, legal/tax advice, or payroll.'),
  ('Monthly HQ Support - Core', 'DNI-04A-034', 1250, true, '04A Business Operations Support', 'Up to 12 hours/month with weekly priority review, CRM/follow-up support, packets, and operations cleanup. Excludes live sales guarantee, legal/tax advice, or staffing.'),
  ('Monthly HQ Support - Growth', 'DNI-04A-035', 2250, true, '04A Business Operations Support', 'Up to 24 hours/month for cross-lane buildout, SOPs, quote prep, vendor readiness, and outreach assets. Excludes employee management, compliance opinions, or regulated work.'),
  ('Quick Admin Rescue', 'DNI-04A-036', 125, false, '04A Administrative & Document Services', 'Up to 90 minutes of admin cleanup, document sorting, email/script prep, or task triage. Excludes complex filing, legal advice, or large document sets.'),
  ('Document Organization Pack', 'DNI-04A-037', 225, false, '04A Administrative & Document Services', 'Sort, label, and organize up to 50 digital or scanned items into a clean folder/index structure. Excludes document creation beyond simple labels/index.'),
  ('Business Packet Build', 'DNI-04A-038', 375, false, '04A Administrative & Document Services', 'Client/vendor packet outline, company info sheet, service overview, intake checklist, and send-ready PDF copy. Excludes government certification filing or legal review.'),
  ('Compliance Tracker Setup', 'DNI-04A-039', 450, false, '04A Administrative & Document Services', 'Simple tracker for documents, deadlines, renewals, owners, status, and follow-up reminders. Excludes compliance judgment or professional certification review.'),
  ('Records Cleanup Sprint', 'DNI-04A-040', 350, false, '04A Administrative & Document Services', 'Up to 3 hours organizing records, naming files, tagging missing items, and creating a next-action list. Excludes bookkeeping reconciliation or legal records interpretation.'),
  ('Standard Document Prep Pack', 'DNI-04A-041', 275, false, '04A Document Preparation & Submission Support', 'Prepare, format, assemble, and proof one standard packet up to 15 pages from client-provided content. Excludes legal drafting, advice, or representation.'),
  ('Complex Packet Support', 'DNI-04A-042', 450, false, '04A Document Preparation & Submission Support', 'Organize multi-part packet, checklist, attachment list, and submission-ready structure up to 40 pages. Excludes filing fees, legal advice, notarization unless confirmed.'),
  ('Forms + Intake Build', 'DNI-04A-043', 275, false, '04A Document Preparation & Submission Support', 'One intake form or service request form with clean questions, required fields, and routing notes. Excludes paid form software or website embedding.'),
  ('I-9 Verification Appointment', 'DNI-04A-044', 95, false, '04A Document Preparation & Submission Support', 'Appointment coordination, identity-document review support, employer instruction handling, and completion handoff. Excludes employer legal compliance decisions or HR advice.'),
  ('Vendor Readiness Audit', 'DNI-04A-045', 350, false, '04A Government & Vendor Readiness', 'Review current readiness, missing docs, risk flags, contact strategy, and next-action checklist. Excludes legal, tax, insurance, or certification advice.'),
  ('Capability Statement Refresh', 'DNI-04A-046', 425, false, '04A Government & Vendor Readiness', 'One-page capability statement refresh with safer positioning, service language, NAICS notes, and PDF-ready copy. Excludes certification claims unless officially confirmed.'),
  ('Vendor Packet Assembly', 'DNI-04A-047', 375, false, '04A Government & Vendor Readiness', 'Company info sheet, required-document checklist, folder index, and packet handoff list. Excludes submission guarantee or professional compliance opinion.'),
  ('Portal Profile Buildout Support', 'DNI-04A-048', 550, false, '04A Government & Vendor Readiness', 'Profile fields, service wording, upload checklist, and submission-readiness review for one vendor portal. Excludes representing certifications or insurance not confirmed.'),
  ('Subcontractor Outreach Starter', 'DNI-04A-049', 650, false, '04A Government & Vendor Readiness', 'Target list structure, outreach script, follow-up tracker, capability statement attachment plan, and 10-message starter set. Excludes guaranteed contract award or legal review.'),
  ('R.E.A.C.H. Company Buildout Audit', 'DNI-04A-050', 550, false, '04A R.E.A.C.H. Outside Company Buildouts', 'Audit of one outside company/client lane with current state, missing systems, risk flags, and build priority list. Excludes legal/tax entity decisions.'),
  ('R.E.A.C.H. Launch Operations Packet', 'DNI-04A-051', 950, false, '04A R.E.A.C.H. Outside Company Buildouts', 'Service map, intake, pricing draft, SOP starter, tracker, outreach script, and 30-day launch plan. Excludes filing LLC paperwork or legal/tax advice.'),
  ('R.E.A.C.H. Two-Lane Subcontractor Setup', 'DNI-04A-052', 750, false, '04A R.E.A.C.H. Outside Company Buildouts', 'Separate company-buildout lane and Dani Declares subcontractor lane, scope boundaries, invoice structure, and handoff tracker. Excludes final contract drafting or legal structure advice.'),
  ('R.E.A.C.H. Monthly Buildout HQ', 'DNI-04A-053', 1500, true, '04A R.E.A.C.H. Outside Company Buildouts', 'Up to 14 hours/month of buildout coordination, trackers, SOPs, pricing updates, outreach assets, and weekly priorities. Excludes legal, tax, HR, or insurance decisions.'),
  ('Daily Money Plan Sprint', 'DNI-04A-054', 175, false, '04A Money, CRM & Follow-Up', 'One focused cash-flow action plan with offer, target list, outreach message, and same-day follow-up steps. Excludes revenue guarantee.'),
  ('Revenue Tracker Setup', 'DNI-04A-055', 275, false, '04A Money, CRM & Follow-Up', 'Simple tracker for leads, quotes, deposits, balances, follow-ups, and closed revenue. Excludes accounting or tax categorization.'),
  ('Pricebook Update Session', 'DNI-04A-056', 325, false, '04A Money, CRM & Follow-Up', 'Review/update package pricing, add-ons, payment terms, exclusions, and quote-ready language. Excludes market guarantee or legal terms.'),
  ('Follow-Up CRM Tracker', 'DNI-04A-057', 325, false, '04A Money, CRM & Follow-Up', 'Pipeline fields, lead status definitions, next-step scripts, and 14-day follow-up cadence. Excludes CRM software subscription or sales guarantee.')
;

INSERT INTO public.services (id, name, slug, sku, division_id, service_family, commercial_status, pricing_type, billing_cycle, starting_price, description, resident_discount_eligible, created_at, updated_at)
SELECT gen_random_uuid(), t.service_name, lower(t.canonical_sku), t.canonical_sku, 4, t.family, 'CANONICAL_ACTIVE',
  CASE WHEN t.is_monthly THEN 'RECURRING' ELSE 'FIXED' END,
  CASE WHEN t.is_monthly THEN 'MONTHLY' ELSE 'ONETIME' END,
  t.price_dollars, t.description, false, now(), now()
FROM tmp_div04 t;

INSERT INTO public.dd_master_service_universe (id, division, service_name, scope, canonical_sku, commercial_object_type, lifecycle_status, source_authority, created_at, updated_at)
SELECT gen_random_uuid(), '04', t.service_name, t.description, t.canonical_sku, 'SERV', 'CANONICAL_ACTIVE', 'OWNER_MASTER_PRICEBOOK_2026-09-18', now(), now()
FROM tmp_div04 t;

INSERT INTO public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT s.id, ch, 'FIXED', round(t.price_dollars * 100)::int, 'USD', 'ONETIME', 'LOCKED', false, 'STANDARD', current_date, 'ACTIVE'
FROM tmp_div04 t
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
  'Added 2026-09-18 from the Dani Declares Master Pricebook per owner instruction ("yes to R.E.A.C.H.", "yes to pricebook pass").',
  'OWNER_MASTER_PRICEBOOK_2026-09-18'
FROM tmp_div04 t
JOIN public.services s ON s.sku = t.canonical_sku
JOIN public.dd_master_service_universe m ON m.canonical_sku = t.canonical_sku;

INSERT INTO public.dd_provider_capabilities (provider_org_id, provider_id, service_id, service_line, capability_key, is_authorized, tier_availability)
SELECT '19c10267-898f-4c10-a25e-186f6aff8771', 'acba894f-a8c7-4156-b981-fa08acc9e65b', s.id, t.service_name, 'BUSINESS_OPERATIONS_CONSULTING', true, '{}'::jsonb
FROM tmp_div04 t
JOIN public.services s ON s.sku = t.canonical_sku;

DROP TABLE tmp_div04;
