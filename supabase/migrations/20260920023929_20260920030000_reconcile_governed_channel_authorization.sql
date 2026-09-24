BEGIN;

-- Reconcile channel availability only from an existing governed customer-routing contract.
-- Pricing alone never creates channel authorization.
INSERT INTO public.dd_service_channel_availability
  (service_id, channel_code, eligibility_status, notes)
SELECT DISTINCT
  s.id,
  m.channel_code,
  CASE
    WHEN m.eligibility_status IN ('ACTIVE','ELIGIBLE') THEN 'ELIGIBLE'::text
    WHEN m.eligibility_status = 'QUOTE_REQUIRED' THEN 'QUOTE_REQUIRED'::text
    ELSE m.eligibility_status
  END,
  'Gate 05 reconciliation from governed master customer-routing authorization; pricing is not used as channel authority.'
FROM public.services s
JOIN public.dd_master_service_customer_routing m
  ON m.sku = s.sku
JOIN public.dd_service_pricing_rules pr
  ON pr.service_id = s.id
 AND pr.channel_code = m.channel_code
 AND pr.status = 'ACTIVE'
 AND pr.lock_status = 'LOCKED'
WHERE s.is_active = true
  AND s.commercial_intent_status = 'SELL_NOW'
  AND m.eligibility_status IN ('ACTIVE','ELIGIBLE','QUOTE_REQUIRED')
ON CONFLICT (service_id, channel_code)
DO UPDATE SET
  eligibility_status = EXCLUDED.eligibility_status,
  notes = EXCLUDED.notes;

-- Do not manufacture CH01 customer-routing rows.
-- Existing governed routing is the authority.
-- Do not mass-update quote-engine versions.
-- Release state is computed by dd_service_release_contract_v1.

COMMIT;
