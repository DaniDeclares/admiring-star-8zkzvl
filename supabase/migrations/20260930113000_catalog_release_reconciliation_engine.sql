begin;

-- Catalog-wide release reconciliation.
-- Reuses component economics first; only falls back to already-governed sellable SERVICE/SERV offers.
create or replace view public.dd_service_economics_release_authority_v1
with (security_invoker=true) as
with governed as (
  select
    runtime_service_id as service_id,
    canonical_sku,
    bool_or(
      commercial_offer_status='SELL_NOW'
      and fulfillment_gate_status='READY'
      and pricing_rule_count>0
      and authorized_provider_capability_count>0
      and source_authority is not null
    ) as governed_service_economics_ready
  from public.dd_governed_service_offers
  where commercial_object_type in ('SERV','SERVICE')
  group by runtime_service_id,canonical_sku
)
select
  e.service_id,e.canonical_sku,
  e.package_component_count,e.labor_component_count,e.cost_component_count,
  e.unresolved_cost_component_count,e.unresolved_owner_labor_count,e.unresolved_provider_labor_count,
  e.policy_ready,e.owner_route_active,e.provider_route_active,
  case
    when e.package_component_count>0 then e.economics_ready
    when coalesce(g.governed_service_economics_ready,false) then true
    else e.economics_ready
  end as economics_ready,
  case
    when e.package_component_count=0 and coalesce(g.governed_service_economics_ready,false)
      then 'GOVERNED_SERVICE_OFFER_READY'
    else e.economics_reason
  end as economics_reason
from public.dd_service_economics_authority_v1 e
left join governed g on g.service_id=e.service_id and g.canonical_sku=e.canonical_sku;

grant select on public.dd_service_economics_release_authority_v1 to service_role;

create or replace view public.dd_service_release_contract_v1
with (security_invoker=true) as
with base as (
 select l.*,
   case when l.pricing_type='RECURRING'
        then coalesce(l.payment_path_verified,false)
        else l.payment_ledger_ok
   end as effective_payment_ledger_ok
 from public.dd_service_release_contract_legacy_v1 l
)
select
  l.canonical_sku,l.service_name,l.division,l.runtime_service_id,l.service_family,l.runtime_service_name,l.description,
  l.pricing_type,l.billing_cycle,l.resident_discount_eligible,l.pricing_engine_code,l.locked_active_rule_count,l.unresolved_rule_count,
  l.authorized_channel_count,l.direct_channel_count,l.required_requirement_count,l.provider_capability_count,l.routing_count,
  l.active_task_template_count,l.has_payment_link,l.has_stripe_price,l.stripe_register_authorized,l.stripe_sync_active,
  l.stripe_price_verified,l.payment_path_verified,l.runtime_verified,l.regression_verified,l.production_smoke_verified,
  l.initial_payment_percent,l.canonical_identity_ok,l.commercial_definition_ok,l.pricing_engine_ok,l.quote_path_ok,
  l.channel_authorization_ok,l.fulfillment_matrix_ok,l.effective_payment_ledger_ok as payment_ledger_ok,l.runtime_accuracy_ok,
  case
    when l.release_state='BLOCKED' then 'BLOCKED'
    when not l.canonical_identity_ok then 'CANONICAL_IDENTITY'
    when not l.commercial_definition_ok then 'COMMERCIAL_DEFINITION'
    when not coalesce(e.economics_ready,false) then 'ECONOMICS'
    when not l.pricing_engine_ok then 'PRICING_ENGINE'
    when not l.quote_path_ok then 'QUOTE_PATH'
    when not l.channel_authorization_ok then 'CHANNEL_AUTHORIZATION'
    when not l.fulfillment_matrix_ok then 'FULFILLMENT_MATRIX'
    when not l.effective_payment_ledger_ok then 'PAYMENT_LEDGER'
    when not l.runtime_accuracy_ok then 'RUNTIME_ACCURACY'
    when not l.regression_verified then 'REGRESSION_VERIFIED'
    else 'NONE'
  end as blocking_gate,
  case
    when l.release_state='BLOCKED' then 'BLOCKED'
    when l.canonical_identity_ok and l.commercial_definition_ok and coalesce(e.economics_ready,false)
      and l.pricing_engine_ok and l.quote_path_ok and l.channel_authorization_ok and l.fulfillment_matrix_ok
      and l.effective_payment_ledger_ok and l.runtime_accuracy_ok and l.regression_verified
    then 'LIVE_READY' else 'HOLD'
  end as release_state
from base l
left join public.dd_service_economics_release_authority_v1 e using(canonical_sku);

grant select on public.dd_service_release_contract_v1 to authenticated,service_role;

