-- Tester resource governor for Supabase Disk IO conservation.
-- Intended for TESTER only. Uses pg_cron supported control functions.
-- Supabase recommends limiting concurrent cron work and monitoring run history.

create table if not exists public.dd_tester_resource_governor_state (
  singleton boolean primary key default true check (singleton),
  mode text not null check (mode in ('NORMAL','CONSERVATION','CRITICAL')),
  reason text,
  changed_at timestamptz not null default now(),
  changed_by text not null default 'SYSTEM',
  metadata jsonb not null default '{}'::jsonb
);

alter table public.dd_tester_resource_governor_state enable row level security;
revoke all on table public.dd_tester_resource_governor_state from public, anon, authenticated;

insert into public.dd_tester_resource_governor_state(singleton,mode,reason,changed_by,metadata)
values(true,'CONSERVATION','Supabase Disk IO Budget depletion warning','CHATGPT_GOVERNED_REPAIR',
 jsonb_build_object('production_untouched',true,'reversible',true))
on conflict(singleton) do update set
 mode=excluded.mode, reason=excluded.reason, changed_at=now(), changed_by=excluded.changed_by,
 metadata=public.dd_tester_resource_governor_state.metadata||excluded.metadata;

create or replace function public.dd_apply_tester_resource_mode(p_mode text, p_reason text default null)
returns jsonb
language plpgsql
security definer
set search_path='public','cron'
as $$
declare
  v_mode text := upper(coalesce(p_mode,''));
begin
  if v_mode not in ('CONSERVATION','CRITICAL') then
    raise exception 'RESOURCE_MODE_REQUIRES_GOVERNED_RESTORATION';
  end if;

  -- Fail closed if this does not look like the Tester schedule.
  if not exists(select 1 from cron.job where jobname='dd-tester-dani-brain-controller') then
    raise exception 'TESTER_CRON_SIGNATURE_NOT_FOUND';
  end if;

  if v_mode in ('CONSERVATION','CRITICAL') then
    perform cron.alter_job(job_id:=j.jobid, active:=false)
    from cron.job j
    where j.jobname = any(array[
      'synthetic-commerce-lab','synthetic-sales-call-lab',
      'dani-balanced-research-dispatch','dani-research-coverage-balancer',
      'dd-research-cross-signal-memory','tester-universal-learning-research-router',
      'tester-environment-bridge-capture','dd_tester_world_daily_cycle',
      'dd-tester-world-evolution','dd-tester-world-walkaway-watchdog',
      'dd-tester-owner-reconciliation','dd-tester-zero-source-discovery-handoff',
      'dd-tester-ecosystem-candidate-advancement','dd-world-work-to-life-bridge',
      'dd-world-work-life-consequences','dd-tester-world-end-of-day-brain-digest',
      'dani-automation-health-supervisor','dd-tester-world-thread-linker',
      'dd-tester-world-learning-feedback-watchdog','dd-tester-world-outcome-compiler',
      'dd-tester-world-service-match-stager','dd-tester-world-service-match-research-router',
      'dd-tester-world-outcome-brain-feedback','dd-tester-ecosystem-replay-research-router',
      'dd-tester-shadow-sol-builder'
    ]);

    perform cron.alter_job(job_id:=j.jobid, schedule:=x.schedule)
    from cron.job j
    join (values
      ('dani-research-engine','12 * * * *'),
      ('dani-research-pipeline-controller-test','24 * * * *'),
      ('dani-provider-requirement-reconciliation-test','28 * * * *'),
      ('dani-research-synthesis-worker','32 * * * *'),
      ('dani-research-implementation-router','36 * * * *'),
      ('dani-research-to-autobuild-test','38 * * * *'),
      ('dani-enterprise-control-plane-test','44 * * * *'),
      ('dd-tester-dani-brain-delivery-worker','47 * * * *'),
      ('dani-monday-focused-research','50 * * * *'),
      ('dd-autonomous-body-closure','55 * * * *'),
      ('dd-tester-dani-brain-controller','17 * * * *')
    ) as x(jobname,schedule) on x.jobname=j.jobname;

    if v_mode='CRITICAL' then
      perform cron.alter_job(job_id:=j.jobid, active:=false)
      from cron.job j
      where j.jobname = any(array[
        'dani-research-engine','dani-research-pipeline-controller-test',
        'dani-research-synthesis-worker','dani-research-implementation-router',
        'dani-research-to-autobuild-test','dani-enterprise-control-plane-test',
        'dd-tester-dani-brain-delivery-worker','dd-tester-dani-brain-controller'
      ]);
    end if;
  end if;

  update public.dd_tester_resource_governor_state
     set mode=v_mode, reason=p_reason, changed_at=now(), changed_by='RESOURCE_GOVERNOR',
         metadata=metadata||jsonb_build_object('last_applied_at',now(),'production_untouched',true)
   where singleton=true;

  return jsonb_build_object('mode',v_mode,'applied_at',now(),'production_untouched',true);
end;
$$;

revoke all on function public.dd_apply_tester_resource_mode(text,text) from public, anon, authenticated;
grant execute on function public.dd_apply_tester_resource_mode(text,text) to service_role;

comment on function public.dd_apply_tester_resource_mode(text,text)
is 'Tester-only fail-closed cron resource governor. CONSERVATION/CRITICAL reduce synthetic and high-spill autonomous churn; never targets Production.';
