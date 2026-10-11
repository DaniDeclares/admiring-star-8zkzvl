
update public.dd_sales_queue s
set suggested_sku=null,
    next_action='Qualify the property-management execution need across turn/make-ready, field dispatch, condition/documentation, and office/operations support before selecting a SKU.',
    sales_metadata=coalesce(s.sales_metadata,'{}'::jsonb)
      || jsonb_build_object(
        'execution_positioning',
        jsonb_build_object(
          'promise','WE_HANDLE_THE_EXECUTION',
          'front_doors',jsonb_build_array(
            'TURNOVER_AND_MAKE_READY',
            'PROPERTY_RESCUE_AND_FIELD_DISPATCH',
            'PROPERTY_CONDITION_AND_DOCUMENTATION',
            'OFFICE_AND_OPERATIONS_RESCUE'
          ),
          'cleaning_is_component_not_default',true,
          'reconciled_at',now()
        ),
        'autonomous_offer_match',
        (coalesce(s.sales_metadata->'autonomous_offer_match','{}'::jsonb)
          - 'sku' - 'quote_eligible' - 'release_state' - 'blocking_gate')
          || jsonb_build_object(
            'reconciled_reason','REMOVED_GENERIC_CLEANING_DEFAULT_NO_EXPLICIT_TURN_INTENT',
            'reconciled_at',now()
          )
      ),
    updated_at=now()
where s.suggested_sku='DNI-02A-009'
  and s.sales_metadata#>>'{autonomous_offer_match,matcher_version}'='2026-10-06-legacy-ch02-front-doors'
  and not (
    coalesce(s.solution_statement,'') ~* '(turnover|turn reset|turn support|make-ready|make ready|unit turn)'
    or coalesce(s.next_action,'') ~* '(turnover|turn as a trial|turn pressure|turns are open|first assignment)'
    or s.front_door_code='CH02-F01'
  );

create or replace function public.dd_match_existing_buyers_to_governed_offers(p_limit integer default 100)
returns jsonb
language plpgsql
security definer
set search_path to 'public','pg_catalog'
as $fn$
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
$fn$;
