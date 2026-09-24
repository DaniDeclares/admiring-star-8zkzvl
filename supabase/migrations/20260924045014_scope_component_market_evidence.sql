
create table if not exists public.dd_component_market_evidence (
 id uuid primary key default gen_random_uuid(),
 component_id uuid not null references public.dd_service_components(id) on delete restrict,
 price_version_id uuid references public.dd_component_price_versions(id) on delete restrict,
 source_name text not null, source_url text, market text,
 observed_price_cents integer check (observed_price_cents >= 0),
 observed_offer text not null,
 comparability text not null check (comparability in ('DIRECT','PARTIAL','CONTEXT_ONLY')),
 verification_status text not null check (verification_status in ('VERIFIED','SINGLE_SOURCE','UNVERIFIED','EXCLUDED')),
 verification_method text, observed_at date not null, notes text,
 created_at timestamptz not null default now()
);
comment on table public.dd_component_market_evidence is
 'Append-only external market evidence attached to components. Validates assumptions; never sets DANI prices. DANI own cost/time actuals govern prices.';
create index if not exists idx_dd_component_market_evidence_component on public.dd_component_market_evidence(component_id);
create index if not exists idx_dd_component_market_evidence_price_version on public.dd_component_market_evidence(price_version_id);
create or replace function public.dd_guard_market_evidence_append_only()
returns trigger language plpgsql set search_path = public as $$
begin raise exception 'MARKET_EVIDENCE_APPEND_ONLY: insert a correcting row instead'; end $$;
drop trigger if exists trg_dd_guard_market_evidence_append_only on public.dd_component_market_evidence;
create trigger trg_dd_guard_market_evidence_append_only before update or delete on public.dd_component_market_evidence
for each row execute function public.dd_guard_market_evidence_append_only();
alter table public.dd_component_market_evidence enable row level security;
