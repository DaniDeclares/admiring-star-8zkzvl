-- Seed source-discovery requests from research coverage gaps.
-- A discovery target is a request for candidate sources, never evidence or authority.

create or replace function public.dd_seed_research_discovery_targets()
returns jsonb
language plpgsql
security definer
set search_path=''
as $function$
declare v_count int:=0;
begin
  if to_regclass('public.dd_research_discovery_targets') is null
     or to_regclass('public.dd_research_coverage_gaps') is null
     or to_regclass('public.dd_research_programs') is null then
    return jsonb_build_object('status','DEFERRED','reason','DISCOVERY_DEPENDENCIES_NOT_INSTALLED');
  end if;

  insert into public.dd_research_discovery_targets(
    program_key,target_key,company_name,target_type,status,discovery_interval_minutes,next_discovery_at,metadata)
  select g.program_key,'COVERAGE_DISCOVERY:'||g.program_key,p.program_name,
    'RESEARCH_PROGRAM_COVERAGE','QUEUED',1440,now(),
    jsonb_build_object(
      'objective',p.objective,'domain',p.domain,'green_rule',p.green_rule,
      'coverage_priority',g.priority,'open_work_items',g.open_work_items,
      'active_sources',g.active_sources,'request_type','AUTHORITATIVE_SOURCE_DISCOVERY',
      'candidate_only',true,'auto_activate_source',false,'auto_publish',false,
      'production_direct_write',false)
  from public.dd_research_coverage_gaps g
  join public.dd_research_programs p on p.program_key=g.program_key
  where g.gap_status in ('OPEN','BLOCKED') and coalesce(g.active_sources,0)=0
  on conflict(target_key) do update set
    status=case when public.dd_research_discovery_targets.status='COMPLETED'
      then public.dd_research_discovery_targets.status else 'QUEUED' end,
    next_discovery_at=case when public.dd_research_discovery_targets.status='COMPLETED'
      then public.dd_research_discovery_targets.next_discovery_at else now() end,
    metadata=excluded.metadata,updated_at=now();
  get diagnostics v_count=row_count;
  return jsonb_build_object('status','COMPLETED','queued_or_refreshed',v_count,
    'candidate_only',true,'auto_activate_source',false);
end
$function$;
