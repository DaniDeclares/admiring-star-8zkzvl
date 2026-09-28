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
 -- Reconcile historical SLA attention against current authoritative sales state.
 -- This only supersedes alerts that are now provably non-sales/suppressed; it never sends outreach.
 update dd_owner_attention_queue a
 set status='SUPERSEDED',resolved_at=coalesce(a.resolved_at,now()),
     recommended_action='Superseded by current governed sales classification; retain history only.'
 from dd_sales_queue s
 where a.status='OPEN' and a.domain='SALES' and a.reason='Speed-to-lead SLA exceeded'
   and a.source_record_id=s.id::text
   and (
     coalesce(s.do_not_contact,false)=true or s.disposition='DO_NOT_CONTACT'
     or lower(coalesce(s.contact_name,'')) like '%test%'
     or coalesce(s.lane,'')='PARTNER'
     or upper(coalesce(s.next_action,'')) like '%RELATIONSHIP RECOVERY HOLD%'
     or coalesce(s.source,'') in ('GMAIL_SENT','WEB_SOURCED','LINKEDIN_MESSAGE','LINKEDIN_MARKETPLACE','LINKEDIN_INVITE','HUBSPOT_DEAL')
     or lower(coalesce(s.sales_metadata->>'relationship_type','')) like '%partnership%'
     or lower(coalesce(s.sales_metadata->>'relationship_type','')) like '%coaching%'
     or lower(coalesce(s.buyer_type,'')) like 'government%'
     or lower(coalesce(s.sales_metadata->>'relationship_type',''))='unknown_inbound_caller'
   );

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
   and lower(coalesce(s.sales_metadata->>'relationship_type','')) not like '%partnership%'
   and lower(coalesce(s.sales_metadata->>'relationship_type','')) not like '%coaching%'
   and lower(coalesce(s.buyer_type,'')) not like 'government%'
   and lower(coalesce(s.sales_metadata->>'relationship_type','')) <> 'unknown_inbound_caller'
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


-- Account-level worklist: one actionable primary row per company/account, while preserving every contact in dd_sales_queue.
-- Individual/no-company leads remain independent opportunities.
create or replace view public.dd_sales_account_worklist_v1
with (security_invoker=true) as
with ranked as (
 select e.*,
   coalesce(nullif(lower(trim(e.company_name)),''),'__individual__:'||e.id::text) as account_key,
   row_number() over (
     partition by coalesce(nullif(lower(trim(e.company_name)),''),'__individual__:'||e.id::text)
     order by
       case when e.sales_stage in ('DO_NOT_CONTACT','RECOVERY_HOLD','FULFILLMENT','PARTNERSHIP') then 1 else 0 end,
       e.decision_maker_confirmed desc,
       e.priority_score desc,
       case e.source_confidence when 'VERIFIED' then 0 when 'SINGLE_SOURCE' then 1 else 2 end,
       e.updated_at desc,
       e.id
   ) as account_rank,
   count(*) over (
     partition by coalesce(nullif(lower(trim(e.company_name)),''),'__individual__:'||e.id::text)
   ) as account_contact_count
 from public.dd_sales_engine_v1 e
)
select *
from ranked
where account_rank=1;

grant select on public.dd_sales_account_worklist_v1 to authenticated,service_role;
comment on view public.dd_sales_account_worklist_v1 is 'One primary actionable sales row per company/account. Preserves alternate contacts in dd_sales_queue while preventing duplicate-company inflation and multi-contact pressure.';


