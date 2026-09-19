-- Implements Dani's fulfillment-readiness rule: Danielle (Owner/Operator) is
-- the default fulfillment resource for every DANI service unless it needs a
-- license/certification/authorization she lacks, or there is a documented
-- reason it can't be self-fulfilled. Providers are additional capacity, not
-- a precondition for a service being sellable.
--
-- The live commercial gate (checkoutEligibility() in
-- src/lib/operations/governedCommercialGate2026.js) hard-blocks on
-- dd_governed_service_offers.authorized_provider_capability_count = 0, a
-- denormalized count of dd_provider_capabilities rows with is_authorized=true
-- (no trigger keeps it in sync -- every prior authorization migration in this
-- repo has to update it by hand, and this one does too).
--
-- Mapping this rule against live data on 2026-09-19 found 264 services that
-- are otherwise fully governed (commercial_offer_status='SELL_NOW',
-- fulfillment_gate_status='READY') but sit at authorized_provider_capability_count=0.
-- None carries a documented license/certification requirement. Three groups
-- are deliberately EXCLUDED from this pass rather than auto-cleared:
--
--   1. 20 Division 12 courier/logistics services whose
--      provider_qualifications text explicitly reads "Drivers/carriers and
--      regulated transport requirements verified per job" (DNI-12A-001
--      through DNI-12A-020) -- Dani has not confirmed she holds a driver's
--      license and auto insurance on file.
--   2. 2 services already narratively pre-assigned to someone else per
--      dd_master_service_universe.assigned_provider: DNI-02A-008 (Handyman
--      Support -> Nawfside) and DNI-06A-019 (Technical Troubleshooting ->
--      Chris). Authorizing Danielle here would misrepresent who fulfills
--      the work, not just relax a gate.
--   3. All 25 Division 13 (Government & Institutional Procurement) services
--      -- this schema has no field for SAM.gov registration, bonding, or
--      security clearance status, so a blanket clear here can't be verified
--      and is left for manual review.
--
-- That leaves 217 services to authorize.
--
-- A SECOND, independent blocker sits underneath 130 of those 217: divisions
-- 02, 03, 04, 06 and 08 don't route through CH01 (see CHANNELS_BY_DIVISION in
-- api/verify-commercial-intent.js), so checkoutEligibility() also requires
-- channel_availability_count > 0 -- and these divisions have ZERO
-- dd_service_channel_availability rows for ANY service (divisions 03 and 08
-- currently have no sellable services at all). Fixing only
-- authorized_provider_capability_count would leave those 130 still blocked,
-- just by a different reason (MISSING_CHANNEL_AVAILABILITY instead of
-- MISSING_AUTHORIZED_PROVIDER_CAPABILITY per dd_service_readiness_v1). This
-- migration follows the precedent already set for Division 04A
-- (20260919023839_authorize_danielle_division_04a_admin_services.sql): add
-- real per-channel availability rows (eligibility_status='ACTIVE') for
-- exactly the channels each division actually sells through, alongside the
-- capability row, rather than leaving a cosmetic fix in place.
--
-- service_line is set to canonical_sku rather than service_name (the pattern
-- used by earlier authorization migrations in this table) because one
-- service_name ("Vendor Coordination") is shared by two different divisions
-- in this batch and would collide with the existing
-- unique(provider_id, service_line) constraint.
--
-- NOT ADDRESSED HERE, BY DESIGN: cost/margin. checkoutEligibility() has no
-- cost or margin gate at all -- it only checks governance and fulfillment-
-- provider status. Of these 217 services, 209 have no resolved
-- internal_cost/margin_economics value in dd_master_service_universe (it is
-- blank, or the literal text PENDING/DRAFT/TBD); only 8 do (7 in Division 02,
-- 1 in Division 04). Running this migration makes those 209 checkout-eligible
-- at whatever starting_price is on file with no audited cost behind it. That
-- is a separate, real gate this migration does not build -- see the parallel
-- service-economics/PASS-1 thread. Do not treat "fulfillment ready" as
-- "profitable to sell."

BEGIN;

CREATE TEMP TABLE tmp_owner_fulfillment_gap ON COMMIT DROP AS
SELECT
  o.canonical_sku,
  o.runtime_service_id AS service_id,
  m.division,
  (m.division IN ('01','05','07','09','10','11','12')) AS has_ch01
FROM public.dd_governed_service_offers o
JOIN public.dd_master_service_universe m ON m.id = o.master_record_id
WHERE coalesce(o.authorized_provider_capability_count, 0) = 0
  AND o.commercial_offer_status = 'SELL_NOW'
  AND o.fulfillment_gate_status = 'READY'
  AND m.division <> '13'
  AND o.canonical_sku NOT IN ('DNI-02A-008', 'DNI-06A-019')
  AND NOT (m.division = '12' AND coalesce(m.provider_qualifications, '') ILIKE '%drivers/carriers%');

