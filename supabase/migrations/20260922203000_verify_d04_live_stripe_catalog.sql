-- D04 fixed-price Stripe reconciliation.
-- Evidence was read directly from the live DANI Stripe account on 2026-09-22:
-- all 19 products, prices, and Payment Links were active; canonical SKU metadata,
-- product/price linkage, currency, one-time billing, and amounts matched Supabase.

insert into public.dd_stripe_catalog_sync
(canonical_sku,stripe_product_id,stripe_price_id,stripe_livemode,sync_status,source_service_id,last_synced_at,notes)
select r.canonical_sku,r.stripe_product_id,r.stripe_price_id,true,'SYNCED_ACTIVE',s.id,now(),
       'Live Stripe product, one-time USD price, canonical metadata, and active Payment Link verified against the governed D04 price.'
from public.dd_stripe_launch_register r
join public.services s on s.sku=r.canonical_sku
where r.canonical_sku between 'DNI-04A-001' and 'DNI-04A-019'
  and r.activation_decision='ACTIVE'
  and r.stripe_product_id is not null
  and r.stripe_price_id is not null
  and r.stripe_payment_link_id is not null
on conflict(canonical_sku,stripe_product_id) do update set
  stripe_price_id=excluded.stripe_price_id,
  stripe_livemode=true,
  sync_status='SYNCED_ACTIVE',
  source_service_id=excluded.source_service_id,
  last_synced_at=excluded.last_synced_at,
  notes=excluded.notes;

insert into public.dd_service_release_verifications
(canonical_sku,stripe_price_verified_at,verification_commit_sha,notes,updated_at)
select s.sku,now(),'stripe-live-audit-2026-09-22',
       'Live D04 Stripe product, price, metadata, amount, currency, billing mode, and active Payment Link reconciled to canonical service.',now()
from public.services s
where s.sku between 'DNI-04A-001' and 'DNI-04A-019'
on conflict(canonical_sku) do update set
  stripe_price_verified_at=excluded.stripe_price_verified_at,
  verification_commit_sha=excluded.verification_commit_sha,
  notes=excluded.notes,
  updated_at=now();

do $$
declare
  v_sync_count integer;
  v_payment_ready_count integer;
begin
  select count(distinct canonical_sku) into v_sync_count
  from public.dd_stripe_catalog_sync
  where canonical_sku between 'DNI-04A-001' and 'DNI-04A-019'
    and stripe_livemode=true
    and sync_status='SYNCED_ACTIVE';

  select count(*) into v_payment_ready_count
  from public.dd_service_release_contract_v1
  where canonical_sku between 'DNI-04A-001' and 'DNI-04A-019'
    and payment_ledger_ok=true;

  if v_sync_count <> 19 then
    raise exception 'D04 Stripe reconciliation expected 19 synced SKUs, found %', v_sync_count;
  end if;

  if v_payment_ready_count <> 19 then
    raise exception 'D04 payment ledger expected 19 ready SKUs, found %', v_payment_ready_count;
  end if;
end
$$;
