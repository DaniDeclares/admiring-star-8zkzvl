begin;

create table if not exists public.dd_integration_operating_registry (
  id uuid primary key default gen_random_uuid(),
  system_code text not null unique,
  system_name text not null,
  layer text not null check (layer in ('CORE','GOOGLE_WORKSPACE','SPECIALIST','DEMAND','EXECUTION','CLIENT_SYSTEM','LOGISTICS','RELIABILITY','KNOWLEDGE')),
  connection_state text not null default 'INVENTORY_ONLY' check (connection_state in ('CONNECTED','READY_TO_CONNECT','INVENTORY_ONLY','REFERENCE_ONLY','DO_NOT_USE')),
  authority_boundary text not null,
  use_when text not null,
  operator_action text not null,
  trigger_examples jsonb not null default '[]'::jsonb,
  required_connection text,
  owner_system text not null default 'DANI',
  notes text,
  source_basis text,
  updated_at timestamptz not null default now()
);

alter table public.dd_integration_operating_registry enable row level security;

drop policy if exists "dd_integration_operating_registry_staff_select" on public.dd_integration_operating_registry;
create policy "dd_integration_operating_registry_staff_select"
on public.dd_integration_operating_registry
for select to authenticated
using (private.dd_is_staff_admin());

revoke all on public.dd_integration_operating_registry from anon;
grant select on public.dd_integration_operating_registry to authenticated;

