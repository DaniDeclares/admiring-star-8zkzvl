alter table public.dd_sales_queue
 add column if not exists buyer_type text,
 add column if not exists pain_point text,
 add column if not exists impact_statement text,
 add column if not exists solution_statement text,
 add column if not exists deliverables text,
 add column if not exists investment_position text,
 add column if not exists next_step_commitment text,
 add column if not exists trigger_type text,
 add column if not exists campaign_hypothesis text,
 add column if not exists contact_attempts integer not null default 0,
 add column if not exists last_contacted_at timestamptz,
 add column if not exists last_contact_channel text,
 add column if not exists decision_maker_confirmed boolean not null default false,
 add column if not exists objection_code text,
 add column if not exists objection_notes text,
 add column if not exists do_not_contact boolean not null default false,
 add column if not exists sales_metadata jsonb not null default '{}'::jsonb;

create or replace view public.dd_sales_engine_v1
with (security_invoker=true) as
select q.*,
 greatest(0,
   case q.lane when 'INBOUND' then 40 when 'WARM' then 32 when 'REVISIT_CALLABLE' then 22 when 'REVISIT_ROUTING' then 18 when 'PARTNER' then 16 when 'EMAIL_ONLY' then 12 else 5 end
   + case q.disposition when 'READY_TO_BUY' then 45 when 'QUOTE_REQUESTED' then 38 when 'INTERESTED' then 30 when 'NEEDS_INFO' then 22 when 'DECISION_MAKER_REACHED' then 18 when 'CALL_BACK_LATER' then 10 when 'NO_ANSWER' then 2 when 'VOICEMAIL' then 2 when 'NOT_INTERESTED' then -30 when 'DO_NOT_CONTACT' then -100 else 0 end
   + case when q.decision_maker_confirmed then 10 else 0 end
   + case when q.next_action_date is not null and q.next_action_date<=current_date then 12 else 0 end
   + case when q.suggested_sku is not null then 5 else 0 end
   - least(q.contact_attempts,8)
 )::integer as priority_score,
 case
   when q.do_not_contact or q.disposition='DO_NOT_CONTACT' then 'DO_NOT_CONTACT'
   when q.disposition='READY_TO_BUY' then 'CLOSE'
   when q.disposition='QUOTE_REQUESTED' then 'BUILD_QUOTE'
   when q.disposition in ('INTERESTED','NEEDS_INFO','DECISION_MAKER_REACHED') then 'DISCOVERY'
   when q.next_action_date is not null and q.next_action_date<=current_date then 'FOLLOW_UP_DUE'
   when q.lane in ('INBOUND','WARM') then 'DISCOVERY'
   else 'PROSPECT'
 end as sales_stage,
 case
   when q.do_not_contact or q.disposition='DO_NOT_CONTACT' then 'No outreach'
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
 end as timing_signal
from public.dd_sales_queue q;

grant select on public.dd_sales_engine_v1 to authenticated,service_role;
comment on view public.dd_sales_engine_v1 is 'DANI sales prioritization. WWA-derived conversation structure: Pain -> Impact -> Solution -> Deliverables -> Investment -> Next Step. Timing signals are hypotheses/benchmarks, never guarantees; DANI conversion history should supersede external benchmarks.';
