-- Division 01 (Home/Residential) scope definitions and DRAFT cost model, extending the
-- Division 08 methodology established this session to the largest division in the
-- catalog (~180 SKUs). Targets the 25 CANONICAL_ACTIVE dd_master_service_universe rows
-- for division='01' with internal_cost IS NULL (legacy SUPERSEDED duplicate rows for the
-- same canonical_sku, and rows already carrying PENDING_RECONCILIATION cost text, are
-- intentionally left untouched).
--
-- Scope/exclusions: cross-referenced against Airtable "MARKET RESEARCH -- D01 Pricing
-- Evidence" (base appJjOPWnFsZe11zM) GA/SC benchmark verdicts before writing hour
-- estimates -- e.g. Home Watch ($20-199/visit GA benchmark, DANI $65 already mid-range,
-- Conditional verdict), Plant Care (Atlanta Plant Shop confirms a real local market for
-- maintenance/repotting/rescue/relocation but no reliable numeric benchmark recovered,
-- Conditional), Event/Seasonal Reset ($99-200+ adjacent GA/SC benchmarks, flagged as a
-- productization opportunity not a commodity SKU), Estate/Organization work ($40-125/hr
-- GA organizer benchmarks). No verdict is contradicted here; existing Keep
-- Existing/Conditional customer prices are left untouched -- only internal_cost/
-- margin_economics/scope/exclusions are written.
--
-- Labor: Tier 1 $60/hr (hands-on field/routine work) is used for every SKU in this
-- batch -- none of these 25 are genuinely supervisory/inspection-type QA work, so no
-- Tier 2 ($75/hr) SKU exists in this set.
--
-- Materials: DRAFT, conservative, low-precision by design. This session's Google Drive
-- review captured real aggregate cleaning/pet consumables spend of $484-636 across
-- ~34-37 line items in a Feb-Jun 2026 window of UNKNOWN job volume, so a precise
-- per-job materials figure is not yet resolvable. Each SKU below gets a small
-- scope-appropriate point estimate ($0-18) drawn from that same conservative band and
-- explicitly labeled DRAFT rather than computed as a false-precision allocation.
--
-- IMPORTANT: exactly like the Division 08 draft pass, the hour/materials estimates
-- below are THIS PASS'S OWN planning assumptions, not an audited company record like
-- Division 02's pulled losses. Nothing is pulled from SELL_NOW here even where the
-- resulting draft margin is negative or thin -- every such case is flagged in the text
-- for Danielle's confirmation instead. Twelve of these 25 SKUs have no customer price
-- yet in either public.services or dd_master_service_universe.customer_price (they are
-- still commercial shells) -- for those, only a draft cost is recorded and the text says
-- plainly that no margin can be computed yet.

