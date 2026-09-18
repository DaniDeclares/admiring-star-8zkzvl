-- Division 03 (Real Estate / Closing Support) had zero cost/margin data and 18 of its
-- 20 canonical SKUs carried generic boilerplate description text ("Canonical company-
-- wide service offer. Scope, fulfillment, geography, materials, rush and qualification
-- gates apply.") in services.description and generic scope ("Defined service scope;
-- final scope confirmed at intake.") in dd_master_service_universe -- no real
-- inclusion/exclusion detail for any of the 20 real, priced SKUs. This replaces that
-- boilerplate with real, defensible scope/exclusion text for all 20, following the
-- same pattern used for Division 08
-- (20260918110547_division_08_scope_definitions_and_retainer_fix.sql).
--
-- Labor tiers applied per established methodology: Tier 1 ($60/hr) for hands-on
-- field/routine work (courier runs, sign install, lockbox install, open-house
-- setup/staffing/takedown, walkthroughs, access checks, photography, showing prep),
-- Tier 2 ($75/hr coordination/QA) for vendor-scheduling/coordination work where DANI
-- staff manage a subcontracted vendor rather than perform the physical task themselves
-- (marketing support, closing-appointment support, drone/floor-plan/photo/virtual-tour
-- vendor coordination, new-agent launch kits). Hour estimates are this migration's own
-- reasonable planning assumptions (not an audited company record), consistent with the
-- Division 08 DRAFT cost model
-- (20260918111013_division_08_draft_cost_model_tier3_consulting_rate.sql). No
-- services.starting_price values are changed. Several resulting margins are thin or
-- negative (Open House Staffing, Open House Setup, Real Estate Photography, New Agent
-- Launch Kit) -- these are flagged in margin_economics text for Danielle's review, and
-- nothing is pulled from SELL_NOW.

CREATE TEMP TABLE tmp_d03 (
  canonical_sku text PRIMARY KEY,
  description text,
  scope text,
  exclusions text,
  tier int,          -- 1 = $60/hr, 2 = $75/hr
  est_hours numeric,
  notes text
);
INSERT INTO tmp_d03 (canonical_sku, description, scope, exclusions, tier, est_hours, notes) VALUES
  ('DNI-03A-001', 'Coordination and preparation of brokerage-level marketing materials and assets (templates, flyers, social posts, agent bio/branding items) for one agent or brokerage engagement.', 'Preparation/customization of brokerage-level marketing assets from existing templates for one engagement.', 'Paid ad spend or media placement; graphic design from scratch beyond template customization; per-listing marketing (see Listing Photo/Virtual Tour Coordination).', 2, 1.5, 'Template-based marketing asset prep for one agent/brokerage engagement.'),
  ('DNI-03A-002', 'Pickup and/or delivery of buyer or seller transaction documents between the agent, title company, lender or other approved party within the standard service area.', 'One document pickup/delivery run within the standard service area.', 'Document review, notarization or legal advice; delivery outside the standard service area (billed as a mileage add-on); rush same-hour delivery (quoted separately).', 1, 1.5, 'Pickup/drop-off run including travel and handoff.'),
  ('DNI-03A-003', 'On-site administrative support at a scheduled closing appointment, including document staging, coordination with title/escrow, and handling of approved closing-day errands.', 'Presence and administrative support at one scheduled closing appointment.', 'Notarization or witnessing of signatures (see Division 05); legal representation or advice; handling of closing funds.', 2, 2.0, 'On-site support for the duration of one closing appointment.'),
  ('DNI-03A-004', 'Scheduling and coordination of a licensed drone-media vendor for one listing, including access arrangement, shot-list communication and a delivered-file quality check.', 'Vendor scheduling, shot-list communication, access coordination and delivered-file QA for one listing.', 'FAA Part-107 drone piloting itself (performed by the subcontracted licensed vendor); the vendor''s media/flight fee (billed as pass-through unless bundled); video editing beyond delivered vendor files.', 2, 1.5, 'Vendor coordination and delivered-media QA.'),
  ('DNI-03A-005', 'Scheduling and coordination of a floor-plan vendor for one property, including access arrangement and a delivered-file quality check.', 'Vendor scheduling, access coordination and delivered-file QA for one property floor plan.', 'The vendor''s floor-plan production fee (billed as pass-through unless bundled); on-site measuring performed by DANI staff.', 2, 1.5, 'Vendor coordination and delivered-file QA.'),
  ('DNI-03A-006', 'On-site property access and presence during one scheduled home inspection, including arrival/exit lockup and basic utility access (water/power on) coordination.', 'Access and on-site presence for the duration of one scheduled inspection appointment.', 'Inspection-findings review, repair negotiation or contractor scheduling; utility restoration/repair if systems are non-functional.', 1, 2.5, 'On-site presence for a typical inspection window.'),
  ('DNI-03A-007', 'Scheduling and coordination of a photography vendor for one listing, including property-readiness confirmation, access arrangement and a delivered-image quality check.', 'Vendor scheduling, readiness confirmation, access coordination and delivered-image QA for one listing.', 'The photographer''s shoot fee (billed as pass-through unless bundled); staging or property preparation itself (see Listing Readiness/Showing Preparation).', 2, 1.5, 'Vendor coordination and delivered-image QA.'),
  ('DNI-03A-008', 'Pre-listing property readiness pass, including a room-by-room checklist, minor tidy/staging touch-ups, and coordination of any client-approved vendor readiness tasks (cleaning, minor repairs).', 'One room-by-room readiness pass with minor tidy/staging touch-ups and vendor-task coordination.', 'Vendor cleaning, repair or staging fees (billed as pass-through unless bundled); structural repairs; professional staging furniture rental.', 1, 4.0, 'Full readiness pass across a typical listing.'),
  ('DNI-03A-009', 'Installation (and later removal) of one yard/listing sign and rider(s) at the property, including basic ground staking.', 'Install and later removal of one sign plus riders at one property.', 'Sign/rider materials and printing costs (billed as pass-through or provided by client); HOA signage permits/variances.', 1, 1.0, 'Install pass; removal is billed as the paired takedown if separately scheduled.'),
  ('DNI-03A-010', 'Installation/coding of one access lockbox at the property and coordination of authorized access requests from agents, inspectors or vendors.', 'Lockbox install/coding at one property plus coordination of approved access requests for the engagement.', 'Lockbox hardware cost (billed as pass-through unless client-supplied); after-hours emergency access outside agreed windows.', 1, 1.5, 'Install plus ongoing access coordination for the listing period.'),
  ('DNI-03A-011', 'Assembly of a starter kit of templates, checklists and branded materials for a newly onboarded agent.', 'One-time compiled kit of templates/checklists/branded materials for a new agent.', 'Ongoing coaching or mentorship; custom brand design beyond template customization.', 2, 2.0, 'Kit assembly and handoff for one new agent.'),
  ('DNI-03A-012', 'On-site setup of signage, sign-in materials, refreshments/supply placement and property presentation ahead of a scheduled open house.', 'Setup pass immediately before one scheduled open house.', 'Refreshments/supply costs (billed as pass-through unless bundled); staffing during the event (see Open House Staffing).', 1, 1.0, 'Pre-event setup pass.'),
  ('DNI-03A-013', NULL, 'Guest flow, registration, refreshment/material placement and property monitoring for the duration of one scheduled open house.', 'Sign/marketing production costs; setup or takedown outside the staffed window (see Open House Setup/Takedown).', 1, 2.0, 'Staffed for a typical 2-hour open house window; description already real, scope aligned to it.'),
  ('DNI-03A-014', 'Post-event reset of signage, sign-in materials and property presentation following a scheduled open house.', 'Takedown/reset pass immediately following one scheduled open house.', 'Removal of permanent yard signage (see Listing Sign Installation); property damage repair.', 1, 1.0, 'Post-event reset pass.'),
  ('DNI-03A-015', 'Structured walkthrough of a property ahead of listing, using a written checklist to flag readiness, condition and staging items for the agent.', 'One walkthrough with a written checklist-based findings summary.', 'Repairs or staging execution (see Listing Readiness); professional inspection or code compliance assessment.', 1, 1.0, 'Single walkthrough plus checklist writeup.'),
  ('DNI-03A-016', 'On-site check of a property''s access points (locks, lockbox, gate/alarm codes) to confirm they function as expected ahead of a showing or appointment.', 'One access-point verification visit at one property.', 'Lock/hardware repair; code or credential re-programming beyond simple verification.', 1, 1.5, 'Single verification visit.'),
  ('DNI-03A-017', 'Interior/exterior photography of a listed property using client-provided or DANI-owned equipment, delivered as an edited image set.', 'One photo session at one property plus basic edited-image delivery.', 'Drone/aerial imagery (see Drone Media Coordination); floor plans or virtual tours (billed separately); extensive retouching beyond standard edits.', 1, 1.5, 'Standard listing photo session and basic edit pass; equipment/gear cost not separately itemized -- flagged given thin resulting margin.'),
  ('DNI-03A-018', NULL, 'Property preparation, access, presentation, supply placement, signage and post-showing reset for one scheduled showing per agent instructions.', 'Repairs; staging furniture/inventory cost; showings outside the scheduled window.', 1, 1.0, 'Description already real, scope aligned to it.'),
  ('DNI-03A-019', 'Time-critical pickup and delivery of one transaction document/package between parties (agent, title, lender, courthouse) within the standard service area.', 'One time-critical courier run within the standard service area.', 'Document review, notarization or legal advice; delivery outside the standard service area (billed as a mileage add-on).', 1, 2.5, 'Courier run with tighter timing than standard document run.'),
  ('DNI-03A-020', 'Scheduling and coordination of a virtual-tour vendor for one listing, including access arrangement and a delivered-file quality check.', 'Vendor scheduling, access coordination and delivered-file QA for one virtual tour.', 'The vendor''s production fee (billed as pass-through unless bundled); hosting-platform subscription costs.', 2, 2.0, 'Vendor coordination and delivered-file QA.')
;

-- Update services.description only where it still carries the generic boilerplate
-- (DNI-03A-013 and DNI-03A-018 already have real, specific descriptions and are left
-- untouched).
UPDATE public.services s
SET description = t.description
FROM tmp_d03 t
WHERE s.sku = t.canonical_sku
  AND t.description IS NOT NULL;

UPDATE public.dd_master_service_universe m
SET scope = t.scope,
    exclusions = t.exclusions,
    internal_cost = format('DRAFT: %s hrs @ $%s/hr (Tier %s %s) = $%s. %s',
      t.est_hours,
      (CASE WHEN t.tier = 1 THEN 60 ELSE 75 END),
      t.tier,
      (CASE WHEN t.tier = 1 THEN 'field/routine' ELSE 'coordination/QA' END),
      to_char(t.est_hours * (CASE WHEN t.tier = 1 THEN 60 ELSE 75 END), 'FM999999990.00'),
      t.notes),
    margin_economics = format('DRAFT: price $%s - draft cost $%s = $%s (%s%%) -- hour estimate is this pass''s own planning assumption, not an audited figure. Needs Danielle''s confirmation before any offer-status change.%s',
      to_char(s.starting_price, 'FM999999990.00'),
      to_char(t.est_hours * (CASE WHEN t.tier = 1 THEN 60 ELSE 75 END), 'FM999999990.00'),
      to_char(s.starting_price - (t.est_hours * (CASE WHEN t.tier = 1 THEN 60 ELSE 75 END)), 'FM999999990.00'),
      to_char(round(((s.starting_price - (t.est_hours * (CASE WHEN t.tier = 1 THEN 60 ELSE 75 END))) / nullif(s.starting_price,0)) * 100, 1), 'FM999990.0'),
      (CASE WHEN (s.starting_price - (t.est_hours * (CASE WHEN t.tier = 1 THEN 60 ELSE 75 END))) / nullif(s.starting_price,0) < 0.15
            THEN ' FLAGGED: thin/negative draft margin -- review hour estimate or price before any offer change.'
            ELSE '' END)
    ),
    conflict_register = coalesce(conflict_register, '') || ' SCOPE + DRAFT COST MODEL 2026-09-18: replaced generic boilerplate scope with real scope/exclusions and added a DRAFT Tier 1/2 cost model per the Division 03/05/09 pass. Not yet confirmed by Danielle; do not treat as audited.',
    updated_at = now()
FROM tmp_d03 t
JOIN public.services s ON s.sku = t.canonical_sku
WHERE m.canonical_sku = t.canonical_sku;

DROP TABLE tmp_d03;
