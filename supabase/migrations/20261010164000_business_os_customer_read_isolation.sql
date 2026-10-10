-- DANI Business OS: additive customer organization isolation, REVIEW ONLY.
-- Does not backfill existing CRM records or grant client INSERT/UPDATE/DELETE.
-- Apply first in isolated Tester only after approval and clean replay review.

ALTER TABLE public.dd_sales_queue
  ADD COLUMN IF NOT EXISTS organization_id uuid
  REFERENCES public.dd_client_organizations(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS dd_sales_queue_customer_organization_idx
  ON public.dd_sales_queue (organization_id)
  WHERE organization_id IS NOT NULL;

-- Authorization is computed from the verified JWT's auth.uid(), NEVER from
-- a user ID or claim furnished inside a CRM or workflow payload.
-- Only explicitly assigned customer roles qualify; DANI staff and providers do not.
CREATE OR REPLACE FUNCTION private.dd_customer_org_member(p_org_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT p_org_id IS NOT NULL
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.dd_portal_identities i
      JOIN public.dd_client_organizations o ON o.id = i.organization_id
      WHERE i.auth_user_id = auth.uid()
        AND i.organization_id = p_org_id
        AND i.is_active = true
        AND i.portal_role IN ('customer','client','customer_admin','client_admin')
        AND upper(o.status) = 'ACTIVE'
    );
$function$;

REVOKE ALL ON FUNCTION private.dd_customer_org_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.dd_customer_org_member(uuid) TO authenticated;

-- Read-only tenant scopes. Preserve current staff/provider policies intact.
-- Unassigned legacy sales rows (organization_id IS NULL) remain invisible.
DROP POLICY IF EXISTS dd_sales_queue_customer_org_read ON public.dd_sales_queue;
CREATE POLICY dd_sales_queue_customer_org_read ON public.dd_sales_queue
  FOR SELECT TO authenticated
  USING (private.dd_customer_org_member(organization_id));

DROP POLICY IF EXISTS dd_client_organizations_member_read ON public.dd_client_organizations;
CREATE POLICY dd_client_organizations_member_read ON public.dd_client_organizations
  FOR SELECT TO authenticated
  USING (private.dd_customer_org_member(id));

DROP POLICY IF EXISTS dd_jobs_customer_org_read ON public.dd_jobs;
CREATE POLICY dd_jobs_customer_org_read ON public.dd_jobs
  FOR SELECT TO authenticated
  USING (private.dd_customer_org_member(organization_id));

-- IMPORTANT: no external action outbox policies or signed-storage access
-- are opened here. These require separate authorization and negative proofs.
