-- Division 08 (Business Development & Growth) has 8 PRESERVED_CANDIDATE rows against
-- already-canonical services.
--
-- 1 is a duplicate of an already-live service:
--   - Sales Qualification Support -> Lead Qualification (DNI-08A-005)
--
-- The other 7 are genuinely distinct, using the same "design/strategy phase vs.
-- execution/ongoing phase" pattern established in Division 04 and the "coordination
-- premium" pattern from Divisions 02/03/07:
--   - Account Expansion & Cross-Sell Strategy: distinct from new-client acquisition work
--   - Lead Generation Program: a program-level buildout, priced above single-lead-source SKUs
--   - Partnership Program Development: distinct structured partnership-channel buildout
--   - Proposal & Quote Strategy: proposal/quote process design, distinct from one-off delivery
--   - Referral Network Development: build/execution of a referral network (vs. Referral
--     Program Design, which is the mechanics/design phase)
--   - Sales Follow-Up Management: recurring, ongoing follow-up cadence execution (billed
--     monthly, like Monthly Bookkeeping & Reconciliation in Division 04)
--   - Sales Outreach Strategy: planning phase, distinct from Outreach Campaign Setup (execution)
-- Priced against the existing Division-08A rate ladder.
-- Danielle holds zero authorized capabilities anywhere in Division 08 (checked before
-- writing this) -- none of these get a provider authorization.
--
-- NOTE: dd_service_pricing_rules.pricing_type has a CHECK constraint that does NOT
-- accept 'RECURRING' (only FIXED/STARTING_AT/VARIABLE_QUOTE/RETAINER/SOW_PROCUREMENT).
-- Following the exact existing precedent set by Monthly Bookkeeping & Reconciliation:
-- the `services` row uses pricing_type='RECURRING'/billing_cycle='MONTHLY', while its
-- dd_service_pricing_rules rows use pricing_type='FIXED'/billing_cycle='ONETIME'.
--
-- (First attempt at this migration failed and rolled back entirely with a check-
-- constraint violation on 'RECURRING' -- this is the corrected, successfully-applied
-- version, mirroring Supabase migration version 20260917172725.)

UPDATE public.services SET description = 'Screening and qualification of inbound or outbound sales leads against approved criteria before handoff to active sales follow-up.', updated_at = now()
WHERE id = (SELECT s.id FROM services s JOIN dd_governed_service_offers o ON o.runtime_service_id = s.id WHERE o.canonical_sku = 'DNI-08A-005'); -- Lead Qualification

UPDATE public.dd_master_service_universe
SET lifecycle_status = 'SUPERSEDED',
    conflict_register = 'Merged 2026-09-17: duplicate of already-live Lead Qualification (DNI-08A-005).'
WHERE service_name = 'Sales Qualification Support' AND lifecycle_status = 'PRESERVED_CANDIDATE';

CREATE TEMP TABLE tmp_d08_new (
  service_name text PRIMARY KEY,
  canonical_sku text,
  price_dollars numeric,
  pricing_type text,
  billing_cycle text,
  description text
);

INSERT INTO tmp_d08_new (service_name, canonical_sku, price_dollars, pricing_type, billing_cycle, description) VALUES
  ('Account Expansion & Cross-Sell Strategy', 'DNI-08A-021', 275, 'FIXED', 'ONETIME',
   'Development of a structured plan for expanding revenue within existing client accounts, including cross-sell and upsell opportunity identification and outreach sequencing.'),
  ('Lead Generation Program', 'DNI-08A-022', 450, 'FIXED', 'ONETIME',
   'Program-level coordination of multiple lead-generation channels, sourcing methods, tracking and handoff processes into a single managed lead pipeline.'),
  ('Partnership Program Development', 'DNI-08A-023', 450, 'FIXED', 'ONETIME',
   'Design and structuring of a formal partnership or referral-channel program, including partner criteria, terms framework, onboarding materials and tracking structure.'),
  ('Proposal & Quote Strategy', 'DNI-08A-024', 250, 'FIXED', 'ONETIME',
   'Development of proposal and quoting frameworks, templates, pricing presentation structure and approval workflow for a sales process.'),
  ('Referral Network Development', 'DNI-08A-025', 350, 'FIXED', 'ONETIME',
   'Active build-out and outreach to establish a referral network, distinct from the design of a referral program''s mechanics and terms.'),
  ('Sales Follow-Up Management', 'DNI-08A-026', 250, 'RECURRING', 'MONTHLY',
   'Ongoing, recurring management of sales follow-up cadence, touchpoints and pipeline nudges for active prospects using approved scripts and schedules.'),
  ('Sales Outreach Strategy', 'DNI-08A-027', 300, 'FIXED', 'ONETIME',
   'Planning of target segments, messaging, channels and cadence for a sales outreach effort, distinct from the operational setup of the outreach campaign itself.')
;

UPDATE public.dd_master_service_universe m
SET lifecycle_status = 'CANONICAL_ACTIVE', canonical_sku = t.canonical_sku, commercial_object_type = 'SERV', updated_at = now()
FROM tmp_d08_new t
WHERE m.service_name = t.service_name AND m.lifecycle_status = 'PRESERVED_CANDIDATE';

UPDATE public.services s
SET commercial_status = 'CANONICAL_ACTIVE', pricing_type = t.pricing_type, billing_cycle = t.billing_cycle,
    starting_price = t.price_dollars, description = t.description, resident_discount_eligible = false,
    service_family = 'Business Development & Growth', updated_at = now()
FROM tmp_d08_new t
WHERE s.name = t.service_name AND s.commercial_status = 'PENDING_RECONCILIATION';

-- dd_service_pricing_rules: pricing_type/billing_cycle forced to FIXED/ONETIME per the
-- check-constraint workaround documented above, regardless of the services-table value.
INSERT INTO public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT s.id, ch, 'FIXED', round(t.price_dollars * 100)::int, 'USD', 'ONETIME', 'LOCKED', false, 'STANDARD', current_date, 'ACTIVE'
FROM tmp_d08_new t
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
  'Reconciled from PRESERVED_CANDIDATE 2026-09-17: distinct from existing Division-08A services after side-by-side adjudication (see migration notes). No authorized provider yet -- Danielle has not confirmed she performs this work; priced and catalogued but intentionally not checkout-eligible until a real provider is authorized.',
  'OWNER_DIRECTED_CATALOG_COMPLETION'
FROM tmp_d08_new t
JOIN public.services s ON s.name = t.service_name
JOIN public.dd_master_service_universe m ON m.canonical_sku = t.canonical_sku;

DROP TABLE tmp_d08_new;