DO $$
DECLARE
  v_count int;
BEGIN
  SELECT count(*) INTO v_count FROM tmp_owner_fulfillment_gap;
  IF v_count <> 217 THEN
    RAISE EXCEPTION 'Expected 217 services in the owner-fulfillment gap after exclusions, found %. Data has moved since this migration was authored (2026-09-19) -- re-verify Division 13, the 20 courier/logistics SKUs, and the 2 pre-assigned SKUs against current data before proceeding.', v_count;
  END IF;
END $$;

-- 1. Authorize Danielle as fulfiller for all 217.
INSERT INTO public.dd_provider_capabilities
  (provider_org_id, provider_id, service_id, service_line, capability_key, is_authorized, tier_availability)
SELECT
  '19c10267-898f-4c10-a25e-186f6aff8771',
  'acba894f-a8c7-4156-b981-fa08acc9e65b',
  g.service_id,
  g.canonical_sku,
  'OWNER_DIRECT_FULFILLMENT',
  true,
  '{}'::jsonb
FROM tmp_owner_fulfillment_gap g
ON CONFLICT (provider_id, service_line) DO NOTHING;

-- 2. Backfill real channel availability for the 5 non-CH01 divisions in the
--    gap (02, 03, 04, 06, 08), through only the channels that division
--    actually sells through per CHANNELS_BY_DIVISION.
INSERT INTO public.dd_service_channel_availability (service_id, channel_code, eligibility_status, notes)
SELECT
  g.service_id,
  c.channel_code,
  'ACTIVE',
  'Backfilled 2026-09-19 implementing the owner-default-fulfillment rule: Danielle is the default fulfiller, and this division had zero channel-availability rows for any service.'
FROM tmp_owner_fulfillment_gap g
JOIN LATERAL (
  SELECT unnest(CASE g.division
    WHEN '02' THEN ARRAY['CH02', 'CH03', 'CH04', 'CH05']
    WHEN '03' THEN ARRAY['CH02', 'CH03', 'CH04']
    WHEN '04' THEN ARRAY['CH02', 'CH03', 'CH04', 'CH05']
    WHEN '06' THEN ARRAY['CH03', 'CH04', 'CH05']
    WHEN '08' THEN ARRAY['CH03', 'CH04', 'CH05']
    ELSE ARRAY[]::text[]
  END) AS channel_code
) c ON true
WHERE NOT g.has_ch01
ON CONFLICT (service_id, channel_code) DO NOTHING;

-- 3. Sync the denormalized counts on dd_governed_service_offers so the
--    checkout gate actually reads the fix.
UPDATE public.dd_governed_service_offers o
SET
  authorized_provider_capability_count = 1,
  channel_availability_count = CASE g.division
    WHEN '02' THEN 4
    WHEN '03' THEN 3
    WHEN '04' THEN 4
    WHEN '06' THEN 3
    WHEN '08' THEN 3
    ELSE o.channel_availability_count
  END
FROM tmp_owner_fulfillment_gap g
WHERE o.canonical_sku = g.canonical_sku;

-- Assertions (fail closed).
DO $$
DECLARE
  v_cap_count int;
  v_still_blocked int;
BEGIN
  SELECT count(*) INTO v_cap_count
  FROM public.dd_governed_service_offers o
  WHERE o.canonical_sku IN (SELECT canonical_sku FROM tmp_owner_fulfillment_gap)
    AND o.authorized_provider_capability_count = 1;
  IF v_cap_count <> 217 THEN
    RAISE EXCEPTION 'Expected 217 governed offers with authorized_provider_capability_count=1, found %', v_cap_count;
  END IF;

  SELECT count(*) INTO v_still_blocked
  FROM public.dd_service_readiness_v1 v
  WHERE v.canonical_sku IN (SELECT canonical_sku FROM tmp_owner_fulfillment_gap)
    AND v.readiness_state NOT IN ('LIVE_CHECKOUT_READY', 'LIVE_MANUAL_INVOICE_ONLY');
  IF v_still_blocked <> 0 THEN
    RAISE EXCEPTION 'Expected all 217 services to clear to LIVE_CHECKOUT_READY or LIVE_MANUAL_INVOICE_ONLY, % still blocked', v_still_blocked;
  END IF;

  RAISE NOTICE 'Owner-default-fulfillment rule implemented: 217/217 previously-gapped services are now checkout-eligible on fulfillment and channel grounds. Cost/margin audit is a separate, still-open gate -- see migration header.';
END $$;

COMMIT;
