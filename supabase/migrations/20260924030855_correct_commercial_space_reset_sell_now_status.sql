
update public.dd_governed_service_offers
set commercial_offer_status='INTAKE_ONLY',
    offer_basis=offer_basis || ' | 2026-09-23 COMMERCIAL SAFETY CORRECTION: intake/quote only until documented internal cost and margin economics, exclusions, SOP/workflow, QA/intake controls, active channel authorization, and fulfillment capability are complete.',
    updated_at=now()
where canonical_sku='DNI-02A-004'
  and commercial_offer_status='SELL_NOW'
  and fulfillment_gate_status='FULFILLMENT_GATED';
