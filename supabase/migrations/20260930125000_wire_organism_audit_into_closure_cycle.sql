-- Every autonomous closure cycle now reports whole-organism state, not only body-local completion.
CREATE OR REPLACE FUNCTION public.dd_run_autonomous_body_closure_cycle()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
 v_work jsonb; v_operating jsonb; v_external jsonb; v_research jsonb; v_synthesis jsonb; v_delivery jsonb;
 v_safe_recipe uuid; v_advance jsonb; v_audit jsonb; v_safe uuid; v_health uuid; v_automation_health uuid; v_workforce jsonb; v_organism jsonb;
begin
 select public.dd_refresh_remaining_work_queue() into v_work;
 select public.dd_consume_internal_scheduled_operating_work(10) into v_operating;
 select public.dd_dispatch_external_scheduled_operating_work(20) into v_external;
 select public.dd_execute_research_work_v1(8) into v_research;
 select public.dd_run_research_synthesis_worker() into v_synthesis;
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
   'external_operating_handoff',v_external,'research_execution',v_research,'research_synthesis',v_synthesis,
   'synthetic_workforce_machine_economics',v_workforce,'brain_delivery',v_delivery,'safe_automation_recipe_receipt',v_safe_recipe,
   'candidate_advancement',v_advance,'audit_subproofs',v_audit,'safe_runtime_receipt',v_safe,
   'runtime_health_receipt',v_health,'automation_handoff_health_receipt',v_automation_health,'end_to_end_organism_audit',v_organism,
   'composition_policy','REUSE_EXISTING_WORKERS','production_mutation_authorized',false,
   'external_contact_authorized',false,'money_action_authorized',false);
end $function$
;
