-- Two fixes from the full 13-division Airtable-vs-Supabase economics audit (2026-09-18):
--
-- 1. Two MORE Division 02 services caught selling below their own documented internal
--    cost (same $60/hr Tier-1 labor rate model that caught Apartment Turn / Commercial
--    Space Reset earlier today):
--      - Common Area Detail (DNI-02A-005): price $125 vs cost $135.00 = -$10.00 (-8.0%)
--      - Office Cleaning (DNI-02A-012): price $125 vs cost $135.00 = -$10.00 (-8.0%)
--    Pulled from SELL_NOW the same way, pending a price increase or scope revision.
--
-- 2. REVERTS this morning's NawfSide automotive activation
--    (20260918103522 / 20260918025253_activate_nawfside_existing_automotive_services.sql)
--    for the 5 roadside/tire SKUs (DNI-12A-022 through 026). That migration was made
--    without knowing about a real, prior governance record: Airtable's "DANI DECLARES
--    MASTER COMMERCIAL UNIVERSE" table shows these exact 5 SKUs were deliberately
--    superseded on 2026-09-13 (5 days before this session started working on NawfSide)
--    with the explicit note: "Governance supersession confirmed 2026-09-13. Existing
--    canonical SKU is preserved for audit/history but is not authorized as a DANI
--    sellable service." Recommended status: DO NOT SELL. This matches
--    public.services.commercial_status, which was already correctly 'SUPERSEDED' for
--    all 5 and was never touched by this morning's migration -- meaning Supabase's own
--    services table and dd_governed_service_offers table have been disagreeing with
--    each other since this morning, and today's activation directly contradicted a
--    real, dated governance decision. The same Airtable table shows the real successor:
--    DNI-12A-021 "Mobile Vehicle Detailing" is owner-confirmed SELL NOW (2026-09-14) --
--    NawfSide's real automotive work likely belongs there, under the existing
--    Detailing package-tier model, not resurrected under the superseded granular SKUs.
--    This does NOT undo NawfSide's org-level activation (identity, agreement,
--    accepts_new_work flags remain correct) -- only reverts these 5 specific service
--    offers back to DO_NOT_SELL until Danielle decides how to properly authorize
--    NawfSide's real automotive capability against the correct, non-superseded service.

UPDATE public.dd_governed_service_offers
SET commercial_offer_status = 'DO_NOT_SELL',
    offer_basis = offer_basis || ' PULLED 2026-09-18: priced below own documented internal cost model -- verified real loss at posted price. Re-enable only after a price increase or scope revision closes the gap.'
WHERE canonical_sku IN ('DNI-02A-005', 'DNI-02A-012');

UPDATE public.dd_master_service_universe
SET conflict_register = coalesce(conflict_register, '') ||
  ' PULLED FROM SELL_NOW 2026-09-18: caught selling below its own documented internal cost' ||
  ' (same audit pass that caught Apartment Turn / Commercial Space Reset). Set to' ||
  ' DO_NOT_SELL pending a price increase or scope revision.',
  updated_at = now()
WHERE canonical_sku IN ('DNI-02A-005', 'DNI-02A-012');

UPDATE public.dd_governed_service_offers
SET commercial_offer_status = 'DO_NOT_SELL',
    offer_basis = offer_basis || ' REVERTED 2026-09-18: this mornings NawfSide activation contradicted a real, dated Airtable governance record (supersession confirmed 2026-09-13, "not authorized as a DANI sellable service", recommended DO NOT SELL) that was not known at the time. Reverting to DO_NOT_SELL. NawfSide org-level activation (identity/agreement) stands; the real successor service appears to be DNI-12A-021 Mobile Vehicle Detailing (owner-confirmed SELL NOW 2026-09-14) -- Danielle should confirm whether NawfSide should be authorized there instead.'
WHERE canonical_sku IN ('DNI-12A-022','DNI-12A-023','DNI-12A-024','DNI-12A-025','DNI-12A-026');

UPDATE public.dd_master_service_universe
SET lifecycle_status = 'SUPERSEDED',
    conflict_register = coalesce(conflict_register, '') ||
  ' REVERTED 2026-09-18: this mornings reactivation (lifecycle_status flipped to' ||
  ' CANONICAL_ACTIVE) contradicted a real 2026-09-13 governance supersession decision' ||
  ' recorded in Airtable Master Commercial Universe, discovered during the full' ||
  ' 13-division audit. Reverted lifecycle_status back to SUPERSEDED to match' ||
  ' public.services.commercial_status, which was correct all along.',
  updated_at = now()
WHERE canonical_sku IN ('DNI-12A-022','DNI-12A-023','DNI-12A-024','DNI-12A-025','DNI-12A-026');

UPDATE public.dd_provider_capabilities
SET is_authorized = false
WHERE provider_org_id = '6bb73275-cd4d-44ea-98e4-19113d1954cc'
  AND service_id IN ('1dd18513-c33a-4416-b6cd-3d3f724f7d22','1ae920cc-31e4-492a-bd63-642ba43cc788','6749481c-c150-418d-8ee0-f9065533695a','695b361a-bc7f-401c-8bfa-1c5789726eaa','43fbcb9b-1ec4-4975-a2c5-ba2a94d7a21d');
