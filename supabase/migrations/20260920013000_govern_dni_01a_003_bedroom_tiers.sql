-- Govern DNI-01A-003 as a deterministic bedroom-tier quote.
-- Source basis: current DANI service master artifact dated 2026-09-19/20.
-- Runtime remains governed by dd_service_pricing_rules; the quote schema supplies
-- the approved tier selection and review/routing fields. No provider payout data
-- participates in customer pricing.

DO $$
DECLARE
  v_service_id uuid;
BEGIN
  SELECT id INTO v_service_id
  FROM public.services
  WHERE sku = 'DNI-01A-003';

  IF v_service_id IS NULL THEN
    RAISE EXCEPTION 'DNI-01A-003 not found';
  END IF;

  UPDATE public.services
  SET
    starting_price = 330.00,
    base_price_cents = 33000,
    pricing_type = 'FIXED',
    pricing_engine_code = 'A',
    public_price_low = 330.00,
    public_price_high = 605.00,
    public_price_display = '1BR $330; 2BR $380; 3BR $480; 4BR $605. Severe pet mess/heavy soil +$150 before resident discount.',
    price_note = 'Bedroom-tier pricing: 1BR $330 regular / $280.50 resident; 2BR $380 / $323; 3BR $480 / $408; 4BR $605 / $514.25. Severe pet mess/heavy soil +$150 before resident discount. Specialized carpet extraction and abandoned property/furniture are separate scope tracks.',
    quote_engine_version = '2026-09-20-bedroom-tier-v1',
    quote_input_schema = jsonb_build_object(
      'version','2026-09-20-bedroom-tier-v1',
      'ui_mode','SPECIALIZED_CLEANING',
      'pricing_model','BEDROOM_TIER',
      'fields', jsonb_build_array(
        jsonb_build_object('key','bedroom_count','type','select','label','Bedroom count','options',jsonb_build_array('1','2','3','4'),'classification','PRICING','required',true),
        jsonb_build_object('key','bathroom_count','type','select','label','Bathroom count','options',jsonb_build_array('1','2','3','4+'),'classification','SCOPE'),
        jsonb_build_object('key','layout_type','type','select','label','Layout environment','options',jsonb_build_array('apartment','townhome','single_family_home','commercial_unit'),'classification','SCOPE'),
        jsonb_build_object('key','occupancy','type','select','label','Occupancy','options',jsonb_build_array('vacant','occupied'),'classification','SCOPE'),
        jsonb_build_object('key','mess_degree','type','select','label','Degree of mess','options',jsonb_build_array('standard','moderate','heavy','severe'),'classification','UNDERWRITING'),
        jsonb_build_object('key','odor_level','type','select','label','Odor level','options',jsonb_build_array('none','light','heavy','severe'),'classification','UNDERWRITING'),
        jsonb_build_object('key','severe_pet_mess','type','boolean','label','Severe pet mess / heavy soil (+$150)','classification','PRICING_MODIFIER'),
        jsonb_build_object('key','severe_odor_smoke','type','boolean','label','Severe odor / smoke neutralization required','classification','UNDERWRITING'),
        jsonb_build_object('key','specialized_carpet_extraction','type','boolean','label','Specialized carpet extraction required','classification','ROUTING'),
        jsonb_build_object('key','abandoned_property_or_furniture','type','boolean','label','Abandoned property / furniture removal required','classification','ROUTING'),
        jsonb_build_object('key','scope_summary','type','text','label','Scope summary','classification','SCOPE')
      ),
      'tiers', jsonb_build_array(
        jsonb_build_object('value','1','label','1 bedroom','price',330),
        jsonb_build_object('value','2','label','2 bedrooms','price',380),
        jsonb_build_object('value','3','label','3 bedrooms','price',480),
        jsonb_build_object('value','4','label','4 bedrooms','price',605)
      ),
      'modifiers', jsonb_build_array(
        jsonb_build_object('key','severe_pet_mess','label','Severe pet mess / heavy soil','amount',150,'apply_before_resident_discount',true)
      ),
      'commercial_inputs', jsonb_build_array(
        jsonb_build_object('key','miles_one_way','type','number','label','Miles one way','classification','COMMERCIAL'),
        jsonb_build_object('key','apply_standard_travel','type','boolean','label','Standard travel rule','classification','COMMERCIAL'),
        jsonb_build_object('key','rush','type','boolean','label','24-hour / rush (+25%)','classification','COMMERCIAL'),
        jsonb_build_object('key','materials_cost','type','number','label','Materials cost','classification','COMMERCIAL'),
        jsonb_build_object('key','pass_through_cost','type','number','label','Pass-through cost','classification','COMMERCIAL'),
        jsonb_build_object('key','tax_rate_percent','type','number','label','Tax rate %','classification','COMMERCIAL'),
        jsonb_build_object('key','deposit_percent','type','number','label','Deposit %','classification','COMMERCIAL')
      ),
      'companion_lines', jsonb_build_array(
        jsonb_build_object('sku','DNI-01A-036','label','Specialized Carpet Fiber Extraction Add-on','component_role','COMPANION'),
        jsonb_build_object('sku','DNI-01A-041','label','Abandoned Property & Furniture / Debris Support','component_role','COMPANION'),
        jsonb_build_object('sku','DNI-01A-020','label','Interior Appliance Deep-Detail Add-on','component_role','COMPANION'),
        jsonb_build_object('sku','DNI-01A-025','label','High-Reach Dust & Cobweb Detail Add-on','component_role','COMPANION')
      ),
      'routing_flags', jsonb_build_array(
        jsonb_build_object('key','specialized_carpet_extraction','resolution','SPECIALTY_CARPET_SCOPE','target_sku','DNI-01A-036'),
        jsonb_build_object('key','abandoned_property_or_furniture','resolution','DEBRIS_FURNITURE_SCOPE','target_sku','DNI-01A-041')
      )
    )
  WHERE id = v_service_id;

  UPDATE public.dd_service_pricing_rules
  SET base_price_cents = 33000,
      pricing_type = 'FIXED',
      billing_cycle = 'ONETIME',
      lock_status = 'LOCKED',
      status = 'ACTIVE'
  WHERE service_id = v_service_id
    AND status = 'ACTIVE';

  IF (SELECT count(*) FROM public.dd_service_pricing_rules
      WHERE service_id = v_service_id AND status = 'ACTIVE') <> 5 THEN
    RAISE EXCEPTION 'Expected five active channel pricing rules for DNI-01A-003';
  END IF;
END $$;
