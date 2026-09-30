-- Repair research synthesis permission contract, centralize protected-domain governance,
-- type safe REVERIFY directives, and make the autonomous cycle converge idempotently.
CREATE OR REPLACE FUNCTION public.dd_is_protected_research_domain(p_domain text)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
 select case
  when upper(coalesce(p_domain,'')) ~ '(PRICING|LEGAL|COMPLIANCE|FINANCE|ACCOUNTING|AUTH|SECURITY|DESTRUCTIVE_DATA|PROVIDER_ELIGIBILITY|PROVIDER_CLASSIFICATION|SERVICE_STRATEGY|CHANNEL_STRATEGY|OWNER_APPROVAL|AMBIGUOUS_INTENT|NONPROFIT_FORPROFIT_LAND|INSURANCE_LEGAL_BENEFITS)'
  then true else false end
$function$
;

CREATE OR REPLACE FUNCTION public.dd_type_reverify_research_directives()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_typed int:=0;
begin
 if current_user not in ('postgres','service_role') then raise exception 'service_role required'; end if;
 with eligible as (
   select distinct r.id
   from public.dd_research_work_queue r
   join public.dd_research_synthesis_queue s on s.research_work_id=r.id
   where s.evidence_count>0
     and s.synthesis_state='REVIEW_REQUIRED'
     and upper(coalesce(r.metadata->>'implementation_action_class',''))='REVERIFY'
     and coalesce(r.metadata->>'proposed_build','')=''
 ), upd as (
   update public.dd_research_work_queue r
   set metadata=coalesce(r.metadata,'{}'::jsonb)||jsonb_build_object(
     'proposed_build','Record and reconcile the evidence-backed research conclusion only; do not mutate operational authority, pricing, provider eligibility, production state, money, or external communications.',
     'implementation_payload',jsonb_build_object(
       'directive_type','RESEARCH_CONCLUSION_ONLY',
       'operational_mutation',false,'production_authority',false,'money_action',false,'external_contact',false),
     'typed_directive_source','dd_type_reverify_research_directives',
     'typed_directive_at',now()),
     updated_at=now()
   from eligible e where r.id=e.id returning r.id
 ) select count(*) into v_typed from upd;
 return jsonb_build_object('status','COMPLETED','typed_reverify_directives',v_typed,
   'production_mutation',false,'production_authority_granted',false,'money_action',false,'external_contact',false);
end $function$
;

