
create table if not exists public.dd_provenance_ledger (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  correlation_id uuid not null default gen_random_uuid(),
  parent_event_id uuid null references public.dd_provenance_ledger(id),
  source_system text not null,
  source_surface text null,
  actor_type text not null default 'AI',
  actor_key text null,
  event_type text not null,
  event_status text not null default 'RECORDED',
  authoritative_table text null,
  authoritative_record_id text null,
  repository text null,
  branch_name text null,
  commit_sha text null,
  pull_request_number integer null,
  deployment_id text null,
  deployment_environment text null,
  summary text not null,
  decision text null,
  evidence_refs jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  source_created_at timestamptz null,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists dd_provenance_ledger_correlation_idx
  on public.dd_provenance_ledger(correlation_id, recorded_at);
create index if not exists dd_provenance_ledger_source_idx
  on public.dd_provenance_ledger(source_system, recorded_at desc);
create index if not exists dd_provenance_ledger_event_type_idx
  on public.dd_provenance_ledger(event_type, recorded_at desc);
create index if not exists dd_provenance_ledger_authority_idx
  on public.dd_provenance_ledger(authoritative_table, authoritative_record_id);

alter table public.dd_provenance_ledger enable row level security;
revoke all on table public.dd_provenance_ledger from anon, authenticated;

create or replace function public.dd_record_provenance_event(
  p_event_key text,
  p_source_system text,
  p_event_type text,
  p_summary text,
  p_source_surface text default null,
  p_actor_type text default 'AI',
  p_actor_key text default null,
  p_event_status text default 'RECORDED',
  p_correlation_id uuid default null,
  p_parent_event_id uuid default null,
  p_authoritative_table text default null,
  p_authoritative_record_id text default null,
  p_repository text default null,
  p_branch_name text default null,
  p_commit_sha text default null,
  p_pull_request_number integer default null,
  p_deployment_id text default null,
  p_deployment_environment text default null,
  p_decision text default null,
  p_evidence_refs jsonb default '[]'::jsonb,
  p_metadata jsonb default '{}'::jsonb,
  p_source_created_at timestamptz default null
) returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_event_key is null or btrim(p_event_key) = '' then
    raise exception 'event_key is required';
  end if;
  if p_source_system not in ('CHATGPT','CLAUDE','WORK','DANI_RUNTIME','HUMAN','LEGACY') then
    raise exception 'unsupported source_system: %', p_source_system;
  end if;
  if p_event_type not in (
    'INSPECTION','DECISION','CODE_CHANGE','DATABASE_CHANGE','DEPLOYMENT',
    'HANDOFF','EXTERNAL_ACTION','SYSTEM_EVENT','RECONCILIATION'
  ) then
    raise exception 'unsupported event_type: %', p_event_type;
  end if;

  insert into public.dd_provenance_ledger(
    event_key,correlation_id,parent_event_id,source_system,source_surface,
    actor_type,actor_key,event_type,event_status,authoritative_table,
    authoritative_record_id,repository,branch_name,commit_sha,
    pull_request_number,deployment_id,deployment_environment,summary,
    decision,evidence_refs,metadata,source_created_at
  ) values (
    p_event_key,coalesce(p_correlation_id,gen_random_uuid()),p_parent_event_id,
    p_source_system,p_source_surface,p_actor_type,p_actor_key,p_event_type,
    p_event_status,p_authoritative_table,p_authoritative_record_id,p_repository,
    p_branch_name,p_commit_sha,p_pull_request_number,p_deployment_id,
    p_deployment_environment,p_summary,p_decision,coalesce(p_evidence_refs,'[]'::jsonb),
    coalesce(p_metadata,'{}'::jsonb),p_source_created_at
  )
  on conflict (event_key) do update set
    event_status = excluded.event_status,
    summary = excluded.summary,
    decision = coalesce(excluded.decision, public.dd_provenance_ledger.decision),
    evidence_refs = excluded.evidence_refs,
    metadata = public.dd_provenance_ledger.metadata || excluded.metadata,
    recorded_at = now()
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.dd_record_provenance_event(
 text,text,text,text,text,text,text,text,uuid,uuid,text,text,text,text,text,integer,text,text,text,jsonb,jsonb,timestamptz
) from public, anon, authenticated;
