-- Register DANI core connected systems in the governed integration adapter registry.
-- External systems remain adapters. DANI/Supabase retains operational/commercial authority
-- except where the adapter boundary explicitly assigns source/deployment/document authority.

insert into public.dd_integration_adapters
(adapter_code,provider_name,integration_class,auth_model,supported_objects,inbound_events,outbound_actions,access_state,dani_authority_boundary,notes)
values
('GMAIL','Gmail','AUTOMATION','Google OAuth 2.0','["messages","threads","labels","drafts"]'::jsonb,'["message_received"]'::jsonb,'["send_email","create_draft","label_message","archive_message"]'::jsonb,'PLANNED','DANI owns customer, lead, job, scope, authorization and workflow truth; Gmail owns mailbox content and delivery state.','Business communications rail. ChatGPT connector access does not equal DANI production OAuth.'),
('GOOGLE_CALENDAR','Google Calendar','AUTOMATION','Google OAuth 2.0','["calendars","events","availability"]'::jsonb,'["event_changed"]'::jsonb,'["create_event","update_event","read_availability"]'::jsonb,'PLANNED','DANI owns job and appointment lifecycle truth; Google Calendar is a scheduling projection and collaboration surface.','Primary business calendar can mirror confirmed DANI appointments. ChatGPT connector access does not equal DANI production OAuth.'),
('GOOGLE_DRIVE','Google Drive','AUTOMATION','Google OAuth 2.0','["files","folders","documents","spreadsheets","presentations"]'::jsonb,'["file_changed"]'::jsonb,'["create_file","update_file","organize_file","export_file"]'::jsonb,'PLANNED','DANI owns governed operational records; Drive owns document/file bytes and collaborative Google-native artifacts.','Document and evidence repository adapter. ChatGPT connector access does not equal DANI production OAuth.'),
('HUBSPOT','HubSpot','AUTOMATION','OAuth 2.0 / private app as deliberately configured','["contacts","companies","deals","activities"]'::jsonb,'["crm_record_changed"]'::jsonb,'["create_or_update_contact","create_or_update_company","create_or_update_deal","log_activity"]'::jsonb,'PLANNED','DANI owns service, quote, contract, job and commercial authorization truth; HubSpot is CRM/marketing engagement authority for records intentionally projected there.','Use external-record links to prevent duplicate CRM identities.'),
('AIRTABLE','Airtable','AUTOMATION','OAuth / personal access token as deliberately configured','["bases","tables","records","interfaces","automations"]'::jsonb,'["record_changed"]'::jsonb,'["create_record","update_record","create_interface"]'::jsonb,'PLANNED','DANI/Supabase owns production runtime truth. Airtable is a flexible planning, review and lightweight operational workspace only for explicitly assigned datasets.','Reduce duplicate operational tables over time; retain finance/planning/review surfaces where useful.'),
('GITHUB','GitHub','AUTOMATION','GitHub App / OAuth','["repositories","branches","commits","pull_requests","issues","actions"]'::jsonb,'["push","pull_request","workflow"]'::jsonb,'["create_branch","commit_change","open_pull_request","create_issue"]'::jsonb,'AVAILABLE','GitHub is source/version authority for application code and migrations; production data remains in DANI/Supabase.','All AI agents must use branch/PR/change-ledger discipline and never silently overwrite another agent change.'),
('VERCEL','Vercel','AUTOMATION','Vercel account/team authorization','["projects","deployments","domains","logs"]'::jsonb,'["deployment_changed"]'::jsonb,'["deploy","inspect_deployment","read_logs"]'::jsonb,'AVAILABLE','Vercel is deployment/runtime hosting authority; GitHub remains source authority and Supabase remains operational data authority.','Production deployment target for DANI web application.'),
('POSTHOG','PostHog','AUTOMATION','Project API credentials','["events","persons","insights","feature_flags","experiments","errors"]'::jsonb,'["analytics_event"]'::jsonb,'["query_analytics","manage_feature_flag"]'::jsonb,'PLANNED','DANI owns operational records; PostHog owns product telemetry, behavioral analytics and experiment observations.','Use for funnel, signup, checkout and operator-workflow observability; never as transactional authority.')
on conflict (adapter_code) do update set
 provider_name=excluded.provider_name,
 integration_class=excluded.integration_class,
 auth_model=excluded.auth_model,
 supported_objects=excluded.supported_objects,
 inbound_events=excluded.inbound_events,
 outbound_actions=excluded.outbound_actions,
 dani_authority_boundary=excluded.dani_authority_boundary,
 notes=excluded.notes,
 updated_at=now();
