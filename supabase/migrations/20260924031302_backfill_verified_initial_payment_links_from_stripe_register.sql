
insert into public.dd_service_initial_payment_links(
  canonical_sku,stripe_price_id,stripe_payment_link_id,initial_payment_percent,
  initial_amount_cents,currency,verified_at,source,notes,created_at,updated_at
)
select g.canonical_sku,
       s.stripe_price_id,
       s.stripe_payment_link_id,
       53.50,
       round(min(r.base_price_cents) * 0.535)::integer,
       lower(min(r.currency)),
       s.last_verified_at,
       'STRIPE_LAUNCH_REGISTER_RECONCILIATION',
       'Backfilled 2026-09-23 from ACTIVE Stripe launch register with verified payment-link ID; initial amount derived from governed active base price and 53.5% payment policy.',
       now(),now()
from public.dd_governed_service_offers g
join public.dd_stripe_launch_register s on s.canonical_sku=g.canonical_sku
join public.dd_service_pricing_rules r on r.service_id=g.runtime_service_id and r.status='ACTIVE'
left join public.dd_service_initial_payment_links p on p.canonical_sku=g.canonical_sku
where g.canonical_sku in ('DNI-01C-002','DNI-01C-003','DNI-01C-005','DNI-01C-006','DNI-01D-008','DNI-01D-009','DNI-01D-010','DNI-01D-011','DNI-01D-013')
  and p.canonical_sku is null
  and s.activation_decision='ACTIVE'
  and s.checkout_mode='PAYMENT_LINK_INITIAL_53_5'
  and s.pricing_status='STRIPE_INITIAL_53_5_ACTIVE'
  and s.stripe_price_id is not null
  and s.stripe_payment_link_id is not null
  and s.last_verified_at is not null
group by g.canonical_sku,s.stripe_price_id,s.stripe_payment_link_id,s.last_verified_at;
