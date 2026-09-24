
create table if not exists public.dd_accounting_exception_queue (
 id uuid primary key default gen_random_uuid(),
 exception_type text not null,
 source_system text,
 source_record_type text,
 source_record_id text,
 description text not null,
 assigned_lane text,
 status text not null default 'OPEN',
 requires_owner_decision boolean not null default false,
 resolution text,
 resolved_by text,
 resolved_at timestamptz,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create unique index if not exists dd_accounting_exception_source_unique
on public.dd_accounting_exception_queue(source_system,source_record_type,source_record_id,exception_type)
where source_record_id is not null and status <> 'RESOLVED';

create table if not exists public.dd_owner_attention_queue (
 id uuid primary key default gen_random_uuid(),
 domain text not null,
 source_table text not null,
 source_record_id text,
 reason text not null,
 priority text not null default 'NORMAL',
 status text not null default 'OPEN',
 recommended_action text,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 resolved_at timestamptz
);
