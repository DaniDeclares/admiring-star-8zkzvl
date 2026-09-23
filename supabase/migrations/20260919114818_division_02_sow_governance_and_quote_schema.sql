-- Danielle's Division 02 pricing-architecture review asked for two work products:
-- (1) a Division 02 SOW Scoping Questionnaire -- the real input contract Engine D
-- quotes are built from, which already exists in this schema as
-- services.quote_input_schema.fields (consumed by quoteBuilder2026.js's
-- getQuoteCatalog()/calculate()) -- and (2) a governance migration that encodes
-- the correct Engine/gate state for Division 02 without creating any Stripe
-- objects or inventing channel/provider data.
--
-- Verified before writing this: Division 02 has exactly 42 real canonical SKUs
-- (DNI-02A-001 through DNI-02A-042, no gaps). The prior discussion's "40 vs 42"
-- concern traced to the pasted engine-assignment table only enumerating 001-020
-- and 023-042 (40 SKUs) and silently skipping 021-022 (Resident Move
-- Coordination, Multi-Unit Turnover Management) -- nothing is invented here to
-- reach 42, those two were already-real rows the pasted table omitted.
--
-- SKUs 021-042 (22 total) were all commercial_offer_status='SELL_NOW',
-- fulfillment_gate_status='READY', pricing_engine_code=NULL -- meaning they
-- display live, advertised FIXED starting prices on the public catalog with no
-- engine/underwriting behind them. This already contradicted
-- services.commercial_intent_status, which was already 'FULFILLMENT_GATED' for
-- all 22 -- a real drift between the two tables, the same class of bug fixed
-- earlier for Division 04A/Notary (there the offers table under-reported
-- readiness; here it over-reported it). None of the 22 have real checkout
-- reachability today regardless -- channel_availability_count=0 for all of
-- them, and Division 02's CHANNELS_BY_DIVISION entry (B2B_APT/B2B_RE/B2B/B2G)
-- never maps to CH01, so the CH01 checkout-exemption never applies -- so this
-- is a paperwork/governance correction, not a revenue-affecting change. No
-- dd_stripe_launch_register rows exist for any DNI-02A-* SKU, so no Stripe
-- objects are touched or need to be.
--
-- This migration:
--   1. Reconciles dd_governed_service_offers for 02A-021..042 to
--      commercial_offer_status='INTAKE_ONLY', fulfillment_gate_status=
--      'FULFILLMENT_GATED' -- matching services.commercial_intent_status and
--      the same INTAKE_ONLY/FULFILLMENT_GATED pattern already used by the 11
--      other gated services elsewhere in the catalog. Customers can still
--      submit an intake request (governedCatalog() still includes
--      INTAKE_ONLY); checkout stays unavailable until a real Engine assignment
--      and channel authorization exist.
--   2. Replaces the generic cross-division 8-field quote_input_schema on the 14
--      Division 02 services already assigned pricing_engine_code='D' with a
--      Division-02-specific SOW scoping schema (property/portfolio, turnover
--      scope, inspection/documentation, field-operations fields) so Engine D
--      quotes for this division collect what staff actually need instead of
--      the generic placeholder.
--   3. Touches nothing else: pricing_engine_code is not changed for any SKU
--      (Engine B's lone service, DNI-02A-004, and Engine A's five services are
--      left exactly as verified -- Engine B is explicitly a separate "Hold &
--      Adjust" design decision, not part of this cleanup); no
--      channel_availability or provider_capability rows are created; no
--      Stripe product/price/payment-link is created.

DO $$
DECLARE
  v_gated_count int;
  v_gated_engine_not_null int;
  v_d_count int;
  v_d_schema_count int;
  v_a_untouched int;
  v_b_untouched int;
  v_target_skus text[] := ARRAY[
    'DNI-02A-021','DNI-02A-022','DNI-02A-023','DNI-02A-024','DNI-02A-025','DNI-02A-026',
    'DNI-02A-027','DNI-02A-028','DNI-02A-029','DNI-02A-030','DNI-02A-031','DNI-02A-032',
    'DNI-02A-033','DNI-02A-034','DNI-02A-035','DNI-02A-036','DNI-02A-037','DNI-02A-038',
    'DNI-02A-039','DNI-02A-040','DNI-02A-041','DNI-02A-042'
  ];
BEGIN
  UPDATE public.dd_governed_service_offers
  SET commercial_offer_status='INTAKE_ONLY', fulfillment_gate_status='FULFILLMENT_GATED'
  WHERE division='02' AND canonical_sku = ANY(v_target_skus);

  UPDATE public.services s
  SET quote_input_schema = '{"fields":[
    {"key":"client_name","type":"text","label":"Client / management company"},
    {"key":"property_name","type":"text","label":"Property name"},
    {"key":"property_address","type":"text","label":"Property address"},
    {"key":"unit_count","type":"number","label":"Number of units"},
    {"key":"access_notes","type":"text","label":"Access / contact instructions"},
    {"key":"requested_window","type":"text","label":"Requested service date/window"},
    {"key":"recurring","type":"boolean","label":"Recurring service"},
    {"key":"unit_numbers","type":"text","label":"Unit number(s)"},
    {"key":"unit_type","type":"text","label":"Unit type (studio/1BR/2BR/3BR/other)"},
    {"key":"square_footage","type":"number","label":"Square footage"},
    {"key":"current_condition","type":"text","label":"Current condition"},
    {"key":"punch_list_items","type":"text","label":"Punch-list / required repairs"},
    {"key":"completion_deadline","type":"text","label":"Required completion deadline"},
    {"key":"inspection_type","type":"text","label":"Inspection type"},
    {"key":"checklist_required","type":"boolean","label":"Checklist required"},
    {"key":"photo_documentation_required","type":"boolean","label":"Photo documentation required"},
    {"key":"report_format","type":"text","label":"Report format"},
    {"key":"stop_count","type":"number","label":"Number of field stops"},
    {"key":"mileage_zone","type":"text","label":"Mileage / zone"},
    {"key":"after_hours","type":"boolean","label":"After-hours requirement"},
    {"key":"sla","type":"text","label":"SLA / turnaround requirement"}
  ]}'::jsonb
  FROM public.dd_governed_service_offers o
  WHERE o.runtime_service_id = s.id AND o.division='02' AND s.pricing_engine_code='D';

  SELECT count(*) INTO v_gated_count
  FROM public.dd_governed_service_offers
  WHERE division='02' AND canonical_sku = ANY(v_target_skus)
    AND commercial_offer_status='INTAKE_ONLY' AND fulfillment_gate_status='FULFILLMENT_GATED';
  IF v_gated_count <> 22 THEN
    RAISE EXCEPTION 'Expected 22 Division 02 offers (02A-021..042) gated to INTAKE_ONLY/FULFILLMENT_GATED, found %', v_gated_count;
  END IF;

  SELECT count(*) INTO v_gated_engine_not_null
  FROM public.services s JOIN public.dd_governed_service_offers o ON o.runtime_service_id=s.id
  WHERE o.division='02' AND o.canonical_sku = ANY(v_target_skus) AND s.pricing_engine_code IS NOT NULL;
  IF v_gated_engine_not_null <> 0 THEN
    RAISE EXCEPTION 'Expected 02A-021..042 to remain pricing_engine_code IS NULL, found % with a value', v_gated_engine_not_null;
  END IF;

  SELECT count(*) INTO v_d_count
  FROM public.services s JOIN public.dd_governed_service_offers o ON o.runtime_service_id=s.id
  WHERE o.division='02' AND s.pricing_engine_code='D';
  IF v_d_count <> 14 THEN
    RAISE EXCEPTION 'Expected 14 Division 02 Engine D services (unchanged), found %', v_d_count;
  END IF;

  SELECT count(*) INTO v_d_schema_count
  FROM public.services s JOIN public.dd_governed_service_offers o ON o.runtime_service_id=s.id
  WHERE o.division='02' AND s.pricing_engine_code='D'
    AND s.quote_input_schema->'fields' @> '[{"key":"property_address"}]'::jsonb
    AND s.quote_input_schema->'fields' @> '[{"key":"sla"}]'::jsonb;
  IF v_d_schema_count <> 14 THEN
    RAISE EXCEPTION 'Expected all 14 Division 02 Engine D services to carry the new SOW schema, found %', v_d_schema_count;
  END IF;

  SELECT count(*) INTO v_a_untouched
  FROM public.services s JOIN public.dd_governed_service_offers o ON o.runtime_service_id=s.id
  WHERE o.division='02' AND s.pricing_engine_code='A';
  IF v_a_untouched <> 5 THEN
    RAISE EXCEPTION 'Expected 5 Division 02 Engine A services (untouched), found %', v_a_untouched;
  END IF;

  SELECT count(*) INTO v_b_untouched
  FROM public.services s JOIN public.dd_governed_service_offers o ON o.runtime_service_id=s.id
  WHERE o.division='02' AND s.pricing_engine_code='B';
  IF v_b_untouched <> 1 THEN
    RAISE EXCEPTION 'Expected 1 Division 02 Engine B service (untouched, separate Hold & Adjust design decision), found %', v_b_untouched;
  END IF;

  RAISE NOTICE 'Division 02 governance reconciliation verified: 22 unassigned offers gated to INTAKE_ONLY/FULFILLMENT_GATED, 14 Engine D services carry the new SOW schema, Engine A (5) and Engine B (1) untouched.';
END $$;
