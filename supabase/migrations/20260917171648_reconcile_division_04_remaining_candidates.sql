-- Division 04 (Administrative & Business Operations) has 9 PRESERVED_CANDIDATE rows
-- against 26 already-canonical services. Same adjudication process as prior divisions.
--
-- 5 of the 9 are the same real-world job as an already-live service (2 candidates both
-- overlap the same target -- Financial Administrative Support and Invoice & Accounts
-- Receivable Administration both describe the same work as the existing "AP/AR Tracking
-- & Financial Administration", just from two different angles -- merged together onto
-- that one SKU with a combined description):
--   - CRM Data & Pipeline Administration -> CRM Cleanup (DNI-04A-017)
--   - Document Intake & Processing -> File Organization (DNI-04A-006)
--   - Proposal & Presentation Preparation -> Document Formatting (DNI-04A-007)
--   - Financial Administrative Support + Invoice & Accounts Receivable Administration
--     -> AP/AR Tracking & Financial Administration (DNI-04A-026)
--
-- The other 4 are genuinely distinct from anything already live:
--   - Business Continuity Administrative Support: absence/overflow/transition coverage
--     specifically, distinct from the standing Administrative Retainer/Back-Office Support.
--   - Client Onboarding Administration: nothing else covers new-client onboarding setup.
--   - Executive Travel & Meeting Coordination: adds travel planning on top of what plain
--     Meeting Support covers.
--   - Meeting Minutes & Action Tracking: note-capture/action-item tracking is a distinct
--     skill from meeting logistics support.
-- Priced against the existing $45-$95 Division-04A admin rate ladder. Danielle holds zero
-- authorized capabilities anywhere in Division 04 (checked before writing this) -- none of
-- these are work she's confirmed she performs, so none of the 4 new services get an
-- authorization here either.

CREATE TEMP TABLE tmp_d04_merges (
  target_service_id uuid,
  candidate_master_ids uuid[],
  new_description text
);

INSERT INTO tmp_d04_merges VALUES
  ('5102c88a-2bea-4c98-91af-a87be0d7c9da', ARRAY['971e16b3-5cf9-4d0a-8944-d0cd7deb1102']::uuid[],
   'CRM record cleanup, data entry, tagging, pipeline maintenance, task assignment and routine reporting support.'),
  ('d622f6d6-04e0-478d-967e-64930b88bdd9', ARRAY['43965915-d8bc-4040-9653-277167a9d8b7']::uuid[],
   'Receipt, naming, organization, indexing and routing of business documents according to defined procedures.'),
  ('c2618c74-841d-496a-b718-efba8ee7715a', ARRAY['48941621-cace-4a04-9690-98dfc32518eb']::uuid[],
   'Administrative assembly and formatting of proposals, presentations, supporting documents and client-ready submission packages.'),
  ('71b92e11-bc4b-4213-bda4-9d2c934d3f07', ARRAY['9619f123-7c45-4232-84a2-e3978e6ff765','fa539dd1-fd62-476d-8ad1-7ec704baf5f5']::uuid[],
   'Administrative tracking of invoices, payment status, follow-up queues and supporting records, plus broader administrative support for financial records, expense organization, document preparation, reporting support and coordination with the client''s accountant or tax professional -- without regulated accounting services.')
;

UPDATE public.services s SET description = t.new_description, updated_at = now()
FROM tmp_d04_merges t WHERE s.id = t.target_service_id;

UPDATE public.dd_master_service_universe m
SET lifecycle_status = 'SUPERSEDED',
    conflict_register = 'Merged 2026-09-17: duplicate of an already-live Division-04A service (same real-world job under a different name). Description consolidated onto the live SKU; this candidate retired rather than priced separately.'
FROM tmp_d04_merges t WHERE m.id = ANY(t.candidate_master_ids);

DROP TABLE tmp_d04_merges;

CREATE TEMP TABLE tmp_d04_new (
  service_name text PRIMARY KEY,
  canonical_sku text,
  price_dollars numeric,
  description text
);

INSERT INTO tmp_d04_new (service_name, canonical_sku, price_dollars, description) VALUES
  ('Business Continuity Administrative Support', 'DNI-04A-027', 85,
   'Administrative continuity coverage for recurring business processes during staff absences, overflow periods or transition windows.'),
  ('Client Onboarding Administration', 'DNI-04A-028', 150,
   'Setup and maintenance of client onboarding workflows, forms, folders, schedules, welcome materials and administrative handoffs.'),
  ('Executive Travel & Meeting Coordination', 'DNI-04A-029', 95,
   'Administrative planning for business travel, meeting logistics, itineraries, confirmations, materials and follow-up; purchases remain subject to authorization.'),
  ('Meeting Minutes & Action Tracking', 'DNI-04A-030', 55,
   'Meeting preparation, note capture, action-item organization, deadline tracking and distribution of approved meeting records.')
;

UPDATE public.dd_master_service_universe m
SET lifecycle_status = 'CANONICAL_ACTIVE', canonical_sku = t.canonical_sku, commercial_object_type = 'SERV', updated_at = now()
FROM tmp_d04_new t
WHERE m.service_name = t.service_name AND m.lifecycle_status = 'PRESERVED_CANDIDATE';

UPDATE public.services s
SET commercial_status = 'CANONICAL_ACTIVE', pricing_type = 'FIXED', billing_cycle = 'ONETIME',
    starting_price = t.price_dollars, description = t.description, resident_discount_eligible = false,
    service_family = 'Administrative & Business Operations', updated_at = now()
FROM tmp_d04_new t
WHERE s.name = t.service_name AND s.commercial_status = 'PENDING_RECONCILIATION';

INSERT INTO public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT s.id, ch, 'FIXED', round(t.price_dollars * 100)::int, 'USD', 'ONETIME', 'LOCKED', false, 'STANDARD', current_date, 'ACTIVE'
FROM tmp_d04_new t
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
  'Reconciled from PRESERVED_CANDIDATE 2026-09-17: distinct from existing Division-04A services after side-by-side adjudication (see migration notes). No authorized provider yet -- Danielle has not confirmed she performs this admin work; priced and catalogued but intentionally not checkout-eligible until a real provider is authorized.',
  'OWNER_DIRECTED_CATALOG_COMPLETION'
FROM tmp_d04_new t
JOIN public.services s ON s.name = t.service_name
JOIN public.dd_master_service_universe m ON m.canonical_sku = t.canonical_sku;

DROP TABLE tmp_d04_new;
