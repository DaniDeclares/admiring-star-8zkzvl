-- DANI relationship intelligence v1
-- Reuses existing relationship types, research cross-signal queue, evidence/provenance,
-- owner attention, and partner records. This is real-world relationship intelligence;
-- it must never be confused with synthetic world relationship tables.
--
-- Governance:
-- - five commercial channels only (CH01-CH05)
-- - discovery/verification never grants outreach consent
-- - relationship classification never authorizes provider work
-- - second-degree discovery is bounded to depth <= 2
-- - inferred edges cannot be marked VERIFIED
-- - external/CRM/action mutations remain owner-governed

begin;

insert into public.dd_relationship_types(code,name,description,is_active) values
 ('RESIDENT','Resident','Known resident/community relationship; does not imply marketing consent.',true),
 ('WORKFORCE_CANDIDATE','Workforce Candidate','Person with evidence-supported potential for DANI employment/provider development; not authorized for work by classification alone.',true),
 ('COMMUNITY_CONNECTOR','Community Connector','Relationship that may introduce people, resources, organizations or opportunities.',true),
 ('INSTITUTIONAL_CONTACT','Institutional Contact','Contact inside a government, housing, nonprofit or institutional organization.',true),
 ('BUYER_INFLUENCER','Buyer / Influencer','Person who may influence or route a legitimate buying/procurement decision; buyer authority must be verified separately.',true),
 ('WORKS_AT','Works At','Observed employment or organizational affiliation.',true),
 ('DOES_BUSINESS_WITH','Does Business With','Observed business/vendor/contractor relationship between entities.',true),
 ('INTRODUCED_BY','Introduced By','Observed introduction path between entities.',true),
 ('PUBLICLY_AFFILIATED_WITH','Publicly Affiliated With','Publicly documented organizational or partnership affiliation.',true),
 ('REFERS_TO','Refers To','Observed referral relationship between entities.',true)
on conflict(code) do update
set name=excluded.name,description=excluded.description,is_active=true;

create table if not exists public.dd_relationship_intelligence_edges_v1 (
 id uuid primary key default gen_random_uuid(),
 edge_key text not null unique,
 source_entity_key text not null,
 source_entity_type text not null
   check(source_entity_type in ('DANI','PERSON','ORGANIZATION','PROPERTY','PROGRAM','PARTNER','PROVIDER','RESIDENT','OTHER')),
 target_entity_key text not null,
 target_entity_type text not null
   check(target_entity_type in ('DANI','PERSON','ORGANIZATION','PROPERTY','PROGRAM','PARTNER','PROVIDER','RESIDENT','OTHER')),
 relationship_type text not null references public.dd_relationship_types(code),
 channel_code text check(channel_code is null or channel_code in ('CH01','CH02','CH03','CH04','CH05')),
 relationship_state text not null default 'KNOWN'
   check(relationship_state in ('KNOWN','WARM','ACTIVE','DORMANT','HISTORICAL','UNKNOWN')),
 provenance_state text not null default 'OBSERVED'
   check(provenance_state in ('OBSERVED','INFERRED')),
 temporal_state text not null default 'CURRENT'
   check(temporal_state in ('CURRENT','HISTORICAL','UNKNOWN')),
 verification_status text not null default 'CANDIDATE'
   check(verification_status in ('CANDIDATE','VERIFIED','REJECTED','STALE')),
 confidence numeric not null default 0.50 check(confidence >= 0 and confidence <= 1),
 source_system text not null,
 source_url text,
 source_message_id text,
 source_thread_id text,
 evidence jsonb not null default '{}'::jsonb,
 entity_refs jsonb not null default '{}'::jsonb,
 relevance_tags text[] not null default '{}'::text[],
 discovery_depth smallint not null default 0 check(discovery_depth between 0 and 2),
 parent_edge_id uuid references public.dd_relationship_intelligence_edges_v1(id) on delete set null,
 recursion_eligible boolean not null default false,
 owner_approval_required boolean not null default true,
 outreach_authorized boolean not null default false check(outreach_authorized=false),
 routed_at timestamptz,
 observed_at timestamptz,
 verified_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(source_entity_key <> target_entity_key),
 check(provenance_state <> 'INFERRED' or verification_status <> 'VERIFIED')
);

