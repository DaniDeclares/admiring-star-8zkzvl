-- Pass 2 of the readiness-driven engine backfill. Resolves the remaining
-- non-referral UNPRICED rows using real signal found in the live data (not
-- guesses):
--
--  * Engine C exists ONLY for service_family='Logistics, Courier & Asset
--    Sourcing' (22/22 existing rows, verified) -- so Division 12's 11
--    untagged services in that same family (FIXED x6, DISPATCH x4, QUOTE x1)
--    get Engine C, no schema (matches convention: 0/22 existing Engine C
--    rows carry a schema).
--  * SOW splits by family, not randomly: 'Experiences & Resident Programming'
--    is 20/20 Engine E, 'Government & Institutional Procurement' is 20/20
--    Engine D (verified). Division 13's 5 untagged Government & Institutional
--    Procurement SOW rows get Engine D with the exact schema its other 20
--    Engine D rows already use (scope_summary/quantity/hours/condition/
--    miles_one_way/rush/materials_cost/pass_through_cost). Division 10's 3
--    untagged 'Events & Experiences' SOW rows (all real wedding-planning
--    services, same domain as the Engine-E 'Experiences & Resident
--    Programming' family) get Engine E with real per-service schemas.
--  * RECURRING is genuinely mixed by service shape, not family (Division 04
--    has both Engine A "Administrative Retainer" and Engine E "Monthly
--    Bookkeeping & Reconciliation" as RECURRING) -- but all 5 untagged
--    RECURRING rows here are fixed-fee tiered retainer packages ("Monthly HQ
--    Support - Lite/Core/Growth", "R.E.A.C.H. Monthly Buildout HQ", "Sales
--    Follow-Up Management"), the same shape as the existing Engine A
--    RECURRING examples, not variable-volume work like bookkeeping -- Engine
--    A, no schema.
--  * All other remaining untagged FIXED rows (101, spanning Divisions
--    01/03/04/05/06/07/08/09/10/11) get Engine A, matching the dominant
--    existing convention (178/199 non-Logistics FIXED rows already use A) --
--    no Logistics-family FIXED rows remain in this set (all 6 were claimed
--    by the Engine C rule above).
--
-- Explicitly EXCLUDED from this pass: the 20 DNI-02A-023..042 Division 02
-- Turnover Package services -- these were deliberately left
-- pricing_engine_code=NULL by migration 20260919114818 pending real
-- SOW-based underwriting; this pass must not silently reverse that decision.
-- Also excluded: the 11 DNI-10B..10L Division 10 vendor-referral services
-- (THIRD_PARTY_VENDOR_REFERRAL, no DANI-set price by design, per migration
-- 20260918003752) -- confirmed by starting_price IS NULL for all 11.

DO $$
DECLARE
  v_logistics_c int;
  v_d13_gov_d int;
  v_d10_events_e int;
  v_recurring_a int;
  v_fixed_a int;
  v_referral_untouched int;
  v_d02_turnover_untouched int;
  v_remaining_unpriced int;
BEGIN
  -- Division 12 Logistics -> Engine C.
  UPDATE public.services s SET pricing_engine_code='C'
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id=s.id AND o.division='12'
    AND s.service_family='Logistics, Courier & Asset Sourcing'
    AND s.pricing_engine_code IS NULL
    AND o.commercial_offer_status <> 'DO_NOT_SELL';
  GET DIAGNOSTICS v_logistics_c = ROW_COUNT;

  -- Division 13 Government SOW -> Engine D, existing shared schema.
  UPDATE public.services s SET pricing_engine_code='D',
    quote_input_schema='{"fields":[
      {"key":"scope_summary","type":"text","label":"Scope summary"},
      {"key":"quantity","type":"number","label":"Quantity / units"},
      {"key":"hours","type":"number","label":"Estimated labor hours"},
      {"key":"condition","type":"select","label":"Condition / complexity","options":["light","moderate","heavy","complex"]},
      {"key":"miles_one_way","type":"number","label":"Miles one way"},
      {"key":"rush","type":"boolean","label":"24-hour / rush"},
      {"key":"materials_cost","type":"number","label":"Known materials cost"},
      {"key":"pass_through_cost","type":"number","label":"Known pass-through cost"}
    ]}'::jsonb
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id=s.id AND o.division='13'
    AND s.service_family='Government & Institutional Procurement' AND s.pricing_type='SOW'
    AND s.pricing_engine_code IS NULL AND o.commercial_offer_status <> 'DO_NOT_SELL';
  GET DIAGNOSTICS v_d13_gov_d = ROW_COUNT;

  -- Division 10 Events & Experiences (wedding) SOW -> Engine E, real schemas.
  UPDATE public.services s SET pricing_engine_code='E',
    quote_input_schema='{"fields":[
      {"key":"guest_count","type":"number","label":"Guest count"},
      {"key":"destination","type":"text","label":"Destination / venue"},
      {"key":"planning_timeline","type":"text","label":"Planning timeline"},
      {"key":"budget_range","type":"text","label":"Budget range"}
    ]}'::jsonb
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id=s.id AND o.canonical_sku='DNI-10A-027'
    AND s.pricing_engine_code IS NULL AND s.pricing_type='SOW';

  UPDATE public.services s SET pricing_engine_code='E',
    quote_input_schema='{"fields":[
      {"key":"guest_count","type":"number","label":"Guest count"},
      {"key":"services_needed","type":"text","label":"Concierge services needed"},
      {"key":"event_dates","type":"text","label":"Event date(s)"}
    ]}'::jsonb
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id=s.id AND o.canonical_sku='DNI-10A-026'
    AND s.pricing_engine_code IS NULL AND s.pricing_type='SOW';

  UPDATE public.services s SET pricing_engine_code='E',
    quote_input_schema='{"fields":[
      {"key":"guest_count","type":"number","label":"Guest count"},
      {"key":"weekend_events_count","type":"number","label":"Number of weekend events"},
      {"key":"venues_count","type":"number","label":"Number of venues"},
      {"key":"vendor_coordination_required","type":"boolean","label":"Vendor coordination required"}
    ]}'::jsonb
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id=s.id AND o.canonical_sku='DNI-10A-028'
    AND s.pricing_engine_code IS NULL AND s.pricing_type='SOW';

  SELECT count(*) INTO v_d10_events_e FROM public.services s
  JOIN public.dd_governed_service_offers o ON o.runtime_service_id=s.id
  WHERE o.canonical_sku IN ('DNI-10A-026','DNI-10A-027','DNI-10A-028') AND s.pricing_engine_code='E';

  -- RECURRING fixed-fee retainer tiers -> Engine A.
  UPDATE public.services s SET pricing_engine_code='A'
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id=s.id
    AND o.canonical_sku IN ('DNI-04A-033','DNI-04A-034','DNI-04A-035','DNI-04A-053','DNI-08A-026')
    AND s.pricing_engine_code IS NULL AND s.pricing_type='RECURRING';
  GET DIAGNOSTICS v_recurring_a = ROW_COUNT;

  -- All other remaining untagged FIXED rows -> Engine A (dominant existing
  -- convention; Logistics-family FIXED rows already claimed above).
  UPDATE public.services s SET pricing_engine_code='A'
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id=s.id
    AND s.pricing_engine_code IS NULL AND s.pricing_type='FIXED'
    AND o.commercial_offer_status <> 'DO_NOT_SELL'
    AND NOT (o.division='02' AND o.canonical_sku ~ '^DNI-02A-0(2[3-9]|[34][0-9])$');
  GET DIAGNOSTICS v_fixed_a = ROW_COUNT;

  SELECT count(*) INTO v_referral_untouched FROM public.services s
  JOIN public.dd_governed_service_offers o ON o.runtime_service_id=s.id
  WHERE o.canonical_sku IN (
    'DNI-10B-001','DNI-10C-001','DNI-10D-001','DNI-10E-001','DNI-10F-001','DNI-10G-001',
    'DNI-10H-001','DNI-10I-001','DNI-10J-001','DNI-10K-001','DNI-10L-001'
  ) AND s.pricing_engine_code IS NULL;

  SELECT count(*) INTO v_d02_turnover_untouched FROM public.services s
  JOIN public.dd_governed_service_offers o ON o.runtime_service_id=s.id
  WHERE o.division='02' AND o.canonical_sku ~ '^DNI-02A-0(2[3-9]|[34][0-9])$' AND s.pricing_engine_code IS NULL;

  SELECT count(*) INTO v_remaining_unpriced FROM public.services s
  JOIN public.dd_governed_service_offers o ON o.runtime_service_id=s.id
  WHERE o.commercial_offer_status <> 'DO_NOT_SELL' AND s.pricing_engine_code IS NULL;

  -- Assertions (fail closed).
  IF v_logistics_c <> 11 THEN
    RAISE EXCEPTION 'Expected 11 Division 12 Logistics services backfilled to Engine C, found %', v_logistics_c;
  END IF;
  IF v_d13_gov_d <> 5 THEN
    RAISE EXCEPTION 'Expected 5 Division 13 Government SOW services backfilled to Engine D, found %', v_d13_gov_d;
  END IF;
  IF v_d10_events_e <> 3 THEN
    RAISE EXCEPTION 'Expected 3 Division 10 wedding SOW services backfilled to Engine E, found %', v_d10_events_e;
  END IF;
  IF v_recurring_a <> 5 THEN
    RAISE EXCEPTION 'Expected 5 RECURRING retainer services backfilled to Engine A, found %', v_recurring_a;
  END IF;
  IF v_fixed_a <> 101 THEN
    RAISE EXCEPTION 'Expected 101 remaining FIXED services backfilled to Engine A, found %', v_fixed_a;
  END IF;
  IF v_referral_untouched <> 11 THEN
    RAISE EXCEPTION 'Expected all 11 Division 10 referral-model services to remain untouched, found %', v_referral_untouched;
  END IF;
  IF v_d02_turnover_untouched <> 20 THEN
    RAISE EXCEPTION 'Expected all 20 Division 02 Turnover Package services to remain untouched, found %', v_d02_turnover_untouched;
  END IF;
  IF v_remaining_unpriced <> 31 THEN
    RAISE EXCEPTION 'Expected 31 rows to remain unpriced (20 D02 turnover + 11 D10 referral, all intentional), found %', v_remaining_unpriced;
  END IF;

  RAISE NOTICE 'Readiness sweep pass 2 verified: 125 services backfilled across Engine A/C/D/E using real family/shape signal, exactly 31 intentionally-unassigned services (20 gated Turnover Packages + 11 referral-model) remain untouched.';
END $$;
