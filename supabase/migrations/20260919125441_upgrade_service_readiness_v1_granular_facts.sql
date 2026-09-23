-- Upgrades dd_service_readiness_v1 (created earlier today) from a single
-- collapsed ladder state into the full contract: each individual boolean
-- fact (catalog_ok, governance_ok, pricing_engine_ok, pricing_rule_ok,
-- channel_ok, fulfillment_ok, fully_governed_ok, stripe_ok) plus the derived
-- readiness_state AND an explicit blocking_reason. Previously, moving a
-- service backward (e.g. LIVE -> re-gated) would only be visible as "the
-- label changed" with no record of which underlying fact flipped; now every
-- fact is queryable independently, so a regression is diagnosable without
-- re-deriving it from scratch. Dropped and recreated (not CREATE OR REPLACE)
-- because Postgres refuses to insert columns before existing ones in a
-- CREATE OR REPLACE VIEW; column order changes, but every previously-present
-- column name and its values are unchanged, so no consumer reading by name
-- is affected. Still read-only; no data changes.
DROP VIEW IF EXISTS public.dd_service_readiness_v1;
CREATE VIEW public.dd_service_readiness_v1 AS
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
  (o.division IN ('01','05','07','09','10','11','12')) AS division_has_ch01,
  (s.pricing_type = ANY(ARRAY['BESPOKE_SOW','SOW','SOW_PROCUREMENT','QUOTE','STARTING_AT','CONFIGURED','VARIABLE_QUOTE']) OR s.starting_price IS NULL) AS is_quote_required,
  EXISTS(SELECT 1 FROM public.dd_stripe_launch_register r WHERE r.canonical_sku = o.canonical_sku AND r.stripe_payment_link_id IS NOT NULL) AS has_stripe_payment_link,
  (o.runtime_service_id IS NOT NULL) AS catalog_ok,
  (o.commercial_offer_status <> 'DO_NOT_SELL') AS governance_ok,
  (s.pricing_engine_code IS NOT NULL) AS pricing_engine_ok,
  (coalesce(o.pricing_rule_count,0) > 0 OR s.starting_price IS NOT NULL) AS pricing_rule_ok,
  ((o.division IN ('01','05','07','09','10','11','12') AND (coalesce(o.ch01_a_priced,false) OR coalesce(o.ch01_b_priced,false) OR coalesce(o.channel_availability_count,0)>0))
   OR (o.division NOT IN ('01','05','07','09','10','11','12') AND coalesce(o.channel_availability_count,0)>0 AND coalesce(o.priced_channel_count,0)>0)
  ) AS channel_ok,
  (coalesce(o.authorized_provider_capability_count,0) > 0) AS fulfillment_ok,
  (o.commercial_offer_status = 'SELL_NOW' AND o.fulfillment_gate_status = 'READY') AS fully_governed_ok,
  (NOT (s.pricing_type = ANY(ARRAY['BESPOKE_SOW','SOW','SOW_PROCUREMENT','QUOTE','STARTING_AT','CONFIGURED','VARIABLE_QUOTE']) OR s.starting_price IS NULL)
   AND EXISTS(SELECT 1 FROM public.dd_stripe_launch_register r WHERE r.canonical_sku = o.canonical_sku AND r.stripe_payment_link_id IS NOT NULL)
  ) AS stripe_ok,
  CASE
    WHEN o.commercial_offer_status = 'DO_NOT_SELL' THEN 'BLOCKED'
    WHEN s.pricing_engine_code IS NULL THEN 'UNPRICED'
    WHEN o.commercial_offer_status <> 'SELL_NOW' OR o.fulfillment_gate_status <> 'READY' THEN 'GATED'
    WHEN coalesce(o.authorized_provider_capability_count,0) = 0 THEN 'NO_FULFILLMENT_CAPABILITY'
    WHEN (s.pricing_type = ANY(ARRAY['BESPOKE_SOW','SOW','SOW_PROCUREMENT','QUOTE','STARTING_AT','CONFIGURED','VARIABLE_QUOTE']) OR s.starting_price IS NULL) THEN 'LIVE_QUOTE_ONLY'
    WHEN NOT (
      (o.division IN ('01','05','07','09','10','11','12') AND (coalesce(o.ch01_a_priced,false) OR coalesce(o.ch01_b_priced,false) OR coalesce(o.channel_availability_count,0)>0))
      OR
      (o.division NOT IN ('01','05','07','09','10','11','12') AND coalesce(o.channel_availability_count,0)>0 AND coalesce(o.priced_channel_count,0)>0)
    ) THEN 'NO_CHANNEL_AVAILABILITY'
    WHEN NOT EXISTS(SELECT 1 FROM public.dd_stripe_launch_register r WHERE r.canonical_sku = o.canonical_sku AND r.stripe_payment_link_id IS NOT NULL) THEN 'NO_STRIPE_CHECKOUT_OBJECT'
    ELSE 'LIVE_CHECKOUT_READY'
  END AS readiness_state,
  CASE
    WHEN o.commercial_offer_status = 'DO_NOT_SELL' THEN 'GOVERNANCE_DO_NOT_SELL'
    WHEN s.pricing_engine_code IS NULL THEN 'MISSING_PRICING_ENGINE'
    WHEN o.commercial_offer_status <> 'SELL_NOW' THEN 'COMMERCIAL_OFFER_NOT_SELL_NOW'
    WHEN o.fulfillment_gate_status <> 'READY' THEN 'FULFILLMENT_GATE_NOT_READY'
    WHEN coalesce(o.authorized_provider_capability_count,0) = 0 THEN 'MISSING_AUTHORIZED_PROVIDER_CAPABILITY'
    WHEN (s.pricing_type = ANY(ARRAY['BESPOKE_SOW','SOW','SOW_PROCUREMENT','QUOTE','STARTING_AT','CONFIGURED','VARIABLE_QUOTE']) OR s.starting_price IS NULL) THEN 'QUOTE_FIRST_BY_DESIGN'
    WHEN NOT (
      (o.division IN ('01','05','07','09','10','11','12') AND (coalesce(o.ch01_a_priced,false) OR coalesce(o.ch01_b_priced,false) OR coalesce(o.channel_availability_count,0)>0))
      OR
      (o.division NOT IN ('01','05','07','09','10','11','12') AND coalesce(o.channel_availability_count,0)>0 AND coalesce(o.priced_channel_count,0)>0)
    ) THEN 'MISSING_CHANNEL_AVAILABILITY'
    WHEN NOT EXISTS(SELECT 1 FROM public.dd_stripe_launch_register r WHERE r.canonical_sku = o.canonical_sku AND r.stripe_payment_link_id IS NOT NULL) THEN 'MISSING_STRIPE_CHECKOUT_OBJECT'
    ELSE 'NONE'
  END AS blocking_reason
FROM public.dd_governed_service_offers o
LEFT JOIN public.services s ON s.id = o.runtime_service_id;

GRANT SELECT ON public.dd_service_readiness_v1 TO authenticated, service_role;
