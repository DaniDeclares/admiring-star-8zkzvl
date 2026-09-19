ALTER TABLE "public"."dd_stripe_launch_register" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_admin_select_dd_stripe_launch_register"
ON "public"."dd_stripe_launch_register"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM dd_portal_identities pi
    WHERE pi.auth_user_id = auth.uid()
      AND pi.is_active = true
      AND pi.portal_role = ANY (ARRAY['staff_admin'::text, 'procurement'::text])
  )
);