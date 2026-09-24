-- DANI DECLARES P0 alignment: provider intake + fulfillment state vocabulary.
-- This migration is intentionally additive/fail-closed. It does not create a competing provider model.

-- Canonical provider recruitment path is the newer provider application model.
-- Legacy provider-network-intake remains database-compatible for historical callers, but is explicitly
-- marked noncanonical at the API/documentation layer rather than deleting historical records.

create or replace function public.dd_create_work_order_from_request(p_request_id uuid)
returns public.dd_work_orders
language plpgsql
security definer
set search_path = public
as $$
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

  select coalesce(max((substring(work_order_number from 5))::bigint),0)+1
    into next_num
  from public.dd_work_orders
  where work_order_number ~ '^DDWO-[0-9]+$';

  insert into public.dd_work_orders (
    work_order_number, service_request_id, lead_id, service_id, offer_sku, service_name,
    customer_name, customer_email, customer_phone, organization_name, service_address,
    scope_notes, customer_instructions, provider_instructions, customer_price, status
  ) values (
    'DDWO-' || lpad(next_num::text,6,'0'), r.id, r.lead_id, r.service_id,
    s.sku, coalesce(s.name, r.service_needed, r.service_category, 'Service Request'),
    l.full_name, l.email, l.phone, l.organization_name, r.location_address,
    coalesce(r.request_details, r.service_needed), null, null, r.quote_amount, 'INSTANTIATED'
  ) returning * into wo;

  return wo;
end;
$$;

revoke all on function public.dd_create_work_order_from_request(uuid) from public, anon, authenticated;
grant execute on function public.dd_create_work_order_from_request(uuid) to service_role;

-- Keep automated dispatch behind service_role and align provider activation gates.
revoke all on function public.dd_dispatch_eligible_jobs(integer) from public, anon, authenticated;
grant execute on function public.dd_dispatch_eligible_jobs(integer) to service_role;
