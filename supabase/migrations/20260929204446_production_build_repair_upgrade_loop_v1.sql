create or replace function private.dd_verify_production_commercial_architecture()
returns jsonb
language plpgsql
security definer
set search_path='public','pg_catalog'
as $$
declare v_channels jsonb; v_divisions int; v_ok boolean;
begin
 select coalesce(jsonb_object_agg(code,name order by code),'{}'::jsonb)
 into v_channels from public.dd_commercial_channels where is_active;
 select count(*) into v_divisions from public.divisions where is_active;
 v_ok := v_channels=jsonb_build_object(
  'CH01','Resident Concierge',
  'CH02','Property Management & Apartments',
  'CH03','Real Estate Offices & Brokerages',
  'CH04','Businesses',
  'CH05','Government & Institutional Procurement'
 ) and v_divisions=13;
 return jsonb_build_object(
  'status',case when v_ok then 'PASS' else 'FAIL' end,
  'channels',v_channels,
  'ch01_paths',jsonb_build_array('DIRECT_B2C','PROPERTY_ACTIVATED_B2B2C'),
  'approved_active_divisions',v_divisions,
  'division_change_state','NOT_APPROVED',
  'fail_closed',true
 );
end $$;
revoke all on function private.dd_verify_production_commercial_architecture() from public,anon,authenticated;
grant execute on function private.dd_verify_production_commercial_architecture() to service_role;

create or replace function private.dd_run_production_build_repair_upgrade_loop()
returns jsonb
language plpgsql
security definer
set search_path='public','private','pg_catalog'
as $$
declare
 v_arch jsonb; v_sec uuid; v_sec_status text; v_commercial jsonb;
 v_materialized jsonb; v_manifests jsonb; v_brain jsonb;
 v_auto boolean:=false; v_kill boolean:=true; v_status text:='COMPLETED';
begin
 select enabled,kill_switch into v_auto,v_kill
 from public.dd_production_automation_policy
 where policy_key='DANI_PRODUCTION_AUTOMATION_BOUNDARY';

 v_arch:=private.dd_verify_production_commercial_architecture();
 v_sec:=public.dd_run_security_regression_proof();
 select status into v_sec_status from public.dd_security_regression_runs where id=v_sec;

 if not coalesce(v_auto,false) or coalesce(v_kill,true) then
   return jsonb_build_object('status','HELD_BY_PRODUCTION_AUTOMATION_POLICY','architecture',v_arch,'security_status',v_sec_status,'production_automation_enabled',v_auto,'kill_switch',v_kill);
 end if;

 if v_arch->>'status'<>'PASS' or v_sec_status<>'PASS' then
   return jsonb_build_object('status','BLOCKED_FAIL_CLOSED','architecture',v_arch,'security_run_id',v_sec,'security_status',v_sec_status,'permission_expansion',false,'money_action',false,'external_contact',false);
 end if;

 v_commercial:=public.dd_run_commercial_intelligence_cycle();
 v_materialized:=public.dd_materialize_platform_autobuild_candidates();
 v_manifests:=public.dd_compile_safe_autobuild_manifests(10);
 v_brain:=public.dd_brain_trickle_down();

 return jsonb_build_object(
  'status',v_status,
  'architecture',v_arch,
  'security_run_id',v_sec,'security_status',v_sec_status,
  'commercial_intelligence',v_commercial,
  'autobuild_candidates',v_materialized,
  'safe_manifests',v_manifests,
  'brain_trickle_down',v_brain,
  'repair_boundary','EXISTING_GOVERNED_PRODUCTION_WORKERS_ONLY',
  'permission_expansion',false,'money_action',false,'external_contact',false,
  'publish_unverified_pricing',false,'publish_unverified_service',false
 );
end $$;
revoke all on function private.dd_run_production_build_repair_upgrade_loop() from public,anon,authenticated;
grant execute on function private.dd_run_production_build_repair_upgrade_loop() to service_role;

create or replace function public.dd_run_unattended_green_controller()
returns uuid
language plpgsql
security definer
set search_path='public','private','pg_catalog'
as $$
declare
 v_id uuid:=gen_random_uuid(); v_refreshed int:=0; v_review int:=0; v_blocked int:=0;
 v_research int:=0; v_green int:=0; v_non_green int:=0; v_loop jsonb;
begin
 insert into public.dd_unattended_green_runs(id,run_kind,status)
 values(v_id,'DETERMINISTIC_RECONCILIATION','STARTED');

 v_loop:=private.dd_run_production_build_repair_upgrade_loop();
 select public.dd_refresh_pricing_research_economics(null) into v_refreshed;
 select count(*) filter(where research_status='REVIEW_READY'),count(*) filter(where research_status='BLOCKED')
 into v_review,v_blocked from public.dd_service_pricing_research_queue;
 select count(*) into v_research from public.dd_research_work_queue
 where status not in ('RESOLVED','CLOSED','COMPLETE','COMPLETED');
 select count(*) filter(where status='GREEN'),count(*) filter(where status<>'GREEN')
 into v_green,v_non_green from public.dd_platform_release_audit_10_pass;

 update public.dd_unattended_green_runs set
  status=case when coalesce(v_loop->>'status','FAILED')<>'COMPLETED' or v_blocked>0 or v_non_green>0 then 'PARTIAL' else 'COMPLETED' end,
  pricing_refreshed=v_refreshed,pricing_review_ready=v_review,pricing_blocked=v_blocked,research_open=v_research,
  platform_green=v_green,platform_non_green=v_non_green,
  summary=jsonb_build_object(
   'principle','prove_remember_repair_verify',
   'production_build_repair_upgrade_loop',v_loop,
   'pricing_queue_total',(select count(*) from public.dd_service_pricing_research_queue),
   'research_queue_total',(select count(*) from public.dd_research_work_queue),
   'platform_checks_total',(select count(*) from public.dd_platform_release_audit_10_pass),
   'owner_only_for_governed_boundaries',true
  ),
  completed_at=now() where id=v_id;
 return v_id;
exception when others then
 update public.dd_unattended_green_runs set status='FAILED',summary=jsonb_build_object('error',sqlerrm),completed_at=now() where id=v_id;
 raise;
end $$;
revoke all on function public.dd_run_unattended_green_controller() from public,anon,authenticated;
grant execute on function public.dd_run_unattended_green_controller() to service_role;
