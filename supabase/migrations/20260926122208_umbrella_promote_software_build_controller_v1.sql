
create or replace function public.dd_run_software_build_controller()
returns uuid language plpgsql security definer set search_path='public','private' as $$
declare v_id uuid:=gen_random_uuid();v_refresh int;v_ready int;v_blocked int;v_passed int;
begin
 insert into public.dd_software_build_runs(id,status) values(v_id,'STARTED');
 select public.dd_refresh_software_build_queue() into v_refresh;
 update public.dd_software_build_work_queue set status='BLOCKED',updated_at=now() where owner_decision_required and status in('QUEUED','READY');
 select count(*) filter(where status='READY'),count(*) filter(where status='BLOCKED'),count(*) filter(where status='PASSED') into v_ready,v_blocked,v_passed from public.dd_software_build_work_queue;
 update public.dd_software_build_runs set status=case when v_ready>0 or v_blocked>0 then 'PARTIAL' else 'COMPLETED' end,queued=v_refresh,ready=v_ready,blocked=v_blocked,passed=v_passed,
 summary=jsonb_build_object('authority','dd_platform_release_audit_10_pass','production_job_authority','dd_jobs','environment','PRODUCTION','test_first',true,'auto_green',false,'direct_production_write',false,'auto_merge',false,'rule','work may be marked PASSED only after authoritative audit evidence is GREEN'),
 completed_at=now() where id=v_id; return v_id;
exception when others then update public.dd_software_build_runs set status='FAILED',summary=jsonb_build_object('error',sqlerrm),completed_at=now() where id=v_id;raise;
end $$;
revoke all on function public.dd_run_software_build_controller() from public,anon,authenticated;
grant execute on function public.dd_run_software_build_controller() to service_role;
select cron.schedule('dd-software-build-controller','14,44 * * * *','select public.dd_run_software_build_controller();')
where not exists(select 1 from cron.job where command='select public.dd_run_software_build_controller();');