-- ============================================================================
-- PART 1: scope / exclusions
-- ============================================================================
CREATE TEMP TABLE tmp_d01_scope (
  canonical_sku text PRIMARY KEY,
  new_scope text,       -- only non-null where scope was previously NULL
  exclusions text NOT NULL
);
INSERT INTO tmp_d01_scope (canonical_sku, new_scope, exclusions) VALUES
  ('DNI-01A-042', NULL,
   'No plumbing, electrical or structural repair; no mold remediation; no hazardous-material or biohazard cleanup beyond referral to a licensed biohazard remediation company; extraction limited to portable residential-grade equipment.'),
  ('DNI-01C-001',
   'Routine indoor plant care visit for an agreed number of household plants within the booked tier: watering, pruning/grooming, plant health checks, soil top-offs, rotation and basic pest monitoring.',
   'Repotting and plant sourcing are separate add-ons; no licensed horticultural disease diagnosis, pesticide/chemical treatment beyond basic pest monitoring, or outdoor/landscape plant care.'),
  ('DNI-01C-002', NULL,
   'No pesticide/chemical treatment, licensed horticultural diagnosis of plant disease, or guaranteed plant-health outcomes; recommendations are advisory only.'),
  ('DNI-01C-003', NULL,
   'No structural mounting/installation, exterior landscaping, moving of specimens beyond safe manual-lift weight limits, or damage liability for pre-existing plant/container condition.'),
  ('DNI-01C-004', NULL,
   'No guaranteed plant survival/recovery, custom container fabrication, or treatment of root disease/infestation beyond a basic visual root-area check.'),
  ('DNI-01C-005', NULL,
   'No licensed diagnosis or treatment of regulated plant disease, pesticide application, or guaranteed plant recovery.'),
  ('DNI-01C-006', NULL,
   'No plant purchase/sourcing unless separately quoted, pesticide treatment, or guaranteed establishment success.'),
  ('DNI-01D-002',
   'Scheduled visual home-watch visit: interior/exterior walk-through, observation notes, mail/package check and photo documentation for one property per visit.',
   'Not a security service, alarm response, licensed property inspection or repair; issues found are escalated to the client, not resolved on-site.'),
  ('DNI-01D-004',
   'Household-side pre-event setup (surface/area prep, basic staging), light during-event household support, and post-event reset (trash, surface reset, basic tidy) for one residential event.',
   'No event planning, catering, bartending, entertainment booking, equipment/furniture rental or specialty production; those are arranged separately.'),
  ('DNI-01D-007', NULL,
   'No regulated professional tasks requiring licensure (legal, medical, financial transactions), large-item transport requiring a moving vehicle/crew, or handling of cash/valuables beyond client-authorized limits.'),
  ('DNI-01D-008', NULL,
   'No alcohol/regulated-purchase handling beyond applicable law, meal preparation, or reimbursement float beyond the client-authorized budget; grocery cost is billed separately from labor.'),
  ('DNI-01D-009', NULL,
   'No professional housekeeping/deep-cleaning beyond the agreed reset scope, food/beverage preparation, or security services; client-provided linens/amenities assumed unless separately sourced.'),
  ('DNI-01D-010', NULL,
   'Not a security-monitoring service or licensed property inspection; issues found are reported to the client, not resolved on-site.'),
  ('DNI-01D-011', NULL,
   'No retail product sourcing/purchase beyond client-provided items unless separately quoted, and no specialty custom production (e.g. calligraphy, custom printing).'),
  ('DNI-01D-012', NULL,
   'No professional appraisal, valuation, insurance determination or legal conclusions; the deliverable is a documented inventory only.'),
  ('DNI-01D-013', NULL,
   'No security custody/liability for package contents beyond the agreed task, courier/shipping services, or regulated/controlled-item handling.'),
  ('DNI-01D-014', NULL,
   'No appliance repair, plumbing/electrical work, or general pantry/food organization (see Culinary Pantry & Kitchen Cabinet Organization); distinct from ordinary kitchen cleaning.'),
  ('DNI-01D-015', NULL,
   'No heavy debris hauling, specialty/hazmat cleaning, or third-party rental-equipment returns; those are separately scoped.'),
  ('DNI-01D-016', NULL,
   'No food-safety remediation, pest-issue treatment, biohazard/hazardous-contamination cleanup, or appliance repair.'),
  ('DNI-01D-017', NULL,
   'No professional appraisal, antique/collectible valuation, auction services, or buyer-network liquidation of high-value estates; those are referred to a specialized estate-sale/appraisal company.'),
  ('DNI-01E-002', NULL,
   'No heavy/furniture moving, truck transport, or trades work (electrical, plumbing, mounting); those are separately scoped.'),
  ('DNI-01F-002', NULL,
   'No electrical repair, permanent wiring, roof-top or unsafe-height work without qualified-specialist routing, or light-string purchase unless separately sourced; removal is typically a separate follow-up visit.'),
  ('DNI-01F-003', NULL,
   'No specialty installation, electrical work, or large/heavy installations requiring additional crew; those route separately.'),
  ('DNI-01F-004', NULL,
   'No large/heavy installations or electrical work; those are separately scoped.'),
  ('DNI-01F-005', NULL,
   'No off-site storage, specialty packing materials, or disposal services; those are separately scoped.')
