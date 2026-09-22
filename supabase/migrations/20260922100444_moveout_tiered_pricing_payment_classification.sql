
update public.services
set pricing_type='STARTING_AT',starting_price=330.00,updated_at=now()
where sku='DNI-01A-003';

update public.dd_governed_service_offers
set offer_basis=offer_basis || ' | 2026-09-22 COMMERCIAL CORRECTION: bedroom-tier pricing is quote/configured from $330; it is not a single flat $330 checkout price.',
    updated_at=now()
where canonical_sku='DNI-01A-003';
