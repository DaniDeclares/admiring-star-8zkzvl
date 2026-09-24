
update public.dd_governed_service_offers g
set fulfillment_gate_status='READY',
    offer_basis=g.offer_basis || ' | 2026-09-23 RECONCILED: release gate cleared from owner-confirmed launch evidence, active CH02 authorization, governed pricing, and existing fulfillment capability state; no compliance or credential gate bypassed.',
    updated_at=now()
from public.dd_launch_portfolio lp
where lp.canonical_sku=g.canonical_sku
  and g.canonical_sku in ('DNI-02A-025','DNI-02A-026','DNI-02A-027','DNI-02A-028','DNI-02A-038')
  and g.commercial_offer_status='SELL_NOW'
  and g.fulfillment_gate_status='FULFILLMENT_GATED'
  and g.pricing_rule_count>0
  and g.channel_availability_count>0
  and g.authorized_provider_capability_count>0
  and lp.evidence_status='OWNER_CONFIRMED'
  and lp.capability_status in ('VERIFIED','SCOPED','MANAGED');
