
create or replace view public.dd_service_release_reconciliation_queue_v1
with (security_invoker=true) as
select
  r.canonical_sku,
  r.service_name,
  r.service_family,
  r.release_state,
  r.blocking_gate,
  r.provider_capability_count,
  r.routing_count,
  r.active_task_template_count,
  r.payment_path_verified,
  r.payment_ledger_ok,
  r.runtime_accuracy_ok,
  r.regression_verified,
  r.production_smoke_verified,
  e.economics_ready,
  e.economics_reason,
  g.commercial_offer_status,
  g.fulfillment_gate_status as governed_fulfillment_status,
  g.pricing_rule_count as governed_pricing_rule_count,
  g.authorized_provider_capability_count as governed_provider_capability_count,
  g.source_authority as governed_source_authority,
  case
    when r.release_state='LIVE_READY' then 'READY'
    when r.release_state='BLOCKED' or r.blocking_gate='BLOCKED' then 'BLOCKED_AUTHORITY'
    when r.blocking_gate='COMMERCIAL_DEFINITION' then 'COMMERCIAL_DEFINITION_REQUIRED'
    when r.blocking_gate='ECONOMICS' then 'ECONOMICS_REQUIRED'
    when r.blocking_gate='FULFILLMENT_MATRIX' then 'FULFILLMENT_REQUIRED'
    when r.blocking_gate='PAYMENT_LEDGER' then 'PAYMENT_REQUIRED'
    when r.blocking_gate='RUNTIME_ACCURACY' then 'RUNTIME_REQUIRED'
    when r.blocking_gate='REGRESSION_VERIFIED' then 'REGRESSION_REQUIRED'
    when r.blocking_gate='CANONICAL_IDENTITY' then 'IDENTITY_REQUIRED'
    when r.blocking_gate='PRICING_ENGINE' then 'PRICING_REQUIRED'
    when r.blocking_gate='QUOTE_PATH' then 'QUOTE_PATH_REQUIRED'
    when r.blocking_gate='CHANNEL_AUTHORIZATION' then 'CHANNEL_AUTHORITY_REQUIRED'
    else 'OTHER_REQUIRED'
  end as reconciliation_class,
  case
    when r.release_state='LIVE_READY' then 'NONE'
    when r.release_state='BLOCKED' or r.blocking_gate='BLOCKED' then 'PRESERVE_BLOCK_AND_RESEARCH_AUTHORITY'
    when r.blocking_gate='COMMERCIAL_DEFINITION' then 'RECONCILE_SCOPE_OFFER_AND_CHANNEL_AUTHORITY'
    when r.blocking_gate='ECONOMICS' then 'RECONCILE_COST_COMPENSATION_OR_GOVERNED_OFFER_AUTHORITY'
    when r.blocking_gate='FULFILLMENT_MATRIX' then 'RECONCILE_ROUTING_CAPABILITY_AND_TASK_TEMPLATE'
    when r.blocking_gate='PAYMENT_LEDGER' then 'RECONCILE_INITIAL_PAYMENT_AND_LEDGER_PATH'
    when r.blocking_gate='RUNTIME_ACCURACY' then 'RUN_RUNTIME_PROOF'
    when r.blocking_gate='REGRESSION_VERIFIED' then 'RUN_REGRESSION_PROOF'
    when r.blocking_gate='CANONICAL_IDENTITY' then 'RECONCILE_CANONICAL_IDENTITY'
    when r.blocking_gate='PRICING_ENGINE' then 'RECONCILE_LOCKED_PRICING_RULES'
    when r.blocking_gate='QUOTE_PATH' then 'RECONCILE_QUOTE_INPUT_SCHEMA'
    when r.blocking_gate='CHANNEL_AUTHORIZATION' then 'RECONCILE_CHANNEL_AVAILABILITY'
    else 'INSPECT_EXISTING_AUTHORITY'
  end as next_repair_action
from public.dd_service_release_contract_v1 r
left join public.dd_service_economics_authority_v1 e using(canonical_sku)
left join public.dd_governed_service_offers g using(canonical_sku);

create or replace function public.dd_run_revenue_readiness_learning_cycle()
returns jsonb
language plpgsql
security invoker
set search_path=''
as $function$
declare
  rec record;
  v_checked int:=0;
  v_ready int:=0;
  v_hold int:=0;
  v_blocked int:=0;
  v_mismatches int:=0;
  v_key text;
