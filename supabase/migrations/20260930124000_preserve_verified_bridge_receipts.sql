-- Bridge receipts are monotonic: periodic Tester capture cannot downgrade reconciled VERIFIED Production feedback.
CREATE OR REPLACE FUNCTION public.dd_capture_tester_promotion_outbound()
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare n int:=0;
begin
 insert into public.dd_environment_bridge_receipts(bridge_key,direction,artifact_type,artifact_key,source_environment,target_environment,source_state,target_state,bridge_status,requires_owner_approval,autonomous_mutation_allowed)
 select 'TESTER_PROMOTION:'||p.candidate_key,'TESTER_TO_PRODUCTION','PROMOTION_CANDIDATE',p.candidate_key,'TESTER','PRODUCTION',
 jsonb_build_object('component_domain',p.component_domain,'component_name',p.component_name,'source_reference',p.source_reference,'classification',p.classification,'proof_status',p.proof_status,'dependency_status',p.dependency_status,'security_status',p.security_status,'production_diff_status',p.production_diff_status,'rollback_status',p.rollback_status,'owner_approval_status',p.owner_approval_status,'production_verification_status',p.production_verification_status,'blocking_reason',p.blocking_reason,'evidence',p.evidence),
 jsonb_build_object('intended_action','PRODUCTION_PREFLIGHT_AND_PROMOTION_RECONCILIATION','tester_authority_over_production',false),
 case when g.promotion_authorized then 'QUEUED' else 'OBSERVED' end,true,false
 from public.dd_promotion_candidates p join public.dd_promotion_gate_v1 g on g.id=p.id
 on conflict(bridge_key) do update set source_state=excluded.source_state,target_state=excluded.target_state,bridge_status=case when dd_environment_bridge_receipts.bridge_status='VERIFIED' and dd_environment_bridge_receipts.reconciled_at is not null then 'VERIFIED' else excluded.bridge_status end,requires_owner_approval=true,updated_at=now();
 get diagnostics n=row_count;
 return jsonb_build_object('captured_or_refreshed',n,'direction','TESTER_TO_PRODUCTION','production_mutation',false);
end$function$
;
