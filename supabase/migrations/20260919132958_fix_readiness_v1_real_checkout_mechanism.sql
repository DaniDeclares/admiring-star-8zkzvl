-- CRITICAL CORRECTION to dd_service_readiness_v1's terminal state. Before
-- spending real Stripe writes closing the 102-row NO_STRIPE_CHECKOUT_OBJECT
-- bucket the view reported, read the actual checkout code path
-- (api/create-checkout-session.js, the only Stripe Checkout Session creator
-- in this codebase, called exclusively by src/pages/PayPage.jsx):
--
--   1. It creates a Stripe Checkout Session DYNAMICALLY at request time via
--      stripe.checkout.sessions.create() with inline price_data computed
--      from the request's frozen dd_estimates amount -- there is no
--      dependency anywhere in this path on a pre-created Stripe Product,
--      Price, or Payment Link. dd_stripe_launch_register (what the view was
--      checking) is not read by this file or by PayPage.jsx at all --
--      grep-verified across api/ and src/ -- it is a standalone audit/
--      tracking table, not a real runtime dependency.
--   2. It hard-rejects any channel other than CH01
--      (`if(channel!=='CH01') return 400 'Online checkout is currently
--      limited to Resident Concierge requests.'`) -- no other automated
--      checkout path exists in this codebase for B2B/B2B_RE/B2B_APT/B2G.
--
-- So "missing Stripe object" was never a real blocker, and creating 102 live
-- Stripe Products/Prices/Payment Links would have been pure waste (unused
-- objects cluttering the Stripe dashboard, mistaken later for real
-- readiness signals) -- exactly the kind of AI-invented-readiness mistake
-- flagged in today's architecture discussion. This migration replaces that
-- false gate with the real one: a service is LIVE_CHECKOUT_READY only if its
-- division actually routes through CH01 (division_has_ch01, already computed
-- from CHANNELS_BY_DIVISION); otherwise, once every other real contract
-- passes, it is genuinely sellable today but only through staff-mediated
-- manual invoicing, not the self-serve PayPage flow -- a real structural
-- fact about the product, not a gap to close. has_stripe_payment_link stays
-- as an informational column (real data, just no longer gates the state).
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
  -- Real checkout capability: automated self-serve checkout exists ONLY for
  -- CH01 (api/create-checkout-session.js), and never depends on any
  -- pre-created Stripe object.
  (o.division IN ('01','05','07','09','10','11','12')) AS automated_checkout_available,
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
    WHEN o.division NOT IN ('01','05','07','09','10','11','12') THEN 'LIVE_MANUAL_INVOICE_ONLY'
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
    WHEN o.division NOT IN ('01','05','07','09','10','11','12') THEN 'NO_AUTOMATED_CHECKOUT_FOR_CHANNEL_BY_DESIGN'
    ELSE 'NONE'
  END AS blocking_reason
FROM public.dd_governed_service_offers o
LEFT JOIN public.services s ON s.id = o.runtime_service_id;

GRANT SELECT ON public.dd_service_readiness_v1 TO authenticated, service_role;
