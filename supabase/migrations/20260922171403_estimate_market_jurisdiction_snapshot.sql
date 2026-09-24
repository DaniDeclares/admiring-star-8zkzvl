alter table public.dd_estimates
  add column if not exists market_id uuid references public.dd_service_markets(id),
  add column if not exists market_code text,
  add column if not exists jurisdiction_snapshot jsonb not null default '{}'::jsonb;

create index if not exists dd_estimates_market_id_idx on public.dd_estimates(market_id);
create index if not exists dd_estimates_market_code_idx on public.dd_estimates(market_code);

comment on column public.dd_estimates.market_id is
'Internal market selected from the customer/service location for pricing, compliance and profitability analysis. Not a public price-list selector.';
comment on column public.dd_estimates.jurisdiction_snapshot is
'Frozen internal state/locality/market resolution used when the estimate was priced; public customer presentation may remain unified.';
