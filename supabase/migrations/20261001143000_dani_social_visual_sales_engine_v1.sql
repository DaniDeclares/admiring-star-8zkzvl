-- DANI DECLARES: governed social visual sales engine (Tester-first)
-- Purpose: turn existing owned proof + Canva assets + governed research assets into
-- approval-ready, platform-specific social drafts without creating a competing CRM
-- or autonomous external publisher.
create table if not exists public.dd_social_visual_asset_registry_v1 (
  id uuid primary key default gen_random_uuid(), asset_key text not null unique,
  source_type text not null check (source_type in ('OWNED','CANVA','STOCK','GENERATED')),
  source_ref text, title text, platform_scope text[] not null default '{}',
  service_keys text[] not null default '{}',
  visual_type text not null check (visual_type in ('PHOTO','VIDEO','GRAPHIC','TEMPLATE','ILLUSTRATION')),
  proof_class text not null default 'ILLUSTRATIVE' check (proof_class in ('DANI_PROOF','CUSTOMER_APPROVED_PROOF','ILLUSTRATIVE','TEMPLATE')),
  rights_status text not null default 'UNKNOWN' check (rights_status in ('OWNED','LICENSED_COMMERCIAL','CANVA_LICENSED','UNKNOWN','BLOCKED')),
  approval_status text not null default 'UNREVIEWED' check (approval_status in ('UNREVIEWED','OWNER_APPROVED','REJECTED')),
  metadata jsonb not null default '{}', first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(), created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.dd_social_visual_gaps_v1 (
  id uuid primary key default gen_random_uuid(), gap_key text not null unique, service_key text,
  service_name text not null, buyer_segment text not null, channel_scope text[] not null default '{}',
  desired_visual_type text not null, proof_requirement text not null,
  status text not null default 'MISSING' check (status in ('MISSING','ILLUSTRATIVE_AVAILABLE','DANI_PROOF_AVAILABLE','READY','RETIRED')),
  asset_key text, metadata jsonb not null default '{}', created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.dd_social_campaigns_v1 (
  id uuid primary key default gen_random_uuid(), campaign_key text not null unique,
  objective text not null, buyer_segments text[] not null default '{}', channel_scope text[] not null default '{}',
  status text not null default 'DRAFT' check (status in ('DRAFT','OWNER_REVIEW','APPROVED','PAUSED','COMPLETE')),
  owner_approval_status text not null default 'PENDING' check (owner_approval_status in ('PENDING','APPROVED','REJECTED')),
  visual_strategy jsonb not null default '{}', source_learning_keys text[] not null default '{}',
  metadata jsonb not null default '{}', created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.dd_social_content_queue_v1 (
  id uuid primary key default gen_random_uuid(), content_key text not null unique,
  campaign_key text not null references public.dd_social_campaigns_v1(campaign_key),
  platform text not null, format text not null, service_key text, hook text not null,
  body_copy text not null, visual_direction text not null, asset_key text, cta text not null,
  proof_class text not null, approval_status text not null default 'DRAFT'
    check (approval_status in ('DRAFT','OWNER_REVIEW','OWNER_APPROVED','REJECTED')),
  publish_status text not null default 'NOT_SCHEDULED'
    check (publish_status in ('NOT_SCHEDULED','SCHEDULED','PUBLISHED','FAILED','CANCELLED')),
  scheduled_for timestamptz, dedupe_key text not null unique, metadata jsonb not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.dd_social_performance_v1 (
  id uuid primary key default gen_random_uuid(),
  content_key text not null references public.dd_social_content_queue_v1(content_key),
  platform text not null, observed_at timestamptz not null, impressions bigint, reach bigint,
  engagements bigint, clicks bigint, inquiries bigint, qualified_leads bigint, sales_count bigint,
  revenue numeric(12,2), evidence jsonb not null default '{}', created_at timestamptz not null default now()
);
create index if not exists dd_social_asset_service_idx on public.dd_social_visual_asset_registry_v1 using gin(service_keys);
create index if not exists dd_social_gap_status_idx on public.dd_social_visual_gaps_v1(status,updated_at desc);
create index if not exists dd_social_queue_review_idx on public.dd_social_content_queue_v1(approval_status,publish_status,created_at desc);
create index if not exists dd_social_perf_content_idx on public.dd_social_performance_v1(content_key,observed_at desc);
alter table public.dd_social_visual_asset_registry_v1 enable row level security;
alter table public.dd_social_visual_gaps_v1 enable row level security;
alter table public.dd_social_campaigns_v1 enable row level security;
alter table public.dd_social_content_queue_v1 enable row level security;
alter table public.dd_social_performance_v1 enable row level security;

create or replace function public.dd_social_seed_visual_system_v1() returns jsonb
language plpgsql security definer set search_path=public as $$
declare v_campaigns int:=0; v_gaps int:=0; v_assets int:=0;
begin
insert into public.dd_social_campaigns_v1
(campaign_key,objective,buyer_segments,channel_scope,status,owner_approval_status,visual_strategy,source_learning_keys,metadata)
values ('DANI_VISUAL_SALES_ENGINE_V1',
'Generate approval-ready, evidence-safe social content that turns DANI services and real owned proof into inquiries and sales.',
array['RESIDENT','PROPERTY_MANAGEMENT','REAL_ESTATE','BUSINESS'],
array['FACEBOOK','INSTAGRAM','TIKTOK','NEXTDOOR','LINKEDIN'],'OWNER_REVIEW','PENDING',
jsonb_build_object('primary_rule','Real DANI proof first; licensed illustrative imagery second; never present stock or generated imagery as DANI work.',
'content_mix',jsonb_build_object('REAL_PHOTO',0.45,'REAL_VIDEO',0.20,'BRANDED_GRAPHIC',0.20,'ILLUSTRATIVE',0.10,'EDUCATIONAL',0.05),
'platform_rules',jsonb_build_object('NEXTDOOR','local problem + real photo + simple CTA','FACEBOOK','real proof + offer + community relevance',
'INSTAGRAM','visual transformation + concise CTA','TIKTOK','short transformation/story + CTA','LINKEDIN','commercial pain + operational proof + capability'),
'approval_boundary','No external publication or spend without owner approval.'),
array['CANVA_MARKETING_CAMPAIGN_REVIEW_20261001','GITHUB_SOCIAL_ARCHITECTURE_REVIEW_20261001'],
jsonb_build_object('tester_only',true,'production_mutation',false))
on conflict(campaign_key) do update set visual_strategy=excluded.visual_strategy,source_learning_keys=excluded.source_learning_keys,updated_at=now();
get diagnostics v_campaigns=row_count;

insert into public.dd_social_visual_gaps_v1
(gap_key,service_key,service_name,buyer_segment,channel_scope,desired_visual_type,proof_requirement,metadata)
values
('CLEANING_BEFORE_AFTER','DNI-01A-002','Deep Structural Reset — Deep House Clean','RESIDENT',array['FACEBOOK','INSTAGRAM','TIKTOK','NEXTDOOR'],'PHOTO','DANI_PROOF',jsonb_build_object('priority','P0')),
('MOVE_OUT_TURN','DNI-01A-003','Deposit Security Move-Out Turn — Vacant Unit Detailing','RESIDENT',array['FACEBOOK','INSTAGRAM','NEXTDOOR'],'PHOTO','DANI_PROOF',jsonb_build_object('priority','P0')),
('HOME_RESET','DNI-01A-006','Closet & Wardrobe Optimization Matrix','RESIDENT',array['FACEBOOK','INSTAGRAM','TIKTOK','NEXTDOOR'],'PHOTO','DANI_PROOF',jsonb_build_object('priority','P1')),
('PANTRY_ORGANIZATION','DNI-01A-007','Culinary Pantry & Kitchen Cabinet Organization','RESIDENT',array['FACEBOOK','INSTAGRAM','TIKTOK','NEXTDOOR'],'PHOTO','DANI_PROOF',jsonb_build_object('priority','P1')),
('PROPERTY_DOCUMENTATION','D03-073','Property Documentation / Photo Log','PROPERTY_MANAGEMENT',array['LINKEDIN','FACEBOOK','NEXTDOOR'],'PHOTO','DANI_PROOF',jsonb_build_object('priority','P0')),
('PROPERTY_TURNOVER','CH03-TURN','Property Turnover & Field Support','PROPERTY_MANAGEMENT',array['LINKEDIN','FACEBOOK','INSTAGRAM'],'PHOTO','DANI_PROOF',jsonb_build_object('priority','P0')),
('REAL_ESTATE_LISTING_PREP','CH04-LISTING','Listing Prep & Staging','REAL_ESTATE',array['LINKEDIN','FACEBOOK','INSTAGRAM'],'PHOTO','DANI_PROOF',jsonb_build_object('priority','P1')),
('ADMIN_SUPPORT','BUS-ADM-001','Administrative Support','BUSINESS',array['LINKEDIN','FACEBOOK'],'PHOTO','ILLUSTRATIVE',jsonb_build_object('priority','P1')),
('CUSTOM_DTF','DNI-11A-017','DTF Apparel','BUSINESS',array['FACEBOOK','INSTAGRAM','TIKTOK','NEXTDOOR'],'PHOTO','DANI_PROOF',jsonb_build_object('priority','P0')),
('NOTARY','D05-NOTARY','Credentialed Mobile Notary','RESIDENT',array['FACEBOOK','LINKEDIN','NEXTDOOR'],'PHOTO','DANI_PROOF',jsonb_build_object('priority','P1'))
on conflict(gap_key) do update set service_name=excluded.service_name,channel_scope=excluded.channel_scope,metadata=excluded.metadata,updated_at=now();
get diagnostics v_gaps=row_count;

insert into public.dd_social_visual_asset_registry_v1
(asset_key,source_type,source_ref,title,platform_scope,visual_type,proof_class,rights_status,approval_status,metadata)
values
('CANVA:DAHKmNIDXHw','CANVA','DAHKmNIDXHw','Dani Declares Marketing Campaign System',array['FACEBOOK','INSTAGRAM','TIKTOK','NEXTDOOR','LINKEDIN'],'TEMPLATE','TEMPLATE','CANVA_LICENSED','OWNER_APPROVED',jsonb_build_object('canva_edit_url','https://www.canva.com/d/0ouu4jG-eTv7zFo','pages',3)),
('CANVA:DAHMX2zr2Gw','CANVA','DAHMX2zr2Gw','Dani Declares LLC One-Page Capability',array['LINKEDIN','FACEBOOK'],'TEMPLATE','TEMPLATE','CANVA_LICENSED','OWNER_APPROVED',jsonb_build_object('canva_edit_url','https://www.canva.com/d/S2lR9TsasaleWSl','pages',1)),
('CANVA:DAHHZiL2HKI','CANVA','DAHHZiL2HKI','DANI DECLARES LLC Flyer with Apartment Interior Background',array['FACEBOOK','NEXTDOOR'],'GRAPHIC','ILLUSTRATIVE','CANVA_LICENSED','OWNER_APPROVED',jsonb_build_object('canva_edit_url','https://www.canva.com/d/YWo9x1vcWGMGHrI')),
('CANVA:DAHG0z_cTWo','CANVA','DAHG0z_cTWo','DANI DECLARES LLC Field Services',array['FACEBOOK','INSTAGRAM','NEXTDOOR'],'GRAPHIC','ILLUSTRATIVE','CANVA_LICENSED','OWNER_APPROVED',jsonb_build_object('canva_edit_url','https://www.canva.com/d/p5-gVhdutJQG1yf')),
('CANVA:DAHLLzpA2TU','CANVA','DAHLLzpA2TU','Premium Juneteenth Product Collection',array['FACEBOOK','INSTAGRAM','TIKTOK'],'GRAPHIC','DANI_PROOF','CANVA_LICENSED','OWNER_APPROVED',jsonb_build_object('canva_edit_url','https://www.canva.com/d/QMs8S5CAOYlNZ6l')),
('CANVA:DAHLQVBbglI','CANVA','DAHLQVBbglI','Cookout Crew Collection',array['FACEBOOK','INSTAGRAM','TIKTOK'],'GRAPHIC','DANI_PROOF','CANVA_LICENSED','OWNER_APPROVED',jsonb_build_object('canva_edit_url','https://www.canva.com/d/5g5mvZehnoEr5Kj'))
on conflict(asset_key) do update set title=excluded.title,metadata=excluded.metadata,last_seen_at=now(),updated_at=now();
get diagnostics v_assets=row_count;
return jsonb_build_object('status','COMPLETED','campaigns_changed',v_campaigns,'visual_gaps_changed',v_gaps,'assets_changed',v_assets,'production_mutation',false);
end $$;

create or replace function public.dd_social_sync_visual_sources_v1() returns jsonb
language plpgsql security definer set search_path=public as $$
declare v_drive int:=0; v_external int:=0;
begin
insert into public.dd_social_visual_asset_registry_v1
(asset_key,source_type,source_ref,title,platform_scope,visual_type,proof_class,rights_status,approval_status,metadata,last_seen_at)
select 'DRIVE:'||d.drive_file_id,'OWNED',d.drive_file_id,d.file_name,array['FACEBOOK','INSTAGRAM','TIKTOK','NEXTDOOR','LINKEDIN'],
case when lower(d.mime_type) like 'video/%' then 'VIDEO' else 'PHOTO' end,'DANI_PROOF','OWNED','UNREVIEWED',
jsonb_build_object('drive_path',d.drive_path,'source_url',d.source_url,'classification',d.classification,'authority_status',d.authority_status,'metadata',d.metadata),now()
from (select distinct on (drive_file_id) * from public.dd_drive_research_intake
where lower(coalesce(mime_type,'')) like 'image/%' or lower(coalesce(mime_type,'')) like 'video/%'
or lower(coalesce(file_name,'')) ~ '\\.(jpg|jpeg|png|webp|gif|mp4|mov|m4v)$'
order by drive_file_id,updated_at desc nulls last) d
on conflict(asset_key) do update set title=excluded.title,metadata=excluded.metadata,last_seen_at=now(),updated_at=now();
get diagnostics v_drive=row_count;
insert into public.dd_social_visual_asset_registry_v1
(asset_key,source_type,source_ref,title,platform_scope,visual_type,proof_class,rights_status,approval_status,metadata,last_seen_at)
select 'RESEARCH:'||r.asset_key,'STOCK',r.asset_url,coalesce(r.title,r.asset_key),array['FACEBOOK','INSTAGRAM','TIKTOK','NEXTDOOR','LINKEDIN'],
case when upper(coalesce(r.asset_type,'')) like '%VIDEO%' then 'VIDEO' else 'PHOTO' end,'ILLUSTRATIVE',
case when upper(r.authority_level) in ('LICENSED','COMMERCIAL','FIRST_PARTY') then 'LICENSED_COMMERCIAL' else 'UNKNOWN' end,
'UNREVIEWED',jsonb_build_object('authority_level',r.authority_level,'discovery_method',r.discovery_method,'metadata',r.metadata),now()
from (select distinct on (asset_key) * from public.dd_research_discovered_assets where asset_url is not null
order by asset_key,last_seen_at desc nulls last) r
on conflict(asset_key) do update set title=excluded.title,metadata=excluded.metadata,last_seen_at=now(),updated_at=now();
get diagnostics v_external=row_count;
return jsonb_build_object('status','COMPLETED','owned_media_synced',v_drive,'external_media_synced',v_external,'production_mutation',false);
end $$;

create or replace function public.dd_social_plan_content_v1(p_limit integer default 20) returns jsonb
language plpgsql security definer set search_path=public as $$
declare v_created int:=0;
begin
insert into public.dd_social_content_queue_v1
(content_key,campaign_key,platform,format,service_key,hook,body_copy,visual_direction,asset_key,cta,proof_class,approval_status,dedupe_key,metadata)
select 'SOCIAL:'||lower(g.gap_key)||':'||lower(p.platform),'DANI_VISUAL_SALES_ENGINE_V1',p.platform,
case when p.platform in ('INSTAGRAM','TIKTOK') then 'SHORT_VIDEO_OR_CAROUSEL' else 'SINGLE_IMAGE' end,g.service_key,
case when p.platform='NEXTDOOR' then 'Local help for '||lower(g.service_name)
when p.platform='LINKEDIN' then 'The operational task your team still has to chase'
else 'A real-world problem DANI DECLARES can help execute' end,
case when p.platform='NEXTDOOR' then 'DANI DECLARES provides local execution support. Ask about '||g.service_name||'.'
when p.platform='LINKEDIN' then 'DANI DECLARES coordinates practical execution around '||g.service_name||' so teams can spend less time chasing fragmented tasks.'
else 'Need help with '||g.service_name||'? DANI DECLARES handles the execution with a documented, coordinated process.' end,
case when g.proof_requirement='DANI_PROOF' then 'Use an actual DANI photo/video first. Do not substitute stock for proof.'
else 'Use real DANI proof when available; otherwise use licensed illustrative imagery and label the concept clearly.' end,
(select a.asset_key from public.dd_social_visual_asset_registry_v1 a where a.approval_status='OWNER_APPROVED'
and a.rights_status in ('OWNED','LICENSED_COMMERCIAL','CANVA_LICENSED')
and (a.service_keys @> array[g.service_key] or a.visual_type='TEMPLATE') and p.platform=any(a.platform_scope)
order by (a.proof_class='DANI_PROOF') desc,a.updated_at desc limit 1),
case when p.platform='LINKEDIN' then 'Request a commercial service conversation'
when p.platform='NEXTDOOR' then 'Message DANI' else 'DM DANI DECLARES' end,
g.proof_requirement,'DRAFT','SOCIAL:'||g.gap_key||':'||p.platform,
jsonb_build_object('buyer_segment',g.buyer_segment,'visual_gap',g.gap_key,'owner_approval_required',true,'external_publish',false)
from public.dd_social_visual_gaps_v1 g cross join lateral unnest(g.channel_scope) p(platform)
where g.status<>'RETIRED' and not exists(select 1 from public.dd_social_content_queue_v1 q where q.dedupe_key='SOCIAL:'||g.gap_key||':'||p.platform)
order by case coalesce(g.metadata->>'priority','P9') when 'P0' then 0 when 'P1' then 1 else 2 end limit greatest(1,least(100,p_limit));
get diagnostics v_created=row_count;
return jsonb_build_object('status','COMPLETED','drafts_created',v_created,'owner_approval_required',true,'external_publish',false,'production_mutation',false);
end $$;

create or replace function public.dd_social_queue_learning_to_brain_v1() returns jsonb
language plpgsql security definer set search_path=public as $$
declare v_queued int:=0;
begin
insert into public.dd_brain_delivery_queue(delivery_key,entity_scope,source_key,source_type,payload,payload_hash)
select 'SOCIAL_VISUAL_LEARNING:'||p.content_key||':'||to_char(p.observed_at,'YYYYMMDDHH24MISS'),'DANI_DECLARES',p.content_key,'SOCIAL_PERFORMANCE',
jsonb_build_object('summary','DANI social content performance evidence for learning; do not treat synthetic or illustrative imagery as proof.',
'content_key',p.content_key,'platform',p.platform,'observed_at',p.observed_at,
'metrics',jsonb_build_object('impressions',p.impressions,'reach',p.reach,'engagements',p.engagements,'clicks',p.clicks,'inquiries',p.inquiries,'qualified_leads',p.qualified_leads,'sales_count',p.sales_count,'revenue',p.revenue),
'evidence',p.evidence,'tester_only',true,'production_authorized',false,'confidence',0.9),
md5(p.content_key||':'||p.observed_at::text||':'||coalesce(p.revenue,0)::text)
from public.dd_social_performance_v1 p
where not exists(select 1 from public.dd_brain_delivery_queue q where q.delivery_key='SOCIAL_VISUAL_LEARNING:'||p.content_key||':'||to_char(p.observed_at,'YYYYMMDDHH24MISS'));
get diagnostics v_queued=row_count;
return jsonb_build_object('status','COMPLETED','brain_learning_envelopes_queued',v_queued,'production_mutation',false);
end $$;

create or replace function public.dd_run_dani_social_visual_pipeline_v1() returns jsonb
language plpgsql security definer set search_path=public as $$
declare v_seed jsonb; v_sync jsonb; v_plan jsonb; v_learning jsonb;
begin
select public.dd_social_seed_visual_system_v1() into v_seed;
select public.dd_social_sync_visual_sources_v1() into v_sync;
select public.dd_social_plan_content_v1(20) into v_plan;
select public.dd_social_queue_learning_to_brain_v1() into v_learning;
return jsonb_build_object('status','COMPLETED','seed',v_seed,'sync',v_sync,'plan',v_plan,'learning',v_learning,
'owner_approval_required',true,'external_publish',false,'paid_spend',false,'production_mutation',false);
end $$;

do $$ begin perform cron.unschedule('dani-social-visual-pipeline'); exception when others then null; end $$;
select cron.schedule('dani-social-visual-pipeline','*/30 * * * *','select public.dd_run_dani_social_visual_pipeline_v1();');

-- Proof-safety repair: DANI_PROOF content may not silently fall back to a generic Canva template.
create or replace function public.dd_social_plan_content_v1(p_limit integer default 20) returns jsonb
language plpgsql security definer set search_path=public as $$
declare v_created int:=0;
begin
  insert into public.dd_social_content_queue_v1
  (content_key,campaign_key,platform,format,service_key,hook,body_copy,visual_direction,asset_key,cta,proof_class,approval_status,dedupe_key,metadata)
  select 'SOCIAL:'||lower(g.gap_key)||':'||lower(p.platform),'DANI_VISUAL_SALES_ENGINE_V1',p.platform,
    case when p.platform in ('INSTAGRAM','TIKTOK') then 'SHORT_VIDEO_OR_CAROUSEL' else 'SINGLE_IMAGE' end,g.service_key,
    case when p.platform='NEXTDOOR' then 'Local help for '||lower(g.service_name) when p.platform='LINKEDIN' then 'The operational task your team still has to chase' else 'A real-world problem DANI DECLARES can help execute' end,
    case when p.platform='NEXTDOOR' then 'DANI DECLARES provides local execution support. Ask about '||g.service_name||'.' when p.platform='LINKEDIN' then 'DANI DECLARES coordinates practical execution around '||g.service_name||' so teams can spend less time chasing fragmented tasks.' else 'Need help with '||g.service_name||'? DANI DECLARES handles the execution with a documented, coordinated process.' end,
    case when g.proof_requirement='DANI_PROOF' then 'Use an actual DANI photo/video first. If no approved DANI proof exists, leave the visual slot empty and route the gap for asset review.' else 'Use real DANI proof when available; otherwise use licensed illustrative imagery and label the concept clearly.' end,
    case when g.proof_requirement='DANI_PROOF' then
      (select a.asset_key from public.dd_social_visual_asset_registry_v1 a where a.approval_status='OWNER_APPROVED' and a.proof_class='DANI_PROOF' and a.rights_status in ('OWNED','LICENSED_COMMERCIAL','CANVA_LICENSED') and (a.service_keys @> array[g.service_key] or a.visual_type='TEMPLATE') and p.platform=any(a.platform_scope) order by a.updated_at desc limit 1)
    else
      (select a.asset_key from public.dd_social_visual_asset_registry_v1 a where a.approval_status='OWNER_APPROVED' and a.rights_status in ('OWNED','LICENSED_COMMERCIAL','CANVA_LICENSED') and p.platform=any(a.platform_scope) order by (a.proof_class='DANI_PROOF') desc,a.updated_at desc limit 1)
    end,
    case when p.platform='LINKEDIN' then 'Request a commercial service conversation' when p.platform='NEXTDOOR' then 'Message DANI' else 'DM DANI DECLARES' end,
    g.proof_requirement,'DRAFT','SOCIAL:'||g.gap_key||':'||p.platform,
    jsonb_build_object('buyer_segment',g.buyer_segment,'visual_gap',g.gap_key,'owner_approval_required',true,'external_publish',false)
  from public.dd_social_visual_gaps_v1 g cross join lateral unnest(g.channel_scope) p(platform)
  where g.status<>'RETIRED' and not exists(select 1 from public.dd_social_content_queue_v1 q where q.dedupe_key='SOCIAL:'||g.gap_key||':'||p.platform)
  order by case coalesce(g.metadata->>'priority','P9') when 'P0' then 0 when 'P1' then 1 else 2 end limit greatest(1,least(100,p_limit));
  get diagnostics v_created=row_count;
  update public.dd_social_content_queue_v1 q set asset_key=null,updated_at=now()
  where q.approval_status='DRAFT' and q.proof_class='DANI_PROOF' and q.asset_key is not null
    and not exists(select 1 from public.dd_social_visual_asset_registry_v1 a where a.asset_key=q.asset_key and a.proof_class='DANI_PROOF' and a.approval_status='OWNER_APPROVED');
  return jsonb_build_object('status','COMPLETED','drafts_created',v_created,'proof_safety_repaired',true,'owner_approval_required',true,'external_publish',false,'production_mutation',false);
end $$;