begin;
do $$ begin
  create type public.dd_portal_role as enum ('OWNER_OPERATOR','PROVIDER','CUSTOMER');
exception when duplicate_object then null; end $$;
create table if not exists public.dd_portal_user_roles (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 role public.dd_portal_role not null,
 provider_org_id uuid references public.dd_provider_organizations(id) on delete set null,
 is_active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(user_id,role)
);
commit;