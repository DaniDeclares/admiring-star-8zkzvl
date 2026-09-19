-- Angel Rice (theonetrueangel@gmail.com, auth.users.id c3e2bb8f-1d97-4d10-afd8-e40731a6d446)
-- signed up as a provider; her confirmation link's redirect_to pointed at a
-- Vercel preview deployment (window.location.origin bug, fixed in
-- src/pages/PortalAccessPage.jsx / siteConfig.js SITE_URL this same session)
-- which is gated by Vercel's own deployment-protection login page. Verified
-- directly: her email IS confirmed and a session WAS established
-- server-side at confirmation time (auth.users.email_confirmed_at and
-- last_sign_in_at both populated 2026-09-19T12:59:09Z) -- the failure was
-- entirely client-side (wrong redirect origin), never in Supabase Auth
-- itself. Because that redirect landed on a different origin than the one
-- she filled out the form on, completePendingOnboarding() (which reads a
-- localStorage payload written on the ORIGINAL origin) never ran on the
-- Vercel preview's origin -- she has zero dd_portal_identities and zero
-- dd_provider_applications rows despite a fully confirmed account.
--
-- This migration creates ONLY her portal identity record (matches the exact
-- shape completePendingOnboarding() would have inserted: portal_role=
-- 'provider', is_active=true) so she is not left in a broken half-signed-up
-- state when she logs in at the real production URL. It deliberately does
-- NOT fabricate a dd_provider_applications row or any
-- dd_provider_application_capabilities rows -- her original business name,
-- applicant type, and category/service selections lived only in the
-- Vercel-preview-origin's localStorage and were never transmitted to this
-- database; inventing that content would be exactly the kind of fabricated
-- business record this project's governance rules exist to prevent. She
-- (or whoever assists her) needs to actually re-answer those questions.
DO $$
DECLARE
  v_existing int;
BEGIN
  SELECT count(*) INTO v_existing FROM public.dd_portal_identities WHERE auth_user_id='c3e2bb8f-1d97-4d10-afd8-e40731a6d446';
  IF v_existing = 0 THEN
    INSERT INTO public.dd_portal_identities (auth_user_id, portal_role, is_active)
    VALUES ('c3e2bb8f-1d97-4d10-afd8-e40731a6d446', 'provider', true);
  END IF;

  SELECT count(*) INTO v_existing FROM public.dd_portal_identities WHERE auth_user_id='c3e2bb8f-1d97-4d10-afd8-e40731a6d446' AND portal_role='provider' AND is_active=true;
  IF v_existing <> 1 THEN
    RAISE EXCEPTION 'Expected exactly 1 active provider portal identity for Angel Rice, found %', v_existing;
  END IF;

  RAISE NOTICE 'Angel Rice portal identity verified present; no provider application data was fabricated.';
END $$;
