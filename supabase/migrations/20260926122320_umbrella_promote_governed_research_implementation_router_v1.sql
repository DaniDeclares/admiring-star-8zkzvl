
insert into public.dd_autobuild_policy(policy_key,enabled,target_environment,allowed_actions,prohibited_actions,escalation_domains,max_candidates_per_cycle,max_open_candidates,require_evidence,require_acceptance_criteria,require_isolated_branch,auto_merge_allowed,production_write_allowed,permission_expansion_allowed,external_money_action_allowed,customer_provider_contact_allowed,kill_switch,updated_at)
values('DANI_PRODUCTION_GOVERNED_BUILD',true,'PRODUCTION',
'["stage_candidate","isolated_branch","open_pull_request","run_ci","record_proof"]'::jsonb,
'["direct_production_write","auto_merge","deploy_production","expand_permissions","move_money","customer_provider_contact","publish_pricing","authorize_provider"]'::jsonb,
'["PRICING","LEGAL","COMPLIANCE","PROVIDER_ELIGIBILITY","PROVIDER_CLASSIFICATION","FINANCE_CONTROL","ACCOUNTING_CONTROL","AUTH","SECURITY_POLICY","DESTRUCTIVE_DATA","SERVICE_STRATEGY","CHANNEL_STRATEGY","OWNER_APPROVAL","AMBIGUOUS_INTENT"]'::jsonb,
10,50,true,true,true,false,false,false,false,false,false,now())
on conflict(policy_key) do update set enabled=excluded.enabled,target_environment=excluded.target_environment,allowed_actions=excluded.allowed_actions,prohibited_actions=excluded.prohibited_actions,escalation_domains=excluded.escalation_domains,require_evidence=true,require_acceptance_criteria=true,require_isolated_branch=true,auto_merge_allowed=false,production_write_allowed=false,permission_expansion_allowed=false,external_money_action_allowed=false,customer_provider_contact_allowed=false,kill_switch=false,updated_at=now();

