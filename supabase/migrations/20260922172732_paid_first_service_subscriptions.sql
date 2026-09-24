create table if not exists public.dd_service_subscriptions (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references public.service_requests(id) on delete restrict,
  estimate_id uuid references public.dd_estimates(id) on delete restrict,
  service_id uuid references public.services(id) on delete restrict,
  canonical_sku text not null,
  stripe_checkout_session_id text unique,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  latest_stripe_invoice_id text,
  subscription_status text not null default 'CHECKOUT_CREATED',
  first_payment_verified_at timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  raw_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(service_request_id, canonical_sku)
);
create index if not exists dd_service_subscriptions_request_idx on public.dd_service_subscriptions(service_request_id);
create index if not exists dd_service_subscriptions_invoice_idx on public.dd_service_subscriptions(latest_stripe_invoice_id);
comment on table public.dd_service_subscriptions is 'Governed recurring-service lifecycle. Subscription Checkout is not fulfillment authority; first and renewal fulfillment require successful paid invoice evidence.';
