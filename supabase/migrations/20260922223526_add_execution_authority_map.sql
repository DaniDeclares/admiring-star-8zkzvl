
create table if not exists public.dd_execution_authority_map (
  id uuid primary key default gen_random_uuid(),
  stage_key text not null unique,
  authoritative_table text not null,
  authoritative_record_type text not null,
  prepare_authority jsonb not null default '[]'::jsonb,
  approve_authority jsonb not null default '[]'::jsonb,
  execute_authority jsonb not null default '[]'::jsonb,
  prohibited_parallel_sources jsonb not null default '[]'::jsonb,
  handoff_condition text,
  owner_override boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dd_execution_handoff_ledger (
  id uuid primary key default gen_random_uuid(),
  source_stage text not null,
  target_stage text not null,
  authoritative_record_id uuid,
  authoritative_table text not null,
  handoff_reason text not null,
  actor_key text,
  status text not null default 'RECORDED',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists dd_execution_authority_one_active_stage
on public.dd_execution_authority_map(stage_key)
where is_active = true;
