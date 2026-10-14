
create or replace function public.dd_run_research_synthesis_worker() returns jsonb language plpgsql security definer set search_path='' as $$
declare v_linked int:=0;v_unlinked int:=0;v_synth int:=0;v_enriched int:=0;v_route jsonb;
begin
 insert into public.dd_research_synthesis_queue(synthesis_key,research_work_id,program_key,work_key,evidence_ids,evidence_count,confirmed_authority_levels,synthesis_state,permission_class,blocker)
 select 'SYNTH:'||r.work_key,r.id,r.program_key,r.work_key,array_agg(distinct e.id),count(distinct e.id)::int,array_agg(distinct e.authority_level),'READY','REVIEW_REQUIRED','AWAITING_TYPED_IMPLEMENTATION_DIRECTIVE'
 from public.dd_research_work_queue r join public.dd_research_evidence e on e.program_key=r.program_key and e.evidence_status='CONFIRMED'
 left join public.dd_research_sources src on src.program_key=e.program_key and src.source_key=e.metadata->>'sourceKey'
 where e.metadata->>'work_key'=r.work_key or src.work_key=r.work_key group by r.id,r.program_key,r.work_key
 on conflict(synthesis_key) do update set evidence_ids=excluded.evidence_ids,evidence_count=excluded.evidence_count,confirmed_authority_levels=excluded.confirmed_authority_levels,updated_at=now();
 get diagnostics v_linked=row_count;
 insert into public.dd_research_synthesis_queue(synthesis_key,research_work_id,program_key,work_key,evidence_ids,evidence_count,confirmed_authority_levels,synthesis_state,permission_class,blocker)
 select 'EVIDENCE_ONLY:'||e.id::text,null,e.program_key,null,array[e.id],1,array[e.authority_level],'REVIEW_REQUIRED','REVIEW_REQUIRED','EVIDENCE_NOT_LINKED_TO_WORK_ITEM'
 from public.dd_research_evidence e where e.evidence_status='CONFIRMED'
 and not exists(select 1 from public.dd_research_sources src where src.program_key=e.program_key and src.source_key=e.metadata->>'sourceKey' and src.work_key is not null)
 and coalesce(e.metadata->>'work_key','')='' on conflict(synthesis_key) do update set updated_at=now();get diagnostics v_unlinked=row_count;
 update public.dd_research_synthesis_queue s set proposed_action_class=upper(r.metadata->>'implementation_action_class'),proposed_build=r.metadata->>'proposed_build',
 implementation_payload=coalesce(r.metadata->'implementation_payload','{}'::jsonb),acceptance_criteria=coalesce(nullif(r.metadata->>'acceptance_criteria',''),r.required_evidence),
 permission_class=case when r.owner_decision_required or upper(coalesce(pg.domain,''))=any(array['PRICING','LEGAL','COMPLIANCE','PROVIDER_ELIGIBILITY','PROVIDER_CLASSIFICATION','FINANCE_CONTROL','ACCOUNTING_CONTROL','AUTH','SECURITY_POLICY','DESTRUCTIVE_DATA','SERVICE_STRATEGY','CHANNEL_STRATEGY','OWNER_APPROVAL','AMBIGUOUS_INTENT']) then 'REVIEW_REQUIRED' else 'AUTO_PR_BUILD' end,
 synthesis_state=case when r.owner_decision_required or upper(coalesce(pg.domain,''))=any(array['PRICING','LEGAL','COMPLIANCE','PROVIDER_ELIGIBILITY','PROVIDER_CLASSIFICATION','FINANCE_CONTROL','ACCOUNTING_CONTROL','AUTH','SECURITY_POLICY','DESTRUCTIVE_DATA','SERVICE_STRATEGY','CHANNEL_STRATEGY','OWNER_APPROVAL','AMBIGUOUS_INTENT']) then 'REVIEW_REQUIRED' else 'SYNTHESIZED' end,
 blocker=case when r.owner_decision_required then 'OWNER_DECISION_REQUIRED' when upper(coalesce(pg.domain,''))=any(array['PRICING','LEGAL','COMPLIANCE','PROVIDER_ELIGIBILITY','PROVIDER_CLASSIFICATION','FINANCE_CONTROL','ACCOUNTING_CONTROL','AUTH','SECURITY_POLICY','DESTRUCTIVE_DATA','SERVICE_STRATEGY','CHANNEL_STRATEGY','OWNER_APPROVAL','AMBIGUOUS_INTENT']) then 'PROTECTED_DOMAIN' else null end,synthesized_at=now(),updated_at=now()
 from public.dd_research_work_queue r left join public.dd_research_programs pg on pg.program_key=r.program_key
 where s.research_work_id=r.id and s.synthesis_state in('READY','REVIEW_REQUIRED') and coalesce(r.metadata->>'proposed_build','')<>'' and upper(coalesce(r.metadata->>'implementation_action_class',''))=any(array['DATABASE_REFRESH','REVERIFY','TEST_FIXTURE','OBSERVABILITY','DOCUMENTATION','TESTER_WIRING','CODE_BUILD']) and coalesce(r.metadata->>'acceptance_criteria',r.required_evidence,'')<>'';
 get diagnostics v_synth=row_count;
 update public.dd_research_work_queue r set metadata=coalesce(r.metadata,'{}'::jsonb)||jsonb_build_object('proposed_build',s.proposed_build,'implementation_action_class',s.proposed_action_class,'implementation_payload',s.implementation_payload,'acceptance_criteria',s.acceptance_criteria,'synthesis_key',s.synthesis_key,'synthesized_at',s.synthesized_at),updated_at=now()
 from public.dd_research_synthesis_queue s where s.research_work_id=r.id and s.synthesis_state='SYNTHESIZED' and s.permission_class='AUTO_PR_BUILD';get diagnostics v_enriched=row_count;
 update public.dd_research_synthesis_queue set synthesis_state='REVIEW_REQUIRED',blocker='NO_TYPED_IMPLEMENTATION_DIRECTIVE',updated_at=now() where synthesis_state='READY';
 select public.dd_route_research_implementation() into v_route;
 update public.dd_research_synthesis_queue s set synthesis_state='ROUTED',routed_at=now(),updated_at=now() where s.synthesis_state='SYNTHESIZED' and exists(select 1 from public.dd_research_implementation_queue q where q.implementation_key='RESEARCH_IMPL:'||s.work_key);
 return jsonb_build_object('status','COMPLETED','linked_work_items',v_linked,'unlinked_confirmed_evidence',v_unlinked,'synthesized',v_synth,'research_rows_enriched',v_enriched,'router',v_route,'environment','PRODUCTION','invented_instructions',false,'production_mutation',false,'money_action',false,'external_contact',false);
end $$;
revoke all on function public.dd_run_research_synthesis_worker() from public,anon,authenticated;grant execute on function public.dd_run_research_synthesis_worker() to service_role;
select cron.schedule('dd-research-synthesis-worker','12,27,42,57 * * * *','select public.dd_run_research_synthesis_worker();') where not exists(select 1 from cron.job where command='select public.dd_run_research_synthesis_worker();');
