-- CH01-B Apartment Resident access is only valid through an active CH02 client property.
-- A resident never self-selects a property or gains apartment-resident access merely by living in an apartment.

create table if not exists public.dd_client_organizations (
  id uuid primary key default gen_random_uuid(),
  relationship_type text not null default 'PROPERTY_MANAGER',
  channel_code text not null default 'CH02',
  legal_name text not null,
  display_name text,
  status text not null default 'ACTIVE' check (status in ('PROSPECT','ONBOARDING','ACTIVE','PAUSED','INACTIVE')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_dd_client_org_channel_status
  on public.dd_client_organizations(channel_code,status);

create table if not exists public.dd_client_properties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.dd_client_organizations(id) on delete restrict,
  property_name text not null,
  property_address text,
  city text,
  state_code text,
  zip_code text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','PAUSED','INACTIVE')),
  resident_access_enabled boolean not null default true,
  resident_access_label text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_dd_client_properties_org_status
  on public.dd_client_properties(organization_id,status);

create table if not exists public.dd_property_resident_invites (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.dd_client_properties(id) on delete cascade,
  invite_token_hash text not null unique,
  invited_email text,
  expires_at timestamptz,
  max_uses integer not null default 1,
  uses integer not null default 0,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','EXHAUSTED','EXPIRED','REVOKED')),
  created_by_user_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  used_at timestamptz
);

create index if not exists idx_dd_property_invites_property_status
  on public.dd_property_resident_invites(property_id,status);

create table if not exists public.dd_property_resident_access (
  id uuid primary key default gen_random_uuid(),
  portal_identity_id uuid not null unique references public.dd_portal_identities(id) on delete cascade,
  property_id uuid not null references public.dd_client_properties(id) on delete restrict,
  client_organization_id uuid not null references public.dd_client_organizations(id) on delete restrict,
  status text not null default 'ACTIVE' check (status in ('PENDING','ACTIVE','SUSPENDED','ENDED')),
  invited_by_user_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_dd_property_resident_access_property
  on public.dd_property_resident_access(property_id,status);
create index if not exists idx_dd_property_resident_access_org
  on public.dd_property_resident_access(client_organization_id,status);

alter table public.dd_client_organizations enable row level security;
alter table public.dd_client_properties enable row level security;
alter table public.dd_property_resident_invites enable row level security;
alter table public.dd_property_resident_access enable row level security;

-- Public signup does not get direct table access. Staff/server-side workflows create
-- client properties and resident invitations; residents only receive a bound access
-- relationship after a valid invitation is consumed.

create or replace function public.dd_resolve_apartment_resident_invite(p_token_hash text)
returns table (
  invite_id uuid,
  property_id uuid,
  property_name text,
  property_address text,
  city text,
  state_code text,
  zip_code text,
  client_organization_id uuid,
  client_display_name text
)
language sql
security definer
set search_path = public
as $$
  select i.id, p.id, p.property_name, p.property_address, p.city, p.state_code, p.zip_code,
         o.id, coalesce(o.display_name,o.legal_name)
  from public.dd_property_resident_invites i
  join public.dd_client_properties p on p.id=i.property_id
  join public.dd_client_organizations o on o.id=p.organization_id
  where i.invite_token_hash=p_token_hash
    and i.status='ACTIVE'
    and p.status='ACTIVE'
    and p.resident_access_enabled=true
    and o.channel_code='CH02'
    and o.status='ACTIVE'
    and (i.expires_at is null or i.expires_at > now())
    and i.uses < i.max_uses;
$$;

grant execute on function public.dd_resolve_apartment_resident_invite(text) to anon, authenticated;

create or replace function public.dd_consume_apartment_resident_invite(
  p_token_hash text,
  p_portal_identity_id uuid,
  p_auth_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_property_id uuid;
  v_org_id uuid;
  v_invite_id uuid;
begin
  select i.id,p.id,p.organization_id
    into v_invite_id,v_property_id,v_org_id
  from public.dd_property_resident_invites i
  join public.dd_client_properties p on p.id=i.property_id
  join public.dd_client_organizations o on o.id=p.organization_id
  where i.invite_token_hash=p_token_hash
    and i.status='ACTIVE'
    and p.status='ACTIVE'
    and p.resident_access_enabled=true
    and o.channel_code='CH02'
    and o.status='ACTIVE'
    and (i.expires_at is null or i.expires_at > now())
    and i.uses < i.max_uses
  for update of i;

  if v_invite_id is null then return false; end if;

  insert into public.dd_property_resident_access(portal_identity_id,property_id,client_organization_id,invited_by_user_id)
  values (p_portal_identity_id,v_property_id,v_org_id,p_auth_user_id)
  on conflict (portal_identity_id) do update
    set property_id=excluded.property_id,
        client_organization_id=excluded.client_organization_id,
        status='ACTIVE',
        updated_at=now();

  update public.dd_property_resident_invites
    set uses=uses+1,
        status=case when uses+1 >= max_uses then 'EXHAUSTED' else 'ACTIVE' end,
        used_at=now()
  where id=v_invite_id;

  return true;
end;
$$;

grant execute on function public.dd_consume_apartment_resident_invite(text,uuid,uuid) to authenticated;
