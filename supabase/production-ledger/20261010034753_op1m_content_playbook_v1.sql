-- OP1M content playbook v1: owner-collected marketing techniques and recurring themes
-- become reusable, enforced capabilities of the EXISTING acquisition engine
-- (dd_acquisition_campaigns_v1 / dd_acquisition_content_v1 / dd_acquisition_attribution_v1).
-- Not a new marketing system: one reference table, additive columns, one guard trigger,
-- one review view, a repurposing planner and an intake -> attribution bridge.
-- No auto-publish, no paid spend, no external contact. Drafts only.
-- Source: Dani's 2026-10-09 thread message (techniques table + recurring theme names).

create table if not exists public.dd_content_playbook_v1(
 entry_key text primary key,
 entry_type text not null check(entry_type in ('TECHNIQUE','THEME')),
 entry_name text not null,
 usage_rule text not null,
 account_scopes text[] not null default array['PERSONAL_CREATOR','DANI_BUSINESS'],
 cadence text,
 platform_rules jsonb not null default '{}'::jsonb,
 guardrails jsonb not null default '{}'::jsonb,
 status text not null default 'ACTIVE' check(status in ('ACTIVE','DRAFT','RETIRED')),
 evidence_state text not null default 'OWNER_STATED' check(evidence_state in ('OWNER_STATED','OWNER_APPROVED','CLAUDE_DRAFT')),
 source_attribution text not null,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.dd_content_playbook_v1 enable row level security;
revoke all on public.dd_content_playbook_v1 from anon,authenticated;
grant select,insert,update,delete on public.dd_content_playbook_v1 to service_role;

-- Techniques: names and "how DANI should use it" are Dani's words; guardrails restate existing doctrine
-- (OP1M_CREATOR_VOICE_V1, FAMILY_COMPATIBLE_EXECUTION_V1, proof-first visual rules).
insert into public.dd_content_playbook_v1(entry_key,entry_type,entry_name,usage_rule,platform_rules,guardrails,source_attribution,metadata) values
('CURIOSITY_HOOK','TECHNIQUE','Curiosity hooks','Open posts and videos with something that makes people stop scrolling.','{}','{"truthful_hook_only":true,"no_clickbait_claims":true,"hook_in_first_line_or_first_3_seconds":true}','OWNER_STATED_2026-10-09','{}'),
('ELI10','TECHNIQUE','ELI10 explanations','Turn complicated topics into simple, useful educational content.','{}','{"keep_substance":true,"no_legal_or_financial_advice":true}','OWNER_STATED_2026-10-09','{"related_doctrine":"OWNER_DECISION_LENS_V1.ELI10"}'),
('THREE_QUESTIONS','TECHNIQUE','Three-question engagement','Use relevant questions to encourage conversation and identify customer needs.','{}','{"max_questions":3,"answers_are_research_signals":true,"needs_enter_sales_queue_only_with_evidence":true,"never_invent_pain":true}','OWNER_STATED_2026-10-09','{"related_doctrine":"OWNER_DECISION_LENS_V1.THREE_QUESTIONS"}'),
('BLIND_SPOT','TECHNIQUE','Blind-spot content','Show customers problems they may not realize are costing them time or money.','{}','{"no_fear_mongering":true,"no_invented_statistics":true,"offer_must_be_live_ready_if_named":true}','OWNER_STATED_2026-10-09','{"related_doctrine":"OWNER_DECISION_LENS_V1.BLIND_SPOTS"}'),
('PROS_CONS','TECHNIQUE','Pros-and-cons comparisons','Help customers make decisions while demonstrating DANI''s expertise.','{}','{"fair_tradeoffs":true,"no_disparaging_named_competitors":true}','OWNER_STATED_2026-10-09','{"related_doctrine":"OWNER_DECISION_LENS_V1.PROS_CONS"}'),
('BEHIND_THE_SCENES','TECHNIQUE','Behind-the-scenes storytelling','Document what you''re actually building, learning, fixing, and delivering.','{}','{"real_events_only":true,"protect_children_private_details":true,"no_secrets_or_customer_data_on_screen":true}','OWNER_STATED_2026-10-09','{"related_doctrine":"OP1M_CREATOR_VOICE_V1"}'),
('CONTENT_REPURPOSING','TECHNIQUE','Content repurposing','Turn one recording into multiple Reels, stories, posts, graphics, and educational pieces.','{}','{"child_rows_link_parent_content_key":true,"each_child_declares_one_track":true,"owner_edits_minimized":true}','OWNER_STATED_2026-10-09','{"planner":"dd_op1m_plan_repurpose_v1"}'),
('SOCIAL_PROOF','TECHNIQUE','Social proof','Use real work, customer results, and approved before-and-after content instead of generic AI graphics.','{}','{"requires_metadata_proof_asset_approved":true,"customer_consent_required_for_customer_media":true,"no_generic_ai_graphics_as_proof":true,"no_fake_testimonials":true}','OWNER_STATED_2026-10-09','{}'),
('PLATFORM_SPECIFIC','TECHNIQUE','Platform-specific marketing','Adapt content for Facebook, Instagram, TikTok, LinkedIn, and Nextdoor rather than posting identical material everywhere.',
 '{"FACEBOOK":"Personal profile: founder story and real-life build, conversational caption, soft CTA. Business page: one service or offer per post, one CTA, tracked link.","INSTAGRAM":"Reel with the hook in the first 1-3 seconds and on-screen captions; carousel for ELI10 or pros/cons; Stories for behind-the-scenes and question stickers.","TIKTOK":"Native vertical clip, hook in the first 2 seconds, talk-to-camera or process footage, no other platform watermark.","LINKEDIN":"B2B lesson or execution proof, text-first or document carousel, light hashtags, CTA to a conversation.","NEXTDOOR":"Local and neighborly, business page preferred, service area named, no hard sell in neighbor feeds."}',
 '{"no_identical_cross_posting":true,"platform_rules_are_claude_draft_pending_owner_review":true}','OWNER_STATED_2026-10-09','{"platform_rules_state":"CLAUDE_DRAFT"}'),
('REVENUE_ATTRIBUTION','TECHNIQUE','Revenue attribution','Track which posts produce inquiries, quotes, payments, and repeat customers.','{}','{"utm_content_equals_content_key":true,"attribution_is_evidence_not_sale":true,"no_fake_revenue":true}','OWNER_STATED_2026-10-09','{"bridge":"dd_op1m_capture_intake_attribution_v1"}')
on conflict(entry_key) do update set entry_name=excluded.entry_name,usage_rule=excluded.usage_rule,platform_rules=excluded.platform_rules,guardrails=excluded.guardrails,metadata=excluded.metadata,updated_at=now();

-- Themes: the six NAMES are owner-stated. Their usage rules are Claude drafts inferred from the
-- names and existing service lines, marked CLAUDE_DRAFT until Dani confirms or corrects them.
insert into public.dd_content_playbook_v1(entry_key,entry_type,entry_name,usage_rule,account_scopes,cadence,guardrails,evidence_state,source_attribution,metadata) values
('WHITE_GLOVE_WEDNESDAYS','THEME','White Glove Wednesdays','Weekly Wednesday post on the standard and detail behind premium resident and property service.',array['DANI_BUSINESS'],'WEDNESDAY','{"live_ready_offers_only":true,"real_dani_proof_first":true}','CLAUDE_DRAFT','OWNER_STATED_THEME_NAME_2026-10-09','{"likely_channels":["CH01","CH03"]}'),
('WEDDING_WISDOM','THEME','Wedding Wisdom','Wedding planning and day-of coordination education.',array['DANI_BUSINESS'],null,'{"education_only_until_wedding_offer_live_ready":true,"officiant_requires_jurisdiction_review":true}','CLAUDE_DRAFT','OWNER_STATED_THEME_NAME_2026-10-09','{"related_triage":"WEDDING_COORDINATION:BUILD_ADJACENT","likely_channels":["CH01"]}'),
('PROPERTY_RESET','THEME','Property Reset','Turnover, make-ready and home reset problems and how they get handled.',array['DANI_BUSINESS'],null,'{"live_ready_offers_only":true,"real_dani_proof_first":true}','CLAUDE_DRAFT','OWNER_STATED_THEME_NAME_2026-10-09','{"likely_channels":["CH01","CH03"]}'),
('BUSINESS_EXECUTION','THEME','Business Execution','Admin, operations and execution help for businesses and real estate offices.',array['DANI_BUSINESS'],null,'{"live_ready_offers_only":true,"no_guaranteed_outcomes":true}','CLAUDE_DRAFT','OWNER_STATED_THEME_NAME_2026-10-09','{"likely_channels":["CH04","CH05"]}'),
('CONCIERGE_LIFE','THEME','Concierge Life','Resident concierge, errands and lifestyle help.',array['DANI_BUSINESS'],null,'{"live_ready_offers_only":true}','CLAUDE_DRAFT','OWNER_STATED_THEME_NAME_2026-10-09','{"likely_channels":["CH01"]}'),
('BEHIND_DANI_DECLARES','THEME','Behind DANI DECLARES','The founder journey and the real build of the company.',array['PERSONAL_CREATOR','DANI_BUSINESS'],null,'{"real_events_only":true,"protect_children_private_details":true}','CLAUDE_DRAFT','OWNER_STATED_THEME_NAME_2026-10-09','{"pairs_with_track":"DAILY_MILLION_DOLLAR_OPERATION"}')
on conflict(entry_key) do update set entry_name=excluded.entry_name,account_scopes=excluded.account_scopes,cadence=excluded.cadence,guardrails=excluded.guardrails,metadata=excluded.metadata,updated_at=now()
where public.dd_content_playbook_v1.evidence_state<>'OWNER_APPROVED';

-- Additive columns on the existing content table.
alter table public.dd_acquisition_content_v1
 add column if not exists account_scope text,
 add column if not exists content_track text,
 add column if not exists techniques text[] not null default '{}',
 add column if not exists theme_key text,
 add column if not exists parent_content_key text,
 add column if not exists derivative_format text;
do $$ begin
 alter table public.dd_acquisition_content_v1 add constraint dd_acquisition_content_account_scope_chk check(account_scope is null or account_scope in ('PERSONAL_CREATOR','DANI_BUSINESS'));
exception when duplicate_object then null; end $$;
do $$ begin
 -- The four October tracks (src/lib/octoberContentTracks.js, PR #616). Null = not part of an October track.
 alter table public.dd_acquisition_content_v1 add constraint dd_acquisition_content_track_chk check(content_track is null or content_track in ('BUILD_WITH_DANI','LET_DANI_BUILD_YOU','THREE_SERVICES_THREE_PRODUCTS','DAILY_MILLION_DOLLAR_OPERATION'));
exception when duplicate_object then null; end $$;
do $$ begin
 alter table public.dd_acquisition_content_v1 add constraint dd_acquisition_content_parent_fk foreign key(parent_content_key) references public.dd_acquisition_content_v1(content_key);
exception when duplicate_object then null; end $$;
create index if not exists dd_acquisition_content_parent_idx on public.dd_acquisition_content_v1(parent_content_key) where parent_content_key is not null;

create or replace function public.dd_op1m_content_playbook_guard_v1()
returns trigger language plpgsql set search_path=public as $$
declare
 v_bad text; v_theme_scopes text[]; v_parent public.dd_acquisition_content_v1%rowtype;
 v_conversion boolean := new.service_sku is not null or new.funnel_role in ('CONVERSION','B2B_CONVERSION','PURCHASE','CHECKOUT','DISCOVERY_CONVERSION','MILESTONE_CONVERSION');
 v_ready boolean := new.status in ('READY','APPROVED','SCHEDULED','PUBLISHED') or new.external_publish_authorized;
begin
 select t into v_bad from unnest(new.techniques) t
  where not exists(select 1 from public.dd_content_playbook_v1 p where p.entry_key=t and p.entry_type='TECHNIQUE' and p.status='ACTIVE') limit 1;
 if v_bad is not null then raise exception 'Unknown or inactive content technique: %', v_bad; end if;

 if new.theme_key is not null then
  select account_scopes into v_theme_scopes from public.dd_content_playbook_v1 where entry_key=new.theme_key and entry_type='THEME' and status='ACTIVE';
  if v_theme_scopes is null then raise exception 'Unknown or inactive content theme: %', new.theme_key; end if;
  if new.account_scope is not null and not new.account_scope=any(v_theme_scopes) then
   raise exception 'Theme % is not used on % pages', new.theme_key, new.account_scope;
  end if;
 end if;

 -- Keep the four October tracks from bleeding into each other.
 if new.content_track in ('BUILD_WITH_DANI','DAILY_MILLION_DOLLAR_OPERATION') and v_conversion then
  raise exception 'Track % carries no service SKU or sales conversion; make a separate LET_DANI_BUILD_YOU or business-page post', new.content_track;
 end if;
 if new.content_track='THREE_SERVICES_THREE_PRODUCTS' and v_ready and coalesce(new.metadata->>'release_verified','false')<>'true' then
  raise exception 'THREE_SERVICES_THREE_PRODUCTS stays unpublishable until each offer is release-verified (metadata.release_verified)';
 end if;

 if new.parent_content_key is not null then
  if new.parent_content_key=new.content_key then raise exception 'Content cannot be derived from itself'; end if;
  select * into v_parent from public.dd_acquisition_content_v1 where content_key=new.parent_content_key;
  if v_parent.content_track is not null and new.content_track is null then
   raise exception 'Derived content must declare its own track (parent % is %)', new.parent_content_key, v_parent.content_track;
  end if;
 end if;

 if v_ready then
  if new.account_scope is null then raise exception 'Choose PERSONAL_CREATOR or DANI_BUSINESS before content is ready'; end if;
  -- Personal page = family life and founder journey; business pages = customer acquisition.
  if new.account_scope='PERSONAL_CREATOR' and v_conversion and coalesce(new.metadata->>'owner_cross_post_approved','false')<>'true' then
   raise exception 'Sales conversion content belongs on a DANI business page; personal-page use needs metadata.owner_cross_post_approved';
  end if;
  if 'SOCIAL_PROOF'=any(new.techniques) and coalesce(new.metadata->>'proof_asset_approved','false')<>'true' then
   raise exception 'Social proof needs an approved real asset (metadata.proof_asset_approved) before it is ready';
  end if;
 end if;
 return new;
end $$;
create or replace trigger dd_op1m_content_playbook_guard_v1
before insert or update on public.dd_acquisition_content_v1
for each row execute function public.dd_op1m_content_playbook_guard_v1();

-- Owner/agent review surface: what each existing draft still needs, without rewriting it.
create or replace view public.dd_acquisition_content_playbook_review_v1 with (security_invoker=true) as
select c.content_key,c.campaign_key,c.platform,c.status,c.account_scope,c.content_track,c.theme_key,c.techniques,c.parent_content_key,
 coalesce(c.account_scope, case when c.source_attribution ilike '%personal%' then 'PERSONAL_CREATOR (inferred from source_attribution)' end) as effective_scope,
 array_remove(array[
  case when c.account_scope is null then 'SCOPE_UNASSIGNED' end,
  case when coalesce(c.account_scope, case when c.source_attribution ilike '%personal%' then 'PERSONAL_CREATOR' end)='PERSONAL_CREATOR'
        and (c.service_sku is not null or c.funnel_role in ('CONVERSION','B2B_CONVERSION','PURCHASE','CHECKOUT','DISCOVERY_CONVERSION','MILESTONE_CONVERSION'))
        and coalesce(c.metadata->>'owner_cross_post_approved','false')<>'true' then 'SALES_POST_ON_PERSONAL_PAGE' end,
  case when cardinality(c.techniques)=0 then 'NO_TECHNIQUES_TAGGED' end,
  case when 'SOCIAL_PROOF'=any(c.techniques) and coalesce(c.metadata->>'proof_asset_approved','false')<>'true' then 'SOCIAL_PROOF_ASSET_UNAPPROVED' end
 ],null) as needs,
 (select count(*) from public.dd_acquisition_content_v1 k where k.parent_content_key=c.content_key) as derived_pieces,
 (select jsonb_object_agg(event_type,n) from (select a.event_type,count(*) n from public.dd_acquisition_attribution_v1 a where a.content_key=c.content_key group by 1) e) as attribution_events
from public.dd_acquisition_content_v1 c;
revoke all on public.dd_acquisition_content_playbook_review_v1 from public,anon,authenticated;
grant select on public.dd_acquisition_content_playbook_review_v1 to service_role;

-- Repurposing planner: one source piece -> platform-adapted DRAFT children. The guard trigger
-- enforces track/scope/theme rules on every child. Never publishes.
create or replace function public.dd_op1m_plan_repurpose_v1(p_parent_key text, p_targets jsonb default null)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare p public.dd_acquisition_content_v1%rowtype; t jsonb; v_key text; v_scope text; v_platform text; v_format text; v_rule text; v_created text[]:='{}';
begin
 select * into p from public.dd_acquisition_content_v1 where content_key=p_parent_key;
 if not found then raise exception 'Unknown parent content %', p_parent_key; end if;
 for t in select * from jsonb_array_elements(coalesce(p_targets, jsonb_build_array(
   jsonb_build_object('platform','INSTAGRAM','derivative_format','REEL'),
   jsonb_build_object('platform','TIKTOK','derivative_format','SHORT_CLIP'),
   jsonb_build_object('platform','INSTAGRAM','derivative_format','STORY'),
   jsonb_build_object('platform','LINKEDIN','derivative_format','TEXT_LESSON'))))
 loop
  v_platform := upper(t->>'platform'); v_format := upper(coalesce(t->>'derivative_format','POST'));
  v_scope := coalesce(t->>'account_scope', p.account_scope);
  v_key := p.content_key||'>'||v_platform||':'||v_format||coalesce(':'||(t->>'service_sku'),'');
  select platform_rules->>v_platform into v_rule from public.dd_content_playbook_v1 where entry_key='PLATFORM_SPECIFIC';
  insert into public.dd_acquisition_content_v1(content_key,campaign_key,platform,series_name,funnel_role,service_sku,hook,content_brief,cta,proof_requirement,status,
   external_publish_authorized,source_attribution,metadata,account_scope,content_track,techniques,theme_key,parent_content_key,derivative_format)
  values(v_key,coalesce(t->>'campaign_key',p.campaign_key),v_platform,p.series_name,coalesce(t->>'funnel_role',p.funnel_role),t->>'service_sku',
   coalesce(t->>'hook',p.hook),
   'Derived '||v_format||' from '||p.content_key||'. '||coalesce(v_rule,'Adapt to the platform; do not cross-post identical material.')||' Source brief: '||p.content_brief,
   coalesce(t->>'cta',p.cta),p.proof_requirement,'DRAFT',false,
   lower(v_platform)||case v_scope when 'PERSONAL_CREATOR' then '_personal' when 'DANI_BUSINESS' then '_business' else '' end,
   jsonb_build_object('derived_from',p.content_key,'owner_approval_required',true,'external_publish',false,'utm_content',v_key),
   v_scope,coalesce(t->>'content_track',p.content_track),
   (select array_agg(distinct x) from unnest(p.techniques||array['CONTENT_REPURPOSING','PLATFORM_SPECIFIC']) x),
   coalesce(t->>'theme_key',p.theme_key),p.content_key,v_format)
  on conflict(content_key) do nothing;
  if found then v_created := v_created||v_key; end if;
 end loop;
 return jsonb_build_object('status','COMPLETED','parent',p.content_key,'drafts_created',cardinality(v_created),'content_keys',to_jsonb(v_created),'external_publish',false);
end $$;
revoke all on function public.dd_op1m_plan_repurpose_v1(text,jsonb) from public,anon,authenticated;
grant execute on function public.dd_op1m_plan_repurpose_v1(text,jsonb) to service_role;

-- Attribution bridge: requests whose saved campaign tag (PR #613) names a content_key become
-- INQUIRY/QUOTE/JOB/PAYMENT evidence on that content. Idempotent per source record.
create unique index if not exists dd_acquisition_attribution_source_ref_uidx
 on public.dd_acquisition_attribution_v1(event_type,(evidence->>'source_ref')) where evidence ? 'source_ref';

-- Service requests whose saved campaign tag names a content_key.
create or replace view public.dd_acquisition_tagged_requests_v1 with (security_invoker=true) as
select sr.id as sr_id,c.content_key,c.platform,sr.property_details->'marketingAttribution' as attr,sr.created_at,sr.quote_amount
from public.service_requests sr
join public.dd_acquisition_content_v1 c on upper(c.content_key)=upper(sr.property_details->'marketingAttribution'->>'utm_content')
where jsonb_typeof(sr.property_details->'marketingAttribution')='object';
revoke all on public.dd_acquisition_tagged_requests_v1 from public,anon,authenticated;
grant select on public.dd_acquisition_tagged_requests_v1 to service_role;

create or replace function public.dd_op1m_capture_intake_attribution_v1()
returns jsonb language plpgsql security invoker set search_path=public as $$
declare v_inq int; v_quote int; v_job int; v_pay int;
begin
 insert into public.dd_acquisition_attribution_v1(content_key,platform,event_type,amount,occurred_at,evidence)
 select content_key,platform,'INQUIRY',null,created_at,jsonb_build_object('source_ref','service_request:'||sr_id,'service_request_id',sr_id,'marketing_attribution',attr)
 from public.dd_acquisition_tagged_requests_v1 on conflict do nothing;
 get diagnostics v_inq=row_count;

 insert into public.dd_acquisition_attribution_v1(content_key,platform,event_type,amount,occurred_at,evidence)
 select content_key,platform,'QUOTE',quote_amount,now(),jsonb_build_object('source_ref','service_request:'||sr_id,'service_request_id',sr_id,'quote_is_not_revenue',true)
 from public.dd_acquisition_tagged_requests_v1 where coalesce(quote_amount,0)>0 on conflict do nothing;
 get diagnostics v_quote=row_count;

 -- JOB is counted without an amount so the scorecard does not double count the PAYMENT.
 insert into public.dd_acquisition_attribution_v1(content_key,platform,event_type,amount,occurred_at,evidence)
 select t.content_key,t.platform,'JOB',null,j.created_at,jsonb_build_object('source_ref','job:'||j.id,'service_request_id',t.sr_id,'job_id',j.id)
 from public.dd_acquisition_tagged_requests_v1 t join public.dd_jobs j on j.service_request_id=t.sr_id on conflict do nothing;
 get diagnostics v_job=row_count;

 insert into public.dd_acquisition_attribution_v1(content_key,platform,event_type,amount,occurred_at,evidence)
 select t.content_key,t.platform,'PAYMENT',pe.amount_received,pe.created_at,jsonb_build_object('source_ref','payment_event:'||pe.id,'service_request_id',t.sr_id,'payment_event_id',pe.id)
 from public.dd_acquisition_tagged_requests_v1 t join public.dd_payment_events pe
   on (pe.request_id=t.sr_id or pe.job_id in (select j.id from public.dd_jobs j where j.service_request_id=t.sr_id))
 where lower(coalesce(pe.payment_status,'')) in ('succeeded','paid') and coalesce(pe.amount_received,0)>0
 on conflict do nothing;
 get diagnostics v_pay=row_count;

 return jsonb_build_object('status','COMPLETED','inquiries',v_inq,'quotes',v_quote,'jobs',v_job,'payments',v_pay,
  'repeat_customers','NOT_YET_MEASURED','external_contact',false);
end $$;
revoke all on function public.dd_op1m_capture_intake_attribution_v1() from public,anon,authenticated;
grant execute on function public.dd_op1m_capture_intake_attribution_v1() to service_role;

-- Runs just before the existing hourly scorecard refresh (minute 7).
do $$ begin perform cron.unschedule('dani-acquisition-intake-attribution'); exception when others then null; end $$;
select cron.schedule('dani-acquisition-intake-attribution','5 * * * *','select public.dd_op1m_capture_intake_attribution_v1();');
