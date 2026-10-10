
create or replace function public.dd_materialize_job_tasks_from_service(
  p_job_id uuid,
  p_runtime_service_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path=''
as $$
declare
  v_job public.dd_jobs%rowtype;
  v_service public.services%rowtype;
  v_inserted int := 0;
  v_total int := 0;
begin
  select * into v_job from public.dd_jobs where id=p_job_id;
  if v_job.id is null then raise exception 'JOB_NOT_FOUND'; end if;
  select * into v_service from public.services where id=p_runtime_service_id and is_active=true;
  if v_service.id is null then raise exception 'ACTIVE_RUNTIME_SERVICE_NOT_FOUND'; end if;
  if not exists (
    select 1 from public.dd_service_release_contract_v1 r
    where r.runtime_service_id=p_runtime_service_id
      and r.release_state='LIVE_READY' and r.blocking_gate='NONE'
  ) then raise exception 'SERVICE_NOT_LIVE_READY'; end if;
  insert into public.dd_job_tasks(job_id,template_id,task_name,task_type,status,sort_order,notes,is_required,evidence_required,evidence_ref)
  select p_job_id,t.id,t.task_name,t.task_type,'open',t.sort_order,t.notes,t.is_required,t.evidence_required,
         case when t.evidence_required then coalesce(t.evidence_spec->>'type','REQUIRED_EVIDENCE') else null end
  from public.dd_task_templates t
  where t.service_id=p_runtime_service_id and t.is_active=true
  on conflict (job_id,template_id) where template_id is not null do nothing;
  get diagnostics v_inserted = row_count;
  select count(*) into v_total from public.dd_job_tasks where job_id=p_job_id;
  return jsonb_build_object('job_id',p_job_id,'runtime_service_id',p_runtime_service_id,'canonical_sku',v_service.sku,
    'inserted',v_inserted,'total_job_tasks',v_total,'idempotent',true,'external_delivery_authorized',false);
end $$;

create or replace function public.dd_resolve_request_service_and_materialize_tasks(p_job_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path=''
as $$
declare
  v_job public.dd_jobs%rowtype; v_req public.service_requests%rowtype;
  v_sku text; v_service_id uuid; v_matches int; v_templates int; v_mat jsonb;
begin
  select * into v_job from public.dd_jobs where id=p_job_id;
  if v_job.id is null then raise exception 'JOB_NOT_FOUND'; end if;
  if v_job.service_request_id is null then raise exception 'SERVICE_REQUEST_REQUIRED'; end if;
  select * into v_req from public.service_requests where id=v_job.service_request_id;
  if v_req.id is null then raise exception 'SERVICE_REQUEST_NOT_FOUND'; end if;
  if v_req.service_id is not null then v_service_id:=v_req.service_id;
  else
    select x->>'sku' into v_sku
    from jsonb_array_elements(coalesce(v_req.scope_snapshot->'scope','[]'::jsonb)) x
    where nullif(x->>'sku','') is not null limit 1;
    if v_sku is null then raise exception 'CANONICAL_SKU_REQUIRED'; end if;
    select count(*),(array_agg(r.runtime_service_id order by r.runtime_service_id::text))[1]
      into v_matches,v_service_id
    from public.dd_service_release_contract_v1 r
    where r.canonical_sku=v_sku and r.runtime_service_id is not null;
    if v_matches<>1 or v_service_id is null then raise exception 'RUNTIME_SERVICE_RESOLUTION_AMBIGUOUS'; end if;
  end if;
  select count(*) into v_templates from public.dd_task_templates t where t.service_id=v_service_id and t.is_active=true;
  if v_templates=0 then raise exception 'ACTIVE_TASK_TEMPLATES_REQUIRED'; end if;
  v_mat:=public.dd_materialize_job_tasks_from_service(p_job_id,v_service_id);
  update public.service_requests set service_id=v_service_id,updated_at=now() where id=v_req.id and service_id is null;
  return v_mat || jsonb_build_object('service_request_id',v_req.id,'resolved_from_scope_snapshot',v_req.service_id is null,
    'canonical_sku',coalesce(v_sku,(select sku from public.services where id=v_service_id)),'active_template_count',v_templates);
end $$;

revoke all on function public.dd_materialize_job_tasks_from_service(uuid,uuid) from public,anon,authenticated;
revoke all on function public.dd_resolve_request_service_and_materialize_tasks(uuid) from public,anon,authenticated;
grant execute on function public.dd_materialize_job_tasks_from_service(uuid,uuid) to service_role;
grant execute on function public.dd_resolve_request_service_and_materialize_tasks(uuid) to service_role;
