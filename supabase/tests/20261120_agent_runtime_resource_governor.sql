-- Disposable local/CI regression coverage for the existing agent run-control resource governor.
-- This test creates isolated fixtures only; it must never be run against Tester or Production.

do $test$
declare
  v_agent_enforce text := 'test_resource_agent_' || replace(gen_random_uuid()::text,'-','');
  v_stage_enforce text := 'test_resource_stage_' || replace(gen_random_uuid()::text,'-','');
  v_policy_enforce text := 'test_resource_policy_' || replace(gen_random_uuid()::text,'-','');
  v_agent_shadow text := 'test_resource_shadow_agent_' || replace(gen_random_uuid()::text,'-','');
  v_stage_shadow text := 'test_resource_shadow_stage_' || replace(gen_random_uuid()::text,'-','');
  v_policy_shadow text := 'test_resource_shadow_policy_' || replace(gen_random_uuid()::text,'-','');
  v_run_ok uuid;
  v_run_over uuid;
  v_run_unknown uuid;
  v_run_shadow uuid;
  v_run_elapsed uuid;
  v_run_model_limit uuid;
  v_run_actual_over uuid;
  v_run_actual_unknown uuid;
  v_run_turn_limit uuid;
  v_result jsonb;
  v_status text;
  v_reserved bigint;
  v_actual bigint;
