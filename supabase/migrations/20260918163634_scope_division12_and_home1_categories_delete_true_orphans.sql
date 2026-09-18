-- Continues the same category-scoping fix pattern (migrations 20260918161624,
-- 20260918162358) for Division 12, plus resolves two Division 1 duplicates and deletes four
-- confirmed orphaned categories, per Danielle's expanded audit request.
--
-- Division 12 (36 services, single "12A" prefix, no sub-family split) had 7 categories all
-- resolving to the same unscoped full division list: COURIER_LOGISTICS, VEHICLE_DETAILING,
-- ROADSIDE_ASSISTANCE, MOBILE_TIRE_INSTALLATION, PUNCTURE_REPAIR, TIRE_MOUNTING_BALANCING,
-- TIRE_SALES_INSTALLATION. VEHICLE_DETAILING is real (Danielle + Cayla both authorized for
-- DNI-12A-021 "Mobile Vehicle Detailing"). The five roadside/tire categories exactly match
-- NawfSide's real, currently-authorized capabilities (DNI-12A-022 through 026).
-- COURIER_LOGISTICS is the general courier/logistics/sourcing skill cluster and correctly
-- covers DNI-12A-001 through 020 plus DNI-12A-027 (Medical Courier) -- explicitly excluding
-- the detailing/roadside/tire specialty SKUs it was wrongly also matching, and excluding
-- DNI-12A-028 (Carrier Back-Office Support), which is already globally excluded from the
-- onboarding wizard's catalog fetch as DANI-direct admin work, not a field capability.
--
-- Division 1: HOME_WATCH and LAUNDRY_VALET both have real backing (Danielle is authorized for
-- DNI-01D-002 "Home Watch / Household Absence Check" and DNI-01A-004 "Valet Wash, Dry & Fold"
-- respectively) but were unscoped, colliding with the rest of Division 1's 66 services.
-- Narrowed to their real single SKU each rather than deleted, even though both SKUs are also
-- reachable via the already-correctly-scoped HOUSEHOLD_CONCIERGE (01D) and CLEANING (01A)
-- categories -- keeping them as their own distinct, more discoverable checkbox options.
--
-- Deleted as confirmed true orphans: JUMP_START, FLAT_TIRE_CHANGE, FUEL_DELIVERY,
-- LOCKOUT_KEY_SERVICE. No canonical SKU exists anywhere in the catalog for any of these as a
-- standalone billable service. Their identically-named capability_key appears on four of
-- NawfSide's own dd_provider_capabilities rows, but those are separate, already correctly
-- unauthorized (is_authorized=false) discovery-evidence records with service_id=null --
-- honest "candidate capability, not yet a real DANI service" markers from earlier research,
-- untouched by this migration. These four category rows had nothing real to scope to.
--
-- No dd_provider_capabilities rows created, modified, or copied. No authorization granted.
-- No prices or commercial offers changed.
--
-- Verified post-change: all nine touched/kept categories resolve to exactly their intended
-- SKUs (COURIER_LOGISTICS: 21, the rest: 1 each); dd_provider_capabilities row count
-- unchanged at 282; NawfSide's 4 discovery-evidence rows (service_id=null,
-- is_authorized=false) untouched; the four deleted category rows confirmed gone; Supabase
-- security advisories show no new findings; production build compiles clean. Separately
-- searched the full canonical catalog for any long-haul freight/trucking/load-hauling/dispatch
-- service (per a real provider relationship Danielle is evaluating) and found nothing --
-- DANI has no existing SKU for that work, so nothing was mapped or created for it.

UPDATE public.dd_provider_capability_categories SET canonical_skus = ARRAY['DNI-12A-021'] WHERE category_key = 'VEHICLE_DETAILING';
UPDATE public.dd_provider_capability_categories SET canonical_skus = ARRAY['DNI-12A-022'] WHERE category_key = 'ROADSIDE_ASSISTANCE';
UPDATE public.dd_provider_capability_categories SET canonical_skus = ARRAY['DNI-12A-023'] WHERE category_key = 'MOBILE_TIRE_INSTALLATION';
UPDATE public.dd_provider_capability_categories SET canonical_skus = ARRAY['DNI-12A-024'] WHERE category_key = 'PUNCTURE_REPAIR';
UPDATE public.dd_provider_capability_categories SET canonical_skus = ARRAY['DNI-12A-025'] WHERE category_key = 'TIRE_MOUNTING_BALANCING';
UPDATE public.dd_provider_capability_categories SET canonical_skus = ARRAY['DNI-12A-026'] WHERE category_key = 'TIRE_SALES_INSTALLATION';
UPDATE public.dd_provider_capability_categories SET canonical_skus = ARRAY[
  'DNI-12A-001','DNI-12A-002','DNI-12A-003','DNI-12A-004','DNI-12A-005','DNI-12A-006',
  'DNI-12A-007','DNI-12A-008','DNI-12A-009','DNI-12A-010','DNI-12A-011','DNI-12A-012',
  'DNI-12A-013','DNI-12A-014','DNI-12A-015','DNI-12A-016','DNI-12A-017','DNI-12A-018',
  'DNI-12A-019','DNI-12A-020','DNI-12A-027'
] WHERE category_key = 'COURIER_LOGISTICS';

UPDATE public.dd_provider_capability_categories SET canonical_skus = ARRAY['DNI-01D-002'] WHERE category_key = 'HOME_WATCH';
UPDATE public.dd_provider_capability_categories SET canonical_skus = ARRAY['DNI-01A-004'] WHERE category_key = 'LAUNDRY_VALET';

DELETE FROM public.dd_provider_capability_categories WHERE category_key IN ('JUMP_START','FLAT_TIRE_CHANGE','FUEL_DELIVERY','LOCKOUT_KEY_SERVICE');
