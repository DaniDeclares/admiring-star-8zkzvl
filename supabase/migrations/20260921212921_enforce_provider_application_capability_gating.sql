
CREATE OR REPLACE FUNCTION private.dd_consume_provider_intake_staging_impl(p_staging_id uuid DEFAULT NULL::uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_user_email text;
  v_row public.dd_provider_intake_staging%rowtype;
  v_identity_id uuid;
  v_application_id uuid;
  v_existing_identity uuid;
  v_existing_application uuid;
  v_cap jsonb;
  v_consumed boolean;
  v_claim_id uuid;
  v_recovery_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_uid;
  IF v_user_email IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;

  SELECT id INTO v_claim_id
  FROM public.dd_provider_intake_staging
  WHERE status = 'pending'
    AND expires_at > now()
    AND email_normalized = lower(trim(v_user_email))
    AND (p_staging_id IS NULL OR id = p_staging_id)
  ORDER BY (id = p_staging_id) DESC NULLS LAST, created_at DESC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_claim_id IS NULL THEN
    SELECT id INTO v_recovery_id
    FROM public.dd_provider_intake_staging
    WHERE status = 'consumed'
      AND auth_user_id = v_uid
      AND email_normalized = lower(trim(v_user_email))
      AND NOT EXISTS (
        SELECT 1 FROM public.dd_portal_identities pi WHERE pi.auth_user_id = v_uid
      )
    ORDER BY consumed_at DESC NULLS LAST, created_at DESC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF v_recovery_id IS NOT NULL THEN
      UPDATE public.dd_provider_intake_staging
      SET status = 'pending', consumed_at = NULL, updated_at = now()
      WHERE id = v_recovery_id AND status = 'consumed' AND auth_user_id = v_uid;
      v_claim_id := v_recovery_id;
    END IF;
  END IF;

  UPDATE public.dd_provider_intake_staging
  SET status = 'consumed', consumed_at = now(), auth_user_id = v_uid, updated_at = now()
  WHERE id = v_claim_id
    AND status = 'pending'
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    SELECT id INTO v_existing_identity
    FROM public.dd_portal_identities
    WHERE auth_user_id = v_uid;

    IF v_existing_identity IS NOT NULL THEN
      RETURN jsonb_build_object(
        'attempted', true, 'success', true, 'already_consumed', true,
        'portal_identity_id', v_existing_identity
      );
    END IF;

    RETURN jsonb_build_object(
      'attempted', false,
      'reason', 'NOT_FOUND_OR_EXPIRED_OR_EMAIL_MISMATCH'
    );
  END IF;

  BEGIN
    INSERT INTO public.dd_portal_identities
      (auth_user_id, portal_role, is_active, entity_id, organization_id)
    VALUES (
      v_uid,
      v_row.payload->'identityPayload'->>'portal_role',
      coalesce((v_row.payload->'identityPayload'->>'is_active')::boolean, true),
      nullif(v_row.payload->'identityPayload'->>'entity_id','')::uuid,
      nullif(v_row.payload->'identityPayload'->>'organization_id','')::uuid
    )
    RETURNING id INTO v_identity_id;
  EXCEPTION WHEN unique_violation THEN
    SELECT id INTO v_identity_id
    FROM public.dd_portal_identities
    WHERE auth_user_id = v_uid;
    IF v_identity_id IS NULL THEN RAISE; END IF;
  END;

  IF v_row.kind = 'apartment_resident'
     AND (v_row.payload->>'inviteTokenHash') IS NOT NULL THEN
    SELECT private.dd_consume_apartment_resident_invite_impl(
      v_row.payload->>'inviteTokenHash', v_identity_id, v_uid
    ) INTO v_consumed;
    IF NOT coalesce(v_consumed, false) THEN
      RAISE EXCEPTION 'PROPERTY_INVITE_ATTACH_FAILED';
    END IF;
  END IF;

  IF v_row.kind = 'provider' AND v_row.payload ? 'providerPayload' THEN
    SELECT id INTO v_existing_application
    FROM public.dd_provider_applications
    WHERE applicant_user_id = v_uid;

    IF v_existing_application IS NOT NULL THEN
      v_application_id := v_existing_application;
    ELSE
      INSERT INTO public.dd_provider_applications (
        applicant_user_id, application_status, applicant_type, legal_name,
        contact_first_name, contact_last_name, contact_email, contact_phone,
        physical_address, service_area, service_notes, source, referral_source,
        consent_at, submitted_at, rate_expectation, network_access_level
      )
      SELECT
        v_uid, 'SUBMITTED',
        p->>'applicant_type', p->>'legal_name',
        p->>'contact_first_name', p->>'contact_last_name',
        p->>'contact_email', p->>'contact_phone',
        p->>'physical_address', p->>'service_area',
        p->>'service_notes', p->>'source', p->>'referral_source',
        nullif(p->>'consent_at','')::timestamptz,
        nullif(p->>'submitted_at','')::timestamptz,
        p->>'rate_expectation', 'NONE'
      FROM (SELECT v_row.payload->'providerPayload' AS p) s
      RETURNING id INTO v_application_id;
    END IF;

    IF jsonb_array_length(coalesce(v_row.payload->'capabilityPayloads','[]'::jsonb)) > 0
       AND NOT EXISTS (
         SELECT 1
         FROM public.dd_provider_application_capabilities
         WHERE application_id = v_application_id
       ) THEN
      FOR v_cap IN
        SELECT * FROM jsonb_array_elements(v_row.payload->'capabilityPayloads')
      LOOP
        INSERT INTO public.dd_provider_application_capabilities (
          application_id, canonical_service_id, canonical_sku, capability_key,
          capability_description, applicant_experience, requires_license,
          authorization_status, evidence_status, requirement_status
        ) VALUES (
          v_application_id,
          nullif(v_cap->>'canonical_service_id','')::uuid,
          v_cap->>'canonical_sku',
          v_cap->>'capability_key',
          v_cap->>'capability_description',
          v_cap->>'applicant_experience',
          coalesce((v_cap->>'requires_license')::boolean, false),
          'GATED',
          'PENDING',
          'PENDING'
        );
      END LOOP;
    END IF;
  ELSIF v_row.payload ? 'intakePayload' THEN
    INSERT INTO public.dd_portal_onboarding_intakes (
      auth_user_id, portal_role, relationship_type, channel_code,
      organization_name, first_name, last_name, email, phone, address,
      city, state_code, zip_code, service_area, requested_services,
      intake_data, status, client_organization_id, client_property_id,
      property_resident_invite_id
    )
    SELECT
      v_uid, p->>'portal_role', p->>'relationship_type', p->>'channel_code',
      p->>'organization_name', p->>'first_name', p->>'last_name',
      p->>'email', p->>'phone', p->>'address', p->>'city',
      p->>'state_code', p->>'zip_code', p->>'service_area',
      coalesce(
        (SELECT array_agg(x)
         FROM jsonb_array_elements_text(coalesce(p->'requested_services','[]'::jsonb)) x),
        '{}'
      ),
      coalesce(p->'intake_data','{}'::jsonb),
      coalesce(p->>'status','SUBMITTED'),
      nullif(p->>'client_organization_id','')::uuid,
      nullif(p->>'client_property_id','')::uuid,
      nullif(p->>'property_resident_invite_id','')::uuid
    FROM (SELECT v_row.payload->'intakePayload' AS p) s;
  END IF;

  RETURN jsonb_build_object(
    'attempted', true,
    'success', true,
    'portal_identity_id', v_identity_id,
    'provider_application_id', v_application_id
  );
END;
$function$;

REVOKE ALL ON FUNCTION private.dd_consume_provider_intake_staging_impl(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.dd_consume_provider_intake_staging_impl(uuid) TO authenticated;
