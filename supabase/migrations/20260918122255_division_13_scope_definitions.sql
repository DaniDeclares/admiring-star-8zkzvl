-- Division 13 (Government/Institutional) had 17 of its 20 canonical SKUs carrying the generic
-- boilerplate "Canonical Division 13 government/institutional procurement support; quote/SOW
-- and procurement rules govern final scope." (services.description), and all 20 SKUs carrying
-- the generic "Solicitation/entity-specific scope confirmed before work begins." with no
-- exclusions (dd_master_service_universe.scope/exclusions). This replaces both with real,
-- defensible scope/exclusion text, consistent with the Division 08/04 passes this session.
--
-- Three SKUs (DNI-13A-017, -018, -019) already carried a real services.description, so that
-- field is left untouched for those three; only their dd_master_service_universe scope/
-- exclusions (still the generic placeholder) are populated here.
--
-- No Airtable "04 Service Economics" records exist for any DNI-13A-* SKU (checked and
-- confirmed empty), and no Division 13 "Retainer"-named/ONETIME-billing_cycle bug was found
-- (all 20 SKUs are pricing_type=SOW / billing_cycle=ONETIME, none named "Retainer" -- correctly
-- tagged as one-time procurement-support engagements), so no billing_cycle fix applies here.

CREATE TEMP TABLE tmp_d13_scope (
  canonical_sku text PRIMARY KEY, description text, scope text, exclusions text, desc_is_new boolean
);
INSERT INTO tmp_d13_scope (canonical_sku, description, scope, exclusions, desc_is_new) VALUES
  ('DNI-13A-001', 'Preparation support for SAM.gov registration, including document/information organization and application-field review before submission.', 'Compilation of required registration information, document checklist review, and field-by-field application review for one SAM.gov registration or renewal.', 'SAM.gov government processing fees/timelines (outside DANI''s control); legal/tax entity-structuring advice; guaranteed approval or processing time.', true),
  ('DNI-13A-002', 'Preparation support for obtaining a Unique Entity Identifier (UEI) and/or CAGE code, including document organization and application review.', 'Document/information compilation and application-field review for one UEI and/or CAGE code request.', 'Government processing fees/timelines; legal/tax entity-structuring advice; guaranteed approval or processing time.', true),
  ('DNI-13A-003', 'Setup of one vendor profile on a government or institutional procurement portal, including required fields and document checklist.', 'Profile field completion, service-language drafting and document-upload checklist for one procurement portal.', 'Portal subscription/registration fees; representing certifications or insurance not already confirmed by the client; guaranteed portal approval.', true),
  ('DNI-13A-004', 'One-page capability statement covering company overview, core competencies, differentiators, past performance and NAICS codes.', 'Drafting and formatting of one capability statement (one page) in client-ready PDF format, based on client-provided information.', 'Certification claims not officially confirmed by the client; graphic-design branding beyond a clean standard layout; ongoing updates (see refresh SKUs).', true),
  ('DNI-13A-005', 'Written research brief on government/institutional demand for a defined service line, market or agency, from publicly available sources.', 'A written brief using publicly available sources (SAM.gov, agency forecasts, public spend data) for one defined market/agency/service line.', 'Paid/proprietary data sources unless separately billed; forecasting guarantees; primary research (interviews, surveys).', true),
  ('DNI-13A-006', 'Research and recommendation of applicable NAICS codes for the client''s business based on services offered.', 'A written recommendation of applicable NAICS code(s) with supporting rationale, based on client-provided service descriptions.', 'Legal opinion on code eligibility or set-aside qualification; SAM.gov profile updates (see Vendor Profile Setup); size-standard/compliance determinations.', true),
  ('DNI-13A-007', 'Search and compilation of open or upcoming solicitations matching client-defined criteria (NAICS, agency, geography).', 'A compiled list of matching solicitations from public sources for an agreed search window, with basic details (agency, due date, value where published).', 'Bid/no-bid recommendation (see Bid/No-Bid Analysis); proposal writing; guaranteed completeness of results.', true),
  ('DNI-13A-008', 'Structured evaluation of one solicitation against client-defined capability and risk criteria, with a written recommendation.', 'A written bid/no-bid analysis for one solicitation, covering fit, competition, risk and resource requirements against client-provided criteria.', 'Proposal writing or submission; legal review of solicitation terms; guaranteed award likelihood.', true),
  ('DNI-13A-009', 'Organization and readiness review of proposal materials, boilerplate content and required attachments ahead of a solicitation deadline.', 'Review and organization of client-provided proposal content, boilerplate and required attachments into a submission-ready structure for one solicitation.', 'Technical/narrative proposal writing (see Proposal Coordination); pricing strategy; legal review of contract terms.', true),
  ('DNI-13A-010', 'End-to-end coordination of one proposal response, including timeline management, section assignments, and a compiled submission-ready package.', 'Coordination of proposal timeline, section tracking, compilation and formatting of one complete proposal submission, based on client-provided technical/pricing content.', 'Original technical or pricing content development; legal review; submission-portal fees or guaranteed award.', true),
  ('DNI-13A-011', 'Support completing one vendor registration for a specific government or institutional buyer/portal.', 'Document compilation and application-field completion support for one vendor registration.', 'Registration fees; legal/tax entity advice; guaranteed registration approval.', true),
  ('DNI-13A-012', 'Organization and formatting of procurement-related documents (forms, certifications, attachments) for one submission.', 'Compilation, formatting and checklist verification of an agreed document set for one procurement submission.', 'Original content drafting beyond formatting/organization; legal review; notarization (unless separately confirmed).', true),
  ('DNI-13A-013', 'Administrative tracking of contract milestones, deliverables, correspondence and required documentation for one active contract.', 'Milestone/deliverable tracking and documentation organization for one contract within the billing period.', 'Contract negotiation or modification decisions; legal interpretation of contract terms; payment processing/custody of funds.', true),
  ('DNI-13A-014', 'Tracking of invoice status, deliverable due dates and supporting documentation for one active government/institutional contract.', 'Maintenance of a tracker for invoices and deliverables (status, due dates, supporting records) for one contract within the billing period.', 'Invoice generation/accounting entries (see bookkeeping SKUs); payment processing or custody of funds; dispute resolution.', true),
  ('DNI-13A-015', 'Organization of documentation required to demonstrate compliance with a defined set of contract or program requirements.', 'Compilation and organization of an agreed set of compliance documents/records against a defined requirements checklist.', 'Legal or regulatory compliance opinions; certification issuance; representing compliance not supported by the underlying documents.', true),
  ('DNI-13A-016', 'Administrative preparation and organization of routine reports required under a government or institutional contract.', 'Compilation and formatting of one recurring or one-time required report from client-provided data, for one contract/reporting period.', 'Data collection/field verification (see D13 field-documentation SKUs); regulatory certification of report accuracy; report submission-portal fees.', true),
  ('DNI-13A-017', NULL, 'Coordination of janitorial service schedules, quality-documentation review, supply-requirement tracking and contractor-workflow coordination for one facility/contract.', 'Direct janitorial/cleaning labor (subcontracted separately); supply purchasing costs (pass-through); contractor payment processing.', false),
  ('DNI-13A-018', NULL, 'Coordination of an agreed set of approved facilities-support activities, vendor scheduling, work-order tracking and documentation for one facility/contract within the billing period.', 'Direct facilities/maintenance labor (subcontracted separately); vendor payment processing; capital repair/construction decisions.', false),
  ('DNI-13A-019', NULL, 'An agreed set of administrative-support tasks (records, scheduling, correspondence, task tracking) for one approved government/institutional workflow within the billing period.', 'Decisions requiring government-employee/PII access beyond the approved scope; legal or HR authority; ongoing coverage beyond the defined scope (quoted separately).', false),
  ('DNI-13A-020', 'Coordination support scoped to the specific requirements of one active solicitation, spanning research, document preparation and submission logistics.', 'Coordination of research, document preparation and submission logistics for one specific solicitation, based on client-provided technical/pricing content.', 'Original technical/pricing content development; legal review of solicitation terms; guaranteed award.', true)
;

UPDATE public.services s
SET description = t.description
FROM tmp_d13_scope t
WHERE s.sku = t.canonical_sku AND t.desc_is_new;

UPDATE public.dd_master_service_universe m
SET scope = t.scope,
    exclusions = t.exclusions,
    conflict_register = coalesce(conflict_register, '') || ' SCOPE DEFINED 2026-09-18: replaced generic boilerplate/placeholder scope with real scope/exclusions per the Division 13 audit pass (same methodology as Division 08/04 2026-09-18).',
    updated_at = now()
FROM tmp_d13_scope t
WHERE m.canonical_sku = t.canonical_sku;

DROP TABLE tmp_d13_scope;
