-- Operation $1M: partner/vendor-network records are not buyer inventory.
-- Preserve partner relationships in the sales table while excluding them from buyer matching and revenue funnel counts.
CREATE OR REPLACE FUNCTION public.dd_match_existing_buyers_to_governed_offers(p_limit integer DEFAULT 100)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
declare v_matched int:=0; v_repair int:=0;
begin
with candidates as (
 select s.id,case
  when s.id='608eb889-c88f-41ec-88ed-ff8158b84eb8'::uuid then 'DNI-04A-019'
  when coalesce(s.sales_metadata->>'channel_code','')='CH02'
       and (
         s.front_door_code='CH02-F01'
         or coalesce(s.solution_statement,'') ~* '(turnover|turn reset|turn support|make-ready|make ready|unit turn)'
         or coalesce(s.next_action,'') ~* '(turnover|turn as a trial|turn pressure|turns are open|first assignment)'
       )
       then 'DNI-02A-009'
  when coalesce(s.sales_metadata->>'channel_code','')='CH02'
       and (
         s.front_door_code='CH02-F03'
         or coalesce(s.solution_statement,'') ~* '(condition documentation|inspection|asset verification)'
         or coalesce(s.next_action,'') ~* '(condition-documentation|condition documentation|inspection)'
       )
       then 'DNI-02A-003'
  else null end sku
 from public.dd_sales_queue s
 where coalesce(s.do_not_contact,false)=false
   and coalesce(s.lane,'')<>'PARTNER'
   and coalesce(s.sales_metadata #>> '{channel_tag_20261006,status}','') not in ('PARTNER_NOT_BUYER','TEST_RECORD')
   and s.suggested_sku is null
   and s.disposition not in ('NOT_INTERESTED','PAYMENT_SUCCEEDED','NEEDS_INFO','CLOSED_LOST')
   and coalesce(s.sales_metadata->>'routine_outreach_suppressed','false') <> 'true'
   and (
     coalesce(s.decision_maker_confirmed,false)=true
     or upper(coalesce(s.source_direction,''))='INBOUND'
     or upper(coalesce(s.source_confidence,''))='VERIFIED'
   )
 order by case when s.source_confidence='VERIFIED' then 0 else 1 end,
          coalesce(s.intent_score,0) desc,s.updated_at desc
 limit greatest(1,least(coalesce(p_limit,100),500))
), valid as (
 select c.id,c.sku,r.blocking_gate,r.release_state
 from candidates c
 join public.dd_service_release_contract_v1 r on r.canonical_sku=c.sku
 where c.sku is not null
   and r.channel_authorization_ok
   and r.fulfillment_matrix_ok
   and r.unresolved_rule_count=0
)
update public.dd_sales_queue s
set suggested_sku=v.sku,
    sales_metadata=coalesce(s.sales_metadata,'{}'::jsonb)
      || jsonb_build_object(
        'autonomous_offer_match',
        jsonb_build_object(
          'sku',v.sku,
          'matched_at',now(),
          'basis','EXPLICIT_BUYER_EVIDENCE_PLUS_GOVERNED_RELEASE_CONTRACT',
          'release_state',v.release_state,
          'blocking_gate',v.blocking_gate,
          'quote_eligible',v.release_state='LIVE_READY',
          'matcher_version','2026-10-06-explicit-intent-only'
        )
      ),
    next_action=case
      when v.release_state='LIVE_READY' then 'Advance the explicitly matched execution need through governed quote flow.'
      else 'Repair governed service release gate before quote: '||coalesce(v.blocking_gate,'UNKNOWN')
    end,
    updated_at=now()
from valid v
where s.id=v.id;
get diagnostics v_matched=row_count;

insert into public.dd_owner_attention_queue(domain,source_table,source_record_id,reason,priority,recommended_action,metadata)
select
  'REVENUE','dd_service_release_contract_v1',r.canonical_sku,
  'Matched buyer demand exists but the governed offer is held by a release gate.',
  'P1',
  'Repair the existing '||coalesce(r.blocking_gate,'UNKNOWN')||' gate for '||coalesce(r.service_name,r.canonical_sku)||' - do not create a duplicate service.',
  jsonb_build_object(
    'canonical_sku',r.canonical_sku,
    'service_name',r.service_name,
    'blocking_gate',r.blocking_gate,
    'release_state',r.release_state,
    'revenue_first',true,
    'external_contact_authorized',false
  )
from public.dd_service_release_contract_v1 r
where exists(
  select 1 from public.dd_sales_queue s
  where s.suggested_sku=r.canonical_sku
    and coalesce(s.do_not_contact,false)=false
    and coalesce(s.lane,'')<>'PARTNER'
    and coalesce(s.sales_metadata #>> '{channel_tag_20261006,status}','') not in ('PARTNER_NOT_BUYER','TEST_RECORD')
)
and r.release_state<>'LIVE_READY'
and not exists(
  select 1 from public.dd_owner_attention_queue a
  where a.source_table='dd_service_release_contract_v1'
    and a.source_record_id=r.canonical_sku
    and a.status='OPEN'
);
get diagnostics v_repair=row_count;

return jsonb_build_object(
  'matched_buyers',v_matched,
  'release_gate_repairs_queued',v_repair,
  'pricing_invented',false,
  'buyer_intent_invented',false,
  'external_contact',false,
  'generic_ch02_cleaning_default',false
);
end
$function$
;

CREATE OR REPLACE FUNCTION public.dd_run_revenue_first_autonomy()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'private', 'pg_catalog'
AS $function$
declare v_id uuid:=gen_random_uuid(); v_buyers int:=0; v_verified int:=0; v_matched int:=0; v_quotes int:=0; v_followups int:=0; v_paid int:=0; v_jobs int:=0; v_recurring int:=0; v_before int:=0; v_after int:=0; v_progress int:=0; v_research boolean:=false; v_revenue jsonb; v_demand jsonb; v_intel jsonb; v_match jsonb;
begin
 insert into public.dd_revenue_autonomy_runs(id) values(v_id);
 v_demand:=private.dd_run_demand_radar(); v_intel:=public.dd_run_commercial_intelligence_cycle();
 v_match:=public.dd_match_existing_buyers_to_governed_offers(50);
 select count(*) into v_before from public.dd_estimates where source_slug='sales_queue'; v_revenue:=public.dd_run_revenue_orchestrator(); select count(*) into v_after from public.dd_estimates where source_slug='sales_queue'; v_quotes:=greatest(0,v_after-v_before);
 select count(*) into v_buyers from public.dd_sales_queue s where coalesce(s.do_not_contact,false)=false and coalesce(s.lane,'')<>'PARTNER' and coalesce(s.sales_metadata #>> '{channel_tag_20261006,status}','') not in ('PARTNER_NOT_BUYER','TEST_RECORD') and s.disposition not in ('NOT_INTERESTED','CLOSED_LOST');
 select count(*) into v_verified from public.dd_sales_queue s where coalesce(s.do_not_contact,false)=false and coalesce(s.lane,'')<>'PARTNER' and coalesce(s.sales_metadata #>> '{channel_tag_20261006,status}','') not in ('PARTNER_NOT_BUYER','TEST_RECORD') and (coalesce(s.decision_maker_confirmed,false)=true or upper(coalesce(s.source_direction,''))='INBOUND' or upper(coalesce(s.source_confidence,''))='VERIFIED');
 select count(*) into v_matched from public.dd_sales_queue s where coalesce(s.do_not_contact,false)=false and coalesce(s.lane,'')<>'PARTNER' and coalesce(s.sales_metadata #>> '{channel_tag_20261006,status}','') not in ('PARTNER_NOT_BUYER','TEST_RECORD') and s.suggested_sku is not null;
 select count(*) into v_followups from public.dd_sales_queue s where coalesce(s.do_not_contact,false)=false and coalesce(s.lane,'')<>'PARTNER' and coalesce(s.sales_metadata #>> '{channel_tag_20261006,status}','') not in ('PARTNER_NOT_BUYER','TEST_RECORD') and s.next_action_date is not null and s.next_action_date<=current_date and s.disposition not in ('NOT_INTERESTED','PAYMENT_SUCCEEDED');
 select count(*) into v_paid from public.dd_sales_queue s where coalesce(s.amount_collected,0)>0 or s.disposition='PAYMENT_SUCCEEDED';
 select count(*) into v_jobs from public.dd_jobs j where upper(coalesce(j.job_status,'')) not in ('COMPLETED','CANCELLED','CLOSED');
 select count(*) into v_recurring from public.dd_sales_queue s where (coalesce(s.amount_collected,0)>0 or s.disposition='PAYMENT_SUCCEEDED' or s.job_id is not null) and coalesce(s.do_not_contact,false)=false and coalesce(s.lane,'')<>'PARTNER' and coalesce(s.sales_metadata #>> '{channel_tag_20261006,status}','') not in ('PARTNER_NOT_BUYER','TEST_RECORD') and coalesce(s.sales_metadata->>'recurring_reviewed','false')<>'true';
 if v_verified<10 or v_matched<5 then perform public.dd_run_research_pipeline_controller(); v_research:=true; end if;
 v_progress:=v_quotes+coalesce((v_revenue->>'verified_leads_promoted')::int,0)+coalesce((v_demand->>'promoted_count')::int,0)+coalesce((v_match->>'matched_buyers')::int,0);
 update public.dd_revenue_autonomy_runs set completed_at=now(),status=case when v_progress>0 then 'ADVANCED_REVENUE' when v_followups>0 or v_matched>0 then 'REVENUE_WORK_AVAILABLE' else 'NO_REVENUE_MOVEMENT' end,buyers_available=v_buyers,buyers_verified=v_verified,offers_matched=v_matched,quote_drafts_created=v_quotes,followups_due=v_followups,paid_sales=v_paid,active_jobs=v_jobs,recurring_candidates=v_recurring,research_triggered=v_research,revenue_progress_score=v_progress,summary=jsonb_build_object('operating_rule','FIND_BUYER_VERIFY_MATCH_ECONOMICS_OUTREACH_FOLLOWUP_QUOTE_ACCEPT_PAYMENT_DISPATCH_QA_CROSS_SELL_RECURRING_MEASURE_LEARN_REPEAT','research_rule','Research is subordinate to a revenue decision and is triggered only when verified/matched funnel inventory is insufficient.','success_rule','A run is successful only when it advances a governed revenue state; execution alone is not success.','offer_match',v_match,'demand',v_demand,'commercial_intelligence',v_intel,'revenue_orchestrator',v_revenue,'external_contact',false,'money_action',false,'pricing_published',false,'owner_boundaries_preserved',true) where id=v_id;
 return v_id;
exception when others then update public.dd_revenue_autonomy_runs set completed_at=now(),status='FAILED',summary=jsonb_build_object('error',sqlerrm) where id=v_id; raise;
end $function$
;
