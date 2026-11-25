-- Extend the existing governed-agent runtime. No new queue, scheduler, telemetry table, or authority.
-- Existing policies remain SHADOW by default; no policy rows are promoted by this migration.

alter table public.dd_agent_runtime_policy
  add column if not exists resource_governance_mode text not null default 'SHADOW',
  add column if not exists max_model_calls integer;

comment on column public.dd_agent_runtime_policy.resource_governance_mode is
  'SHADOW records usage without changing existing action authority; ENFORCE blocks unverified or over-budget runs before external actions.';
comment on column public.dd_agent_runtime_policy.max_model_calls is
  'Optional per-run model-call ceiling; null falls back to max_agent_turns.';

alter table public.dd_agent_run_control
  add column if not exists model_calls_used integer not null default 0,
  add column if not exists reserved_model_calls integer not null default 0,
  add column if not exists reserved_input_tokens bigint not null default 0,
  add column if not exists reserved_output_tokens bigint not null default 0,
  add column if not exists reserved_cost_usd numeric(12,6) not null default 0,
  add column if not exists actual_cost_usd numeric(12,6) not null default 0,
  add column if not exists resource_usage_status text not null default 'UNKNOWN',
  add column if not exists resource_usage_receipts jsonb not null default '{}'::jsonb;

