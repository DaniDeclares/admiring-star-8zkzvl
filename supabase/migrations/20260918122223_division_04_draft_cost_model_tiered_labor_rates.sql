-- Builds a DRAFT cost/margin model for all 53 canonical, SKU-bearing Division 04 services
-- (DNI-04A-001..026, 031..057; 027-030 have no live services row and are out of scope), using
-- the same Tier 1/2/3 labor-rate methodology established for Division 08 earlier this session:
--   Tier 1 ($60/hr) hands-on field/routine work -- not used in this division (no field labor)
--   Tier 2 ($75/hr) coordination/QA work -- routine, mechanical admin execution
--   Tier 3 ($90/hr) strategic/consulting work -- 2026 market research, $75-150/hr entry tier
--     for general small-business consulting; PROVISIONAL, not an audited company rate.
-- Tier assignment per SKU below is this pass's own judgment call, applying the rule "Tier 3
-- unless clearly hands-on field work (Tier 1) or clearly coordination/QA (Tier 2)."
--
-- HOURS SOURCE: for DNI-04A-001 through -026, hours are NOT a fresh guess -- they are pulled
-- from Airtable base appJjOPWnFsZe11zM, table "04 Service Economics" (tblXF1ltLjW6DrFgz),
-- field "Estimated Labor Hours", which the 2026-09-02 OWNER-APPROVED D04 PRICING LOCK pass (or
-- the 2026-09-05 Pass-1 staging pass for -021..-026) already recorded. That is real prior
-- planning evidence, not this migration's own estimate. For DNI-04A-031 through -057 (not
-- present in that Airtable table at all), hours are this migration's own reasonable planning
-- estimate, clearly labeled as such below, following the Division 08 precedent.
--
-- *** CRITICAL PRICING DISCREPANCY FOUND AND FLAGGED, NOT RESOLVED ***
-- The Airtable table's OWNER-APPROVED D04 PRICING LOCK notes (dated 2026-09-02) for
-- DNI-04A-001 through -020 quote customer prices ($129-$1,095) that are substantially HIGHER
-- than the prices currently live in public.services.starting_price for those same 20 SKUs
-- ($45-$750) -- e.g. DNI-04A-001 "Virtual Assistant" is locked at "$149 base price" per
-- Airtable but live at $45 in Supabase; DNI-04A-020 "Administrative Retainer" is locked at
-- "$1,095 monthly starting retainer" but live at $750. This looks like an approved 2026-09-02
-- repricing that was never pushed to the live services table. Per this pass's instructions,
-- the customer price is NOT second-guessed or changed here in either direction -- the draft
-- cost/margin below is computed against the CURRENT LIVE services.starting_price (what
-- customers are actually charged today), because that is the honest basis for "is this SKU
-- profitable as currently sold." Each affected SKU's margin_economics text below quotes the
-- real Airtable lock note verbatim and flags the live-vs-locked mismatch for Danielle to
-- reconcile; nothing is pulled from SELL_NOW and no price field is touched.

