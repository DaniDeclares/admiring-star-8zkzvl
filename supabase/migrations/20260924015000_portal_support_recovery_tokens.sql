create table if not exists public.dd_portal_recovery_tokens (
 id uuid primary key default gen_random_uuid(), auth_user_id uuid not null references auth.users(id) on delete cascade,
 token_hash text not null unique, purpose text not null default 'PASSWORD_RECOVERY' check (purpose='PASSWORD_RECOVERY'),
 expires_at timestamptz not null, used_at timestamptz, created_at timestamptz not null default now());
alter table public.dd_portal_recovery_tokens enable row level security;
revoke all on public.dd_portal_recovery_tokens from anon, authenticated;
create index if not exists dd_portal_recovery_tokens_active_idx on public.dd_portal_recovery_tokens(auth_user_id,expires_at) where used_at is null;
comment on table public.dd_portal_recovery_tokens is 'Server-only one-time support recovery tokens for portal accounts when email-provider link rewriting/prefetch prevents Supabase recovery verification.';