CREATE OR REPLACE FUNCTION public.dd_run_research_synthesis_worker()
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare v_lineage jsonb; v_linked int:=0; v_unlinked int:=0; v_synth int:=0; v_enriched int:=0; v_route jsonb;
begin
  select public.dd_link_confirmed_research_evidence_to_work() into v_lineage;

  insert into public.dd_research_synthesis_queue(
    synthesis_key,research_work_id,program_key,work_key,evidence_ids,evidence_count,
    confirmed_authority_levels,synthesis_state,permission_class,blocker)
  select 'SYNTH:'||r.work_key,r.id,r.program_key,r.work_key,
    array_agg(distinct e.id),count(distinct e.id)::int,array_agg(distinct e.authority_level),
    'READY','REVIEW_REQUIRED','AWAITING_TYPED_IMPLEMENTATION_DIRECTIVE'
  from public.dd_research_work_queue r
  join public.dd_research_evidence e
    on e.program_key=r.program_key and e.evidence_status='CONFIRMED'
  left join public.dd_research_sources src
    on src.program_key=e.program_key and src.source_key=e.metadata->>'sourceKey'
  where e.metadata->>'work_key'=r.work_key or src.work_key=r.work_key
  group by r.id,r.program_key,r.work_key
  on conflict(synthesis_key) do update set
    evidence_ids=excluded.evidence_ids,evidence_count=excluded.evidence_count,
    confirmed_authority_levels=excluded.confirmed_authority_levels,
    blocker=case when dd_research_synthesis_queue.synthesis_state in ('SYNTHESIZED','ROUTED') then dd_research_synthesis_queue.blocker else excluded.blocker end,updated_at=now();
  get diagnostics v_linked=row_count;

  insert into public.dd_research_synthesis_queue(
    synthesis_key,research_work_id,program_key,work_key,evidence_ids,evidence_count,
    confirmed_authority_levels,synthesis_state,permission_class,blocker)
  select 'EVIDENCE_ONLY:'||e.id::text,null,e.program_key,null,array[e.id],1,array[e.authority_level],
    'REVIEW_REQUIRED','REVIEW_REQUIRED','EVIDENCE_NOT_LINKED_TO_WORK_ITEM'
  from public.dd_research_evidence e
  where e.evidence_status='CONFIRMED' and coalesce(e.metadata->>'work_key','')=''
  on conflict(synthesis_key) do update set updated_at=now();
  get diagnostics v_unlinked=row_count;

  update public.dd_research_synthesis_queue s
  set proposed_action_class=upper(r.metadata->>'implementation_action_class'),
      proposed_build=r.metadata->>'proposed_build',
      implementation_payload=coalesce(r.metadata->'implementation_payload','{}'::jsonb),
      acceptance_criteria=coalesce(nullif(r.metadata->>'acceptance_criteria',''),r.required_evidence),
      permission_class=case
        when r.owner_decision_required then 'REVIEW_REQUIRED'
        when public.dd_is_protected_research_domain(p.domain)
          then 'REVIEW_REQUIRED' else 'AUTO_TESTER_BUILD' end,
      synthesis_state=case
        when r.owner_decision_required or public.dd_is_protected_research_domain(p.domain)
          then 'REVIEW_REQUIRED' else 'SYNTHESIZED' end,
      blocker=case when r.owner_decision_required then 'OWNER_DECISION_REQUIRED'
        when public.dd_is_protected_research_domain(p.domain)
          then 'PROTECTED_DOMAIN' else null end,
      synthesized_at=now(),updated_at=now()
  from public.dd_research_work_queue r
  left join public.dd_research_programs p on p.program_key=r.program_key
  where s.research_work_id=r.id and s.synthesis_state in ('READY','REVIEW_REQUIRED')
    and coalesce(r.metadata->>'proposed_build','')<>''
    and upper(coalesce(r.metadata->>'implementation_action_class',''))=any(array[
      'DATABASE_REFRESH','REVERIFY','TEST_FIXTURE','OBSERVABILITY','DOCUMENTATION','PRODUCTION_WIRING','CODE_BUILD'])
    and coalesce(r.metadata->>'acceptance_criteria',r.required_evidence,'')<>'';
  get diagnostics v_synth=row_count;

  update public.dd_research_work_queue r
  set metadata=coalesce(r.metadata,'{}'::jsonb)||jsonb_build_object(
      'proposed_build',s.proposed_build,'implementation_action_class',s.proposed_action_class,
      'implementation_payload',s.implementation_payload,'acceptance_criteria',s.acceptance_criteria,
      'synthesis_key',s.synthesis_key,'synthesized_at',s.synthesized_at),updated_at=now()
  from public.dd_research_synthesis_queue s
  where s.research_work_id=r.id and s.synthesis_state='SYNTHESIZED' and s.permission_class='AUTO_TESTER_BUILD';
  get diagnostics v_enriched=row_count;

  update public.dd_research_synthesis_queue
  set synthesis_state='REVIEW_REQUIRED',blocker='NO_TYPED_IMPLEMENTATION_DIRECTIVE',updated_at=now()
  where synthesis_state='READY';

  select public.dd_route_research_implementation() into v_route;

  update public.dd_research_synthesis_queue s
  set synthesis_state='ROUTED',routed_at=now(),updated_at=now()
  where s.synthesis_state='SYNTHESIZED'
    and exists(select 1 from public.dd_research_implementation_queue q where q.implementation_key='RESEARCH_IMPL:'||s.work_key);

  return jsonb_build_object('status','COMPLETED','lineage',v_lineage,'linked_work_items',v_linked,
    'unlinked_confirmed_evidence',v_unlinked,'synthesized',v_synth,'research_rows_enriched',v_enriched,
    'router',v_route,'environment','TESTER','execution_boundary','ISOLATED_BRANCH_PR_CI_ONLY',
    'production_mutation',false,'auto_merge',false,'deploy_production',false,'money_action',false,'external_contact',false);
end $function$
;

