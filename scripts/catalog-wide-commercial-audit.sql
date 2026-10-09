-- Read-only; run in Tester and Production separately. Never promotes or sells a SKU.
-- Report all canonical SKUs, all divisions, and every release blocker.
SELECT division, release_state, blocking_gate, count(*) AS service_count
FROM public.dd_service_release_contract_v1
GROUP BY division, release_state, blocking_gate
ORDER BY division, service_count DESC;

-- Ordered remediation worklist; do not treat a readiness label as buyer demand.
SELECT canonical_sku, service_name, division, release_state, blocking_gate,
       commercial_definition_ok, pricing_engine_ok, quote_path_ok,
       channel_authorization_ok, fulfillment_matrix_ok, payment_ledger_ok,
       runtime_accuracy_ok, provider_capability_count, authorized_channel_count
FROM public.dd_service_release_contract_v1
WHERE release_state <> 'LIVE_READY'
ORDER BY CASE blocking_gate
 WHEN 'COMMERCIAL_DEFINITION' THEN 1
 WHEN 'ECONOMICS' THEN 2
 WHEN 'PAYMENT_LEDGER' THEN 3
 WHEN 'RUNTIME_ACCURACY' THEN 4
 ELSE 5 END, division, canonical_sku;

-- Detect services with no mapped provider capability, including nominally ready SKUs.
SELECT division, release_state, count(*) AS missing_provider_capability
FROM public.dd_service_release_contract_v1
WHERE coalesce(provider_capability_count,0)=0
GROUP BY division, release_state ORDER BY division, release_state;