insert into public.dd_integration_operating_registry
(system_code,system_name,layer,connection_state,authority_boundary,use_when,operator_action,trigger_examples,required_connection,notes,source_basis)
values
('DANI_CORE','DANI DECLARES Core','CORE','CONNECTED','DANI owns canonical customer, channel, service, scope, commercial, job, provider, evidence and release state.','Always; start here for any DANI transaction or operational decision.','Use DANI HQ/application and canonical Supabase records; do not create a competing record elsewhere.','["new request","quote","payment","job","dispatch","QA","release"]',null,'System of record.','Existing DANI authority architecture'),
('GOOGLE_WORKSPACE','Google Workspace','GOOGLE_WORKSPACE','READY_TO_CONNECT','Google is communication, collaboration, calendar, document and human-productivity infrastructure; it does not own DANI commercial truth.','When work involves Gmail, Drive, Calendar, Chat, Tasks, Forms or Workspace Studio.','Use Google for communication/document/scheduling convenience; write authoritative business state back to DANI.','["email received","calendar appointment","document/evidence","internal alert","human task"]','Google Workspace OAuth/permissions','Treat Workspace Studio flows as satellites around DANI.','Google Workspace/Studio inventory'),
('GMAIL','Gmail','GOOGLE_WORKSPACE','READY_TO_CONNECT','Gmail is an inbox/channel, not the customer or request system of record.','Inbound/outbound customer, vendor, provider and partner communications.','Triage in Gmail; create/update the DANI request/customer/contact record when it becomes operationally relevant.','["customer email","vendor email","provider email","sales lead"]','Google Workspace connection','Do not let an email-only task become the authoritative job record.','Google Workspace/Studio inventory'),
('GOOGLE_CALENDAR','Google Calendar','GOOGLE_WORKSPACE','READY_TO_CONNECT','Calendar is a scheduling surface; DANI appointment/job state remains authoritative.','When a DANI appointment needs calendar visibility, reminders or meeting coordination.','Sync or reflect approved DANI appointments; do not create unsanctioned commitments from calendar events alone.','["appointment","site visit","scope meeting","provider meeting"]','Google Workspace connection','Calendar entries are not proof of customer approval/payment.','Google Workspace/Studio inventory'),
('GOOGLE_DRIVE','Google Drive','GOOGLE_WORKSPACE','READY_TO_CONNECT','Drive is a document/evidence repository; DANI retains metadata and workflow authority.','Contracts, photos, receipts, reports, attachments and working documents.','Store/share supporting documents where appropriate and link them to the DANI record.','["signed document","job photos","inspection report","invoice attachment"]','Google Workspace connection','Do not make Drive folder structure the operational database.','Google Workspace/Studio inventory'),
('GOOGLE_CHAT','Google Chat','GOOGLE_WORKSPACE','READY_TO_CONNECT','Chat is internal communication/notification, not workflow authority.','Operator alerts, team coordination and release/incident notifications.','Notify the responsible person/channel; take the actual action in DANI.','["urgent request","blocked job","payment issue","release failure"]','Google Workspace connection','Notifications must point back to the DANI record/action.','Google Workspace/Studio inventory'),
('GOOGLE_TASKS','Google Tasks','GOOGLE_WORKSPACE','READY_TO_CONNECT','Tasks are a human follow-up surface; DANI next-action state remains authoritative.','Simple personal/operator follow-up that originates from DANI or communication.','Create/complete the human reminder, then update the DANI record when the business state changes.','["call customer","request document","follow up quote","vendor callback"]','Google Workspace connection','Do not use Tasks as the job ledger.','Google Workspace/Studio inventory'),
('GOOGLE_WORKSPACE_STUDIO','Google Workspace Studio / Flows','GOOGLE_WORKSPACE','READY_TO_CONNECT','Studio automates communication/workspace actions; it cannot override DANI gates.','When a repetitive Google Workspace notification, routing, document or reminder workflow is needed.','Build flows around DANI events; never make a flow the source of pricing, approval, payment or job authorization.','["Gmail triage","Drive attachment","Calendar reminder","Chat alert","Task creation"]','Google Workspace connection','Google detects/assists; DANI decides/records.','Google Workspace Studio inventory'),
('NOTION','Notion','KNOWLEDGE','CONNECTED','Notion documents operating rules and architecture; it does not override runtime systems.','SOPs, architecture, decisions, research extraction and staff guidance.','Read current Notion authority pages before cross-system work; record durable decisions there.','["new architecture decision","SOP","research extraction","agent change control"]','Existing connection','Notion is knowledge authority, not transaction authority.','Existing DANI authority architecture'),
('GITHUB','GitHub','CORE','CONNECTED','GitHub is application source/configuration and change-control authority.','Code, migrations, PRs, review and release history.','Make changes through branches/PRs; verify before merge and live deployment.','["code change","migration","bug fix","release"]','Existing connection','Do not treat generated production output as source code authority.','Existing DANI authority architecture'),
('SUPABASE','Supabase','CORE','CONNECTED','Supabase is runtime/business-state authority.','Canonical records, services, pricing rules, requests, jobs, providers, integrations and release controls.','Read/write through governed application/migrations; preserve RLS and authority boundaries.','["service","request","quote","job","provider","integration"]','Existing connection','Primary runtime data authority.','Existing DANI authority architecture'),
('STRIPE','Stripe','SPECIALIST','CONNECTED','Stripe is payment-event/execution authority; DANI remains commercial/pricing authority.','Customer payment collection, payment status and Stripe-hosted payment workflows.','Use DANI to determine amount/authorization; use Stripe for payment execution and event truth.','["invoice/payment","payment failure","refund","checkout"]','Existing connection','Never let Stripe become the catalog/pricing authority.','Existing DANI authority architecture'),
('HUBSPOT','HubSpot','SPECIALIST','CONNECTED','HubSpot is CRM activity/relationship support; DANI remains canonical commercial/customer workflow authority.','Lead/account/contact activity, prospecting and relationship notes.','Use for CRM activity/enrichment; link records back to DANI canonical IDs.','["prospect","contact","sales activity","follow-up"]','Existing connection','Do not manually create competing quote/job truth.','Existing DANI authority architecture'),
('QUICKBOOKS_ONLINE','QuickBooks Online','SPECIALIST','READY_TO_CONNECT','QuickBooks is accounting authority; DANI and Stripe retain operational/payment-event boundaries.','Accounting, books, expenses, financial reporting and reconciliation.','Post/reconcile authorized accounting records; never use QuickBooks to decide service scope or operational authorization.','["expense","invoice accounting","P&L","reconciliation"]','QuickBooks OAuth','Connection must be deliberately configured.','Supabase integration adapter registry'),
('ASANA','Asana','SPECIALIST','READY_TO_CONNECT','Asana is task/project execution support; DANI remains operational authority.','Project/task collaboration where Asana adds value.','Create/update execution tasks only when tied to a DANI record; keep DANI next action authoritative.','["project task","internal initiative","handoff"]','Asana OAuth','Currently planned adapter; do not duplicate DANI jobs.','Supabase integration adapter registry'),
('GOOGLE_VOICE','Google Voice','GOOGLE_WORKSPACE','REFERENCE_ONLY','Google Voice is the current voice front end; the DANI request/customer record is commercial truth.','Making/receiving calls or SMS through the current business number until a supported programmable telephony path is adopted.','Use Voice for the call; record the resulting customer/request activity in DANI.','["incoming call","outbound call","SMS","voicemail"]','No supported public API identified','Do not build against private/unsupported endpoints.','Existing telephony protocol'),
('VERCEL','Vercel','RELIABILITY','CONNECTED','Vercel is deployment/runtime hosting; GitHub remains source authority.','Deployment, preview, production status and runtime hosting.','Deploy from controlled GitHub changes; verify production after merge.','["PR preview","production deploy","build failure"]','Existing connection','Deployment success is not equivalent to live business proof.','Existing release control'),
('SENTRY_CHECKLY','Sentry / Checkly','RELIABILITY','INVENTORY_ONLY','Monitoring/testing systems observe DANI; they do not own business state.','Errors, synthetic checks, uptime and regression monitoring.','Use findings to create DANI/GitHub fixes; close the loop with live verification.','["error","failed synthetic","uptime issue","regression"]','Individual service connections','Add only when the monitoring target and alert routing are defined.','Claude/Google integration research')
on conflict(system_code) do update set
system_name=excluded.system_name,layer=excluded.layer,connection_state=excluded.connection_state,
authority_boundary=excluded.authority_boundary,use_when=excluded.use_when,operator_action=excluded.operator_action,
trigger_examples=excluded.trigger_examples,required_connection=excluded.required_connection,
notes=excluded.notes,source_basis=excluded.source_basis,updated_at=now();

commit;
