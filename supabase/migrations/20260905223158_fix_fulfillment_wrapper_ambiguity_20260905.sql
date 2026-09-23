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
  made_wo boolean := false;
  made_job boolean := false;
begin
  select w.* into existing_wo from public.dd_work_orders w where w.service_request_id=p_request_id order by w.created_at limit 1;
  if found then wo:=existing_wo; else wo:=public.dd_create_work_order_from_request(p_request_id); made_wo:=true; end if;
  select j0.* into existing_job from public.dd_jobs j0 where j0.work_order_id=wo.id limit 1;
  if found then j:=existing_job; else j:=public.dd_create_job_from_work_order(wo.id); made_job:=true; end if;
  return query select wo.id,j.id,made_wo,made_job;
end;
$$;
revoke all on function public.dd_create_fulfillment_from_request(uuid) from public,anon,authenticated;
grant execute on function public.dd_create_fulfillment_from_request(uuid) to service_role;