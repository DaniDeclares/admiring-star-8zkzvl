-- Sales queue context contract v1.
-- Owner ask 2026-10-02 (Dani): stop sales-queue context loss, and bring mined non-property opportunities
-- (job postings, gigs, GitHub issues/bounties, procurement notices) into the same governed path.
--
-- Evidence (read-only, 2026-10-02):
--   * Production dd_sales_queue: 99 of 120 rows have pain_point, front_door_code and solution_statement all
--     empty (28 of 38 WARM). Tester: all 37 WARM rows empty.
--   * Only demand-capture promotion writes pain/solution/front door; research promotion writes the channel code
--     ('CH03') into buyer_type and nothing else; Gmail/LinkedIn/HubSpot rows were inserted directly.
--   * Demand-capture promotion writes front_door_code = '<channel>_DEMAND_CAPTURE', which is not a
--     dd_channel_front_doors code, so even that path carries no real fulfillment route.
--
-- This migration adds no queue, miner or worker. It:
--   1. normalizes every dd_sales_queue insert/update (whatever path wrote it) so each row carries buyer,
--      pain, primary offer and fulfillment route, or a recorded list of what is missing;
--   2. keeps rows with missing context out of campaigns (campaign_eligible=false, ELIGIBLE -> SUPPRESSED);
--   3. adds opportunity_route to dd_demand_capture_staging so mined signals are classified as
--      DANI_AS_VENDOR, DANIELLE_AS_CONTRACTOR, PROVIDER_ROUTED or NOT_DELIVERABLE. Only DANI-as-vendor and
--      provider-routed signals can reach the sales queue; contractor roles stop at an owner decision.
-- Promotion functions are not redefined here (PR #525 owns them). Nothing here sends, applies or contacts.

-- 1. Buyer class -----------------------------------------------------------------------------------------

-- Business channel numbering (project instructions): CH01 residents, CH03 property management,
-- CH04 real estate, CH05 businesses. dd_channel_front_doors uses an older numbering (CH02 = PM,
-- CH03 = real estate, CH04 = business, CH05 = government), so the mapping below is explicit.
create or replace function private.dd_sales_buyer_class(p_buyer_type text, p_channel_code text)
returns text language sql immutable set search_path = '' as $$
  select case
    when upper(coalesce(p_buyer_type,'')) in ('CH01') or upper(coalesce(p_buyer_type,'')) like '%RESIDENT%' then 'RESIDENT'
    when upper(coalesce(p_buyer_type,'')) in ('CH03') or upper(coalesce(p_buyer_type,'')) like '%PROPERTY%' then 'PROPERTY_MANAGEMENT'
    when upper(coalesce(p_buyer_type,'')) in ('CH04') or upper(coalesce(p_buyer_type,'')) like '%REAL%ESTATE%'
      or upper(coalesce(p_buyer_type,'')) like '%BROKER%' then 'REAL_ESTATE'
    when upper(coalesce(p_buyer_type,'')) like '%GOVERN%' or upper(coalesce(p_buyer_type,'')) like '%INSTITUTION%' then 'GOVERNMENT'
    when upper(coalesce(p_buyer_type,'')) in ('CH05') or upper(coalesce(p_buyer_type,'')) like '%BUSINESS%' then 'BUSINESS'
    when coalesce(p_buyer_type,'') = '' and upper(coalesce(p_channel_code,'')) = 'CH01' then 'RESIDENT'
    when coalesce(p_buyer_type,'') = '' and upper(coalesce(p_channel_code,'')) = 'CH03' then 'PROPERTY_MANAGEMENT'
    when coalesce(p_buyer_type,'') = '' and upper(coalesce(p_channel_code,'')) = 'CH04' then 'REAL_ESTATE'
    when coalesce(p_buyer_type,'') = '' and upper(coalesce(p_channel_code,'')) = 'CH05' then 'BUSINESS'
  end
$$;

-- 2. Front door (fulfillment route) inference ------------------------------------------------------------

-- Keyword match on the stated pain/offer only. No match returns null, which is recorded as a gap: an
-- apartment or business is never defaulted to cleaning.
create or replace function private.dd_infer_front_door(p_buyer_class text, p_text text)
returns text language sql immutable set search_path = '' as $$
  select case p_buyer_class
    when 'RESIDENT' then case
      when t ~ '\m(pets?|plants?|dogs?|cats?)\M' then 'CH01-F03'
      when t ~ '(home watch|\maway\M|vacation|check-in visit)' then 'CH01-F04'
      when t ~ '(\mmov(e|ing)\M|guest|seasonal|airbnb)' then 'CH01-F05'
      when t ~ '(errand|concierge|pickup|delivery|grocer)' then 'CH01-F02'
      when t ~ '(clean|reset|declutter|organiz)' then 'CH01-F01'
    end
    when 'PROPERTY_MANAGEMENT' then case
      when t ~ '(\mturn|make-ready|make ready|vacan|unit reset|lease-up)' then 'CH02-F01'
      when t ~ '(inspect|condition|document|photo|audit|walkthrough)' then 'CH02-F03'
      when t ~ '(rescue|dispatch|urgent|emergency|field)' then 'CH02-F02'
      when t ~ '(office|admin|leasing|operations|compliance|backlog)' then 'CH02-F04'
    end
    when 'REAL_ESTATE' then case
      when t ~ '(closing|transaction|notary|signing|loan)' then 'CH03-F02'
      when t ~ '(listing|staging|\mprep|showing)' then 'CH03-F01'
      when t ~ '(inspect|photo|document|field)' then 'CH03-F03'
      when t ~ '(office|admin|brokerage|assistant|coordinator)' then 'CH03-F04'
    end
    when 'BUSINESS' then case
      when t ~ '(urgent|emergency|same-day|\mrush\M)' then 'CH04-F04'
      when t ~ '(recurring|program|weekly|monthly|janitorial)' then 'CH04-F03'
      when t ~ '(office|admin|assistant|executive|workplace|client service|project support|operations)' then 'CH04-F02'
      when t ~ '(facility|facilities|\msites?\M|clean|suite reset)' then 'CH04-F01'
    end
    when 'GOVERNMENT' then case
      when t ~ '(solicitation|\mrfp|\mrfq|\mbids?\M|proposal)' then 'CH05-F02'
      when t ~ '(task order|contract line)' then 'CH05-F03'
      when t ~ '(facility|janitorial|clean|grounds)' then 'CH05-F01'
    end
  end
  from (select lower(coalesce(p_text,'')) as t) x
$$;

-- 3. Normalizer on every sales-queue write ---------------------------------------------------------------

create or replace function private.dd_normalize_sales_queue_context()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  md jsonb := coalesce(new.sales_metadata, '{}'::jsonb);
  v_class text;
  v_fd text;
  v_fd_basis text;
  v_gaps text[] := '{}';
begin
  v_class := private.dd_sales_buyer_class(new.buyer_type, md->>'channel_code');

  -- buyer_type: fill when empty; replace a bare channel code (research promotion wrote 'CH03' here).
  if coalesce(new.buyer_type,'') = '' or new.buyer_type ~ '^CH0[0-9]$' then
    new.buyer_type := v_class;
  end if;

  -- pain and primary offer: only from facts already carried by the row, never invented.
  if coalesce(new.pain_point,'') = '' then
    new.pain_point := nullif(coalesce(md->>'pain_point', md->>'need_summary', md->'research_claims'->>'pain_point'), '');
  end if;
  if coalesce(new.solution_statement,'') = '' then
    new.solution_statement := nullif(coalesce(md->>'primary_offer', md->'research_claims'->>'service_hint',
                                              new.suggested_sku, new.capture_offer_code), '');
  end if;

  -- fulfillment route: keep a real front-door code, otherwise infer from pain + offer.
  if coalesce(new.front_door_code,'') ~ '^CH0[1-5]-F0[1-9]$' then
    v_fd_basis := coalesce(md->'context_contract'->>'front_door_basis', 'EXPLICIT');
  else
    v_fd := private.dd_infer_front_door(v_class, concat_ws(' ', new.pain_point, new.solution_statement));
    if v_fd is not null then
      if coalesce(new.front_door_code,'') <> '' then
        md := md || jsonb_build_object('front_door_code_replaced', new.front_door_code);
      end if;
      new.front_door_code := v_fd;
      v_fd_basis := 'INFERRED_FROM_PAIN_AND_OFFER';
    end if;
  end if;

  if v_class is null then v_gaps := v_gaps || 'BUYER'::text; end if;
  if coalesce(new.pain_point,'') = '' then v_gaps := v_gaps || 'PAIN'::text; end if;
  if coalesce(new.solution_statement,'') = '' then v_gaps := v_gaps || 'PRIMARY_OFFER'::text; end if;
  if coalesce(new.front_door_code,'') !~ '^CH0[1-5]-F0[1-9]$' then v_gaps := v_gaps || 'FULFILLMENT_ROUTE'::text; end if;

  new.sales_metadata := md || jsonb_build_object('context_contract', jsonb_build_object(
    'version', 'v1',
    'complete', cardinality(v_gaps) = 0,
    'gaps', to_jsonb(v_gaps),
    'buyer_class', v_class,
    'front_door_basis', v_fd_basis,
    'basis', coalesce(md->'context_contract'->>'basis', 'ROW_FACTS'),
    'checked_at', now()));

  -- Pain-first gate: a row without buyer, pain, offer and route is never campaign-eligible.
  if cardinality(v_gaps) > 0 and coalesce(new.campaign_eligible, false) then
    new.campaign_eligible := false;
    new.campaign_suppression_reason := 'CONTEXT_INCOMPLETE: ' || array_to_string(v_gaps, ',');
    if new.campaign_status = 'ELIGIBLE' then new.campaign_status := 'SUPPRESSED'; end if;
  end if;

  return new;
end;
$$;
revoke all on function private.dd_normalize_sales_queue_context() from public, anon, authenticated;

create or replace trigger trg_dd_sales_queue_context_contract
  before insert or update on public.dd_sales_queue
  for each row execute function private.dd_normalize_sales_queue_context();

-- 4. Mined opportunities: classify who fulfills before anything can be promoted --------------------------

alter table public.dd_demand_capture_staging
  add column if not exists opportunity_route text not null default 'UNCLASSIFIED',
  add column if not exists company_name text,
  add column if not exists compensation_summary text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'dd_demand_capture_staging_opportunity_route_check') then
    alter table public.dd_demand_capture_staging add constraint dd_demand_capture_staging_opportunity_route_check
      check (opportunity_route in ('UNCLASSIFIED','DANI_AS_VENDOR','DANIELLE_AS_CONTRACTOR','PROVIDER_ROUTED','NOT_DELIVERABLE'));
  end if;
