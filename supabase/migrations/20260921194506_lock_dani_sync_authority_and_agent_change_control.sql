
update public.dd_system_of_record_registry
set system_name='DANI / Supabase',
    notes='DANI dd_jobs is current production dispatch and field-service authority. Jobber/Housecall Pro are reference/integration patterns only unless a deliberate governed migration changes this boundary.',
    updated_at=now()
where data_domain='FIELD_SERVICE';

insert into public.dd_system_of_record_registry(data_domain,system_name,authority_level,notes,status)
values
('KNOWLEDGE_SOPS','Notion','PRIMARY','SOPs, manuals, policies and institutional knowledge. Runtime/commercial truth remains in DANI.','LOCKED'),
('WORK_MANAGEMENT','Asana','PRIMARY','Projects, implementation tasks and release execution. Runtime/commercial truth remains in DANI.','LOCKED'),
('BUSINESS_DOCUMENTS','Google Drive','PRIMARY','Collaborative business files and document bytes. DANI retains governed metadata and operational references.','LOCKED'),
('BUSINESS_CALENDAR','Google Calendar','PRIMARY','Human calendar surface and availability. DANI retains job/appointment lifecycle authority.','LOCKED'),
('BUSINESS_MAILBOX','Gmail','PRIMARY','Mailbox content and delivery state. DANI/HubSpot retain governed customer and workflow identities.','LOCKED'),
('PLANNING_WORKSPACES','Airtable','PRIMARY','Explicitly assigned planning, review and flexible working datasets only; never implicit production runtime authority.','LOCKED')
on conflict(data_domain) do update set
 system_name=excluded.system_name,authority_level=excluded.authority_level,notes=excluded.notes,status=excluded.status,updated_at=now();

create table if not exists public.dd_agent_change_ledger (
 id uuid primary key default gen_random_uuid(),
 agent_name text not null,
 task_key text not null,
 repository text,
 branch_name text,
 pull_request_number integer,
 change_scope jsonb not null default '[]'::jsonb,
 migration_names jsonb not null default '[]'::jsonb,
 status text not null default 'IN_PROGRESS' check (status in ('IN_PROGRESS','BLOCKED','READY_FOR_REVIEW','MERGED','ABANDONED')),
 started_at timestamptz not null default now(),
 completed_at timestamptz,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(repository, branch_name)
);
create index if not exists dd_agent_change_ledger_status_idx on public.dd_agent_change_ledger(status,updated_at desc);
comment on table public.dd_agent_change_ledger is 'Cross-agent coordination ledger. ChatGPT, Claude, humans and other coding agents register active branches/change scopes here to reduce conflicting edits and silent overwrites.';
