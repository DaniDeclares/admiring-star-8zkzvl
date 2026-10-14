-- Operation $1M measurable acquisition engine v1
-- Production authority: 2026-10-07. No auto-publish, no paid spend.
-- Reconciles Tester social-visual work with Production revenue/sales authority.

create table if not exists public.dd_acquisition_campaigns_v1(
 campaign_key text primary key,campaign_name text not null,campaign_type text not null,objective text not null,
 platforms text[] not null default '{}',content_series text[] not null default '{}',primary_metric text not null default 'COLLECTED_REVENUE',
 status text not null default 'ACTIVE',guardrails jsonb not null default '{}'::jsonb,metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.dd_acquisition_campaigns_v1 enable row level security;
revoke all on public.dd_acquisition_campaigns_v1 from anon,authenticated;
grant select,insert,update,delete on public.dd_acquisition_campaigns_v1 to service_role;

create table if not exists public.dd_acquisition_content_v1(
 content_key text primary key,campaign_key text not null references public.dd_acquisition_campaigns_v1(campaign_key),platform text not null,
 series_name text not null,funnel_role text not null,service_sku text,hook text not null,content_brief text not null,cta text not null,
 proof_requirement text not null default 'DANI_REAL_FIRST',status text not null default 'DRAFT',external_publish_authorized boolean not null default false,
 source_attribution text not null,metadata jsonb not null default '{}'::jsonb,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.dd_acquisition_content_v1 enable row level security;
revoke all on public.dd_acquisition_content_v1 from anon,authenticated;
grant select,insert,update,delete on public.dd_acquisition_content_v1 to service_role;

create table if not exists public.dd_acquisition_attribution_v1(
 id uuid primary key default gen_random_uuid(),content_key text references public.dd_acquisition_content_v1(content_key),platform text not null,
 event_type text not null check(event_type in ('IMPRESSION','ENGAGEMENT','INQUIRY','LEAD','QUALIFIED_LEAD','QUOTE','PAYMENT','JOB','REPEAT','REFERRAL','PLATFORM_REVENUE')),
 sales_queue_id uuid references public.dd_sales_queue(id),amount numeric(12,2),occurred_at timestamptz not null default now(),
 evidence jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());
create index if not exists dd_acquisition_attribution_content_idx on public.dd_acquisition_attribution_v1(content_key,occurred_at desc);
create index if not exists dd_acquisition_attribution_sales_idx on public.dd_acquisition_attribution_v1(sales_queue_id) where sales_queue_id is not null;
alter table public.dd_acquisition_attribution_v1 enable row level security;
revoke all on public.dd_acquisition_attribution_v1 from anon,authenticated;
grant select,insert,update,delete on public.dd_acquisition_attribution_v1 to service_role;

create table if not exists public.dd_acquisition_scorecards_v1(
 scorecard_date date primary key,content_ready integer not null default 0,inquiries integer not null default 0,qualified_leads integer not null default 0,
 quotes integer not null default 0,payments integer not null default 0,jobs integer not null default 0,repeats integer not null default 0,referrals integer not null default 0,
 service_revenue numeric(12,2) not null default 0,platform_revenue numeric(12,2) not null default 0,total_attributed_revenue numeric(12,2) not null default 0,
 sales_followups_due integer not null default 0,matched_buyers integer not null default 0,updated_at timestamptz not null default now());
alter table public.dd_acquisition_scorecards_v1 enable row level security;
revoke all on public.dd_acquisition_scorecards_v1 from anon,authenticated;
grant select,insert,update,delete on public.dd_acquisition_scorecards_v1 to service_role;

insert into public.dd_acquisition_campaigns_v1(campaign_key,campaign_name,campaign_type,objective,platforms,content_series,guardrails,metadata) values
('OP1M_CREATOR_ENGINE','Operation $1 Million: Build It In Public','CREATOR_MONETIZATION_AND_DEMAND','Turn the real DANI build into monetizable creator content while generating attributable DANI demand.',array['FACEBOOK','INSTAGRAM','TIKTOK','LINKEDIN'],array['Building DANI DECLARES into a $1 Million Company','Dani Declares','Watch Us Handle It','How Much Would This Cost?'],'{"real_events_only":true,"no_fake_revenue":true,"no_auto_publish":true,"owner_approval_required":true}','{"facebook_primary":true,"monetized_platform":true,"campaign_rule":"content revenue + service revenue both count"}'),
('HANDLE_IT_DISCOVERY','What Do You Need Handled?','SERVICE_DISCOVERY','Make the breadth of DANI memorable by showing real buyer problems and only LIVE_READY solutions.',array['FACEBOOK','INSTAGRAM','TIKTOK','NEXTDOOR','LINKEDIN'],array['Dani, Can Y''all Handle This?','Watch Us Handle It','How Much Would This Cost?'],'{"live_ready_only":true,"no_invented_pricing":true,"no_auto_publish":true}','{"positioning":"WE HANDLE THE EXECUTION"}'),
('HOLIDAY_EXECUTION_2026','Let DANI Handle the Holidays','SEASONAL_CONVERSION','Convert seasonal household intent into governed holiday services before the 2026 holiday window closes.',array['FACEBOOK','INSTAGRAM','TIKTOK','NEXTDOOR'],array['Let DANI Handle the Holidays','Watch Us Handle It','How Much Would This Cost?'],'{"live_ready_only":true,"lighting_excluded_until_live_ready":true,"controlled_quote_preserved":true,"no_auto_publish":true}','{"season_end":"2026-12-31"}'),
('COMMERCIAL_PROOF_ENGINE','Execution Proof for Properties & Businesses','B2B_DEMAND','Turn DANI field evidence and operational outcomes into commercial conversations, paid trials and recurring accounts.',array['LINKEDIN','FACEBOOK'],array['Watch Us Handle It','Execution Proof','One-Job Trial'],'{"no_mass_send":true,"governed_offers_only":true,"no_auto_publish":true}','{"trial_model":"single-job or documentation sample where authorized"}')
on conflict(campaign_key) do update set campaign_name=excluded.campaign_name,objective=excluded.objective,platforms=excluded.platforms,content_series=excluded.content_series,guardrails=excluded.guardrails,metadata=excluded.metadata,updated_at=now();

insert into public.dd_acquisition_content_v1(content_key,campaign_key,platform,series_name,funnel_role,service_sku,hook,content_brief,cta,source_attribution,metadata) values
('OP1M:FB:DAY_BUILD','OP1M_CREATOR_ENGINE','FACEBOOK','Building DANI DECLARES into a $1 Million Company','MONETIZATION_AND_TRUST',null,'Building a million-dollar service company means learning that having services is not the same as having sales.','Owner-led short video using the real scoreboard: what was built, what did not convert, and the next revenue move.','Follow the build — and if you need something handled, tell DANI what you need.','facebook_personal','{"original_video_preferred":true,"reel_min_seconds":10}'),
('HANDLE:FB:CAN_WE','HANDLE_IT_DISCOVERY','FACEBOOK','Dani, Can Y''all Handle This?','DISCOVERY',null,'Wait — DANI handles that too?','Owner-led discovery video around one surprising LIVE_READY service; buyer problem first, governed solution second.','Tell me what you need handled.','facebook_personal','{"choose_live_ready_at_execution":true}'),
('HANDLE:TIKTOK:WATCH','HANDLE_IT_DISCOVERY','TIKTOK','Watch Us Handle It','PROOF',null,'Watch us handle this from problem to proof.','Short transformation/story using actual DANI work: problem, execution, evidence, finished outcome.','DM DANI DECLARES with what you need handled.','tiktok','{"real_dani_proof_required":true}'),
('HOLIDAY:FB:GIFT_WRAP','HOLIDAY_EXECUTION_2026','FACEBOOK','Let DANI Handle the Holidays','CONVERSION','DNI-01D-011','You buy the gifts. DANI can handle the wrapping.','Use the governed gift-wrapping/presentation offer; preserve existing fixed offer/payment path; no invented bundles.','Message DANI to get the gift wrapping handled.','facebook_personal','{"release_state_required":"LIVE_READY"}'),
('HOLIDAY:FB:GUEST','HOLIDAY_EXECUTION_2026','FACEBOOK','Let DANI Handle the Holidays','CONVERSION','DNI-01D-009','Family coming over? Get the guest room handled before they arrive.','Show guest-room/hospitality setup as a concrete holiday problem/solution using the governed offer.','Message DANI about guest-room setup.','facebook_personal','{"release_state_required":"LIVE_READY"}'),
('HOLIDAY:IG:DECOR','HOLIDAY_EXECUTION_2026','INSTAGRAM','Let DANI Handle the Holidays','CONVERSION','DNI-01F-001','Love the holidays. Not the setup?','Before/process/after concept for governed holiday decorating; final scope is quoted.','DM DANI for a decorating quote.','instagram','{"release_state_required":"LIVE_READY","controlled_quote":true}'),
('B2B:LI:PROOF','COMMERCIAL_PROOF_ENGINE','LINKEDIN','Execution Proof','B2B_TRUST',null,'The work is only half the job. The proof matters too.','Use a real field example: arrival condition, before/after evidence, logged issues and QA sign-off.','Ask about a single-job trial.','linkedin','{"commercial":true}'),
('B2B:FB:TRIAL','COMMERCIAL_PROOF_ENGINE','FACEBOOK','One-Job Trial','B2B_CONVERSION',null,'Before you add another vendor, test the execution on one job.','Explain the governed one-job trial/documentation-sample approach using only released capabilities.','Message DANI with the property, scope and timing.','facebook_personal','{"commercial":true}')
on conflict(content_key) do update set hook=excluded.hook,content_brief=excluded.content_brief,cta=excluded.cta,metadata=excluded.metadata,updated_at=now();

create or replace function public.dd_refresh_acquisition_scorecard_v1(p_date date default current_date) returns jsonb
language plpgsql security invoker set search_path=public as $$
declare v jsonb;
begin
 insert into public.dd_acquisition_scorecards_v1(scorecard_date,content_ready,inquiries,qualified_leads,quotes,payments,jobs,repeats,referrals,service_revenue,platform_revenue,total_attributed_revenue,sales_followups_due,matched_buyers,updated_at)
 select p_date,(select count(*) from public.dd_acquisition_content_v1 where status in ('READY','APPROVED')),
 count(*) filter(where a.event_type='INQUIRY'),count(*) filter(where a.event_type='QUALIFIED_LEAD'),count(*) filter(where a.event_type='QUOTE'),
 count(*) filter(where a.event_type='PAYMENT'),count(*) filter(where a.event_type='JOB'),count(*) filter(where a.event_type='REPEAT'),count(*) filter(where a.event_type='REFERRAL'),
 coalesce(sum(a.amount) filter(where a.event_type in ('PAYMENT','JOB','REPEAT')),0),coalesce(sum(a.amount) filter(where a.event_type='PLATFORM_REVENUE'),0),
 coalesce(sum(a.amount) filter(where a.event_type in ('PAYMENT','JOB','REPEAT','PLATFORM_REVENUE')),0),
 (select count(*) from public.dd_sales_queue s where s.next_action_date<=p_date and coalesce(s.do_not_contact,false)=false and s.disposition not in ('NOT_INTERESTED','PAYMENT_SUCCEEDED','CLOSED_LOST')),
 (select count(*) from public.dd_sales_queue s where coalesce(s.do_not_contact,false)=false and s.disposition not in ('NOT_INTERESTED','CLOSED_LOST') and s.suggested_sku is not null),now()
 from public.dd_acquisition_attribution_v1 a where a.occurred_at::date=p_date
 on conflict(scorecard_date) do update set content_ready=excluded.content_ready,inquiries=excluded.inquiries,qualified_leads=excluded.qualified_leads,quotes=excluded.quotes,payments=excluded.payments,jobs=excluded.jobs,repeats=excluded.repeats,referrals=excluded.referrals,service_revenue=excluded.service_revenue,platform_revenue=excluded.platform_revenue,total_attributed_revenue=excluded.total_attributed_revenue,sales_followups_due=excluded.sales_followups_due,matched_buyers=excluded.matched_buyers,updated_at=now();
 select to_jsonb(s) into v from public.dd_acquisition_scorecards_v1 s where scorecard_date=p_date; return v;
end $$;
revoke all on function public.dd_refresh_acquisition_scorecard_v1(date) from public,anon,authenticated;
grant execute on function public.dd_refresh_acquisition_scorecard_v1(date) to service_role;

do $$ begin perform cron.unschedule('dani-acquisition-scorecard-production'); exception when others then null; end $$;
select cron.schedule('dani-acquisition-scorecard-production','7 * * * *','select public.dd_refresh_acquisition_scorecard_v1(current_date);');
