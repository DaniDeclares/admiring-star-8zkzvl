
create or replace function public.dd_enqueue_governed_agent_external_action(
  p_run_id uuid,
  p_decision_snapshot_id uuid,
  p_action_key text,
  p_action_type text,
  p_destination_system text,
  p_authoritative_record_id text,
  p_payload jsonb,
  p_idempotency_key text,
  p_max_attempts integer default 3
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_run public.dd_agent_run_control%rowtype;
  v_snapshot public.dd_agent_decision_snapshots%rowtype;
  v_auth public.dd_execution_authority_map%rowtype;
  v_id uuid;
begin
  select * into v_run from public.dd_agent_run_control where id=p_run_id;
  if not found then raise exception 'RUN_NOT_FOUND'; end if;
  if v_run.status <> 'COMPLETED' then raise exception 'RUN_NOT_COMPLETED'; end if;

  select * into v_snapshot from public.dd_agent_decision_snapshots
  where id=p_decision_snapshot_id
    and correlation_id=v_run.correlation_id
    and agent_key=v_run.agent_key
    and stage_key=v_run.stage_key;
  if not found then raise exception 'DECISION_SNAPSHOT_NOT_BOUND_TO_RUN'; end if;

  select * into v_auth from public.dd_execution_authority_map
  where stage_key=v_run.stage_key and is_active=true;
  if not found then raise exception 'STAGE_NOT_AUTHORIZED'; end if;

  if not (coalesce(v_auth.execute_authority,'[]'::jsonb) ? v_run.agent_key) then
    raise exception 'AGENT_NOT_EXECUTION_AUTHORITY';
  end if;

  if coalesce(p_idempotency_key,'')='' then raise exception 'IDEMPOTENCY_KEY_REQUIRED'; end if;

  insert into public.dd_external_action_outbox(
    correlation_id,runtime_run_id,decision_snapshot_id,action_key,action_type,
    destination_system,authoritative_table,authoritative_record_id,payload,payload_hash,
    idempotency_key,max_attempts
  ) values (
    v_run.correlation_id,v_run.id,v_snapshot.id,p_action_key,p_action_type,
    p_destination_system,v_auth.authoritative_table,p_authoritative_record_id,
    coalesce(p_payload,'{}'::jsonb),md5(coalesce(p_payload,'{}'::jsonb)::text),
    p_idempotency_key,p_max_attempts
  )
  on conflict(idempotency_key) do update
    set updated_at=public.dd_external_action_outbox.updated_at
  returning id into v_id;

  return v_id;
end
$$;

revoke all on function public.dd_enqueue_governed_agent_external_action(uuid,uuid,text,text,text,text,jsonb,text,integer)
from public, anon, authenticated;
grant execute on function public.dd_enqueue_governed_agent_external_action(uuid,uuid,text,text,text,text,jsonb,text,integer)
to service_role;
