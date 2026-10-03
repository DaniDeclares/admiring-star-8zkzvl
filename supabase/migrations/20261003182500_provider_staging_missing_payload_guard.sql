-- Corrective follow-up for 20261003163000_staged_intake_incomplete_does_not_block_login.sql.
--
-- The earlier guard correctly held incomplete providerPayload rows, but only
-- entered that check when providerPayload existed. A legacy/recovery provider
-- staging row with no providerPayload could therefore be marked consumed
-- without creating a provider application. Keep the existing function,
-- signature, grants, and login behavior; widen only that guard.
--
-- Fail closed if the expected canonical guard is not present. This prevents a
-- silent no-op if the implementation has drifted before this migration runs.
DO $do$
DECLARE
  v_def text;
  v_old text := $$OR (v_claim_kind = 'provider' AND v_claim_payload ? 'providerPayload' AND v_existing_application IS NULL
           AND (nullif(v_claim_payload->'providerPayload'->>'applicant_type','') IS NULL$$;
  v_new text := $$OR (v_claim_kind = 'provider' AND v_existing_application IS NULL
           AND (NOT (v_claim_payload ? 'providerPayload')
             OR nullif(v_claim_payload->'providerPayload'->>'applicant_type','') IS NULL$$;
BEGIN
  SELECT pg_get_functiondef(p.oid)
    INTO v_def
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'private'
    AND p.proname = 'dd_consume_provider_intake_staging_impl'
  ORDER BY p.oid DESC
  LIMIT 1;

  IF v_def IS NULL THEN
    RAISE EXCEPTION 'FUNCTION_NOT_FOUND: private.dd_consume_provider_intake_staging_impl';
  END IF;

  IF position(v_old in v_def) = 0 THEN
    RAISE EXCEPTION 'EXPECTED_PROVIDER_STAGING_GUARD_NOT_FOUND';
  END IF;

  v_def := replace(v_def, v_old, v_new);
  EXECUTE v_def;
END
$do$;

COMMENT ON FUNCTION private.dd_consume_provider_intake_staging_impl(uuid) IS
  'Consumes staged portal/provider intake. Incomplete legacy provider staging, including rows with no providerPayload, is held pending and must not block login or be consumed without an application.';