create index if not exists dd_relationship_intelligence_edges_v1_target_idx
 on public.dd_relationship_intelligence_edges_v1(target_entity_key,verification_status,updated_at desc);
create index if not exists dd_relationship_intelligence_edges_v1_source_idx
 on public.dd_relationship_intelligence_edges_v1(source_entity_key,relationship_type,updated_at desc);
create index if not exists dd_relationship_intelligence_edges_v1_route_idx
 on public.dd_relationship_intelligence_edges_v1(verification_status,recursion_eligible,discovery_depth,routed_at);

alter table public.dd_relationship_intelligence_edges_v1 enable row level security;
revoke all on public.dd_relationship_intelligence_edges_v1 from anon, public;
grant select on public.dd_relationship_intelligence_edges_v1 to authenticated, service_role;
grant insert,update,delete on public.dd_relationship_intelligence_edges_v1 to service_role;

drop policy if exists dd_relationship_intelligence_edges_staff_select
 on public.dd_relationship_intelligence_edges_v1;
create policy dd_relationship_intelligence_edges_staff_select
 on public.dd_relationship_intelligence_edges_v1 for select to authenticated
 using (private.dd_is_staff_admin());

drop policy if exists dd_relationship_intelligence_edges_service_role
 on public.dd_relationship_intelligence_edges_v1;
create policy dd_relationship_intelligence_edges_service_role
 on public.dd_relationship_intelligence_edges_v1 for all to service_role
 using (true) with check(true);

comment on table public.dd_relationship_intelligence_edges_v1 is
'Provenance-backed real-world relationship graph for DANI research. Separate from synthetic world tables. Discovery does not imply consent, outreach authority, provider authorization, buyer authority or CRM lifecycle promotion.';

create or replace function public.dd_ingest_relationship_intelligence_v1(
 p_source_entity_key text,
 p_source_entity_type text,
 p_target_entity_key text,
 p_target_entity_type text,
 p_relationship_type text,
 p_source_system text,
 p_source_url text default null,
 p_source_message_id text default null,
 p_source_thread_id text default null,
 p_evidence jsonb default '{}'::jsonb,
 p_entity_refs jsonb default '{}'::jsonb,
 p_relevance_tags text[] default '{}'::text[],
 p_channel_code text default null,
 p_relationship_state text default 'KNOWN',
 p_temporal_state text default 'CURRENT',
 p_confidence numeric default 0.50,
 p_discovery_depth smallint default 0,
 p_parent_edge_id uuid default null
) returns jsonb
language plpgsql security definer set search_path=''
as $$
declare
 v_edge_key text;
 v_id uuid;
 v_recursive boolean;
