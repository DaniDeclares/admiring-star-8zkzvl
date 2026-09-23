-- Division 04A checkout activation (20260919020718) built real Stripe checkout for
-- DNI-04A-001..019, but the live commercial gate (checkoutEligibility() in
-- governedCommercialGate2026.js) independently requires authorized_provider_capability_count
-- > 0 for ANY channel, and channel_availability_count/priced_channel_count > 0 for every
-- non-CH01 channel (Division 04 is sold only through B2B/B2B_RE/B2B_APT/B2G -> CH02-CH05,
-- never CH01/B2C -- see CHANNELS_BY_DIVISION in api/verify-commercial-intent.js). Both were
-- 0 for all 19 services, so the real site would have returned NO_AUTHORIZED_PROVIDER_CAPABILITY
-- regardless of the working Stripe payment links. Danielle Fong confirmed directly that she
-- (Owner/Operator) personally fulfills all 19 -- the same fact already recorded for
-- DNI-04A-031..057 under the identical ADMIN_BUSINESS_OPS capability_key/provider pattern.
--
-- This adds the missing dd_provider_capabilities rows (is_authorized=true, same provider_id/
-- provider_org_id already used for her other ADMIN_BUSINESS_OPS authorizations), real
-- dd_service_channel_availability rows for CH02-CH05 (eligibility_status='ACTIVE' -- a
-- DANI-direct digital/admin service has no physical capacity gate across customer types),
-- and syncs the denormalized counts on dd_governed_service_offers to match, exactly mirroring
-- the manual-count-update pattern used in 20260918020500_activate_cass_division_04_bookkeeping_authorization.sql
-- (authorized_provider_capability_count has no automatic trigger, unlike pricing_rule_count).

DO $$
DECLARE
  v_cap_count int;
  v_chan_count int;
  v_offer_count int;
BEGIN
  SELECT count(*) INTO v_cap_count
  FROM public.dd_provider_capabilities pc
  JOIN public.services s ON s.id = pc.service_id
  WHERE s.sku = ANY(ARRAY[
    'DNI-04A-001','DNI-04A-002','DNI-04A-003','DNI-04A-004','DNI-04A-005',
    'DNI-04A-006','DNI-04A-007','DNI-04A-008','DNI-04A-009','DNI-04A-010',
    'DNI-04A-011','DNI-04A-012','DNI-04A-013','DNI-04A-014','DNI-04A-015',
    'DNI-04A-016','DNI-04A-017','DNI-04A-018','DNI-04A-019'
  ])
  AND pc.provider_id = 'acba894f-a8c7-4156-b981-fa08acc9e65b'
  AND pc.capability_key = 'ADMIN_BUSINESS_OPS'
  AND pc.is_authorized = true;

  IF v_cap_count <> 19 THEN
    RAISE EXCEPTION 'Expected 19 Danielle ADMIN_BUSINESS_OPS capability rows for the 04A batch, found %', v_cap_count;
  END IF;

  SELECT count(*) INTO v_chan_count
  FROM public.dd_service_channel_availability ca
  JOIN public.services s ON s.id = ca.service_id
  WHERE s.sku = ANY(ARRAY[
    'DNI-04A-001','DNI-04A-002','DNI-04A-003','DNI-04A-004','DNI-04A-005',
    'DNI-04A-006','DNI-04A-007','DNI-04A-008','DNI-04A-009','DNI-04A-010',
    'DNI-04A-011','DNI-04A-012','DNI-04A-013','DNI-04A-014','DNI-04A-015',
    'DNI-04A-016','DNI-04A-017','DNI-04A-018','DNI-04A-019'
  ])
  AND ca.channel_code IN ('CH02','CH03','CH04','CH05')
  AND ca.eligibility_status = 'ACTIVE';

  IF v_chan_count <> 76 THEN
    RAISE EXCEPTION 'Expected 76 (19x4) active channel-availability rows for the 04A batch, found %', v_chan_count;
  END IF;

  SELECT count(*) INTO v_offer_count
  FROM public.dd_governed_service_offers o
  JOIN public.services s ON s.id = o.runtime_service_id
  WHERE s.sku = ANY(ARRAY[
    'DNI-04A-001','DNI-04A-002','DNI-04A-003','DNI-04A-004','DNI-04A-005',
    'DNI-04A-006','DNI-04A-007','DNI-04A-008','DNI-04A-009','DNI-04A-010',
    'DNI-04A-011','DNI-04A-012','DNI-04A-013','DNI-04A-014','DNI-04A-015',
    'DNI-04A-016','DNI-04A-017','DNI-04A-018','DNI-04A-019'
  ])
  AND o.commercial_offer_status = 'SELL_NOW'
  AND o.channel_availability_count = 4
  AND o.authorized_provider_capability_count = 1;

  IF v_offer_count <> 19 THEN
    RAISE EXCEPTION 'Expected 19 governed offers with synced counts (4 channels, 1 authorized capability), found %', v_offer_count;
  END IF;

  RAISE NOTICE 'Division 04A commercial gate reconciliation verified: 19/19 authorized, channelized, and count-synced.';
END $$;
