
create table if not exists public.dd_agent_policy_registry (
 id uuid primary key default gen_random_uuid(),
 policy_key text not null,
 version integer not null,
 agent_key text,
 stage_key text,
 policy_type text not null,
 content_hash text not null,
 policy_document jsonb not null,
 status text not null default 'DRAFT',
 effective_at timestamptz,
 retired_at timestamptz,
 created_by text not null default 'system',
 created_at timestamptz not null default now(),
 unique(policy_key,version)
);

create table if not exists public.dd_agent_runtime_policy (
 id uuid primary key default gen_random_uuid(),
 policy_key text not null unique,
 agent_key text,
 stage_key text,
 risk_tier text not null check (risk_tier in ('LOW','MEDIUM','HIGH','CRITICAL')),
 max_agent_turns integer not null check (max_agent_turns > 0),
 max_tool_calls integer not null check (max_tool_calls > 0),
 max_retries integer not null default 2 check (max_retries >= 0),
 max_elapsed_seconds integer not null check (max_elapsed_seconds > 0),
 token_budget integer,
 cost_budget_usd numeric(10,4),
 fallback_mode text not null check (fallback_mode in ('DETERMINISTIC_ONLY','PAUSE_AND_ESCALATE','MODEL_FALLBACK_ALLOWED')),
 require_human_approval boolean not null default false,
 breaker_destination text not null default 'dd_owner_attention_queue',
 is_active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.dd_agent_run_control (
 id uuid primary key default gen_random_uuid(),
 correlation_id uuid not null,
 agent_key text not null,
 stage_key text not null,
 runtime_policy_key text not null,
 policy_version integer,
 trace_id text,
 status text not null default 'RUNNING',
 turns_used integer not null default 0,
 tool_calls_used integer not null default 0,
 retries_used integer not null default 0,
 input_tokens bigint not null default 0,
 output_tokens bigint not null default 0,
 estimated_cost_usd numeric(12,6) not null default 0,
 started_at timestamptz not null default now(),
 last_activity_at timestamptz not null default now(),
 completed_at timestamptz,
 breaker_reason text,
 fallback_used text,
 unique(correlation_id,agent_key,stage_key)
);

create table if not exists public.dd_agent_decision_snapshots (
 id uuid primary key default gen_random_uuid(),
 correlation_id uuid not null,
 agent_key text not null,
 stage_key text not null,
 authoritative_table text not null,
 authoritative_record_id text,
 handoff_ledger_id uuid references public.dd_execution_handoff_ledger(id),
 trace_id text,
 policy_key text,
 policy_version integer,
 prompt_hash text,
 model_provider text,
 model_name text,
 model_config jsonb not null default '{}'::jsonb,
 evaluated_state jsonb not null default '{}'::jsonb,
 evaluated_state_hash text,
 tool_result_refs jsonb not null default '[]'::jsonb,
 decision text not null,
 decision_reason_code text,
 created_at timestamptz not null default now()
);

create or replace function public.dd_prevent_snapshot_mutation()
returns trigger language plpgsql as $$
begin
 raise exception 'dd_agent_decision_snapshots is append-only';
end $$;

drop trigger if exists dd_agent_decision_snapshots_immutable on public.dd_agent_decision_snapshots;
create trigger dd_agent_decision_snapshots_immutable
before update or delete on public.dd_agent_decision_snapshots
for each row execute function public.dd_prevent_snapshot_mutation();
