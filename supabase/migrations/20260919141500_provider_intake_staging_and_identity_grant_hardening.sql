-- DRAFT -- NOT YET APPLIED to the live project (ajxezpczaemunlcmqlgl).
-- Dani gave an explicit go-ahead in the project thread on 2026-09-19, but the
-- actual apply was blocked by Claude Code's own auto-mode safety classifier
-- ("Production Deploy"), which in-chat approval cannot override. This SQL is
-- self-contained and transactional (see the pre-flight assertions in section
-- 0 below) and can be run directly via the Supabase SQL editor/CLI, or by a
-- session with permission for that action.
--
-- Two independent changes, each safe to apply on its own:
--   1. Least-privilege grants on public.dd_portal_identities (anon has never
--      had a legitimate reason to touch this table -- see audit notes in the
--      accompanying report).
--   2. A server-side staging table + two SECURITY DEFINER RPCs that move the
--      durable intake boundary before auth.signUp(), replacing the
--      dd_pending_onboarding_v1 localStorage payload in
--      src/lib/pendingOnboarding.js.
--
-- Verified against the live schema on 2026-09-19 (read-only queries only):
--   - dd_portal_identities: RLS is enabled for all non-owner roles
--     (pg_class.relrowsecurity=true; relforcerowsecurity=false just means the
--     table owner/superuser role itself still bypasses RLS, which is normal
--     and unrelated to anon/authenticated), with policies
--     portal_identity_self_read (SELECT, authenticated),
--     portal_identity_self_insert (INSERT, authenticated), and
--     portal_identity_staff_all (ALL, authenticated, via
--     private.dd_is_staff_admin()). None of the three policies apply to the
--     anon role at all -- anon's SELECT/INSERT/UPDATE/DELETE/TRUNCATE/
--     REFERENCES/TRIGGER table grants are pure dead weight that RLS happens
--     to be catching today.
--   - Every real write path in the app (PortalAccessPage.jsx's synchronous
--     branch, and pendingOnboarding.js's completePendingOnboarding) inserts
--     into dd_portal_identities only after supabase.auth.signUp() /
--     onAuthStateChange has produced a session, i.e. as the `authenticated`
--     role, never as `anon`.

-- =========================================================================
-- 0. Pre-flight assertions. Re-checks, at apply time, the exact facts this
--    migration's safety argument depends on (not just what a read-only audit
--    saw a few minutes earlier). Runs inside this migration's own
--    transaction, so any failure here rolls the whole migration back --
--    nothing below it partially applies.
-- =========================================================================
DO $guard$
DECLARE
  v_policy_count int;
  v_anon_policy_count int;
BEGIN
  IF to_regclass('public.dd_portal_identities') IS NULL THEN
    RAISE EXCEPTION 'PRECONDITION_FAILED: public.dd_portal_identities does not exist';
  END IF;
  IF to_regclass('public.dd_provider_intake_staging') IS NOT NULL THEN
    RAISE EXCEPTION 'PRECONDITION_FAILED: public.dd_provider_intake_staging already exists';
  END IF;
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.dd_portal_identities'::regclass) THEN
    RAISE EXCEPTION 'PRECONDITION_FAILED: RLS is not enabled on public.dd_portal_identities -- revoking anon grants would leave it with no access path at all instead of narrowing one';
  END IF;

  SELECT count(*) INTO v_policy_count FROM pg_policies
    WHERE schemaname='public' AND tablename='dd_portal_identities'
      AND policyname IN ('portal_identity_self_read','portal_identity_self_insert','portal_identity_staff_all');
  IF v_policy_count <> 3 THEN
    RAISE EXCEPTION 'PRECONDITION_FAILED: expected the 3 known dd_portal_identities policies, found %; grant revoke aborted so a since-changed policy set is not silently narrowed further', v_policy_count;
  END IF;

  SELECT count(*) INTO v_anon_policy_count FROM pg_policies
    WHERE schemaname='public' AND tablename='dd_portal_identities' AND 'anon' = ANY(roles);
  IF v_anon_policy_count <> 0 THEN
    RAISE EXCEPTION 'PRECONDITION_FAILED: a policy now grants anon a real row-level path on dd_portal_identities (found %); revoking anon''s table grant would break a live path, not just remove dead weight -- stopping per the dependency-analysis condition', v_anon_policy_count;
  END IF;
