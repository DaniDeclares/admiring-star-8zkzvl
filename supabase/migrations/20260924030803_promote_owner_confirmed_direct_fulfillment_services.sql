
update public.dd_governed_service_offers
set fulfillment_gate_status='READY',
    offer_basis=offer_basis || ' | 2026-09-23 RECONCILED: owner-confirmed direct fulfillment, active channel authorization, governed pricing, and authorized capability already present. Existing scope guardrails remain controlling.',
    updated_at=now()
where canonical_sku in ('DNI-01A-042','DNI-01D-017')
  and commercial_offer_status='SELL_NOW'
  and fulfillment_gate_status='FULFILLMENT_GATED'
  and pricing_rule_count>0
  and channel_availability_count>0
  and authorized_provider_capability_count>0;
