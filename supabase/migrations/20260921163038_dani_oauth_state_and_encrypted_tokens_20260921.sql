begin;

create table if not exists public.dd_integration_oauth_states (
  id uuid primary key default gen_random_uuid(),
  adapter_code text not null references public.dd_integration_adapters(adapter_code) on delete cascade,
  auth_user_id uuid not null,
  environment text not null default 'PRODUCTION' check (environment in ('SANDBOX','STAGING','PRODUCTION')),
  state_hash text not null unique,
  code_verifier_ciphertext text,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists dd_integration_oauth_states_expiry_idx on public.dd_integration_oauth_states(expires_at);

alter table public.dd_integration_connections
  add column if not exists access_token_ciphertext text,
  add column if not exists refresh_token_ciphertext text,
  add column if not exists token_expires_at timestamptz,
  add column if not exists token_metadata jsonb not null default '{}'::jsonb;

alter table public.dd_integration_oauth_states enable row level security;
revoke all on public.dd_integration_oauth_states from anon, authenticated;
grant select, insert, update, delete on public.dd_integration_oauth_states to service_role;

commit;