create or replace function public.dd_route_research_implementation() returns jsonb language plpgsql security definer set search_path='' as $$
declare v_staged int:=0;v_routed int:=0;v_escalated int:=0;
begin
 insert into public.dd_research_implementation_queue(implementation_key,research_work_id,program_key,work_key,action_class,target_environment,proposed_change,evidence_snapshot,acceptance_criteria,risk_tier,permission_class,status,blocker)
 select 'RESEARCH_IMPL:'||r.work_key,r.id,r.program_key,r.work_key,upper(r.metadata->>'implementation_action_class'),'PRODUCTION',
 jsonb_build_object('proposed_build',r.metadata->>'proposed_build','implementation_payload',coalesce(r.metadata->'implementation_payload','{}'::jsonb),'source_next_action',r.next_action),
 jsonb_build_object('research_status',r.status,'required_evidence',r.required_evidence,'metadata',r.metadata,'last_researched_at',r.last_researched_at),
 coalesce(nullif(r.metadata->>'acceptance_criteria',''),r.required_evidence),
 case when r.owner_decision_required or upper(coalesce(pg.domain,''))=any(array['PRICING','LEGAL','COMPLIANCE','PROVIDER_ELIGIBILITY','PROVIDER_CLASSIFICATION','FINANCE_CONTROL','ACCOUNTING_CONTROL','AUTH','SECURITY_POLICY','DESTRUCTIVE_DATA','SERVICE_STRATEGY','CHANNEL_STRATEGY','OWNER_APPROVAL','AMBIGUOUS_INTENT']) then 'HIGH' else 'LOW' end,
 case when r.owner_decision_required or upper(coalesce(pg.domain,''))=any(array['PRICING','LEGAL','COMPLIANCE','PROVIDER_ELIGIBILITY','PROVIDER_CLASSIFICATION','FINANCE_CONTROL','ACCOUNTING_CONTROL','AUTH','SECURITY_POLICY','DESTRUCTIVE_DATA','SERVICE_STRATEGY','CHANNEL_STRATEGY','OWNER_APPROVAL','AMBIGUOUS_INTENT']) then 'REVIEW_REQUIRED' else 'AUTO_PR_BUILD' end,
 case when r.owner_decision_required or upper(coalesce(pg.domain,''))=any(array['PRICING','LEGAL','COMPLIANCE','PROVIDER_ELIGIBILITY','PROVIDER_CLASSIFICATION','FINANCE_CONTROL','ACCOUNTING_CONTROL','AUTH','SECURITY_POLICY','DESTRUCTIVE_DATA','SERVICE_STRATEGY','CHANNEL_STRATEGY','OWNER_APPROVAL','AMBIGUOUS_INTENT']) then 'ESCALATED' else 'READY' end,
 case when r.owner_decision_required then 'OWNER_DECISION_REQUIRED' when upper(coalesce(pg.domain,''))=any(array['PRICING','LEGAL','COMPLIANCE','PROVIDER_ELIGIBILITY','PROVIDER_CLASSIFICATION','FINANCE_CONTROL','ACCOUNTING_CONTROL','AUTH','SECURITY_POLICY','DESTRUCTIVE_DATA','SERVICE_STRATEGY','CHANNEL_STRATEGY','OWNER_APPROVAL','AMBIGUOUS_INTENT']) then 'PROTECTED_DOMAIN' end
 from public.dd_research_work_queue r left join public.dd_research_programs pg on pg.program_key=r.program_key
 where r.status in('GREEN','EVIDENCED','COMPLETE','COMPLETED') and coalesce(r.metadata->>'proposed_build','')<>'' and upper(coalesce(r.metadata->>'implementation_action_class',''))=any(array['DATABASE_REFRESH','REVERIFY','TEST_FIXTURE','OBSERVABILITY','DOCUMENTATION','TESTER_WIRING','CODE_BUILD']) and coalesce(r.metadata->>'acceptance_criteria',r.required_evidence,'')<>''
 on conflict(implementation_key) do nothing; get diagnostics v_staged=row_count;
 insert into public.dd_autobuild_candidates(candidate_key,source_type,source_record_id,domain,title,proposed_build,evidence,acceptance_criteria,risk_tier,permission_class,status,blocker,executor_state)
 select 'RESEARCH_IMPL:'||q.work_key,'RESEARCH_IMPLEMENTATION',q.id::text,q.action_class,left(r.question,240),q.proposed_change->>'proposed_build',q.evidence_snapshot,q.acceptance_criteria,q.risk_tier,q.permission_class,'QUEUED_FOR_BUILD',null,'PENDING'
 from public.dd_research_implementation_queue q join public.dd_research_work_queue r on r.id=q.research_work_id
 where q.status='READY' and q.permission_class='AUTO_PR_BUILD' and not exists(select 1 from public.dd_autobuild_candidates c where c.candidate_key='RESEARCH_IMPL:'||q.work_key)
 on conflict(candidate_key) do nothing; get diagnostics v_routed=row_count;
 update public.dd_research_implementation_queue q set status='ROUTED',autobuild_candidate_id=c.id,updated_at=now() from public.dd_autobuild_candidates c where q.status='READY' and c.candidate_key='RESEARCH_IMPL:'||q.work_key;
 select count(*) into v_escalated from public.dd_research_implementation_queue where status='ESCALATED';
 return jsonb_build_object('status','COMPLETED','staged',v_staged,'routed',v_routed,'escalated_open',v_escalated,'target_environment','PRODUCTION','execution_boundary','ISOLATED_BRANCH_PR_CI_ONLY','production_mutation',false,'auto_merge',false,'money_action',false,'external_contact',false);
end $$;
revoke all on function public.dd_route_research_implementation() from public,anon,authenticated;grant execute on function public.dd_route_research_implementation() to service_role;
