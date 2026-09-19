create or replace function public.dd_create_job_from_work_order(p_work_order_id uuid)
returns public.dd_jobs
language plpgsql
security definer
set search_path=public
as $$
declare
  wo public.dd_work_orders;
  existing public.dd_jobs;
  j public.dd_jobs;
begin
  select * into wo from public.dd_work_orders where id=p_work_order_id;
  if not found then raise exception 'WORK_ORDER_NOT_FOUND'; end if;
  select * into existing from public.dd_jobs where work_order_id=p_work_order_id limit 1;
  if found then return existing; end if;
  insert into public.dd_jobs (
    public_reference, estimate_id, lead_id, service_request_id, division_slug, job_title,
    job_status, location_address, assigned_to, scope_summary, organization_id, work_order_id, contract_id
  ) values (
    wo.work_order_number, null, wo.lead_id, wo.service_request_id,
    null, wo.service_name, 'new', wo.service_address, null,
    coalesce(wo.scope_notes, wo.customer_instructions, wo.service_name),
    null, wo.id, wo.contract_id
  ) returning * into j;
  return j;
end;
$$;
revoke all on function public.dd_create_job_from_work_order(uuid) from public,anon,authenticated;
grant execute on function public.dd_create_job_from_work_order(uuid) to service_role;

create or replace function public.dd_create_fulfillment_from_request(p_request_id uuid)
returns table(work_order_id uuid, job_id uuid, created_work_order boolean, created_job boolean)
language plpgsql
security definer
set search_path=public
as $$
declare
  wo public.dd_work_orders;
  j public.dd_jobs;
  existing_wo public.dd_work_orders;
  existing_job public.dd_jobs;
begin
  select * into existing_wo from public.dd_work_orders where service_request_id=p_request_id order by created_at limit 1;
  if found then
    wo:=existing_wo;
  else
    wo:=public.dd_create_work_order_from_request(p_request_id);
  end if;
  select * into existing_job from public.dd_jobs where work_order_id=wo.id limit 1;
  if found then
    j:=existing_job;
  else
    j:=public.dd_create_job_from_work_order(wo.id);
  end if;
  return query select wo.id,j.id,(existing_wo.id is null),(existing_job.id is null);
end;
$$;
revoke all on function public.dd_create_fulfillment_from_request(uuid) from public,anon,authenticated;
grant execute on function public.dd_create_fulfillment_from_request(uuid) to service_role;

-- Make the staff operations endpoint able to use the existing canonical service-role-only transition.
-- No provider authorization is changed by this migration.
