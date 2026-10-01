-- Keep quarantined historical/synthetic research out of active coverage demand.
-- The quarantine guards already stop execution; this reconciles the existing
-- coverage counter so those retained rows cannot manufacture source demand.

create or replace function public.dd_refresh_research_coverage_gaps()
returns jsonb
language plpgsql
set search_path = ''
as $$
declare v_open int:=0;
begin
 insert into public.dd_research_coverage_gaps(
   gap_key,program_key,open_work_items,p0_open,p1_open,active_sources,
   gap_status,priority,next_action,observed_at,updated_at
 )
 select
   'RESEARCH_COVERAGE:'||p.program_key,
   p.program_key,
   count(distinct r.id) filter(
     where r.status not in ('GREEN','RESOLVED','CLOSED','DONE')
       and not (
         r.status='BLOCKED'
         and coalesce(r.blocker,'') in (
           'RECURSIVE_SELF_SEED_QUARANTINE',
           'DUPLICATE_SYNTHETIC_CAREER_REVIEW_COLLAPSED',
           'FALSE_FANOUT_INGEST_CLASSIFICATION_DEFECT',
           'OWNER_DIRECTIVE_RESEARCH_FANOUT_NOT_AUTHORIZED',
           'AUTHORITY_INPUT_NOT_RESEARCH_TARGET',
           'BRIDGE_BOUNDARY_QUARANTINE'
         )
       )
   ),
   count(distinct r.id) filter(
     where r.priority='P0'
       and r.status not in ('GREEN','RESOLVED','CLOSED','DONE')
       and not (
         r.status='BLOCKED'
         and coalesce(r.blocker,'') in (
           'RECURSIVE_SELF_SEED_QUARANTINE',
           'DUPLICATE_SYNTHETIC_CAREER_REVIEW_COLLAPSED',
           'FALSE_FANOUT_INGEST_CLASSIFICATION_DEFECT',
           'OWNER_DIRECTIVE_RESEARCH_FANOUT_NOT_AUTHORIZED',
           'AUTHORITY_INPUT_NOT_RESEARCH_TARGET',
           'BRIDGE_BOUNDARY_QUARANTINE'
         )
       )
   ),
   count(distinct r.id) filter(
     where r.priority='P1'
       and r.status not in ('GREEN','RESOLVED','CLOSED','DONE')
       and not (
         r.status='BLOCKED'
         and coalesce(r.blocker,'') in (
           'RECURSIVE_SELF_SEED_QUARANTINE',
           'DUPLICATE_SYNTHETIC_CAREER_REVIEW_COLLAPSED',
           'FALSE_FANOUT_INGEST_CLASSIFICATION_DEFECT',
           'OWNER_DIRECTIVE_RESEARCH_FANOUT_NOT_AUTHORIZED',
           'AUTHORITY_INPUT_NOT_RESEARCH_TARGET',
           'BRIDGE_BOUNDARY_QUARANTINE'
         )
       )
   ),
   count(distinct s.id) filter(where s.status='ACTIVE'),
   case
     when count(distinct r.id) filter(
       where r.status not in ('GREEN','RESOLVED','CLOSED','DONE')
         and not (
           r.status='BLOCKED'
           and coalesce(r.blocker,'') in (
             'RECURSIVE_SELF_SEED_QUARANTINE',
             'DUPLICATE_SYNTHETIC_CAREER_REVIEW_COLLAPSED',
             'FALSE_FANOUT_INGEST_CLASSIFICATION_DEFECT',
             'OWNER_DIRECTIVE_RESEARCH_FANOUT_NOT_AUTHORIZED',
             'AUTHORITY_INPUT_NOT_RESEARCH_TARGET',
             'BRIDGE_BOUNDARY_QUARANTINE'
           )
         )
     )=0 then 'COVERED'
     when count(distinct s.id) filter(where s.status='ACTIVE')>0 then 'COVERED'
     else 'OPEN'
   end,
   case
     when count(distinct r.id) filter(
       where r.priority='P0'
         and r.status not in ('GREEN','RESOLVED','CLOSED','DONE')
         and not (
           r.status='BLOCKED'
           and coalesce(r.blocker,'') in (
             'RECURSIVE_SELF_SEED_QUARANTINE',
             'DUPLICATE_SYNTHETIC_CAREER_REVIEW_COLLAPSED',
             'FALSE_FANOUT_INGEST_CLASSIFICATION_DEFECT',
             'OWNER_DIRECTIVE_RESEARCH_FANOUT_NOT_AUTHORIZED',
             'AUTHORITY_INPUT_NOT_RESEARCH_TARGET',
             'BRIDGE_BOUNDARY_QUARANTINE'
           )
         )
     )>0 then 'P0' else 'P1'
   end,
   case
     when count(distinct r.id) filter(
       where r.status not in ('GREEN','RESOLVED','CLOSED','DONE')
         and not (
           r.status='BLOCKED'
           and coalesce(r.blocker,'') in (
             'RECURSIVE_SELF_SEED_QUARANTINE',
             'DUPLICATE_SYNTHETIC_CAREER_REVIEW_COLLAPSED',
             'FALSE_FANOUT_INGEST_CLASSIFICATION_DEFECT',
             'OWNER_DIRECTIVE_RESEARCH_FANOUT_NOT_AUTHORIZED',
             'AUTHORITY_INPUT_NOT_RESEARCH_TARGET',
             'BRIDGE_BOUNDARY_QUARANTINE'
           )
         )
     )=0
       then 'No executable/dependency-held research remains; quarantined history is retained but does not create source demand.'
     when count(distinct s.id) filter(where s.status='ACTIVE')=0
       then 'Discover and register authoritative current sources for this research program before consuming more low-priority backlog.'
     else 'Maintain source coverage and evidence freshness.'
   end,
   now(),now()
 from public.dd_research_programs p
 left join public.dd_research_work_queue r on r.program_key=p.program_key
 left join public.dd_research_sources s on s.program_key=p.program_key
 group by p.program_key
 on conflict(gap_key) do update set
   open_work_items=excluded.open_work_items,
   p0_open=excluded.p0_open,
   p1_open=excluded.p1_open,
   active_sources=excluded.active_sources,
   gap_status=excluded.gap_status,
   priority=excluded.priority,
   next_action=excluded.next_action,
   observed_at=excluded.observed_at,
   updated_at=now();

 select count(*) into v_open
 from public.dd_research_coverage_gaps
 where gap_status='OPEN';

 return jsonb_build_object(
   'status','COMPLETED',
   'open_coverage_gaps',v_open,
   'quarantined_history_counts_as_open',false,
   'production_mutation',false
 );
