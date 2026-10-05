-- Repair the existing DANI research -> implementation -> autobuild seam.
-- History-first: this replaces no planner/router/queue and creates no parallel architecture.
-- Scope is limited to two state-contract defects proven in Tester on 2026-10-04:
--   1) synthesized AUTO_TESTER_BUILD work can legitimately be EVIDENCE_READY;
--   2) dd_autobuild_candidates.source_type accepts RESEARCH, not RESEARCH_IMPLEMENTATION.
-- Safety boundary remains Tester build only: no auto-merge, Production deploy, money movement, or external contact.

create or replace function public.dd_route_research_implementation()
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_staged int := 0;
  v_routed int := 0;
  v_escalated int := 0;
begin
  insert into public.dd_research_implementation_queue(
    implementation_key,research_work_id,program_key,work_key,action_class,proposed_change,
    evidence_snapshot,acceptance_criteria,risk_tier,permission_class,status,blocker)
  select
    'RESEARCH_IMPL:'||r.work_key,r.id,r.program_key,r.work_key,
    upper(r.metadata->>'implementation_action_class'),
    jsonb_build_object(
      'proposed_build',r.metadata->>'proposed_build',
      'implementation_payload',coalesce(r.metadata->'implementation_payload','{}'::jsonb),
      'source_next_action',r.next_action
    ),
    jsonb_build_object(
      'research_status',r.status,'required_evidence',r.required_evidence,
      'metadata',r.metadata,'last_researched_at',r.last_researched_at
    ),
    coalesce(nullif(r.metadata->>'acceptance_criteria',''),r.required_evidence),
    case when r.owner_decision_required or public.dd_is_protected_research_domain(p.domain)
      then 'HIGH' else 'LOW' end,
    case when r.owner_decision_required or public.dd_is_protected_research_domain(p.domain)
      then 'REVIEW_REQUIRED' else 'AUTO_TESTER_BUILD' end,
    case when r.owner_decision_required or public.dd_is_protected_research_domain(p.domain)
      then 'ESCALATED' else 'READY' end,
    case when r.owner_decision_required then 'OWNER_DECISION_REQUIRED'
         when public.dd_is_protected_research_domain(p.domain) then 'PROTECTED_DOMAIN' end
  from public.dd_research_work_queue r
  left join public.dd_research_programs p on p.program_key=r.program_key
  where r.status in ('EVIDENCE_READY','GREEN','EVIDENCED','COMPLETE','COMPLETED')
    and coalesce(r.metadata->>'proposed_build','')<>''
    and upper(coalesce(r.metadata->>'implementation_action_class',''))=any(array[
      'DATABASE_REFRESH','REVERIFY','TEST_FIXTURE','OBSERVABILITY','DOCUMENTATION',
      'TESTER_WIRING','PRODUCTION_WIRING','CODE_BUILD'
    ])
    and coalesce(r.metadata->>'acceptance_criteria',r.required_evidence,'')<>''
  on conflict(implementation_key) do nothing;
  get diagnostics v_staged=row_count;

  insert into public.dd_autobuild_candidates(
    candidate_key,source_type,source_record_id,domain,title,proposed_build,evidence,
    acceptance_criteria,risk_tier,permission_class,status,blocker,executor_state)
  select
    'RESEARCH_IMPL:'||q.work_key,'RESEARCH',q.id::text,q.action_class,
    left(r.question,240),q.proposed_change->>'proposed_build',
    q.evidence_snapshot,q.acceptance_criteria,q.risk_tier,q.permission_class,
    'QUEUED_FOR_BUILD',null,'PENDING'
  from public.dd_research_implementation_queue q
  join public.dd_research_work_queue r on r.id=q.research_work_id
  where q.status='READY' and q.permission_class='AUTO_TESTER_BUILD'
    and not exists(
      select 1 from public.dd_autobuild_candidates c
      where c.candidate_key='RESEARCH_IMPL:'||q.work_key
    )
  on conflict(candidate_key) do nothing;
  get diagnostics v_routed=row_count;

  update public.dd_research_implementation_queue q
  set status='ROUTED',autobuild_candidate_id=c.id,updated_at=now()
  from public.dd_autobuild_candidates c
  where q.status='READY' and c.candidate_key='RESEARCH_IMPL:'||q.work_key;

  select count(*) into v_escalated
  from public.dd_research_implementation_queue where status='ESCALATED';

  return jsonb_build_object(
    'status','COMPLETED','staged',v_staged,'routed',v_routed,
    'escalated_open',v_escalated,'target_environment','TESTER',
    'production_mutation',false,'money_action',false,'external_contact',false
  );
end
$$;

comment on function public.dd_route_research_implementation() is
'Routes evidence-backed research into the existing implementation/autobuild path. EVIDENCE_READY is a valid synthesized input state; safe auto-build candidates use canonical source_type RESEARCH. Tester-build boundary only.';
