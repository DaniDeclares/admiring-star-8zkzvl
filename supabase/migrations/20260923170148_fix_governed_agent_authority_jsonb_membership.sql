
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
    coalesce(v_auth.prepare_authority,'[]'::jsonb) ? p_agent_key
    or coalesce(v_auth.approve_authority,'[]'::jsonb) ? p_agent_key
    or coalesce(v_auth.execute_authority,'[]'::jsonb) ? p_agent_key
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

revoke all on function public.dd_resolve_agent_runtime_policy(text,text) from public, anon, authenticated;
grant execute on function public.dd_resolve_agent_runtime_policy(text,text) to service_role;
