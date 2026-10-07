
create or replace function public.dd_run_unattended_green_controller()
returns uuid
language plpgsql security definer set search_path='public'
as $$
declare
 v_id uuid:=gen_random_uuid(); v_refreshed int:=0; v_review int:=0; v_blocked int:=0;
 v_research int:=0; v_green int:=0; v_non_green int:=0; v_sec uuid; v_sec_status text;
 v_brain jsonb; v_auto boolean:=false; v_kill boolean:=true;
begin
 insert into public.dd_unattended_green_runs(id,run_kind,status) values(v_id,'DETERMINISTIC_RECONCILIATION','STARTED');
 select public.dd_refresh_pricing_research_economics(null) into v_refreshed;
 select count(*) filter(where research_status='REVIEW_READY'),count(*) filter(where research_status='BLOCKED') into v_review,v_blocked from public.dd_service_pricing_research_queue;
 select count(*) into v_research from public.dd_research_work_queue where status not in ('RESOLVED','CLOSED','COMPLETE','COMPLETED');
 select count(*) filter(where status='GREEN'),count(*) filter(where status<>'GREEN') into v_green,v_non_green from public.dd_platform_release_audit_10_pass;
 select public.dd_run_security_regression_proof() into v_sec;
 select status into v_sec_status from public.dd_security_regression_runs where id=v_sec;
 select public.dd_brain_trickle_down() into v_brain;
 select enabled,kill_switch into v_auto,v_kill from public.dd_production_automation_policy where policy_key='DANI_PRODUCTION_AUTOMATION_BOUNDARY';

 update public.dd_unattended_green_runs set
  status=case when v_blocked>0 or v_non_green>0 or v_sec_status<>'PASS' then 'PARTIAL' else 'COMPLETED' end,
  pricing_refreshed=v_refreshed,pricing_review_ready=v_review,pricing_blocked=v_blocked,research_open=v_research,
  platform_green=v_green,platform_non_green=v_non_green,
  summary=jsonb_build_object(
   'principle','green_requires_evidence','pricing_queue_total',(select count(*) from public.dd_service_pricing_research_queue),
   'research_queue_total',(select count(*) from public.dd_research_work_queue),'platform_checks_total',(select count(*) from public.dd_platform_release_audit_10_pass),
   'security_run_id',v_sec,'security_status',v_sec_status,'brain_trickle_down',v_brain,
   'production_automation_enabled',v_auto,'production_kill_switch',v_kill,'chat_middleman_required',false,
   'owner_only_for_governed_boundaries',true),
  completed_at=now() where id=v_id;
 return v_id;
exception when others then
 update public.dd_unattended_green_runs set status='FAILED',summary=jsonb_build_object('error',sqlerrm),completed_at=now() where id=v_id;
 raise;
end $$;
revoke execute on function public.dd_run_unattended_green_controller() from anon, public;
grant execute on function public.dd_run_unattended_green_controller() to authenticated, service_role;
