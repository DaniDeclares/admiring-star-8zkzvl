-- Service-discovery evidence circulation repair.
-- Candidate sources receive observation-only signal contracts; automated observations are staged for governed review, never auto-confirmed.
CREATE OR REPLACE FUNCTION public.dd_refresh_candidate_source_signal_contracts()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_updated int:=0;
begin
 update public.dd_research_sources s
 set expected_signals=jsonb_build_array(
   jsonb_build_object('signal','SERVICE_SCOPE',
     'any',to_jsonb(array_remove(array[
       lower(split_part(c.service_name,' ',1)),
       lower(split_part(c.service_name,' ',2)),
       lower(split_part(c.service_name,' ',3))
     ],''))),
   jsonb_build_object('signal','MARKET_OR_DELIVERY',
     'any',jsonb_build_array('service','business','customer','client','work','operations','delivery','management')),
   jsonb_build_object('signal','RISK_OR_REQUIREMENT',
     'any',jsonb_build_array('license','insurance','safety','require','compliance','privacy','security','training','experience','worker','employee','contractor'))
 ),
 metadata=coalesce(s.metadata,'{}'::jsonb)||jsonb_build_object(
   'candidate_signal_contract_v1',true,
   'signal_semantics','OBSERVATION_ONLY_NOT_GATE_CONFIRMATION',
   'candidate_service_name',c.service_name,
   'candidate_boundary_notes',c.research_notes,
   'required_downstream_gates',jsonb_build_array('duplicate_check','market_evidence','licensing','insurance','safety','provider_capability','scope_exclusions','economics','fulfillment','channel_rules','underwriting','release_contract')),
 next_check_at=now(),updated_at=now()
 from public.dd_service_discovery_candidates c
 where s.program_key='SERVICE_DISCOVERY'
   and s.work_key='candidate:'||c.candidate_key
   and s.status='ACTIVE'
   and (s.expected_signals is null or s.expected_signals='[]'::jsonb
        or coalesce((s.metadata->>'candidate_signal_contract_v1')::boolean,false)=false);
 get diagnostics v_updated=row_count;
 return jsonb_build_object('status','COMPLETED','sources_updated',v_updated,'confirmation_granted',false,'release_eligibility_changed',false,'production_mutation',false);
end $function$
;

CREATE OR REPLACE FUNCTION public.dd_stage_candidate_research_evidence_for_review()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_count int:=0;
begin
 insert into public.dd_research_evidence_registry(
   evidence_key,target_domain,target_table,target_record_id,target_field,claim,
   source_url,source_name,source_authority_class,retrieved_at,effective_at,next_review_at,
   confidence,status,raw_evidence,implementation_authority)
 select distinct on (e.id)
   'SERVICE_CANDIDATE:'||replace(e.id::text,'-',''),'SERVICE_DISCOVERY',
   'dd_service_discovery_candidates',replace(s.work_key,'candidate:',''),'RESEARCH_GATE_EVIDENCE',
   e.claim_text,e.source_url,e.source_title,e.authority_level,e.created_at,
   coalesce(e.effective_as_of::timestamptz,e.created_at),now()+interval '30 days',
   0.35,'OBSERVED',
   jsonb_build_object('research_evidence_id',e.id,'evidence_status',e.evidence_status,
      'signal',e.metadata->>'signal','automated',true,'confirmation_required',true,
      'work_key',s.work_key,'source_key',s.source_key,'observation_only',true),
   'REVIEW_REQUIRED'
 from public.dd_research_evidence e
 join public.dd_research_sources s on s.program_key=e.program_key and s.source_url=e.source_url
 where e.program_key='SERVICE_DISCOVERY' and s.work_key like 'candidate:%'
   and e.evidence_status in ('PARTIAL','HISTORICAL')
   and coalesce((e.metadata->>'automated')::boolean,false)=true
 order by e.id,s.updated_at desc
 on conflict(evidence_key) do update set
   claim=excluded.claim,source_url=excluded.source_url,source_name=excluded.source_name,
   retrieved_at=excluded.retrieved_at,raw_evidence=excluded.raw_evidence,updated_at=now();
 get diagnostics v_count=row_count;
 return jsonb_build_object('status','COMPLETED','observations_staged',v_count,'auto_confirmed',0,
   'implementation_authority','REVIEW_REQUIRED','release_eligibility_changed',false,'production_mutation',false);
end $function$
;

revoke execute on function public.dd_refresh_candidate_source_signal_contracts() from public,anon,authenticated;
grant execute on function public.dd_refresh_candidate_source_signal_contracts() to service_role;
revoke execute on function public.dd_stage_candidate_research_evidence_for_review() from public,anon,authenticated;
grant execute on function public.dd_stage_candidate_research_evidence_for_review() to service_role;
