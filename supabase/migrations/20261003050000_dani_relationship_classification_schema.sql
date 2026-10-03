-- DANI relationship classification schema v1
-- Owner ask 2026-10-02: codify the classification model used for researched
-- contacts (e.g. LinkedIn feed) so it is durable, consistent, and does not
-- collapse into HubSpot stage or generic "lead".
--
-- Principles:
--   * Classification describes the *relationship and intent*, not sales stage.
--   * Stage changes only when an actual sales event occurs.
--   * Extends #525 (relationship identity) and #527 (context contract);
--     does not replace them.
--   * Nothing here authorizes outreach or changes campaign_eligible by itself.
--
-- Example mappings from research:
--   Larry Watkins (HAI)  → direct_buyer_candidate, commercial_strategic, in_market, CH03, research_before_outreach
--   Brad Strawbridge     → strategic_partner, contractor_ecosystem, in_market, CH05/partner, relationship_first
--   Jacob Garrett        → referral_source, real_estate_finance, out_of_market, CH04, nurture

-- 1. Allowed values (check constraints via domain-like text + comments) -------------

-- relationship_role: what kind of relationship this is for DANI
--   direct_buyer_candidate  – could buy DANI services
--   strategic_partner       – ecosystem / referral / overflow / co-delivery
--   referral_source         – sends work or introductions, not a buyer
--   competitive_intel       – architecture / market learning only
--   network                 – general professional network
--   existing_customer       – already has a commercial relationship
--   existing_partner        – already in dd_partners
--   do_not_contact          – explicit suppression

-- engagement_posture: how DANI should approach them
--   research_before_outreach – deliberate research, then possible outreach
--   relationship_first       – conversation / value first, sales second
--   nurture                  – long-term, low-pressure
--   active_account_research  – strategic account, multi-thread research
--   owner_decision           – requires human decision before any action
--   no_outreach              – classification only; do not contact

-- market_fit
--   in_market     – Metro Atlanta / primary service geography
--   adjacent      – nearby or occasional overlap
--   out_of_market – outside primary geography for immediate revenue

-- 2. Columns on dd_sales_queue (additive, nullable) --------------------------------

alter table public.dd_sales_queue
  add column if not exists relationship_role text,
  add column if not exists engagement_posture text,
  add column if not exists market_fit text,
  add column if not exists classification_evidence jsonb not null default '{}'::jsonb,
  add column if not exists classified_at timestamptz,
  add column if not exists classified_by text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'dd_sales_queue_relationship_role_check') then
    alter table public.dd_sales_queue add constraint dd_sales_queue_relationship_role_check
      check (relationship_role is null or relationship_role in (
        'direct_buyer_candidate',
        'strategic_partner',
        'referral_source',
        'competitive_intel',
        'network',
        'existing_customer',
        'existing_partner',
        'do_not_contact'
      ));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'dd_sales_queue_engagement_posture_check') then
    alter table public.dd_sales_queue add constraint dd_sales_queue_engagement_posture_check
      check (engagement_posture is null or engagement_posture in (
        'research_before_outreach',
        'relationship_first',
        'nurture',
        'active_account_research',
        'owner_decision',
        'no_outreach'
      ));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'dd_sales_queue_market_fit_check') then
    alter table public.dd_sales_queue add constraint dd_sales_queue_market_fit_check
      check (market_fit is null or market_fit in (
        'in_market',
        'adjacent',
        'out_of_market'
      ));
  end if;
end $$;

comment on column public.dd_sales_queue.relationship_role is
  'DANI relationship classification: what kind of relationship this is. Independent of HubSpot stage. See migration 20261003050000.';
comment on column public.dd_sales_queue.engagement_posture is
  'How DANI should approach this relationship (research_before_outreach, relationship_first, nurture, etc.). Does not authorize outreach.';
comment on column public.dd_sales_queue.market_fit is
  'in_market | adjacent | out_of_market relative to DANI primary geography (Metro Atlanta).';
