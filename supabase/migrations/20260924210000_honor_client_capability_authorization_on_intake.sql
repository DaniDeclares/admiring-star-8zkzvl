-- private.dd_consume_provider_intake_staging_impl always inserted every
-- submitted provider capability as authorization_status='GATED',
-- evidence_status='PENDING', requirement_status='PENDING', regardless of
-- what the client actually sent. PortalAccessPage.jsx deliberately computes
-- and sends AUTHORIZED/VERIFIED/NOT_REQUIRED for any service that carries no
-- real LICENSE_SERVICE/CERT_SERVICE/AUTO_MOBILE requirement (see its
-- capabilityPayloads comment: "there is nothing left to review"), but this
-- server-side function ignored those fields entirely -- so every self-serve
-- provider signup, even one with zero license-gated services, ends up
-- permanently stuck: dd_approve_provider_application() requires every
-- capability to be AUTHORIZED/VERIFIED/(VERIFIED or NOT_REQUIRED) before an
-- application can be approved at all, and nothing in the self-serve flow
-- could ever produce that state for a non-gated service.
--
-- Purely additive/corrective, idempotent (CREATE OR REPLACE):
--   Reads authorization_status/evidence_status/requirement_status from each
--   capability payload when present, falling back to the original
--   GATED/PENDING/PENDING defaults when absent. requires_license=true still
--   forces the GATED/PENDING/PENDING defaults regardless of payload, as
--   defense in depth against a tampered client payload -- a license-gated
--   service must always go through staff review no matter what the client
--   sends.

begin;

create or replace function private.dd_consume_provider_intake_staging_impl(p_staging_id uuid default null::uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_catalog'
as $function$
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
  v_requires_license boolean;
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
        v_requires_license := coalesce((v_cap->>'requires_license')::boolean, false);
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
          v_requires_license,
          -- A license-gated capability always goes through staff review,
          -- whatever the client sent. A non-gated one honors the client's
          -- computed AUTHORIZED/VERIFIED/NOT_REQUIRED when present, since
          -- there is nothing left for staff to review on those.
          CASE WHEN v_requires_license THEN 'GATED' ELSE coalesce(v_cap->>'authorization_status', 'GATED') END,
          CASE WHEN v_requires_license THEN 'PENDING' ELSE coalesce(v_cap->>'evidence_status', 'PENDING') END,
          CASE WHEN v_requires_license THEN 'PENDING' ELSE coalesce(v_cap->>'requirement_status', 'PENDING') END
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

commit;