begin
 if current_user not in ('postgres','service_role') then
   raise exception 'SERVICE_ROLE_REQUIRED';
 end if;
 if nullif(trim(p_source_entity_key),'') is null
    or nullif(trim(p_target_entity_key),'') is null then
   raise exception 'ENTITY_KEY_REQUIRED';
 end if;
 if p_discovery_depth < 0 or p_discovery_depth > 2 then
   raise exception 'DISCOVERY_DEPTH_OUT_OF_RANGE';
 end if;
 if not exists(
   select 1 from public.dd_relationship_types
   where code=p_relationship_type and is_active
 ) then
   raise exception 'RELATIONSHIP_TYPE_NOT_ACTIVE';
 end if;
 if p_channel_code is not null
    and p_channel_code not in ('CH01','CH02','CH03','CH04','CH05') then
   raise exception 'INVALID_CHANNEL';
 end if;
 if p_confidence < 0 or p_confidence > 1 then
   raise exception 'INVALID_CONFIDENCE';
 end if;

 v_recursive :=
   p_discovery_depth < 2
   and coalesce(p_relevance_tags,'{}'::text[]) && array[
     'BUYER','VENDOR','PARTNER','PROVIDER','REFERRAL','WORKFORCE',
     'CH01','CH03','CH04','CH05','PROCUREMENT','SERVICE_CAPABILITY','INSTITUTIONAL'
   ]::text[];

 v_edge_key := md5(
   lower(trim(p_source_entity_key))||'|'||
   lower(trim(p_target_entity_key))||'|'||
   p_relationship_type||'|'||
   upper(trim(p_source_system))||'|'||
   coalesce(p_source_url,'')||'|'||
   coalesce(p_source_message_id,'')
 );

 insert into public.dd_relationship_intelligence_edges_v1(
   edge_key,source_entity_key,source_entity_type,target_entity_key,target_entity_type,
   relationship_type,channel_code,relationship_state,provenance_state,temporal_state,
   verification_status,confidence,source_system,source_url,source_message_id,source_thread_id,
   evidence,entity_refs,relevance_tags,discovery_depth,parent_edge_id,recursion_eligible,
   owner_approval_required,outreach_authorized,observed_at
 ) values (
   v_edge_key,trim(p_source_entity_key),upper(p_source_entity_type),
   trim(p_target_entity_key),upper(p_target_entity_type),
   p_relationship_type,p_channel_code,upper(p_relationship_state),'OBSERVED',upper(p_temporal_state),
   'CANDIDATE',p_confidence,upper(trim(p_source_system)),p_source_url,p_source_message_id,p_source_thread_id,
   coalesce(p_evidence,'{}'::jsonb),coalesce(p_entity_refs,'{}'::jsonb),
   coalesce(p_relevance_tags,'{}'::text[]),
   p_discovery_depth,p_parent_edge_id,v_recursive,true,false,now()
 )
 on conflict(edge_key) do update set
   evidence=public.dd_relationship_intelligence_edges_v1.evidence || excluded.evidence,
   entity_refs=public.dd_relationship_intelligence_edges_v1.entity_refs || excluded.entity_refs,
   relevance_tags=(
     select array(
       select distinct x
       from unnest(
         public.dd_relationship_intelligence_edges_v1.relevance_tags || excluded.relevance_tags
       ) x
     )
   ),
   relationship_state=excluded.relationship_state,
   temporal_state=excluded.temporal_state,
   confidence=greatest(public.dd_relationship_intelligence_edges_v1.confidence,excluded.confidence),
   recursion_eligible=
     public.dd_relationship_intelligence_edges_v1.recursion_eligible
     or excluded.recursion_eligible,
   observed_at=greatest(
     public.dd_relationship_intelligence_edges_v1.observed_at,
     excluded.observed_at
   ),
   updated_at=now()
 returning id into v_id;

 return jsonb_build_object(
   'status','CAPTURED',
   'edge_id',v_id,
   'edge_key',v_edge_key,
   'outreach_authorized',false,
   'owner_approval_required',true
 );
end $$;

revoke all on function public.dd_ingest_relationship_intelligence_v1(
 text,text,text,text,text,text,text,text,text,jsonb,jsonb,text[],text,text,text,numeric,smallint,uuid
) from public,anon,authenticated;
grant execute on function public.dd_ingest_relationship_intelligence_v1(
 text,text,text,text,text,text,text,text,text,jsonb,jsonb,text[],text,text,text,numeric,smallint,uuid
) to service_role;

create or replace function public.dd_verify_relationship_intelligence_v1(
 p_edge_id uuid,
 p_confidence numeric,
 p_verification_evidence jsonb
) returns jsonb
language plpgsql security definer set search_path=''
as $$
declare
 v_row public.dd_relationship_intelligence_edges_v1%rowtype;
