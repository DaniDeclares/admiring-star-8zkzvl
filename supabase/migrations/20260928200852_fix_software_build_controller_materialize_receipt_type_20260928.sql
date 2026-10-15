
create or replace function public.dd_run_software_build_controller()
returns uuid language plpgsql security definer set search_path='public','private'
as $$
declare v_id uuid:=gen_random_uuid(); v_refresh int; v_ready int; v_blocked int; v_passed int; v_recovered int:=0; v_materialized jsonb:='{}'::jsonb;
begin
 insert into public.dd_software_build_runs(id,status) values(v_id,'STARTED');
 update public.dd_autobuild_candidates
 set executor_state='PENDING',lease_owner=null,leased_at=null,lease_expires_at=null,
     last_error=coalesce(last_error,'')||case when coalesce(last_error,'')='' then '' else ' | ' end||'Expired executor lease recovered automatically at '||now()::text,
     updated_at=now()
 where executor_state='LEASED' and lease_expires_at is not null and lease_expires_at<now();
 get diagnostics v_recovered=row_count;
 select public.dd_materialize_platform_autobuild_candidates() into v_materialized;
 select public.dd_refresh_software_build_queue() into v_refresh;
 update public.dd_software_build_work_queue set status='BLOCKED',updated_at=now() where owner_decision_required and status in ('QUEUED','READY');
 select count(*) filter(where status='READY'),count(*) filter(where status='BLOCKED'),count(*) filter(where status='PASSED')
 into v_ready,v_blocked,v_passed from public.dd_software_build_work_queue;
 update public.dd_software_build_runs set status=case when v_ready>0 or v_blocked>0 then 'PARTIAL' else 'COMPLETED' end,
  queued=v_refresh,ready=v_ready,blocked=v_blocked,passed=v_passed,
  summary=jsonb_build_object('authority','dd_platform_release_audit_10_pass','production_job_authority','dd_jobs','test_first',true,'auto_green',false,
   'expired_autobuild_leases_recovered',v_recovered,'autobuild_materialization',v_materialized,
   'rule','work may be marked PASSED only after authoritative audit evidence is GREEN'),
  completed_at=now() where id=v_id;
 return v_id;
exception when others then
 update public.dd_software_build_runs set status='FAILED',summary=jsonb_build_object('error',sqlerrm),completed_at=now() where id=v_id;
 raise;
end $$;
revoke execute on function public.dd_run_software_build_controller() from anon, public;
grant execute on function public.dd_run_software_build_controller() to authenticated, service_role;
