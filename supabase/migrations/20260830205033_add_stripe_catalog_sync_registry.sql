create table if not exists public.dd_stripe_catalog_sync (
  id uuid primary key default gen_random_uuid(),
  canonical_sku text not null,
  stripe_product_id text not null,
  stripe_price_id text,
  stripe_livemode boolean not null default true,
  sync_status text not null default 'SYNCED_INACTIVE_GATE_PENDING',
  source_service_id uuid references public.services(id) on delete set null,
  last_synced_at timestamptz not null default now(),
  notes text,
  unique(canonical_sku, stripe_product_id)
);
create index if not exists dd_stripe_catalog_sync_sku_idx on public.dd_stripe_catalog_sync(canonical_sku);