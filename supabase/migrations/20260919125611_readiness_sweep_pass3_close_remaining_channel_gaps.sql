-- Closes the remaining 29 NO_CHANNEL_AVAILABILITY rows surfaced by
-- dd_service_readiness_v1 after pass 1/2's engine backfill: 26 Division 04
-- services (DNI-04A-031/032/033/034/035/036/037/038/039/040/041/042/043/045/
-- 046/047/048/049/050/051/052/053/054/055/056/057) and 3 Division 06 services
-- (DNI-06A-027/028/029), all already fully priced across all 5 channels
-- (priced_channel_count=5, verified) and already carrying real authorized
-- capability -- purely missing the channel_availability plumbing, same
-- pattern as every prior fix today. Adds rows only for the channels each
-- division's CHANNELS_BY_DIVISION entry actually supports (Division 04:
-- CH02/03/04/05; Division 06: CH03/04/05 -- neither includes CH01/B2C) and
-- syncs the denormalized channel_availability_count.
DO $$
DECLARE
  v_rows_added int;
  v_d04_synced int;
  v_d06_synced int;
  v_remaining int;
BEGIN
  INSERT INTO public.dd_service_channel_availability (service_id, channel_code, eligibility_status, notes)
  SELECT o.runtime_service_id, chan.channel_code, 'ACTIVE',
    'Backfilled via dd_service_readiness_v1 sweep pass 3, 2026-09-19: pricing and capability already existed across all channels, only availability plumbing was missing.'
  FROM public.dd_governed_service_offers o
  JOIN public.dd_service_readiness_v1 v ON v.canonical_sku = o.canonical_sku
  CROSS JOIN LATERAL (
    SELECT unnest(CASE o.division WHEN '04' THEN ARRAY['CH02','CH03','CH04','CH05'] WHEN '06' THEN ARRAY['CH03','CH04','CH05'] END) AS channel_code
  ) chan
  WHERE v.readiness_state = 'NO_CHANNEL_AVAILABILITY'
    AND NOT EXISTS (
      SELECT 1 FROM public.dd_service_channel_availability ca
      WHERE ca.service_id = o.runtime_service_id AND ca.channel_code = chan.channel_code
    );
  GET DIAGNOSTICS v_rows_added = ROW_COUNT;

  UPDATE public.dd_governed_service_offers o
  SET channel_availability_count = 4
  FROM public.dd_service_readiness_v1 v
  WHERE v.canonical_sku = o.canonical_sku AND v.readiness_state='NO_CHANNEL_AVAILABILITY' AND o.division='04';
  GET DIAGNOSTICS v_d04_synced = ROW_COUNT;

  UPDATE public.dd_governed_service_offers o
  SET channel_availability_count = 3
  FROM public.dd_service_readiness_v1 v
  WHERE v.canonical_sku = o.canonical_sku AND v.readiness_state='NO_CHANNEL_AVAILABILITY' AND o.division='06';
  GET DIAGNOSTICS v_d06_synced = ROW_COUNT;

  IF v_rows_added <> 113 THEN
    RAISE EXCEPTION 'Expected 113 new channel_availability rows (26x4 + 3x3), found %', v_rows_added;
  END IF;
  IF v_d04_synced <> 26 THEN
    RAISE EXCEPTION 'Expected 26 Division 04 offers synced, found %', v_d04_synced;
  END IF;
  IF v_d06_synced <> 3 THEN
    RAISE EXCEPTION 'Expected 3 Division 06 offers synced, found %', v_d06_synced;
  END IF;

  SELECT count(*) INTO v_remaining FROM public.dd_service_readiness_v1 WHERE readiness_state='NO_CHANNEL_AVAILABILITY';
  IF v_remaining <> 0 THEN
    RAISE EXCEPTION 'Expected 0 remaining NO_CHANNEL_AVAILABILITY rows, found %', v_remaining;
  END IF;

  RAISE NOTICE 'Readiness sweep pass 3 verified: all 29 remaining channel gaps closed (113 rows added), 0 NO_CHANNEL_AVAILABILITY rows remain.';
END $$;
