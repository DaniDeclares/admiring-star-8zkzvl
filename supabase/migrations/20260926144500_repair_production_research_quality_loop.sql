-- Production-bound research quality repair.
-- Observation/research only. No pricing publication, provider authorization, external contact,
-- money movement, production deployment, or autonomous merge authority is introduced.

create or replace function public.dd_link_confirmed_research_evidence_to_work()
returns jsonb
language plpgsql
set search_path = ''
as $$
declare v_created int:=0; v_linked int:=0;
begin
  -- Never guess among existing work items. For confirmed evidence with no explicit lineage,
  -- create a deterministic evidence-triage work item that is linked to exactly that evidence.
  insert into public.dd_research_work_queue(
    program_key,work_key,question,required_evidence,priority,status,blocker,next_action,
    owner_decision_required,metadata,created_at,updated_at)
  select e.program_key,
    'evidence-triage-'||lower(regexp_replace(e.claim_key,'[^a-zA-Z0-9]+','-','g')),
    'Evaluate confirmed research claim: '||left(e.claim_text,500),
    'Reconcile this confirmed claim with current authoritative sources, related evidence, conflicts, and the governed DANI operating model before proposing implementation.',
    case when e.authority_level in ('REGULATOR','CONTRACT') then 'P0' else 'P1' end,
    'QUEUED',null,'Synthesize this evidence with corroborating or conflicting evidence.',
    false,
    jsonb_build_object(
      'generated_by','dd_link_confirmed_research_evidence_to_work',
      'evidence_id',e.id,'claim_key',e.claim_key,'source_url',e.source_url,
      'authority_level',e.authority_level,'implementation_action_class','REVERIFY',
      'acceptance_criteria','Evidence is explicitly linked, corroborated/conflict-checked, and remains non-authoritative until governed synthesis completes.'
    ),now(),now()
  from public.dd_research_evidence e
  where e.evidence_status='CONFIRMED'
    and coalesce(e.metadata->>'work_key','')=''
    and not exists(
      select 1 from public.dd_research_sources s
      where s.program_key=e.program_key and s.source_key=e.metadata->>'sourceKey' and s.work_key is not null)
    and not exists(
      select 1 from public.dd_research_work_queue w
      where w.metadata->>'evidence_id'=e.id::text)
  on conflict(work_key) do nothing;
  get diagnostics v_created=row_count;

  update public.dd_research_evidence e
  set metadata=coalesce(e.metadata,'{}'::jsonb)||jsonb_build_object(
        'work_key',w.work_key,'lineage_method','DETERMINISTIC_EVIDENCE_TRIAGE',
        'lineage_linked_at',now()),
      updated_at=now()
  from public.dd_research_work_queue w
  where w.metadata->>'evidence_id'=e.id::text
    and e.evidence_status='CONFIRMED'
    and coalesce(e.metadata->>'work_key','')='';
  get diagnostics v_linked=row_count;

  return jsonb_build_object('status','COMPLETED','triage_work_created',v_created,
    'evidence_linked',v_linked,'guessed_existing_work',false,
    'production_authority_change',false,'external_contact',false,'money_action',false);
end $$;

revoke execute on function public.dd_link_confirmed_research_evidence_to_work() from public,anon,authenticated;
grant execute on function public.dd_link_confirmed_research_evidence_to_work() to service_role;

