-- Sales qualification guardrails: prevent non-sales records from competing with money-now opportunities.
-- Protected release: no external communication, pricing, payment, or provider authorization side effects.

create or replace view public.dd_sales_engine_v1
with (security_invoker=true) as
select q.*,
 case
   when q.do_not_contact or q.disposition='DO_NOT_CONTACT'
     or upper(coalesce(q.next_action,'')) like '%RELATIONSHIP RECOVERY HOLD%'
     or q.disposition='PAYMENT_SUCCEEDED'
   then 0
   else greatest(0,
     case q.lane when 'INBOUND' then 40 when 'WARM' then 32 when 'REVISIT_CALLABLE' then 22 when 'REVISIT_ROUTING' then 18 when 'PARTNER' then 8 when 'EMAIL_ONLY' then 12 else 5 end
     + case q.disposition when 'READY_TO_BUY' then 45 when 'QUOTE_REQUESTED' then 38 when 'INTERESTED' then 30 when 'NEEDS_INFO' then 22 when 'DECISION_MAKER_REACHED' then 18 when 'CALL_BACK_LATER' then 10 when 'NO_ANSWER' then 2 when 'VOICEMAIL' then 2 when 'NOT_INTERESTED' then -30 else 0 end
     + case when q.decision_maker_confirmed then 10 else 0 end
     + case when q.next_action_date is not null and q.next_action_date<=current_date then 12 else 0 end
     + case when q.suggested_sku is not null then 5 else 0 end
     - least(q.contact_attempts,8)
   )::integer
 end as priority_score,
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
 end as timing_signal
from public.dd_sales_queue q;

grant select on public.dd_sales_engine_v1 to authenticated,service_role;
comment on view public.dd_sales_engine_v1 is 'DANI sales prioritization. Non-sales lifecycle states are suppressed from money-now priority. WWA structure: Pain -> Impact -> Solution -> Deliverables -> Investment -> Next Step.';

create or replace function public.dd_run_safe_automation_recipes()
returns uuid language plpgsql security definer set search_path='public' as $$
declare r uuid:=gen_random_uuid(); n int:=0; t int:=0;
begin
 insert into dd_owner_attention_queue(domain,source_table,source_record_id,reason,priority,recommended_action,metadata)
 select 'SALES','dd_sales_queue',s.id::text,'Speed-to-lead SLA exceeded','P1','Review and respond through Sales.',
   jsonb_build_object('source',s.source,'age_minutes',round(extract(epoch from(now()-coalesce(s.source_occurred_at,s.created_at)))/60))
 from dd_sales_queue s
 where coalesce(s.do_not_contact,false)=false
   and s.disposition='NOT_CONTACTED'
   and (s.phone is not null or s.email is not null)
   and coalesce(s.source_occurred_at,s.created_at)<now()-interval '30 minutes'
   and upper(coalesce(s.next_action,'')) not like '%RELATIONSHIP RECOVERY HOLD%'
   and coalesce(s.lane,'') not in ('PARTNER')
   and coalesce(s.source,'') not in ('GMAIL_SENT','WEB_SOURCED','LINKEDIN_MESSAGE','LINKEDIN_MARKETPLACE','LINKEDIN_INVITE','HUBSPOT_DEAL')
   and lower(coalesce(s.contact_name,'')) not like '%test%'
 on conflict do nothing;
 get diagnostics n=row_count; t:=t+n;

 insert into dd_owner_attention_queue(domain,source_table,source_record_id,reason,priority,recommended_action,metadata)
 select 'OPERATIONS','dd_jobs',j.id::text,'Job SLA deadline exceeded','P0','Review assignment/status and recover the job.',
   jsonb_build_object('job_status',j.job_status,'sla_due_at',j.sla_due_at)
 from dd_jobs j where j.sla_due_at is not null and j.sla_due_at<now() and coalesce(j.job_status,'') not in('COMPLETED','CANCELLED','CLOSED')
 on conflict do nothing;
 get diagnostics n=row_count; t:=t+n;

 insert into dd_owner_attention_queue(domain,source_table,source_record_id,reason,priority,recommended_action,metadata)
 select 'QA','dd_jobs',j.id::text,'Completed job has no job evidence','P0','Collect/verify required evidence before closeout.',
   jsonb_build_object('job_status',j.job_status)
 from dd_jobs j where j.job_status in('COMPLETED','CLOSED') and not exists(select 1 from dd_job_evidence e where e.job_id=j.id)
 on conflict do nothing;
 get diagnostics n=row_count; t:=t+n;

 insert into dd_automation_recipe_runs(id,recipe_key,status,matched_count,actioned_count,evidence,completed_at)
 values(r,'safe_automation_sweep','COMPLETED',t,t,jsonb_build_object('mode','detect_and_queue','external_side_effects',false,'sales_sla_guardrails',true),now());
 update dd_automation_recipes set last_run_at=now() where is_active;
 return r;
end$$;
