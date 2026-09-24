
update public.dd_governed_service_offers
set commercial_offer_status='INTAKE_ONLY',
    offer_basis=offer_basis || ' | 2026-09-23 COMMERCIAL SAFETY CORRECTION: removed from SELL_NOW because governed pricing, active channel authorization, and authorized provider capability are absent. Intake/interest may be captured, but no direct-sale representation is permitted until underwriting and fulfillment evidence are complete.',
    updated_at=now()
where canonical_sku in (
'DNI-10B-001','DNI-10C-001','DNI-10D-001','DNI-10E-001','DNI-10F-001',
'DNI-10G-001','DNI-10H-001','DNI-10I-001','DNI-10J-001','DNI-10K-001','DNI-10L-001')
  and commercial_offer_status='SELL_NOW'
  and pricing_rule_count=0
  and channel_availability_count=0
  and authorized_provider_capability_count=0;

update public.dd_governed_service_offers
set commercial_offer_status='INTAKE_ONLY',
    offer_basis=offer_basis || ' | 2026-09-23 COMMERCIAL SAFETY CORRECTION: medical-courier service remains intake-only pending qualified provider coverage, route economics, channel rules, and applicable healthcare/transport compliance verification documented in underwriting.',
    updated_at=now()
where canonical_sku='DNI-12A-027'
  and commercial_offer_status='SELL_NOW'
  and fulfillment_gate_status='FULFILLMENT_GATED';
