-- Builds a DRAFT cost/margin model for Division 07's 20 canonical SKUs, using the Tier 3
-- ($90/hr, strategic/consulting, market-sourced per
-- 20260918111013_division_08_draft_cost_model_tier3_consulting_rate.sql) labor rate as the
-- default for this division's strategy/writing/design/content-production work, per this pass's
-- instructions. No SKU in Division 07 is clearly hands-on physical technical setup work, so
-- Tier 1 ($60/hr) is not used here.
--
-- IMPORTANT: as with Division 08, the $90/hr rate is real/sourced, but the hours-per-
-- deliverable below are this pass's own reasonable planning estimates, not an independently
-- audited company record. Nothing is pulled from SELL_NOW here -- several SKUs draft out
-- thin or negative at this rate (notably DNI-07A-005, -007, -011, -018, -020); each is written
-- into margin_economics as DRAFT and flagged for Danielle's confirmation before any
-- offer-status change.

CREATE TEMP TABLE tmp_d07_econ (
  canonical_sku text PRIMARY KEY, est_hours numeric, notes text
);
INSERT INTO tmp_d07_econ (canonical_sku, est_hours, notes) VALUES
  ('DNI-07A-001', 2.5, 'Review of existing marketing plus written findings report.'),
  ('DNI-07A-002', 3.0, 'Written strategy document: positioning, priority channels, phased next steps.'),
  ('DNI-07A-003', 2.5, 'Written campaign plan: messaging, channel mix, timeline, measurement.'),
  ('DNI-07A-004', 2.5, 'One content calendar for one agreed period.'),
  ('DNI-07A-005', 8.0, 'Est. hrs/month: scheduling/publishing an agreed post volume + engagement monitoring + monthly summary.'),
  ('DNI-07A-006', 0.75, 'Caption copy + one basic graphic for one post.'),
  ('DNI-07A-007', 3.0, 'Planning, editing and packaging one short-form video from provided footage.'),
  ('DNI-07A-008', 3.5, 'Platform config, one template, list import, one initial campaign build.'),
  ('DNI-07A-009', 3.5, 'Formatting and scheduling one newsletter issue from approved content/list.'),
  ('DNI-07A-010', 3.0, 'GBP claim/optimization + core local citation setup.'),
  ('DNI-07A-011', 5.0, 'Est. hrs/month: GBP posts/updates + citation monitoring + monthly summary.'),
  ('DNI-07A-012', 4.0, 'GBP claim/verification, field optimization, photo upload, initial posts.'),
  ('DNI-07A-013', 2.0, 'Review-platform monitoring + drafting responses per approved guidelines.'),
  ('DNI-07A-014', 3.5, 'Written keyword research brief.'),
  ('DNI-07A-015', 2.5, 'On-page optimization of an agreed set of pages.'),
  ('DNI-07A-016', 4.0, 'Website copywriting for an agreed set of pages.'),
  ('DNI-07A-017', 4.5, 'Writing an agreed number of blog posts.'),
  ('DNI-07A-018', 2.5, 'On-site property photo session, basic edit, digital delivery.'),
  ('DNI-07A-019', 3.0, 'On-site/studio brand photo session, basic edit, digital delivery.'),
  ('DNI-07A-020', 2.5, 'Editing client-provided footage into one finished video.')
;

UPDATE public.dd_master_service_universe m
SET internal_cost = format('DRAFT: %s hrs @ $90/hr (Tier 3 Strategic/Consulting, sourced from 2026 market research -- independent consultants doing general small-business work run $75-150/hr entry tier) = $%s. %s',
    t.est_hours, to_char(t.est_hours * 90, 'FM999999990.00'), t.notes),
  margin_economics = format('DRAFT: price $%s - draft cost $%s = $%s (%s%%) -- hour estimate is this pass''s own planning assumption, NOT an audited figure. Needs Danielle''s confirmation before any offer-status change.',
    to_char(s.starting_price, 'FM999999990.00'),
    to_char(t.est_hours * 90, 'FM999999990.00'),
    to_char(s.starting_price - (t.est_hours * 90), 'FM999999990.00'),
    to_char(round(((s.starting_price - (t.est_hours * 90)) / nullif(s.starting_price,0)) * 100, 1), 'FM999990.0')
  ),
  conflict_register = coalesce(conflict_register, '') || ' DRAFT COST MODEL 2026-09-18: Tier 3 $90/hr rate + this pass''s own hour estimate. Not yet confirmed by Danielle; do not treat as audited.',
  updated_at = now()
FROM tmp_d07_econ t
JOIN public.services s ON s.sku = t.canonical_sku
WHERE m.canonical_sku = t.canonical_sku;

DROP TABLE tmp_d07_econ;
