-- Division 08 (Business Development & Growth) had zero cost/margin data AND zero real
-- scope/exclusion definitions -- 14 of its 20 canonical SKUs carried the generic
-- boilerplate "Canonical Division 08 service offer; performance-based compensation is
-- not implied unless separately contracted." with no real inclusion/exclusion detail,
-- meaning a customer quoting any of these had no clear idea what they were paying for
-- vs. what would be a separate add-on. This replaces that boilerplate with real,
-- defensible scope/exclusion text for all 20 SKUs, consistent with how every other
-- Master-Pricebook-sourced service this session documents scope.
--
-- Cost/margin (internal_cost, provider_payout, margin_economics) is intentionally NOT
-- fabricated here: Division 08 is strategy/consulting work, and the only labor rates
-- established anywhere in this system (Tier 1 $60/hr field-routine, Tier 2 $75/hr
-- coordination/QA -- see D01/D02 margin_economics notes) are for field service work,
-- not strategic consulting. Inventing a consulting hourly rate to force a margin
-- calculation would be fabricating the exact kind of financial data this project does
-- not fabricate. Recorded honestly as PENDING pending Danielle's real hourly value for
-- this work.
--
-- Also fixes a real data bug found while pulling this division: "Business Development
-- Retainer" (DNI-08A-020) is priced at $1,500 but tagged billing_cycle=ONETIME -- a
-- retainer that only bills once isn't a retainer. Corrected to the RECURRING/MONTHLY
-- pattern already established for other real retainers this session (R.E.A.C.H.'s
-- Monthly Buildout HQ, Division 04's HQ support tiers): services.pricing_type=
-- 'RECURRING'/billing_cycle='MONTHLY', dd_service_pricing_rules stays FIXED/ONETIME
-- per that same established pattern.

CREATE TEMP TABLE tmp_d08_scope (
  canonical_sku text PRIMARY KEY, description text, scope text, exclusions text
);
INSERT INTO tmp_d08_scope (canonical_sku, description, scope, exclusions) VALUES
  ('DNI-08A-001', 'Structured review of current sales/growth systems (leads, pipeline, follow-up, offers) with a written findings report and prioritized action list.', 'One structured review session (approx. 60-90 min) plus a written findings report with prioritized recommendations.', 'Implementation of any recommended fixes; ongoing coaching or consulting. Quoted separately.'),
  ('DNI-08A-002', 'Setup of one sales pipeline structure inside the client''s existing CRM or tracking tool.', 'Configuration of pipeline stages and fields in one existing tool, plus a written stage-definition guide.', 'CRM software licensing/purchase; migration or cleanup of existing records; ongoing pipeline management.'),
  ('DNI-08A-003', 'Compiled prospect list built to client-approved criteria.', 'One compiled list (name, contact, basic firmographic fields) up to the count agreed at scoping (default up to 100 leads).', 'Guaranteed contact accuracy; ongoing list refresh; outreach to or contact of the leads.'),
  ('DNI-08A-004', 'Deeper research profile on a defined set of leads or accounts.', 'A written research brief on an agreed set of leads/accounts (background, known decision-makers, relevant context).', 'Contacting the leads; guaranteed accuracy of third-party source data.'),
  ('DNI-08A-005', 'Screening and qualification of inbound or outbound sales leads against approved criteria before handoff to active sales follow-up.', 'Qualification of an agreed batch of leads against client-approved criteria, delivered as a scored/sorted list.', 'Initial lead sourcing; sales follow-up or closing.'),
  ('DNI-08A-006', 'Configuration of one CRM tool''s pipeline stages, fields, and basic in-tool automation.', 'Setup of pipeline stages, fields, and automation triggers already available in the client''s chosen CRM.', 'CRM licensing cost; custom integrations/API development; data migration.'),
  ('DNI-08A-007', 'Documented, step-by-step sales process for one product or service line.', 'A written sales process (stages, advance criteria, script/template outline) for one defined offer.', 'Delivery of training on the process (quoted separately); ongoing process management.'),
  ('DNI-08A-008', 'Setup of one outbound outreach campaign structure.', 'Sequence steps, messaging templates, and target-list criteria built in the client''s existing outreach tool.', 'Outreach tool licensing; sending or running the campaign; response/result guarantees.'),
  ('DNI-08A-009', 'Documented follow-up cadence and template set for one audience or segment.', 'A written follow-up cadence (touchpoints, timing, messaging templates) for one defined audience.', 'Ongoing execution of the follow-ups (see the Sales Follow-Up Management retainer); CRM automation build beyond documentation.'),
  ('DNI-08A-010', 'Written referral program structure.', 'Eligibility criteria, incentive framework, and a terms/promotional-copy outline for one referral program.', 'Legal review of incentive terms; reward/payment fulfillment; ongoing program management.'),
  ('DNI-08A-011', 'Identification and outreach-messaging support for potential partners.', 'A target list and outreach messaging for an agreed number of potential partners.', 'Negotiation or closing of partnership terms; legal agreement drafting.'),
  ('DNI-08A-012', 'Research and outreach coordination to build a qualified vendor/subcontractor candidate list.', 'A candidate list for one defined service area, built from research and initial outreach coordination.', 'Vendor vetting/compliance verification (handled through the separate provider capability-signup process); contract negotiation.'),
  ('DNI-08A-013', 'Research brief identifying and profiling potential strategic partners.', 'A written brief profiling potential partners against client-defined criteria.', 'Outreach to or contact of identified partners (see Partnership Outreach Support); negotiation.'),
  ('DNI-08A-014', 'One structured growth-strategy session with a written summary.', 'A structured session (approx. 60-90 min) plus a written summary of priorities and next steps.', 'Implementation of the strategy; ongoing coaching or consulting.'),
  ('DNI-08A-015', 'Written research brief on a defined market, segment, or geography.', 'A brief using publicly available sources for one defined market/segment/geography.', 'Paid or proprietary data sources unless separately billed; primary research such as surveys or interviews.'),
  ('DNI-08A-016', 'Written competitive-landscape brief on a defined set of competitors.', 'A brief covering positioning, publicly available pricing, and offers for an agreed set of competitors.', 'Pricing data that is not publicly available; ongoing competitive monitoring.'),
  ('DNI-08A-017', 'Written recommendation for structuring one service or offer into a clearer, sellable package.', 'Scope, tiering, and positioning recommendations for one defined offer.', 'Pricing-model/cost analysis (see Pricing Strategy); execution or rollout of the new offer.'),
  ('DNI-08A-018', 'Written pricing recommendation based on provided cost data and market comparables.', 'A pricing recommendation for an agreed set of services/products, using cost data the client provides.', 'Cost accounting or bookkeeping to produce the underlying cost data; ongoing price management.'),
  ('DNI-08A-019', 'Written expansion plan for a defined new market, service line, or location.', 'An opportunity summary, requirements, risks, and a phased approach for one defined expansion target.', 'Legal/regulatory filings; financing or fundraising work (see the R.E.A.C.H. consulting division); execution of the plan.'),
  ('DNI-08A-020', 'Defined monthly business-development capacity across pipeline, outreach, and partnership work.', 'An agreed set of hours/deliverables per month across pipeline, outreach, and partnership work, scoped with the client at signup.', 'Ad-hoc project work outside the defined monthly scope (billed separately); paid advertising or media spend.')
;

UPDATE public.services s
SET description = t.description
FROM tmp_d08_scope t
WHERE s.sku = t.canonical_sku;

UPDATE public.dd_master_service_universe m
SET scope = t.scope,
    exclusions = t.exclusions,
    internal_cost = 'PENDING -- no established strategic/consulting labor rate exists in this system (only Tier 1 $60/hr field-routine and Tier 2 $75/hr coordination/QA rates are documented, and those do not fit consulting work). Awaiting Danielle''s real hourly value for this work before a cost model can be built without fabricating one.',
    margin_economics = 'PENDING -- see internal_cost note. Customer price is owner-set/live; margin cannot be honestly computed until a real consulting labor rate is provided.',
    conflict_register = coalesce(conflict_register, '') || ' SCOPE DEFINED 2026-09-18: replaced generic boilerplate description with real scope/exclusions per the full 13-division audit''s finding that Division 08 had zero real cost data AND zero real scope detail. Cost/margin intentionally left PENDING rather than fabricated.',
    updated_at = now()
FROM tmp_d08_scope t
WHERE m.canonical_sku = t.canonical_sku;

-- Fix: "Business Development Retainer" should recur monthly, not bill once.
UPDATE public.services
SET pricing_type = 'RECURRING', billing_cycle = 'MONTHLY'
WHERE sku = 'DNI-08A-020';

DROP TABLE tmp_d08_scope;
