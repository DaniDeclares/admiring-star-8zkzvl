-- Turn uncovered research programs into governed source-discovery requests.
-- Requests are not evidence and are not active research sources.

create or replace function public.dd_seed_research_discovery_targets()
returns jsonb
language plpgsql
security definer
set search_path=''
as $function$
declare v_count int:=0;
begin
  insert into public.dd_research_discovery_targets(
    program_key,target_key,company_name,target_type,status,discovery_interval_minutes,next_discovery_at,metadata)
  select g.program_key,
    'COVERAGE_DISCOVERY:'||g.program_key,
    p.program_name,
    'RESEARCH_PROGRAM_COVERAGE',
    'QUEUED',
    1440,
    now(),
    jsonb_build_object(
      'objective',p.objective,
      'domain',p.domain,
      'green_rule',p.green_rule,
      'coverage_priority',g.priority,
      'open_work_items',g.open_work_items,
      'active_sources',g.active_sources,
      'request_type','AUTHORITATIVE_SOURCE_DISCOVERY',
      'candidate_only',true,
      'auto_activate_source',false,
      'auto_publish',false,
      'production_direct_write',false)
  from public.dd_research_coverage_gaps g
  join public.dd_research_programs p on p.program_key=g.program_key
  where g.gap_status='OPEN' and coalesce(g.active_sources,0)=0
  on conflict(target_key) do update set
    status=case when public.dd_research_discovery_targets.status='COMPLETED' then public.dd_research_discovery_targets.status else 'QUEUED' end,
    next_discovery_at=case when public.dd_research_discovery_targets.status='COMPLETED' then public.dd_research_discovery_targets.next_discovery_at else now() end,
    metadata=excluded.metadata,
    updated_at=now();
  get diagnostics v_count=row_count;
  return jsonb_build_object('queued_or_refreshed',v_count,'candidate_only',true,'auto_activate_source',false);
end
$function$;

do $$
declare v_jobid bigint;
begin
  select jobid into v_jobid from cron.job where jobname='dd-research-discovery-target-seed';
  if v_jobid is null then
    perform cron.schedule('dd-research-discovery-target-seed','8,23,38,53 * * * *','select public.dd_seed_research_discovery_targets();');
  else
    perform cron.alter_job(v_jobid,schedule:='8,23,38,53 * * * *',command:='select public.dd_seed_research_discovery_targets();',active:=true);
  end if;
end $$;
