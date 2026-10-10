-- Existing release-contract authority; read-only; safe for repeated Tester/Production comparison.
-- This is an audit, NOT a migration, promotion, sales-queue generator or release approval.
-- Divisions are capabilities, NOT customer channels. Preserve all five channels.
SELECT division, release_state, blocking_gate, count(*) AS service_count
FROM public.dd_service_release_contract_v1
GROUP BY division, release_state, blocking_gate
ORDER BY division, service_count DESC;

-- Every held service, with the existing first blocking gate and detailed prerequisite state.
SELECT canonical_sku, service_name, division, release_state, blocking_gate,
       commercial_definition_ok, pricing_engine_ok, quote_path_ok,
       channel_authorization_ok, fulfillment_matrix_ok, payment_ledger_ok,
       runtime_accuracy_ok, provider_capability_count, authorized_channel_count,
       routing_count, required_requirement_count, active_task_template_count
FROM public.dd_service_release_contract_v1
WHERE release_state <> 'LIVE_READY'
ORDER BY CASE blocking_gate
 WHEN 'COMMERCIAL_DEFINITION' THEN 1
 WHEN 'ECONOMICS' THEN 2
 WHEN 'PAYMENT_LEDGER' THEN 3
 WHEN 'RUNTIME_ACCURACY' THEN 4
 ELSE 5 END, division, canonical_sku;

-- Cross-cutting hidden gaps, including ones not shown as the first blocking gate.
-- Zero routing records is a coverage signal, not proof no valid provider exists.
SELECT division, release_state,
 count(*) AS services,
 count(*) FILTER (WHERE coalesce(provider_capability_count,0)=0) AS no_provider_capability,
 count(*) FILTER (WHERE coalesce(authorized_channel_count,0)=0) AS no_authorized_channel,
 count(*) FILTER (WHERE coalesce(routing_count,0)=0) AS no_routing,
 count(*) FILTER (WHERE coalesce(active_task_template_count,0)=0) AS no_task_template,
 count(*) FILTER (WHERE NOT coalesce(quote_path_ok,false)) AS quote_path_not_ready
FROM public.dd_service_release_contract_v1
GROUP BY division,release_state ORDER BY division,release_state;

-- Marketable now means release-gated and quotable, NOT a claim of provider availability.
-- Use for internal candidate selection only; check capacity, geography, credentials,
-- owner authorization, and payment before external promises.
SELECT canonical_sku, service_name, division,
 CASE WHEN release_state='LIVE_READY'
   AND coalesce(quote_path_ok,false)
   AND coalesce(channel_authorization_ok,false)
   AND coalesce(fulfillment_matrix_ok,false)
   AND coalesce(payment_ledger_ok,false)
   AND coalesce(runtime_accuracy_ok,false)
 THEN 'RELEASE_GATED_CANDIDATE'
 ELSE 'CONSULTATION_OR_REMEDIATION_ONLY' END AS internal_marketing_class,
 blocking_gate
FROM public.dd_service_release_contract_v1
ORDER BY division,canonical_sku;
