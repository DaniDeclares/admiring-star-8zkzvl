-- DANI FIELD / PROVIDER OPERATING INFRASTRUCTURE v1
-- DANI owns the field-worker experience; third-party field-service/marketplace apps
-- are reference architectures or optional adapters, never commercial authority.

create table if not exists public.dd_provider_field_events (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.dd_providers(id) on delete restrict,
  job_id uuid references public.dd_jobs(id) on delete cascade,
  assignment_id uuid references public.dd_job_assignments(id) on delete set null,
  event_type text not null check (event_type in ('ASSIGNMENT_VIEWED','EN_ROUTE','ARRIVED','DEPARTED','WORK_STARTED','WORK_PAUSED','WORK_RESUMED','WORK_COMPLETED','CHECKLIST_STARTED','CHECKLIST_COMPLETED','EVIDENCE_ATTACHED','BLOCKED','REWORK_REQUESTED','CLOSEOUT_SUBMITTED','LOCATION_PING')),
  occurred_at timestamptz not null default now(),
  latitude numeric(9,6),
  longitude numeric(9,6),
  accuracy_meters numeric(8,2),
  source text not null default 'DANI_FIELD',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists dd_provider_field_events_provider_time_idx on public.dd_provider_field_events(provider_id, occurred_at desc);
create index if not exists dd_provider_field_events_job_time_idx on public.dd_provider_field_events(job_id, occurred_at desc);

create table if not exists public.dd_provider_time_entries (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.dd_providers(id) on delete restrict,
  job_id uuid not null references public.dd_jobs(id) on delete cascade,
  assignment_id uuid references public.dd_job_assignments(id) on delete set null,
  time_type text not null check (time_type in ('TRAVEL','ON_SITE','BREAK','ADMIN')),
  entry_status text not null default 'OPEN' check (entry_status in ('OPEN','PAUSED','CLOSED','VOID')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  start_latitude numeric(9,6),
  start_longitude numeric(9,6),
  start_accuracy_meters numeric(8,2),
  end_latitude numeric(9,6),
  end_longitude numeric(9,6),
  end_accuracy_meters numeric(8,2),
  source text not null default 'DANI_FIELD',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ended_at is null or ended_at >= started_at)
);
create index if not exists dd_provider_time_entries_provider_idx on public.dd_provider_time_entries(provider_id, started_at desc);
create index if not exists dd_provider_time_entries_job_idx on public.dd_provider_time_entries(job_id, started_at desc);

create table if not exists public.dd_provider_devices (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.dd_providers(id) on delete cascade,
  auth_user_id uuid,
  platform text not null check (platform in ('WEB','IOS','ANDROID')),
  device_label text,
  app_version text,
  push_token text,
  last_seen_at timestamptz not null default now(),
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists dd_provider_devices_push_token_uq on public.dd_provider_devices(push_token) where push_token is not null;
create index if not exists dd_provider_devices_provider_idx on public.dd_provider_devices(provider_id, is_active);

create table if not exists public.dd_provider_notifications (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.dd_providers(id) on delete cascade,
  auth_user_id uuid,
  job_id uuid references public.dd_jobs(id) on delete cascade,
  assignment_id uuid references public.dd_job_assignments(id) on delete set null,
  notification_type text not null,
  channel text not null default 'IN_APP' check (channel in ('IN_APP','PUSH','EMAIL','SMS')),
  title text not null,
  body text not null,
  payload jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists dd_provider_notifications_provider_idx on public.dd_provider_notifications(provider_id, created_at desc);

create table if not exists public.dd_provider_field_capabilities (
  capability_code text primary key,
  capability_name text not null,
  category text not null,
  source_reference text not null,
  source_notes text,
  dani_owned boolean not null default true,
  implementation_status text not null default 'PLANNED' check (implementation_status in ('PLANNED','MVP','ACTIVE','DEFERRED')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
insert into public.dd_provider_field_capabilities
(capability_code,capability_name,category,source_reference,source_notes,implementation_status) values
('TODAY_SCHEDULE','Today / upcoming work view','FIELD_APP','Jobber','Day/week/list/map schedule, assigned visits and job details','MVP'),
('ASSIGNMENT_RESPONSE','Accept / reject dispatched work','DISPATCH','Taskrabbit / DANI existing','Offer → accept/reject → re-offer; no open job board','ACTIVE'),
('ROUTE_NAVIGATION','Map and navigation handoff','DISPATCH','Jobber / DoorDash / Uber','Property location, directions and route context','MVP'),
('ON_MY_WAY','On-the-way status','COMMUNICATION','Jobber','Standardized arrival-status communication','MVP'),
('FIELD_STATUS','En route / arrived / started / paused / resumed / completed','FIELD_EXECUTION','Jobber / ServiceTitan','Explicit field lifecycle events','MVP'),
('TIME_TRACKING','Travel and on-site time','WORKFORCE','Jibble / Jobber','Structured time entries with optional location evidence','MVP'),
('GEOFENCED_TIME','Location-assisted time validation','WORKFORCE','Jibble / Jobber','Use location as evidence/assist, not sole payroll authority','PLANNED'),
('JOB_CHECKLISTS','Service-specific required checklist','FIELD_EXECUTION','Jobber / Housecall Pro','Required fields, notes, photos and completion gates','ACTIVE'),
('PHOTO_EVIDENCE','Before/after and required evidence','EVIDENCE','Jobber / DANI existing','Private storage, task/job linkage, QA verification','ACTIVE'),
('JOB_TIMELINE','Auditable field event timeline','EVIDENCE','ServiceTitan / DANI existing','Provider, job, event, timestamp and optional location','MVP'),
('MATERIAL_CAPTURE','Materials and equipment used','FIELD_EXECUTION','ServiceTitan / Jobber','Feeds job costing and inventory without changing commercial price authority','PLANNED'),
('PUSH_NOTIFICATIONS','Assignment and schedule alerts','COMMUNICATION','Jobber / ServiceTitan','Provider-specific operational notifications','MVP'),
('OFFLINE_READINESS','Cached job/checklist and deferred sync','FIELD_APP','Jobber','Field work should degrade gracefully in poor connectivity','PLANNED'),
('PROVIDER_SCORECARD','Capability-specific performance history','WORKFORCE','Taskrabbit / ServiceTitan / DANI existing','Acceptance, completion, QA, rework and on-time measures without one universal worker score','ACTIVE'),
('INTEGRATION_ADAPTERS','External system connectors','INTEGRATIONS','Jobber / HCP / PMS / logistics platforms','External IDs link to DANI canonical records; external systems never set DANI authority','MVP')
on conflict (capability_code) do update set capability_name=excluded.capability_name,category=excluded.category,source_reference=excluded.source_reference,source_notes=excluded.source_notes,dani_owned=excluded.dani_owned,implementation_status=excluded.implementation_status,updated_at=now();

create table if not exists public.dd_integration_adapters (
  adapter_code text primary key,
  provider_name text not null,
  integration_class text not null check (integration_class in ('DEMAND','EXECUTION','LOGISTICS','CLIENT_SYSTEM','WORKFORCE','AUTOMATION')),
  auth_model text,
  supported_objects jsonb not null default '[]'::jsonb,
  inbound_events jsonb not null default '[]'::jsonb,
  outbound_actions jsonb not null default '[]'::jsonb,
  access_state text not null default 'REFERENCE_ONLY' check (access_state in ('REFERENCE_ONLY','PLANNED','AVAILABLE','CONNECTED','DEFERRED')),
  dani_authority_boundary text not null default 'DANI owns commercial, scope, SLA, compliance, authorization and financial truth.',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
insert into public.dd_integration_adapters
(adapter_code,provider_name,integration_class,auth_model,supported_objects,inbound_events,outbound_actions,access_state,notes) values
('JOBBER','Jobber','EXECUTION','OAuth 2.0','["clients","properties","jobs","quotes","invoices","webhooks"]','["job_updates","webhook_events"]','["create_or_update_job","sync_status"]','REFERENCE_ONLY','Optional provider execution adapter; DANI remains canonical.'),
('HOUSECALL_PRO','Housecall Pro','EXECUTION','API key / OAuth where supported','["customers","jobs","estimates","invoices","leads","webhooks"]','["job_updates","lead_events","webhook_events"]','["create_or_update_job","sync_status"]','REFERENCE_ONLY','API/webhook access is plan-dependent; never required for DANI providers.'),
('THUMBTACK','Thumbtack','DEMAND','OAuth 2.0','["leads","messages","profiles","post_job_signals"]','["lead_created","message","negotiation"]','["lead_response"]','REFERENCE_ONLY','External lead ingress only.'),
('TASKRABBIT','Taskrabbit','EXECUTION','Partner API key','["services","availability","estimates","bids","bookings","status"]','["availability","status"]','["estimate","bid","book","cancel"]','REFERENCE_ONLY','Optional overflow capacity rail.'),
('DOORDASH_DRIVE','DoorDash Drive','LOGISTICS','API credentials','["deliveries","delivery_status"]','["delivery_status"]','["create_delivery","estimate"]','REFERENCE_ONLY','Optional logistics rail; production access is controlled by provider.'),
('UBER_DIRECT','Uber Direct','LOGISTICS','OAuth 2.0 client credentials','["deliveries","estimates"]','["delivery_status"]','["create_delivery","estimate"]','REFERENCE_ONLY','Optional logistics rail.'),
('APPFOLIO','AppFolio','CLIENT_SYSTEM','Partner/API access','["vendors","work_orders","bills","attachments"]','["work_order_updates","vendor_compliance"]','["create_or_update_work_order"]','REFERENCE_ONLY','Client-system connector; DANI retains fulfillment/commercial authority.'),
('BUILDIUM','Buildium','CLIENT_SYSTEM','API credentials','["properties","work_orders","vendors"]','["work_order_updates"]','["create_or_update_work_order"]','REFERENCE_ONLY','Client-system connector with sandbox-oriented integration path.'),
('YARDI','Yardi','CLIENT_SYSTEM','Interface partnership','["work_orders","properties","leases"]','["work_order_updates"]','["create_or_update_work_order"]','REFERENCE_ONLY','Enterprise connector subject to partner/client access.'),
('REALPAGE','RealPage','CLIENT_SYSTEM','Partner/API access','["property_records","work_orders","events"]','["event_updates"]','["approved_actions"]','REFERENCE_ONLY','Enterprise connector.'),
('ENTRATA','Entrata','CLIENT_SYSTEM','API key / agreement','["properties","maintenance","leads","leases"]','["maintenance_updates"]','["approved_actions"]','REFERENCE_ONLY','Enterprise connector.'),
('SERVICETITAN','ServiceTitan','EXECUTION','OAuth 2.0','["jobs","projects","invoices","pricebook","leads"]','["job_updates","lead_events"]','["approved_actions"]','REFERENCE_ONLY','Enterprise provider adapter.'),
('JIBBLE','Jibble','WORKFORCE','API','["time_entries","timesheets","projects","clients"]','["time_updates"]','["sync_time"]','REFERENCE_ONLY','Optional workforce/time reference or bridge.'),
('GOOGLE_LOCAL_SERVICES','Google Local Services','DEMAND','Google Ads API','["local_service_leads"]','["lead_created","call","message","booking"]','["lead_management"]','REFERENCE_ONLY','External lead source.'),
('ZAPIER','Zapier','AUTOMATION','OAuth / API keys','["webhooks","arbitrary_api_calls"]','["webhook_events"]','["api_calls"]','REFERENCE_ONLY','Temporary/client-specific bridge, not DANI core.'),
('MAKE','Make','AUTOMATION','Webhook / API','["webhooks","http"]','["webhook_events"]','["http_calls"]','REFERENCE_ONLY','Temporary/client-specific bridge, not DANI core.')
on conflict (adapter_code) do update set provider_name=excluded.provider_name,integration_class=excluded.integration_class,auth_model=excluded.auth_model,supported_objects=excluded.supported_objects,inbound_events=excluded.inbound_events,outbound_actions=excluded.outbound_actions,dani_authority_boundary=excluded.dani_authority_boundary,notes=excluded.notes,updated_at=now();

create table if not exists public.dd_integration_connections (
  id uuid primary key default gen_random_uuid(),
  adapter_code text not null references public.dd_integration_adapters(adapter_code) on delete restrict,
  environment text not null default 'PRODUCTION' check (environment in ('SANDBOX','STAGING','PRODUCTION')),
  external_account_id text,
  connection_status text not null default 'NOT_CONNECTED' check (connection_status in ('NOT_CONNECTED','PENDING','CONNECTED','ERROR','REVOKED')),
  authorized_by uuid,
  permissions jsonb not null default '[]'::jsonb,
  secret_reference text,
  last_sync_at timestamptz,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists dd_integration_connections_adapter_env_account_uq on public.dd_integration_connections(adapter_code, environment, external_account_id);

create table if not exists public.dd_external_record_links (
  id uuid primary key default gen_random_uuid(),
  adapter_code text not null references public.dd_integration_adapters(adapter_code) on delete restrict,
  connection_id uuid references public.dd_integration_connections(id) on delete set null,
  dani_entity_type text not null,
  dani_record_id uuid not null,
  external_object_type text not null,
  external_record_id text not null,
  sync_status text not null default 'LINKED' check (sync_status in ('LINKED','PENDING','SYNC_ERROR','UNLINKED')),
  last_synced_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(adapter_code, connection_id, external_object_type, external_record_id)
);
create index if not exists dd_external_record_links_dani_idx on public.dd_external_record_links(dani_entity_type, dani_record_id);

create table if not exists public.dd_integration_event_log (
  id uuid primary key default gen_random_uuid(),
  adapter_code text not null references public.dd_integration_adapters(adapter_code) on delete restrict,
  connection_id uuid references public.dd_integration_connections(id) on delete set null,
  direction text not null check (direction in ('INBOUND','OUTBOUND')),
  event_type text not null,
  external_event_id text,
  dani_entity_type text,
  dani_record_id uuid,
  status text not null default 'RECEIVED' check (status in ('RECEIVED','PROCESSED','IGNORED','FAILED')),
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);
create index if not exists dd_integration_event_log_adapter_time_idx on public.dd_integration_event_log(adapter_code, received_at desc);

create or replace view public.dd_provider_field_today as
select p.id provider_id,p.provider_code,p.first_name,p.last_name,
j.id job_id,j.public_reference,j.job_title,j.job_status,j.location_address,j.scope_summary,j.sla_due_at,
a.id assignment_id,a.assignment_status,a.offer_expires_at,
ap.id appointment_id,ap.starts_at,ap.ends_at,ap.timezone,ap.appointment_status
from public.dd_providers p
join public.dd_job_assignments a on a.provider_id=p.id
join public.dd_jobs j on j.id=a.job_id
left join public.dd_job_appointments ap on ap.job_id=j.id and ap.provider_id=p.id and ap.appointment_status <> 'CANCELLED'
where p.is_active=true and a.assignment_status in ('OFFERED','ACCEPTED')
  and (ap.starts_at is null or ap.starts_at::date=current_date);
alter view public.dd_provider_field_today set (security_invoker=true);

alter table public.dd_provider_field_events enable row level security;
alter table public.dd_provider_time_entries enable row level security;
alter table public.dd_provider_devices enable row level security;
alter table public.dd_provider_notifications enable row level security;
alter table public.dd_provider_field_capabilities enable row level security;
alter table public.dd_integration_adapters enable row level security;
alter table public.dd_integration_connections enable row level security;
alter table public.dd_external_record_links enable row level security;
alter table public.dd_integration_event_log enable row level security;

revoke all on public.dd_provider_field_events from anon, authenticated;
revoke all on public.dd_provider_time_entries from anon, authenticated;
revoke all on public.dd_provider_devices from anon, authenticated;
revoke all on public.dd_provider_notifications from anon, authenticated;
revoke all on public.dd_provider_field_capabilities from anon, authenticated;
revoke all on public.dd_integration_adapters from anon, authenticated;
revoke all on public.dd_integration_connections from anon, authenticated;
revoke all on public.dd_external_record_links from anon, authenticated;
revoke all on public.dd_integration_event_log from anon, authenticated;
revoke all on public.dd_provider_field_today from anon, authenticated;

grant select,insert,update on public.dd_provider_field_events to service_role;
grant select,insert,update on public.dd_provider_time_entries to service_role;
grant select,insert,update,delete on public.dd_provider_devices to service_role;
grant select,insert,update on public.dd_provider_notifications to service_role;
grant select on public.dd_provider_field_capabilities to service_role;
grant select,insert,update on public.dd_integration_adapters to service_role;
grant select,insert,update on public.dd_integration_connections to service_role;
grant select,insert,update on public.dd_external_record_links to service_role;
grant select,insert,update on public.dd_integration_event_log to service_role;
grant select on public.dd_provider_field_today to service_role;
