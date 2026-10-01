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
         and r.blocker in (
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
         and r.blocker in (
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
         and r.blocker in (
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
           and r.blocker in (
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
           and r.blocker in (
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
           and r.blocker in (
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
