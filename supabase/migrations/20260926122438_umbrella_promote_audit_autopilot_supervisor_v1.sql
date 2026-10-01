
create or replace function public.dd_run_audit_autopilot_supervisor() returns uuid language plpgsql security definer set search_path='public' as $$
declare v_run uuid:=gen_random_uuid();v_work public.dd_software_build_work_queue%rowtype;v_proof uuid;v_subproofs jsonb;v_runnable int:=0;v_blocked int:=0;v_owner int:=0;v_action text:='NO_RUNNABLE_WORK';
begin
 insert into public.dd_audit_autopilot_runs(id) values(v_run);
 perform public.dd_requeue_expired_external_action_leases();perform public.dd_run_unattended_green_controller();perform public.dd_run_software_build_controller();perform public.dd_run_company_controller();
 select public.dd_run_core_runtime_health_proof() into v_proof;select public.dd_run_active_audit_subproofs(3) into v_subproofs;v_action:='PROOFS_EXECUTED';
 select * into v_work from public.dd_software_build_work_queue where status='READY' and owner_decision_required=false and execution_mode='CODE_BUILD'
 order by case priority when 'P0' then 0 when 'P1' then 1 else 2 end,pass_number,updated_at,id limit 1 for update skip locked;
 if found then update public.dd_software_build_work_queue set last_result=coalesce(last_result,'{}'::jsonb)||jsonb_build_object('autopilot_run',v_run,'classification','AWAITING_GOVERNED_PR_EXECUTOR','safe_to_auto_promote',false,'reason','Code build requires isolated branch, PR and CI evidence; SQL supervisor will not author, merge, or deploy code.'),updated_at=now() where id=v_work.id;end if;
 select count(*) filter(where status='READY' and owner_decision_required=false),count(*) filter(where status='BLOCKED'),count(*) filter(where status='BLOCKED' and owner_decision_required=true) into v_runnable,v_blocked,v_owner from public.dd_software_build_work_queue;
 update public.dd_audit_autopilot_runs set completed_at=now(),status='COMPLETED',selected_work_id=v_work.id,selected_work_key=v_work.work_key,selected_execution_mode=v_work.execution_mode,action_taken=v_action,runnable_count=v_runnable,blocked_count=v_blocked,owner_blocked_count=v_owner,
 evidence=jsonb_build_object('core_health_receipt',v_proof,'subproofs',v_subproofs,'environment','PRODUCTION','test_first',true,'production_direct_write',false,'auto_merge',false,'auto_deploy',false,'customer_provider_side_effects',false,'prices_changed',false,'money_moved',false) where id=v_run;
 return v_run;
exception when others then update public.dd_audit_autopilot_runs set completed_at=now(),status='FAILED',evidence=jsonb_build_object('error',sqlerrm) where id=v_run;raise;
end $$;
revoke all on function public.dd_run_audit_autopilot_supervisor() from public,anon,authenticated;grant execute on function public.dd_run_audit_autopilot_supervisor() to service_role;
select cron.schedule('dd-audit-autopilot-supervisor','18,48 * * * *','select public.dd_run_audit_autopilot_supervisor();') where not exists(select 1 from cron.job where command='select public.dd_run_audit_autopilot_supervisor();');