end $$;

comment on column public.dd_demand_capture_staging.opportunity_route is
  'Who would fulfill: DANI_AS_VENDOR (DANI sells and delivers), PROVIDER_ROUTED (DANI sells, a provider delivers), '
  'DANIELLE_AS_CONTRACTOR (a role Danielle would apply for herself; owner decision only), NOT_DELIVERABLE. '
  'Mined signals (jobs, gigs, GitHub, procurement) must be classified before promotion. Never authorizes outreach or applications.';

-- Mined signal types. Inbound customer demand keeps its existing path (it is DANI-as-vendor by definition).
create or replace function private.dd_is_mined_signal(p_signal_type text)
returns boolean language sql immutable set search_path = '' as $$
  select upper(coalesce(p_signal_type,'')) in
    ('JOB_POSTING','CONTRACT_GIG','GITHUB_ISSUE','GITHUB_BOUNTY','PROCUREMENT_NOTICE','MARKETPLACE_REQUEST')
$$;

-- Holds promotion_status away from READY unless the route lets DANI sell the work. Promotion functions only
-- pick up READY rows, so this gate needs no change to them.
create or replace function private.dd_gate_demand_capture_route()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.promotion_status = 'READY' then
    if new.opportunity_route = 'DANIELLE_AS_CONTRACTOR' then
      new.promotion_status := 'OWNER_DECISION';
      new.owner_attention_required := true;
      new.attention_reason := coalesce(new.attention_reason, 'Contractor role for Danielle: apply only on her decision.');
    elsif new.opportunity_route = 'NOT_DELIVERABLE' then
      new.promotion_status := 'NOT_DELIVERABLE';
    elsif new.opportunity_route = 'UNCLASSIFIED' and private.dd_is_mined_signal(new.signal_type) then
      new.promotion_status := 'NEEDS_CLASSIFICATION';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.dd_gate_demand_capture_route() from public, anon, authenticated;

