-- Internal execution tables: enable RLS and allow only active staff/procurement users.
ALTER TABLE public.dd_work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_stripe_catalog_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_business_decision_register ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS staff_admin_all_dd_work_orders ON public.dd_work_orders;
CREATE POLICY staff_admin_all_dd_work_orders ON public.dd_work_orders
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.dd_portal_identities pi
  WHERE pi.auth_user_id = (SELECT auth.uid())
    AND pi.is_active = true
    AND pi.portal_role = ANY (ARRAY['staff_admin','procurement']::text[])
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.dd_portal_identities pi
  WHERE pi.auth_user_id = (SELECT auth.uid())
    AND pi.is_active = true
    AND pi.portal_role = ANY (ARRAY['staff_admin','procurement']::text[])
));

DROP POLICY IF EXISTS staff_admin_all_dd_stripe_catalog_sync ON public.dd_stripe_catalog_sync;
CREATE POLICY staff_admin_all_dd_stripe_catalog_sync ON public.dd_stripe_catalog_sync
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.dd_portal_identities pi
  WHERE pi.auth_user_id = (SELECT auth.uid())
    AND pi.is_active = true
    AND pi.portal_role = ANY (ARRAY['staff_admin','procurement']::text[])
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.dd_portal_identities pi
  WHERE pi.auth_user_id = (SELECT auth.uid())
    AND pi.is_active = true
    AND pi.portal_role = ANY (ARRAY['staff_admin','procurement']::text[])
));

DROP POLICY IF EXISTS staff_admin_all_dd_business_decision_register ON public.dd_business_decision_register;
CREATE POLICY staff_admin_all_dd_business_decision_register ON public.dd_business_decision_register
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.dd_portal_identities pi
  WHERE pi.auth_user_id = (SELECT auth.uid())
    AND pi.is_active = true
    AND pi.portal_role = ANY (ARRAY['staff_admin','procurement']::text[])
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.dd_portal_identities pi
  WHERE pi.auth_user_id = (SELECT auth.uid())
    AND pi.is_active = true
    AND pi.portal_role = ANY (ARRAY['staff_admin','procurement']::text[])
));

-- The work-order creation RPC is a privileged internal action. Keep the function
-- SECURITY DEFINER, but prevent anonymous execution and enforce the staff gate inside it.
REVOKE EXECUTE ON FUNCTION public.dd_create_work_order_from_request(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.dd_create_work_order_from_request(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.dd_create_work_order_from_request(p_request_id uuid)
RETURNS public.dd_work_orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  r public.service_requests;
  l public.leads;
  s public.services;
  wo public.dd_work_orders;
  next_num bigint;
begin
  if not exists (
    select 1 from public.dd_portal_identities pi
    where pi.auth_user_id = (select auth.uid())
      and pi.is_active = true
      and pi.portal_role = any (array['staff_admin','procurement']::text[])
  ) then
    raise exception 'FORBIDDEN';
  end if;

  select * into r from public.service_requests where id = p_request_id;
  if not found then raise exception 'SERVICE_REQUEST_NOT_FOUND'; end if;
  if r.lead_id is not null then select * into l from public.leads where id = r.lead_id; end if;
  if r.service_id is not null then select * into s from public.services where id = r.service_id; end if;
  select coalesce(max((substring(work_order_number from 5))::bigint),0)+1 into next_num from public.dd_work_orders where work_order_number ~ '^DDWO-[0-9]+$';
  insert into public.dd_work_orders (
    work_order_number, service_request_id, lead_id, service_id, offer_sku, service_name,
    customer_name, customer_email, customer_phone, organization_name, service_address,
    scope_notes, customer_instructions, provider_instructions, customer_price, status
  ) values (
    'DDWO-' || lpad(next_num::text,6,'0'), r.id, r.lead_id, r.service_id,
    s.sku, coalesce(s.name, r.service_needed, r.service_category, 'Service Request'),
    l.full_name, l.email, l.phone, l.organization_name, r.location_address,
    coalesce(r.request_details, r.service_needed), null, null, r.quote_amount, 'DRAFT'
  ) returning * into wo;
  return wo;
end;
$function$;

REVOKE EXECUTE ON FUNCTION public.dd_create_work_order_from_request(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.dd_create_work_order_from_request(uuid) TO authenticated;