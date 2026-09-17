-- Division 05 (Notary & Document Services) had zero dd_provider_capabilities rows for
-- Danielle despite being her original, currently-licensed, real business -- notary services
-- were priced/corrected earlier in this project's history but the authorization step that
-- actually gates live checkout (checkoutEligibility() in governedCommercialGate2026.js,
-- which requires authorized_provider_capability_count > 0) was never backfilled. Danielle has
-- now explicitly confirmed she personally performs all 20 canonical Division-05A services.
--
-- DNI-05A-007 (I-9 Verification Support) was additionally stuck at services.commercial_status
-- = 'PENDING_RECONCILIATION' / offer commercial_offer_status = 'INTAKE_ONLY' even though it
-- already has full 5-channel pricing ($60 FIXED) -- just never flipped to active. Fixed here
-- alongside the authorization pass.

UPDATE public.services
SET commercial_status = 'CANONICAL_ACTIVE', updated_at = now()
WHERE id = 'c445ae50-cd7a-4ad8-a8cc-96d70a8169c8'; -- I-9 Verification Support (DNI-05A-007)

UPDATE public.dd_governed_service_offers o
SET commercial_offer_status = 'SELL_NOW',
    fulfillment_gate_status = 'READY',
    authorized_provider_capability_count = 1
FROM public.dd_master_service_universe m
WHERE o.master_record_id = m.id
  AND m.division = '05'
  AND m.lifecycle_status = 'CANONICAL_ACTIVE';

INSERT INTO public.dd_provider_capabilities (provider_org_id, service_id, service_line, capability_key, is_authorized, tier_availability)
SELECT '19c10267-898f-4c10-a25e-186f6aff8771', s.id, m.service_name, 'NOTARY_COMMISSIONED', true, '{}'::jsonb
FROM public.dd_master_service_universe m
JOIN public.dd_governed_service_offers o ON o.master_record_id = m.id
JOIN public.services s ON s.id = o.runtime_service_id
WHERE m.division = '05' AND m.lifecycle_status = 'CANONICAL_ACTIVE';