CREATE TEMP TABLE tmp_d04_econ (
  canonical_sku text PRIMARY KEY, est_hours numeric, tier int, hours_source text, notes text, lock_note text
);
INSERT INTO tmp_d04_econ (canonical_sku, est_hours, tier, hours_source, notes, lock_note) VALUES
  ('DNI-04A-001', 1,   2, 'Airtable 04 Service Economics (rec: OWNER-APPROVED D04 PRICING LOCK 2026-09-02)', 'One defined VA task/task list, base tier.', 'OWNER-APPROVED D04 PRICING LOCK 2026-09-02: "$149 base price. Pricing architecture: transactional defined scope; larger/variable work uses blocks/retainer or quote." Live Supabase price is $45 -- $104 below the locked figure.'),
  ('DNI-04A-002', 2,   2, 'Airtable 04 Service Economics (OWNER-APPROVED LOCK 2026-09-02)', 'On-site admin support block plus local travel.', 'OWNER-APPROVED D04 PRICING LOCK 2026-09-02: "$275 starting/project price. On-site scope, dispatch/travel and scope controls apply." Live Supabase price is $55 -- $220 below the locked figure.'),
  ('DNI-04A-003', 1,   2, 'Airtable 04 Service Economics (OWNER-APPROVED LOCK 2026-09-02)', 'One inbox triage block.', 'OWNER-APPROVED D04 PRICING LOCK 2026-09-02: "$129 minimum for defined scope; larger recurring workload uses blocks/retainer." Live Supabase price is $50 -- $79 below the locked figure.'),
  ('DNI-04A-004', 1,   2, 'Airtable 04 Service Economics (OWNER-APPROVED LOCK 2026-09-02)', 'One calendar upkeep block.', 'OWNER-APPROVED D04 PRICING LOCK 2026-09-02: "$129 minimum for defined scope; recurring/high-volume work uses blocks/retainer." Live Supabase price is $50 -- $79 below the locked figure.'),
  ('DNI-04A-005', 1,   2, 'Airtable 04 Service Economics (OWNER-APPROVED LOCK 2026-09-02)', 'One data-entry block.', 'OWNER-APPROVED D04 PRICING LOCK 2026-09-02: "$129 minimum; volume/batch economics govern larger scope." Live Supabase price is $45 -- $84 below the locked figure.'),
  ('DNI-04A-006', 1.5, 2, 'Airtable 04 Service Economics (OWNER-APPROVED LOCK 2026-09-02)', 'File organization/indexing block.', 'OWNER-APPROVED D04 PRICING LOCK 2026-09-02: "$179 starting price for defined file-organization scope; complex/secure remediation quoted separately." Live Supabase price is $55 -- $124 below the locked figure.'),
  ('DNI-04A-007', 1,   2, 'Airtable 04 Service Economics (OWNER-APPROVED LOCK 2026-09-02)', 'Document formatting/assembly block.', 'OWNER-APPROVED D04 PRICING LOCK 2026-09-02: "$139 minimum for defined document-formatting scope; complex production quoted separately." Live Supabase price is $60 -- $79 below the locked figure.'),
  ('DNI-04A-008', 1.5, 2, 'Airtable 04 Service Economics (OWNER-APPROVED LOCK 2026-09-02)', 'Meeting support for one event.', 'OWNER-APPROVED D04 PRICING LOCK 2026-09-02: "$225 starting/event price for defined meeting-support scope; extended coverage by block." Live Supabase price is $75 -- $150 below the locked figure.'),
  ('DNI-04A-009', 1.5, 3, 'Airtable 04 Service Economics (OWNER-APPROVED LOCK 2026-09-02)', 'One research brief.', 'OWNER-APPROVED D04 PRICING LOCK 2026-09-02: "$225 starting price for defined research assignment; complex research/reporting quoted by scope." Live Supabase price is $65 -- $160 below the locked figure.'),
  ('DNI-04A-010', 1.5, 3, 'Airtable 04 Service Economics (OWNER-APPROVED LOCK 2026-09-02)', 'Project coordination, one defined scope.', 'OWNER-APPROVED D04 PRICING LOCK 2026-09-02: "$275 starting project price; recurring coordination moves to monthly blocks/retainer." Live Supabase price is $95 -- $180 below the locked figure.'),
  ('DNI-04A-011', 3,   3, 'Airtable 04 Service Economics (OWNER-APPROVED LOCK 2026-09-02)', 'One documented SOP.', 'OWNER-APPROVED D04 PRICING LOCK 2026-09-02: "$425 starting project price for SOP development; complex libraries/process families quoted by scope." Live Supabase price is $250 -- $175 below the locked figure.'),
  ('DNI-04A-012', 4,   3, 'Airtable 04 Service Economics (OWNER-APPROVED LOCK 2026-09-02)', 'One process map.', 'OWNER-APPROVED D04 PRICING LOCK 2026-09-02: "$550 starting project price for process mapping; larger/multi-department scope quoted." Live Supabase price is $350 -- $200 below the locked figure.'),
  ('DNI-04A-013', 3,   3, 'Airtable 04 Service Economics (OWNER-APPROVED LOCK 2026-09-02)', 'One workflow cleanup.', 'OWNER-APPROVED D04 PRICING LOCK 2026-09-02: "$425 starting project price for workflow cleanup; systems/integration remediation quoted separately." Live Supabase price is $250 -- $175 below the locked figure.'),
  ('DNI-04A-014', 3,   3, 'Airtable 04 Service Economics (OWNER-APPROVED LOCK 2026-09-02)', 'One operations audit + findings report.', 'OWNER-APPROVED D04 PRICING LOCK 2026-09-02: "$475 starting price for operations audit; larger audits quoted by scope." Live Supabase price is $297 -- $178 below the locked figure.'),
  ('DNI-04A-015', 2,   2, 'Airtable 04 Service Economics (OWNER-APPROVED LOCK 2026-09-02)', 'Back-office support block.', 'OWNER-APPROVED D04 PRICING LOCK 2026-09-02: "$275 minimum defined back-office support block; recurring workload converts to weekly/monthly blocks or retainer." Live Supabase price is $75 -- $200 below the locked figure.'),
  ('DNI-04A-016', 1,   2, 'Airtable 04 Service Economics (OWNER-APPROVED LOCK 2026-09-02)', 'One customer follow-up batch.', 'OWNER-APPROVED D04 PRICING LOCK 2026-09-02: "$129 minimum defined follow-up batch; high-volume recurring work uses block/retainer economics." Live Supabase price is $55 -- $74 below the locked figure.'),
  ('DNI-04A-017', 2,   2, 'Airtable 04 Service Economics (OWNER-APPROVED LOCK 2026-09-02)', 'CRM cleanup, one instance.', 'OWNER-APPROVED D04 PRICING LOCK 2026-09-02: "$275 minimum defined CRM cleanup scope; volume tiers/record counts control larger work." Live Supabase price is $75 -- $200 below the locked figure.'),
  ('DNI-04A-018', 2,   2, 'Airtable 04 Service Economics (OWNER-APPROVED LOCK 2026-09-02)', 'Vendor administration, one vendor list.', 'OWNER-APPROVED D04 PRICING LOCK 2026-09-02: "$275 minimum defined vendor-administration scope; recurring/vendor-volume work uses block or retainer." Live Supabase price is $85 -- $190 below the locked figure.'),
  ('DNI-04A-019', 2,   3, 'Airtable 04 Service Economics (OWNER-APPROVED LOCK 2026-09-02)', 'Executive assistant support block.', 'OWNER-APPROVED D04 PRICING LOCK 2026-09-02: "$325 minimum defined executive-assistant support scope; ongoing support uses dedicated blocks/retainer." Live Supabase price is $95 -- $230 below the locked figure.'),
  ('DNI-04A-020', 8,   3, 'Airtable 04 Service Economics (OWNER-APPROVED LOCK 2026-09-02)', 'Monthly admin-operations capacity retainer.', 'OWNER-APPROVED D04 PRICING LOCK 2026-09-02: "$1,095 monthly starting retainer for defined administrative operations capacity, boundaries, response standards and overage/change-order controls." Live Supabase price is $750/mo -- $345 below the locked figure.'),
  ('DNI-04A-021', 2.5, 2, 'Airtable 04 Service Economics (2026-09-05 Pass-1 staging)', 'Bookkeeping-system setup (Chart of Accounts, feeds, workflow config).', NULL),
  ('DNI-04A-022', 5,   2, 'Airtable 04 Service Economics (2026-09-05 Pass-1 staging)', 'Monthly transaction categorization/reconciliation/close prep.', NULL),
  ('DNI-04A-023', 3,   2, 'Airtable 04 Service Economics (2026-09-05 Pass-1 staging)', 'P&L/Balance Sheet organization and close support.', NULL),
  ('DNI-04A-024', 3,   3, 'Airtable 04 Service Economics (2026-09-05 Pass-1 staging)', 'Cash-flow forecast/budget/break-even analysis.', NULL),
  ('DNI-04A-025', 4,   3, 'Airtable 04 Service Economics (2026-09-05 Pass-1 staging)', 'Funding/lending-readiness financial packet.', NULL),
  ('DNI-04A-026', 4,   2, 'Airtable 04 Service Economics (2026-09-05 Pass-1 staging)', 'AP/AR tracking and financial administration.', NULL),
  ('DNI-04A-031', 5,   3, 'this pass''s own planning estimate (not in Airtable)', 'Operations reset: priorities cleanup, backlog map, service-lane cleanup, 7-day action list.', NULL),
  ('DNI-04A-032', 7,   3, 'this pass''s own planning estimate (not in Airtable)', 'One SOP + one working tracker + intake fields + handoff checklist.', NULL),
  ('DNI-04A-033', 6,   2, 'this pass''s own planning estimate (not in Airtable)', 'Monthly HQ Support - Lite: up to 6 hrs/month of admin coordination (defined monthly capacity).', NULL),
  ('DNI-04A-034', 12,  3, 'this pass''s own planning estimate (not in Airtable)', 'Monthly HQ Support - Core: up to 12 hrs/month incl. weekly priority review.', NULL),
  ('DNI-04A-035', 24,  3, 'this pass''s own planning estimate (not in Airtable)', 'Monthly HQ Support - Growth: up to 24 hrs/month cross-lane buildout.', NULL),
  ('DNI-04A-036', 1.5, 2, 'this pass''s own planning estimate (not in Airtable)', 'Quick admin rescue, up to 90 minutes.', NULL),
  ('DNI-04A-037', 2.5, 2, 'this pass''s own planning estimate (not in Airtable)', 'Sort/label/organize up to 50 items.', NULL),
  ('DNI-04A-038', 4,   2, 'this pass''s own planning estimate (not in Airtable)', 'Business/vendor packet build (outline, info sheet, checklist, PDF).', NULL),
  ('DNI-04A-039', 4.5, 2, 'this pass''s own planning estimate (not in Airtable)', 'Compliance tracker setup.', NULL),
  ('DNI-04A-040', 3,   2, 'this pass''s own planning estimate (not in Airtable)', 'Records cleanup sprint, up to 3 hours (as scoped in the SKU itself).', NULL),
  ('DNI-04A-041', 3,   2, 'this pass''s own planning estimate (not in Airtable)', 'Standard document prep pack, up to 15 pages.', NULL),
  ('DNI-04A-042', 5,   2, 'this pass''s own planning estimate (not in Airtable)', 'Complex packet support, up to 40 pages.', NULL),
  ('DNI-04A-043', 3,   2, 'this pass''s own planning estimate (not in Airtable)', 'Forms + intake build, one form.', NULL),
  ('DNI-04A-044', 1,   2, 'this pass''s own planning estimate (not in Airtable)', 'I-9 verification appointment coordination.', NULL),
  ('DNI-04A-045', 3.5, 3, 'this pass''s own planning estimate (not in Airtable)', 'Vendor readiness audit (readiness, gaps, risk flags, next actions).', NULL),
  ('DNI-04A-046', 4.5, 3, 'this pass''s own planning estimate (not in Airtable)', 'Capability statement refresh.', NULL),
  ('DNI-04A-047', 4,   2, 'this pass''s own planning estimate (not in Airtable)', 'Vendor packet assembly.', NULL),
  ('DNI-04A-048', 5.5, 3, 'this pass''s own planning estimate (not in Airtable)', 'Portal profile buildout support, one vendor portal.', NULL),
  ('DNI-04A-049', 7,   3, 'this pass''s own planning estimate (not in Airtable)', 'Subcontractor outreach starter (list, script, tracker, 10-message set).', NULL),
  ('DNI-04A-050', 6,   3, 'this pass''s own planning estimate (not in Airtable)', 'R.E.A.C.H. company buildout audit, one outside company/lane.', NULL),
  ('DNI-04A-051', 10,  3, 'this pass''s own planning estimate (not in Airtable)', 'R.E.A.C.H. launch operations packet.', NULL),
  ('DNI-04A-052', 8,   3, 'this pass''s own planning estimate (not in Airtable)', 'R.E.A.C.H. two-lane subcontractor setup.', NULL),
  ('DNI-04A-053', 14,  3, 'this pass''s own planning estimate (not in Airtable)', 'R.E.A.C.H. Monthly Buildout HQ: up to 14 hrs/month (defined monthly capacity).', NULL),
  ('DNI-04A-054', 1.75,3, 'this pass''s own planning estimate (not in Airtable)', 'Daily money plan sprint.', NULL),
  ('DNI-04A-055', 3,   2, 'this pass''s own planning estimate (not in Airtable)', 'Revenue tracker setup.', NULL),
  ('DNI-04A-056', 3.5, 3, 'this pass''s own planning estimate (not in Airtable)', 'Pricebook update session.', NULL),
  ('DNI-04A-057', 3.5, 2, 'this pass''s own planning estimate (not in Airtable)', 'Follow-up CRM tracker build.', NULL)
