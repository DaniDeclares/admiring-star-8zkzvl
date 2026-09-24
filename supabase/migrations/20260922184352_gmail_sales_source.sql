alter table public.dd_sales_queue
  drop constraint if exists dd_sales_queue_source_check;
alter table public.dd_sales_queue
  add constraint dd_sales_queue_source_check check (source = any (array[
    'HUBSPOT_DEAL'::text,'LINKEDIN_MESSAGE'::text,'LINKEDIN_MARKETPLACE'::text,'LINKEDIN_INVITE'::text,
    'WEB_SOURCED'::text,'GMAIL_SENT'::text,'GMAIL_INBOUND'::text
  ]));

alter table public.dd_sales_queue
  add column if not exists source_account text,
  add column if not exists source_message_id text,
  add column if not exists source_thread_id text,
  add column if not exists source_occurred_at timestamptz,
  add column if not exists source_direction text,
  add column if not exists campaign_eligible boolean not null default false,
  add column if not exists campaign_status text not null default 'UNASSESSED',
  add column if not exists campaign_suppression_reason text,
  add column if not exists campaign_name text,
  add column if not exists campaign_last_contacted_at timestamptz;

alter table public.dd_sales_queue
  drop constraint if exists dd_sales_queue_campaign_status_chk;
alter table public.dd_sales_queue
  add constraint dd_sales_queue_campaign_status_chk check (campaign_status = any (array[
    'UNASSESSED'::text,'ELIGIBLE'::text,'SUPPRESSED'::text,'DRAFTED'::text,'SENT'::text,'RESPONDED'::text,'BOUNCED'::text,'UNSUBSCRIBED'::text
  ]));

comment on column public.dd_sales_queue.source_message_id is 'Original Gmail message id or other source-record id supporting this lead.';
comment on column public.dd_sales_queue.campaign_eligible is 'True only after DNC/relationship/source/compliance review; never implied by merely existing in the queue.';
