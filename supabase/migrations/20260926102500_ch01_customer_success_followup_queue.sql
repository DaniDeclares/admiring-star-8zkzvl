-- CH01 post-service retention queue. Proved in tester before production promotion.
create table if not exists public.dd_customer_success_followups(
 id uuid primary key default gen_random_uuid(),
 job_id uuid not null references public.dd_jobs(id) on delete cascade,
 lead_id uuid not null references public.leads(id) on delete cascade,
 channel_code text not null default 'CH01',
 customer_name text not null,
 customer_email text not null,
 trigger_type text not null default 'COMPLETED_QA_APPROVED',
 review_status text not null default 'QUEUED',
 portal_status text not null default 'OFFERED',
 continued_service_status text not null default 'OFFERED',
 thumbtack_review_url text not null,
 google_business_url text not null,
 portal_url text not null,
 request_service_url text not null,
 sent_at timestamptz,
 external_message_id text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(job_id)
);
alter table public.dd_customer_success_followups enable row level security;
revoke all on public.dd_customer_success_followups from anon,authenticated;
grant all on public.dd_customer_success_followups to service_role;

create or replace function public.dd_queue_customer_success_followups()
returns integer language plpgsql security invoker set search_path=public as $$
declare n integer;
begin
 insert into public.dd_customer_success_followups(job_id,lead_id,channel_code,customer_name,customer_email,thumbtack_review_url,google_business_url,portal_url,request_service_url)
 select j.id,l.id,'CH01',l.full_name,l.email,
 'https://www.thumbtack.com/ga/stone-mountain/wedding-officiants/dani-declares/service/573953554115846159',
 'https://www.google.com/maps/search/?api=1&query=DANI%20DECLARES%20LLC',
 'https://www.danideclares.com/portal/access?role=customer',
 'https://www.danideclares.com/request-service'
 from public.dd_jobs j join public.leads l on l.id=j.lead_id
 where lower(j.job_status) in('completed','closed') and l.email is not null
 and exists(select 1 from public.dd_completion_reviews r where r.job_id=j.id and upper(r.status)='APPROVED')
 and exists(select 1 from public.service_requests sr where sr.id=j.service_request_id and sr.official_channel='CH01')
 on conflict(job_id) do nothing;
 get diagnostics n=row_count; return n;
end$$;
revoke all on function public.dd_queue_customer_success_followups() from public,anon,authenticated;
grant execute on function public.dd_queue_customer_success_followups() to service_role;

do $$ begin
 if exists(select 1 from cron.job where jobname='dani-customer-success-followup-queue') then perform cron.unschedule('dani-customer-success-followup-queue'); end if;
 perform cron.schedule('dani-customer-success-followup-queue','7,22,37,52 * * * *','select public.dd_queue_customer_success_followups();');
end $$;