do $constraints$
begin
  if not exists (select 1 from pg_constraint where conrelid='public.dd_agent_runtime_policy'::regclass and conname='dd_agent_runtime_policy_resource_mode_ck') then
    alter table public.dd_agent_runtime_policy
      add constraint dd_agent_runtime_policy_resource_mode_ck check (resource_governance_mode in ('SHADOW','ENFORCE'));
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.dd_agent_runtime_policy'::regclass and conname='dd_agent_runtime_policy_max_model_calls_ck') then
    alter table public.dd_agent_runtime_policy
      add constraint dd_agent_runtime_policy_max_model_calls_ck check (max_model_calls is null or max_model_calls >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.dd_agent_run_control'::regclass and conname='dd_agent_run_control_model_calls_ck') then
    alter table public.dd_agent_run_control
      add constraint dd_agent_run_control_model_calls_ck check (model_calls_used >= 0 and reserved_model_calls >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.dd_agent_run_control'::regclass and conname='dd_agent_run_control_reserved_resource_ck') then
    alter table public.dd_agent_run_control
      add constraint dd_agent_run_control_reserved_resource_ck check (
        reserved_input_tokens >= 0 and reserved_output_tokens >= 0 and reserved_cost_usd >= 0 and actual_cost_usd >= 0
      );
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.dd_agent_run_control'::regclass and conname='dd_agent_run_control_resource_status_ck') then
    alter table public.dd_agent_run_control
      add constraint dd_agent_run_control_resource_status_ck check (
        resource_usage_status in ('UNKNOWN','RESERVED','PARTIAL','WITHIN_LIMITS','EXCEEDED','INVALID')
      );
  end if;
  if not exists (select 1 from pg_constraint where conrelid='public.dd_agent_run_control'::regclass and conname='dd_agent_run_control_resource_receipts_ck') then
    alter table public.dd_agent_run_control
      add constraint dd_agent_run_control_resource_receipts_ck check (jsonb_typeof(resource_usage_receipts)='object');
  end if;
end
$constraints$;

create or replace function public.dd_reserve_governed_agent_model_call(
  p_run_id uuid,
  p_reservation_key text,
  p_estimated_input_tokens bigint,
  p_estimated_output_tokens bigint,
  p_estimated_cost_usd numeric,
  p_model_provider text default null,
  p_model_name text default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_run public.dd_agent_run_control%rowtype;
  v_policy public.dd_agent_runtime_policy%rowtype;
  v_receipt jsonb;
  v_mode text;
  v_max_model_calls integer;
  v_elapsed_seconds integer;
  v_missing text[] := '{}';
  v_invalid text[] := '{}';
  v_exceeded text[] := '{}';
  v_resource_status text;
  v_reason text;
begin
  if coalesce(btrim(p_reservation_key),'')='' or length(p_reservation_key)>180 then
    return jsonb_build_object('authorized',false,'status','INVALID','reason','RESERVATION_KEY_REQUIRED','retryAllowed',false);
  end if;

  select * into v_run
  from public.dd_agent_run_control
  where id=p_run_id
  for update;
  if not found then
    return jsonb_build_object('authorized',false,'status','UNKNOWN','reason','RUN_NOT_FOUND','retryAllowed',false);
  end if;
  if v_run.status <> 'RUNNING' then
    return jsonb_build_object('authorized',false,'status',v_run.resource_usage_status,'reason','RUN_NOT_RUNNING','runStatus',v_run.status,'retryAllowed',false);
  end if;

  select * into v_policy
  from public.dd_agent_runtime_policy
  where policy_key=v_run.runtime_policy_key and is_active=true;
  if not found then
    update public.dd_agent_run_control
    set status='PAUSED',resource_usage_status='UNKNOWN',breaker_reason='RUNTIME_POLICY_UNAVAILABLE',last_activity_at=clock_timestamp()
    where id=p_run_id;
    return jsonb_build_object('authorized',false,'status','UNKNOWN','reason','RUNTIME_POLICY_UNAVAILABLE','retryAllowed',false);
  end if;

  v_mode := coalesce(v_policy.resource_governance_mode,'SHADOW');
  if coalesce(v_run.resource_usage_receipts,'{}'::jsonb) ? p_reservation_key then
    v_receipt := v_run.resource_usage_receipts -> p_reservation_key;
    return jsonb_build_object(
      'authorized',(v_receipt->>'status')='RESERVED',
      'alreadyExists',true,
      'status',coalesce(v_receipt->>'status','UNKNOWN'),
      'receipt',v_receipt,
      'retryAllowed',false
    );
  end if;

  if p_estimated_input_tokens is not null and p_estimated_input_tokens < 0 then v_invalid := array_append(v_invalid,'input_tokens'); end if;
  if p_estimated_output_tokens is not null and p_estimated_output_tokens < 0 then v_invalid := array_append(v_invalid,'output_tokens'); end if;
  if p_estimated_cost_usd is not null and p_estimated_cost_usd < 0 then v_invalid := array_append(v_invalid,'cost_usd'); end if;
  if p_estimated_input_tokens is null then v_missing := array_append(v_missing,'input_tokens'); end if;
  if p_estimated_output_tokens is null then v_missing := array_append(v_missing,'output_tokens'); end if;
  if v_policy.cost_budget_usd is not null and p_estimated_cost_usd is null then
    v_missing := array_append(v_missing,'cost_usd');
  end if;

  v_elapsed_seconds := greatest(0,floor(extract(epoch from clock_timestamp()-v_run.started_at))::integer);
  v_max_model_calls := coalesce(v_policy.max_model_calls,v_policy.max_agent_turns);
  if v_elapsed_seconds > v_policy.max_elapsed_seconds then v_exceeded := array_append(v_exceeded,'elapsed_seconds'); end if;
  if v_run.model_calls_used + v_run.reserved_model_calls + 1 > v_max_model_calls then v_exceeded := array_append(v_exceeded,'model_calls'); end if;
  if v_policy.token_budget is not null
     and p_estimated_input_tokens is not null and p_estimated_output_tokens is not null
     and v_run.input_tokens + v_run.output_tokens + v_run.reserved_input_tokens + v_run.reserved_output_tokens
       + p_estimated_input_tokens + p_estimated_output_tokens > v_policy.token_budget then
    v_exceeded := array_append(v_exceeded,'tokens');
  end if;
  if v_policy.cost_budget_usd is not null and p_estimated_cost_usd is not null
     and v_run.actual_cost_usd + v_run.reserved_cost_usd + p_estimated_cost_usd > v_policy.cost_budget_usd then
    v_exceeded := array_append(v_exceeded,'cost_usd');
  end if;

  if cardinality(v_invalid)>0 then
    v_resource_status := 'INVALID';
    v_reason := 'RESOURCE_ESTIMATE_INVALID';
  elsif cardinality(v_exceeded)>0 then
    v_resource_status := 'EXCEEDED';
    v_reason := 'RESOURCE_BUDGET_EXCEEDED';
  elsif cardinality(v_missing)>0 then
    v_resource_status := 'UNKNOWN';
    v_reason := 'RESOURCE_ESTIMATE_UNKNOWN';
  else
    v_resource_status := 'RESERVED';
    v_reason := null;
  end if;

  if cardinality(v_invalid)>0 or (v_mode='ENFORCE' and (cardinality(v_exceeded)>0 or cardinality(v_missing)>0)) then
    update public.dd_agent_run_control
    set status=case when cardinality(v_exceeded)>0 then 'CIRCUIT_BROKEN' else 'PAUSED' end,
        resource_usage_status=v_resource_status,
        breaker_reason=v_reason,
        last_activity_at=clock_timestamp(),
        completed_at=case when cardinality(v_exceeded)>0 then clock_timestamp() else completed_at end
    where id=p_run_id;
    return jsonb_build_object(
      'authorized',false,'status',v_resource_status,'reason',v_reason,
      'missing',to_jsonb(v_missing),'invalid',to_jsonb(v_invalid),'exceeded',to_jsonb(v_exceeded),
      'mode',v_mode,'retryAllowed',false
    );
  end if;

  v_receipt := jsonb_build_object(
    'status',v_resource_status,
    'estimatedInputTokens',p_estimated_input_tokens,
    'estimatedOutputTokens',p_estimated_output_tokens,
    'estimatedCostUsd',p_estimated_cost_usd,
    'modelProvider',p_model_provider,
    'modelName',p_model_name,
    'createdAt',clock_timestamp()
  );

  update public.dd_agent_run_control
  set reserved_model_calls=reserved_model_calls+1,
      reserved_input_tokens=reserved_input_tokens+coalesce(p_estimated_input_tokens,0),
      reserved_output_tokens=reserved_output_tokens+coalesce(p_estimated_output_tokens,0),
      reserved_cost_usd=reserved_cost_usd+coalesce(p_estimated_cost_usd,0),
      resource_usage_status=v_resource_status,
      resource_usage_receipts=jsonb_set(coalesce(resource_usage_receipts,'{}'::jsonb),array[p_reservation_key],v_receipt,true),
      last_activity_at=clock_timestamp()
  where id=p_run_id;

  return jsonb_build_object(
    'authorized',true,'status',v_resource_status,'mode',v_mode,
    'missing',to_jsonb(v_missing),'exceeded',to_jsonb(v_exceeded),
    'reservationKey',p_reservation_key,'retryAllowed',false
  );
end
$function$;

create or replace function public.dd_record_governed_agent_model_usage(
  p_run_id uuid,
  p_reservation_key text,
  p_actual_input_tokens bigint,
  p_actual_output_tokens bigint,
  p_actual_cost_usd numeric,
  p_usage_source text default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_run public.dd_agent_run_control%rowtype;
  v_policy public.dd_agent_runtime_policy%rowtype;
  v_receipt jsonb;
  v_mode text;
  v_estimated_input bigint;
  v_estimated_output bigint;
  v_estimated_cost numeric;
  v_total_tokens bigint;
  v_total_cost numeric;
  v_elapsed_seconds integer;
  v_max_model_calls integer;
  v_missing text[] := '{}';
  v_invalid text[] := '{}';
  v_exceeded text[] := '{}';
  v_resource_status text;
  v_reason text;
begin
  if coalesce(btrim(p_reservation_key),'')='' or length(p_reservation_key)>180 then
    return jsonb_build_object('accepted',false,'status','INVALID','reason','RESERVATION_KEY_REQUIRED','retryAllowed',false);
  end if;
  select * into v_run
  from public.dd_agent_run_control
  where id=p_run_id
  for update;
  if not found then
    return jsonb_build_object('accepted',false,'status','UNKNOWN','reason','RUN_NOT_FOUND','retryAllowed',false);
  end if;

  select * into v_policy
  from public.dd_agent_runtime_policy
  where policy_key=v_run.runtime_policy_key and is_active=true;
  if not found then
    update public.dd_agent_run_control
    set status='PAUSED',resource_usage_status='UNKNOWN',breaker_reason='RUNTIME_POLICY_UNAVAILABLE',last_activity_at=clock_timestamp()
    where id=p_run_id;
    return jsonb_build_object('accepted',false,'status','UNKNOWN','reason','RUNTIME_POLICY_UNAVAILABLE','retryAllowed',false);
  end if;
  v_mode := coalesce(v_policy.resource_governance_mode,'SHADOW');

  v_receipt := coalesce(v_run.resource_usage_receipts,'{}'::jsonb) -> p_reservation_key;
  if v_receipt is null then
    return jsonb_build_object('accepted',false,'status','UNKNOWN','reason','RESERVATION_NOT_FOUND','retryAllowed',false);
  end if;
  if v_receipt->>'status'='RECORDED' then
    return jsonb_build_object('accepted',true,'alreadyRecorded',true,'status',v_run.resource_usage_status,'retryAllowed',false);
  end if;
  if v_run.reserved_model_calls<=0 then
    update public.dd_agent_run_control
    set status=case when v_mode='ENFORCE' then 'PAUSED' else status end,
        resource_usage_status='INVALID',
        breaker_reason=case when v_mode='ENFORCE' then 'RESOURCE_RESERVATION_COUNTER_MISMATCH' else breaker_reason end,
        last_activity_at=clock_timestamp()
    where id=p_run_id;
    return jsonb_build_object('accepted',false,'status','INVALID','reason','RESOURCE_RESERVATION_COUNTER_MISMATCH','retryAllowed',false);
  end if;
  if v_run.status not in ('RUNNING','PAUSED') then
    return jsonb_build_object('accepted',false,'status',v_run.resource_usage_status,'reason','RUN_NOT_RECORDABLE','runStatus',v_run.status,'retryAllowed',false);
  end if;

  if p_actual_input_tokens is null then v_missing := array_append(v_missing,'input_tokens'); end if;
  if p_actual_output_tokens is null then v_missing := array_append(v_missing,'output_tokens'); end if;
  if p_actual_cost_usd is null and v_policy.cost_budget_usd is not null then v_missing := array_append(v_missing,'cost_usd'); end if;
  if p_actual_input_tokens is not null and p_actual_input_tokens < 0 then v_invalid := array_append(v_invalid,'input_tokens'); end if;
  if p_actual_output_tokens is not null and p_actual_output_tokens < 0 then v_invalid := array_append(v_invalid,'output_tokens'); end if;
  if p_actual_cost_usd is not null and p_actual_cost_usd < 0 then v_invalid := array_append(v_invalid,'cost_usd'); end if;

  if cardinality(v_invalid)>0 or cardinality(v_missing)>0 then
    v_resource_status := case when cardinality(v_invalid)>0 then 'INVALID' else 'UNKNOWN' end;
    v_reason := case when cardinality(v_invalid)>0 then 'RESOURCE_USAGE_INVALID' else 'RESOURCE_USAGE_UNKNOWN' end;
    v_receipt := v_receipt || jsonb_build_object(
      'status',v_resource_status,
      'actualInputTokens',p_actual_input_tokens,
      'actualOutputTokens',p_actual_output_tokens,
      'actualCostUsd',p_actual_cost_usd,
      'usageSource',p_usage_source,
      'recordedAt',clock_timestamp()
    );
    update public.dd_agent_run_control
    set resource_usage_status=v_resource_status,
        resource_usage_receipts=jsonb_set(coalesce(resource_usage_receipts,'{}'::jsonb),array[p_reservation_key],v_receipt,true),
        status=case when v_mode='ENFORCE' then 'PAUSED' else status end,
        breaker_reason=case when v_mode='ENFORCE' then v_reason else breaker_reason end,
        last_activity_at=clock_timestamp()
    where id=p_run_id;
    return jsonb_build_object(
      'accepted',v_mode='SHADOW','status',v_resource_status,'reason',v_reason,
      'missing',to_jsonb(v_missing),'invalid',to_jsonb(v_invalid),'mode',v_mode,'retryAllowed',false
    );
  end if;

  v_estimated_input := coalesce((v_receipt->>'estimatedInputTokens')::bigint,0);
  v_estimated_output := coalesce((v_receipt->>'estimatedOutputTokens')::bigint,0);
  v_estimated_cost := coalesce((v_receipt->>'estimatedCostUsd')::numeric,0);

  v_total_tokens := v_run.input_tokens + v_run.output_tokens
    + v_run.reserved_input_tokens + v_run.reserved_output_tokens
    - v_estimated_input - v_estimated_output
    + p_actual_input_tokens + p_actual_output_tokens;
  v_total_cost := v_run.actual_cost_usd + coalesce(p_actual_cost_usd,0)
    + v_run.reserved_cost_usd - v_estimated_cost;
  v_elapsed_seconds := greatest(0,floor(extract(epoch from clock_timestamp()-v_run.started_at))::integer);
  v_max_model_calls := coalesce(v_policy.max_model_calls,v_policy.max_agent_turns);

  if v_elapsed_seconds > v_policy.max_elapsed_seconds then v_exceeded := array_append(v_exceeded,'elapsed_seconds'); end if;
  if v_run.model_calls_used + 1 + greatest(v_run.reserved_model_calls-1,0) > v_max_model_calls then v_exceeded := array_append(v_exceeded,'model_calls'); end if;
  if v_policy.token_budget is not null and v_total_tokens > v_policy.token_budget then v_exceeded := array_append(v_exceeded,'tokens'); end if;
  if v_policy.cost_budget_usd is not null and v_total_cost > v_policy.cost_budget_usd then v_exceeded := array_append(v_exceeded,'cost_usd'); end if;

  if cardinality(v_exceeded)>0 then
    v_resource_status := 'EXCEEDED';
    v_reason := 'RESOURCE_BUDGET_EXCEEDED';
  elsif v_run.reserved_model_calls > 1
     or v_run.reserved_input_tokens > v_estimated_input
     or v_run.reserved_output_tokens > v_estimated_output
     or v_run.reserved_cost_usd > v_estimated_cost then
    v_resource_status := 'PARTIAL';
    v_reason := null;
  else
    v_resource_status := 'WITHIN_LIMITS';
    v_reason := null;
  end if;

  v_receipt := v_receipt || jsonb_build_object(
    'status','RECORDED',
    'actualInputTokens',p_actual_input_tokens,
    'actualOutputTokens',p_actual_output_tokens,
    'actualCostUsd',p_actual_cost_usd,
    'usageSource',p_usage_source,
    'recordedAt',clock_timestamp()
  );

  update public.dd_agent_run_control
  set reserved_model_calls=greatest(0,reserved_model_calls-1),
      reserved_input_tokens=greatest(0,reserved_input_tokens-v_estimated_input),
      reserved_output_tokens=greatest(0,reserved_output_tokens-v_estimated_output),
      reserved_cost_usd=greatest(0,reserved_cost_usd-v_estimated_cost),
      input_tokens=input_tokens+coalesce(p_actual_input_tokens,0),
      output_tokens=output_tokens+coalesce(p_actual_output_tokens,0),
      actual_cost_usd=actual_cost_usd+coalesce(p_actual_cost_usd,0),
      model_calls_used=model_calls_used+1,
      resource_usage_status=v_resource_status,
      resource_usage_receipts=jsonb_set(coalesce(resource_usage_receipts,'{}'::jsonb),array[p_reservation_key],v_receipt,true),
      status=case when v_mode='ENFORCE' and cardinality(v_exceeded)>0 then 'CIRCUIT_BROKEN' else status end,
      breaker_reason=case when v_mode='ENFORCE' and cardinality(v_exceeded)>0 then v_reason else breaker_reason end,
      completed_at=case when v_mode='ENFORCE' and cardinality(v_exceeded)>0 then clock_timestamp() else completed_at end,
      last_activity_at=clock_timestamp()
  where id=p_run_id;

  return jsonb_build_object(
    'accepted',not (v_mode='ENFORCE' and cardinality(v_exceeded)>0),
    'status',v_resource_status,'mode',v_mode,
    'exceeded',to_jsonb(v_exceeded),'retryAllowed',false
  );
end
$function$;

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
as $function$
declare
  v_run public.dd_agent_run_control%rowtype;
  v_auth public.dd_execution_authority_map%rowtype;
  v_policy public.dd_agent_runtime_policy%rowtype;
  v_handoff_id uuid;
  v_snapshot_id uuid;
  v_record_uuid uuid;
  v_mode text;
  v_elapsed_seconds integer;
  v_max_model_calls integer;
  v_total_tokens bigint;
  v_total_cost numeric;
  v_resource_exceeded text[] := '{}';
  v_resource_status text;
  v_resource_reason text;
  v_state jsonb;
begin
  select * into v_run from public.dd_agent_run_control where id=p_run_id for update;
  if not found then raise exception 'RUN_NOT_FOUND'; end if;
  if v_run.status not in ('RUNNING','PAUSED') then raise exception 'RUN_NOT_COMPLETABLE'; end if;

  select * into v_auth from public.dd_execution_authority_map
  where stage_key=v_run.stage_key and is_active=true;
  if not found then raise exception 'STAGE_NOT_AUTHORIZED'; end if;

  v_policy := public.dd_resolve_agent_runtime_policy(v_run.agent_key,v_run.stage_key);
  v_mode := coalesce(v_policy.resource_governance_mode,'SHADOW');
  v_elapsed_seconds := greatest(0,floor(extract(epoch from clock_timestamp()-v_run.started_at))::integer);
  v_max_model_calls := coalesce(v_policy.max_model_calls,v_policy.max_agent_turns);
  v_total_tokens := v_run.input_tokens + v_run.output_tokens + v_run.reserved_input_tokens + v_run.reserved_output_tokens;
  v_total_cost := v_run.actual_cost_usd + v_run.reserved_cost_usd;

  if coalesce(p_turns_used,0) > v_policy.max_agent_turns
     or coalesce(p_tool_calls_used,0) > v_policy.max_tool_calls
     or coalesce(p_retries_used,0) > v_policy.max_retries then
    update public.dd_agent_run_control
    set status='CIRCUIT_BROKEN',breaker_reason='RUNTIME_BUDGET_EXCEEDED',
        turns_used=coalesce(p_turns_used,0),tool_calls_used=coalesce(p_tool_calls_used,0),retries_used=coalesce(p_retries_used,0),
        completed_at=clock_timestamp(),last_activity_at=clock_timestamp()
    where id=p_run_id;
    return jsonb_build_object('status','CIRCUIT_BROKEN','authorized',false,'reason','RUNTIME_BUDGET_EXCEEDED','retryAllowed',false);
  end if;

  if v_elapsed_seconds > v_policy.max_elapsed_seconds then v_resource_exceeded := array_append(v_resource_exceeded,'elapsed_seconds'); end if;
  if v_run.model_calls_used + v_run.reserved_model_calls > v_max_model_calls then v_resource_exceeded := array_append(v_resource_exceeded,'model_calls'); end if;
  if v_policy.token_budget is not null and v_total_tokens > v_policy.token_budget then v_resource_exceeded := array_append(v_resource_exceeded,'tokens'); end if;
  if v_policy.cost_budget_usd is not null and v_total_cost > v_policy.cost_budget_usd then v_resource_exceeded := array_append(v_resource_exceeded,'cost_usd'); end if;

  v_resource_status := v_run.resource_usage_status;
  if cardinality(v_resource_exceeded)>0 or v_run.resource_usage_status='EXCEEDED' then
    v_resource_status := 'EXCEEDED';
    v_resource_reason := 'RESOURCE_BUDGET_EXCEEDED';
  elsif v_run.model_calls_used=0 and v_run.reserved_model_calls=0
     and v_run.reserved_input_tokens=0 and v_run.reserved_output_tokens=0 and v_run.reserved_cost_usd=0 then
    v_resource_status := 'WITHIN_LIMITS';
  elsif v_run.reserved_model_calls>0 or v_run.reserved_input_tokens>0 or v_run.reserved_output_tokens>0 or v_run.reserved_cost_usd>0 then
    v_resource_status := 'PARTIAL';
    v_resource_reason := 'RESOURCE_RESERVATION_UNSETTLED';
  elsif v_run.resource_usage_status not in ('WITHIN_LIMITS') then
    v_resource_status := coalesce(v_run.resource_usage_status,'UNKNOWN');
    v_resource_reason := 'RESOURCE_USAGE_UNVERIFIED';
  else
    v_resource_status := 'WITHIN_LIMITS';
  end if;

  if v_mode='ENFORCE' and (cardinality(v_resource_exceeded)>0 or v_run.resource_usage_status='EXCEEDED') then
    update public.dd_agent_run_control
    set status='CIRCUIT_BROKEN',resource_usage_status='EXCEEDED',
        breaker_reason=v_resource_reason,turns_used=coalesce(p_turns_used,0),
        tool_calls_used=coalesce(p_tool_calls_used,0),retries_used=coalesce(p_retries_used,0),
        completed_at=clock_timestamp(),last_activity_at=clock_timestamp()
    where id=p_run_id;
    return jsonb_build_object('status','CIRCUIT_BROKEN','authorized',false,'reason',v_resource_reason,'resourceStatus','EXCEEDED','exceeded',to_jsonb(v_resource_exceeded),'retryAllowed',false);
  end if;

  if v_mode='ENFORCE' and v_run.model_calls_used>0 and v_resource_status<>'WITHIN_LIMITS' then
    update public.dd_agent_run_control
    set status='PAUSED',resource_usage_status=v_resource_status,
        breaker_reason=coalesce(v_resource_reason,'RESOURCE_USAGE_UNVERIFIED'),
        turns_used=coalesce(p_turns_used,0),tool_calls_used=coalesce(p_tool_calls_used,0),retries_used=coalesce(p_retries_used,0),
        last_activity_at=clock_timestamp()
    where id=p_run_id;
    return jsonb_build_object('status','PAUSED','authorized',false,'reason',coalesce(v_resource_reason,'RESOURCE_USAGE_UNVERIFIED'),'resourceStatus',v_resource_status,'retryAllowed',false);
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

  v_state := coalesce(p_evaluated_state,'{}'::jsonb) || jsonb_build_object(
    'resourceGovernance',jsonb_build_object(
      'mode',v_mode,'status',v_resource_status,'inputTokens',v_run.input_tokens,
      'outputTokens',v_run.output_tokens,'actualCostUsd',v_run.actual_cost_usd,
      'reservedInputTokens',v_run.reserved_input_tokens,'reservedOutputTokens',v_run.reserved_output_tokens,
      'reservedCostUsd',v_run.reserved_cost_usd,'modelCalls',v_run.model_calls_used,
      'reservedModelCalls',v_run.reserved_model_calls,'elapsedSeconds',v_elapsed_seconds,
      'exceeded',to_jsonb(v_resource_exceeded)
    )
  );

  insert into public.dd_agent_decision_snapshots(
    correlation_id,agent_key,stage_key,authoritative_table,authoritative_record_id,
    handoff_ledger_id,trace_id,policy_key,evaluated_state,evaluated_state_hash,
    tool_result_refs,decision,decision_reason_code
  ) values (
    v_run.correlation_id,v_run.agent_key,v_run.stage_key,v_auth.authoritative_table,
    p_authoritative_record_id,v_handoff_id,v_run.trace_id,v_policy.policy_key,
    v_state,md5(v_state::text),
    coalesce(p_tool_result_refs,'[]'::jsonb),p_decision,p_decision_reason_code
  ) returning id into v_snapshot_id;

  update public.dd_agent_run_control
  set status='COMPLETED',turns_used=coalesce(p_turns_used,0),tool_calls_used=coalesce(p_tool_calls_used,0),
      retries_used=coalesce(p_retries_used,0),resource_usage_status=v_resource_status,
      completed_at=clock_timestamp(),last_activity_at=clock_timestamp()
  where id=p_run_id;

  return jsonb_build_object(
    'status','COMPLETED','authorized',true,
    'run_id',p_run_id,'decision_snapshot_id',v_snapshot_id,'handoff_ledger_id',v_handoff_id,
    'runtime_policy_key',v_policy.policy_key,'resourceMode',v_mode,'resourceStatus',v_resource_status,
    'resourceExceeded',to_jsonb(v_resource_exceeded)
  );
end
$function$;

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
as $function$
declare
  v_run public.dd_agent_run_control%rowtype;
  v_snapshot public.dd_agent_decision_snapshots%rowtype;
  v_auth public.dd_execution_authority_map%rowtype;
  v_policy public.dd_agent_runtime_policy%rowtype;
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

  v_policy := public.dd_resolve_agent_runtime_policy(v_run.agent_key,v_run.stage_key);
  if coalesce(v_policy.resource_governance_mode,'SHADOW')='ENFORCE'
     and (v_run.resource_usage_status <> 'WITHIN_LIMITS'
       or v_run.reserved_model_calls>0
       or v_run.reserved_input_tokens>0
       or v_run.reserved_output_tokens>0
       or v_run.reserved_cost_usd>0) then
    raise exception 'RESOURCE_GOVERNANCE_NOT_GREEN';
  end if;

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
$function$;

revoke all on function public.dd_reserve_governed_agent_model_call(uuid,text,bigint,bigint,numeric,text,text) from public, anon, authenticated;
revoke all on function public.dd_record_governed_agent_model_usage(uuid,text,bigint,bigint,numeric,text) from public, anon, authenticated;
revoke all on function public.dd_complete_governed_agent_run(uuid,text,jsonb,text,text,jsonb,integer,integer,integer,text,text) from public, anon, authenticated;
revoke all on function public.dd_enqueue_governed_agent_external_action(uuid,uuid,text,text,text,text,jsonb,text,integer) from public, anon, authenticated;

grant execute on function public.dd_reserve_governed_agent_model_call(uuid,text,bigint,bigint,numeric,text,text) to service_role;
grant execute on function public.dd_record_governed_agent_model_usage(uuid,text,bigint,bigint,numeric,text) to service_role;
grant execute on function public.dd_complete_governed_agent_run(uuid,text,jsonb,text,text,jsonb,integer,integer,integer,text,text) to service_role;
grant execute on function public.dd_enqueue_governed_agent_external_action(uuid,uuid,text,text,text,text,jsonb,text,integer) to service_role;
