-- Refine whole-organism Bridge semantics and close the research -> synthetic service-match reconciliation seam.
CREATE OR REPLACE FUNCTION public.dd_run_end_to_end_organism_audit()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
 v_body jsonb; v_learning jsonb; v_sbb jsonb; v_auto uuid;
 v_bridge_verified int; v_bridge_observed int; v_promo_verified int; v_promo_open int; v_promo_actionable int; v_promo_held int;
 v_learning_new int; v_learning_test int; v_match_candidates int; v_match_final int;
 v_research_open int; v_status text;
begin
 if current_user not in ('postgres','service_role') then raise exception 'service_role required'; end if;
 v_body:=public.dd_run_whole_body_synthetic_exam();
 v_learning:=public.dd_world_learning_loop_feedback_audit();
 v_sbb:=public.dd_refresh_soul_body_bridge_intelligence_traces();
 select public.dd_run_automation_health_supervisor() into v_auto;
 select count(*) filter(where bridge_status='VERIFIED'),count(*) filter(where bridge_status<>'VERIFIED')
 into v_bridge_verified,v_bridge_observed from public.dd_environment_bridge_receipts where direction='TESTER_TO_PRODUCTION';
 select count(*) filter(where production_verification_status='PASSED'),count(*) filter(where production_verification_status<>'PASSED'),count(*) filter(where classification='PROMOTE_NOW' and production_verification_status<>'PASSED'),count(*) filter(where classification<>'PROMOTE_NOW' and production_verification_status<>'PASSED')
 into v_promo_verified,v_promo_open,v_promo_actionable,v_promo_held from public.dd_promotion_candidates;
 select count(*) filter(where status='NEW'),count(*) filter(where status in ('TEST_REQUIRED','HOLD'))
 into v_learning_new,v_learning_test from public.dd_learning_evidence_intake;
 select count(*),count(*) filter(where match_status='MATCHED' and matched_service_key is not null)
 into v_match_candidates,v_match_final from public.dd_world_service_match_candidates;
 select count(*) into v_research_open from public.dd_research_source_discovery_requests where request_status in ('OPEN','QUEUED');
 v_status:=case
   when (v_body->>'status') not like 'PASS%' then 'FAIL_BODY'
   when v_promo_actionable>0 then 'IN_PROGRESS_BRIDGE'
   when (v_learning->>'status')<>'LEARNING_LOOP_HEALTHY' then 'IN_PROGRESS_LEARNING'
   when coalesce((v_sbb->>'bridge_ready')::int,0)<4 then 'IN_PROGRESS_INTELLIGENCE_BRIDGE'
   when v_research_open>0 then 'IN_PROGRESS_RESEARCH'
   else 'PASS_CLOSED_LOOP' end;
 insert into public.dd_body_exam_receipts(exam_key,status,result,production_mutation)
 values('END_TO_END_ORGANISM_LATEST',v_status,
   jsonb_build_object('status',v_status,'legacy_body_exam',v_body,'learning_loop',v_learning,'soul_body_bridge',v_sbb,
    'environment_bridge',jsonb_build_object('verified',v_bridge_verified,'not_verified',v_bridge_observed),
    'promotion',jsonb_build_object('production_verified',v_promo_verified,'not_verified',v_promo_open,'actionable_unverified',v_promo_actionable,'legitimately_held',v_promo_held),
    'learning_evidence',jsonb_build_object('new',v_learning_new,'test_or_hold',v_learning_test),
    'service_match',jsonb_build_object('candidates',v_match_candidates,'final_matches',v_match_final),
    'open_source_discovery',v_research_open,'automation_health_receipt',v_auto,
    'production_direct_access','NOT_ASSUMED','production_mutation',false,'real_money',false,'external_contact',false),false)
 on conflict(exam_key) do update set status=excluded.status,result=excluded.result,production_mutation=false;
 return jsonb_build_object('status',v_status,'legacy_body_status',v_body->>'status',
   'bridge_verified',v_bridge_verified,'bridge_not_verified',v_bridge_observed,
   'promotion_verified',v_promo_verified,'promotion_not_verified',v_promo_open,'promotion_actionable_unverified',v_promo_actionable,'promotion_legitimately_held',v_promo_held,
   'learning_loop_status',v_learning->>'status','service_match_candidates',v_match_candidates,'final_service_matches',v_match_final,
   'soul_body_bridge_ready',v_sbb->>'bridge_ready','open_source_discovery',v_research_open,
   'production_mutation',false,'real_money',false,'external_contact',false);
