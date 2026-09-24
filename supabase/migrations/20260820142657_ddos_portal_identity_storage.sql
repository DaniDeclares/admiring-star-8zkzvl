-- G10 — Portal identity, secure evidence storage, and operational access boundary.
create table if not exists public.dd_portal_identities (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique,
  portal_role text not null check (portal_role in ('provider','resident','customer','property_manager','procurement')),
  entity_id uuid,
  organization_id uuid,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_dd_portal_identities_role_entity on public.dd_portal_identities(portal_role, entity_id);
create index if not exists idx_dd_portal_identities_org on public.dd_portal_identities(organization_id);
alter table public.dd_portal_identities enable row level security;
insert into storage.buckets (id, name, public) values ('dd-job-evidence', 'dd-job-evidence', false) on conflict (id) do nothing;
create or replace function public.dd_portal_touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists trg_dd_portal_identities_updated_at on public.dd_portal_identities;
create trigger trg_dd_portal_identities_updated_at before update on public.dd_portal_identities for each row execute function public.dd_portal_touch_updated_at();
