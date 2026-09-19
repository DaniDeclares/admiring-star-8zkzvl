-- First pass of executing against dd_service_readiness_v1 (created moments ago),
-- in priority order: cheapest, least-ambiguous gaps first.
--
-- 1. NO_CHANNEL_AVAILABILITY (4 services): DNI-02A-013/014 (Photo Documentation,
--    Property Inspection) and DNI-06A-016/017 (Computer Setup, Workstation
--    Deployment) already have real pricing rules across all 5 channels
--    (priced_channel_count=5, verified) and real authorized capability -- the
--    exact same "pricing/capability real, plumbing missing" pattern already
--    fixed for Division 04A/Notary/Division 02. Adds the missing
--    dd_service_channel_availability rows for the channels each division
--    actually supports (Division 02: CH02/03/04/05 = 4 channels x 2 services
--    = 8 rows; Division 06: CH03/04/05 = 3 channels x 2 services = 6 rows;
--    14 rows total -- neither division includes CH01/B2C per
--    CHANNELS_BY_DIVISION) and syncs the denormalized channel_availability_count
--    (not auto-triggered, per the established pattern from this session).
--
-- 2. UNPRICED engine backfill, mechanical subset only (100% existing
--    precedent, no invented mapping): STARTING_AT -> Engine A (13/13 existing
--    STARTING_AT rows already use A), VARIABLE_QUOTE -> Engine E (16/16
--    existing VARIABLE_QUOTE rows already use E) with a real per-service
--    schema. Applied to: DNI-02A-021/022, DNI-05A-008/016 (STARTING_AT, Engine
--    A, no schema needed) and DNI-03A-023, DNI-10A-034/035/036/037
--    (VARIABLE_QUOTE, Engine E, real schemas).
--
-- Explicitly NOT touched, and why: the other 11 Division 10 VARIABLE_QUOTE
-- services (DNI-10B-001 through DNI-10L-001) are intentionally
-- commercial_ownership='THIRD_PARTY_VENDOR_REFERRAL' per migration
-- 20260918003752 -- "no DANI-set price... not checkout-eligible by design,
-- not just pending authorization." Engine E implies DANI produces a frozen
-- quote, which contradicts that referral model, so pricing_engine_code stays
-- NULL for these on purpose; dd_service_readiness_v1's UNPRICED bucket has no
-- separate state for the referral model yet, a known gap in the view itself,
-- not in these services. The remaining 127 FIXED / 25 SOW / 5 RECURRING /
-- 4 DISPATCH / 1 QUOTE unpriced rows are NOT touched here either: FIXED alone
-- already maps to two different engines in this table (178 rows to A, 21 to
-- C) and SOW splits evenly between D and E (20/20) with no reliable signal in
-- this migration to disambiguate which is correct per service -- that needs
-- either more research into what Engine C covers or Danielle's input, not a
-- guessed mapping.
--
-- Also NOT touched: NO_FULFILLMENT_CAPABILITY (210 rows) and
-- NO_STRIPE_CHECKOUT_OBJECT (29 rows) -- both require decisions only Danielle
-- can make (who is actually authorized to fulfill each service; which real,
-- confirmed prices should become live Stripe payment links), not database
-- plumbing.

DO $$
DECLARE
  v_channel_rows_added int;
  v_div02_offers_synced int;
  v_div06_offers_synced int;
  v_a_backfill int;
  v_e_backfill int;
  v_e_schema_count int;
  v_referral_untouched int;