;

UPDATE public.dd_master_service_universe m
SET scope = COALESCE(m.scope, t.new_scope),
    exclusions = t.exclusions,
    conflict_register = coalesce(m.conflict_register, '') || ' D01 SCOPE PASS 2026-09-18: exclusions added (and scope written where previously null), extending the Division 08 methodology to Division 01. Cross-referenced against Airtable MARKET RESEARCH -- D01 Pricing Evidence verdicts; no verdict contradicted.',
    updated_at = now()
FROM tmp_d01_scope t
WHERE m.canonical_sku = t.canonical_sku
  AND m.division = '01'
  AND m.lifecycle_status = 'CANONICAL_ACTIVE'
  AND m.internal_cost IS NULL;

DROP TABLE tmp_d01_scope;

-- ============================================================================
-- PART 2: DRAFT cost model (Tier 1 $60/hr for all 25 -- no genuinely supervisory/
-- inspection-type SKU exists in this batch)
-- ============================================================================
CREATE TEMP TABLE tmp_d01_econ (
  canonical_sku text PRIMARY KEY,
  hours numeric NOT NULL,
  materials numeric NOT NULL,
  notes text NOT NULL
);
INSERT INTO tmp_d01_econ (canonical_sku, hours, materials, notes) VALUES
  ('DNI-01A-042', 2.5, 18, 'Extraction + deep clean + odor treatment for a pet-mess job beyond standard scope; materials draft reflects enzymatic cleaner/odor-treatment product and extra PPE.'),
  ('DNI-01C-001', 1.0, 6, 'Routine recurring plant-care visit for an agreed plant count; materials draft reflects amortized plant food/basic tools.'),
  ('DNI-01C-002', 1.0, 3, 'On-site assessment + written care plan; materials draft reflects negligible consumables (digital deliverable).'),
  ('DNI-01C-003', 1.5, 4, 'Planning, safe relocation/placement, basic stabilization and cleanup.'),
  ('DNI-01C-004', 1.0, 12, 'Repotting visit; materials draft reflects real potting-soil/drainage-material cost (higher than a typical cleaning consumable line).'),
  ('DNI-01C-005', 1.25, 8, 'Condition assessment, watering correction, basic pruning, recovery plan; materials draft reflects treatment products.'),
  ('DNI-01C-006', 1.0, 5, 'Placement guidance, watering setup, basic pruning/grooming, labeling, care instructions.'),
  ('DNI-01D-002', 0.5, 2, 'Single scheduled visual walk-through visit with photo documentation.'),
  ('DNI-01D-004', 2.5, 12, 'Pre-event setup + light during-event support + post-event reset for one residential event; materials draft reflects setup/cleanup supplies.'),
  ('DNI-01D-007', 1.0, 0, 'Routine errand/task run; no consumable materials.'),
  ('DNI-01D-008', 1.25, 0, 'Shopping trip + restocking; grocery cost itself is billed separately from labor.'),
  ('DNI-01D-009', 1.5, 10, 'Room setup/reset; materials draft assumes some non-client-provided basic amenities.'),
  ('DNI-01D-010', 1.0, 3, 'Home reset, adjustments, package/trash placement, visual readiness check.'),
  ('DNI-01D-011', 1.0, 12, 'Wrapping session; materials draft reflects wrapping paper/bows/tags when not client-provided.'),
  ('DNI-01D-012', 2.0, 0, 'On-site documentation + photos + digital inventory file; no consumable materials.'),
  ('DNI-01D-013', 0.75, 0, 'Package intake/sorting/placement; no consumable materials.'),
  ('DNI-01D-014', 1.5, 8, 'Sorting/grouping/placement reset; materials draft reflects liners/labels.'),
  ('DNI-01D-015', 2.0, 14, 'Post-gathering reset across kitchen/bath/surfaces/floors; materials draft reflects trash bags/cleaning supplies.'),
  ('DNI-01D-016', 1.25, 10, 'Fridge/freezer clear-out, shelf/drawer cleaning, restock organization; materials draft reflects cleaning supplies/liners.'),
  ('DNI-01D-017', 7.0, 15, 'Staging/pricing prep (~2 hrs) plus day-of sale management (~5 hrs) for one flat-fee engagement; materials draft reflects signage/price tags. NOTE: at the current $295 flat fee this draft models a NEGATIVE margin -- flagged below, not pulled from SELL_NOW.'),
  ('DNI-01E-002', 2.0, 8, 'Unpacking, sorting, placement, packaging-material consolidation, room-by-room settling-in.'),
  ('DNI-01F-002', 2.0, 5, 'Single-visit average for planning/placement/installation within safe accessible limits; materials draft assumes client-provided lighting, clips/ties only. Removal is typically billed as a separate follow-up visit.'),
  ('DNI-01F-003', 2.0, 6, 'Seasonal transition: removing/preparing decor, light reset, setting out client-provided items.'),
  ('DNI-01F-004', 2.0, 5, 'Setting out, arranging and removing client-provided seasonal decor within safe handling limits.'),
  ('DNI-01F-005', 1.5, 8, 'Sorting, labeling, packing prep and placement into designated storage; materials draft assumes basic bins/labels when not client-provided.')
