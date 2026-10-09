-- Route internal cross-project revalidation research to the existing evidence path.
--
-- History:
--   dd_ingest_production_bridge_learning -> dd_learning_evidence_intake (PRODUCTION_BRIDGE and other internal systems)
--   -> dd_queue_universal_learning_evidence_cross_signals -> dd_research_work_queue
--      (metadata.signal_type = CROSS_PROJECT_EVIDENCE_REVALIDATION)
--   -> dd_execute_research_work_v1 looked for an ACTIVE web source. In OWNER_RESEARCH_MEMORY none exists,
--      so items were BLOCKED / SOURCE_DISCOVERY_REQUIRED and a per-item web discovery request was opened.
--      In programs that do have web sources, items re-triggered the web research engine every 2 hours
--      without converging. The evidence for these items already exists internally.
--
-- Existing internal path reused (no new worker, queue or governor):
--   dd_research_evidence (CONFIRMED, metadata.work_key) -> dd_run_research_synthesis_worker
--   -> dd_type_reverify_research_directives (REVERIFY, record conclusion only) -> dd_route_research_implementation.
--
-- Change:
--   1. private.dd_route_internal_research_work: for a CROSS_PROJECT_EVIDENCE_REVALIDATION item whose intake evidence
--      comes from an internal system, record that evidence as work-linked, non-authoritative research evidence,
--      move the item to EVIDENCE_READY, mark its per-item web discovery request SUPERSEDED (row kept), write a receipt.
--   2. dd_execute_research_work_v1 calls it right after incrementing the attempt, before any web-source lookup.
--   3. One-time requeue of covered BLOCKED items so they pass through the same executor path.
-- External/owner-origin items (ChatGPT, HubSpot, Gmail, connected apps, owner decisions, etc.) keep existing behavior.
-- Quarantined rows, prior receipts and discovery request rows are preserved.

create or replace function private.dd_route_internal_research_work(p_work_id uuid, p_attempt int)
returns boolean language plpgsql security definer set search_path to 'public', 'pg_catalog'
as $function$
declare w record; v_internal record;
begin
  select id, work_key, program_key, metadata into w from public.dd_research_work_queue where id=p_work_id;
  if w.id is null or coalesce(w.metadata->>'signal_type','')<>'CROSS_PROJECT_EVIDENCE_REVALIDATION' then return false; end if;
  select e.id, e.evidence_key, e.source_system, e.observation, e.created_at into v_internal
    from public.dd_research_memory_candidates c
    join public.dd_learning_evidence_intake e on e.id=nullif(c.evidence_payload->>'learning_evidence_id','')::uuid
   where c.candidate_key=w.metadata->>'candidate_key'
     and e.source_system = any(array['PRODUCTION_BRIDGE','production_runtime','GITHUB_PLUS_SUPABASE','SUPABASE_PRODUCTION','SUPABASE_TESTER','tester_runtime'])
   limit 1;
  if v_internal.id is null then return false; end if;
  insert into public.dd_research_evidence(program_key,claim_key,claim_text,evidence_status,source_title,source_url,source_date,authority_level,effective_as_of,notes,metadata)
  values(w.program_key,'INTERNAL:'||w.work_key,
    'Internal '||v_internal.source_system||' observation, learning evidence only: '||left(coalesce(v_internal.observation,''),1500),
    'CONFIRMED','DANI internal evidence '||v_internal.evidence_key,
    'dani-internal://dd_learning_evidence_intake/'||v_internal.id::text,
    v_internal.created_at::date,'PRIMARY',v_internal.created_at::date,
    'Records what the internal system observed. It is not current Production authority.',
    jsonb_build_object('work_key',w.work_key,'lineage_method','INTERNAL_EVIDENCE_ROUTE','learning_evidence_id',v_internal.id,
      'evidence_key',v_internal.evidence_key,'source_system',v_internal.source_system,
      'production_authority',false,'observed_not_authoritative',true,'routed_by','dd_execute_research_work_v1'))
  on conflict(program_key,claim_key,source_title) do update set updated_at=now();
  update public.dd_research_work_queue set attempts=p_attempt,last_researched_at=now(),status='EVIDENCE_READY',blocker=null,
    next_action='Internal evidence linked. Synthesize through the existing REVERIFY path and record the conclusion only.',
    metadata=coalesce(metadata,'{}')||jsonb_build_object('routing','INTERNAL_EVIDENCE','internal_evidence_id',v_internal.id,
      'internal_source_system',v_internal.source_system,'last_execution_attempt',now(),'execution_result','INTERNAL_EVIDENCE_ROUTED',
      'executor','dd_execute_research_work_v1'),updated_at=now()
  where id=w.id;
  update public.dd_research_source_discovery_requests
     set request_status='SUPERSEDED',
         metadata=coalesce(metadata,'{}')||jsonb_build_object('superseded_reason','INTERNAL_EVIDENCE_ROUTED','superseded_at',now()),
         updated_at=now()
   where gap_key='WORK_SOURCE_REQUIRED:'||w.work_key and request_status='OPEN';
  insert into public.dd_research_work_execution_receipts(work_key,program_key,attempt_no,execution_status,detail,completed_at)
    values(w.work_key,w.program_key,p_attempt,'INTERNAL_EVIDENCE_ROUTED',
      jsonb_build_object('learning_evidence_id',v_internal.id,'source_system',v_internal.source_system,'source_invented',false,'web_discovery_required',false),now())
    on conflict(work_key,attempt_no) do nothing;
  return true;
