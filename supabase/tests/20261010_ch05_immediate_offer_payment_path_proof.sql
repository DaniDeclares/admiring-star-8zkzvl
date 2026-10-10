-- CH05 checkout integrity proof, read-only; run against Tester or Production.
-- Do not conflate LIVE_READY catalog status with a direct Stripe payment path.
-- Subscription/retainer SKUs may legitimately require intake and quote before payment.
-- Fail if the owner's five immediate one-time offers lose their verified registered paths.
DO $proof$
DECLARE
  v_bad text;
  v_missing int;
BEGIN
  WITH required(sku) AS (
    VALUES ('DNI-04A-003'),('DNI-04A-016'),('DNI-04A-017'),
           ('DNI-04A-036'),('DNI-01D-009')
  )
  SELECT string_agg(r.sku || ' (' ||
    concat_ws(', ',
      CASE WHEN p.release_state IS DISTINCT FROM 'LIVE_READY' THEN 'not LIVE_READY' END,
      CASE WHEN p.blocking_gate IS DISTINCT FROM 'NONE' THEN 'blocked' END,
      CASE WHEN p.payment_ledger_ok IS DISTINCT FROM true THEN 'ledger unverified' END,
      CASE WHEN p.runtime_accuracy_ok IS DISTINCT FROM true THEN 'runtime unverified' END,
      CASE WHEN s.is_active IS DISTINCT FROM true THEN 'service inactive' END,
      CASE WHEN l.stripe_payment_link_id IS NULL THEN 'no registered payment link' END,
      CASE WHEN c.sync_status IS DISTINCT FROM 'SYNCED_ACTIVE' THEN 'Stripe sync not active' END
    ) || ')', '; ')
  INTO v_bad
  FROM required r
  LEFT JOIN public.dd_multidivision_sellability_priority_v1 p ON p.sku = r.sku
  LEFT JOIN public.services s ON s.sku = r.sku
  LEFT JOIN public.dd_stripe_launch_register l ON l.canonical_sku = r.sku
  LEFT JOIN public.dd_stripe_catalog_sync c ON c.canonical_sku = r.sku
  WHERE p.sku IS NULL
     OR p.release_state IS DISTINCT FROM 'LIVE_READY'
     OR p.blocking_gate IS DISTINCT FROM 'NONE'
     OR p.payment_ledger_ok IS DISTINCT FROM true
     OR p.runtime_accuracy_ok IS DISTINCT FROM true
     OR s.is_active IS DISTINCT FROM true
     OR l.stripe_payment_link_id IS NULL
     OR c.sync_status IS DISTINCT FROM 'SYNCED_ACTIVE';
  IF v_bad IS NOT NULL THEN
    RAISE EXCEPTION 'CH05_IMMEDIATE_OFFER_PAYMENT_PATH_REGRESSION: %', v_bad;
  END IF;

  -- Informational only: recurrent/monthly offers are not automatically direct checkout.
  SELECT count(*) INTO v_missing
  FROM public.dd_multidivision_sellability_priority_v1 p
  LEFT JOIN public.dd_stripe_launch_register l ON l.canonical_sku=p.sku
  LEFT JOIN public.dd_stripe_catalog_sync c ON c.canonical_sku=p.sku
  WHERE p.division_slug='administrative-business-operations'
    AND p.release_state='LIVE_READY'
    AND (l.stripe_payment_link_id IS NULL OR c.sync_status IS DISTINCT FROM 'SYNCED_ACTIVE');

  RAISE NOTICE 'CH05_IMMEDIATE_OFFER_PAYMENT_PATH_PASS: 5 focus SKUs have governed records; % LIVE_READY CH05 rows lack direct payment-link/sync evidence and require manual intake/payment-path review.', v_missing;
END $proof$;

-- Scope: this does not test actual Stripe HTTP status, customer intake usability,
-- fulfillment capacity, per-job profitability or real checkout/digital delivery.
-- Those must be verified separately; do not automatically flip release states.
