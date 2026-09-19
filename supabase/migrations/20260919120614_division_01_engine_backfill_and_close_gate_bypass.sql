-- Danielle's Division 01 pricing-methodology review asked two direct questions
-- ("what DB architecture holds these definitions" and "build the Engine A/E JSON
-- schemas next") plus, per the same rule established for Division 02, explicitly
-- said she would NOT copy the pasted matrix's dollar figures into DANI DECLARES --
-- they remain market hypotheses, not locked prices. This migration touches no
-- starting_price/base_price_cents value anywhere. It does two things, both
-- reconciliations against data already recorded elsewhere in this schema, not
-- new policy:
--
-- 1. CLOSES A LIVE GATE-BYPASS. DNI-01A-042 (Severe Pet Mess Cleaning) and
--    DNI-01D-017 (Yard Sale & Small-Scale Estate Sale Management) both already
--    carry services.commercial_intent_status='FULFILLMENT_GATED' -- but
--    dd_governed_service_offers had commercial_offer_status='SELL_NOW',
--    fulfillment_gate_status='READY' for both, pricing_type='FIXED' with a real
--    starting_price, and authorized_provider_capability_count>0. Division 01's
--    CHANNELS_BY_DIVISION includes B2C (CH01), and CH01 is exempt from the
--    channel_availability_count checkoutEligibility() check -- so, unlike the
--    Division 02 drift found earlier (which had no live exposure), these two
--    were ACTUALLY checkout-purchasable by an individual resident right now,
--    with no assessment/scope/safety review, despite Danielle explicitly saying
--    in this same conversation "I would keep [01A-042] gated until its
--    fulfillment and operating protocol are fully authorized" -- a statement
--    that applies identically to 01D-017 (unscoped estate-sale/asset-volume
--    work with the same "assessment -> scope classification -> safety/
--    fulfillment decision -> quote -> frozen price" need). This migration
--    reconciles both offers to INTAKE_ONLY/FULFILLMENT_GATED, matching
--    services.commercial_intent_status and the same pattern already used by
--    the other gated services elsewhere in the catalog (11 pre-existing +
--    22 in Division 02, fixed 2026-09-19 earlier today).
--
-- 2. BACKFILLS pricing_engine_code FOR THE 20 DIVISION 01 SERVICES THAT WERE
--    NEVER TAGGED. Every other Division 01 SELL_NOW/INTAKE_ONLY service already
--    carries pricing_engine_code A or E, using the mechanical rule already in
--    effect everywhere else in this table: FIXED/STARTING_AT pricing_type =
--    Engine A (fixed scope/cost-plus), VARIABLE_QUOTE = Engine E (underwritten).
--    Applying that same existing rule (not a new one) to the 20 untagged
--    SKUs: 12 FIXED-type get Engine A (no schema needed -- Engine A prices from
--    rule.base_price_cents directly per quoteBuilder2026.js's calculate(), the
--    Division 01 Engine A services already live mostly have no quote_input_schema
--    either); 8 VARIABLE_QUOTE-type get Engine E plus a real, per-service
--    quote_input_schema (matching the existing per-SKU tailored style already
--    used by DNI-01D-001/DNI-01F-001, not the generic placeholder) so the admin
--    quote builder actually asks what each of these services needs scoped.
--
-- Verified before writing: no Division 01 canonical_sku touched here has a
-- duplicate dd_governed_service_offers row (the pre-existing SELL_NOW/
-- DO_NOT_SELL duplicate-row pairs found on 16 other Division 01 SKUs during
-- this review are a separate, older data-quality item, untouched by this
-- migration, and reported separately).

DO $$
DECLARE
  v_gated_count int;
  v_engine_a_count int;
  v_engine_e_count int;
  v_engine_e_schema_count int;
  v_null_remaining int;
  v_engine_a_skus text[] := ARRAY[
    'DNI-01C-002','DNI-01C-003','DNI-01C-005','DNI-01C-006',
    'DNI-01D-008','DNI-01D-009','DNI-01D-010','DNI-01D-011','DNI-01D-013','DNI-01D-014','DNI-01D-016',
    'DNI-01F-005'
  ];
BEGIN
  -- 1. Close the live gate-bypass on the two services already flagged
  --    FULFILLMENT_GATED at the services table level.
  UPDATE public.dd_governed_service_offers
  SET commercial_offer_status='INTAKE_ONLY', fulfillment_gate_status='FULFILLMENT_GATED'
  WHERE division='01' AND canonical_sku IN ('DNI-01A-042','DNI-01D-017');

  -- 2a. Engine A backfill (FIXED pricing_type, no schema -- matches how every
  --     other Engine A Division 01 service already works).
  UPDATE public.services s
  SET pricing_engine_code='A'
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id=s.id AND o.division='01'
    AND o.canonical_sku = ANY(v_engine_a_skus)
    AND s.pricing_engine_code IS NULL AND s.pricing_type='FIXED';

  -- 2b. Engine E backfill (VARIABLE_QUOTE pricing_type) with real per-service
  --     SOW/quote schemas.
  UPDATE public.services s SET pricing_engine_code='E',
    quote_input_schema='{"fields":[
      {"key":"plant_count","type":"number","label":"Number of plants"},
      {"key":"pot_size","type":"select","label":"Pot size","options":["small","medium","large","oversized"]},
      {"key":"soil_type","type":"text","label":"Current soil / plant type"},
      {"key":"root_bound","type":"boolean","label":"Root-bound / needs larger pot"},
      {"key":"rush","type":"boolean","label":"Rush"}
    ]}'::jsonb
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id=s.id AND o.division='01' AND o.canonical_sku='DNI-01C-004'
    AND s.pricing_engine_code IS NULL AND s.pricing_type='VARIABLE_QUOTE';

  UPDATE public.services s SET pricing_engine_code='E',
    quote_input_schema='{"fields":[
      {"key":"task_type","type":"select","label":"Task type","options":["errand","pickup_dropoff","waiting_in_line","multi_stop","other"]},
      {"key":"stop_count","type":"number","label":"Number of stops"},
      {"key":"hours","type":"number","label":"Estimated hours"},
      {"key":"miles_one_way","type":"number","label":"Miles one way"},
      {"key":"rush","type":"boolean","label":"Rush"}
    ]}'::jsonb
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id=s.id AND o.division='01' AND o.canonical_sku='DNI-01D-007'
    AND s.pricing_engine_code IS NULL AND s.pricing_type='VARIABLE_QUOTE';

  UPDATE public.services s SET pricing_engine_code='E',
    quote_input_schema='{"fields":[
      {"key":"square_footage","type":"number","label":"Square footage"},
      {"key":"room_count","type":"number","label":"Room count"},
      {"key":"documentation_purpose","type":"select","label":"Purpose","options":["insurance","estate","moving","general"]},
      {"key":"photo_required","type":"boolean","label":"Photo documentation required"},
      {"key":"appraisal_needed","type":"boolean","label":"Appraisal referral needed"}
    ]}'::jsonb
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id=s.id AND o.division='01' AND o.canonical_sku='DNI-01D-012'
    AND s.pricing_engine_code IS NULL AND s.pricing_type='VARIABLE_QUOTE';

  UPDATE public.services s SET pricing_engine_code='E',
    quote_input_schema='{"fields":[
      {"key":"guest_count","type":"number","label":"Guest count"},
      {"key":"event_type","type":"text","label":"Event type"},
      {"key":"rooms_affected","type":"number","label":"Rooms affected"},
      {"key":"rental_pickup_required","type":"boolean","label":"Rental/equipment pickup required"},
      {"key":"rush","type":"boolean","label":"Rush (next-day)"}
    ]}'::jsonb
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id=s.id AND o.division='01' AND o.canonical_sku='DNI-01D-015'
    AND s.pricing_engine_code IS NULL AND s.pricing_type='VARIABLE_QUOTE';

  UPDATE public.services s SET pricing_engine_code='E',
    quote_input_schema='{"fields":[
      {"key":"box_count","type":"number","label":"Estimated box count"},
      {"key":"room_count","type":"number","label":"Room count"},
      {"key":"organization_level","type":"select","label":"Organization level","options":["basic","detailed","full_setup"]},
      {"key":"donation_removal","type":"boolean","label":"Donation/debris removal needed"},
      {"key":"hours","type":"number","label":"Estimated hours"}
    ]}'::jsonb
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id=s.id AND o.division='01' AND o.canonical_sku='DNI-01E-002'
    AND s.pricing_engine_code IS NULL AND s.pricing_type='VARIABLE_QUOTE';

  UPDATE public.services s SET pricing_engine_code='E',
    quote_input_schema='{"fields":[
      {"key":"service_type","type":"select","label":"Service type","options":["setup","removal","both"]},
      {"key":"linear_footage","type":"number","label":"Linear footage of lighting"},
      {"key":"roof_access_required","type":"boolean","label":"Roof access required"},
      {"key":"storage_requested","type":"boolean","label":"Off-season storage requested"},
      {"key":"takedown_date","type":"text","label":"Requested takedown date"}
    ]}'::jsonb
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id=s.id AND o.division='01' AND o.canonical_sku='DNI-01F-002'
    AND s.pricing_engine_code IS NULL AND s.pricing_type='VARIABLE_QUOTE';

  UPDATE public.services s SET pricing_engine_code='E',
    quote_input_schema='{"fields":[
      {"key":"season","type":"select","label":"Season","options":["fall","winter","spring","summer","holiday"]},
      {"key":"room_count","type":"number","label":"Room count"},
      {"key":"decor_provided_by","type":"select","label":"Decor provided by","options":["client","dani"]},
      {"key":"storage_requested","type":"boolean","label":"Off-season storage requested"}
    ]}'::jsonb
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id=s.id AND o.division='01' AND o.canonical_sku='DNI-01F-003'
    AND s.pricing_engine_code IS NULL AND s.pricing_type='VARIABLE_QUOTE';

  UPDATE public.services s SET pricing_engine_code='E',
    quote_input_schema='{"fields":[
      {"key":"service_type","type":"select","label":"Service type","options":["setup","takedown","both"]},
      {"key":"area_count","type":"number","label":"Number of areas/rooms"},
      {"key":"high_reach_required","type":"boolean","label":"High-reach / ladder work required"},
      {"key":"storage_requested","type":"boolean","label":"Off-season storage requested"}
    ]}'::jsonb
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id=s.id AND o.division='01' AND o.canonical_sku='DNI-01F-004'
    AND s.pricing_engine_code IS NULL AND s.pricing_type='VARIABLE_QUOTE';

  -- Assertions (fail closed).
  SELECT count(*) INTO v_gated_count FROM public.dd_governed_service_offers
  WHERE division='01' AND canonical_sku IN ('DNI-01A-042','DNI-01D-017')
    AND commercial_offer_status='INTAKE_ONLY' AND fulfillment_gate_status='FULFILLMENT_GATED';
  IF v_gated_count <> 2 THEN
    RAISE EXCEPTION 'Expected DNI-01A-042 and DNI-01D-017 gated to INTAKE_ONLY/FULFILLMENT_GATED, found %', v_gated_count;
  END IF;

  SELECT count(*) INTO v_engine_a_count
  FROM public.services s JOIN public.dd_governed_service_offers o ON o.runtime_service_id=s.id
  WHERE o.division='01' AND o.canonical_sku = ANY(v_engine_a_skus) AND s.pricing_engine_code='A';
  IF v_engine_a_count <> 12 THEN
    RAISE EXCEPTION 'Expected 12 Division 01 services backfilled to Engine A, found %', v_engine_a_count;
  END IF;

  SELECT count(*) INTO v_engine_e_count
  FROM public.services s JOIN public.dd_governed_service_offers o ON o.runtime_service_id=s.id
  WHERE o.division='01' AND o.canonical_sku IN (
    'DNI-01C-004','DNI-01D-007','DNI-01D-012','DNI-01D-015','DNI-01E-002','DNI-01F-002','DNI-01F-003','DNI-01F-004'
  ) AND s.pricing_engine_code='E';
  IF v_engine_e_count <> 8 THEN
    RAISE EXCEPTION 'Expected 8 Division 01 services backfilled to Engine E, found %', v_engine_e_count;
  END IF;

  SELECT count(*) INTO v_engine_e_schema_count
  FROM public.services s JOIN public.dd_governed_service_offers o ON o.runtime_service_id=s.id
  WHERE o.division='01' AND o.canonical_sku IN (
    'DNI-01C-004','DNI-01D-007','DNI-01D-012','DNI-01D-015','DNI-01E-002','DNI-01F-002','DNI-01F-003','DNI-01F-004'
  ) AND s.pricing_engine_code='E' AND jsonb_array_length(s.quote_input_schema->'fields') >= 4;
  IF v_engine_e_schema_count <> 8 THEN
    RAISE EXCEPTION 'Expected all 8 new Engine E services to carry a real per-SKU schema, found %', v_engine_e_schema_count;
  END IF;

  SELECT count(*) INTO v_null_remaining
  FROM public.services s JOIN public.dd_governed_service_offers o ON o.runtime_service_id=s.id
  WHERE o.division='01' AND o.commercial_offer_status IN ('SELL_NOW','INTAKE_ONLY') AND s.pricing_engine_code IS NULL;
  IF v_null_remaining <> 2 THEN
    RAISE EXCEPTION 'Expected exactly 2 remaining NULL-engine Division 01 offers (the 2 just gated), found %', v_null_remaining;
  END IF;

  RAISE NOTICE 'Division 01 reconciliation verified: gate-bypass closed on 2 services, 12 backfilled to Engine A, 8 backfilled to Engine E with real schemas, 0 unexplained NULL-engine services remain among sellable offers.';
END $$;
