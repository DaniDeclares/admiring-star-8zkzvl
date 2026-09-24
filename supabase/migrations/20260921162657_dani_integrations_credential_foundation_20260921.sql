begin;

insert into public.dd_integration_adapters
(adapter_code,provider_name,integration_class,auth_model,supported_objects,inbound_events,outbound_actions,access_state,notes)
values
('ASANA','Asana','AUTOMATION','OAuth 2.0','["projects","tasks","comments","status_updates"]','["task_changed","project_changed"]','["create_task","update_task","add_comment","post_status"]','PLANNED','DANI HQ integration. Asana remains execution/release authority.'),
('NOTION','Notion','AUTOMATION','Internal connection token or OAuth 2.0 public connection','["pages","databases","data_sources","comments"]','["page_changed"]','["create_page","update_page","create_comment"]','PLANNED','Use an internal connection for the single DANI workspace unless multi-workspace installation is deliberately required.'),
('QUICKBOOKS_ONLINE','QuickBooks Online','AUTOMATION','OAuth 2.0','["customers","invoices","payments","expenses","accounts","profit_and_loss"]','["invoice_changed","payment_changed"]','["read_accounting_data","create_invoice_if_authorized"]','PLANNED','QuickBooks remains accounting authority; Stripe remains payment-event authority.'),
('GOOGLE_VOICE','Google Voice','AUTOMATION','No public Google Voice API identified; web access / SIP Link where eligible','["calls","voicemail","sms"]','["call","voicemail","message"]','["web_call","web_message"]','REFERENCE_ONLY','Current Voice front end. Do not implement against private/unsupported endpoints. Programmable calling requires a supported telephony/SIP route or number migration.')
on conflict (adapter_code) do update set
provider_name=excluded.provider_name,
integration_class=excluded.integration_class,
auth_model=excluded.auth_model,
supported_objects=excluded.supported_objects,
inbound_events=excluded.inbound_events,
outbound_actions=excluded.outbound_actions,
notes=excluded.notes,
updated_at=now();

commit;
