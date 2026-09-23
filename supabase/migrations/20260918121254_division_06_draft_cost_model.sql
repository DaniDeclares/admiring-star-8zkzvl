-- Builds a DRAFT cost/margin model for Division 06's 21 non-locked canonical SKUs, using the
-- Tier 1 ($60/hr, hands-on field/routine work) and Tier 3 ($90/hr, strategic/consulting,
-- market-sourced per 20260918111013_division_08_draft_cost_model_tier3_consulting_rate.sql)
-- labor rates already established this session. Tier 1 is applied only to the clearly
-- hands-on technical-setup cluster (domain/email/workspace/website/printer/troubleshooting/
-- database setup and maintenance); Tier 3 is the default for the business-formation/
-- compliance-assistance and copywriting SKUs, per this pass's instructions.
--
-- DNI-06A-016 (Computer Setup) and DNI-06A-017 (Workstation Deployment) are intentionally
-- EXCLUDED from this migration -- they carry a locked real Master Pricebook price and an
-- explicit 2026-09-18 reconciliation note; this pass does not touch their pricing or economics.
--
-- IMPORTANT: as with Division 08, the $60/$90 hourly rates are real/sourced, but the
-- hours-per-deliverable below are this pass's own reasonable planning estimates, not an
-- independently audited company record. Nothing is pulled from SELL_NOW here -- any thin or
-- negative draft margin is written into margin_economics as DRAFT and flagged for Danielle's
-- confirmation before any offer-status change.

CREATE TEMP TABLE tmp_d06_econ (
  canonical_sku text PRIMARY KEY, tier_rate numeric, tier_label text, est_hours numeric, notes text
);
INSERT INTO tmp_d06_econ (canonical_sku, tier_rate, tier_label, est_hours, notes) VALUES
  ('DNI-06A-001', 90, 'Tier 3 Strategic/Consulting', 2.5, 'Prep and file one LLC formation using client-provided info, plus confirmation.'),
  ('DNI-06A-002', 90, 'Tier 3 Strategic/Consulting', 3.5, 'Prep and file one corporation formation, plus confirmation.'),
  ('DNI-06A-003', 90, 'Tier 3 Strategic/Consulting', 1.5, 'Prep and file one DBA/fictitious name registration.'),
  ('DNI-06A-004', 90, 'Tier 3 Strategic/Consulting', 1.5, 'Prep and submit one business registration application.'),
  ('DNI-06A-005', 90, 'Tier 3 Strategic/Consulting', 1.0, 'Prep and submit one annual report/registration renewal.'),
  ('DNI-06A-006', 90, 'Tier 3 Strategic/Consulting', 1.5, 'One written business-startup checklist.'),
  ('DNI-06A-007', 90, 'Tier 3 Strategic/Consulting', 2.0, 'Prep and submit one EIN application (Form SS-4), plus confirmation.'),
  ('DNI-06A-008', 90, 'Tier 3 Strategic/Consulting', 2.0, 'Written summary of applicable licenses/permits for one business/location.'),
  ('DNI-06A-009', 90, 'Tier 3 Strategic/Consulting', 1.0, 'Written comparison of registered-agent providers for one state.'),
  ('DNI-06A-010', 90, 'Tier 3 Strategic/Consulting', 2.0, 'One written compliance calendar for one entity/state.'),
  ('DNI-06A-011', 60, 'Tier 1 Hands-On Setup', 2.0, 'Google Workspace account config, domain verification, MX setup, up to 3 users.'),
  ('DNI-06A-012', 60, 'Tier 1 Hands-On Setup', 1.0, 'Domain registration/config and basic DNS setup.'),
  ('DNI-06A-013', 60, 'Tier 1 Hands-On Setup', 1.5, 'Business email hosting config and up to 3 initial mailboxes.'),
  ('DNI-06A-014', 60, 'Tier 1 Hands-On Setup', 2.0, 'Website launch/migration support: content transfer, domain coordination, testing, launch check.'),
  ('DNI-06A-015', 60, 'Tier 1 Hands-On Setup', 12.0, 'Technical maintenance + minor content edits for one website, one service cycle.'),
  ('DNI-06A-018', 60, 'Tier 1 Hands-On Setup', 1.0, 'Physical printer/scanner setup and network/computer configuration.'),
  ('DNI-06A-019', 60, 'Tier 1 Hands-On Setup', 1.0, 'Diagnosis and resolution of one reported technical issue.'),
  ('DNI-06A-020', 60, 'Tier 1 Hands-On Setup', 3.5, 'Setup of tables/fields/settings and basic automation in one system.'),
  ('DNI-06A-027', 90, 'Tier 3 Strategic/Consulting', 4.0, 'Copy cleanup/rewrite for one webpage: messaging, positioning, CTAs, wording notes.'),
  ('DNI-06A-028', 90, 'Tier 3 Strategic/Consulting', 3.5, 'Public-facing service menu/pricing copy from approved locked prices.'),
  ('DNI-06A-029', 90, 'Tier 3 Strategic/Consulting', 3.5, 'Written booking/payment/deposit/intake recommendation and automation checklist.')
;

UPDATE public.dd_master_service_universe m
SET internal_cost = format('DRAFT: %s hrs @ $%s/hr (%s -- $60/hr sourced from this session''s real company audit evidence; $90/hr sourced from 2026 market research, independent consultants doing general small-business work run $75-150/hr entry tier) = $%s. %s',
    t.est_hours, to_char(t.tier_rate, 'FM999990'), t.tier_label, to_char(t.est_hours * t.tier_rate, 'FM999999990.00'), t.notes),
  margin_economics = format('DRAFT: price $%s - draft cost $%s = $%s (%s%%) -- hour estimate is this pass''s own planning assumption, NOT an audited figure. Needs Danielle''s confirmation before any offer-status change.',
    to_char(s.starting_price, 'FM999999990.00'),
    to_char(t.est_hours * t.tier_rate, 'FM999999990.00'),
    to_char(s.starting_price - (t.est_hours * t.tier_rate), 'FM999999990.00'),
    to_char(round(((s.starting_price - (t.est_hours * t.tier_rate)) / nullif(s.starting_price,0)) * 100, 1), 'FM999990.0')
  ),
  conflict_register = coalesce(conflict_register, '') || ' DRAFT COST MODEL 2026-09-18: ' || t.tier_label || ' rate + this pass''s own hour estimate. Not yet confirmed by Danielle; do not treat as audited.',
  updated_at = now()
FROM tmp_d06_econ t
JOIN public.services s ON s.sku = t.canonical_sku
WHERE m.canonical_sku = t.canonical_sku;

DROP TABLE tmp_d06_econ;
