-- Reconcile DNI-01A-001 CH03 availability with the currently locked runtime/customer-routing boundary.
-- Preserve CH03 as a candidate; do not expose it as active until a CH03 routing/strategy contract exists.
UPDATE public.dd_service_channel_availability
SET eligibility_status = 'PENDING',
    notes = 'Reconciled 2026-09-21: CH03 remains a preserved candidate in the channel matrix, but no CH03 customer-routing path is currently locked and the live commercial-intent runtime does not authorize Division 01 through CH03. Do not expose as active until a CH03 routing/strategy contract is implemented and verified.'
WHERE service_id = (SELECT id FROM public.services WHERE sku = 'DNI-01A-001')
  AND channel_code = 'CH03'
  AND eligibility_status <> 'PENDING';
