-- Reconcile the one canonical SELL_NOW service that was missing governed pricing/channel rows.
-- Production data was corrected in a transaction before this verification migration was recorded.
-- This migration is intentionally verification-only so replay cannot duplicate the correction.

DO $$
DECLARE
  v_service_id uuid;
  v_pricing_rows int;
  v_channel_rows int;
BEGIN
  SELECT id INTO v_service_id
  FROM public.services
  WHERE sku='DNI-01B-008'
    AND commercial_status='CANONICAL_ACTIVE'
    AND commercial_intent_status='SELL_NOW';

  IF v_service_id IS NULL THEN
    RAISE EXCEPTION 'DNI-01B-008 canonical SELL_NOW service not found';
  END IF;

  SELECT count(*) INTO v_pricing_rows FROM public.dd_service_pricing_rules WHERE service_id=v_service_id;
  IF v_pricing_rows <> 5 THEN RAISE EXCEPTION 'Expected 5 pricing rules, found %', v_pricing_rows; END IF;

  SELECT count(*) INTO v_channel_rows
  FROM public.dd_service_channel_availability
  WHERE service_id=v_service_id AND channel_code IN ('CH01','CH02','CH03','CH04','CH05');
  IF v_channel_rows <> 5 THEN RAISE EXCEPTION 'Expected 5 channel rows, found %', v_channel_rows; END IF;

  IF EXISTS (
    SELECT 1 FROM public.dd_service_pricing_rules
    WHERE service_id=v_service_id
      AND (pricing_type <> 'STARTING_AT' OR base_price_cents <> 3500 OR currency <> 'USD'
        OR billing_cycle <> 'ONETIME' OR lock_status <> 'PENDING' OR status <> 'PENDING_RECONCILIATION')
  ) THEN RAISE EXCEPTION 'Pricing reconciliation mismatch'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.dd_service_channel_availability
    WHERE service_id=v_service_id AND channel_code IN ('CH01','CH02','CH03','CH04','CH05')
      AND eligibility_status <> 'PENDING'
  ) THEN RAISE EXCEPTION 'Channel rows are not PENDING'; END IF;

  RAISE NOTICE 'DNI-01B-008 reconciliation verified.';
END $$;
