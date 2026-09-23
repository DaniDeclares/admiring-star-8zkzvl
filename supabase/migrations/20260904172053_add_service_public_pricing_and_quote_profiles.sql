alter table public.services
  add column if not exists public_price_low numeric(12,2),
  add column if not exists public_price_high numeric(12,2),
  add column if not exists public_price_display text,
  add column if not exists quote_input_schema jsonb,
  add column if not exists quote_engine_version text default 'v1';

comment on column public.services.public_price_low is 'Customer-facing lower bound; may be channel/market specific in pricing rules.';
comment on column public.services.public_price_high is 'Customer-facing upper bound when a range is appropriate.';
comment on column public.services.public_price_display is 'Customer-facing starting-at/range text; not provider payout.';
comment on column public.services.quote_input_schema is 'Structured inputs required by the internal quote workflow; not a duplicate service record.';
comment on column public.services.quote_engine_version is 'Version of internal quote input/logic contract.';

create index if not exists idx_services_public_pricing on public.services (is_active, commercial_status, starting_price);