;

UPDATE public.dd_master_service_universe m
SET internal_cost = format('DRAFT: %s hrs @ $60/hr (Tier 1 hands-on field/routine work) + $%s materials (DRAFT estimate -- real aggregate cleaning/pet consumables spend of $484-636 across ~34-37 line items was captured Feb-Jun 2026 in this session''s Google Drive review, but per-job volume/allocation is not yet resolved; this is a conservative scope-appropriate placeholder, not an audited per-job figure) = $%s. %s',
    t.hours, to_char(t.materials, 'FM999999990.00'), to_char((t.hours * 60) + t.materials, 'FM999999990.00'), t.notes),
  margin_economics = CASE
    WHEN price.amt IS NOT NULL THEN format('DRAFT: price $%s - draft cost $%s = $%s (%s%%) -- hour/materials estimates are this pass''s own planning assumptions, NOT an audited figure like Division 02''s. Needs Danielle''s confirmation before any offer-status change.',
      to_char(price.amt, 'FM999999990.00'),
      to_char((t.hours * 60) + t.materials, 'FM999999990.00'),
      to_char(price.amt - ((t.hours * 60) + t.materials), 'FM999999990.00'),
      to_char(round(((price.amt - ((t.hours * 60) + t.materials)) / nullif(price.amt,0)) * 100, 1), 'FM999990.0'))
    ELSE format('DRAFT: no established customer price yet in public.services or dd_master_service_universe.customer_price for this SKU (still a commercial shell) -- margin cannot be computed. Draft cost above ($%s) is for reference only; do not read the missing margin figure as a loss. Needs Danielle''s confirmation of price and hour estimate before any offer-status change.',
      to_char((t.hours * 60) + t.materials, 'FM999999990.00'))
  END,
  conflict_register = coalesce(m.conflict_register, '') || ' DRAFT COST MODEL 2026-09-18: Tier 1 $60/hr + this pass''s own hour/materials estimate, extending the Division 08 draft-cost-model methodology to Division 01. Not yet confirmed by Danielle; do not treat as audited. Nothing pulled from SELL_NOW regardless of resulting draft margin sign.',
  updated_at = now()
FROM tmp_d01_econ t
LEFT JOIN public.services s ON s.sku = t.canonical_sku
CROSS JOIN LATERAL (SELECT COALESCE(s.starting_price, NULL) AS amt) price
WHERE m.canonical_sku = t.canonical_sku
  AND m.division = '01'
  AND m.lifecycle_status = 'CANONICAL_ACTIVE'
  AND m.internal_cost IS NULL;

DROP TABLE tmp_d01_econ;