BEGIN
  -- 1a. Channel availability rows.
  INSERT INTO public.dd_service_channel_availability (service_id, channel_code, eligibility_status, notes)
  SELECT o.runtime_service_id, chan.channel_code, 'ACTIVE',
    'Backfilled via dd_service_readiness_v1 sweep 2026-09-19: pricing and capability already existed across all channels, only availability plumbing was missing.'
  FROM public.dd_governed_service_offers o
  CROSS JOIN LATERAL (
    SELECT unnest(CASE o.division WHEN '02' THEN ARRAY['CH02','CH03','CH04','CH05'] WHEN '06' THEN ARRAY['CH03','CH04','CH05'] END) AS channel_code
  ) chan
  WHERE o.canonical_sku IN ('DNI-02A-013','DNI-02A-014','DNI-06A-016','DNI-06A-017')
    AND NOT EXISTS (
      SELECT 1 FROM public.dd_service_channel_availability ca
      WHERE ca.service_id = o.runtime_service_id AND ca.channel_code = chan.channel_code
    );
  GET DIAGNOSTICS v_channel_rows_added = ROW_COUNT;

  UPDATE public.dd_governed_service_offers
  SET channel_availability_count = 4
  WHERE canonical_sku IN ('DNI-02A-013','DNI-02A-014');
  GET DIAGNOSTICS v_div02_offers_synced = ROW_COUNT;

  UPDATE public.dd_governed_service_offers
  SET channel_availability_count = 3
  WHERE canonical_sku IN ('DNI-06A-016','DNI-06A-017');
  GET DIAGNOSTICS v_div06_offers_synced = ROW_COUNT;

  -- 2a. Engine A backfill (STARTING_AT, no schema).
  UPDATE public.services s
  SET pricing_engine_code='A'
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id=s.id
    AND o.canonical_sku IN ('DNI-02A-021','DNI-02A-022','DNI-05A-008','DNI-05A-016')
    AND s.pricing_engine_code IS NULL AND s.pricing_type='STARTING_AT';
  GET DIAGNOSTICS v_a_backfill = ROW_COUNT;

  -- 2b. Engine E backfill (VARIABLE_QUOTE) with real per-service schemas.
  UPDATE public.services s SET pricing_engine_code='E',
    quote_input_schema='{"fields":[
      {"key":"client_type","type":"select","label":"Client type","options":["buyer","seller","investor"]},
      {"key":"task_type","type":"text","label":"Task type"},
      {"key":"hours","type":"number","label":"Estimated hours"},
      {"key":"rush","type":"boolean","label":"Rush"}
    ]}'::jsonb
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id=s.id AND o.canonical_sku='DNI-03A-023'
    AND s.pricing_engine_code IS NULL AND s.pricing_type='VARIABLE_QUOTE';

  UPDATE public.services s SET pricing_engine_code='E',
    quote_input_schema='{"fields":[
      {"key":"event_type","type":"text","label":"Event type"},
      {"key":"guest_count","type":"number","label":"Guest count"},
      {"key":"destination","type":"text","label":"Destination"},
      {"key":"budget_range","type":"text","label":"Budget range"},
      {"key":"planning_timeline","type":"text","label":"Planning timeline"}
    ]}'::jsonb
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id=s.id AND o.canonical_sku='DNI-10A-034'
    AND s.pricing_engine_code IS NULL AND s.pricing_type='VARIABLE_QUOTE';

  UPDATE public.services s SET pricing_engine_code='E',
    quote_input_schema='{"fields":[
      {"key":"guest_count","type":"number","label":"Guest count"},
      {"key":"destination","type":"text","label":"Destination"},
      {"key":"lodging_nights","type":"number","label":"Lodging nights"},
      {"key":"travel_type","type":"select","label":"Travel type","options":["flights","ground","both"]}
    ]}'::jsonb
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id=s.id AND o.canonical_sku='DNI-10A-035'
    AND s.pricing_engine_code IS NULL AND s.pricing_type='VARIABLE_QUOTE';

  UPDATE public.services s SET pricing_engine_code='E',
    quote_input_schema='{"fields":[
      {"key":"vendor_count","type":"number","label":"Vendor count"},
      {"key":"total_budget","type":"number","label":"Total budget"},
      {"key":"disbursement_schedule","type":"text","label":"Disbursement schedule"},
      {"key":"reconciliation_required","type":"boolean","label":"Reconciliation report required"}
    ]}'::jsonb
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id=s.id AND o.canonical_sku='DNI-10A-036'
    AND s.pricing_engine_code IS NULL AND s.pricing_type='VARIABLE_QUOTE';

  UPDATE public.services s SET pricing_engine_code='E',
    quote_input_schema='{"fields":[
      {"key":"event_type","type":"text","label":"Event type"},
      {"key":"municipality","type":"text","label":"Municipality / venue jurisdiction"},
      {"key":"permit_types_needed","type":"text","label":"Permit types needed"},
      {"key":"insurance_required","type":"boolean","label":"Event insurance required"}
    ]}'::jsonb
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id=s.id AND o.canonical_sku='DNI-10A-037'
    AND s.pricing_engine_code IS NULL AND s.pricing_type='VARIABLE_QUOTE';

  SELECT count(*) INTO v_e_backfill FROM public.services s
  JOIN public.dd_governed_service_offers o ON o.runtime_service_id=s.id
  WHERE o.canonical_sku IN ('DNI-03A-023','DNI-10A-034','DNI-10A-035','DNI-10A-036','DNI-10A-037')
    AND s.pricing_engine_code='E';

  SELECT count(*) INTO v_e_schema_count FROM public.services s
  JOIN public.dd_governed_service_offers o ON o.runtime_service_id=s.id
  WHERE o.canonical_sku IN ('DNI-03A-023','DNI-10A-034','DNI-10A-035','DNI-10A-036','DNI-10A-037')
    AND jsonb_array_length(s.quote_input_schema->'fields') >= 4;

  SELECT count(*) INTO v_referral_untouched FROM public.services s
  JOIN public.dd_governed_service_offers o ON o.runtime_service_id=s.id
  WHERE o.canonical_sku IN (
    'DNI-10B-001','DNI-10C-001','DNI-10D-001','DNI-10E-001','DNI-10F-001','DNI-10G-001',
    'DNI-10H-001','DNI-10I-001','DNI-10J-001','DNI-10K-001','DNI-10L-001'
  ) AND s.pricing_engine_code IS NULL;

  -- Assertions (fail closed).
  IF v_channel_rows_added <> 14 THEN
    RAISE EXCEPTION 'Expected 14 new channel_availability rows (2x4 + 2x3), found %', v_channel_rows_added;
  END IF;
  IF v_div02_offers_synced <> 2 OR v_div06_offers_synced <> 2 THEN
    RAISE EXCEPTION 'Expected 2 Division 02 + 2 Division 06 offers synced, found % / %', v_div02_offers_synced, v_div06_offers_synced;
  END IF;
  IF v_a_backfill <> 4 THEN
    RAISE EXCEPTION 'Expected 4 STARTING_AT services backfilled to Engine A, found %', v_a_backfill;
  END IF;
  IF v_e_backfill <> 5 THEN
    RAISE EXCEPTION 'Expected 5 VARIABLE_QUOTE services backfilled to Engine E, found %', v_e_backfill;
  END IF;
  IF v_e_schema_count <> 5 THEN
    RAISE EXCEPTION 'Expected all 5 new Engine E services to carry a real schema, found %', v_e_schema_count;
  END IF;
  IF v_referral_untouched <> 11 THEN
    RAISE EXCEPTION 'Expected all 11 Division 10 referral-model services to remain untouched (NULL engine), found %', v_referral_untouched;
  END IF;

  RAISE NOTICE 'Readiness sweep pass 1 verified: 4 services'' channel gaps closed (14 rows), 9 services backfilled to Engine A/E with real schemas, 11 referral-model services correctly left untouched.';
END $$;