;

UPDATE public.dd_master_service_universe m
SET internal_cost = format('DRAFT: %s hrs @ $%s/hr (Tier %s %s, %s) = $%s. Hours source: %s. %s',
    t.est_hours,
    (CASE t.tier WHEN 1 THEN 60 WHEN 2 THEN 75 ELSE 90 END),
    t.tier,
    (CASE t.tier WHEN 1 THEN 'Field/Routine' WHEN 2 THEN 'Coordination/QA' ELSE 'Strategic/Consulting' END),
    (CASE WHEN t.tier = 3 THEN 'sourced from 2026 market research -- independent consultants doing general small-business work run $75-150/hr entry tier' ELSE 'real company audit rate established this session' END),
    to_char(t.est_hours * (CASE t.tier WHEN 1 THEN 60 WHEN 2 THEN 75 ELSE 90 END), 'FM999999990.00'),
    t.hours_source,
    t.notes
  ),
  margin_economics = format('DRAFT: live price $%s - draft cost $%s = $%s (%s%%) -- hour estimate/source noted in internal_cost; %s Needs Danielle''s confirmation before any offer-status change.',
    to_char(s.starting_price, 'FM999999990.00'),
    to_char(t.est_hours * (CASE t.tier WHEN 1 THEN 60 WHEN 2 THEN 75 ELSE 90 END), 'FM999999990.00'),
    to_char(s.starting_price - (t.est_hours * (CASE t.tier WHEN 1 THEN 60 WHEN 2 THEN 75 ELSE 90 END)), 'FM999999990.00'),
    to_char(round(((s.starting_price - (t.est_hours * (CASE t.tier WHEN 1 THEN 60 WHEN 2 THEN 75 ELSE 90 END))) / nullif(s.starting_price,0)) * 100, 1), 'FM999990.0'),
    coalesce(t.lock_note || ' PRICE MISMATCH FLAGGED, NOT RESOLVED -- see migration header.', 'not an audited figure like Division 02''s.')
  ),
  conflict_register = coalesce(conflict_register, '') || format(' DRAFT COST MODEL 2026-09-18: Tier %s $%s/hr + %s. Not yet confirmed by Danielle; do not treat as audited.%s',
    t.tier, (CASE t.tier WHEN 1 THEN 60 WHEN 2 THEN 75 ELSE 90 END), t.hours_source,
    (CASE WHEN t.lock_note IS NOT NULL THEN ' Also flags a live-price-vs-Airtable-owner-lock mismatch for reconciliation.' ELSE '' END)
  ),
  updated_at = now()
FROM tmp_d04_econ t
JOIN public.services s ON s.sku = t.canonical_sku
WHERE m.canonical_sku = t.canonical_sku;

DROP TABLE tmp_d04_econ;