END;
$guard$;

-- =========================================================================
-- 1. dd_portal_identities: remove the unused anon/PUBLIC grants, and trim
--    `authenticated` down to the four privileges its own RLS policies
--    actually gate (no app code issues TRUNCATE/REFERENCES/TRIGGER against
--    this table, and PostgreSQL enforces those independently of RLS anyway).
-- =========================================================================
REVOKE ALL ON TABLE public.dd_portal_identities FROM anon;
REVOKE ALL ON TABLE public.dd_portal_identities FROM PUBLIC;
REVOKE ALL ON TABLE public.dd_portal_identities FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.dd_portal_identities TO authenticated;
-- service_role and postgres are left untouched (Supabase's own migration
-- runner and the SECURITY DEFINER functions below rely on service_role /
-- table owner access, and Postgres never applies RLS to those roles).

COMMENT ON TABLE public.dd_portal_identities IS
  'Portal identity per authenticated user. anon has no table-level grant as of 2026-09-19 (was previously granted full CRUD -- unused; every write happens post-auth as the authenticated role). RLS policies portal_identity_self_read/self_insert/staff_all remain the actual row-level gate.';

-- =========================================================================
-- 2. Server-side intake staging. Replaces the browser-localStorage-only
--    dd_pending_onboarding_v1 payload as the durable record between
--    auth.signUp() and email confirmation. No table-level grants are issued
--    to anon or authenticated -- all access is through the two RPCs below,
--    which is narrower than any grant we could write directly (an applicant
--    can create exactly one kind of row and can only ever consume the exact
--    staging id they were handed, for their own now-authenticated email).
-- =========================================================================
CREATE TABLE public.dd_provider_intake_staging (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  email_normalized text GENERATED ALWAYS AS (lower(trim(email))) STORED,
  kind text NOT NULL CHECK (kind IN ('provider','resident','apartment_resident','property_manager','real_estate','business','government')),
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','consumed','expired')),
  auth_user_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  consumed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

-- One live (pending) intake per normalized email at a time. Does NOT forbid
-- the same person from onboarding again later -- once a row is consumed or
-- expires, the index no longer covers it, and dd_create_provider_intake_staging
-- below upserts onto any existing *pending* row for the same email instead of
-- erroring, so re-submitting the form (including the 429-retry path already
-- handled in PortalAccessPage.jsx) just refreshes the payload in place.
CREATE UNIQUE INDEX dd_provider_intake_staging_pending_email_key
  ON public.dd_provider_intake_staging (email_normalized)
  WHERE status = 'pending';

CREATE INDEX dd_provider_intake_staging_expires_at_idx
  ON public.dd_provider_intake_staging (expires_at)
  WHERE status = 'pending';

ALTER TABLE public.dd_provider_intake_staging ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.dd_provider_intake_staging FROM anon;
REVOKE ALL ON TABLE public.dd_provider_intake_staging FROM authenticated;
REVOKE ALL ON TABLE public.dd_provider_intake_staging FROM PUBLIC;
-- Deliberately zero policies and zero table grants beyond the two
-- SECURITY DEFINER functions below (granted EXECUTE, not table access).
-- Staff/admin support tooling can still reach this table directly via the
-- service_role key (e.g. from api/portal-operations.js) if a "resend/void a
-- stuck application" admin action is ever needed -- that's a separate,
-- explicitly-scoped follow-up, not part of this change.

COMMENT ON TABLE public.dd_provider_intake_staging IS
  'Durable pre-auth onboarding intake. Written by dd_create_provider_intake_staging (called before auth.signUp()) and consumed exactly once by dd_consume_provider_intake_staging (called after email confirmation / login). Rows past expires_at are inert (RPCs treat expired pending rows as not-found) and are reaped by a periodic cleanup job, not by request-time deletes.';

-- -------------------------------------------------------------------------
-- 2a. Create (or refresh) a pending staging row. Callable pre-auth, so it
--     must be reachable by anon -- but it can ONLY write this one narrow
--     table, in this one shape, which is a materially smaller exposure than
--     the table-level anon grant this migration removes from
--     dd_portal_identities in section 1.
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.dd_create_provider_intake_staging_impl(
  p_email text,
  p_kind text,
  p_payload jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_id uuid;
BEGIN
  IF v_email IS NULL OR v_email = '' OR position('@' in v_email) = 0 THEN
    RAISE EXCEPTION 'INVALID_EMAIL';
  END IF;
  IF p_kind NOT IN ('provider','resident','apartment_resident','property_manager','real_estate','business','government') THEN
    RAISE EXCEPTION 'INVALID_KIND';
  END IF;
  IF p_payload IS NULL THEN
    RAISE EXCEPTION 'PAYLOAD_REQUIRED';
  END IF;

  INSERT INTO public.dd_provider_intake_staging (email, kind, payload)
  VALUES (v_email, p_kind, p_payload)
  ON CONFLICT (email_normalized) WHERE status = 'pending'
  DO UPDATE SET kind = excluded.kind, payload = excluded.payload, updated_at = now(),
                expires_at = now() + interval '7 days'
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.dd_create_provider_intake_staging(p_email text, p_kind text, p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN private.dd_create_provider_intake_staging_impl(p_email, p_kind, p_payload);
END;
$$;

REVOKE ALL ON FUNCTION private.dd_create_provider_intake_staging_impl(text, text, jsonb) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION private.dd_consume_provider_intake_staging_impl(uuid) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.dd_create_provider_intake_staging(text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.dd_create_provider_intake_staging(text, text, jsonb) TO anon, authenticated;

-- -------------------------------------------------------------------------
-- 2b. Consume a staging row after a real session exists. Mirrors
--     runCompletion() in src/lib/pendingOnboarding.js exactly (including its
--     23505-retry behavior and its apartment-invite / provider / generic
--     intake branches) but runs server-side and atomically, so a second
--     concurrent or duplicate call (double-clicked confirmation link,
--     onAuthStateChange firing alongside a manual getSession() check -- the
--     exact race the current inFlightCompletion guard works around
--     client-side) is idempotent by construction: the UPDATE ... WHERE
--     status='pending' below can only ever succeed for one caller, and every
--     other caller for the same staging id gets routed to the
--     already-consumed branch, which returns the existing linkage instead of
--     erroring or double-inserting.
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.dd_consume_provider_intake_staging_impl(p_staging_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
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
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_uid;
  IF v_user_email IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;

  -- Pick the candidate row to claim, always re-checked against the caller's
  -- own confirmed email so nobody can consume another applicant's intake by
  -- guessing/reusing a staging id. Two paths, tried in order:
  --   1. The exact staging id from the confirmation link's query string.
  --   2. A fallback lookup by email alone, with no id at all.
  -- (2) matters because this app's Supabase Auth flow is PKCE
  -- (PortalLoginPage.jsx explicitly exchanges a `code` param), and PKCE's
  -- code_verifier lives only in the ORIGINATING browser's localStorage --
  -- opening the confirmation link in a genuinely different browser/device
  -- fails supabase.auth.exchangeCodeForSession() itself, before this
  -- function is ever called, and the applicant is told to request a new
  -- link. Path (2) is what makes the eventual retry (a fresh magic link, or
  -- a password login after setting one) still recover the original staged
  -- intake instead of losing it, since the row is looked up by email rather
  -- than by the query-string id that never made it through.
  SELECT id INTO v_claim_id
  FROM public.dd_provider_intake_staging
  WHERE status = 'pending' AND expires_at > now() AND email_normalized = lower(trim(v_user_email))
    AND (p_staging_id IS NULL OR id = p_staging_id)
  ORDER BY (id = p_staging_id) DESC NULLS LAST, created_at DESC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  -- Claim it: only succeeds once. This single statement is the entire
  -- idempotency mechanism for "confirmation link opened twice" /
  -- "onAuthStateChange fired twice" -- there is no separate processed_events
  -- table because the staging row's own status column, claimed with this
  -- compare-and-set, already is the dedupe key for the one producer (this
  -- function) and one consumer (this function) involved.
  UPDATE public.dd_provider_intake_staging
  SET status = 'consumed', consumed_at = now(), auth_user_id = v_uid, updated_at = now()
  WHERE id = v_claim_id
    AND status = 'pending'
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    -- Either already consumed by an earlier call (return the linkage that
    -- already exists instead of erroring -- a second open of the same
    -- confirmation link must be a no-op, not a failure), expired, or never
    -- existed / belongs to a different email.
    SELECT id INTO v_existing_identity FROM public.dd_portal_identities WHERE auth_user_id = v_uid;
    IF v_existing_identity IS NOT NULL THEN
      RETURN jsonb_build_object('attempted', true, 'success', true, 'already_consumed', true, 'portal_identity_id', v_existing_identity);
    END IF;
    RETURN jsonb_build_object('attempted', false, 'reason', 'NOT_FOUND_OR_EXPIRED_OR_EMAIL_MISMATCH');
  END IF;

  -- ---- identity (same shape/branch as pendingOnboarding.js runCompletion) ----
  BEGIN
    INSERT INTO public.dd_portal_identities (auth_user_id, portal_role, is_active, entity_id, organization_id)
    VALUES (
      v_uid,
      v_row.payload->'identityPayload'->>'portal_role',
      coalesce((v_row.payload->'identityPayload'->>'is_active')::boolean, true),
      nullif(v_row.payload->'identityPayload'->>'entity_id','')::uuid,
      nullif(v_row.payload->'identityPayload'->>'organization_id','')::uuid
    )
    RETURNING id INTO v_identity_id;
  EXCEPTION WHEN unique_violation THEN
    SELECT id INTO v_identity_id FROM public.dd_portal_identities WHERE auth_user_id = v_uid;
    IF v_identity_id IS NULL THEN
      RETURN jsonb_build_object('attempted', true, 'success', false, 'error', 'Portal setup needs attention: could not resolve existing identity after unique violation.');
    END IF;
  END;

  IF v_row.kind = 'apartment_resident' AND (v_row.payload->>'inviteTokenHash') IS NOT NULL THEN
    SELECT private.dd_consume_apartment_resident_invite_impl(v_row.payload->>'inviteTokenHash', v_identity_id, v_uid) INTO v_consumed;
    IF NOT coalesce(v_consumed, false) THEN
      RETURN jsonb_build_object('attempted', true, 'success', false,
        'error', 'Your account is set up, but the property invitation could not be attached. Please contact your property management team for a new resident invitation.');
    END IF;
  END IF;

  IF v_row.kind = 'provider' AND v_row.payload ? 'providerPayload' THEN
    SELECT id INTO v_existing_application FROM public.dd_provider_applications WHERE applicant_user_id = v_uid;
    IF v_existing_application IS NOT NULL THEN
      v_application_id := v_existing_application;
    ELSE
      INSERT INTO public.dd_provider_applications (
        applicant_user_id, application_status, applicant_type, legal_name,
        contact_first_name, contact_last_name, contact_email, contact_phone,
        physical_address, service_area, service_notes, source, referral_source,
        consent_at, submitted_at, rate_expectation
      )
      SELECT
        v_uid, 'SUBMITTED',
        p->>'applicant_type', p->>'legal_name',
        p->>'contact_first_name', p->>'contact_last_name', p->>'contact_email', p->>'contact_phone',
        p->>'physical_address', p->>'service_area', p->>'service_notes', p->>'source', p->>'referral_source',
        nullif(p->>'consent_at','')::timestamptz, nullif(p->>'submitted_at','')::timestamptz, p->>'rate_expectation'
      FROM (SELECT v_row.payload->'providerPayload' AS p) s
      RETURNING id INTO v_application_id;
    END IF;

    IF jsonb_array_length(coalesce(v_row.payload->'capabilityPayloads','[]'::jsonb)) > 0
       AND NOT EXISTS (SELECT 1 FROM public.dd_provider_application_capabilities WHERE application_id = v_application_id) THEN
      FOR v_cap IN SELECT * FROM jsonb_array_elements(v_row.payload->'capabilityPayloads') LOOP
        INSERT INTO public.dd_provider_application_capabilities (
          application_id, canonical_service_id, canonical_sku, capability_key, capability_description,
          applicant_experience, requires_license, authorization_status, evidence_status, requirement_status
        ) VALUES (
          v_application_id,
          nullif(v_cap->>'canonical_service_id','')::uuid,
          v_cap->>'canonical_sku', v_cap->>'capability_key', v_cap->>'capability_description',
          v_cap->>'applicant_experience', coalesce((v_cap->>'requires_license')::boolean, false),
          coalesce(v_cap->>'authorization_status','GATED'),
          coalesce(v_cap->>'evidence_status','PENDING'),
          coalesce(v_cap->>'requirement_status','PENDING')
        );
      END LOOP;
    END IF;
  ELSIF v_row.payload ? 'intakePayload' THEN
    INSERT INTO public.dd_portal_onboarding_intakes (
      auth_user_id, portal_role, relationship_type, channel_code, organization_name,
      first_name, last_name, email, phone, address, city, state_code, zip_code, service_area,
      requested_services, intake_data, status, client_organization_id, client_property_id,
      property_resident_invite_id
    )
    SELECT
      v_uid, p->>'portal_role', p->>'relationship_type', p->>'channel_code', p->>'organization_name',
      p->>'first_name', p->>'last_name', p->>'email', p->>'phone', p->>'address', p->>'city', p->>'state_code', p->>'zip_code', p->>'service_area',
      coalesce((SELECT array_agg(x) FROM jsonb_array_elements_text(coalesce(p->'requested_services','[]'::jsonb)) x), '{}'),
      coalesce(p->'intake_data','{}'::jsonb), coalesce(p->>'status','SUBMITTED'),
      nullif(p->>'client_organization_id','')::uuid, nullif(p->>'client_property_id','')::uuid, nullif(p->>'property_resident_invite_id','')::uuid
    FROM (SELECT v_row.payload->'intakePayload' AS p) s;
  END IF;

  RETURN jsonb_build_object('attempted', true, 'success', true, 'portal_identity_id', v_identity_id, 'provider_application_id', v_application_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.dd_consume_provider_intake_staging(p_staging_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN private.dd_consume_provider_intake_staging_impl(p_staging_id);
END;
$$;

REVOKE ALL ON FUNCTION public.dd_consume_provider_intake_staging(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.dd_consume_provider_intake_staging(uuid) TO authenticated;

-- -------------------------------------------------------------------------
-- 2c. Retention: expire stale pending rows so the partial unique index
--     never permanently blocks a real re-signup and abandoned intake
--     payloads (which contain the same PII as the rest of the onboarding
--     data model) don't accumulate indefinitely. Reuses the existing
--     pg_cron installation (see supabase/migrations/20260820_pass_a4_*
--     guarded-outbox-cron migrations) rather than introducing new
--     scheduling infrastructure.
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.dd_expire_stale_intake_staging()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  UPDATE public.dd_provider_intake_staging
  SET status = 'expired', updated_at = now()
  WHERE status = 'pending' AND expires_at <= now();
$$;

-- NOT scheduled by this migration -- see the accompanying report for why
-- (this repo's pg_cron job registration lives in the guarded-outbox
-- migrations under a naming/ownership convention this change should match
-- rather than duplicate; wiring the schedule is a one-line follow-up once
-- Dani confirms which existing cron job family it should join).
