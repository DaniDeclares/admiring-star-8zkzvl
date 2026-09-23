-- 19 Division 04A Administrative & Business Operations services (DNI-04A-001 through
-- DNI-04A-019) are DANI DIRECT (owner-fulfilled, no vendor/provider capability gate),
-- have real owner-approved locked pricing (RESOLVED 2026-09-18, not draft), and had
-- zero Stripe objects. Real Stripe products/prices/live payment links were created for
-- each (verified individually against the live Stripe API, not just written to Supabase)
-- and dd_stripe_launch_register was updated in a prior transaction. This migration is
-- intentionally verification-only so replay cannot duplicate the correction. The 4
-- bookkeeping SKUs in this division (DNI-04A-023/024/025/026) are explicitly excluded:
-- they are provider-routed (Cass Rosser) with draft/negative-margin economics, not ready.

DO $$
DECLARE
  v_count int;
  v_bad int;
BEGIN
  SELECT count(*) INTO v_count
  FROM public.dd_stripe_launch_register
  WHERE canonical_sku = ANY(ARRAY[
    'DNI-04A-001','DNI-04A-002','DNI-04A-003','DNI-04A-004','DNI-04A-005',
    'DNI-04A-006','DNI-04A-007','DNI-04A-008','DNI-04A-009','DNI-04A-010',
    'DNI-04A-011','DNI-04A-012','DNI-04A-013','DNI-04A-014','DNI-04A-015',
    'DNI-04A-016','DNI-04A-017','DNI-04A-018','DNI-04A-019'
  ])
  AND pricing_status = 'STRIPE_PRICE_ACTIVE'
  AND fulfillment_status = 'READY'
  AND activation_decision = 'ACTIVE'
  AND stripe_product_id IS NOT NULL
  AND stripe_price_id IS NOT NULL
  AND stripe_payment_link_id IS NOT NULL;

  IF v_count <> 19 THEN
    RAISE EXCEPTION 'Expected 19 fully-active Division 04A launch register rows, found %', v_count;
  END IF;

  SELECT count(*) INTO v_bad
  FROM public.dd_stripe_launch_register
  WHERE canonical_sku IN ('DNI-04A-023','DNI-04A-024','DNI-04A-025','DNI-04A-026')
    AND activation_decision = 'ACTIVE';

  IF v_bad <> 0 THEN
    RAISE EXCEPTION 'Provider-routed bookkeeping SKUs must not be ACTIVE, found %', v_bad;
  END IF;

  RAISE NOTICE 'Division 04A Stripe checkout activation verified: 19/19 active, bookkeeping cluster correctly excluded.';
END $$;