-- Closeability layer: deterministic bridge from discovery to a governed money path.
-- Fail closed: never infer a SKU or price from vague notes.
create or replace view public.dd_sales_closeability_v1
with (security_invoker=true) as
select
 e.id as sales_queue_id,
 e.contact_name,e.company_name,e.priority_score,e.sales_stage,
 e.pain_point,e.impact_statement,e.solution_statement,e.deliverables,
 e.investment_position,e.next_step_commitment,e.suggested_sku,
 coalesce(cr.production_sellable,false) as sku_production_sellable,
 cr.release_state as sku_release_state,
 (p.canonical_sku is not null and p.verified_at is not null) as verified_initial_payment_contract,
 case
   when e.sales_stage in ('DO_NOT_CONTACT','RECOVERY_HOLD','FULFILLMENT','PARTNERSHIP') then false
   when e.pain_point is null or e.impact_statement is null then false
   when e.suggested_sku is null then false
   when coalesce(cr.production_sellable,false)=false or coalesce(cr.release_state,'')<>'LIVE_READY' then false
   when p.canonical_sku is null or p.verified_at is null then false
   else true
 end as money_path_ready,
 case
   when e.sales_stage='DO_NOT_CONTACT' then 'NO_OUTREACH'
   when e.sales_stage='RECOVERY_HOLD' then 'RELATIONSHIP_RECOVERY'
   when e.sales_stage='FULFILLMENT' then 'FULFILLMENT'
   when e.sales_stage='PARTNERSHIP' then 'PARTNERSHIP_ROUTING'
   when e.pain_point is null then 'CAPTURE_PAIN'
   when e.impact_statement is null then 'CAPTURE_IMPACT'
   when e.suggested_sku is null then 'MATCH_CANONICAL_SERVICE'
   when coalesce(cr.production_sellable,false)=false or coalesce(cr.release_state,'')<>'LIVE_READY' then 'SERVICE_NOT_RELEASED'
   when p.canonical_sku is null or p.verified_at is null then 'PAYMENT_CONTRACT_NOT_VERIFIED'
   when e.deliverables is null then 'CONFIRM_DELIVERABLES'
   when e.investment_position is null then 'PRESENT_GOVERNED_INVESTMENT'
   when e.next_step_commitment is null then 'SECURE_NEXT_STEP'
   else 'READY_FOR_GOVERNED_CLOSE'
 end as closeability_next_action,
 (p.initial_amount_cents/100.0)::numeric(12,2) as verified_initial_amount,
 p.initial_payment_percent,
 p.currency,
 p.verified_at as payment_contract_verified_at
from public.dd_sales_engine_v1 e
left join public.dd_service_canonical_readiness_v1 cr on cr.canonical_sku=e.suggested_sku
left join public.dd_service_initial_payment_links p on p.canonical_sku=e.suggested_sku;

grant select on public.dd_sales_closeability_v1 to authenticated,service_role;
comment on view public.dd_sales_closeability_v1 is 'Fail-closed discovery-to-money transition. A lead is money_path_ready only with captured need, an explicit canonical SKU, LIVE_READY Production sellability, and a verified initial-payment contract. Does not infer SKU or pricing.';


-- End-to-end commercial transition health: detect leaks without mutating lifecycle state.
create or replace view public.dd_commercial_transition_health_v1
with (security_invoker=true) as
select
 s.id as sales_queue_id,s.contact_name,s.company_name,s.disposition,
 s.amount_collected,s.job_id,
 j.service_request_id,j.work_order_id,j.job_status,
 w.status as work_order_status,w.qa_status,
 case
   when coalesce(s.amount_collected,0)>0 and s.job_id is null then 'RED_PAID_WITHOUT_JOB'
   when s.job_id is not null and j.id is null then 'RED_BROKEN_JOB_LINK'
   when j.id is not null and j.service_request_id is null then 'RED_JOB_WITHOUT_REQUEST'
   when j.id is not null and j.work_order_id is null then 'RED_JOB_WITHOUT_WORK_ORDER'
   when j.work_order_id is not null and w.id is null then 'RED_BROKEN_WORK_ORDER_LINK'
   when j.job_status in ('COMPLETED','CLOSED') and coalesce(w.qa_status,'NOT_STARTED')='NOT_STARTED' then 'RED_COMPLETED_WITHOUT_QA'
   when coalesce(s.amount_collected,0)>0 and j.id is not null and w.id is not null then 'GREEN_MONEY_TO_FULFILLMENT_LINKED'
   else 'YELLOW_IN_PROGRESS'
 end as transition_health,
 case
   when coalesce(s.amount_collected,0)>0 and s.job_id is null then 'CREATE_OR_LINK_JOB_THROUGH_GOVERNED_RAIL'
   when s.job_id is not null and j.id is null then 'REPAIR_BROKEN_JOB_REFERENCE'
   when j.id is not null and j.service_request_id is null then 'RECONCILE_SERVICE_REQUEST'
   when j.id is not null and j.work_order_id is null then 'CREATE_OR_LINK_WORK_ORDER_THROUGH_GOVERNED_RAIL'
   when j.work_order_id is not null and w.id is null then 'REPAIR_BROKEN_WORK_ORDER_REFERENCE'
   when j.job_status in ('COMPLETED','CLOSED') and coalesce(w.qa_status,'NOT_STARTED')='NOT_STARTED' then 'START_QA_BEFORE_PAYABLE'
   else 'CONTINUE_GOVERNED_LIFECYCLE'
 end as next_transition_action
