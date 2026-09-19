-- SCOPED ALTERNATIVE to 20260919171000_implement_owner_default_fulfillment_rule.sql.
-- Same rule, same channel-availability correctness fix, but clears only the
-- services that also carry resolved (non-blank, non-PENDING/DRAFT/TBD)
-- internal_cost AND margin_economics -- not all 217. This is the version to
-- run if Dani wants the fulfillment gate open now without exposing
-- unaudited-cost work to self-serve checkout ahead of the service-economics/
-- PASS-1 pass. Run ONE of the two migrations, not both -- they overlap.
--
-- Of the 217 services the full migration would clear, only 8 have a resolved
-- internal_cost value (7 in Division 02, 1 in Division 04), and only 7 have
-- BOTH cost and margin resolved (all Division 02; the Division 04 one has
-- cost but not margin). Of those 7, DNI-02A-020's own margin_economics text
-- reads "DO NOT treat as PASS 1 yet: scope/time basis still low-confidence"
-- -- excluded here despite having non-blank fields, since including it would
-- contradict the caveat sitting in the same row. That leaves 6:
-- DNI-02A-003, DNI-02A-007, DNI-02A-015, DNI-02A-016, DNI-02A-017, DNI-02A-019.
--
-- All 6 are Division 02 (non-CH01), so the channel-availability backfill
-- (CH02-CH05, matching CHANNELS_BY_DIVISION in api/verify-commercial-intent.js)
-- still applies here exactly as in the full migration -- that part is a
-- correctness fix either way, not a fulfillment-rule judgment call.

BEGIN;

CREATE TEMP TABLE tmp_owner_fulfillment_gap_cost_scoped ON COMMIT DROP AS
SELECT o.canonical_sku, o.runtime_service_id AS service_id
FROM public.dd_governed_service_offers o
WHERE o.canonical_sku IN (
  'DNI-02A-003', 'DNI-02A-007', 'DNI-02A-015',
  'DNI-02A-016', 'DNI-02A-017', 'DNI-02A-019'
);

DO $$
DECLARE
  v_count int;
BEGIN
  SELECT count(*) INTO v_count FROM tmp_owner_fulfillment_gap_cost_scoped;
  IF v_count <> 6 THEN
    RAISE EXCEPTION 'Expected 6 cost-and-margin-resolved services, found %. Re-verify the SKU list against current dd_master_service_universe.internal_cost / margin_economics before proceeding.', v_count;
  END IF;
END $$;

-- 1. Authorize Danielle as fulfiller for these 6.
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
FROM tmp_owner_fulfillment_gap_cost_scoped g
ON CONFLICT (provider_id, service_line) DO NOTHING;

-- 2. Backfill channel availability (Division 02 sells through CH02-CH05, no CH01).
INSERT INTO public.dd_service_channel_availability (service_id, channel_code, eligibility_status, notes)
SELECT
  g.service_id,
  c.channel_code,
  'ACTIVE',
  'Backfilled 2026-09-19 implementing the owner-default-fulfillment rule, cost-and-margin-scoped subset -- Division 02 had zero channel-availability rows for any service.'
FROM tmp_owner_fulfillment_gap_cost_scoped g
JOIN LATERAL (SELECT unnest(ARRAY['CH02', 'CH03', 'CH04', 'CH05']) AS channel_code) c ON true
ON CONFLICT (service_id, channel_code) DO NOTHING;

-- 3. Sync the denormalized counts.
UPDATE public.dd_governed_service_offers o
SET authorized_provider_capability_count = 1,
    channel_availability_count = 4
FROM tmp_owner_fulfillment_gap_cost_scoped g
WHERE o.canonical_sku = g.canonical_sku;

-- Assertions (fail closed).
DO $$
DECLARE
  v_cap_count int;
  v_still_blocked int;
BEGIN
  SELECT count(*) INTO v_cap_count
  FROM public.dd_governed_service_offers o
  WHERE o.canonical_sku IN (SELECT canonical_sku FROM tmp_owner_fulfillment_gap_cost_scoped)
    AND o.authorized_provider_capability_count = 1;
  IF v_cap_count <> 6 THEN
    RAISE EXCEPTION 'Expected 6 governed offers with authorized_provider_capability_count=1, found %', v_cap_count;
  END IF;

  SELECT count(*) INTO v_still_blocked
  FROM public.dd_service_readiness_v1 v
  WHERE v.canonical_sku IN (SELECT canonical_sku FROM tmp_owner_fulfillment_gap_cost_scoped)
    AND v.readiness_state NOT IN ('LIVE_CHECKOUT_READY', 'LIVE_MANUAL_INVOICE_ONLY');
  IF v_still_blocked <> 0 THEN
    RAISE EXCEPTION 'Expected all 6 services to clear to LIVE_CHECKOUT_READY or LIVE_MANUAL_INVOICE_ONLY, % still blocked', v_still_blocked;
  END IF;

  RAISE NOTICE 'Owner-default-fulfillment rule implemented for the cost-and-margin-resolved subset: 6/6 services now checkout-eligible. The remaining 211 gap services stay gated pending the service-economics/PASS-1 pass.';
END $$;

COMMIT;
