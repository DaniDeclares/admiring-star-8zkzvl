-- Reconciled Production form of canonical 20261003182500 provider guard.
-- Production's equivalent guard is minified; replace only the exact bounded predicate and preserve function signature/grants/body otherwise.
DO $do$
DECLARE
  v_def text;
  v_old text := $$OR (v_claim_kind='provider' AND v_claim_payload ? 'providerPayload' AND v_existing_application IS NULL AND (nullif(v_claim_payload->'providerPayload'->>'applicant_type','') IS NULL$$;
  v_new text := $$OR (v_claim_kind='provider' AND v_existing_application IS NULL AND (NOT (v_claim_payload ? 'providerPayload') OR nullif(v_claim_payload->'providerPayload'->>'applicant_type','') IS NULL$$;
BEGIN
  SELECT pg_get_functiondef('private.dd_consume_provider_intake_staging_impl(uuid)'::regprocedure) INTO v_def;
  IF v_def IS NULL THEN RAISE EXCEPTION 'FUNCTION_NOT_FOUND: private.dd_consume_provider_intake_staging_impl'; END IF;
  IF position(v_old in v_def)=0 THEN RAISE EXCEPTION 'EXPECTED_PROVIDER_STAGING_GUARD_NOT_FOUND'; END IF;
  v_def:=replace(v_def,v_old,v_new);
  EXECUTE v_def;
END
$do$;
COMMENT ON FUNCTION private.dd_consume_provider_intake_staging_impl(uuid) IS 'Consumes staged portal/provider intake. Incomplete legacy provider staging, including rows with no providerPayload, is held pending and must not block login or be consumed without an application.';
