BEGIN;
CREATE TEMP TABLE tmp_owner_fulfillment_gap ON COMMIT DROP AS
SELECT o.canonical_sku,o.runtime_service_id AS service_id,m.division,
       (m.division IN ('01','05','07','09','10','11','12')) AS has_ch01
FROM public.dd_governed_service_offers o
JOIN public.dd_master_service_universe m ON m.id=o.master_record_id
WHERE coalesce(o.authorized_provider_capability_count,0)=0
  AND o.commercial_offer_status='SELL_NOW'
  AND o.fulfillment_gate_status='READY'
  AND m.division<>'13'
  AND o.canonical_sku NOT IN ('DNI-02A-008','DNI-06A-019')
  AND NOT (m.division='12' AND coalesce(m.provider_qualifications,'') ILIKE '%drivers/carriers%');

DO $$ DECLARE v_count int; BEGIN
 SELECT count(*) INTO v_count FROM tmp_owner_fulfillment_gap;
 IF v_count<>217 THEN RAISE EXCEPTION 'Owner fulfillment candidate drift: expected 217, found %',v_count; END IF;
END $$;

INSERT INTO public.dd_provider_capabilities
 (provider_org_id,provider_id,service_id,service_line,capability_key,is_authorized,tier_availability)
SELECT '19c10267-898f-4c10-a25e-186f6aff8771',
       'acba894f-a8c7-4156-b981-fa08acc9e65b',
       g.service_id,g.canonical_sku,'OWNER_DIRECT_FULFILLMENT',true,'{}'::jsonb
FROM tmp_owner_fulfillment_gap g
ON CONFLICT (provider_id,service_line) DO NOTHING;

INSERT INTO public.dd_service_channel_availability
 (service_id,channel_code,eligibility_status,notes)
SELECT g.service_id,c.channel_code,'ACTIVE',
       'Owner-default fulfillment backfill 2026-09-19: Danielle is the default fulfillment resource; channel row added only for the channels governed for this division.'
FROM tmp_owner_fulfillment_gap g
JOIN LATERAL (
 SELECT unnest(CASE g.division
   WHEN '02' THEN ARRAY['CH02','CH03','CH04','CH05']
   WHEN '03' THEN ARRAY['CH02','CH03','CH04']
   WHEN '04' THEN ARRAY['CH02','CH03','CH04','CH05']
   WHEN '06' THEN ARRAY['CH03','CH04','CH05']
   WHEN '08' THEN ARRAY['CH03','CH04','CH05']
   ELSE ARRAY[]::text[] END) AS channel_code
) c ON true
WHERE NOT g.has_ch01
ON CONFLICT (service_id,channel_code) DO NOTHING;

UPDATE public.dd_governed_service_offers o
SET authorized_provider_capability_count=1,
    channel_availability_count=CASE g.division
      WHEN '02' THEN 4 WHEN '03' THEN 3 WHEN '04' THEN 4
      WHEN '06' THEN 3 WHEN '08' THEN 3
      ELSE o.channel_availability_count END
FROM tmp_owner_fulfillment_gap g
WHERE o.canonical_sku=g.canonical_sku;

DO $$ DECLARE
 v_caps int; v_channels int; v_blocked int; v_quote int;
BEGIN
 SELECT count(*) INTO v_caps
 FROM public.dd_provider_capabilities
 WHERE provider_id='acba894f-a8c7-4156-b981-fa08acc9e65b'
   AND capability_key='OWNER_DIRECT_FULFILLMENT'
   AND is_authorized=true
   AND service_id IN (SELECT service_id FROM tmp_owner_fulfillment_gap);
 IF v_caps<>217 THEN RAISE EXCEPTION 'Owner capability assertion failed: %/217',v_caps; END IF;

 SELECT count(*) INTO v_channels
 FROM public.dd_service_channel_availability
 WHERE service_id IN (SELECT service_id FROM tmp_owner_fulfillment_gap)
   AND eligibility_status='ACTIVE'
   AND channel_code IN ('CH02','CH03','CH04','CH05')
   AND notes LIKE 'Owner-default fulfillment backfill 2026-09-19:%';
 IF v_channels<>276 THEN RAISE EXCEPTION 'Channel backfill assertion failed: %/276',v_channels; END IF;

 SELECT count(*) INTO v_blocked
 FROM public.dd_service_readiness_v1
 WHERE canonical_sku IN (SELECT canonical_sku FROM tmp_owner_fulfillment_gap)
   AND readiness_state='NO_FULFILLMENT_CAPABILITY';
 IF v_blocked<>0 THEN RAISE EXCEPTION 'Fulfillment readiness assertion failed: % remain blocked by provider capability',v_blocked; END IF;

 SELECT count(*) INTO v_quote
 FROM public.dd_service_readiness_v1
 WHERE canonical_sku IN (SELECT canonical_sku FROM tmp_owner_fulfillment_gap)
   AND readiness_state='LIVE_QUOTE_ONLY';
 IF v_quote<>47 THEN RAISE EXCEPTION 'Quote-only assertion failed: expected 47, found %',v_quote; END IF;
END $$;
COMMIT;
