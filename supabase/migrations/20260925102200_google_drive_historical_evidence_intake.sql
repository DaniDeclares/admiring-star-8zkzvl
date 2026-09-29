create table if not exists public.dd_drive_research_intake (
 id uuid primary key default gen_random_uuid(),
 drive_file_id text not null unique,
 file_name text not null,
 drive_path text,
 mime_type text,
 modified_at timestamptz,
 classification text not null default 'UNCLASSIFIED' check (classification in ('CURRENT_AUTHORITY_CANDIDATE','HISTORICAL_DANI_EVIDENCE','MARKET_COMPETITOR_RESEARCH','LEAD_PROSPECT_EVIDENCE','LEGAL_COMPLIANCE_CONTRACT','IDEA_BRAINSTORM','UNCLASSIFIED')),
 authority_status text not null default 'EVIDENCE_ONLY' check (authority_status in ('EVIDENCE_ONLY','CANDIDATE','VERIFIED_CURRENT','SUPERSEDED','REJECTED')),
 extraction_status text not null default 'QUEUED' check (extraction_status in ('QUEUED','EXTRACTING','EXTRACTED','NEEDS_REVIEW','FAILED')),
 conflict_status text not null default 'UNCHECKED' check (conflict_status in ('UNCHECKED','NO_CONFLICT','POTENTIAL_CONFLICT','CONFIRMED_CONFLICT')),
 source_url text,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.dd_drive_research_intake enable row level security;
revoke all on public.dd_drive_research_intake from anon,authenticated;
grant all on public.dd_drive_research_intake to service_role;
create index if not exists dd_drive_research_intake_queue_idx on public.dd_drive_research_intake(extraction_status,classification,modified_at desc);

insert into public.dd_research_work_queue(program_key,work_key,question,required_evidence,priority,status,next_action,owner_decision_required,metadata)
values ('OPERATING_MODEL_INTELLIGENCE','google-drive-historical-evidence-sweep',
'What useful DANI operating, pricing, marketing, compliance, lead, service, and architecture evidence exists in Google Drive, and what conflicts with current runtime authority?',
'Inventory Drive artifacts; classify provenance and temporal status; extract supported claims; compare claims with current Supabase/GitHub authority; flag conflicts; never promote an old artifact to current authority without verification.',
'P0','QUEUED','Inventory and classify Drive evidence, then feed supported claims into research evidence/conflict review.',false,
'{"source":"GOOGLE_DRIVE","authority_rule":"EVIDENCE_NOT_AUTHORITY","pipeline":["inventory","classify","extract","compare","conflict","queue"]}'::jsonb)
on conflict (program_key,work_key) do update set question=excluded.question,required_evidence=excluded.required_evidence,priority=excluded.priority,status='QUEUED',next_action=excluded.next_action,metadata=excluded.metadata,updated_at=now();

insert into public.dd_drive_research_intake(drive_file_id,file_name,drive_path,mime_type,modified_at,classification,authority_status,source_url,metadata) values
('1BHfKRnPR12dRze_tZEx8TonX336939K-HNTbGThYZrs','Dani Declares LLC - Full Backend Architecture & Security Audit','/Google Drive/Dani Declares LLC - Full Backend Architecture & Security Audit','application/vnd.google-apps.document','2026-08-03T15:49:27.432Z','HISTORICAL_DANI_EVIDENCE','EVIDENCE_ONLY','https://docs.google.com/document/d/1BHfKRnPR12dRze_tZEx8TonX336939K-HNTbGThYZrs/edit','{"priority":"HIGH"}'::jsonb),
('1TO5fyQWY_q5VmeN81hr5epC_3Nf8VXmJw9sTefrGju8','Dani Declares LLC - Full Organizational, Technical & Commercial Audit','/Google Drive/Dani Declares LLC - Full Organizational, Technical & Commercial Audit','application/vnd.google-apps.document','2026-08-03T15:18:35.869Z','HISTORICAL_DANI_EVIDENCE','EVIDENCE_ONLY','https://docs.google.com/document/d/1TO5fyQWY_q5VmeN81hr5epC_3Nf8VXmJw9sTefrGju8/edit','{"priority":"HIGH"}'::jsonb),
('10ogrmNmZCLKvCuKUf2juEk4LpwV-t_AP5d-ixaGeZF4','Pricing','/Google Drive/Pricing','application/vnd.google-apps.document','2026-08-20T00:57:16.402Z','CURRENT_AUTHORITY_CANDIDATE','CANDIDATE','https://docs.google.com/document/d/10ogrmNmZCLKvCuKUf2juEk4LpwV-t_AP5d-ixaGeZF4/edit','{"priority":"HIGH","warning":"no silent pricing overwrite"}'::jsonb),
('1EcxLz8brGFZ8LcH1d6uqXOMbPvhryC6K0xrdj7GVVrk','Dani Declares LLC - B2B Master Pricing & Service Matrix','/Google Drive/Dani Declares LLC - B2B Master Pricing & Service Matrix','application/vnd.google-apps.document','2026-08-12T16:47:47.922Z','CURRENT_AUTHORITY_CANDIDATE','CANDIDATE','https://docs.google.com/document/d/1EcxLz8brGFZ8LcH1d6uqXOMbPvhryC6K0xrdj7GVVrk/edit','{"priority":"HIGH"}'::jsonb),
('1WU3XpJW2H0TK_i9UPbj0qVfx2cSfPe0J9MsXBypYXZo','Dani Declares LLC - B2C Resident Perks & Private Concierge','/Google Drive/Dani Declares LLC - B2C Resident Perks & Private Concierge','application/vnd.google-apps.document','2026-08-12T16:51:12.752Z','CURRENT_AUTHORITY_CANDIDATE','CANDIDATE','https://docs.google.com/document/d/1WU3XpJW2H0TK_i9UPbj0qVfx2cSfPe0J9MsXBypYXZo/edit','{"priority":"HIGH","warning":"resident benefit language may be stale"}'::jsonb),
('1Nz3H473_Jhil8bIWKZa1eqs24LlsHVMSelysVpRj8gM','Dani Declares Business Overview','/Google Drive/Dani Declares Business Overview','application/vnd.google-apps.document','2026-08-05T14:57:06.259Z','HISTORICAL_DANI_EVIDENCE','EVIDENCE_ONLY','https://docs.google.com/document/d/1Nz3H473_Jhil8bIWKZa1eqs24LlsHVMSelysVpRj8gM/edit','{"priority":"MEDIUM"}'::jsonb),
('105W13vdhl0d-Z81tHx0PPgiXCH0HDVtJQsbtqoDJd9s','Social media plan','/Google Drive/Social media plan','application/vnd.google-apps.document','2024-11-04T10:49:01.898Z','HISTORICAL_DANI_EVIDENCE','EVIDENCE_ONLY','https://docs.google.com/document/d/105W13vdhl0d-Z81tHx0PPgiXCH0HDVtJQsbtqoDJd9s/edit','{"priority":"MEDIUM","domain":"marketing"}'::jsonb),
('11d2vTB9nEu8XnVmQ1aqi-sxKYxp4A9TXdRHttsS3QmI','Business plan dispatch','/Google Drive/Business plan dispatch','application/vnd.google-apps.document','2024-12-21T05:09:40.505Z','HISTORICAL_DANI_EVIDENCE','EVIDENCE_ONLY','https://docs.google.com/document/d/11d2vTB9nEu8XnVmQ1aqi-sxKYxp4A9TXdRHttsS3QmI/edit','{"priority":"MEDIUM","domain":"dispatch"}'::jsonb)
on conflict (drive_file_id) do update set file_name=excluded.file_name,drive_path=excluded.drive_path,mime_type=excluded.mime_type,modified_at=excluded.modified_at,classification=excluded.classification,authority_status=excluded.authority_status,source_url=excluded.source_url,metadata=excluded.metadata,updated_at=now();