from public.dd_sales_queue s
left join public.dd_jobs j on j.id=s.job_id
left join public.dd_work_orders w on w.id=j.work_order_id
where coalesce(s.amount_collected,0)>0 or s.job_id is not null;

grant select on public.dd_commercial_transition_health_v1 to authenticated,service_role;
comment on view public.dd_commercial_transition_health_v1 is 'Read-only end-to-end guard from collected sales through job/work-order/QA. Detects lifecycle leaks without fabricating estimates, QA completion, payables, or payments.';


-- QA -> payable -> AP -> payout consistency. Read-only and fail-closed around money movement.
create or replace view public.dd_fulfillment_finance_health_v1
with (security_invoker=true) as
select
 j.id as job_id,j.public_reference,j.job_status,j.work_order_id,
 w.status as work_order_status,w.qa_status,
 pp.id as provider_payable_id,pp.status as provider_payable_status,pp.total_amount as provider_payable_amount,
 ap.id as ap_ledger_id,ap.total_final_payable,ap.is_cleared_for_payout,ap.settled_at,
 pol.clearance_mode,pol.owner_approved as payout_policy_owner_approved,
 pol.external_payout_authorized,
 case
   when lower(coalesce(j.job_status,'')) in ('cancelled','canceled') then 'GREEN_CANCELLED_NO_PAYOUT_EXPECTED'
   when lower(coalesce(j.job_status,'')) in ('completed','closed') and coalesce(w.qa_status,'NOT_STARTED')='NOT_STARTED'
        and pp.id is not null and pp.status in ('APPROVED','PAID') then 'RED_PAYABLE_AHEAD_OF_QA'
   when pp.id is not null and pp.status in ('APPROVED','PAID') and ap.id is null then 'RED_APPROVED_PAYABLE_WITHOUT_AP_ACCRUAL'
   when pp.status='PAID' and (ap.settled_at is null) then 'RED_PAID_WITHOUT_LEDGER_SETTLEMENT'
   when coalesce(ap.is_cleared_for_payout,false)=true
        and not (coalesce(pol.owner_approved,false) and coalesce(pol.external_payout_authorized,false)) then 'RED_CLEARANCE_CONFLICT'
   when lower(coalesce(j.job_status,'')) in ('completed','closed') and coalesce(w.qa_status,'NOT_STARTED')<>'NOT_STARTED'
        and pp.id is not null and ap.id is not null then 'GREEN_QA_TO_AP_LINKED'
   else 'YELLOW_IN_PROGRESS_OR_HELD'
 end as finance_transition_health,
 case
   when lower(coalesce(j.job_status,'')) in ('completed','closed') and coalesce(w.qa_status,'NOT_STARTED')='NOT_STARTED'
        and pp.id is not null and pp.status in ('APPROVED','PAID') then 'RECONCILE_QA_BEFORE_PAYOUT'
   when pp.id is not null and pp.status in ('APPROVED','PAID') and ap.id is null then 'ACCRUE_AP_THROUGH_GOVERNED_ACCOUNTING_RAIL'
   when pp.status='PAID' and ap.settled_at is null then 'RECONCILE_SETTLEMENT_EVIDENCE'
   when coalesce(ap.is_cleared_for_payout,false)=true
        and not (coalesce(pol.owner_approved,false) and coalesce(pol.external_payout_authorized,false)) then 'HOLD_PAYOUT_AND_RECONCILE_CLEARANCE'
   else 'CONTINUE_OR_HOLD_PER_POLICY'
 end as next_finance_action
from public.dd_jobs j
left join public.dd_work_orders w on w.id=j.work_order_id
left join public.dd_provider_payables pp on pp.job_id=j.id
left join public.dd_accounts_payable_ledger ap on ap.work_order_id=j.work_order_id
left join public.dd_provider_payout_clearance_policy pol on pol.policy_key='DEFAULT';

grant select on public.dd_fulfillment_finance_health_v1 to authenticated,service_role;
comment on view public.dd_fulfillment_finance_health_v1 is 'Read-only QA/payable/AP/payout consistency guard. Never authorizes or executes payout; payout policy remains authoritative and fail-closed.';
