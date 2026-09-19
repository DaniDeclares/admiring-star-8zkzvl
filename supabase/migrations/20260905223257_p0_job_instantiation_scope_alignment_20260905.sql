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
  r public.service_requests;
  svc public.services;
  div public.divisions;
begin
  select * into wo from public.dd_work_orders where id=p_work_order_id;
  if not found then raise exception 'WORK_ORDER_NOT_FOUND'; end if;
  select * into existing from public.dd_jobs where work_order_id=p_work_order_id limit 1;
  if found then return existing; end if;
  if wo.service_request_id is not null then select * into r from public.service_requests where id=wo.service_request_id; end if;
  if wo.service_id is not null then select * into svc from public.services where id=wo.service_id; elsif r.service_id is not null then select * into svc from public.services where id=r.service_id; end if;
  if svc.division_id is not null then select * into div from public.divisions where id=svc.division_id; elsif r.division_id is not null then select * into div from public.divisions where id=r.division_id; end if;
  if div.slug is null then raise exception 'JOB_DIVISION_REQUIRED'; end if;
  insert into public.dd_jobs (
    public_reference, estimate_id, lead_id, service_request_id, division_slug, job_title,
    job_status, location_address, assigned_to, scope_summary, organization_id, work_order_id, contract_id
  ) values (
    wo.work_order_number, null, wo.lead_id, wo.service_request_id,
    div.slug, wo.service_name, 'new', wo.service_address, null,
    coalesce(wo.scope_notes, wo.customer_instructions, wo.service_name),
    r.organization_id, wo.id, wo.contract_id
  ) returning * into j;
  return j;
end;
$$;
revoke all on function public.dd_create_job_from_work_order(uuid) from public,anon,authenticated;
grant execute on function public.dd_create_job_from_work_order(uuid) to service_role;