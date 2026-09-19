create table if not exists public.dd_service_markets (
 id uuid primary key default gen_random_uuid(),
 market_code text not null unique,
 market_name text not null,
 state_code text not null default 'GA',
 status text not null default 'PENDING_RECONCILIATION',
 pricing_zone_code text,
 dispatch_origin_code text,
 notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.dd_service_market_pricing_rules (
 id uuid primary key default gen_random_uuid(),
 market_id uuid not null references public.dd_service_markets(id) on delete restrict,
 service_id uuid references public.services(id) on delete restrict,
 channel_code text not null,
 subchannel_code text,
 pricing_rule_id uuid references public.dd_service_pricing_rules(id) on delete restrict,
 price_override_cents integer,
 status text not null default 'PENDING_RECONCILIATION',
 notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(market_id,service_id,channel_code,subchannel_code,pricing_rule_id)
);
create table if not exists public.dd_dispatch_origins (
 id uuid primary key default gen_random_uuid(),
 origin_code text not null unique,
 origin_name text not null,
 state_code text not null,
 address text,
 included_miles numeric,
 overage_rate_per_mile numeric,
 status text not null default 'PENDING_RECONCILIATION',
 notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
comment on table public.dd_service_markets is 'Authoritative market/location layer for DANI commercial and fulfillment geography; do not infer markets from provider evidence alone.';
comment on table public.dd_service_market_pricing_rules is 'Connects market + channel/subchannel + service to approved pricing rules or explicit overrides.';
comment on table public.dd_dispatch_origins is 'Authoritative dispatch-origin and mileage-rule layer; populated only from verified DANI decisions.';