CREATE OR REPLACE FUNCTION public.dd_route_research_implementation()
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare v_staged int:=0; v_routed int:=0; v_escalated int:=0;
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
    case when r.owner_decision_required or upper(coalesce(p.domain,''))=any(array[
      'PRICING','LEGAL','COMPLIANCE','PROVIDER_ELIGIBILITY','PROVIDER_CLASSIFICATION',
      'FINANCE_CONTROL','ACCOUNTING_CONTROL','AUTH','SECURITY_POLICY','DESTRUCTIVE_DATA',
      'SERVICE_STRATEGY','CHANNEL_STRATEGY','OWNER_APPROVAL','AMBIGUOUS_INTENT'
    ]) then 'HIGH' else 'LOW' end,
    case when r.owner_decision_required or upper(coalesce(p.domain,''))=any(array[
      'PRICING','LEGAL','COMPLIANCE','PROVIDER_ELIGIBILITY','PROVIDER_CLASSIFICATION',
      'FINANCE_CONTROL','ACCOUNTING_CONTROL','AUTH','SECURITY_POLICY','DESTRUCTIVE_DATA',
      'SERVICE_STRATEGY','CHANNEL_STRATEGY','OWNER_APPROVAL','AMBIGUOUS_INTENT'
    ]) then 'REVIEW_REQUIRED' else 'AUTO_TESTER_BUILD' end,
    case when r.owner_decision_required or upper(coalesce(p.domain,''))=any(array[
      'PRICING','LEGAL','COMPLIANCE','PROVIDER_ELIGIBILITY','PROVIDER_CLASSIFICATION',
      'FINANCE_CONTROL','ACCOUNTING_CONTROL','AUTH','SECURITY_POLICY','DESTRUCTIVE_DATA',
      'SERVICE_STRATEGY','CHANNEL_STRATEGY','OWNER_APPROVAL','AMBIGUOUS_INTENT'
    ]) then 'ESCALATED' else 'READY' end,
    case when r.owner_decision_required then 'OWNER_DECISION_REQUIRED'
         when upper(coalesce(p.domain,''))=any(array[
           'PRICING','LEGAL','COMPLIANCE','PROVIDER_ELIGIBILITY','PROVIDER_CLASSIFICATION',
           'FINANCE_CONTROL','ACCOUNTING_CONTROL','AUTH','SECURITY_POLICY','DESTRUCTIVE_DATA',
           'SERVICE_STRATEGY','CHANNEL_STRATEGY','OWNER_APPROVAL','AMBIGUOUS_INTENT'
         ]) then 'PROTECTED_DOMAIN' end
  from public.dd_research_work_queue r
  left join public.dd_research_programs p on p.program_key=r.program_key
  where r.status in ('GREEN','EVIDENCED','COMPLETE','COMPLETED')
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
    'RESEARCH_IMPL:'||q.work_key,'RESEARCH_IMPLEMENTATION',q.id::text,q.action_class,
    left(r.question,240),q.proposed_change->>'proposed_build',
    q.evidence_snapshot,q.acceptance_criteria,q.risk_tier,q.permission_class,
    'QUEUED_FOR_BUILD',null,'PENDING'
  from public.dd_research_implementation_queue q
  join public.dd_research_work_queue r on r.id=q.research_work_id
  where q.status='READY' and q.permission_class='AUTO_TESTER_BUILD'
    and not exists(select 1 from public.dd_autobuild_candidates c where c.candidate_key='RESEARCH_IMPL:'||q.work_key)
  on conflict(candidate_key) do nothing;
  get diagnostics v_routed=row_count;

  update public.dd_research_implementation_queue q
  set status='ROUTED',autobuild_candidate_id=c.id,updated_at=now()
  from public.dd_autobuild_candidates c
  where q.status='READY' and c.candidate_key='RESEARCH_IMPL:'||q.work_key;

  select count(*) into v_escalated
  from public.dd_research_implementation_queue where status='ESCALATED';

  return jsonb_build_object('status','COMPLETED','staged',v_staged,'routed',v_routed,
    'escalated_open',v_escalated,'target_environment','TESTER',
    'production_mutation',false,'money_action',false,'external_contact',false);
end $function$
;

CREATE OR REPLACE FUNCTION public.dd_run_autonomous_body_closure_cycle()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
 v_work jsonb; v_operating jsonb; v_external jsonb; v_research jsonb; v_synthesis jsonb; v_delivery jsonb; v_source_coverage jsonb; v_directives jsonb;
 v_safe_recipe uuid; v_advance jsonb; v_audit jsonb; v_safe uuid; v_health uuid; v_automation_health uuid; v_workforce jsonb; v_organism jsonb; v_world_match jsonb;
begin
 select public.dd_refresh_remaining_work_queue() into v_work;
 select public.dd_consume_internal_scheduled_operating_work(10) into v_operating;
 select public.dd_dispatch_external_scheduled_operating_work(20) into v_external;
 select public.dd_reconcile_source_discovery_coverage() into v_source_coverage;
 select public.dd_execute_research_work_v1(8) into v_research;
 select public.dd_type_reverify_research_directives() into v_directives;
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
   'external_operating_handoff',v_external,'source_discovery_reconciliation',v_source_coverage,'research_execution',v_research,'research_directive_typing',v_directives,'research_synthesis',v_synthesis,'world_service_match_reconciliation',v_world_match,
   'synthetic_workforce_machine_economics',v_workforce,'brain_delivery',v_delivery,'safe_automation_recipe_receipt',v_safe_recipe,
   'candidate_advancement',v_advance,'audit_subproofs',v_audit,'safe_runtime_receipt',v_safe,
   'runtime_health_receipt',v_health,'automation_handoff_health_receipt',v_automation_health,'end_to_end_organism_audit',v_organism,
   'composition_policy','REUSE_EXISTING_WORKERS','production_mutation_authorized',false,
   'external_contact_authorized',false,'money_action_authorized',false);
end $function$
;
revoke execute on function public.dd_is_protected_research_domain(text) from public,anon,authenticated;
grant execute on function public.dd_is_protected_research_domain(text) to service_role;
revoke execute on function public.dd_type_reverify_research_directives() from public,anon,authenticated;
grant execute on function public.dd_type_reverify_research_directives() to service_role;