create or replace trigger trg_dd_demand_capture_route_gate
  before insert or update on public.dd_demand_capture_staging
  for each row execute function private.dd_gate_demand_capture_route();

-- Mined rows that do promote land paused and unassessed: promotion never grants outreach.
create or replace function private.dd_pause_mined_sales_rows()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_stage public.dd_demand_capture_staging%rowtype;
begin
  if new.sales_metadata ? 'demand_capture_id' then
    select * into v_stage from public.dd_demand_capture_staging
     where id::text = new.sales_metadata->>'demand_capture_id';
    if found and private.dd_is_mined_signal(v_stage.signal_type) then
      new.campaign_eligible := false;
      new.campaign_status := 'UNASSESSED';
      new.contact_pressure_state := 'PAUSED';
      new.company_name := coalesce(new.company_name, v_stage.company_name);
      new.sales_metadata := new.sales_metadata || jsonb_build_object(
        'opportunity_route', v_stage.opportunity_route,
        'signal_type', v_stage.signal_type,
        'compensation_summary', v_stage.compensation_summary,
        'outreach_authorized', false);
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.dd_pause_mined_sales_rows() from public, anon, authenticated;

-- Runs before the context normalizer (trigger names fire alphabetically).
create or replace trigger trg_dd_sales_queue_a_pause_mined
  before insert on public.dd_sales_queue
  for each row execute function private.dd_pause_mined_sales_rows();