end
$$;

-- Refresh immediately so stale coverage counters cannot keep driving discovery.
select public.dd_refresh_research_coverage_gaps();


-- OWNER_RESEARCH_MEMORY requires work-specific current evidence. Prevent the
-- generic program-level discovery request from duplicating the work-specific
-- requests created later in this same existing function.
CREATE OR REPLACE FUNCTION public.dd_queue_zero_source_discovery_requests()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_created int:=0; v_refreshed int:=0; v_candidate jsonb;
begin
 perform public.dd_refresh_research_coverage_gaps();
 insert into public.dd_research_source_discovery_requests
 (request_key,program_key,gap_key,priority,request_status,discovery_question,source_requirements,metadata)
 select 'SOURCE_DISCOVERY:'||g.program_key,g.program_key,g.gap_key,g.priority,'OPEN',
 'Find and validate authoritative current sources sufficient to research program '||g.program_key||' without inventing source authority.',
 jsonb_build_object('authoritative_preferred',true,'current_preferred',true,'url_must_be_observed_not_invented',true,
 'validate_before_source_activation',true,'minimum_independent_sources_for_contested_claims',2),
 jsonb_build_object('open_work_items',g.open_work_items,'p0_open',g.p0_open,'coverage_gap',true,'tester_only',true)
 from public.dd_research_coverage_gaps g
 where g.gap_status='OPEN' and g.active_sources=0 and g.program_key<>'OWNER_RESEARCH_MEMORY'
 on conflict(request_key) do update set priority=excluded.priority,
 request_status=case when dd_research_source_discovery_requests.validated_source_count>0 then 'VALIDATED' else 'OPEN' end,
 source_requirements=excluded.source_requirements,metadata=excluded.metadata,updated_at=now();
 get diagnostics v_created=row_count;
 insert into public.dd_research_source_discovery_requests
 (request_key,program_key,gap_key,priority,request_status,discovery_question,source_requirements,metadata)
 select 'SOURCE_DISCOVERY:OWNER_MEMORY:'||md5(q.work_key),'OWNER_RESEARCH_MEMORY',
   'WORK_SOURCE_REQUIRED:'||q.work_key,q.priority,'OPEN',
   'Find current authoritative evidence specifically relevant to owner-memory research item: '||q.question,
   jsonb_build_object('authoritative_preferred',true,'current_preferred',true,'url_must_be_observed_not_invented',true,
     'validate_before_source_activation',true,'work_specific_relevance_required',true,'minimum_independent_sources_for_contested_claims',2),
   jsonb_build_object('work_key',q.work_key,'owner_provenance_preserved',true,'historical_memory_not_current_authority',true,'tester_only',true)
 from public.dd_research_work_queue q
 where q.program_key='OWNER_RESEARCH_MEMORY' and q.status='BLOCKED' and q.blocker='SOURCE_DISCOVERY_REQUIRED'
   and not exists(select 1 from public.dd_research_sources s where s.status='ACTIVE' and s.work_key=q.work_key)
 on conflict(request_key) do update set priority=excluded.priority,source_requirements=excluded.source_requirements,metadata=excluded.metadata,updated_at=now();
 v_candidate:=public.dd_queue_candidate_source_discovery_requests();
 select count(*) into v_refreshed from public.dd_research_source_discovery_requests where request_status='OPEN';
 return jsonb_build_object('status','COMPLETED','requests_upserted',v_created,'open_requests',v_refreshed,
 'candidate_discovery',v_candidate,'invented_urls',false,'source_activation',false,'production_mutation',false);
end $function$
;

update public.dd_research_source_discovery_requests
set request_status='SUPERSEDED',
    metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object(
      'superseded_reason','OWNER_MEMORY_REQUIRES_WORK_SPECIFIC_SOURCE',
      'superseded_by','SOURCE_DISCOVERY:OWNER_MEMORY:<work_key_hash>',
      'superseded_at',now()
    ),
    updated_at=now()
where request_key='SOURCE_DISCOVERY:OWNER_RESEARCH_MEMORY'
  and request_status in ('OPEN','QUEUED');
