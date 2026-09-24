REVOKE ALL ON FUNCTION private.dd_is_staff_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.dd_current_org_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.dd_current_provider_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.dd_guard_provider_task_update() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.dd_trigger_notification_worker() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION private.dd_is_staff_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION private.dd_current_org_id() TO authenticated;
GRANT EXECUTE ON FUNCTION private.dd_current_provider_id() TO authenticated;

REVOKE ALL ON FUNCTION private.dd_guard_provider_task_update() FROM authenticated;
REVOKE ALL ON FUNCTION private.dd_trigger_notification_worker() FROM authenticated;

DROP POLICY IF EXISTS dd_task_templates_authenticated_read ON public.dd_task_templates;
CREATE POLICY dd_task_templates_portal_read
  ON public.dd_task_templates
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'portal_role', '')
      IN ('provider', 'staff_admin', 'admin', 'owner', 'staff')
  );

DROP POLICY IF EXISTS dd_task_templates_staff_all ON public.dd_task_templates;
CREATE POLICY dd_task_templates_staff_all
  ON public.dd_task_templates
  FOR ALL
  TO authenticated
  USING (private.dd_is_staff_admin())
  WITH CHECK (private.dd_is_staff_admin());
