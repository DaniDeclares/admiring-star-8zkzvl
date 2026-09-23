-- Builds a DRAFT cost/margin model for Division 08 using a new Tier 3 (Strategic/
-- Consulting) labor rate of $90/hr. Danielle asked "what's the best way?" when given
-- the choice between setting a rate herself, going value-based, or reusing Tier 2.
-- Recommendation applied: set a real rate now (sourced from 2026 market research --
-- independent consultants doing general small-business work run $75-150/hr at the
-- entry tier; ZipRecruiter/Glassdoor put salaried "small business consultant" work at
-- $42-54/hr; specialized/fractional-executive work runs $150-300+/hr and does not match
-- DANI's current positioning) so PASS 1 can actually be computed today, one step above
-- the existing Tier 2 ($75/hr) rather than reaching into the specialized range. This
-- is NOT stored as a formal dd_provider_rate_cards row because that table requires a
-- provider_org_id for negotiated subcontractor rates and doesn't fit owner-direct
-- internal labor -- Tier 1/2 were never stored there either, only cited in
-- margin_economics text, so Tier 3 follows the same established precedent.
--
-- IMPORTANT: unlike the Division 02 losses (which were pulled immediately), the labor-
-- HOUR estimates below are this migration's own reasonable planning assumptions, not an
-- independently audited company record the way D02's hours were. The $90/hr rate is
-- real and sourced; the hours-per-deliverable are a draft. Nothing is pulled from
-- SELL_NOW here -- every resulting negative or thin margin is written into
-- margin_economics as DRAFT and flagged for Danielle's confirmation before any offer
-- status changes, consistent with never taking a unilateral pricing action off an
-- unverified estimate.

CREATE TEMP TABLE tmp_d08_econ (
  canonical_sku text PRIMARY KEY, est_hours numeric, notes text
);
INSERT INTO tmp_d08_econ (canonical_sku, est_hours, notes) VALUES
  ('DNI-08A-001', 3.0, 'Session (60-90 min) + written findings report and prioritized action list.'),
  ('DNI-08A-002', 1.5, 'Pipeline stage/field configuration in one existing tool + stage-definition guide.'),
  ('DNI-08A-003', 3.0, 'Research and compile one list up to ~100 leads.'),
  ('DNI-08A-004', 3.0, 'Deeper research brief on an agreed set of leads/accounts.'),
  ('DNI-08A-005', 1.5, 'Qualification of one batch of leads against approved criteria.'),
  ('DNI-08A-006', 3.0, 'CRM pipeline stage/field/automation-trigger configuration.'),
  ('DNI-08A-007', 4.0, 'Documented sales process for one offer.'),
  ('DNI-08A-008', 4.0, 'Outreach campaign structure setup in one existing tool.'),
  ('DNI-08A-009', 3.0, 'Documented follow-up cadence and templates for one audience.'),
  ('DNI-08A-010', 4.5, 'Referral program structure, incentive framework, terms outline.'),
  ('DNI-08A-011', 4.0, 'Target list + outreach messaging for an agreed number of partners.'),
  ('DNI-08A-012', 4.0, 'Vendor/subcontractor candidate list for one service area.'),
  ('DNI-08A-013', 3.0, 'Research brief profiling potential strategic partners.'),
  ('DNI-08A-014', 3.0, 'Growth strategy session (60-90 min) + written summary.'),
  ('DNI-08A-015', 3.5, 'Market research brief from public sources.'),
  ('DNI-08A-016', 3.5, 'Competitive-landscape brief on an agreed set of competitors.'),
  ('DNI-08A-017', 5.5, 'Offer/productization scope, tiering, and positioning recommendation.'),
  ('DNI-08A-018', 5.5, 'Pricing recommendation from client-provided cost data and comparables.'),
  ('DNI-08A-019', 8.0, 'Expansion plan: opportunity summary, requirements, risks, phased approach.'),
  ('DNI-08A-020', 15.0, 'Defined monthly capacity across pipeline/outreach/partnership work (est. hrs/month).')
;

UPDATE public.dd_master_service_universe m
SET internal_cost = format('DRAFT: %s hrs @ $90/hr (Tier 3 Strategic/Consulting, sourced from 2026 market research -- independent consultants doing general small-business work run $75-150/hr entry tier) = $%s. %s',
    t.est_hours, to_char(t.est_hours * 90, 'FM999999990.00'), t.notes),
  margin_economics = format('DRAFT: price $%s - draft cost $%s = $%s (%s%%) -- hour estimate is this pass''s own planning assumption, NOT an audited figure like Division 02''s. Needs Danielle''s confirmation before any offer-status change.',
    to_char(s.starting_price, 'FM999999990.00'),
    to_char(t.est_hours * 90, 'FM999999990.00'),
    to_char(s.starting_price - (t.est_hours * 90), 'FM999999990.00'),
    to_char(round(((s.starting_price - (t.est_hours * 90)) / nullif(s.starting_price,0)) * 100, 1), 'FM999990.0')
  ),
  conflict_register = coalesce(conflict_register, '') || ' DRAFT COST MODEL 2026-09-18: Tier 3 $90/hr rate + this pass''s own hour estimate. Not yet confirmed by Danielle; do not treat as audited.',
  updated_at = now()
FROM tmp_d08_econ t
JOIN public.services s ON s.sku = t.canonical_sku
WHERE m.canonical_sku = t.canonical_sku;

DROP TABLE tmp_d08_econ;
