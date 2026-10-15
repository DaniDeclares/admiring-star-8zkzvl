create or replace function public.dd_calculate_sales_priority_score(
 p_lane text,p_disposition text,p_decision_maker_confirmed boolean,p_next_action_date date,p_suggested_sku text,p_contact_attempts integer,p_do_not_contact boolean
) returns integer
language sql immutable parallel safe
set search_path='public','pg_temp'
as $$
 select case
   when coalesce(p_do_not_contact,false) or coalesce(p_disposition,'')='DO_NOT_CONTACT' then 0
   else greatest(0,
     case coalesce(p_lane,'') when 'INBOUND' then 40 when 'WARM' then 32 when 'REVISIT_CALLABLE' then 22 when 'REVISIT_ROUTING' then 18 when 'PARTNER' then 8 when 'EMAIL_ONLY' then 12 else 5 end
     + case coalesce(p_disposition,'') when 'READY_TO_BUY' then 45 when 'QUOTE_REQUESTED' then 38 when 'INTERESTED' then 30 when 'NEEDS_INFO' then 22 when 'DECISION_MAKER_REACHED' then 18 when 'CALL_BACK_LATER' then 10 when 'NO_ANSWER' then 2 when 'VOICEMAIL' then 2 when 'NOT_INTERESTED' then -30 else 0 end
     + case when coalesce(p_decision_maker_confirmed,false) then 10 else 0 end
     + case when p_next_action_date is not null and p_next_action_date<=current_date then 12 else 0 end
     + case when p_suggested_sku is not null then 5 else 0 end
     - least(coalesce(p_contact_attempts,0),8)
   )::integer
 end
$$;

create or replace view public.dd_sales_engine_v1
with (security_invoker=true) as
select
 q.id,q.contact_name,q.company_name,q.role_title,q.phone,q.email,q.lane,q.source,q.source_confidence,
 q.disposition,q.next_action,q.next_action_date,q.suggested_sku,q.quoted_amount,q.amount_collected,q.job_id,
 q.notes,q.created_at,q.updated_at,q.created_by,q.buyer_type,q.pain_point,q.impact_statement,q.solution_statement,
 q.deliverables,q.investment_position,q.next_step_commitment,q.trigger_type,q.campaign_hypothesis,q.contact_attempts,
 q.last_contacted_at,q.last_contact_channel,q.decision_maker_confirmed,q.objection_code,q.objection_notes,q.do_not_contact,q.sales_metadata,
 public.dd_calculate_sales_priority_score(q.lane,q.disposition,q.decision_maker_confirmed,q.next_action_date,q.suggested_sku,q.contact_attempts,q.do_not_contact) as priority_score,
 case
   when q.do_not_contact or q.disposition='DO_NOT_CONTACT' then 'DO_NOT_CONTACT'
   when upper(coalesce(q.next_action,'')) like '%RELATIONSHIP RECOVERY HOLD%' then 'RECOVERY_HOLD'
   when q.disposition='PAYMENT_SUCCEEDED' then 'FULFILLMENT'
   when q.lane='PARTNER' then 'PARTNERSHIP'
   when q.disposition='READY_TO_BUY' then 'CLOSE'
   when q.disposition='QUOTE_REQUESTED' then 'BUILD_QUOTE'
   when q.disposition in ('INTERESTED','NEEDS_INFO','DECISION_MAKER_REACHED') then 'DISCOVERY'
   when q.next_action_date is not null and q.next_action_date<=current_date then 'FOLLOW_UP_DUE'
   when q.lane in ('INBOUND','WARM') then 'DISCOVERY'
   else 'PROSPECT'
 end as sales_stage,
 case
   when q.do_not_contact or q.disposition='DO_NOT_CONTACT' then 'No outreach'
   when upper(coalesce(q.next_action,'')) like '%RELATIONSHIP RECOVERY HOLD%' then 'Hold routine sales outreach; follow governed relationship-recovery path'
   when q.disposition='PAYMENT_SUCCEEDED' then 'Move to fulfillment/QA; do not request duplicate payment'
   when q.lane='PARTNER' then 'Qualify partnership/referral fit outside the direct-sales queue'
   when q.disposition='READY_TO_BUY' then 'Confirm scope, investment and payment next step'
   when q.disposition='QUOTE_REQUESTED' then 'Build governed quote from canonical service'
   when q.pain_point is null then 'Discover pain and current workaround'
   when q.impact_statement is null then 'Quantify impact, urgency and consequence'
   when q.solution_statement is null then 'Map DANI solution to the stated pain'
   when q.deliverables is null then 'Confirm concrete deliverables and completion criteria'
   when q.investment_position is null then 'Present governed investment transparently'
   when q.next_step_commitment is null then 'Secure a dated next step'
   else 'Execute next committed action'
 end as recommended_action,
 case
   when extract(isodow from now() at time zone 'America/New_York') in (2,3) and extract(hour from now() at time zone 'America/New_York') between 9 and 11 then 'EMPIRICAL_CALL_WINDOW'
   when extract(isodow from now() at time zone 'America/New_York') in (3,4) and extract(hour from now() at time zone 'America/New_York') in (11,16) then 'EMPIRICAL_CALL_WINDOW'
   else 'STANDARD_OUTREACH'
 end as timing_signal,
 q.front_door_code,q.front_door_notes,q.source_account,q.source_message_id,q.source_thread_id,q.source_occurred_at,
 q.source_direction,q.campaign_eligible,q.campaign_status,q.campaign_suppression_reason,q.campaign_name,
 q.campaign_last_contacted_at,q.intent_score,q.intent_tier,q.capture_offer_code,q.capture_page,
 q.preferred_contact_channel,q.consent_email,q.consent_sms,q.consent_phone,q.consent_marketing,q.consent_captured_at,
 q.next_permitted_contact_at,q.contact_pressure_state,q.salesperson_user_id,q.salesperson_name,q.lead_origin_class,q.commission_policy_code