create or replace view public.dd_service_release_reconciliation_queue_v1
with (security_invoker=true) as
select
  r.*,
  e.economics_ready,e.economics_reason,
  case
    when r.release_state='LIVE_READY' then 'READY'
    when r.release_state='BLOCKED' then 'BLOCKED_AUTHORITY'
    when r.blocking_gate='COMMERCIAL_DEFINITION' then 'COMMERCIAL_DEFINITION_REQUIRED'
    when r.blocking_gate='ECONOMICS' and e.economics_reason='PACKAGE_COMPONENTS_UNRESOLVED'
      and coalesce(r.provider_capability_count,0)=0 then 'FULFILLMENT_CAPACITY_REQUIRED'
    when r.blocking_gate='ECONOMICS' then 'ECONOMICS_REQUIRED'
    when r.blocking_gate='FULFILLMENT_MATRIX' then 'FULFILLMENT_REQUIRED'
    when r.blocking_gate='PAYMENT_LEDGER' then 'PAYMENT_REQUIRED'
    when r.blocking_gate='RUNTIME_ACCURACY' then 'RUNTIME_REQUIRED'
    when r.blocking_gate='REGRESSION_VERIFIED' then 'REGRESSION_REQUIRED'
    else 'OTHER_REQUIRED'
  end as reconciliation_class
from public.dd_service_release_contract_v1 r
left join public.dd_service_economics_release_authority_v1 e using(canonical_sku);

grant select on public.dd_service_release_reconciliation_queue_v1 to service_role;

create or replace function public.dd_reconcile_unambiguous_fulfillment_routes()
returns jsonb
language plpgsql
security invoker
set search_path=''
as $function$
declare v_inserted int:=0;
begin
  with capability as (
    select pc.service_id,min(pc.capability_key) capability_key
    from public.dd_provider_capabilities pc
    where pc.is_authorized=true
    group by pc.service_id
    having count(distinct pc.capability_key)=1
  ), tasks as (
    select tt.service_id,
           count(*) filter(where tt.is_active=true) active_task_count,
           count(*) filter(where tt.is_active=true and tt.evidence_required=true) active_evidence_count
    from public.dd_task_templates tt
    group by tt.service_id
  ), candidates as (
    select s.id service_id,c.capability_key
    from public.dd_service_release_contract_v1 r
    join public.services s on s.sku=r.canonical_sku
    join capability c on c.service_id=s.id
    join tasks t on t.service_id=s.id
    where r.release_state='HOLD'
      and r.blocking_gate='FULFILLMENT_MATRIX'
      and coalesce(r.provider_capability_count,0)>0
      and t.active_task_count>0
      and t.active_evidence_count>0
      and not exists (
        select 1 from public.dd_service_work_order_routing_templates rt
        where rt.service_id=s.id and rt.is_active=true
      )
  )
  insert into public.dd_service_work_order_routing_templates(
    service_id,channel_code,capability_key,selection_policy,routing_instructions,is_active
  )
  select service_id,null,capability_key,'AUTHORIZED_CAPABILITY_MATCH',
         'Catalog reconciliation route: use only existing authorized capability; downstream channel, economics, availability, payment, runtime and QA gates remain authoritative.',
         true
  from candidates;

  get diagnostics v_inserted=row_count;
  return jsonb_build_object(
    'status','COMPLETED','routes_created',v_inserted,
    'capability_grants_created',0,'channel_authority_created',0,'pricing_changes',0,
    'payment_actions',0,'external_contact',false,
    'ambiguity_policy','SKIP_UNLESS_EXACTLY_ONE_AUTHORIZED_CAPABILITY'
  );
end
$function$;

revoke all on function public.dd_reconcile_unambiguous_fulfillment_routes() from public,anon,authenticated;
grant execute on function public.dd_reconcile_unambiguous_fulfillment_routes() to service_role;

create or replace function public.dd_capture_service_release_authority_fingerprints()
returns jsonb
language plpgsql
set search_path='public'
as $function$
declare v_count int:=0;
begin
 insert into public.dd_production_learning_signals(signal_key,origin,signal_type,statement,evidence,confidence,status)
 select
   'SERVICE_RELEASE_AUTHORITY:'||canonical_sku,
   'PRODUCTION_RUNTIME','SERVICE_RELEASE_AUTHORITY',
   'Production service '||canonical_sku||' ('||service_name||') is runtime-verified; Tester should validate authority/provenance rather than copy the row.',
   jsonb_build_object(
     'canonical_sku',canonical_sku,'service_name',service_name,'service_family',service_family,
     'release_state',release_state,'blocking_gate',blocking_gate,
     'runtime_verified',runtime_verified,'payment_path_verified',payment_path_verified,
     'production_smoke_verified',production_smoke_verified,'runtime_service_id',runtime_service_id,
     'captured_at',now(),'learning_boundary','OBSERVATION_ONLY_REQUIRES_TESTER_VALIDATION',
     'direct_row_copy_allowed',false,'direct_authority_copy_allowed',false
   ),
   1.0,'NEW'
 from (
   select distinct on (canonical_sku) *
   from public.dd_service_release_contract_v1
   where runtime_verified=true and release_state='LIVE_READY'
   order by canonical_sku,production_smoke_verified desc nulls last,payment_path_verified desc nulls last,runtime_service_id nulls last
 ) r
 on conflict(signal_key) do update set
   statement=excluded.statement,evidence=excluded.evidence,confidence=excluded.confidence,
   status=case when public.dd_production_learning_signals.evidence is distinct from excluded.evidence then 'NEW'
               else public.dd_production_learning_signals.status end,
   updated_at=now();
 get diagnostics v_count=row_count;
 return jsonb_build_object('status','COMPLETED','fingerprints_captured_or_refreshed',v_count,'dedupe_key','canonical_sku');
end
$function$;

commit;
