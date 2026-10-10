
create or replace function public.dd_materialize_job_tasks_from_service(
  p_job_id uuid,p_runtime_service_id uuid
) returns jsonb
language plpgsql security invoker set search_path=''
as $$
declare v_job public.dd_jobs%rowtype; v_service public.services%rowtype; v_inserted int:=0; v_total int:=0;
begin
 select * into v_job from public.dd_jobs where id=p_job_id;
 if v_job.id is null then raise exception 'JOB_NOT_FOUND'; end if;
 select * into v_service from public.services where id=p_runtime_service_id and is_active=true;
 if v_service.id is null then raise exception 'ACTIVE_RUNTIME_SERVICE_NOT_FOUND'; end if;
 if not exists(select 1 from public.dd_service_release_contract_v1 r where r.runtime_service_id=p_runtime_service_id and r.release_state='LIVE_READY' and r.blocking_gate='NONE')
 then raise exception 'SERVICE_NOT_LIVE_READY'; end if;
 insert into public.dd_job_tasks(job_id,template_id,task_name,task_type,status,sort_order,notes,is_required,evidence_required,evidence_ref)
 select p_job_id,t.id,t.task_name,t.task_type,'open',t.sort_order,t.notes,t.is_required,t.evidence_required,
        case when t.evidence_required then coalesce(t.evidence_spec->>'type','REQUIRED_EVIDENCE') else null end
 from public.dd_task_templates t
 where t.service_id=p_runtime_service_id and t.is_active=true
   and not exists(select 1 from public.dd_job_tasks jt where jt.job_id=p_job_id and jt.template_id=t.id);
 get diagnostics v_inserted=row_count;
 select count(*) into v_total from public.dd_job_tasks where job_id=p_job_id;
 return jsonb_build_object('job_id',p_job_id,'runtime_service_id',p_runtime_service_id,'canonical_sku',v_service.sku,
   'inserted',v_inserted,'total_job_tasks',v_total,'idempotent',true,'external_delivery_authorized',false);
end $$;
revoke all on function public.dd_materialize_job_tasks_from_service(uuid,uuid) from public,anon,authenticated;
grant execute on function public.dd_materialize_job_tasks_from_service(uuid,uuid) to service_role;