create or replace function public.dd_run_research_synthesis_worker()
returns jsonb
language plpgsql
set search_path = ''
as $$
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
    blocker=excluded.blocker,updated_at=now();
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
        when upper(coalesce(p.domain,''))=any(array[
          'PRICING','LEGAL','COMPLIANCE','PROVIDER_ELIGIBILITY','PROVIDER_CLASSIFICATION',
          'FINANCE_CONTROL','ACCOUNTING_CONTROL','AUTH','SECURITY_POLICY','DESTRUCTIVE_DATA',
          'SERVICE_STRATEGY','CHANNEL_STRATEGY','OWNER_APPROVAL','AMBIGUOUS_INTENT'])
          then 'REVIEW_REQUIRED' else 'AUTO_PR_BUILD' end,
      synthesis_state=case
        when r.owner_decision_required or upper(coalesce(p.domain,''))=any(array[
          'PRICING','LEGAL','COMPLIANCE','PROVIDER_ELIGIBILITY','PROVIDER_CLASSIFICATION',
          'FINANCE_CONTROL','ACCOUNTING_CONTROL','AUTH','SECURITY_POLICY','DESTRUCTIVE_DATA',
          'SERVICE_STRATEGY','CHANNEL_STRATEGY','OWNER_APPROVAL','AMBIGUOUS_INTENT'])
          then 'REVIEW_REQUIRED' else 'SYNTHESIZED' end,
      blocker=case when r.owner_decision_required then 'OWNER_DECISION_REQUIRED'
        when upper(coalesce(p.domain,''))=any(array[
          'PRICING','LEGAL','COMPLIANCE','PROVIDER_ELIGIBILITY','PROVIDER_CLASSIFICATION',
          'FINANCE_CONTROL','ACCOUNTING_CONTROL','AUTH','SECURITY_POLICY','DESTRUCTIVE_DATA',
          'SERVICE_STRATEGY','CHANNEL_STRATEGY','OWNER_APPROVAL','AMBIGUOUS_INTENT'])
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
  where s.research_work_id=r.id and s.synthesis_state='SYNTHESIZED' and s.permission_class='AUTO_PR_BUILD';
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
    'router',v_route,'environment','PRODUCTION','execution_boundary','ISOLATED_BRANCH_PR_CI_ONLY',
    'production_mutation',false,'auto_merge',false,'deploy_production',false,'money_action',false,'external_contact',false);
end $$;

revoke execute on function public.dd_run_research_synthesis_worker() from public,anon,authenticated;
grant execute on function public.dd_run_research_synthesis_worker() to service_role;

create or replace function public.dd_run_balanced_research_dispatch_v2()
returns uuid
language plpgsql
set search_path = ''
as $$
declare v_id uuid; v_max int:=8; v_per_program int:=2; v_reserve int:=50; v_non_service int; v_service int;
begin
  select max_total_sources_per_cycle,max_sources_per_program_per_cycle,reserve_non_service_discovery_pct
    into v_max,v_per_program,v_reserve
  from public.dd_research_capacity_policy where enabled=true order by updated_at desc limit 1;
  v_max:=greatest(coalesce(v_max,8),1);
  v_per_program:=greatest(coalesce(v_per_program,2),1);
  v_reserve:=least(greatest(coalesce(v_reserve,50),0),100);
  v_non_service:=ceil(v_max*v_reserve/100.0)::int;
  v_service:=greatest(v_max-v_non_service,0);

  perform public.dd_refresh_research_coverage_gaps();

  with ranked as (
    select s.source_key,s.program_key,s.authority_level,g.priority,s.next_check_at,
      row_number() over(partition by s.program_key order by
        case g.priority when 'P0' then 1 when 'P1' then 2 else 3 end,s.next_check_at nulls first,s.source_key) rn
    from public.dd_research_sources s
    join public.dd_research_coverage_gaps g on g.program_key=s.program_key and g.gap_status='OPEN'
    where s.status='ACTIVE' and coalesce(s.next_check_at,now())<=now()
  ), non_service as (
    select * from ranked where program_key<>'SERVICE_DISCOVERY' and rn<=v_per_program
    order by case priority when 'P0' then 1 when 'P1' then 2 else 3 end,next_check_at nulls first limit v_non_service
  ), service as (
    select * from ranked where program_key='SERVICE_DISCOVERY' and rn<=v_per_program
    order by case priority when 'P0' then 1 when 'P1' then 2 else 3 end,next_check_at nulls first limit v_service
  ), selected as (
    select * from non_service union all select * from service
  )
  insert into public.dd_research_dispatch_runs(status,selected_sources,coverage_gaps_open,service_discovery_selected,non_service_selected,summary)
  select 'COMPLETED',
    coalesce(jsonb_agg(jsonb_build_object('source_key',x.source_key,'program_key',x.program_key,'authority_level',x.authority_level)),'[]'::jsonb),
    (select count(*) from public.dd_research_coverage_gaps where gap_status='OPEN'),
    count(*) filter(where x.program_key='SERVICE_DISCOVERY'),
    count(*) filter(where x.program_key<>'SERVICE_DISCOVERY'),
    jsonb_build_object('execution_authority','RESEARCH_DISPATCH_ONLY','max_total',v_max,
      'max_per_program',v_per_program,'reserved_non_service_pct',v_reserve,
      'external_contact',false,'money_action',false)
  from selected x returning id into v_id;
  return v_id;
