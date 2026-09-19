-- Read-only diagnostic view. Encodes the "commercial readiness contract" from
-- today's architecture discussion: a service isn't LIVE just because one
-- layer (e.g. Stripe, or dd_governed_service_offers.commercial_offer_status)
-- says so. This is exactly the class of gap manually found and fixed one
-- division at a time today (04A, Notary, Division 02, Division 01
-- 01A-042/01D-017) -- this view makes every one of those checks queryable at
-- once, across the whole catalog, instead of requiring a fresh manual SQL
-- pass per division. It creates or changes nothing else; it is a VIEW, not a
-- migration of data.
--
-- readiness_state ladder (first matching condition wins):
--   BLOCKED                  -- commercial_offer_status = DO_NOT_SELL
--   UNPRICED                 -- pricing_engine_code never assigned
--   GATED                    -- INTAKE_ONLY / not fulfillment READY (may be
--                                intentional, e.g. compliance-pulled services)
--   NO_FULFILLMENT_CAPABILITY -- authorized_provider_capability_count = 0;
--                                blocks ALL channels including CH01, per
--                                checkoutEligibility() in
--                                governedCommercialGate2026.js
--   LIVE_QUOTE_ONLY           -- pricing_type is quote-required
--                                (BESPOKE_SOW/SOW/SOW_PROCUREMENT/QUOTE/
--                                STARTING_AT/CONFIGURED/VARIABLE_QUOTE, or no
--                                starting_price) -- this is a legitimate live
--                                state (intake + frozen quote), not a gap
--   NO_CHANNEL_AVAILABILITY  -- no reachable channel: for divisions whose
--                                CHANNELS_BY_DIVISION (api/verify-commercial-
--                                intent.js) includes B2C/CH01, that channel is
--                                exempt from the channel_availability_count
--                                check (mirrored below via division_has_ch01 --
--                                MUST be kept in sync with that file if
--                                CHANNELS_BY_DIVISION ever changes); all other
--                                divisions need a real channel_availability +
--                                priced_channel row
--   NO_STRIPE_CHECKOUT_OBJECT -- fixed-price, channel-ready, but no
--                                dd_stripe_launch_register payment link exists
--   LIVE_CHECKOUT_READY       -- passes every check; real automated checkout
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
  (o.division IN ('01','05','07','09','10','11','12')) AS division_has_ch01,
  (s.pricing_type = ANY(ARRAY['BESPOKE_SOW','SOW','SOW_PROCUREMENT','QUOTE','STARTING_AT','CONFIGURED','VARIABLE_QUOTE']) OR s.starting_price IS NULL) AS is_quote_required,
  EXISTS(SELECT 1 FROM public.dd_stripe_launch_register r WHERE r.canonical_sku = o.canonical_sku AND r.stripe_payment_link_id IS NOT NULL) AS has_stripe_payment_link,
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
  END AS readiness_state
FROM public.dd_governed_service_offers o
LEFT JOIN public.services s ON s.id = o.runtime_service_id;

GRANT SELECT ON public.dd_service_readiness_v1 TO authenticated, service_role;