begin
 if current_user not in ('postgres','service_role') then
   raise exception 'SERVICE_ROLE_REQUIRED';
 end if;
 if p_confidence < 0.60 or p_confidence > 1 then
   raise exception 'VERIFIED_CONFIDENCE_OUT_OF_RANGE';
 end if;
 if p_verification_evidence is null or p_verification_evidence='{}'::jsonb then
   raise exception 'VERIFICATION_EVIDENCE_REQUIRED';
 end if;

 select * into v_row
 from public.dd_relationship_intelligence_edges_v1
 where id=p_edge_id
 for update;

 if not found then raise exception 'RELATIONSHIP_EDGE_NOT_FOUND'; end if;
 if v_row.provenance_state='INFERRED' then
   raise exception 'INFERRED_EDGE_REQUIRES_OBSERVED_EVIDENCE';
 end if;

 update public.dd_relationship_intelligence_edges_v1
 set verification_status='VERIFIED',
     confidence=greatest(confidence,p_confidence),
     evidence=evidence || jsonb_build_object(
       'verification',p_verification_evidence,
       'verified_at',now()
     ),
     verified_at=now(),
     updated_at=now()
 where id=p_edge_id;

 return jsonb_build_object(
   'status','VERIFIED',
   'edge_id',p_edge_id,
   'outreach_authorized',false
 );
end $$;

revoke all on function public.dd_verify_relationship_intelligence_v1(uuid,numeric,jsonb)
 from public,anon,authenticated;
grant execute on function public.dd_verify_relationship_intelligence_v1(uuid,numeric,jsonb)
 to service_role;

create or replace function public.dd_route_relationship_intelligence_v1(
 p_limit integer default 100
) returns jsonb
language plpgsql security definer set search_path=''
as $$
declare
 r record;
 v_queued integer:=0;
 v_attention integer:=0;
begin
 if current_user not in ('postgres','service_role') then
   raise exception 'SERVICE_ROLE_REQUIRED';
 end if;

 for r in
   select *
   from public.dd_relationship_intelligence_edges_v1
   where verification_status='VERIFIED'
     and recursion_eligible=true
     and discovery_depth<2
     and routed_at is null
     and relevance_tags && array[
       'BUYER','VENDOR','PARTNER','PROVIDER','REFERRAL','WORKFORCE',
       'CH01','CH03','CH04','CH05','PROCUREMENT','SERVICE_CAPABILITY','INSTITUTIONAL'
     ]::text[]
   order by verified_at nulls last, created_at
   limit greatest(1,least(coalesce(p_limit,100),500))
 loop
   insert into public.dd_research_cross_signal_queue(
     signal_key,candidate_key,source_system,signal_type,signal_payload,status,
     requires_fresh_research,requires_tester_proof,owner_approval_required
   ) values (
     'REL_EDGE:'||r.id::text,
     r.target_entity_key,
     'DANI_RELATIONSHIP_GRAPH',
     'SECOND_DEGREE_RELATIONSHIP',
     jsonb_build_object(
       'relationship_edge_id',r.id,
       'source_entity_key',r.source_entity_key,
       'target_entity_key',r.target_entity_key,
       'relationship_type',r.relationship_type,
       'next_discovery_depth',r.discovery_depth+1,
       'relevance_tags',r.relevance_tags,
       'evidence',r.evidence,
       'entity_refs',r.entity_refs,
       'outreach_authorized',false
     ),
     'QUEUED',true,true,true
   )
   on conflict(signal_key) do nothing;

   if found then v_queued:=v_queued+1; end if;

   if not exists(
     select 1
     from public.dd_owner_attention_queue
     where domain='COMMERCIAL_INTELLIGENCE'
       and source_table='dd_relationship_intelligence_edges_v1'
       and source_record_id=r.id::text
       and status='OPEN'
   ) then
     insert into public.dd_owner_attention_queue(
       domain,source_table,source_record_id,reason,priority,status,
       recommended_action,metadata
     ) values (
       'COMMERCIAL_INTELLIGENCE',
       'dd_relationship_intelligence_edges_v1',
       r.id::text,
       'Verified relationship intelligence produced a relevant second-degree research path.',
       'MEDIUM',
       'OPEN',
       'Review the relationship context before any outreach, CRM mutation, provider activation, quote or external action.',
       jsonb_build_object(
         'target_entity_key',r.target_entity_key,
         'relationship_type',r.relationship_type,
         'relevance_tags',r.relevance_tags,
         'outreach_authorized',false
       )
     );
     v_attention:=v_attention+1;
   end if;

   update public.dd_relationship_intelligence_edges_v1
   set routed_at=now(),updated_at=now()
   where id=r.id;
 end loop;

 return jsonb_build_object(
   'queued',v_queued,
   'owner_attention_created',v_attention,
   'outreach_authorized',false
 );