end
$function$;
revoke all on function private.dd_route_internal_research_work(uuid,int) from public, anon, authenticated;

-- Patch the existing executor (guarded by the reviewed definition hash; Tester md5 94b7ecb439448c61e2e8821f98c910b6).
do $$
declare
  v_old text := pg_get_functiondef('public.dd_execute_research_work_v1(integer)'::regprocedure);
  v_new text;
begin
  if position('dd_route_internal_research_work' in v_old) > 0 then return; end if;
  if md5(v_old) <> '94b7ecb439448c61e2e8821f98c910b6' then raise exception 'EXECUTOR_CHANGED_SINCE_REVIEW'; end if;
  v_new := replace(v_old, 'v_reserve_non_service int:=75;', 'v_reserve_non_service int:=75; v_routed int:=0;');
  v_new := replace(v_new, 'v_attempt:=coalesce(v_attempt,0)+1;',
    'v_attempt:=coalesce(v_attempt,0)+1;' || chr(10) || '   if private.dd_route_internal_research_work(r.id, v_attempt) then v_routed:=v_routed+1; continue; end if;');
  v_new := replace(v_new, '''blocked_no_source'',v_blocked,', '''blocked_no_source'',v_blocked,''routed_internal_evidence'',v_routed,');
  execute v_new;
end $$;

-- One-time requeue (not resolution) of covered items; history kept in metadata.
update public.dd_research_work_queue w
   set status='QUEUED', blocker=null,
       metadata=coalesce(w.metadata,'{}')||jsonb_build_object('previous_status','BLOCKED','previous_blocker','SOURCE_DISCOVERY_REQUIRED',
         'requeued_for_internal_routing_at',now(),'requeued_by','route_internal_cross_project_research_to_evidence_path'),
       updated_at=now()
 where w.status='BLOCKED' and w.blocker='SOURCE_DISCOVERY_REQUIRED'
   and coalesce(w.metadata->>'signal_type','')='CROSS_PROJECT_EVIDENCE_REVALIDATION'
   and exists (
     select 1 from public.dd_research_memory_candidates c
     join public.dd_learning_evidence_intake e on e.id=nullif(c.evidence_payload->>'learning_evidence_id','')::uuid
     where c.candidate_key=w.metadata->>'candidate_key'
       and e.source_system = any(array['PRODUCTION_BRIDGE','production_runtime','GITHUB_PLUS_SUPABASE','SUPABASE_PRODUCTION','SUPABASE_TESTER','tester_runtime']));