begin
  insert into public.dd_revenue_agent_registry(agent_key,agent_name,responsibility,allowed_actions,prohibited_actions,is_active)
  values(v_agent_enforce,'Resource Governor Test Agent','Disposable local SQL regression fixture','[]'::jsonb,'[]'::jsonb,true);
  insert into public.dd_execution_authority_map(
    stage_key,authoritative_table,authoritative_record_type,prepare_authority,
    approve_authority,execute_authority,prohibited_parallel_sources,owner_override,is_active
  ) values(
    v_stage_enforce,'dd_agent_run_control','RESOURCE_GOVERNOR_TEST',
    jsonb_build_array(v_agent_enforce),jsonb_build_array(v_agent_enforce),
    jsonb_build_array(v_agent_enforce),'[]'::jsonb,false,true
  );
  insert into public.dd_agent_runtime_policy(
    policy_key,agent_key,stage_key,risk_tier,max_agent_turns,max_tool_calls,max_retries,
    max_elapsed_seconds,token_budget,cost_budget_usd,fallback_mode,require_human_approval,
    breaker_destination,is_active,resource_governance_mode,max_model_calls
  ) values(
    v_policy_enforce,v_agent_enforce,v_stage_enforce,'LOW',4,8,1,
    60,1000,0.05,'PAUSE_AND_ESCALATE',false,
    'dd_owner_attention_queue',true,'ENFORCE',1
  );

  insert into public.dd_revenue_agent_registry(agent_key,agent_name,responsibility,allowed_actions,prohibited_actions,is_active)
  values(v_agent_shadow,'Resource Governor Shadow Test Agent','Disposable local SQL regression fixture','[]'::jsonb,'[]'::jsonb,true);
  insert into public.dd_execution_authority_map(
    stage_key,authoritative_table,authoritative_record_type,prepare_authority,
    approve_authority,execute_authority,prohibited_parallel_sources,owner_override,is_active
  ) values(
    v_stage_shadow,'dd_agent_run_control','RESOURCE_GOVERNOR_SHADOW_TEST',
    jsonb_build_array(v_agent_shadow),jsonb_build_array(v_agent_shadow),
    jsonb_build_array(v_agent_shadow),'[]'::jsonb,false,true
  );
  insert into public.dd_agent_runtime_policy(
    policy_key,agent_key,stage_key,risk_tier,max_agent_turns,max_tool_calls,max_retries,
    max_elapsed_seconds,token_budget,cost_budget_usd,fallback_mode,require_human_approval,
    breaker_destination,is_active,resource_governance_mode,max_model_calls
  ) values(
    v_policy_shadow,v_agent_shadow,v_stage_shadow,'LOW',4,8,1,
    60,1000,0.05,'PAUSE_AND_ESCALATE',false,
    'dd_owner_attention_queue',true,'SHADOW',1
  );

  -- Complete, idempotent usage reconciliation stays within the existing policy.
  insert into public.dd_agent_run_control(correlation_id,agent_key,stage_key,runtime_policy_key,status,started_at,last_activity_at)
  values(gen_random_uuid(),v_agent_enforce,v_stage_enforce,v_policy_enforce,'RUNNING',clock_timestamp(),clock_timestamp())
  returning id into v_run_ok;
  v_result := public.dd_reserve_governed_agent_model_call(v_run_ok,'call-ok-1',400,100,0.02,'TEST_PROVIDER','TEST_MODEL');
  if (v_result->>'authorized')::boolean is not true then raise exception 'expected in-budget reservation: %',v_result; end if;
  v_result := public.dd_reserve_governed_agent_model_call(v_run_ok,'call-ok-1',400,100,0.02,'TEST_PROVIDER','TEST_MODEL');
  if (v_result->>'alreadyExists')::boolean is not true then raise exception 'reservation must be idempotent: %',v_result; end if;
  select reserved_input_tokens into v_reserved from public.dd_agent_run_control where id=v_run_ok;
  if v_reserved<>400 then raise exception 'duplicate reservation changed reserved token count: %',v_reserved; end if;

  v_result := public.dd_record_governed_agent_model_usage(v_run_ok,'call-ok-1',350,90,0.015,'test-provider-usage');
  if v_result->>'status'<>'WITHIN_LIMITS' then raise exception 'expected measured usage within limits: %',v_result; end if;
  v_result := public.dd_record_governed_agent_model_usage(v_run_ok,'call-ok-1',350,90,0.015,'test-provider-usage');
  if (v_result->>'alreadyRecorded')::boolean is not true then raise exception 'usage recording must be idempotent: %',v_result; end if;
  select input_tokens+output_tokens into v_actual from public.dd_agent_run_control where id=v_run_ok;
  if v_actual<>440 then raise exception 'duplicate usage changed actual token count: %',v_actual; end if;

  -- A pre-inference token overrun trips the breaker and blocks the external-action path.
  insert into public.dd_agent_run_control(correlation_id,agent_key,stage_key,runtime_policy_key,status,started_at,last_activity_at)
  values(gen_random_uuid(),v_agent_enforce,v_stage_enforce,v_policy_enforce,'RUNNING',clock_timestamp(),clock_timestamp())
  returning id into v_run_over;
  v_result := public.dd_reserve_governed_agent_model_call(v_run_over,'call-over-1',900,200,0.02,'TEST_PROVIDER','TEST_MODEL');
  if (v_result->>'authorized')::boolean is not false or v_result->>'status'<>'EXCEEDED' then
    raise exception 'enforced token overrun must be denied: %',v_result;
  end if;
  select status into v_status from public.dd_agent_run_control where id=v_run_over;
  if v_status<>'CIRCUIT_BROKEN' then raise exception 'overrun breaker state did not persist: %',v_status; end if;
  begin
    perform public.dd_enqueue_governed_agent_external_action(
      v_run_over,gen_random_uuid(),'resource-test-action','TEST','TEST_SYSTEM','TEST_RECORD',
      '{}'::jsonb,'resource-test-idempotency',1
    );
    raise exception 'expected external action to be blocked for circuit-broken run';
  exception when others then
    if sqlerrm not like 'RUN_NOT_COMPLETED%' then raise; end if;
  end;

  -- Missing estimates fail closed in ENFORCE mode; they are not treated as zero.
  insert into public.dd_agent_run_control(correlation_id,agent_key,stage_key,runtime_policy_key,status,started_at,last_activity_at)
  values(gen_random_uuid(),v_agent_enforce,v_stage_enforce,v_policy_enforce,'RUNNING',clock_timestamp(),clock_timestamp())
  returning id into v_run_unknown;
  v_result := public.dd_reserve_governed_agent_model_call(v_run_unknown,'call-unknown-1',null,null,null,'TEST_PROVIDER','TEST_MODEL');
  if (v_result->>'authorized')::boolean is not false or v_result->>'status'<>'UNKNOWN' then
    raise exception 'missing estimates must be unknown and denied in ENFORCE mode: %',v_result;
  end if;
  select status into v_status from public.dd_agent_run_control where id=v_run_unknown;
  if v_status<>'PAUSED' then raise exception 'unknown estimate did not pause run: %',v_status; end if;

  -- The model-call ceiling is independently enforced.
  insert into public.dd_agent_run_control(correlation_id,agent_key,stage_key,runtime_policy_key,status,started_at,last_activity_at)
  values(gen_random_uuid(),v_agent_enforce,v_stage_enforce,v_policy_enforce,'RUNNING',clock_timestamp(),clock_timestamp())
  returning id into v_run_model_limit;
  v_result := public.dd_reserve_governed_agent_model_call(v_run_model_limit,'call-limit-1',100,100,0.001,'TEST_PROVIDER','TEST_MODEL');
  if (v_result->>'authorized')::boolean is not true then raise exception 'first model call should be authorized: %',v_result; end if;
  v_result := public.dd_record_governed_agent_model_usage(v_run_model_limit,'call-limit-1',100,100,0.001,'test-provider-usage');
  if v_result->>'status'<>'WITHIN_LIMITS' then raise exception 'first model call should reconcile: %',v_result; end if;
  v_result := public.dd_reserve_governed_agent_model_call(v_run_model_limit,'call-limit-2',100,100,0.001,'TEST_PROVIDER','TEST_MODEL');
  if (v_result->>'authorized')::boolean is not false or v_result->>'status'<>'EXCEEDED' then
    raise exception 'model-call ceiling must deny second call: %',v_result;
  end if;

  -- Actual usage that exceeds the reservation is reconciled, then circuit-broken.
  insert into public.dd_agent_run_control(correlation_id,agent_key,stage_key,runtime_policy_key,status,started_at,last_activity_at)
  values(gen_random_uuid(),v_agent_enforce,v_stage_enforce,v_policy_enforce,'RUNNING',clock_timestamp(),clock_timestamp())
  returning id into v_run_actual_over;
  v_result := public.dd_reserve_governed_agent_model_call(v_run_actual_over,'call-actual-over-1',400,100,0.02,'TEST_PROVIDER','TEST_MODEL');
  if (v_result->>'authorized')::boolean is not true then raise exception 'actual-overrun test reservation should start within estimate: %',v_result; end if;
  v_result := public.dd_record_governed_agent_model_usage(v_run_actual_over,'call-actual-over-1',800,300,0.06,'test-provider-usage');
  if (v_result->>'accepted')::boolean is not false or v_result->>'status'<>'EXCEEDED' then
    raise exception 'actual usage overrun must be rejected in ENFORCE mode: %',v_result;
  end if;
  select status into v_status from public.dd_agent_run_control where id=v_run_actual_over;
  if v_status<>'CIRCUIT_BROKEN' then raise exception 'actual usage overrun breaker state did not persist: %',v_status; end if;

  -- Missing actual usage remains unknown and pauses enforcement; it is never recorded as zero.
  insert into public.dd_agent_run_control(correlation_id,agent_key,stage_key,runtime_policy_key,status,started_at,last_activity_at)
  values(gen_random_uuid(),v_agent_enforce,v_stage_enforce,v_policy_enforce,'RUNNING',clock_timestamp(),clock_timestamp())
  returning id into v_run_actual_unknown;
  v_result := public.dd_reserve_governed_agent_model_call(v_run_actual_unknown,'call-actual-unknown-1',100,100,0.001,'TEST_PROVIDER','TEST_MODEL');
  if (v_result->>'authorized')::boolean is not true then raise exception 'missing-usage test reservation should be authorized: %',v_result; end if;
  v_result := public.dd_record_governed_agent_model_usage(v_run_actual_unknown,'call-actual-unknown-1',null,null,null,'missing-provider-usage');
  if (v_result->>'accepted')::boolean is not false or v_result->>'status'<>'UNKNOWN' then
    raise exception 'missing actual usage must be rejected in ENFORCE mode: %',v_result;
  end if;
  select status into v_status from public.dd_agent_run_control where id=v_run_actual_unknown;
  if v_status<>'PAUSED' then raise exception 'missing actual usage did not pause run: %',v_status; end if;

  -- The completion breaker must persist its state rather than update and then raise (which rolls back).
  insert into public.dd_agent_run_control(correlation_id,agent_key,stage_key,runtime_policy_key,status,started_at,last_activity_at)
  values(gen_random_uuid(),v_agent_enforce,v_stage_enforce,v_policy_enforce,'RUNNING',clock_timestamp(),clock_timestamp())
  returning id into v_run_turn_limit;
  v_result := public.dd_complete_governed_agent_run(
    v_run_turn_limit,'RESOURCE_GOVERNOR_TURN_LIMIT_RECORD','{}'::jsonb,'RESOURCE_TEST','RUNTIME_BUDGET_TEST',
    '[]'::jsonb,99,0,0,null,null
  );
  if v_result->>'status'<>'CIRCUIT_BROKEN' then raise exception 'completion must return a durable breaker result: %',v_result; end if;
  select status into v_status from public.dd_agent_run_control where id=v_run_turn_limit;
  if v_status<>'CIRCUIT_BROKEN' then raise exception 'completion breaker update did not persist: %',v_status; end if;

  -- Shadow mode records overruns without silently labelling them green or enforcing them.
  insert into public.dd_agent_run_control(correlation_id,agent_key,stage_key,runtime_policy_key,status,started_at,last_activity_at)
  values(gen_random_uuid(),v_agent_shadow,v_stage_shadow,v_policy_shadow,'RUNNING',clock_timestamp(),clock_timestamp())
  returning id into v_run_shadow;
  v_result := public.dd_reserve_governed_agent_model_call(v_run_shadow,'call-shadow-1',900,200,0.10,'TEST_PROVIDER','TEST_MODEL');
  if (v_result->>'authorized')::boolean is not true or v_result->>'status'<>'EXCEEDED' then
    raise exception 'shadow overrun must be recorded without blocking inference: %',v_result;
  end if;
  v_result := public.dd_record_governed_agent_model_usage(v_run_shadow,'call-shadow-1',900,200,0.10,'test-provider-usage');
  if v_result->>'status'<>'EXCEEDED' or (v_result->>'accepted')::boolean is not true then
    raise exception 'shadow overrun must remain visible: %',v_result;
  end if;
  v_result := public.dd_complete_governed_agent_run(
    v_run_shadow,'RESOURCE_GOVERNOR_TEST_RECORD','{}'::jsonb,'RESOURCE_TEST','RESOURCE_TEST_VERIFIED',
    '[]'::jsonb,1,0,0,null,null
  );
  if v_result->>'status'<>'COMPLETED' or v_result->>'resourceStatus'<>'EXCEEDED' then
    raise exception 'shadow completion must preserve the overrun status: %',v_result;
  end if;

  -- Wall-time is evaluated from the existing run timestamps and policy ceiling.
  insert into public.dd_agent_run_control(correlation_id,agent_key,stage_key,runtime_policy_key,status,started_at,last_activity_at)
  values(gen_random_uuid(),v_agent_enforce,v_stage_enforce,v_policy_enforce,'RUNNING',clock_timestamp()-interval '2 minutes',clock_timestamp()-interval '2 minutes')
  returning id into v_run_elapsed;
  v_result := public.dd_reserve_governed_agent_model_call(v_run_elapsed,'call-elapsed-1',10,10,0.001,'TEST_PROVIDER','TEST_MODEL');
  if (v_result->>'authorized')::boolean is not false or v_result->>'status'<>'EXCEEDED' then
    raise exception 'elapsed-time ceiling must deny a late call: %',v_result;
  end if;
end
$test$;