end $$;

revoke all on function public.dd_route_relationship_intelligence_v1(integer)
 from public,anon,authenticated;
grant execute on function public.dd_route_relationship_intelligence_v1(integer)
 to service_role;

create or replace view public.dd_relationship_intelligence_owner_brief_v1
with (security_invoker=true)
as
select
 id,
 source_entity_key,
 source_entity_type,
 target_entity_key,
 target_entity_type,
 relationship_type,
 channel_code,
 relationship_state,
 temporal_state,
 verification_status,
 confidence,
 source_system,
 relevance_tags,
 discovery_depth,
 recursion_eligible,
 owner_approval_required,
 outreach_authorized,
 observed_at,
 verified_at,
 routed_at,
 updated_at
from public.dd_relationship_intelligence_edges_v1
where verification_status in ('CANDIDATE','VERIFIED')
order by coalesce(verified_at,observed_at,created_at) desc;

grant select on public.dd_relationship_intelligence_owner_brief_v1
 to authenticated,service_role;

-- Preserve existing partner truth instead of rediscovering it as a cold lead.
insert into public.dd_relationship_intelligence_edges_v1(
 edge_key,source_entity_key,source_entity_type,target_entity_key,target_entity_type,
 relationship_type,channel_code,relationship_state,provenance_state,temporal_state,
 verification_status,confidence,source_system,evidence,entity_refs,relevance_tags,
 discovery_depth,recursion_eligible,owner_approval_required,outreach_authorized,
 observed_at,verified_at
)
select
 md5('dani|waters-roofing|partner|supabase-canonical-partner'),
 'DANI DECLARES LLC',
 'DANI',
 'Waters Roofing',
 'PARTNER',
 'PARTNER',
 'CH05',
 'ACTIVE',
 'OBSERVED',
 'CURRENT',
 'VERIFIED',
 0.95,
 'SUPABASE_CANONICAL_PARTNER',
 jsonb_build_object(
   'partner_id',p.id,
   'source',p.source,
   'relationship_status',p.relationship_status,
   'internal_notes',p.internal_notes
 ),
 jsonb_build_object(
   'dd_partners_id',p.id,
   'primary_contact_name',p.primary_contact_name
 ),
 array['PARTNER','REFERRAL','SERVICE_CAPABILITY']::text[],
 0,
 true,
 true,
 false,
 coalesce(p.created_at,now()),
 now()
from public.dd_partners p
where lower(p.partner_name)='waters roofing'
  and upper(coalesce(p.relationship_status,''))='ACTIVE'
on conflict(edge_key) do update set
 evidence=excluded.evidence,
 entity_refs=excluded.entity_refs,
 relationship_state='ACTIVE',
 verification_status='VERIFIED',
 confidence=greatest(
   public.dd_relationship_intelligence_edges_v1.confidence,
   excluded.confidence
 ),
 recursion_eligible=true,
 updated_at=now();

do $$
begin
 if not exists(
   select 1 from cron.job
   where jobname='dani-relationship-intelligence-router'
 ) then
   perform cron.schedule(
     'dani-relationship-intelligence-router',
     '17,47 * * * *',
     'select public.dd_route_relationship_intelligence_v1(100);'
   );
 end if;
end $$;

-- Migration-level safety checks.
do $$
begin
 if exists(
   select 1
   from public.dd_relationship_intelligence_edges_v1
   where outreach_authorized
 ) then
   raise exception 'RELATIONSHIP_INTELLIGENCE_OUTREACH_MUST_REMAIN_FALSE';
 end if;
 if exists(
   select 1
   from public.dd_relationship_intelligence_edges_v1
   where discovery_depth > 2
 ) then
   raise exception 'RELATIONSHIP_INTELLIGENCE_DEPTH_BREACH';
 end if;
end $$;

commit;
