CREATE OR REPLACE VIEW public.dd_service_readiness_v1 AS
SELECT
  o.canonical_sku,
  o.service_name,
  o.division,
  s.service_family,
  o.commercial_offer_status,
  o.fulfillment_gate_status,
  s.pricing_engine_code,
  s.pricing_type,
  s.starting_price,
  o.channel_availability_count,
  o.priced_channel_count,
  o.authorized_provider_capability_count,
  o.pricing_rule_count,
  o.ch01_a_priced,
  o.ch01_b_priced,
  o.division = ANY (ARRAY['01','05','07','09','10','11','12']) AS division_has_ch01,
  (s.pricing_type = ANY (ARRAY['BESPOKE_SOW','SOW','SOW_PROCUREMENT','QUOTE','STARTING_AT','CONFIGURED','VARIABLE_QUOTE'])) OR s.starting_price IS NULL AS is_quote_required,
  EXISTS (SELECT 1 FROM public.dd_stripe_launch_register r WHERE r.canonical_sku=o.canonical_sku AND r.stripe_payment_link_id IS NOT NULL) AS has_stripe_payment_link,
  o.runtime_service_id IS NOT NULL AS catalog_ok,
  o.commercial_offer_status <> 'DO_NOT_SELL' AS governance_ok,
  s.pricing_engine_code IS NOT NULL AS pricing_engine_ok,
  COALESCE(o.pricing_rule_count,0) > 0 OR s.starting_price IS NOT NULL AS pricing_rule_ok,
  (((o.division = ANY (ARRAY['01','05','07','09','10','11','12'])) AND (COALESCE(o.ch01_a_priced,false) OR COALESCE(o.ch01_b_priced,false) OR COALESCE(o.channel_availability_count,0)>0)) OR ((o.division <> ALL (ARRAY['01','05','07','09','10','11','12'])) AND COALESCE(o.channel_availability_count,0)>0 AND COALESCE(o.priced_channel_count,0)>0)) AS channel_ok,
  COALESCE(o.authorized_provider_capability_count,0)>0 AS fulfillment_ok,
  o.commercial_offer_status='SELL_NOW' AND o.fulfillment_gate_status='READY' AS fully_governed_ok,
  o.division = ANY (ARRAY['01','05','07','09','10','11','12']) AS automated_checkout_available,
  CASE
    WHEN o.commercial_offer_status='DO_NOT_SELL' THEN 'BLOCKED'
    WHEN s.pricing_engine_code IS NULL THEN 'UNPRICED'
    WHEN o.commercial_offer_status <> 'SELL_NOW' OR o.fulfillment_gate_status <> 'READY' THEN 'GATED'
    WHEN NOT (COALESCE(o.authorized_provider_capability_count,0)>0 OR EXISTS (SELECT 1 FROM public.dd_master_service_universe m WHERE m.canonical_sku=o.canonical_sku AND m.lifecycle_status='CANONICAL_ACTIVE' AND lower(coalesce(m.fulfillment_lane,'')) LIKE 'dani direct%' AND NOT EXISTS (SELECT 1 FROM public.dd_service_capability_requirements r WHERE r.canonical_sku=o.canonical_sku AND r.required=true))) THEN 'NO_FULFILLMENT_CAPABILITY'
    WHEN (s.pricing_type = ANY (ARRAY['BESPOKE_SOW','SOW','SOW_PROCUREMENT','QUOTE','STARTING_AT','CONFIGURED','VARIABLE_QUOTE'])) OR s.starting_price IS NULL THEN 'LIVE_QUOTE_ONLY'
    WHEN NOT (((o.division = ANY (ARRAY['01','05','07','09','10','11','12'])) AND (COALESCE(o.ch01_a_priced,false) OR COALESCE(o.ch01_b_priced,false) OR COALESCE(o.channel_availability_count,0)>0)) OR ((o.division <> ALL (ARRAY['01','05','07','09','10','11','12'])) AND COALESCE(o.channel_availability_count,0)>0 AND COALESCE(o.priced_channel_count,0)>0)) THEN 'NO_CHANNEL_AVAILABILITY'
    WHEN o.division <> ALL (ARRAY['01','05','07','09','10','11','12']) THEN 'LIVE_MANUAL_INVOICE_ONLY'
    ELSE 'LIVE_CHECKOUT_READY'
  END AS readiness_state,
  CASE
    WHEN o.commercial_offer_status='DO_NOT_SELL' THEN 'GOVERNANCE_DO_NOT_SELL'
    WHEN s.pricing_engine_code IS NULL THEN 'MISSING_PRICING_ENGINE'
    WHEN o.commercial_offer_status <> 'SELL_NOW' THEN 'COMMERCIAL_OFFER_NOT_SELL_NOW'
    WHEN o.fulfillment_gate_status <> 'READY' THEN 'FULFILLMENT_GATE_NOT_READY'
    WHEN NOT (COALESCE(o.authorized_provider_capability_count,0)>0 OR EXISTS (SELECT 1 FROM public.dd_master_service_universe m WHERE m.canonical_sku=o.canonical_sku AND m.lifecycle_status='CANONICAL_ACTIVE' AND lower(coalesce(m.fulfillment_lane,'')) LIKE 'dani direct%' AND NOT EXISTS (SELECT 1 FROM public.dd_service_capability_requirements r WHERE r.canonical_sku=o.canonical_sku AND r.required=true))) THEN 'MISSING_AUTHORIZED_PROVIDER_CAPABILITY'
    WHEN (s.pricing_type = ANY (ARRAY['BESPOKE_SOW','SOW','SOW_PROCUREMENT','QUOTE','STARTING_AT','CONFIGURED','VARIABLE_QUOTE'])) OR s.starting_price IS NULL THEN 'QUOTE_FIRST_BY_DESIGN'
    WHEN NOT (((o.division = ANY (ARRAY['01','05','07','09','10','11','12'])) AND (COALESCE(o.ch01_a_priced,false) OR COALESCE(o.ch01_b_priced,false) OR COALESCE(o.channel_availability_count,0)>0)) OR ((o.division <> ALL (ARRAY['01','05','07','09','10','11','12'])) AND COALESCE(o.channel_availability_count,0)>0 AND COALESCE(o.priced_channel_count,0)>0)) THEN 'MISSING_CHANNEL_AVAILABILITY'
    WHEN o.division <> ALL (ARRAY['01','05','07','09','10','11','12']) THEN 'NO_AUTOMATED_CHECKOUT_FOR_CHANNEL_BY_DESIGN'
    ELSE 'NONE'
  END AS blocking_reason,
  EXISTS (SELECT 1 FROM public.dd_master_service_universe m WHERE m.canonical_sku=o.canonical_sku AND m.lifecycle_status='CANONICAL_ACTIVE' AND lower(coalesce(m.fulfillment_lane,'')) LIKE 'dani direct%' AND NOT EXISTS (SELECT 1 FROM public.dd_service_capability_requirements r WHERE r.canonical_sku=o.canonical_sku AND r.required=true)) AS owner_fulfillment_ok,
  (COALESCE(o.authorized_provider_capability_count,0)>0 OR EXISTS (SELECT 1 FROM public.dd_master_service_universe m WHERE m.canonical_sku=o.canonical_sku AND m.lifecycle_status='CANONICAL_ACTIVE' AND lower(coalesce(m.fulfillment_lane,'')) LIKE 'dani direct%' AND NOT EXISTS (SELECT 1 FROM public.dd_service_capability_requirements r WHERE r.canonical_sku=o.canonical_sku AND r.required=true))) AS effective_fulfillment_ok
FROM public.dd_governed_service_offers o
LEFT JOIN public.services s ON s.id=o.runtime_service_id;
