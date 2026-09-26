begin;

-- Production research implementation is a proposal/build-routing layer only.
-- It may stage isolated branch/PR/CI work; it does not authorize merge, deploy,
-- direct production mutation, pricing publication, money movement, provider
-- authorization, or external contact.

alter table public.dd_research_implementation_queue
  drop constraint if exists dd_research_implementation_queue_target_environment_check,
  drop constraint if exists dd_research_implementation_queue_permission_class_check,
  drop constraint if exists dd_research_implementation_queue_action_class_check;

alter table public.dd_research_implementation_queue
  add constraint dd_research_implementation_queue_target_environment_check
    check (target_environment = 'PRODUCTION'),
  add constraint dd_research_implementation_queue_permission_class_check
    check (permission_class = any (array['AUTO_PR_BUILD'::text,'REVIEW_REQUIRED'::text])),
  add constraint dd_research_implementation_queue_action_class_check
    check (action_class = any (array[
      'DATABASE_REFRESH'::text,'REVERIFY'::text,'TEST_FIXTURE'::text,
      'OBSERVABILITY'::text,'DOCUMENTATION'::text,'PRODUCTION_WIRING'::text,'CODE_BUILD'::text
    ]));

create or replace function public.dd_route_research_implementation()
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare v_staged int:=0;v_routed int:=0;v_escalated int:=0;
begin
 insert into public.dd_research_implementation_queue(implementation_key,research_work_id,program_key,work_key,action_class,target_environment,proposed_change,evidence_snapshot,acceptance_criteria,risk_tier,permission_class,status,blocker)
 select 'RESEARCH_IMPL:'||r.work_key,r.id,r.program_key,r.work_key,
 case when upper(r.metadata->>'implementation_action_class')='TESTER_WIRING' then 'PRODUCTION_WIRING' else upper(r.metadata->>'implementation_action_class') end,
 'PRODUCTION',
 jsonb_build_object('proposed_build',r.metadata->>'proposed_build','implementation_payload',coalesce(r.metadata->'implementation_payload','{}'::jsonb),'source_next_action',r.next_action),
 jsonb_build_object('research_status',r.status,'required_evidence',r.required_evidence,'metadata',r.metadata,'last_researched_at',r.last_researched_at),
 coalesce(nullif(r.metadata->>'acceptance_criteria',''),r.required_evidence),
 case when r.owner_decision_required or upper(coalesce(pg.domain,''))=any(array['PRICING','LEGAL','COMPLIANCE','PROVIDER_ELIGIBILITY','PROVIDER_CLASSIFICATION','FINANCE_CONTROL','ACCOUNTING_CONTROL','AUTH','SECURITY_POLICY','DESTRUCTIVE_DATA','SERVICE_STRATEGY','CHANNEL_STRATEGY','OWNER_APPROVAL','AMBIGUOUS_INTENT']) then 'HIGH' else 'LOW' end,
 case when r.owner_decision_required or upper(coalesce(pg.domain,''))=any(array['PRICING','LEGAL','COMPLIANCE','PROVIDER_ELIGIBILITY','PROVIDER_CLASSIFICATION','FINANCE_CONTROL','ACCOUNTING_CONTROL','AUTH','SECURITY_POLICY','DESTRUCTIVE_DATA','SERVICE_STRATEGY','CHANNEL_STRATEGY','OWNER_APPROVAL','AMBIGUOUS_INTENT']) then 'REVIEW_REQUIRED' else 'AUTO_PR_BUILD' end,
 case when r.owner_decision_required or upper(coalesce(pg.domain,''))=any(array['PRICING','LEGAL','COMPLIANCE','PROVIDER_ELIGIBILITY','PROVIDER_CLASSIFICATION','FINANCE_CONTROL','ACCOUNTING_CONTROL','AUTH','SECURITY_POLICY','DESTRUCTIVE_DATA','SERVICE_STRATEGY','CHANNEL_STRATEGY','OWNER_APPROVAL','AMBIGUOUS_INTENT']) then 'ESCALATED' else 'READY' end,
 case when r.owner_decision_required then 'OWNER_DECISION_REQUIRED' when upper(coalesce(pg.domain,''))=any(array['PRICING','LEGAL','COMPLIANCE','PROVIDER_ELIGIBILITY','PROVIDER_CLASSIFICATION','FINANCE_CONTROL','ACCOUNTING_CONTROL','AUTH','SECURITY_POLICY','DESTRUCTIVE_DATA','SERVICE_STRATEGY','CHANNEL_STRATEGY','OWNER_APPROVAL','AMBIGUOUS_INTENT']) then 'PROTECTED_DOMAIN' end
 from public.dd_research_work_queue r left join public.dd_research_programs pg on pg.program_key=r.program_key
 where r.status in('GREEN','EVIDENCED','COMPLETE','COMPLETED')
 and coalesce(r.metadata->>'proposed_build','')<>''
 and upper(coalesce(r.metadata->>'implementation_action_class',''))=any(array['DATABASE_REFRESH','REVERIFY','TEST_FIXTURE','OBSERVABILITY','DOCUMENTATION','TESTER_WIRING','PRODUCTION_WIRING','CODE_BUILD'])
 and coalesce(r.metadata->>'acceptance_criteria',r.required_evidence,'')<>''
 on conflict(implementation_key) do nothing; get diagnostics v_staged=row_count;

 insert into public.dd_autobuild_candidates(candidate_key,source_type,source_record_id,domain,title,proposed_build,evidence,acceptance_criteria,risk_tier,permission_class,status,blocker,executor_state)
 select 'RESEARCH_IMPL:'||q.work_key,'RESEARCH_IMPLEMENTATION',q.id::text,q.action_class,left(r.question,240),q.proposed_change->>'proposed_build',q.evidence_snapshot,q.acceptance_criteria,q.risk_tier,q.permission_class,'QUEUED_FOR_BUILD',null,'PENDING'
 from public.dd_research_implementation_queue q join public.dd_research_work_queue r on r.id=q.research_work_id
 where q.status='READY' and q.permission_class='AUTO_PR_BUILD'
 and not exists(select 1 from public.dd_autobuild_candidates c where c.candidate_key='RESEARCH_IMPL:'||q.work_key)
 on conflict(candidate_key) do nothing; get diagnostics v_routed=row_count;

 update public.dd_research_implementation_queue q set status='ROUTED',autobuild_candidate_id=c.id,updated_at=now()
 from public.dd_autobuild_candidates c where q.status='READY' and c.candidate_key='RESEARCH_IMPL:'||q.work_key;
 select count(*) into v_escalated from public.dd_research_implementation_queue where status='ESCALATED';
 return jsonb_build_object('status','COMPLETED','staged',v_staged,'routed',v_routed,'escalated_open',v_escalated,'target_environment','PRODUCTION','execution_boundary','ISOLATED_BRANCH_PR_CI_ONLY','production_mutation',false,'auto_merge',false,'deploy_production',false,'money_action',false,'external_contact',false);
end $function$;

revoke all on function public.dd_route_research_implementation() from public, anon, authenticated;
grant execute on function public.dd_route_research_implementation() to service_role;

commit;