end $function$
;
CREATE OR REPLACE FUNCTION public.dd_reconcile_world_service_match_research(p_limit integer DEFAULT 100)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_groups int:=0; v_candidates int:=0;
begin
 if current_user not in ('postgres','service_role') then raise exception 'service_role required'; end if;
 with ready as (
   select s.id,s.work_key,s.evidence_count,s.implementation_payload,
          upper(coalesce(s.implementation_payload->>'recommendation','')) recommendation,
          s.implementation_payload->>'matched_service_key' matched_service_key,
          w.metadata->'candidate_keys' candidate_keys
   from public.dd_research_synthesis_queue s join public.dd_research_work_queue w on w.id=s.research_work_id
   where s.work_key like 'WORLD_SERVICE_MATCH:%' and s.evidence_count>0
     and s.synthesis_state in ('SYNTHESIZED','REVIEW_REQUIRED','READY')
     and upper(coalesce(s.implementation_payload->>'recommendation','')) in ('MATCHED','REJECTED','INCONCLUSIVE')
   order by s.updated_at limit greatest(1,least(coalesce(p_limit,100),500))
 ), expanded as (
   select r.*,jsonb_array_elements_text(coalesce(r.candidate_keys,'[]'::jsonb)) candidate_key from ready r
 ), valid as (
   select e.*,case when e.recommendation='MATCHED' and exists(
     select 1 from public.dd_master_service_universe m where m.canonical_sku=e.matched_service_key
   ) then true when e.recommendation<>'MATCHED' then true else false end valid_result from expanded e
 ), upd as (
   update public.dd_world_service_match_candidates c
   set match_status=case when v.recommendation='MATCHED' and v.valid_result then 'MATCHED' when v.recommendation='REJECTED' then 'REJECTED' else 'INCONCLUSIVE' end,
       matched_service_key=case when v.recommendation='MATCHED' and v.valid_result then v.matched_service_key else null end,
       evidence=coalesce(c.evidence,'{}'::jsonb)||jsonb_build_object('research_work_key',v.work_key,'synthesis_id',v.id,'evidence_count',v.evidence_count,
         'recommendation',case when v.recommendation='MATCHED' and not v.valid_result then 'INCONCLUSIVE_INVALID_SERVICE_KEY' else v.recommendation end,
         'reconciled_at',now(),'synthetic_frequency_is_authority',false,'production_authority_granted',false),
       production_authority=false,updated_at=now()
   from valid v where c.candidate_key=v.candidate_key and c.match_status='RESEARCH_REQUIRED' returning c.candidate_key
 ) select count(*) into v_candidates from upd;
 select count(distinct s.work_key) into v_groups from public.dd_research_synthesis_queue s
 where s.work_key like 'WORLD_SERVICE_MATCH:%' and s.evidence_count>0
 and upper(coalesce(s.implementation_payload->>'recommendation','')) in ('MATCHED','REJECTED','INCONCLUSIVE');
 return jsonb_build_object('status','COMPLETED','eligible_research_groups',v_groups,'candidates_reconciled',v_candidates,
   'production_authority_granted',false,'production_mutation',false,'real_money',false,'external_contact',false);
end $function$
;
revoke execute on function public.dd_reconcile_world_service_match_research(integer) from public,anon,authenticated;
grant execute on function public.dd_reconcile_world_service_match_research(integer) to service_role;
CREATE OR REPLACE FUNCTION public.dd_run_autonomous_body_closure_cycle()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
 v_work jsonb; v_operating jsonb; v_external jsonb; v_research jsonb; v_synthesis jsonb; v_delivery jsonb;
 v_safe_recipe uuid; v_advance jsonb; v_audit jsonb; v_safe uuid; v_health uuid; v_automation_health uuid; v_workforce jsonb; v_organism jsonb; v_world_match jsonb;
begin
 select public.dd_refresh_remaining_work_queue() into v_work;
 select public.dd_consume_internal_scheduled_operating_work(10) into v_operating;
 select public.dd_dispatch_external_scheduled_operating_work(20) into v_external;
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
   'external_operating_handoff',v_external,'research_execution',v_research,'research_synthesis',v_synthesis,'world_service_match_reconciliation',v_world_match,
   'synthetic_workforce_machine_economics',v_workforce,'brain_delivery',v_delivery,'safe_automation_recipe_receipt',v_safe_recipe,
   'candidate_advancement',v_advance,'audit_subproofs',v_audit,'safe_runtime_receipt',v_safe,
   'runtime_health_receipt',v_health,'automation_handoff_health_receipt',v_automation_health,'end_to_end_organism_audit',v_organism,
   'composition_policy','REUSE_EXISTING_WORKERS','production_mutation_authorized',false,
   'external_contact_authorized',false,'money_action_authorized',false);
end $function$
;
