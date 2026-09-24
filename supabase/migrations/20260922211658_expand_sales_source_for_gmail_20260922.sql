alter table public.dd_sales_queue drop constraint if exists dd_sales_queue_source_check;
alter table public.dd_sales_queue add constraint dd_sales_queue_source_check check (source = any (array['HUBSPOT_DEAL','LINKEDIN_MESSAGE','LINKEDIN_MARKETPLACE','LINKEDIN_INVITE','WEB_SOURCED','GMAIL_SENT','GMAIL_INBOUND']));
