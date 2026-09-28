begin;

create or replace function public.dd_run_revenue_readiness_learning_cycle()
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  rec record;
  v_checked int := 0;
  v_mismatches int := 0;
  v_ready int := 0;
  v_hold int := 0;
  v_key text;
begin
  for rec in
    select
      r.canonical_sku,
      r.service_name,
      r.provider_capability_count,
      r.has_payment_link,
      r.has_stripe_price,
      r.stripe_register_authorized,
      r.stripe_sync_active,
      r.stripe_price_verified,
      r.payment_path_verified,
      r.quote_path_ok,
      r.fulfillment_matrix_ok,
      r.payment_ledger_ok,
      r.runtime_accuracy_ok,
      r.blocking_gate,
      r.release_state,
      l.commercial_status,
      l.pricing_status,
      l.fulfillment_status,
      l.stripe_payment_link_id,
      l.checkout_mode,
      l.activation_decision,
      l.blockers
    from public.dd_service_release_contract_v1 r
    left join public.dd_stripe_launch_register l using (canonical_sku)
    where r.release_state in ('LIVE_READY','HOLD')
  loop
    v_checked := v_checked + 1;
    if rec.release_state='LIVE_READY' then v_ready := v_ready + 1; else v_hold := v_hold + 1; end if;

    if
      (rec.release_state='LIVE_READY' and coalesce(rec.payment_path_verified,false)=false)
      or (rec.release_state='LIVE_READY' and coalesce(rec.provider_capability_count,0)=0)
      or (rec.release_state='LIVE_READY' and rec.activation_decision='HOLD')
      or (rec.release_state='LIVE_READY' and coalesce(rec.has_payment_link,false)=true and rec.stripe_payment_link_id is null)
      or (rec.activation_decision='ACTIVE' and coalesce(rec.payment_path_verified,false)=false)
    then
      v_mismatches := v_mismatches + 1;
      v_key := 'REVENUE_READINESS_MISMATCH:'||rec.canonical_sku;

      insert into public.dd_learning_evidence_intake(
        evidence_key,evidence_origin,domain,source_system,source_reference,
        observation,evidence_payload,authority_class,requires_new_test,status
      ) values (
        v_key,
        'PRODUCTION',
        'REVENUE_OPERATIONS',
        'REVENUE_READINESS_LEARNING_CYCLE',
        rec.canonical_sku,
        'Revenue readiness authorities disagree. Reconcile existing commercial, fulfillment, payment, provider-capacity and runtime evidence before publishing or suppressing this offer.',
        jsonb_build_object(
          'canonical_sku',rec.canonical_sku,
          'service_name',rec.service_name,
          'release_state',rec.release_state,
          'provider_capability_count',rec.provider_capability_count,
          'has_payment_link',rec.has_payment_link,
          'has_stripe_price',rec.has_stripe_price,
          'payment_path_verified',rec.payment_path_verified,
          'stripe_register_authorized',rec.stripe_register_authorized,
          'stripe_sync_active',rec.stripe_sync_active,
          'stripe_price_verified',rec.stripe_price_verified,
          'activation_decision',rec.activation_decision,
          'checkout_mode',rec.checkout_mode,
          'blockers',rec.blockers,
          'blocking_gate',rec.blocking_gate,
          'operator_method',jsonb_build_array(
             'FIND_EXISTING_AUTHORITY',
             'FIND_EXISTING_WORKER_CONTROLLER_AUTOMATION',
             'INSPECT_LATEST_RECEIPT_STATE',
             'DETERMINE_IF_TRANSITION_ALREADY_SOLVED',
             'REPAIR_OR_EXTEND_ONLY_ON_DEMONSTRATED_GAP',
             'BUILD_NEW_ONLY_IF_NOTHING_REUSABLE_EXISTS',
             'FEED_EXECUTION_RECEIPT_BACK_TO_TESTER_BRAIN',
             'RETURN_TO_TOP_AND_REPEAT'
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

  perform public.dd_capture_production_learning_for_tester();

  return jsonb_build_object(
    'status','COMPLETED',
    'services_checked',v_checked,
    'live_ready',v_ready,
    'held',v_hold,
    'authority_mismatches',v_mismatches,
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

do $$
begin
  if exists (select 1 from pg_namespace where nspname='cron') then
    perform cron.schedule(
      'dani-revenue-readiness-learning-cycle',
      '1,21,41 * * * *',
      'select public.dd_run_revenue_readiness_learning_cycle();'
    );
  end if;
end
$$;

commit;
