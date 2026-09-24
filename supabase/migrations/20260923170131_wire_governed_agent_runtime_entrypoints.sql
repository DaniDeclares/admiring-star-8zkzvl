
create or replace function public.dd_resolve_agent_runtime_policy(
  p_agent_key text,
  p_stage_key text
) returns public.dd_agent_runtime_policy
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_agent public.dd_revenue_agent_registry%rowtype;
  v_auth public.dd_execution_authority_map%rowtype;
  v_policy public.dd_agent_runtime_policy%rowtype;
begin
  select * into v_agent
  from public.dd_revenue_agent_registry
  where agent_key=p_agent_key and is_active=true;
  if not found then raise exception 'AGENT_NOT_ACTIVE_OR_REGISTERED'; end if;

  select * into v_auth
  from public.dd_execution_authority_map
  where stage_key=p_stage_key and is_active=true;
  if not found then raise exception 'STAGE_NOT_AUTHORIZED'; end if;

  if not (
    p_agent_key = any(coalesce(v_auth.prepare_authority,'{}'::text[]))
    or p_agent_key = any(coalesce(v_auth.approve_authority,'{}'::text[]))
    or p_agent_key = any(coalesce(v_auth.execute_authority,'{}'::text[]))
  ) then
    raise exception 'AGENT_NOT_AUTHORIZED_FOR_STAGE';
  end if;

  select * into v_policy
  from public.dd_agent_runtime_policy
  where is_active=true
    and stage_key=p_stage_key
    and (agent_key=p_agent_key or agent_key is null)
  order by (agent_key=p_agent_key) desc, updated_at desc
  limit 1;

  if not found then raise exception 'NO_ACTIVE_RUNTIME_POLICY'; end if;
  return v_policy;
end
$$;

create or replace function public.dd_begin_governed_agent_run(
  p_correlation_id uuid,
  p_agent_key text,
  p_stage_key text,
  p_trace_id text default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_policy public.dd_agent_runtime_policy%rowtype;
  v_id uuid;
begin
  v_policy := public.dd_resolve_agent_runtime_policy(p_agent_key,p_stage_key);

  insert into public.dd_agent_run_control(
    correlation_id,agent_key,stage_key,runtime_policy_key,trace_id,status
  ) values (
    p_correlation_id,p_agent_key,p_stage_key,v_policy.policy_key,p_trace_id,'RUNNING'
  )
  on conflict(correlation_id,agent_key,stage_key)
  do update set last_activity_at=now()
  returning id into v_id;

  return v_id;
end
$$;

create or replace function public.dd_complete_governed_agent_run(
  p_run_id uuid,
  p_authoritative_record_id text,
  p_evaluated_state jsonb,
  p_decision text,
  p_decision_reason_code text,
  p_tool_result_refs jsonb default '[]'::jsonb,
  p_turns_used integer default 0,
  p_tool_calls_used integer default 0,
  p_retries_used integer default 0,
  p_handoff_target_stage text default null,
  p_handoff_reason text default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_run public.dd_agent_run_control%rowtype;
  v_auth public.dd_execution_authority_map%rowtype;
  v_policy public.dd_agent_runtime_policy%rowtype;
  v_handoff_id uuid;
  v_snapshot_id uuid;
  v_record_uuid uuid;
begin
  select * into v_run from public.dd_agent_run_control where id=p_run_id for update;
  if not found then raise exception 'RUN_NOT_FOUND'; end if;
  if v_run.status not in ('RUNNING','PAUSED') then raise exception 'RUN_NOT_COMPLETABLE'; end if;

  select * into v_auth from public.dd_execution_authority_map
  where stage_key=v_run.stage_key and is_active=true;
  if not found then raise exception 'STAGE_NOT_AUTHORIZED'; end if;

  v_policy := public.dd_resolve_agent_runtime_policy(v_run.agent_key,v_run.stage_key);

  if p_turns_used > v_policy.max_agent_turns
     or p_tool_calls_used > v_policy.max_tool_calls
     or p_retries_used > v_policy.max_retries then
    update public.dd_agent_run_control
    set status='CIRCUIT_BROKEN',breaker_reason='RUNTIME_BUDGET_EXCEEDED',
        turns_used=p_turns_used,tool_calls_used=p_tool_calls_used,retries_used=p_retries_used,
        completed_at=now(),last_activity_at=now()
    where id=p_run_id;
    raise exception 'RUNTIME_BUDGET_EXCEEDED';
  end if;

  if p_handoff_target_stage is not null then
    begin v_record_uuid := p_authoritative_record_id::uuid;
    exception when invalid_text_representation then
      raise exception 'HANDOFF_REQUIRES_UUID_AUTHORITATIVE_RECORD';
    end;

    insert into public.dd_execution_handoff_ledger(
      source_stage,target_stage,authoritative_record_id,authoritative_table,
      handoff_reason,actor_key,status,metadata
    ) values (
      v_run.stage_key,p_handoff_target_stage,v_record_uuid,v_auth.authoritative_table,
      coalesce(p_handoff_reason,'GOVERNED_AGENT_HANDOFF'),v_run.agent_key,'RECORDED',
      jsonb_build_object('correlation_id',v_run.correlation_id,'runtime_run_id',v_run.id)
    ) returning id into v_handoff_id;
  end if;

  insert into public.dd_agent_decision_snapshots(
    correlation_id,agent_key,stage_key,authoritative_table,authoritative_record_id,
    handoff_ledger_id,trace_id,policy_key,evaluated_state,evaluated_state_hash,
    tool_result_refs,decision,decision_reason_code
  ) values (
    v_run.correlation_id,v_run.agent_key,v_run.stage_key,v_auth.authoritative_table,
    p_authoritative_record_id,v_handoff_id,v_run.trace_id,v_policy.policy_key,
    coalesce(p_evaluated_state,'{}'::jsonb),md5(coalesce(p_evaluated_state,'{}'::jsonb)::text),
    coalesce(p_tool_result_refs,'[]'::jsonb),p_decision,p_decision_reason_code
  ) returning id into v_snapshot_id;

  update public.dd_agent_run_control
  set status='COMPLETED',turns_used=p_turns_used,tool_calls_used=p_tool_calls_used,
      retries_used=p_retries_used,completed_at=now(),last_activity_at=now()
  where id=p_run_id;

  return jsonb_build_object(
    'run_id',p_run_id,'decision_snapshot_id',v_snapshot_id,'handoff_ledger_id',v_handoff_id,
    'runtime_policy_key',v_policy.policy_key
  );
end
$$;

revoke all on function public.dd_resolve_agent_runtime_policy(text,text) from public, anon, authenticated;
revoke all on function public.dd_begin_governed_agent_run(uuid,text,text,text) from public, anon, authenticated;
revoke all on function public.dd_complete_governed_agent_run(uuid,text,jsonb,text,text,jsonb,integer,integer,integer,text,text) from public, anon, authenticated;

grant execute on function public.dd_resolve_agent_runtime_policy(text,text) to service_role;
grant execute on function public.dd_begin_governed_agent_run(uuid,text,text,text) to service_role;
grant execute on function public.dd_complete_governed_agent_run(uuid,text,jsonb,text,text,jsonb,integer,integer,integer,text,text) to service_role;