end $$;

revoke execute on function public.dd_run_balanced_research_dispatch_v2() from public,anon,authenticated;
grant execute on function public.dd_run_balanced_research_dispatch_v2() to service_role;

create or replace function public.dd_refresh_capability_gaps()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare n int:=0;
begin
 insert into public.dd_capability_gap_queue(gap_key,canonical_sku,service_name,division,channel_scope,gap_type,status,
   existing_provider_matches,recruiting_required,licensing_or_credential_gate,research_evidence,owner_approval_required)
 select 'SERVICE_CAPABILITY:'||m.canonical_sku,m.canonical_sku,m.service_name,m.division,coalesce(q.channel_scope,'{}'::text[]),
   'FULFILLMENT_CAPABILITY_UNPROVEN',
   case when pm.authorized_matches>0 then 'COVERED_BY_PROVIDER_REGISTRY'
        when nullif(trim(coalesce(m.assigned_provider,'')),'') is not null
         and nullif(trim(coalesce(m.provider_qualifications,'')),'') is not null then 'COVERED_BY_MASTER_UNIVERSE'
        else 'RESEARCHING' end,
   pm.authorized_matches,
   pm.authorized_matches=0 and nullif(trim(coalesce(m.assigned_provider,'')),'') is null,
   coalesce(m.compliance_legal_boundaries,'') ~* '(license|credential|certif|permit|notary|hvac|electri|plumb)',
   jsonb_build_object('capability',m.capability,'fulfillment_lane',m.fulfillment_lane,
     'master_assigned_provider',m.assigned_provider,'provider_qualifications',m.provider_qualifications,
     'compliance_boundary',m.compliance_legal_boundaries,'provider_registry_exact_service_matches',pm.authorized_matches,
     'provider_registry_match_rule','AUTHORIZED_EXACT_SERVICE_LINE','requires_provider_registry_reconciliation',false),
   false
 from public.dd_master_service_universe m
 left join public.dd_service_pricing_research_queue q on q.canonical_sku=m.canonical_sku
 cross join lateral (
   select count(*)::int authorized_matches from public.dd_provider_capabilities pc
   where pc.is_authorized is true and lower(trim(pc.service_line))=lower(trim(m.service_name))
 ) pm
 where m.canonical_sku is not null
 on conflict(gap_key) do update set status=excluded.status,existing_provider_matches=excluded.existing_provider_matches,
   recruiting_required=excluded.recruiting_required,licensing_or_credential_gate=excluded.licensing_or_credential_gate,
   research_evidence=excluded.research_evidence,updated_at=now();
 get diagnostics n=row_count;
 return n;
end $$;

revoke execute on function public.dd_refresh_capability_gaps() from public,anon,authenticated;
grant execute on function public.dd_refresh_capability_gaps() to service_role;

create or replace view public.dd_operating_model_pattern_summary_v1
with (security_invoker=true) as
select f.target_id,t.company_name,
  f.finding_type,
  count(*)::int finding_count,
  count(distinct u.url)::int distinct_evidence_urls,
  array_agg(distinct f.confidence) confidence_states,
  jsonb_agg(distinct jsonb_build_object('finding',f.finding_text,'evidence_urls',f.evidence_urls)) findings,
  max(f.last_observed_at) last_observed_at
from public.dd_research_operating_model_findings f
left join public.dd_research_discovery_targets t on t.id=f.target_id
left join lateral jsonb_array_elements_text(coalesce(f.evidence_urls,'[]'::jsonb)) u(url) on true
group by f.target_id,t.company_name,f.finding_type;

revoke all on public.dd_operating_model_pattern_summary_v1 from public,anon,authenticated;
grant select on public.dd_operating_model_pattern_summary_v1 to service_role;
