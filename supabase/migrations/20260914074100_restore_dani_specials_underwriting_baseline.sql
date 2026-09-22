begin;
create table if not exists public.dd_dani_specials_underwriting_register(
 id uuid primary key default gen_random_uuid(), special_id text not null unique, legacy_service_id text not null, legacy_name text not null,
 family text, market text, legacy_price numeric, active boolean not null, canonical_sku text, canonical_name text,
 mapping_status text not null, underwriting_status text not null, commercial_authority text not null, evidence_basis text not null,
 blocker text, reviewed_at timestamptz not null default now(), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.dd_dani_specials_underwriting_register enable row level security;
commit;