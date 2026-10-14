
create or replace function public.dd_capture_service_release_authority_fingerprints()
returns jsonb
language plpgsql
set search_path='public'
as $function$
declare v_count int:=0;
begin
 insert into public.dd_production_learning_signals(signal_key,origin,signal_type,statement,evidence,confidence,status)
 select
   'SERVICE_RELEASE_AUTHORITY:'||canonical_sku,
   'PRODUCTION_RUNTIME',
   'SERVICE_RELEASE_AUTHORITY',
   'Production service '||canonical_sku||' ('||service_name||') is runtime-verified; Tester should validate the authority/provenance that produced this state rather than copy the row.',
   jsonb_build_object(
     'canonical_sku',canonical_sku,'service_name',service_name,'service_family',service_family,
     'release_state',release_state,'blocking_gate',blocking_gate,
     'quote_path_ok',quote_path_ok,'channel_authorization_ok',channel_authorization_ok,
     'canonical_identity_ok',canonical_identity_ok,'commercial_definition_ok',commercial_definition_ok,
     'pricing_engine_ok',pricing_engine_ok,'fulfillment_matrix_ok',fulfillment_matrix_ok,
     'runtime_verified',runtime_verified,'payment_path_verified',payment_path_verified,
     'production_smoke_verified',production_smoke_verified,
     'pricing_type',pricing_type,'billing_cycle',billing_cycle,
     'runtime_service_id',runtime_service_id,
     'captured_at',now(),
     'learning_boundary','OBSERVATION_ONLY_REQUIRES_TESTER_VALIDATION',
     'direct_row_copy_allowed',false,'direct_authority_copy_allowed',false,
     'required_tester_action','RECONCILE_RULE_AND_AUTHORITY_PROVENANCE'
   ),
   1.0,'NEW'
 from (
   select distinct on (canonical_sku) *
   from public.dd_service_release_contract_v1
   where runtime_verified=true and release_state='LIVE_READY'
   order by canonical_sku,
            production_smoke_verified desc nulls last,
            payment_path_verified desc nulls last,
            runtime_service_id nulls last,
            service_name nulls last
 ) r
 on conflict(signal_key) do update set
   statement=excluded.statement,
   evidence=excluded.evidence,
   confidence=excluded.confidence,
   status=case when public.dd_production_learning_signals.evidence is distinct from excluded.evidence then 'NEW'
               else public.dd_production_learning_signals.status end,
   updated_at=now();
 get diagnostics v_count=row_count;
 return jsonb_build_object('status','COMPLETED','fingerprints_captured_or_refreshed',v_count,
   'authority','LEARNING_ONLY','production_mutation_authority',false,'direct_row_copy_allowed',false,
   'dedupe_key','canonical_sku');
end
$function$;
