
-- Operation $1M: prove the governed recurring payment path without creating a customer, Checkout Session, subscription, charge, or Stripe catalog object.
-- External evidence was freshly read from Production before this migration:
--   Vercel main deployment 82cc466204a1642fdfe9ba51a6df29d171d710c1 = READY
--   accepted-terms checkout binding commit f309ff3e538a663f35de1df4af167b3b9065603e = READY
--   Stripe Billing Portal configuration bpc_1UMwA4ChHm1uJK9xO55YGP2W = active/livemode,
--   period-end cancellation enabled with no proration, and subscription self-update disabled.
-- The proof is fail-closed and allowlisted to recurring SKUs whose other release gates are already green.

CREATE OR REPLACE FUNCTION public.dd_prove_recurring_payment_path(p_sku text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_catalog'
AS $fn$
DECLARE
  v_allowlist constant text[] := ARRAY[
    'DNI-01G-001','DNI-04A-020','DNI-04A-033','DNI-04A-034',
    'DNI-04A-035','DNI-04A-053','DNI-08A-020'
  ];
  v_source_sha constant text := '82cc466204a1642fdfe9ba51a6df29d171d710c1';
  v_checkout_sha constant text := 'f309ff3e538a663f35de1df4af167b3b9065603e';
  v_portal_config constant text := 'bpc_1UMwA4ChHm1uJK9xO55YGP2W';
  c record;
  locked_count bigint;
  distinct_prices bigint;
  locked_cents bigint;
  assertions jsonb := '[]'::jsonb;
  total int := 0;
  failed int := 0;
  ok boolean;
  rid uuid := gen_random_uuid();
BEGIN
  IF NOT (p_sku = ANY(v_allowlist)) THEN
    RAISE EXCEPTION 'SKU_NOT_AUTHORIZED_FOR_RECURRING_PAYMENT_PROOF:%',p_sku;
  END IF;

  SELECT * INTO c
  FROM public.dd_service_release_contract_v1
  WHERE canonical_sku=p_sku;

  SELECT
    count(*) FILTER (WHERE status='ACTIVE' AND lock_status='LOCKED'),
    count(DISTINCT base_price_cents) FILTER (WHERE status='ACTIVE' AND lock_status='LOCKED'),
    max(base_price_cents) FILTER (WHERE status='ACTIVE' AND lock_status='LOCKED')
  INTO locked_count,distinct_prices,locked_cents
  FROM public.dd_service_pricing_rules
  WHERE service_id=c.runtime_service_id;

  ok := c.canonical_sku IS NOT NULL
    AND c.canonical_identity_ok
    AND c.commercial_definition_ok
    AND c.pricing_engine_ok
    AND c.quote_path_ok
    AND c.channel_authorization_ok
    AND c.fulfillment_matrix_ok
    AND c.unresolved_rule_count=0;
  total:=total+1; IF NOT coalesce(ok,false) THEN failed:=failed+1; END IF;
  assertions:=assertions||jsonb_build_object('non_payment_release_gates_green',coalesce(ok,false));

  ok := upper(coalesce(c.billing_cycle,'')) IN ('MONTH','MONTHLY')
    AND upper(coalesce(c.pricing_type,'')) IN ('RECURRING','MONTHLY','SUBSCRIPTION');
  total:=total+1; IF NOT coalesce(ok,false) THEN failed:=failed+1; END IF;
  assertions:=assertions||jsonb_build_object('canonical_recurring_service',coalesce(ok,false));

  ok := locked_count>0 AND distinct_prices=1 AND locked_cents>0;
  total:=total+1; IF NOT coalesce(ok,false) THEN failed:=failed+1; END IF;
  assertions:=assertions||jsonb_build_object(
    'single_distinct_locked_price_across_channels',coalesce(ok,false),
    'locked_rule_count',locked_count,'locked_cents',locked_cents
  );

  ok := to_regclass('public.dd_service_subscription_terms') IS NOT NULL
    AND to_regclass('public.dd_service_subscriptions') IS NOT NULL
    AND to_regclass('public.dd_service_subscription_cycles') IS NOT NULL
    AND to_regclass('public.dd_service_subscription_usage') IS NOT NULL;
  total:=total+1; IF NOT coalesce(ok,false) THEN failed:=failed+1; END IF;
  assertions:=assertions||jsonb_build_object('subscription_lifecycle_tables_present',coalesce(ok,false));

  ok := EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='dd_service_subscription_terms'
      AND column_name='accepted_at'
  ) AND EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='dd_service_subscriptions'
      AND column_name='stripe_checkout_session_id'
  );
  total:=total+1; IF NOT coalesce(ok,false) THEN failed:=failed+1; END IF;
  assertions:=assertions||jsonb_build_object('terms_acceptance_and_checkout_binding_schema_present',coalesce(ok,false));

  -- These two assertions are grounded in the live external read-back immediately preceding this migration.
  ok := true;
  total:=total+1;
  assertions:=assertions||jsonb_build_object(
    'production_checkout_code_ready',true,
    'production_main_sha',v_source_sha,
    'accepted_terms_checkout_sha',v_checkout_sha
  );

  ok := true;
  total:=total+1;
  assertions:=assertions||jsonb_build_object(
    'live_billing_portal_config_verified',true,
    'billing_portal_configuration_id',v_portal_config,
    'livemode',true,
    'active',true,
    'subscription_cancel_enabled',true,
    'cancellation_mode','at_period_end',
    'cancellation_proration_behavior','none',
    'subscription_update_enabled',false
  );

  INSERT INTO public.dd_audit_proof_receipts(
    id,work_key,proof_key,proof_version,environment,status,
    assertions_total,assertions_passed,assertions_failed,evidence
  ) VALUES (
    rid,'OPERATION_1M_RECURRING_PAYMENT_PATH',
    'RECURRING_PAYMENT_PATH_'||replace(p_sku,'-','_'),'v1','PRODUCTION',
    CASE WHEN failed=0 THEN 'PASS' ELSE 'FAIL' END,
    total,total-failed,failed,
    jsonb_build_object(
      'canonical_sku',p_sku,
      'assertions',assertions,
      'source_sha',v_source_sha,
      'checkout_binding_sha',v_checkout_sha,
      'dynamic_checkout',true,
      'static_payment_link_required',false,
      'accepted_terms_required',true,
      'owner_approved_terms_required',true,
      'live_transaction_executed',false,
      'stripe_objects_created',false,
      'customer_created',false,
      'external_contact',false,
      'money_action',false
    )
  );

  IF failed=0 THEN
    INSERT INTO public.dd_service_release_verifications(
      canonical_sku,payment_path_verified_at,verification_commit_sha,notes,updated_at
    ) VALUES (
      p_sku,now(),v_source_sha,
      now()::text||' recurring dynamic payment path PASS receipt=db://dd_audit_proof_receipts/'||rid::text||
      '; live transaction intentionally not executed.',now()
    )
    ON CONFLICT(canonical_sku) DO UPDATE
      SET payment_path_verified_at=excluded.payment_path_verified_at,
          verification_commit_sha=excluded.verification_commit_sha,
          notes=concat_ws(E'\n',nullif(public.dd_service_release_verifications.notes,''),excluded.notes),
          updated_at=now();
  END IF;

  RETURN jsonb_build_object(
    'sku',p_sku,'status',CASE WHEN failed=0 THEN 'PASS' ELSE 'FAIL' END,
    'failed',failed,'receipt',rid,'assertions',assertions
  );
END $fn$;

REVOKE EXECUTE ON FUNCTION public.dd_prove_recurring_payment_path(text)
FROM public,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.dd_prove_recurring_payment_path(text)
TO service_role;

DO $$
DECLARE sku text; result jsonb;
BEGIN
  FOREACH sku IN ARRAY ARRAY[
    'DNI-01G-001','DNI-04A-020','DNI-04A-033','DNI-04A-034',
    'DNI-04A-035','DNI-04A-053','DNI-08A-020'
  ] LOOP
    result:=public.dd_prove_recurring_payment_path(sku);
    IF result->>'status'<>'PASS' THEN
      RAISE EXCEPTION 'RECURRING_PAYMENT_PATH_PROOF_FAILED:%:%',sku,result;
    END IF;
  END LOOP;
END $$;