from public.dd_sales_queue q;

create or replace view public.dd_sales_scoring_collisions_v1
with (security_invoker=true) as
with base as (
 select e.id,e.contact_name,e.company_name,e.email,e.phone,e.lane,e.source,e.disposition,e.priority_score,e.updated_at,
        nullif(lower(trim(e.email)),'') as norm_email,
        nullif(regexp_replace(coalesce(e.phone,''),'[^0-9]','','g'),'') as norm_phone,
        nullif(lower(regexp_replace(coalesce(e.company_name,''),'[^a-z0-9]','','g')),'') as norm_company
 from public.dd_sales_engine_v1 e
 where coalesce(e.do_not_contact,false)=false
), pairs as (
 select a.id as left_id,b.id as right_id,
        a.company_name as left_company,b.company_name as right_company,
        a.contact_name as left_contact,b.contact_name as right_contact,
        a.priority_score as left_score,b.priority_score as right_score,
        case
          when a.norm_email is not null and a.norm_email=b.norm_email then 'EXACT_EMAIL'
          when a.norm_phone is not null and length(a.norm_phone)>=7 and a.norm_phone=b.norm_phone then 'EXACT_PHONE'
          when a.norm_company is not null and a.norm_company=b.norm_company and coalesce(a.lane,'')=coalesce(b.lane,'') then 'SAME_COMPANY_LANE'
        end as collision_reason
 from base a join base b on a.id<b.id
 where (a.norm_email is not null and a.norm_email=b.norm_email)
    or (a.norm_phone is not null and length(a.norm_phone)>=7 and a.norm_phone=b.norm_phone)
    or (a.norm_company is not null and a.norm_company=b.norm_company and coalesce(a.lane,'')=coalesce(b.lane,''))
), scored as (
 select *,abs(coalesce(left_score,0)-coalesce(right_score,0)) as score_delta from pairs
)
select *,case when collision_reason in ('EXACT_EMAIL','EXACT_PHONE') then 'RECONCILE_BEFORE_PROMOTION'
      when score_delta>=20 then 'REVIEW_SCORE_CONFLICT'
      else 'REVIEW_IDENTITY_COLLISION' end as resolution
from scored;

grant execute on function public.dd_calculate_sales_priority_score(text,text,boolean,date,text,integer,boolean) to service_role;
grant select on public.dd_sales_engine_v1,public.dd_sales_scoring_collisions_v1 to authenticated,service_role;
