create or replace function public.dd_run_unattended_green_controller()
returns uuid language plpgsql security definer set search_path=public,private,pg_catalog as $$
declare v_id uuid:=gen_random_uuid(); v_refreshed int:=0; v_review int:=0; v_blocked int:=0; v_research int:=0; v_green int:=0; v_non_green int:=0; v_loop jsonb; v_revenue_run uuid; v_revenue_status text; v_revenue_progress int:=0;
begin
 insert into public.dd_unattended_green_runs(id,run_kind,status) values(v_id,'REVENUE_FIRST_RECONCILIATION','STARTED');
 -- Revenue funnel goes first. Research inside that controller is conditional on insufficient verified/matched funnel inventory.
 v_revenue_run:=public.dd_run_revenue_first_autonomy();
 select status,revenue_progress_score into v_revenue_status,v_revenue_progress from public.dd_revenue_autonomy_runs where id=v_revenue_run;
 v_loop:=private.dd_run_production_build_repair_upgrade_loop();
 select public.dd_refresh_pricing_research_economics(null) into v_refreshed;
 select count(*) filter(where research_status='REVIEW_READY'),count(*) filter(where research_status='BLOCKED') into v_review,v_blocked from public.dd_service_pricing_research_queue;
 select count(*) into v_research from public.dd_research_work_queue where status not in ('RESOLVED','CLOSED','COMPLETE','COMPLETED');
 select count(*) filter(where status='GREEN'),count(*) filter(where status<>'GREEN') into v_green,v_non_green from public.dd_platform_release_audit_10_pass;
 update public.dd_unattended_green_runs set status=case when coalesce(v_loop->>'status','FAILED')<>'COMPLETED' or v_blocked>0 or v_non_green>0 then 'PARTIAL' else 'COMPLETED' end,pricing_refreshed=v_refreshed,pricing_review_ready=v_review,pricing_blocked=v_blocked,research_open=v_research,platform_green=v_green,platform_non_green=v_non_green,summary=jsonb_build_object('principle','revenue_progress_first_then_prove_remember_repair_verify','revenue_autonomy_run_id',v_revenue_run,'revenue_autonomy_status',v_revenue_status,'revenue_progress_score',v_revenue_progress,'production_build_repair_upgrade_loop',v_loop,'pricing_queue_total',(select count(*) from public.dd_service_pricing_research_queue),'research_queue_total',(select count(*) from public.dd_research_work_queue),'platform_checks_total',(select count(*) from public.dd_platform_release_audit_10_pass),'owner_only_for_governed_boundaries',true),completed_at=now() where id=v_id;
 return v_id;
exception when others then update public.dd_unattended_green_runs set status='FAILED',summary=jsonb_build_object('error',sqlerrm),completed_at=now() where id=v_id; raise;
end $$;
revoke all on function public.dd_run_unattended_green_controller() from public,anon,authenticated;
grant execute on function public.dd_run_unattended_green_controller() to service_role,postgres;
