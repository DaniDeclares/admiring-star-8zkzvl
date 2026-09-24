-- Durable boundary for external side effects. Delivery is at-least-once; business effects must be idempotent.
create table if not exists public.dd_external_action_outbox (
 id uuid primary key default gen_random_uuid(), correlation_id uuid not null, action_key text not null, action_type text not null,
 destination_system text not null, authoritative_table text not null, authoritative_record_id text not null,
 payload jsonb not null default '{}'::jsonb, payload_hash text not null, idempotency_key text not null unique,
 sequence_no bigint generated always as identity,
 status text not null default 'PENDING' check(status in ('PENDING','CLAIMED','SUCCEEDED','RETRY_WAIT','DEAD_LETTER','CANCELLED')),
 attempt_count integer not null default 0, max_attempts integer not null default 3 check(max_attempts>0),
 next_attempt_at timestamptz not null default now(), claimed_at timestamptz, claimed_by text, lease_expires_at timestamptz,
 succeeded_at timestamptz, last_error_code text, last_error text, external_reference text,
 runtime_run_id uuid references public.dd_agent_run_control(id), decision_snapshot_id uuid references public.dd_agent_decision_snapshots(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists dd_external_action_outbox_dispatch_idx on public.dd_external_action_outbox(status,next_attempt_at,sequence_no);
create table if not exists public.dd_external_action_attempts (
 id uuid primary key default gen_random_uuid(), outbox_id uuid not null references public.dd_external_action_outbox(id),
 attempt_no integer not null, worker_key text not null, started_at timestamptz not null default now(), completed_at timestamptz,
 outcome text not null default 'STARTED', response_code text, external_reference text, error_code text, error_detail text, trace_id text,
 unique(outbox_id,attempt_no)
);
create table if not exists public.dd_external_action_receipts (
 id uuid primary key default gen_random_uuid(), destination_system text not null, idempotency_key text not null,
 external_reference text, outcome text not null, first_processed_at timestamptz not null default now(),
 last_seen_at timestamptz not null default now(), duplicate_seen_count integer not null default 0,
 metadata jsonb not null default '{}'::jsonb, unique(destination_system,idempotency_key)
);
create table if not exists public.dd_external_action_dead_letters (
 id uuid primary key default gen_random_uuid(), outbox_id uuid not null unique references public.dd_external_action_outbox(id),
 destination_system text not null, action_type text not null, failure_class text not null, final_error text,
 routed_owner_attention_id uuid references public.dd_owner_attention_queue(id), created_at timestamptz not null default now(),
 resolved_at timestamptz, resolution text
);
create or replace function public.dd_enqueue_external_action(
 p_correlation_id uuid,p_action_key text,p_action_type text,p_destination_system text,
 p_authoritative_table text,p_authoritative_record_id text,p_payload jsonb,p_idempotency_key text,p_max_attempts integer default 3
) returns uuid language plpgsql set search_path = public, pg_temp as $
declare v_id uuid;
begin
 insert into public.dd_external_action_outbox(correlation_id,action_key,action_type,destination_system,authoritative_table,authoritative_record_id,payload,payload_hash,idempotency_key,max_attempts)
 values(p_correlation_id,p_action_key,p_action_type,p_destination_system,p_authoritative_table,p_authoritative_record_id,
 coalesce(p_payload,'{}'::jsonb),md5(coalesce(p_payload,'{}'::jsonb)::text),p_idempotency_key,p_max_attempts)
 on conflict(idempotency_key) do update set updated_at=public.dd_external_action_outbox.updated_at returning id into v_id;
 return v_id;
end $$;
create or replace function public.dd_claim_external_actions(p_worker_key text,p_limit integer default 10)
returns setof public.dd_external_action_outbox language plpgsql set search_path = public, pg_temp as $
begin
 return query with candidates as (
  select id from public.dd_external_action_outbox
  where (status in ('PENDING','RETRY_WAIT') and next_attempt_at<=now()) or (status='CLAIMED' and lease_expires_at<now())
  order by sequence_no for update skip locked limit greatest(1,least(p_limit,100))
 )
 update public.dd_external_action_outbox o set status='CLAIMED',claimed_at=now(),claimed_by=p_worker_key,
 lease_expires_at=now()+interval '5 minutes',updated_at=now() from candidates c where o.id=c.id returning o.*;
end $$;

alter table public.dd_external_action_outbox enable row level security;
alter table public.dd_external_action_attempts enable row level security;
alter table public.dd_external_action_receipts enable row level security;
alter table public.dd_external_action_dead_letters enable row level security;
