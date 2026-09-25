-- TESTER-first enterprise control plane.
-- One cross-domain control loop over existing DANI authorities.
-- This migration does NOT send messages, move money, authorize providers,
-- publish pricing/services, merge code, or promote production.

create table if not exists public.dd_enterprise_control_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'STARTED'
    check (status in ('STARTED','COMPLETED','DEGRADED','FAILED')),
  research_run_id uuid,
  safe_automation_run_id uuid,
  service_discovery_run_id uuid,
  commercial_reconciliation_run_id uuid,
  owner_attention_open integer not null default 0,
  external_actions_pending integer not null default 0,
  external_actions_claimed integer not null default 0,
  external_actions_retry_wait integer not null default 0,
  external_actions_dead_letter integer not null default 0,
  agent_runs_running integer not null default 0,
  agent_runs_broken integer not null default 0,
  summary jsonb not null default '{}'::jsonb
);
alter table public.dd_enterprise_control_runs enable row level security;

create or replace view public.dd_enterprise_control_health_v1 as
select
  (select count(*) from public.dd_owner_attention_queue where status='OPEN')::integer as owner_attention_open,
  (select count(*) from public.dd_owner_attention_queue where status='OPEN' and priority='P0')::integer as owner_attention_p0,
  (select count(*) from public.dd_external_action_outbox where status='PENDING')::integer as external_actions_pending,
  (select count(*) from public.dd_external_action_outbox where status='CLAIMED')::integer as external_actions_claimed,
  (select count(*) from public.dd_external_action_outbox where status='RETRY_WAIT')::integer as external_actions_retry_wait,
  (select count(*) from public.dd_external_action_outbox where status='DEAD_LETTER')::integer as external_actions_dead_letter,
  (select count(*) from public.dd_agent_run_control where status='RUNNING')::integer as agent_runs_running,
  (select count(*) from public.dd_agent_run_control where breaker_reason is not null and completed_at is null)::integer as agent_runs_broken,
  (select count(*) from public.dd_research_work_queue where status<>'GREEN')::integer as research_open,
  (select count(*) from public.dd_software_build_work_queue where status not in ('COMPLETED','GREEN','CANCELLED'))::integer as software_work_open,
  now() as observed_at;

create or replace function public.dd_run_enterprise_control_plane()
returns uuid
language plpgsql
security definer
set search_path=public,private
as $$
declare
  v_id uuid:=gen_random_uuid();
  v_research uuid;
  v_safe uuid;
  v_discovery uuid;
  v_commercial uuid;
  v_h public.dd_enterprise_control_health_v1%rowtype;
  v_status text:='COMPLETED';
begin
  insert into public.dd_enterprise_control_runs(id,status) values(v_id,'STARTED');

  -- Existing controllers remain the domain authorities. This function composes
  -- them; it does not replace their business rules.
  begin
    select public.dd_run_research_pipeline_controller() into v_research;
  exception when undefined_function then
    v_research:=null;
  end;

  begin
    select public.dd_run_safe_automation_recipes() into v_safe;
  exception when undefined_function then
    v_safe:=null;
  end;

  begin
    select public.dd_run_service_discovery_controller() into v_discovery;
  exception when undefined_function then
    v_discovery:=null;
  end;

  begin
    select public.dd_run_commercial_reconciliation() into v_commercial;
  exception when undefined_function then
    v_commercial:=null;
  end;

  select * into v_h from public.dd_enterprise_control_health_v1;

  if v_h.external_actions_dead_letter > 0 or v_h.agent_runs_broken > 0 then
    v_status:='DEGRADED';
  end if;

  update public.dd_enterprise_control_runs
  set completed_at=now(),
      status=v_status,
      research_run_id=v_research,
      safe_automation_run_id=v_safe,
      service_discovery_run_id=v_discovery,
      commercial_reconciliation_run_id=v_commercial,
      owner_attention_open=v_h.owner_attention_open,
      external_actions_pending=v_h.external_actions_pending,
      external_actions_claimed=v_h.external_actions_claimed,
      external_actions_retry_wait=v_h.external_actions_retry_wait,
      external_actions_dead_letter=v_h.external_actions_dead_letter,
      agent_runs_running=v_h.agent_runs_running,
      agent_runs_broken=v_h.agent_runs_broken,
      summary=jsonb_build_object(
        'mode','TESTER_CONTROL_PLANE',
        'rule','compose existing authorities; do not create competing authority',
        'external_side_effects_executed',false,
        'money_movement_authorized',false,
        'provider_authorization_mutated',false,
        'pricing_or_service_publication',false,
        'production_promotion',false,
        'research_open',v_h.research_open,
        'software_work_open',v_h.software_work_open,
        'owner_attention_p0',v_h.owner_attention_p0,
        'observed_at',v_h.observed_at
      )
  where id=v_id;

  return v_id;
exception when others then
  update public.dd_enterprise_control_runs
  set completed_at=now(),status='FAILED',
      summary=jsonb_build_object('error',sqlerrm,'external_side_effects_executed',false)
  where id=v_id;
  raise;
end $$;

-- Internal-only controller surface.
revoke all on function public.dd_run_enterprise_control_plane() from public, anon, authenticated;
grant execute on function public.dd_run_enterprise_control_plane() to service_role;

-- Keep this tester clock distinct from production release scheduling.
do $$
declare jid bigint;
begin
  select jobid into jid from cron.job where jobname='dani-enterprise-control-plane-test';
  if jid is not null then perform cron.unschedule(jid); end if;
  perform cron.schedule(
    'dani-enterprise-control-plane-test',
    '9,19,29,39,49,59 * * * *',
    'select public.dd_run_enterprise_control_plane();'
  );
end $$;
