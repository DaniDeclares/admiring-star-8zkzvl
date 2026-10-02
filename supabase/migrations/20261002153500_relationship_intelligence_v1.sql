-- DANI relationship intelligence v1
-- Extends the existing governed commercial-intelligence graph rather than
-- creating a parallel relationship store.
--
-- Existing authority reused:
--   dd_commercial_intelligence_nodes / dd_commercial_intelligence_edges
--   dd_research_evidence_registry
--   dd_research_cross_signal_queue
--   dd_owner_attention_queue
--   dd_partners
--
-- Governance:
-- - five commercial channels only (CH01-CH05)
-- - discovery and verification never grant outreach consent
-- - relationship classification never authorizes provider work
-- - second-degree discovery is bounded to depth <= 2
-- - inferred edges cannot be promoted as verified evidence
-- - external/CRM/action mutations remain owner-governed

begin;

alter table public.dd_commercial_intelligence_nodes
  add column if not exists source_system text,
  add column if not exists entity_refs jsonb not null default '{}'::jsonb,
  add column if not exists observed_at timestamptz,
  add column if not exists verified_at timestamptz,
  add column if not exists created_at timestamptz not null default now();

alter table public.dd_commercial_intelligence_edges
  add column if not exists source_system text,
  add column if not exists source_url text,
  add column if not exists source_message_id text,
  add column if not exists source_thread_id text,
  add column if not exists evidence jsonb not null default '{}'::jsonb,
  add column if not exists entity_refs jsonb not null default '{}'::jsonb,
  add column if not exists relevance_tags text[] not null default '{}'::text[],
  add column if not exists provenance_state text not null default 'LEGACY',
  add column if not exists temporal_state text not null default 'UNKNOWN',
  add column if not exists confidence_score numeric,
  add column if not exists discovery_depth smallint not null default 0,
  add column if not exists parent_edge_id uuid references public.dd_commercial_intelligence_edges(id) on delete set null,
  add column if not exists recursion_eligible boolean not null default false,
  add column if not exists outreach_authorized boolean not null default false,
  add column if not exists observed_at timestamptz,
  add column if not exists verified_at timestamptz,
  add column if not exists routed_at timestamptz,
  add column if not exists created_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname='dd_commercial_intel_provenance_state_chk'
  ) then
    alter table public.dd_commercial_intelligence_edges
      add constraint dd_commercial_intel_provenance_state_chk
      check(provenance_state in ('LEGACY','OBSERVED','INFERRED'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname='dd_commercial_intel_temporal_state_chk'
  ) then
    alter table public.dd_commercial_intelligence_edges
      add constraint dd_commercial_intel_temporal_state_chk
      check(temporal_state in ('CURRENT','HISTORICAL','UNKNOWN'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname='dd_commercial_intel_confidence_score_chk'
  ) then
    alter table public.dd_commercial_intelligence_edges
      add constraint dd_commercial_intel_confidence_score_chk
      check(confidence_score is null or (confidence_score>=0 and confidence_score<=1));
  end if;

  if not exists (
    select 1 from pg_constraint where conname='dd_commercial_intel_discovery_depth_chk'
  ) then
    alter table public.dd_commercial_intelligence_edges
      add constraint dd_commercial_intel_discovery_depth_chk
      check(discovery_depth between 0 and 2);
  end if;

  if not exists (
    select 1 from pg_constraint where conname='dd_commercial_intel_outreach_false_chk'
  ) then
    alter table public.dd_commercial_intelligence_edges
      add constraint dd_commercial_intel_outreach_false_chk
      check(outreach_authorized=false);
  end if;

  if not exists (
    select 1 from pg_constraint where conname='dd_commercial_intel_inferred_not_verified_chk'
  ) then
    alter table public.dd_commercial_intelligence_edges
      add constraint dd_commercial_intel_inferred_not_verified_chk
      check(provenance_state<>'INFERRED' or evidence_status not in ('VERIFIED','GOVERNED'));
  end if;
end $$;

create index if not exists dd_commercial_intelligence_edges_relationship_route_idx
  on public.dd_commercial_intelligence_edges(
    evidence_status,recursion_eligible,discovery_depth,routed_at
  )
  where recursion_eligible=true;

-- Existing tables were service-role only. Add the same staff-admin read pattern
-- used elsewhere so Owner HQ can surface graph intelligence without allowing writes.
alter table public.dd_commercial_intelligence_nodes enable row level security;
alter table public.dd_commercial_intelligence_edges enable row level security;

grant select on
  public.dd_commercial_intelligence_nodes,
  public.dd_commercial_intelligence_edges
to authenticated, service_role;

grant insert,update,delete on
  public.dd_commercial_intelligence_nodes,
  public.dd_commercial_intelligence_edges
to service_role;

drop policy if exists dd_commercial_intelligence_nodes_staff_read
  on public.dd_commercial_intelligence_nodes;
create policy dd_commercial_intelligence_nodes_staff_read
  on public.dd_commercial_intelligence_nodes
  for select to authenticated
  using (private.dd_is_staff_admin());

drop policy if exists dd_commercial_intelligence_edges_staff_read
  on public.dd_commercial_intelligence_edges;
create policy dd_commercial_intelligence_edges_staff_read
  on public.dd_commercial_intelligence_edges
  for select to authenticated
  using (private.dd_is_staff_admin());

drop policy if exists dd_commercial_intelligence_nodes_service_role
  on public.dd_commercial_intelligence_nodes;
create policy dd_commercial_intelligence_nodes_service_role
  on public.dd_commercial_intelligence_nodes
  for all to service_role
  using(true) with check(true);

drop policy if exists dd_commercial_intelligence_edges_service_role
  on public.dd_commercial_intelligence_edges;
create policy dd_commercial_intelligence_edges_service_role
  on public.dd_commercial_intelligence_edges
  for all to service_role
  using(true) with check(true);

create or replace function public.dd_ingest_relationship_intelligence_v1(
  p_from_type text,
  p_from_key text,
  p_from_name text,
  p_to_type text,
  p_to_key text,
  p_to_name text,
  p_relationship_type text,
  p_source_system text,
  p_source_url text default null,
  p_source_message_id text default null,
  p_source_thread_id text default null,
  p_evidence jsonb default '{}'::jsonb,
  p_entity_refs jsonb default '{}'::jsonb,
  p_relevance_tags text[] default '{}'::text[],
  p_channel_code text default null,
  p_temporal_state text default 'CURRENT',
  p_confidence_score numeric default 0.50,
  p_discovery_depth smallint default 0,
  p_parent_edge_id uuid default null
) returns jsonb
language plpgsql security definer set search_path=''
as $$
declare
  v_edge_id uuid;
  v_recursive boolean;
  v_evidence_key text;
begin
  if current_user not in ('postgres','service_role') then
    raise exception 'SERVICE_ROLE_REQUIRED';
  end if;

  if nullif(trim(p_from_key),'') is null
     or nullif(trim(p_to_key),'') is null then
    raise exception 'ENTITY_KEY_REQUIRED';
  end if;

  if trim(p_from_key)=trim(p_to_key)
     and upper(trim(p_from_type))=upper(trim(p_to_type)) then
    raise exception 'SELF_EDGE_NOT_ALLOWED';
  end if;

  if p_channel_code is not null
     and p_channel_code not in ('CH01','CH02','CH03','CH04','CH05') then
    raise exception 'INVALID_CHANNEL';
  end if;

  if p_temporal_state not in ('CURRENT','HISTORICAL','UNKNOWN') then
    raise exception 'INVALID_TEMPORAL_STATE';
  end if;

  if p_confidence_score<0 or p_confidence_score>1 then
    raise exception 'INVALID_CONFIDENCE';
  end if;

  if p_discovery_depth<0 or p_discovery_depth>2 then
    raise exception 'DISCOVERY_DEPTH_OUT_OF_RANGE';
  end if;

  v_recursive :=
    p_discovery_depth<2
    and coalesce(p_relevance_tags,'{}'::text[]) && array[
      'BUYER','VENDOR','PARTNER','PROVIDER','REFERRAL','WORKFORCE',
      'CH01','CH03','CH04','CH05','PROCUREMENT','SERVICE_CAPABILITY','INSTITUTIONAL'
    ]::text[];

  insert into public.dd_commercial_intelligence_nodes(
    node_type,node_key,node_name,channel_code,status,metadata,
    source_system,entity_refs,observed_at
  ) values(
    upper(trim(p_from_type)),
    trim(p_from_key),
    coalesce(nullif(trim(p_from_name),''),trim(p_from_key)),
    p_channel_code,
    'ACTIVE',
    '{}'::jsonb,
    upper(trim(p_source_system)),
    coalesce(p_entity_refs,'{}'::jsonb),
    now()
  )
  on conflict(node_type,node_key) do update set
    node_name=excluded.node_name,
    channel_code=coalesce(
      excluded.channel_code,
      public.dd_commercial_intelligence_nodes.channel_code
    ),
    source_system=coalesce(
      excluded.source_system,
      public.dd_commercial_intelligence_nodes.source_system
    ),
    entity_refs=
      public.dd_commercial_intelligence_nodes.entity_refs||excluded.entity_refs,
    observed_at=greatest(
      public.dd_commercial_intelligence_nodes.observed_at,
      excluded.observed_at
    ),
    updated_at=now();

  insert into public.dd_commercial_intelligence_nodes(
    node_type,node_key,node_name,channel_code,status,metadata,
    source_system,entity_refs,observed_at
  ) values(
    upper(trim(p_to_type)),
    trim(p_to_key),
    coalesce(nullif(trim(p_to_name),''),trim(p_to_key)),
    p_channel_code,
    'ACTIVE',
    '{}'::jsonb,
    upper(trim(p_source_system)),
    coalesce(p_entity_refs,'{}'::jsonb),
    now()
  )
  on conflict(node_type,node_key) do update set
    node_name=excluded.node_name,
    channel_code=coalesce(
      excluded.channel_code,
      public.dd_commercial_intelligence_nodes.channel_code
    ),
    source_system=coalesce(
      excluded.source_system,
      public.dd_commercial_intelligence_nodes.source_system
    ),
    entity_refs=
      public.dd_commercial_intelligence_nodes.entity_refs||excluded.entity_refs,
    observed_at=greatest(
      public.dd_commercial_intelligence_nodes.observed_at,
      excluded.observed_at
    ),
    updated_at=now();

  insert into public.dd_commercial_intelligence_edges(
    from_type,from_key,to_type,to_key,relationship_type,
    confidence,evidence_status,commercial_rule,source_authority,
    owner_approval_required,status,
    source_system,source_url,source_message_id,source_thread_id,
    evidence,entity_refs,relevance_tags,provenance_state,temporal_state,
    confidence_score,discovery_depth,parent_edge_id,recursion_eligible,
    outreach_authorized,observed_at
  ) values(
    upper(trim(p_from_type)),
    trim(p_from_key),
    upper(trim(p_to_type)),
    trim(p_to_key),
    upper(trim(p_relationship_type)),
    'UNVERIFIED',
    'NEEDS_RESEARCH',
    '{}'::jsonb,
    upper(trim(p_source_system)),
    true,
    'ACTIVE',
    upper(trim(p_source_system)),
    p_source_url,
    p_source_message_id,
    p_source_thread_id,
    coalesce(p_evidence,'{}'::jsonb),
    coalesce(p_entity_refs,'{}'::jsonb),
    coalesce(p_relevance_tags,'{}'::text[]),
    'OBSERVED',
    p_temporal_state,
    p_confidence_score,
    p_discovery_depth,
    p_parent_edge_id,
    v_recursive,
    false,
    now()
  )
  on conflict(from_type,from_key,to_type,to_key,relationship_type) do update set
    evidence=
      public.dd_commercial_intelligence_edges.evidence||excluded.evidence,
    entity_refs=
      public.dd_commercial_intelligence_edges.entity_refs||excluded.entity_refs,
    relevance_tags=(
      select array(
        select distinct x
        from unnest(
          public.dd_commercial_intelligence_edges.relevance_tags
          || excluded.relevance_tags
        ) x
      )
    ),
    source_system=excluded.source_system,
    source_url=coalesce(
      excluded.source_url,
      public.dd_commercial_intelligence_edges.source_url
    ),
    source_message_id=coalesce(
      excluded.source_message_id,
      public.dd_commercial_intelligence_edges.source_message_id
    ),
    source_thread_id=coalesce(
      excluded.source_thread_id,
      public.dd_commercial_intelligence_edges.source_thread_id
    ),
    temporal_state=excluded.temporal_state,
    confidence_score=greatest(
      coalesce(public.dd_commercial_intelligence_edges.confidence_score,0),
      excluded.confidence_score
    ),
    recursion_eligible=
      public.dd_commercial_intelligence_edges.recursion_eligible
      or excluded.recursion_eligible,
    observed_at=greatest(
      public.dd_commercial_intelligence_edges.observed_at,
      excluded.observed_at
    ),
    owner_approval_required=true,
    outreach_authorized=false,
    updated_at=now()
  returning id into v_edge_id;

  v_evidence_key := 'REL:'||md5(
    upper(trim(p_from_type))||'|'||
    trim(p_from_key)||'|'||
    upper(trim(p_to_type))||'|'||
    trim(p_to_key)||'|'||
    upper(trim(p_relationship_type))||'|'||
    upper(trim(p_source_system))||'|'||
    coalesce(p_source_url,'')||'|'||
    coalesce(p_source_message_id,'')
  );

  insert into public.dd_research_evidence_registry(
    evidence_key,target_domain,target_table,target_record_id,target_field,
    claim,source_url,source_name,source_authority_class,retrieved_at,
    confidence,status,raw_evidence,implementation_authority
  ) values(
    v_evidence_key,
    'RELATIONSHIP_INTELLIGENCE',
    'dd_commercial_intelligence_edges',
    v_edge_id::text,
    'relationship_type',
    concat_ws(
      ' ',
      trim(p_from_key),
      upper(trim(p_relationship_type)),
      trim(p_to_key)
    ),
    p_source_url,
    upper(trim(p_source_system)),
    'SECONDARY',
    now(),
    p_confidence_score,
    'CURRENT',
    jsonb_build_object(
      'source_message_id',p_source_message_id,
      'source_thread_id',p_source_thread_id,
      'evidence',coalesce(p_evidence,'{}'::jsonb),
      'entity_refs',coalesce(p_entity_refs,'{}'::jsonb),
      'relevance_tags',coalesce(p_relevance_tags,'{}'::text[]),
      'discovery_depth',p_discovery_depth
    ),
    'RESEARCH_ONLY'
  )
  on conflict(evidence_key) do update set
    target_record_id=excluded.target_record_id,
    retrieved_at=now(),
    confidence=greatest(
      coalesce(public.dd_research_evidence_registry.confidence,0),
      excluded.confidence
    ),
    raw_evidence=
      public.dd_research_evidence_registry.raw_evidence
      || excluded.raw_evidence,
    updated_at=now();

  return jsonb_build_object(
    'status','CAPTURED',
    'edge_id',v_edge_id,
    'evidence_key',v_evidence_key,
    'recursion_eligible',v_recursive,
    'outreach_authorized',false,
    'owner_approval_required',true
  );
end $$;

revoke all on function public.dd_ingest_relationship_intelligence_v1(
  text,text,text,text,text,text,text,text,text,text,text,
  jsonb,jsonb,text[],text,text,numeric,smallint,uuid
) from public,anon,authenticated;

grant execute on function public.dd_ingest_relationship_intelligence_v1(
  text,text,text,text,text,text,text,text,text,text,text,
  jsonb,jsonb,text[],text,text,numeric,smallint,uuid
) to service_role;

create or replace function public.dd_verify_relationship_intelligence_v1(
  p_edge_id uuid,
  p_confidence_score numeric,
  p_verification_evidence jsonb
) returns jsonb
language plpgsql security definer set search_path=''
as $$
declare
  v_row public.dd_commercial_intelligence_edges%rowtype;
begin
  if current_user not in ('postgres','service_role') then
    raise exception 'SERVICE_ROLE_REQUIRED';
  end if;

  if p_confidence_score<0.60 or p_confidence_score>1 then
    raise exception 'VERIFIED_CONFIDENCE_OUT_OF_RANGE';
  end if;

  if p_verification_evidence is null
     or p_verification_evidence='{}'::jsonb then
    raise exception 'VERIFICATION_EVIDENCE_REQUIRED';
  end if;

  select *
  into v_row
  from public.dd_commercial_intelligence_edges
  where id=p_edge_id
  for update;

  if not found then
    raise exception 'RELATIONSHIP_EDGE_NOT_FOUND';
  end if;

  if v_row.provenance_state='INFERRED' then
    raise exception 'INFERRED_EDGE_REQUIRES_OBSERVED_EVIDENCE';
  end if;

  update public.dd_commercial_intelligence_edges
  set evidence_status='VERIFIED',
      confidence=case
        when p_confidence_score>=0.85 then 'HIGH'
        else 'MEDIUM'
      end,
      confidence_score=greatest(
        coalesce(confidence_score,0),
        p_confidence_score
      ),
      evidence=evidence||jsonb_build_object(
        'verification',p_verification_evidence,
        'verified_at',now()
      ),
      verified_at=now(),
      owner_approval_required=true,
      outreach_authorized=false,
      updated_at=now()
  where id=p_edge_id;

  update public.dd_commercial_intelligence_nodes
  set verified_at=now(),updated_at=now()
  where (node_type=v_row.from_type and node_key=v_row.from_key)
     or (node_type=v_row.to_type and node_key=v_row.to_key);

  return jsonb_build_object(
    'status','VERIFIED',
    'edge_id',p_edge_id,
    'outreach_authorized',false
  );
end $$;

revoke all on function public.dd_verify_relationship_intelligence_v1(
  uuid,numeric,jsonb
) from public,anon,authenticated;

grant execute on function public.dd_verify_relationship_intelligence_v1(
  uuid,numeric,jsonb
) to service_role;

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
    from public.dd_commercial_intelligence_edges
    where evidence_status in ('VERIFIED','GOVERNED')
      and provenance_state in ('OBSERVED','LEGACY')
      and recursion_eligible=true
      and discovery_depth<2
      and routed_at is null
      and relevance_tags && array[
        'BUYER','VENDOR','PARTNER','PROVIDER','REFERRAL','WORKFORCE',
        'CH01','CH03','CH04','CH05','PROCUREMENT','SERVICE_CAPABILITY','INSTITUTIONAL'
      ]::text[]
    order by verified_at nulls last, updated_at
    limit greatest(1,least(coalesce(p_limit,100),500))
  loop
    insert into public.dd_research_cross_signal_queue(
      signal_key,candidate_key,source_system,signal_type,signal_payload,status,
      requires_fresh_research,requires_tester_proof,owner_approval_required
    ) values(
      'REL_EDGE:'||r.id::text,
      r.to_key,
      'DANI_RELATIONSHIP_GRAPH',
      'SECOND_DEGREE_RELATIONSHIP',
      jsonb_build_object(
        'relationship_edge_id',r.id,
        'from_type',r.from_type,
        'from_key',r.from_key,
        'to_type',r.to_type,
        'to_key',r.to_key,
        'relationship_type',r.relationship_type,
        'next_discovery_depth',r.discovery_depth+1,
        'relevance_tags',r.relevance_tags,
        'evidence',r.evidence,
        'entity_refs',r.entity_refs,
        'outreach_authorized',false
      ),
      'QUEUED',
      true,
      true,
      true
    )
    on conflict(signal_key) do nothing;

    if found then
      v_queued:=v_queued+1;
    end if;

    if not exists(
      select 1
      from public.dd_owner_attention_queue
      where domain='COMMERCIAL_INTELLIGENCE'
        and source_table='dd_commercial_intelligence_edges'
        and source_record_id=r.id::text
        and status='OPEN'
    ) then
      insert into public.dd_owner_attention_queue(
        domain,source_table,source_record_id,reason,priority,status,
        recommended_action,metadata
      ) values(
        'COMMERCIAL_INTELLIGENCE',
        'dd_commercial_intelligence_edges',
        r.id::text,
        'Verified relationship intelligence produced a relevant second-degree research path.',
        'MEDIUM',
        'OPEN',
        'Review relationship context before outreach, CRM mutation, provider activation, quote or external action.',
        jsonb_build_object(
          'to_key',r.to_key,
          'relationship_type',r.relationship_type,
          'relevance_tags',r.relevance_tags,
          'outreach_authorized',false
        )
      );
      v_attention:=v_attention+1;
    end if;

    update public.dd_commercial_intelligence_edges
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
  e.id,
  e.from_type,
  e.from_key,
  fn.node_name as from_name,
  e.to_type,
  e.to_key,
  tn.node_name as to_name,
  e.relationship_type,
  coalesce(fn.channel_code,tn.channel_code) as channel_code,
  e.confidence,
  e.confidence_score,
  e.evidence_status,
  e.source_system,
  e.relevance_tags,
  e.provenance_state,
  e.temporal_state,
  e.discovery_depth,
  e.recursion_eligible,
  e.owner_approval_required,
  e.outreach_authorized,
  e.observed_at,
  e.verified_at,
  e.routed_at,
  e.updated_at
from public.dd_commercial_intelligence_edges e
left join public.dd_commercial_intelligence_nodes fn
  on fn.node_type=e.from_type and fn.node_key=e.from_key
left join public.dd_commercial_intelligence_nodes tn
  on tn.node_type=e.to_type and tn.node_key=e.to_key
where e.status='ACTIVE'
  and (
    e.source_system is not null
    or e.relevance_tags<>'{}'::text[]
  )
order by coalesce(e.verified_at,e.observed_at,e.updated_at) desc;

grant select on public.dd_relationship_intelligence_owner_brief_v1
  to authenticated,service_role;

-- Preserve the already-authoritative Flynt/Waters partner relationship so
-- the research loop does not rediscover him as a cold roofing lead.
select public.dd_ingest_relationship_intelligence_v1(
  'DANI'::text,
  'DANI DECLARES LLC'::text,
  'DANI DECLARES LLC'::text,
  'ORGANIZATION'::text,
  'PARTNER:WATERS_ROOFING'::text,
  'Waters Roofing'::text,
  'PARTNER'::text,
  'SUPABASE_CANONICAL_PARTNER'::text,
  null::text,
  null::text,
  null::text,
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
  'CH05'::text,
  'CURRENT'::text,
  0.95::numeric,
  0::smallint,
  null::uuid
)
from public.dd_partners p
where lower(p.partner_name)='waters roofing'
  and upper(coalesce(p.relationship_status,''))='ACTIVE'
limit 1;

update public.dd_commercial_intelligence_edges
set evidence_status='VERIFIED',
    confidence='HIGH',
    confidence_score=greatest(coalesce(confidence_score,0),0.95),
    verified_at=coalesce(verified_at,now()),
    owner_approval_required=true,
    outreach_authorized=false,
    updated_at=now()
where from_type='DANI'
  and from_key='DANI DECLARES LLC'
  and to_type='ORGANIZATION'
  and to_key='PARTNER:WATERS_ROOFING'
  and relationship_type='PARTNER';

do $$
begin
  if not exists(
    select 1
    from cron.job
    where jobname='dani-relationship-intelligence-router'
  ) then
    perform cron.schedule(
      'dani-relationship-intelligence-router',
      '17,47 * * * *',
      'select public.dd_route_relationship_intelligence_v1(100);'
    );
  end if;
end $$;

-- Safety checks: no migration or ingest path may silently authorize outreach,
-- and recursive discovery may never exceed second degree.
do $$
begin
  if exists(
    select 1
    from public.dd_commercial_intelligence_edges
    where outreach_authorized
  ) then
    raise exception 'RELATIONSHIP_INTELLIGENCE_OUTREACH_MUST_REMAIN_FALSE';
  end if;

  if exists(
    select 1
    from public.dd_commercial_intelligence_edges
    where discovery_depth > 2
  ) then
    raise exception 'RELATIONSHIP_INTELLIGENCE_DEPTH_BREACH';
  end if;
end $$;

commit;
