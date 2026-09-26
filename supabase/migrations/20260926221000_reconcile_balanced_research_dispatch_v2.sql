-- Reconcile production research dispatch v2 into version authority and schedule it.
-- Selection/logging only: no external contact, money action, publication, provider authorization,
-- production deployment, or direct application mutation.

create or replace function public.dd_run_balanced_research_dispatch_v2()
returns uuid
language plpgsql
set search_path to ''
as $function$
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
end
$function$;

do $$
declare v_jobid bigint;
begin
  select jobid into v_jobid from cron.job where jobname='dani-balanced-research-dispatch-production';
  if v_jobid is not null then
    perform cron.alter_job(v_jobid, command := 'select public.dd_run_balanced_research_dispatch_v2();');
  end if;
end $$;
