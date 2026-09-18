-- Division 04 (Admin/Business Operations, incl. R.E.A.C.H. consulting sub-line) had 17 of its
-- 53 canonical SKUs carrying the generic boilerplate "Canonical Division 04 service offer;
-- scope and fulfillment gates apply." (services.description) and 20 SKUs (001-020) carrying
-- the generic "Defined service scope; final scope confirmed at intake." with no exclusions
-- (dd_master_service_universe.scope/exclusions) -- meaning a customer quoting these had no
-- clear idea what was included vs. a billable add-on. This replaces both with real,
-- defensible scope/exclusion text, consistent with the Division 08 pass earlier this session.
--
-- Three SKUs (DNI-04A-006, -007, -017) already carried a real services.description, so that
-- field is left untouched for those three; only their dd_master_service_universe scope/
-- exclusions (still the generic placeholder) are populated here.
--
-- Also fixes the same data bug found in Division 08: "Administrative Retainer"
-- (DNI-04A-020) is priced at $750 but tagged billing_cycle=ONETIME -- a retainer that only
-- bills once isn't a retainer. Corrected to RECURRING/MONTHLY, matching the DNI-08A-020 fix
-- and Division 04's own existing Monthly HQ Support / R.E.A.C.H. Monthly Buildout HQ pattern.
-- NOTE: the $750 customer price itself is NOT changed here (see the companion cost-model
-- migration for a real pricing discrepancy this pass found and flagged, but did not resolve,
-- against Airtable's 2026-09-02 owner-approved pricing lock for this and 19 other D04 SKUs).

CREATE TEMP TABLE tmp_d04_scope (
  canonical_sku text PRIMARY KEY, description text, scope text, exclusions text, desc_is_new boolean
);
INSERT INTO tmp_d04_scope (canonical_sku, description, scope, exclusions, desc_is_new) VALUES
  ('DNI-04A-001', 'General virtual-assistant support for one clearly defined administrative task or task list (scheduling, email drafting, basic research, data entry) within an agreed time block.', 'Completion of one defined task or task list within the agreed time block (base tier: up to 1 hour).', 'Specialized software/licensing costs; ongoing daily coverage (see Monthly HQ Support retainers); access to client financial accounts or legal decision-making.', true),
  ('DNI-04A-002', 'In-person administrative support at the client''s location for a defined block of time (filing, mailing, basic reception/setup tasks, document handling).', 'On-site presence and completion of defined administrative tasks for one scheduled block (base tier: up to 1 hour); local travel included.', 'Travel outside the standard local service area (billed separately); multi-day or recurring on-site coverage (see retainer tiers); tasks requiring a professional license (notary, bookkeeping, etc.).', true),
  ('DNI-04A-003', 'Sorting, labeling, flagging and routine response drafting for one client email inbox against client-approved rules and templates.', 'Inbox triage and organization for one account within the agreed time block, using client-approved response templates/rules.', 'Sending client-authored or legally binding correspondence without prior approval; managing more than one inbox (quoted per inbox); inbox/email-platform migration or setup.', true),
  ('DNI-04A-004', 'Scheduling, confirming and organizing appointments on one client calendar according to client-provided availability and preferences.', 'Calendar upkeep for one calendar within the agreed time block: booking, confirming, rescheduling and conflict flagging.', 'Managing more than one calendar (quoted per calendar); travel booking and itinerary planning (see Meeting/Travel support); calendar-software licensing.', true),
  ('DNI-04A-005', 'Manual entry of client-provided data into a specified spreadsheet, form or system according to a defined format.', 'Entry of an agreed data volume/record count into one defined destination within the agreed time block.', 'Data cleansing, deduplication or record-matching beyond basic entry (see CRM Cleanup); software licensing; validation against third-party databases.', true),
  ('DNI-04A-006', NULL, 'Receipt, naming, organization, indexing and routing of an agreed document set according to a defined filing procedure.', 'Document creation or drafting; scanning-hardware/software costs; secure/regulated records remediation (quoted separately).', false),
  ('DNI-04A-007', NULL, 'Formatting and assembly of an agreed set of documents (proposals, presentations, submission packages) into a client-ready format.', 'Original content writing/copywriting; graphic design beyond basic formatting; complex multimedia production.', false),
  ('DNI-04A-008', 'Meeting logistics, note-taking, action-item capture and follow-up distribution for one scheduled meeting or call.', 'Pre-meeting prep (agenda/materials organization), live note-taking, and a written action-item summary distributed after one meeting/event.', 'Meeting-room/venue costs; recording/transcription software licensing; extended coverage beyond the scheduled event (see block/retainer tiers).', true),
  ('DNI-04A-009', 'General research on a defined topic or question, compiled from publicly available sources into a written summary.', 'A written research summary on one defined topic/question, using publicly available sources, within the agreed time block.', 'Paid/proprietary data sources unless separately billed; legal, medical, financial or tax advice; primary research (surveys, interviews).', true),
  ('DNI-04A-010', 'Coordination of tasks, deadlines and communication across a defined project or initiative on the client''s behalf.', 'Task tracking, deadline follow-up and status communication across an agreed set of project workstreams within the billing period.', 'Direct execution of the underlying deliverables (billed as their own service); vendor/contractor payments; legal or contractual decision-making authority.', true),
  ('DNI-04A-011', 'Written step-by-step standard operating procedure for one defined business process.', 'One documented SOP (steps, roles, checkpoints) for a single defined process, based on client-provided process information.', 'Process redesign/consulting beyond documenting the existing process (see Process Mapping/Workflow Cleanup); staff training on the SOP (quoted separately); software configuration.', true),
  ('DNI-04A-012', 'Visual/written map of one existing business process, showing steps, decision points and handoffs.', 'One process map (flowchart plus written notes) for a single defined process, based on client-provided information and/or interviews.', 'Process redesign or optimization recommendations (see Workflow Cleanup); software/tool implementation; mapping more than one process (quoted per process).', true),
  ('DNI-04A-013', 'Review and reorganization of one existing workflow to remove redundant steps and clarify handoffs.', 'Review of one defined workflow plus a revised, written workflow with redundant steps removed and handoffs clarified.', 'Software/tool purchase or configuration; staff retraining; redesign of workflows outside the one defined scope.', true),
  ('DNI-04A-014', 'Structured review of current administrative/operational systems with a written findings report and prioritized recommendations.', 'One structured review of an agreed set of operational areas, delivered as a written findings report with prioritized recommendations.', 'Implementation of any recommended fixes (quoted separately); legal, tax or compliance opinions; audit/attestation services.', true),
  ('DNI-04A-015', 'General back-office administrative support (filing, correspondence, routine record-keeping) within an agreed scope and time block.', 'Completion of an agreed set of back-office administrative tasks within the billing block.', 'Bookkeeping/accounting services (see Division 04 bookkeeping SKUs); legal or HR advice; ongoing daily coverage (see retainer tiers).', true),
  ('DNI-04A-016', 'Follow-up outreach (calls, emails or texts) to a defined batch of customers using client-approved scripts/templates.', 'Outreach to an agreed batch of customers using client-approved scripts/templates, with a written completion/response log.', 'Sales negotiation or closing; outreach volume beyond the agreed batch (billed additionally or via retainer); CRM software licensing.', true),
  ('DNI-04A-017', NULL, 'Record cleanup, data entry, tagging, pipeline maintenance, task assignment and routine reporting support for one existing CRM instance.', 'CRM software licensing; data migration between platforms; sales strategy or pipeline-stage redesign (see Division 08 CRM Pipeline Setup).', false),
  ('DNI-04A-018', 'Administrative tracking and coordination of vendor records, documentation and routine communication.', 'Maintenance of vendor records/documentation and routine vendor communication for an agreed vendor list within the billing block.', 'Vendor negotiation or contract terms; vendor vetting/compliance verification (see the separate provider-signup process); payment processing.', true),
  ('DNI-04A-019', 'Higher-touch executive-assistant support (inbox/calendar management, meeting prep, correspondence drafting) for a defined scope of work.', 'An agreed set of executive-support tasks (inbox, calendar, correspondence, meeting prep) within the billing block.', 'Access to or management of client financial accounts; legal or contractual decision-making; ongoing daily coverage beyond the defined scope (see retainer tiers).', true),
  ('DNI-04A-020', 'Defined monthly administrative-operations capacity across coordination, documentation and support tasks.', 'An agreed set of hours/deliverables per month across administrative coordination, documentation and support tasks, scoped with the client at signup.', 'Ad-hoc project work outside the defined monthly scope (billed separately); licensed professional services (legal, tax, bookkeeping attestation); staffing/employment of client personnel.', true)
;

UPDATE public.services s
SET description = t.description
FROM tmp_d04_scope t
WHERE s.sku = t.canonical_sku AND t.desc_is_new;

UPDATE public.dd_master_service_universe m
SET scope = t.scope,
    exclusions = t.exclusions,
    conflict_register = coalesce(conflict_register, '') || ' SCOPE DEFINED 2026-09-18: replaced generic boilerplate/placeholder scope with real scope/exclusions per the Division 04 audit pass (same methodology as Division 08 2026-09-18).',
    updated_at = now()
FROM tmp_d04_scope t
WHERE m.canonical_sku = t.canonical_sku;

-- Fix: "Administrative Retainer" should recur monthly, not bill once (same bug pattern as
-- DNI-08A-020 "Business Development Retainer"). Customer price ($750) is NOT changed here.
UPDATE public.services
SET pricing_type = 'RECURRING', billing_cycle = 'MONTHLY'
WHERE sku = 'DNI-04A-020';

DROP TABLE tmp_d04_scope;