begin
  for rec in
    select *
    from public.dd_service_release_reconciliation_queue_v1
  loop
    v_checked:=v_checked+1;
    if rec.release_state='LIVE_READY' then
      v_ready:=v_ready+1;
    elsif rec.release_state='BLOCKED' then
      v_blocked:=v_blocked+1;
    else
      v_hold:=v_hold+1;
    end if;

    if rec.release_state<>'LIVE_READY' then
      v_mismatches:=v_mismatches+1;
      v_key:='SERVICE_RELEASE_RECONCILIATION:'||rec.canonical_sku;

      insert into public.dd_learning_evidence_intake(
        evidence_key,evidence_origin,domain,source_system,source_reference,
        observation,evidence_payload,authority_class,requires_new_test,status
      ) values (
        v_key,
        'PRODUCTION',
        'REVENUE_OPERATIONS',
        'REVENUE_READINESS_LEARNING_CYCLE',
        rec.canonical_sku,
        'Service is not LIVE_READY. Reuse existing authority and repair only the first demonstrated release gate before advancing downstream.',
        jsonb_build_object(
          'canonical_sku',rec.canonical_sku,
          'service_name',rec.service_name,
          'service_family',rec.service_family,
          'release_state',rec.release_state,
          'blocking_gate',rec.blocking_gate,
          'reconciliation_class',rec.reconciliation_class,
          'next_repair_action',rec.next_repair_action,
          'economics_ready',rec.economics_ready,
          'economics_reason',rec.economics_reason,
          'provider_capability_count',rec.provider_capability_count,
          'routing_count',rec.routing_count,
          'active_task_template_count',rec.active_task_template_count,
          'payment_path_verified',rec.payment_path_verified,
          'payment_ledger_ok',rec.payment_ledger_ok,
          'runtime_accuracy_ok',rec.runtime_accuracy_ok,
          'regression_verified',rec.regression_verified,
          'production_smoke_verified',rec.production_smoke_verified,
          'commercial_offer_status',rec.commercial_offer_status,
          'governed_fulfillment_status',rec.governed_fulfillment_status,
          'governed_pricing_rule_count',rec.governed_pricing_rule_count,
          'governed_provider_capability_count',rec.governed_provider_capability_count,
          'governed_source_authority',rec.governed_source_authority,
          'operator_method',jsonb_build_array(
            'FIND_EXISTING_AUTHORITY',
            'FIND_EXISTING_WORKER_CONTROLLER_AUTOMATION',
            'INSPECT_LATEST_RECEIPT_STATE',
            'REPAIR_FIRST_DEMONSTRATED_GATE_ONLY',
            'RECOMPUTE_RELEASE_CONTRACT',
            'CONTINUE_DOWNSTREAM_UNTIL_READY_OR_LEGITIMATELY_HELD'
          ),
          'production_authority',false
        ),
        'GOVERNANCE',
        true,
        'NEW'
      )
      on conflict(evidence_key) do update set
        observation=excluded.observation,
        evidence_payload=excluded.evidence_payload,
        requires_new_test=true,
        status=case
          when public.dd_learning_evidence_intake.status in ('ADOPTED','REJECTED','TESTED') then 'NEW'
          else public.dd_learning_evidence_intake.status
        end,
        updated_at=now();
    end if;
  end loop;

  perform public.dd_capture_service_release_authority_fingerprints();
  perform public.dd_capture_production_learning_for_tester();

  return jsonb_build_object(
    'status','COMPLETED',
    'services_checked',v_checked,
    'live_ready',v_ready,
    'held',v_hold,
    'blocked',v_blocked,
    'non_ready_routed',v_mismatches,
    'reconciliation_view','dd_service_release_reconciliation_queue_v1',
    'learning_pipeline_reused',true,
    'external_contact',false,
    'money_action',false,
    'pricing_published',false,
    'production_authority_expanded',false
  );
end
$function$;

revoke all on function public.dd_run_revenue_readiness_learning_cycle() from public;
revoke all on function public.dd_run_revenue_readiness_learning_cycle() from anon;
revoke all on function public.dd_run_revenue_readiness_learning_cycle() from authenticated;
grant execute on function public.dd_run_revenue_readiness_learning_cycle() to service_role;
