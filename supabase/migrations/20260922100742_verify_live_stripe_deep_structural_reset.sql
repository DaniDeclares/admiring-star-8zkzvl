
insert into public.dd_stripe_catalog_sync(canonical_sku,stripe_product_id,stripe_price_id,stripe_livemode,sync_status,source_service_id,last_synced_at,notes)
select 'DNI-01A-002','prod_VAapviozJbkLaJ','price_1UAFfIChHm1uJK9xw5j1t90L',true,'SYNCED_ACTIVE',s.id,now(),
       'SYSTEM_VERIFIED 2026-09-22 against live Stripe: active $275 one-time price and active payment link line item both match canonical SKU DNI-01A-002.'
from public.services s where s.sku='DNI-01A-002'
on conflict(canonical_sku,stripe_product_id) do update set stripe_price_id=excluded.stripe_price_id,stripe_livemode=true,sync_status='SYNCED_ACTIVE',source_service_id=excluded.source_service_id,last_synced_at=now(),notes=excluded.notes;

insert into public.dd_service_release_verifications(canonical_sku,stripe_price_verified_at,notes,updated_at)
values('DNI-01A-002',now(),'2026-09-22 live Stripe verification: active price price_1UAFfIChHm1uJK9xw5j1t90L = $275.00; active payment link plink_1UH1qOChHm1uJK9xXFpZayWy line item = $275.00; canonical metadata matches DNI-01A-002.',now())
on conflict(canonical_sku) do update set stripe_price_verified_at=excluded.stripe_price_verified_at,notes=excluded.notes,updated_at=now();
