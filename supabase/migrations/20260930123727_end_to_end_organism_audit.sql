-- Whole-organism audit supersedes the legacy 16-interface body-only PASS as the end-to-end health signal.
-- It composes existing body, Bridge, Production-feedback, learning-loop, intelligence and research health without Production mutation.
CREATE OR REPLACE FUNCTION public.dd_run_end_to_end_organism_audit()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
 v_body jsonb; v_learning jsonb; v_sbb jsonb; v_auto uuid;
 v_bridge_verified int; v_bridge_observed int; v_promo_verified int; v_promo_open int;
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
 select count(*) filter(where production_verification_status='PASSED'),count(*) filter(where production_verification_status<>'PASSED')
 into v_promo_verified,v_promo_open from public.dd_promotion_candidates;
 select count(*) filter(where status='NEW'),count(*) filter(where status in ('TEST_REQUIRED','HOLD'))
 into v_learning_new,v_learning_test from public.dd_learning_evidence_intake;
 select count(*),count(*) filter(where match_status='MATCHED' and matched_service_key is not null)
 into v_match_candidates,v_match_final from public.dd_world_service_match_candidates;
 select count(*) into v_research_open from public.dd_research_source_discovery_requests where request_status in ('OPEN','QUEUED');
 v_status:=case
   when (v_body->>'status') not like 'PASS%' then 'FAIL_BODY'
   when v_bridge_observed>0 or v_promo_open>0 then 'IN_PROGRESS_BRIDGE'
   when (v_learning->>'status')<>'LEARNING_LOOP_HEALTHY' then 'IN_PROGRESS_LEARNING'
   when coalesce((v_sbb->>'bridge_ready')::int,0)<4 then 'IN_PROGRESS_INTELLIGENCE_BRIDGE'
   when v_research_open>0 then 'IN_PROGRESS_RESEARCH'
   else 'PASS_CLOSED_LOOP' end;
 insert into public.dd_body_exam_receipts(exam_key,status,result,production_mutation)
 values('END_TO_END_ORGANISM_LATEST',v_status,
   jsonb_build_object('status',v_status,'legacy_body_exam',v_body,'learning_loop',v_learning,'soul_body_bridge',v_sbb,
    'environment_bridge',jsonb_build_object('verified',v_bridge_verified,'not_verified',v_bridge_observed),
    'promotion',jsonb_build_object('production_verified',v_promo_verified,'not_verified',v_promo_open),
    'learning_evidence',jsonb_build_object('new',v_learning_new,'test_or_hold',v_learning_test),
    'service_match',jsonb_build_object('candidates',v_match_candidates,'final_matches',v_match_final),
    'open_source_discovery',v_research_open,'automation_health_receipt',v_auto,
    'production_direct_access','NOT_ASSUMED','production_mutation',false,'real_money',false,'external_contact',false),false)
 on conflict(exam_key) do update set status=excluded.status,result=excluded.result,production_mutation=false;
 return jsonb_build_object('status',v_status,'legacy_body_status',v_body->>'status',
   'bridge_verified',v_bridge_verified,'bridge_not_verified',v_bridge_observed,
   'promotion_verified',v_promo_verified,'promotion_not_verified',v_promo_open,
   'learning_loop_status',v_learning->>'status','service_match_candidates',v_match_candidates,'final_service_matches',v_match_final,
   'soul_body_bridge_ready',v_sbb->>'bridge_ready','open_source_discovery',v_research_open,
   'production_mutation',false,'real_money',false,'external_contact',false);
end $function$
;

revoke execute on function public.dd_run_end_to_end_organism_audit() from public,anon,authenticated;
grant execute on function public.dd_run_end_to_end_organism_audit() to service_role;
