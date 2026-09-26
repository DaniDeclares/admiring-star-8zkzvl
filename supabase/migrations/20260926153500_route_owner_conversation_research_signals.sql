create or replace function public.dd_queue_learning_evidence_cross_signals()
returns jsonb language plpgsql set search_path=''
as $$
declare v_candidates int:=0; v_signals int:=0; v_work int:=0;
begin
 insert into public.dd_research_memory_candidates(candidate_key,source_system,source_reference,source_date,candidate_type,title,summary,raw_claims,research_program_keys,evidence_payload)
 select 'LEARNING_MEMORY:'||e.evidence_key,e.source_system,e.source_reference,e.created_at,
   case when e.source_system='GMAIL' then 'EMAIL_INTELLIGENCE'
        when e.source_system='OWNER_CONVERSATION' then 'OWNER_ORIGINATED_OPPORTUNITY'
        when e.domain ilike '%SOFTWARE%' or e.domain ilike '%INTEGRATION%' then 'PLATFORM_INTELLIGENCE'
        when e.domain ilike '%MARKETING%' then 'MARKET_IDEA'
        else 'OWNER_OR_OPERATIONAL_EVIDENCE' end,
   left(coalesce(e.evidence_payload->>'opportunity_name',e.observation,e.evidence_key),240),e.observation,
   jsonb_build_array(jsonb_build_object('authority_class',e.authority_class,'domain',e.domain,'origin_class',e.evidence_payload->>'origin_class')),
   case
    when jsonb_typeof(e.evidence_payload->'required_research_programs')='array'
      then array(select jsonb_array_elements_text(e.evidence_payload->'required_research_programs'))
    when e.source_system='GMAIL' and lower(coalesce(e.observation,'')) ~ '(merch|xtool|print|apparel|nfc|gift|kit|sign|sublimation|engraving)'
      then array['OWNER_RESEARCH_MEMORY','MERCH_PRODUCT_INTELLIGENCE']
    when e.domain ilike '%SOFTWARE%' or e.domain ilike '%INTEGRATION%'
      then array['OWNER_RESEARCH_MEMORY','VENDOR_TECH_INTELLIGENCE','PORTAL_UX_INTELLIGENCE']
    else array['OWNER_RESEARCH_MEMORY'] end,
   jsonb_build_object('learning_evidence_id',e.id,'domain',e.domain,'authority_class',e.authority_class,'payload',e.evidence_payload)
 from public.dd_learning_evidence_intake e
 where e.status in ('NEW','TRIAGED','TEST_REQUIRED')
   and e.source_system in ('GMAIL','OWNER_SCREENSHOT','OWNER_CONVERSATION','GOOGLE_DRIVE','GITHUB')
 on conflict(candidate_key) do update set summary=excluded.summary,research_program_keys=excluded.research_program_keys,evidence_payload=excluded.evidence_payload,updated_at=now();
 get diagnostics v_candidates=row_count;

 insert into public.dd_research_cross_signal_queue(signal_key,candidate_key,source_system,signal_type,signal_payload,matched_programs,status)
 select 'LEARNING_REVALIDATE:'||c.candidate_key,c.candidate_key,c.source_system,
   case when c.candidate_type='OWNER_ORIGINATED_OPPORTUNITY' then 'OWNER_OPPORTUNITY_RESEARCH' else 'LEARNING_EVIDENCE_REVALIDATION' end,
   jsonb_build_object('title',c.title,'candidate_type',c.candidate_type,'source_date',c.source_date,
     'research_questions',coalesce(c.evidence_payload->'payload'->'research_questions',jsonb_build_array(
       'What current DANI service/product/provider/lead/workflow does this relate to?','Is this already represented in the canonical catalog or backlog?',
       'What fresh external evidence confirms or contradicts it?','What economics/capability/compliance/fulfillment implications exist?',
       'What tester proof and approval gate apply?'))),
   c.research_program_keys,'QUEUED'
 from public.dd_research_memory_candidates c
 where c.candidate_key like 'LEARNING_MEMORY:%' and c.relevance_status='REVALIDATE'
 on conflict(signal_key) do update set signal_type=excluded.signal_type,signal_payload=excluded.signal_payload,matched_programs=excluded.matched_programs,status='QUEUED',updated_at=now();
 get diagnostics v_signals=row_count;

 insert into public.dd_research_work_queue(program_key,work_key,question,required_evidence,priority,status,next_action,owner_decision_required,metadata)
 select p.program_key,'learning-signal-'||substr(md5(q.signal_key||':'||p.program_key),1,24),
   'Cross-check internal intelligence against DANI and fresh research: '||coalesce(q.signal_payload->>'title',q.candidate_key),
   'Internal provenance + canonical service/product/provider/lead reconciliation + current authoritative external evidence + economics/capability/compliance/fulfillment implications + tester acceptance criteria.',
   'P1','QUEUED','Research, reconcile and test; do not activate automatically.',false,
   jsonb_build_object('cross_signal_id',q.id,'candidate_key',q.candidate_key,'implementation_action_class','REVERIFY','approval_gate','GOVERNED_AFTER_TESTER_PROOF','signal_type',q.signal_type)
 from public.dd_research_cross_signal_queue q
 cross join lateral unnest(case when cardinality(q.matched_programs)>0 then q.matched_programs else array['OWNER_RESEARCH_MEMORY'] end) p(program_key)
 where q.signal_type in ('LEARNING_EVIDENCE_REVALIDATION','OWNER_OPPORTUNITY_RESEARCH') and q.status='QUEUED'
 on conflict(work_key) do nothing;
 get diagnostics v_work=row_count;
 return jsonb_build_object('status','COMPLETED','candidates_upserted',v_candidates,'signals_upserted',v_signals,'work_created',v_work,'auto_activate',false,'money_action',false,'external_contact',false);
end $$;
revoke execute on function public.dd_queue_learning_evidence_cross_signals() from public,anon,authenticated;
grant execute on function public.dd_queue_learning_evidence_cross_signals() to service_role;