comment on column public.dd_sales_queue.classification_evidence is
  'Structured evidence for the classification (projects, geography, public signals, source URLs).';
comment on column public.dd_sales_queue.classified_at is
  'When the current classification was set.';
comment on column public.dd_sales_queue.classified_by is
  'Who/what set the classification (agent name, human, or system).';

-- 3. Helper to apply classification (service_role / staff only) ---------------------

create or replace function public.dd_classify_sales_relationship(
  p_sales_queue_id uuid,
  p_relationship_role text,
  p_engagement_posture text,
  p_market_fit text,
  p_primary_channel text default null,
  p_evidence jsonb default '{}'::jsonb,
  p_classified_by text default 'system'
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_row public.dd_sales_queue%rowtype;
  v_md jsonb;
begin
  if p_sales_queue_id is null then
    raise exception 'p_sales_queue_id is required';
  end if;

  select * into v_row from public.dd_sales_queue where id = p_sales_queue_id for update;
  if not found then
    raise exception 'sales_queue row not found: %', p_sales_queue_id;
  end if;

  v_md := coalesce(v_row.sales_metadata, '{}'::jsonb)
    || jsonb_build_object(
         'classification', jsonb_build_object(
           'relationship_role', p_relationship_role,
           'engagement_posture', p_engagement_posture,
           'market_fit', p_market_fit,
           'primary_channel', p_primary_channel,
           'evidence', coalesce(p_evidence, '{}'::jsonb),
           'classified_at', now(),
           'classified_by', p_classified_by
         )
       );

  update public.dd_sales_queue set
    relationship_role = p_relationship_role,
    engagement_posture = p_engagement_posture,
    market_fit = p_market_fit,
    classification_evidence = coalesce(p_evidence, '{}'::jsonb),
    classified_at = now(),
    classified_by = p_classified_by,
    buyer_type = coalesce(nullif(buyer_type,''), p_primary_channel, buyer_type),
    sales_metadata = v_md,
    updated_at = now()
  where id = p_sales_queue_id;

  return jsonb_build_object(
    'sales_queue_id', p_sales_queue_id,
    'relationship_role', p_relationship_role,
    'engagement_posture', p_engagement_posture,
    'market_fit', p_market_fit,
    'primary_channel', p_primary_channel,
    'classified_at', now()
  );
end;
$$;

revoke all on function public.dd_classify_sales_relationship(uuid, text, text, text, text, jsonb, text) from public, anon;
grant execute on function public.dd_classify_sales_relationship(uuid, text, text, text, text, jsonb, text) to authenticated, service_role;

comment on function public.dd_classify_sales_relationship(uuid, text, text, text, text, jsonb, text) is
  'Apply DANI relationship classification to a sales-queue row. Does not change HubSpot stage and does not authorize outreach. Classification is independent of campaign_eligible.';

-- 4. View for operators / Brain ----------------------------------------------------

create or replace view public.dd_sales_relationship_classification_v1
with (security_invoker = true) as
select
  q.id as sales_queue_id,
  q.contact_name,
  q.company_name,
  q.email,
  q.lane,
  q.disposition,
  q.buyer_type,
  q.relationship_role,
  q.engagement_posture,
  q.market_fit,
  q.classification_evidence,
  q.classified_at,
  q.classified_by,
  q.campaign_eligible,
  q.campaign_status,
  q.campaign_suppression_reason,
  q.sales_metadata->'classification' as classification_blob,
  q.created_at,
  q.updated_at
from public.dd_sales_queue q;

revoke all on public.dd_sales_relationship_classification_v1 from public, anon;
grant select on public.dd_sales_relationship_classification_v1 to authenticated, service_role;

comment on view public.dd_sales_relationship_classification_v1 is
  'Operator/Brain view of DANI relationship classifications. Classification does not equal sales stage.';
