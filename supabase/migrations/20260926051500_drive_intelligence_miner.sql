-- DANI Drive Intelligence Miner runtime persistence.
-- Source files remain authoritative in Google Drive. This layer is read-only evidence indexing.
create table if not exists public.dd_drive_intelligence_runs(
 id uuid primary key default gen_random_uuid(), run_key text not null unique,
 status text not null default 'QUEUED', account_scope text[] not null default '{}',
 files_seen integer not null default 0, files_new integer not null default 0,
 files_triaged integer not null default 0, duplicates_found integer not null default 0,
 conflicts_found integer not null default 0, actionable_findings integer not null default 0,
 started_at timestamptz, completed_at timestamptz, run_metadata jsonb not null default '{}',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.dd_drive_intelligence_findings(
 id uuid primary key default gen_random_uuid(), finding_key text not null unique,
 source_file_id text not null, source_name text not null, source_path text, drive_account text,
 file_modified_at timestamptz, content_fingerprint text, duplicate_group_key text, version_group_key text,
 classification text not null default 'UNCLASSIFIED', domain_hint text,
 authority_class text not null default 'EVIDENCE_ONLY', freshness_status text not null default 'UNKNOWN',
 conflict_status text not null default 'NONE', conflict_with jsonb not null default '[]',
 extracted_claims jsonb not null default '[]', extraction_summary text,
 actionability text not null default 'REVIEW', route_targets text[] not null default '{}',
 processing_status text not null default 'DISCOVERED', source_metadata jsonb not null default '{}',
 first_seen_at timestamptz not null default now(), last_seen_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists dd_drive_findings_file_idx on public.dd_drive_intelligence_findings(source_file_id);
create index if not exists dd_drive_findings_domain_idx on public.dd_drive_intelligence_findings(domain_hint,processing_status);
alter table public.dd_drive_intelligence_runs enable row level security;
alter table public.dd_drive_intelligence_findings enable row level security;
revoke all on public.dd_drive_intelligence_runs from anon,authenticated;
revoke all on public.dd_drive_intelligence_findings from anon,authenticated;
grant all on public.dd_drive_intelligence_runs to service_role;
grant all on public.dd_drive_intelligence_findings to service_role;
insert into public.dd_intelligence_miners(miner_key,miner_family,miner_name,purpose,output_class,default_route,authority_boundary,status)
values('DRIVE_INTELLIGENCE_MINER','KNOWLEDGE','Drive Intelligence Miner','Index authorized Drive artifacts, separate evidence by domain, detect versions/conflicts, and route findings without mutating source files.',array['DOCUMENT_EVIDENCE','CONFLICT_SIGNAL','DUPLICATE_SIGNAL','IMPLEMENTATION_SIGNAL'],array['RESEARCH_QUEUE','MARKET_INTELLIGENCE','PROVIDER_INTELLIGENCE','SALES_RESEARCH'],'{"observation_only":true,"may_contact":false,"may_spend_money":false,"production_write":false,"may_delete_drive":false,"may_move_drive":false,"may_edit_drive":false}'::jsonb,'ACTIVE')
on conflict(miner_key) do update set purpose=excluded.purpose,output_class=excluded.output_class,default_route=excluded.default_route,authority_boundary=excluded.authority_boundary,status='ACTIVE',updated_at=now();
