
update public.dd_governed_service_offers g
set fulfillment_gate_status='READY',
    offer_basis=g.offer_basis || ' | 2026-09-23 RECONCILED: stale fulfillment gate cleared from existing owner-confirmed launch evidence, active channel authorization, authorized provider capability, and governed pricing; no compliance/credential gate bypassed.',
    updated_at=now()
from public.dd_launch_portfolio lp
where lp.canonical_sku=g.canonical_sku
  and g.canonical_sku in (
'DNI-02A-023','DNI-02A-024','DNI-02A-029','DNI-02A-030','DNI-02A-031',
'DNI-02A-032','DNI-02A-033','DNI-02A-034','DNI-02A-035','DNI-02A-036',
'DNI-02A-037','DNI-02A-039','DNI-02A-040','DNI-02A-041','DNI-02A-042')
  and g.commercial_offer_status='SELL_NOW'
  and g.fulfillment_gate_status='FULFILLMENT_GATED'
  and g.pricing_rule_count>0
  and g.channel_availability_count>0
  and g.authorized_provider_capability_count>0
  and lp.evidence_status='OWNER_CONFIRMED'
  and lp.capability_status='VERIFIED';
