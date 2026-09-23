-- Division 06 had zero real cost/margin data and, for most of its canonical SKUs, only the
-- generic boilerplate "Canonical Division 06 service offer; filing fees and third-party costs
-- are pass-throughs where applicable." -- giving a customer no real idea what was included vs.
-- a billable add-on. This replaces that boilerplate with real, defensible scope/exclusion text
-- for the 17 SKUs that carried it, following the same pattern used for Division 08
-- (20260918110547_division_08_scope_definitions_and_retainer_fix.sql). It also backfills
-- scope/exclusions in dd_master_service_universe (previously just "Guided service scope;
-- final scope confirmed at intake.") for 4 more SKUs (DNI-06A-014, -027, -028, -029) whose
-- services.description was already specific and is left unchanged here.
--
-- Airtable base appJjOPWnFsZe11zM / table "04 Service Economics" (tblXF1ltLjW6DrFgz) was
-- spot-checked for DNI-06A* SKUs before writing this and returned zero matching rows,
-- confirming this session's earlier finding of zero real Division 06 economics coverage.
--
-- Per explicit instruction: DNI-06A-016 (Computer Setup) and DNI-06A-017 (Workstation
-- Deployment) are LOCKED -- they carry a real Master Pricebook price and a 2026-09-18
-- reconciliation note rejecting an alternate pricing scheme. They are excluded entirely from
-- this migration (not touched, not re-litigated). NOTE FOR HUMAN REVIEW: their
-- services.description is still the generic Division 06 boilerplate, not the "real and
-- specific" text this task's instructions assumed was already in place -- flagged here, but
-- left as-is per the explicit "do not touch" instruction for these 2 SKUs.

CREATE TEMP TABLE tmp_d06_scope (
  canonical_sku text PRIMARY KEY, description text, scope text, exclusions text, update_description boolean
);
INSERT INTO tmp_d06_scope (canonical_sku, description, scope, exclusions, update_description) VALUES
  ('DNI-06A-001', 'Guided assistance preparing and filing one LLC formation with the state, using client-provided business details.', 'Preparation and filing of one state LLC formation using information the client provides, plus confirmation once the state processes it.', 'State filing fees (billed as a pass-through at actual cost); registered agent service (see Registered Agent Research); operating agreement drafting; EIN application (see EIN Application Assistance); legal review of formation documents.', true),
  ('DNI-06A-002', 'Guided assistance preparing and filing one corporation formation with the state, using client-provided business details.', 'Preparation and filing of one state corporation formation (including S-corp election support at the client''s direction) using client-provided information, plus confirmation once the state processes it.', 'State filing fees (pass-through); registered agent service; bylaws or stock-issuance document drafting; EIN application; legal review.', true),
  ('DNI-06A-003', 'Guided assistance preparing and filing one DBA/fictitious name registration with the applicable state or county office.', 'Preparation and filing of one DBA/fictitious name registration using client-provided information, plus confirmation once processed.', 'Filing/publication fees (pass-through, where the jurisdiction requires newspaper publication); trademark search or registration; multiple-name filings (quoted per name).', true),
  ('DNI-06A-004', 'Guided assistance completing one state or local business registration using client-provided information.', 'Preparation and submission of one business registration application (state/local, as applicable) using information the client provides.', 'Registration/permit fees (pass-through); industry-specific licensing (see Business License Research); ongoing renewal filing (see Annual Registration Assistance).', true),
  ('DNI-06A-005', 'Guided assistance preparing and submitting one annual report/registration renewal for an existing business entity.', 'Preparation and submission of one annual report or registration renewal using the entity''s existing on-file information.', 'State filing fees (pass-through); reinstating a lapsed/administratively-dissolved entity; changes to entity structure, officers, or registered agent (quoted separately).', true),
  ('DNI-06A-006', 'A written, sequenced checklist of the setup steps a new business needs to complete, based on its structure and location.', 'One written checklist covering formation, registration, licensing, and basic operational setup steps relevant to the client''s business type and state.', 'Completion of the checklist items themselves (each is quoted as its own service); legal or tax advice.', true),
  ('DNI-06A-007', 'Guided assistance completing and submitting one federal EIN (Employer Identification Number) application.', 'Preparation and submission of one EIN application (Form SS-4) using client-provided entity information, plus confirmation of the assigned EIN.', 'Entity formation itself (see LLC/Corporation Formation Support); state tax ID registration; corrections to an already-issued EIN.', true),
  ('DNI-06A-008', 'Research identifying the business licenses and permits required for one business at its stated location and industry.', 'A written summary of applicable federal, state, and local licenses/permits for one defined business activity and location, with application links/contacts.', 'Completing or filing the license/permit applications themselves (quoted separately); license/permit fees; ongoing renewal tracking (see Business Compliance Calendar).', true),
  ('DNI-06A-009', 'Research and comparison of registered agent service options for one business entity''s state of formation.', 'A written comparison of registered agent providers/pricing for one state, with a recommendation.', 'Registered agent service fees themselves; acting as registered agent; ongoing agent-of-record management.', true),
  ('DNI-06A-010', 'A written calendar of recurring filing and renewal deadlines applicable to one business entity.', 'One written compliance calendar (annual reports, license renewals, tax deadlines as identified) for one entity/state, delivered as a document.', 'Completing the filings themselves; ongoing calendar maintenance/updates after delivery; legal/tax advice on the underlying obligations.', true),
  ('DNI-06A-011', 'Setup of one Google Workspace account, including basic mail routing and initial user provisioning.', 'Account creation/configuration, domain verification, MX record setup, and provisioning for an agreed number of initial users (up to 3) in one Google Workspace environment.', 'Google Workspace subscription fees; data migration from a prior email provider; provisioning beyond the agreed initial user count; ongoing admin support.', true),
  ('DNI-06A-012', 'Registration or configuration of one domain name and its basic DNS records.', 'Registration (or configuration of a client-owned domain) and basic DNS setup (e.g. pointing to a website or email host) for one domain.', 'Domain registration/renewal fees; website hosting; email hosting (see Business Email Setup); trademark clearance.', true),
  ('DNI-06A-013', 'Setup of one business email hosting configuration and initial mailbox provisioning.', 'Email hosting configuration, DNS records, and provisioning for an agreed number of initial mailboxes (up to 3) on one domain.', 'Email hosting subscription fees; migration of existing mail/contacts; provisioning beyond the agreed mailbox count.', true),
  ('DNI-06A-014', 'Operational support for launching or migrating a business website, including content transfer, domain coordination, testing and launch readiness.', 'Launch or migration support for one website using client-provided or already-designed content: content transfer into the platform, domain coordination, functional testing, and a launch-readiness check.', 'Website design/theme creation; copywriting (see Website Content/Website Copy Refresh); hosting/platform subscription fees; ongoing maintenance (see Website Maintenance).', false),
  ('DNI-06A-015', 'Ongoing technical upkeep for one existing website: platform/plugin updates, backups, uptime/security checks, and minor content edits.', 'Technical maintenance tasks (updates, backups, security/uptime checks) plus minor content edits (text/image swaps) for one existing website, for one service cycle as scoped with the client.', 'Hosting/domain/plugin licensing fees; new page builds or redesigns; content writing beyond minor edits; incident response for a compromised/hacked site (quoted separately).', true),
  ('DNI-06A-018', 'Physical setup and configuration of one printer or scanner and its connection to the client''s network/computer(s).', 'Unboxing, physical connection, driver installation, and network/computer configuration for one printer or scanner.', 'Hardware cost; multi-device or multi-location setup (quoted per unit); ongoing supplies (ink/toner) or maintenance.', true),
  ('DNI-06A-019', 'Diagnosis and resolution of one defined hardware or software issue on client-owned equipment.', 'Diagnosis and resolution of one specific reported issue, up to the time included, plus a written summary of the fix if requested.', 'Hardware replacement parts; issues requiring a paid software license to resolve; problems outside the originally reported issue (quoted separately if found).', true),
  ('DNI-06A-020', 'Configuration of one existing database or business software system''s structure and settings for the client''s use case.', 'Setup of tables/fields/settings and basic automation already available in one client-selected database or business software tool.', 'Software licensing cost; custom development or API integration; data migration or cleanup; ongoing system administration.', true),
  ('DNI-06A-027', 'Copy cleanup for one page, service positioning, CTA language, and risk-safe wording notes. Excludes website development or platform setup unless quoted.', 'Copy cleanup and rewrite for one webpage: messaging, service positioning, and CTA language, plus risk-safe wording notes.', 'Website development or platform setup; design/layout changes; publishing the copy live unless separately arranged.', false),
  ('DNI-06A-028', 'Public-facing service menu or pricing summary copy based on approved locked prices. Excludes publishing live updates unless approved.', 'Public-facing service menu or pricing summary copy written from client-approved, already-locked prices.', 'Publishing live updates unless separately approved; the underlying pricing/economics analysis itself; design/layout work.', false),
  ('DNI-06A-029', 'Recommended booking flow, payment terms, deposit rules, intake fields, and automation checklist. Excludes payment processor underwriting or legal terms review.', 'A written recommendation covering booking flow, payment terms, deposit rules, intake fields, and an automation checklist for one business.', 'Payment processor underwriting/account setup; legal review of terms; building the automation itself (quoted separately).', false)
;

UPDATE public.services s
SET description = t.description
FROM tmp_d06_scope t
WHERE s.sku = t.canonical_sku AND t.update_description;

UPDATE public.dd_master_service_universe m
SET scope = t.scope,
    exclusions = t.exclusions,
    conflict_register = coalesce(conflict_register, '') || ' SCOPE DEFINED 2026-09-18: replaced generic boilerplate/placeholder scope with real scope/exclusions per the Division 06/07 audit pass. DNI-06A-016/017 intentionally excluded (locked pricing, do not re-litigate).',
    updated_at = now()
FROM tmp_d06_scope t
WHERE m.canonical_sku = t.canonical_sku;

DROP TABLE tmp_d06_scope;
