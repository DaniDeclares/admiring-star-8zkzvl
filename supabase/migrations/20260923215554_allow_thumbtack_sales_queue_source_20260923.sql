
alter table public.dd_sales_queue drop constraint if exists dd_sales_queue_source_check;
alter table public.dd_sales_queue
  add constraint dd_sales_queue_source_check
  check (source = any (array[
    'HUBSPOT_DEAL'::text,'LINKEDIN_MESSAGE'::text,'LINKEDIN_MARKETPLACE'::text,
    'LINKEDIN_INVITE'::text,'WEB_SOURCED'::text,'GMAIL_SENT'::text,'GMAIL_INBOUND'::text,
    'THUMBTACK'::text
  ]));
