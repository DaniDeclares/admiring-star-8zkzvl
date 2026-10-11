
insert into public.dd_service_initial_payment_links(
  canonical_sku,stripe_price_id,stripe_payment_link_id,initial_payment_percent,
  initial_amount_cents,currency,verified_at,source,notes,created_at,updated_at
)
values(
  'DNI-08A-019',
  'price_1UNijwChHm1uJK9xmI0LQBAT',
  'plink_1UNikMChHm1uJK9xPTHylZqY',
  53.50,
  40125,
  'usd',
  now(),
  'STRIPE_LIVE_API',
  'Live Stripe read-back verified 2026-10-06; catalog starting_price=$750.00; 53.5% initial payment=$401.25.',
  now(),
  now()
)
on conflict(canonical_sku) do update
set stripe_price_id=excluded.stripe_price_id,
    stripe_payment_link_id=excluded.stripe_payment_link_id,
    initial_payment_percent=excluded.initial_payment_percent,
    initial_amount_cents=excluded.initial_amount_cents,
    currency=excluded.currency,
    verified_at=excluded.verified_at,
    source=excluded.source,
    notes=excluded.notes,
    updated_at=now();

insert into public.dd_stripe_launch_register(
  canonical_sku,service_name,commercial_status,pricing_status,fulfillment_status,
  stripe_product_id,stripe_price_id,stripe_payment_link_id,checkout_mode,
  source_authority,activation_decision,blockers,last_verified_at
)
values(
  'DNI-08A-019',
  'Business Expansion Plan',
  'SELL_NOW',
  'STRIPE_PRICE_ACTIVE',
  'READY',
  'prod_VOVlO4lzerqOtL',
  'price_1UNijwChHm1uJK9xmI0LQBAT',
  'plink_1UNikMChHm1uJK9xPTHylZqY',
  'PAYMENT_LINK',
  'Stripe live object creation + live read-back verification 2026-10-06',
  'ACTIVE',
  null,
  now()
)
on conflict(canonical_sku) do update
set service_name=excluded.service_name,
    commercial_status=excluded.commercial_status,
    pricing_status=excluded.pricing_status,
    fulfillment_status=excluded.fulfillment_status,
    stripe_product_id=excluded.stripe_product_id,
    stripe_price_id=excluded.stripe_price_id,
    stripe_payment_link_id=excluded.stripe_payment_link_id,
    checkout_mode=excluded.checkout_mode,
    source_authority=excluded.source_authority,
    activation_decision=excluded.activation_decision,
    blockers=null,
    last_verified_at=excluded.last_verified_at;

insert into public.dd_stripe_catalog_sync(
  canonical_sku,stripe_product_id,stripe_price_id,stripe_livemode,sync_status,
  source_service_id,last_synced_at,notes
)
values(
  'DNI-08A-019',
  'prod_VOVlO4lzerqOtL',
  'price_1UNijwChHm1uJK9xmI0LQBAT',
  true,
  'SYNCED_ACTIVE',
  'a466d8dd-598d-47c0-877c-790784bc5fcf',
  now(),
  'Live Stripe product, one-time USD 53.5% initial-payment price, and active Payment Link verified 2026-10-06.'
)
on conflict(canonical_sku,stripe_product_id) do update
set stripe_price_id=excluded.stripe_price_id,
    stripe_livemode=true,
    sync_status='SYNCED_ACTIVE',
    source_service_id=excluded.source_service_id,
    last_synced_at=excluded.last_synced_at,
    notes=excluded.notes;

insert into public.dd_service_release_verifications(
  canonical_sku,stripe_price_verified_at,verification_commit_sha,notes,updated_at
)
values(
  'DNI-08A-019',
  now(),
  'ec9c7d7eeb0259746c86c9da6cf2ae06292aaa4b',
  '2026-10-06 live Stripe verification: product prod_VOVlO4lzerqOtL, active live price price_1UNijwChHm1uJK9xmI0LQBAT for $401.25, and active Payment Link plink_1UNikMChHm1uJK9xPTHylZqY matched catalog total $750.00 and 53.5% initial-payment policy.',
  now()
)
on conflict(canonical_sku) do update
set stripe_price_verified_at=excluded.stripe_price_verified_at,
    verification_commit_sha=excluded.verification_commit_sha,
    notes=concat_ws(E'\n',nullif(public.dd_service_release_verifications.notes,''),excluded.notes),
    updated_at=now();
