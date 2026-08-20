-- PASS A.1 — Portal role vocabulary alignment
-- The portal server recognizes staff/admin roles separately from persisted portal identities.
-- Keep the identity table compatible with the canonical staff_admin role and existing customer alias.
-- No pricing, estimate, invoice, or Stripe changes.

ALTER TABLE public.dd_portal_identities
  DROP CONSTRAINT IF EXISTS dd_portal_identities_portal_role_check;

ALTER TABLE public.dd_portal_identities
  ADD CONSTRAINT dd_portal_identities_portal_role_check
  CHECK (
    portal_role = ANY (
      ARRAY[
        'provider',
        'resident',
        'customer',
        'property_manager',
        'procurement',
        'staff_admin'
      ]
    )
  );

-- The existing server portal auth layer uses app_metadata.role for staff claims.
-- Accept that established claim while retaining portal_role as the preferred claim.
CREATE OR REPLACE FUNCTION private.dd_is_staff_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    auth.jwt() -> 'app_metadata' ->> 'portal_role',
    auth.jwt() -> 'app_metadata' ->> 'role',
    ''
  ) IN ('staff_admin', 'admin', 'owner', 'staff');
$$;
