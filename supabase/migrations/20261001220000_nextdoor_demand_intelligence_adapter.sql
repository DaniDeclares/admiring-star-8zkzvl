-- Extend the existing Demand Radar / demand-capture control plane for Nextdoor.
-- This is deliberately NOT a second CRM, research store, outreach engine, or pricing engine.
-- It adds source-aware classification and a governed ingest RPC over dd_demand_capture_staging.

alter table public.dd_demand_capture_staging
  add column if not exists intelligence_class text,
  add column if not exists advertised_price numeric,
  add column if not exists geography text,
  add column if not exists source_metadata jsonb not null default '{}'::jsonb;

alter table public.dd_demand_capture_staging
  drop constraint if exists dd_demand_capture_staging_intelligence_class_check;

alter table public.dd_demand_capture_staging
  add constraint dd_demand_capture_staging_intelligence_class_check
  check (
    intelligence_class is null
    or intelligence_class in (
      'BUYER_SIGNAL',
      'COMPETITOR_SIGNAL',
      'PROVIDER_PARTNER_SIGNAL',
      'MARKET_PRICING_EVIDENCE',
      'IRRELEVANT_AD'
    )
  );

create index if not exists dd_demand_capture_staging_intelligence_idx
  on public.dd_demand_capture_staging(source_type, intelligence_class, observed_at desc);

create or replace function private.dd_ingest_nextdoor_signal(
  p_source_signal_id text,
  p_source_url text,
  p_listing_title text,
  p_listing_category text,
  p_listing_price numeric,
  p_geography text,
  p_observed_at timestamptz,
  p_contact_name text default null,
  p_need_summary text default null,
  p_source_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_text text := lower(coalesce(p_listing_title,'') || ' ' || coalesce(p_need_summary,''));
  v_class text;
  v_channel text;
  v_service_hint text;
  v_promotion text := 'RESEARCH_ONLY';
  v_demand_class text;
  v_contact_permission text := 'PUBLIC_CONTACT_ROUTE';
  v_verification text := 'SOURCE_OBSERVED';
  v_id uuid;
begin
  if nullif(trim(p_source_signal_id),'') is null or nullif(trim(p_source_url),'') is null then
    raise exception 'Nextdoor signal requires source_signal_id and source_url';
  end if;

  -- Buyer intent wins over generic category classification.
  if v_text ~ '(private owner|landlord|for rent|for sale|new listing|townhome|townhouse|apartment|house for rent|rent to own|moving soon|move[- ]?in|move[- ]?out|estate sale|open house)' then
    v_class := 'BUYER_SIGNAL';
    if v_text ~ '(for rent|landlord|private owner|apartment|tenant|rental|rent to own)' then
      v_channel := 'CH03';
      v_service_hint := 'PROPERTY_TURNOVER_FIELD_SUPPORT';
    elsif v_text ~ '(for sale|new listing|open house|townhome|townhouse)' then
      v_channel := 'CH04';
      v_service_hint := 'LISTING_PREP_REAL_ESTATE_SUPPORT';
    else
      v_channel := 'CH01';
      v_service_hint := 'RESIDENT_MOVE_HOME_SUPPORT';
    end if;
    v_demand_class := 'BUYING_SIGNAL';
    -- A public listing is a lead signal, not consent for automated off-platform outreach.
    -- Keep it at owner review unless a governed contact route is separately verified.
    v_promotion := 'OWNER_REVIEW';
  elsif v_text ~ '(cleaning|handyman|junk|haul|pressure wash|gutter|lawn|pet sitting|moving|roof|headlight|firewood|repair|service)' then
    v_class := 'COMPETITOR_SIGNAL';
    v_channel := 'CH05';
    v_service_hint := 'LOCAL_COMPETITOR_OBSERVATION';
    v_demand_class := 'MARKET_INTELLIGENCE';
  elsif v_text ~ '(provider|contractor|partner|delivery|fabrication|installer|technician)' then
    v_class := 'PROVIDER_PARTNER_SIGNAL';
    v_channel := 'CH05';
    v_service_hint := 'PROVIDER_PARTNER_DISCOVERY';
    v_demand_class := 'SUPPLY_SIGNAL';
  elsif p_listing_price is not null then
    v_class := 'MARKET_PRICING_EVIDENCE';
    v_channel := 'CH05';
    v_service_hint := 'LOCAL_MARKET_PRICE_OBSERVATION';
    v_demand_class := 'MARKET_INTELLIGENCE';
  else
    v_class := 'IRRELEVANT_AD';
    v_channel := 'CH05';
    v_service_hint := 'NO_ACTION';
    v_demand_class := 'NON_ACTIONABLE';
    v_promotion := 'DISCARDED';
  end if;

  insert into public.dd_demand_capture_staging (
    source_type, source_url, source_signal_id, channel_code, signal_type,
    service_hint, market, need_summary, urgency, contact_name,
    contact_permission, verification_status, promotion_status,
    owner_attention_required, attention_reason, demand_class, observed_at,
    intelligence_class, advertised_price, geography, source_metadata
  ) values (
    'NEXTDOOR_LISTING', p_source_url, p_source_signal_id, v_channel, 'PUBLIC_MARKET_SIGNAL',
    v_service_hint, 'METRO_ATLANTA', left(coalesce(p_need_summary,p_listing_title),4000), 'NORMAL', p_contact_name,
    v_contact_permission, v_verification, v_promotion,
    (v_promotion = 'OWNER_REVIEW'),
    case when v_promotion = 'OWNER_REVIEW' then 'Public Nextdoor buyer signal requires governed contact-route verification before outreach.' else null end,
    v_demand_class, coalesce(p_observed_at,now()),
    v_class, p_listing_price, p_geography,
    coalesce(p_source_metadata,'{}'::jsonb) || jsonb_build_object(
      'platform','NEXTDOOR',
      'listing_title',p_listing_title,
      'listing_category',p_listing_category,
      'pricing_authority',false,
      'auto_outreach',false
    )
  )
  on conflict (source_type, source_signal_id) where source_signal_id is not null
  do update set
    source_url = excluded.source_url,
    need_summary = excluded.need_summary,
    advertised_price = excluded.advertised_price,
    geography = excluded.geography,
    source_metadata = public.dd_demand_capture_staging.source_metadata || excluded.source_metadata,
    observed_at = greatest(public.dd_demand_capture_staging.observed_at, excluded.observed_at),
    updated_at = now()
  returning id into v_id;

  return jsonb_build_object(
    'demand_capture_id',v_id,
    'source_type','NEXTDOOR_LISTING',
    'intelligence_class',v_class,
    'channel_code',v_channel,
    'promotion_status',v_promotion,
    'auto_outreach',false,
    'pricing_authority',false
  );
end;
$$;

revoke all on function private.dd_ingest_nextdoor_signal(text,text,text,text,numeric,text,timestamptz,text,text,jsonb) from public;
revoke all on function private.dd_ingest_nextdoor_signal(text,text,text,text,numeric,text,timestamptz,text,text,jsonb) from anon;
revoke all on function private.dd_ingest_nextdoor_signal(text,text,text,text,numeric,text,timestamptz,text,text,jsonb) from authenticated;
grant execute on function private.dd_ingest_nextdoor_signal(text,text,text,text,numeric,text,timestamptz,text,text,jsonb) to service_role;

comment on function private.dd_ingest_nextdoor_signal(text,text,text,text,numeric,text,timestamptz,text,text,jsonb)
is 'Governed Nextdoor adapter into existing demand capture. Public listings are intelligence signals; advertised prices are evidence only, never pricing authority; no automated outreach.';
