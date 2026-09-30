-- Close stale discovery requests when validated or active source coverage already exists.
CREATE OR REPLACE FUNCTION public.dd_reconcile_source_discovery_coverage()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_closed int:=0;
begin
 if current_user not in ('postgres','service_role') then raise exception 'service_role required'; end if;
 with covered as (
   select r.request_key,greatest(coalesce(r.validated_source_count,0),count(s.id)) active_sources
   from public.dd_research_source_discovery_requests r
   left join public.dd_research_sources s on s.program_key=r.program_key and s.status='ACTIVE'
   where r.request_status in ('OPEN','QUEUED')
   group by r.request_key,r.validated_source_count
   having greatest(coalesce(r.validated_source_count,0),count(s.id))>0
 ), upd as (
   update public.dd_research_source_discovery_requests r
   set request_status='VALIDATED',
       validated_source_count=greatest(coalesce(r.validated_source_count,0),c.active_sources),
       metadata=coalesce(r.metadata,'{}'::jsonb)||jsonb_build_object('coverage_reconciled_at',now(),'coverage_reconciler','dd_reconcile_source_discovery_coverage','active_program_sources',c.active_sources),
       updated_at=now()
   from covered c where r.request_key=c.request_key returning r.request_key
 ) select count(*) into v_closed from upd;
 return jsonb_build_object('status','COMPLETED','requests_reconciled',v_closed,'production_mutation',false,'external_contact',false,'invented_sources',false);
end $function$
;
revoke execute on function public.dd_reconcile_source_discovery_coverage() from public,anon,authenticated;
grant execute on function public.dd_reconcile_source_discovery_coverage() to service_role;
CREATE OR REPLACE FUNCTION public.dd_run_autonomous_body_closure_cycle()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
 v_work jsonb; v_operating jsonb; v_external jsonb; v_research jsonb; v_synthesis jsonb; v_delivery jsonb; v_source_coverage jsonb;
 v_safe_recipe uuid; v_advance jsonb; v_audit jsonb; v_safe uuid; v_health uuid; v_automation_health uuid; v_workforce jsonb; v_organism jsonb; v_world_match jsonb;
begin
 select public.dd_refresh_remaining_work_queue() into v_work;
 select public.dd_consume_internal_scheduled_operating_work(10) into v_operating;
 select public.dd_dispatch_external_scheduled_operating_work(20) into v_external;
 select public.dd_reconcile_source_discovery_coverage() into v_source_coverage;
 select public.dd_execute_research_work_v1(8) into v_research;
 select public.dd_run_research_synthesis_worker() into v_synthesis;
 select public.dd_reconcile_world_service_match_research(100) into v_world_match;
 select public.dd_run_synthetic_workforce_machine_economics(100) into v_workforce;
 select public.dd_run_dani_brain_delivery_worker(10,'AUTONOMOUS_BODY_CLOSURE') into v_delivery;
 select public.dd_run_safe_automation_recipes() into v_safe_recipe;
 select public.dd_run_ecosystem_candidate_advancement_controller(50) into v_advance;
 select public.dd_run_active_audit_subproofs(50) into v_audit;
 select public.dd_run_next_safe_runtime_proof() into v_safe;
 select public.dd_run_core_runtime_health_proof() into v_health;
 select public.dd_run_automation_health_supervisor() into v_automation_health;
 select public.dd_refresh_remaining_work_queue() into v_work;
 select public.dd_run_end_to_end_organism_audit() into v_organism;
 return jsonb_build_object('status','COMPLETED','remaining_work_refresh',v_work,'scheduled_operating_work',v_operating,
   'external_operating_handoff',v_external,'source_discovery_reconciliation',v_source_coverage,'research_execution',v_research,'research_synthesis',v_synthesis,'world_service_match_reconciliation',v_world_match,
   'synthetic_workforce_machine_economics',v_workforce,'brain_delivery',v_delivery,'safe_automation_recipe_receipt',v_safe_recipe,
   'candidate_advancement',v_advance,'audit_subproofs',v_audit,'safe_runtime_receipt',v_safe,
   'runtime_health_receipt',v_health,'automation_handoff_health_receipt',v_automation_health,'end_to_end_organism_audit',v_organism,
   'composition_policy','REUSE_EXISTING_WORKERS','production_mutation_authorized',false,
   'external_contact_authorized',false,'money_action_authorized',false);
end $function$
;
