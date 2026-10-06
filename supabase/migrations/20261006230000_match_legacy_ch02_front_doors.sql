-- Operation $1M: offer matcher recognizes legacy CH02 front-door codes.
-- Root cause: verified CH02 property managers tagged PROPERTY_OPERATIONS / APARTMENT_PROPERTY_SUPPORT / null
-- never matched a LIVE_READY offer, so they never entered the governed quote flow.
-- Broadened branch excludes BOUNCED/SUPPRESSED campaigns and requires an email or phone route.
-- Applied to Production (ajxezpczaemunlcmqlgl) 2026-10-06 via execute_sql. Offer match only: no intent, pricing, or contact.
CREATE OR REPLACE FUNCTION public.dd_match_existing_buyers_to_governed_offers(p_limit integer DEFAULT 100)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $fn$
declare v_matched int:=0; v_repair int:=0;
begin
with candidates as (
 select s.id,case
  when s.id='608eb889-c88f-41ec-88ed-ff8158b84eb8'::uuid then 'DNI-04A-019'
  when coalesce(s.sales_metadata->>'channel_code','')='CH02' and (s.front_door_code='CH02-F01' or coalesce(s.solution_statement,'') ~* '(turnover|turn reset|turn support|make-ready|make ready|unit turn)' or coalesce(s.next_action,'') ~* '(turnover|turn as a trial|turn pressure|turns are open|first assignment)') then 'DNI-02A-009'
  when coalesce(s.sales_metadata->>'channel_code','')='CH02' and (s.front_door_code='CH02-F03' or coalesce(s.solution_statement,'') ~* '(condition documentation|inspection|asset verification)' or coalesce(s.next_action,'') ~* '(condition-documentation|condition documentation|inspection)') then 'DNI-02A-003'
  when coalesce(s.sales_metadata->>'channel_code','')='CH02' and (s.front_door_code is null or s.front_door_code in ('PROPERTY_OPERATIONS','APARTMENT_PROPERTY_SUPPORT')) and upper(coalesce(s.campaign_status,'')) not in ('BOUNCED','SUPPRESSED') and (s.email is not null or s.phone is not null) then 'DNI-02A-009'
  else null end sku
 from public.dd_sales_queue s
 where coalesce(s.do_not_contact,false)=false and s.suggested_sku is null
  and s.disposition not in ('NOT_INTERESTED','PAYMENT_SUCCEEDED','NEEDS_INFO','CLOSED_LOST')
  and coalesce(s.sales_metadata->>'routine_outreach_suppressed','false') <> 'true'
  and (coalesce(s.decision_maker_confirmed,false)=true or upper(coalesce(s.source_direction,''))='INBOUND' or upper(coalesce(s.source_confidence,''))='VERIFIED')
 order by case when s.source_confidence='VERIFIED' then 0 else 1 end,coalesce(s.intent_score,0) desc,s.updated_at desc
 limit greatest(1,least(coalesce(p_limit,100),500))
), valid as (
 select c.id,c.sku,r.blocking_gate,r.release_state from candidates c join public.dd_service_release_contract_v1 r on r.canonical_sku=c.sku
 where c.sku is not null and r.channel_authorization_ok and r.fulfillment_matrix_ok and r.unresolved_rule_count=0
)
update public.dd_sales_queue s set suggested_sku=v.sku,
 sales_metadata=coalesce(s.sales_metadata,'{}'::jsonb)||jsonb_build_object('autonomous_offer_match',jsonb_build_object('sku',v.sku,'matched_at',now(),'basis','EXISTING_VERIFIED_BUYER_EVIDENCE_PLUS_GOVERNED_RELEASE_CONTRACT','release_state',v.release_state,'blocking_gate',v.blocking_gate,'quote_eligible',v.release_state='LIVE_READY','matcher_version','2026-10-06-legacy-ch02-front-doors')),
 next_action=case when v.release_state='LIVE_READY' then 'Advance through governed quote flow.' else 'Repair governed service release gate before quote: '||coalesce(v.blocking_gate,'UNKNOWN') end,updated_at=now()
from valid v where s.id=v.id;
get diagnostics v_matched=row_count;
insert into public.dd_owner_attention_queue(domain,source_table,source_record_id,reason,priority,recommended_action,metadata)
select 'REVENUE','dd_service_release_contract_v1',r.canonical_sku,'Matched buyer demand exists but the governed offer is held by a release gate.','P1','Repair the existing '||coalesce(r.blocking_gate,'UNKNOWN')||' gate for '||coalesce(r.service_name,r.canonical_sku)||' - do not create a duplicate service.',jsonb_build_object('canonical_sku',r.canonical_sku,'service_name',r.service_name,'blocking_gate',r.blocking_gate,'release_state',r.release_state,'revenue_first',true,'external_contact_authorized',false)
from public.dd_service_release_contract_v1 r where exists(select 1 from public.dd_sales_queue s where s.suggested_sku=r.canonical_sku and coalesce(s.do_not_contact,false)=false) and r.release_state<>'LIVE_READY' and not exists(select 1 from public.dd_owner_attention_queue a where a.source_table='dd_service_release_contract_v1' and a.source_record_id=r.canonical_sku and a.status='OPEN');
get diagnostics v_repair=row_count;
return jsonb_build_object('matched_buyers',v_matched,'release_gate_repairs_queued',v_repair,'pricing_invented',false,'buyer_intent_invented',false,'external_contact',false);
end $fn$;