-- Danielle asked to add Apostille/POA/Trust/general-notary-work services. All already
-- existed (DNI-05A-025 Apostille & Authentication Assistance, DNI-05A-027 Power of
-- Attorney & Advance Directive Signing, DNI-05A-024 Estate Planning Document Signing
-- explicitly covering Trust AND Estate signings, DNI-05A-002 General Notarization) with
-- real pricing sourced from Danielle's own historical rates and a signed Estate Plan
-- Greenville contract. The real gap was that dd_governed_service_offers.commercial_offer_status
-- (the field the live catalog API actually filters on) was already SELL_NOW/READY for
-- 26 of 27 notary services -- the 27th, I-9 Verification Support, is correctly
-- DO_NOT_SELL, a deliberate compliance-risk pull from earlier this session, left
-- untouched -- but channel_availability_count was 0 for all of them, blocking checkout
-- for every customer type except individual residents (CH01 is exempt from that check
-- in checkoutEligibility()). Danielle Fong's notary commission is real and
-- compliance-verified (dd_provider_organizations.compliance_status='VERIFIED',
-- 2026-09-15), already linked via dd_provider_capabilities (capability_key=NOTARY_PUBLIC,
-- is_authorized=true) to all 27 services -- notary authority is jurisdiction-based, not
-- customer-type-based, so opening the division's other reachable channels needed no new
-- authorization, just the missing dd_service_channel_availability rows. Division 05's
-- CHANNELS_BY_DIVISION entry (api/verify-commercial-intent.js) only exposes
-- B2C/B2B_APT/B2B_RE/B2G (CH01/CH02/CH03/CH05) in the request flow -- CH04 (plain B2B)
-- is not a selectable customer type for this division, so it is intentionally not
-- populated here even though pricing rules exist for it.

DO $$
DECLARE
  v_chan_count int;
  v_offer_count int;
  v_i9_status text;
BEGIN
  SELECT count(*) INTO v_chan_count
  FROM public.dd_service_channel_availability ca
  JOIN public.services s ON s.id = ca.service_id
  WHERE s.service_family IN ('05A Notary & Signing Services','Notary & Document Services')
    AND ca.channel_code IN ('CH01','CH02','CH03','CH05')
    AND ca.eligibility_status = 'ACTIVE';

  IF v_chan_count <> 104 THEN
    RAISE EXCEPTION 'Expected 104 (26x4) active notary channel-availability rows, found %', v_chan_count;
  END IF;

  SELECT count(*) INTO v_offer_count
  FROM public.dd_governed_service_offers o
  JOIN public.services s ON s.id = o.runtime_service_id
  WHERE s.service_family IN ('05A Notary & Signing Services','Notary & Document Services')
    AND o.commercial_offer_status = 'SELL_NOW'
    AND o.fulfillment_gate_status = 'READY'
    AND o.channel_availability_count = 4
    AND o.authorized_provider_capability_count >= 1;

  IF v_offer_count <> 26 THEN
    RAISE EXCEPTION 'Expected 26 fully-eligible notary governed offers, found %', v_offer_count;
  END IF;

  SELECT o.commercial_offer_status INTO v_i9_status
  FROM public.dd_governed_service_offers o
  WHERE o.canonical_sku = 'DNI-05A-007';

  IF v_i9_status <> 'DO_NOT_SELL' THEN
    RAISE EXCEPTION 'I-9 Verification Support must remain DO_NOT_SELL (compliance pull), found %', v_i9_status;
  END IF;

  RAISE NOTICE 'Notary division channel reconciliation verified: 26/26 fully eligible across CH01/02/03/05, I-9 correctly excluded.';
END $$;
