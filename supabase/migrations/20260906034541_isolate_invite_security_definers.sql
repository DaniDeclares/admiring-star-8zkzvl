create or replace function private.dd_resolve_apartment_resident_invite_impl(p_token_hash text)
returns table(invite_id uuid, property_id uuid, property_name text, property_address text, city text, state_code text, zip_code text, client_organization_id uuid, client_display_name text)
language sql
security definer
set search_path = public, pg_catalog
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

create or replace function public.dd_resolve_apartment_resident_invite(p_token_hash text)
returns table(invite_id uuid, property_id uuid, property_name text, property_address text, city text, state_code text, zip_code text, client_organization_id uuid, client_display_name text)
language sql
security invoker
set search_path = public, pg_catalog
as $$
  select * from private.dd_resolve_apartment_resident_invite_impl(p_token_hash);
$$;

create or replace function private.dd_consume_apartment_resident_invite_impl(p_token_hash text, p_portal_identity_id uuid, p_auth_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_property_id uuid;
  v_org_id uuid;
  v_invite_id uuid;
begin
  if (select auth.uid()) is null or (select auth.uid()) <> p_auth_user_id then return false; end if;
  if not exists (
    select 1 from public.dd_portal_identities pi
    where pi.id=p_portal_identity_id and pi.auth_user_id=p_auth_user_id
      and pi.portal_role='resident' and pi.is_active=true
      and pi.entity_id is null and pi.organization_id is null
  ) then return false; end if;
  select i.id,p.id,p.organization_id into v_invite_id,v_property_id,v_org_id
  from public.dd_property_resident_invites i
  join public.dd_client_properties p on p.id=i.property_id
  join public.dd_client_organizations o on o.id=p.organization_id
  where i.invite_token_hash=p_token_hash and i.status='ACTIVE'
    and p.status='ACTIVE' and p.resident_access_enabled=true
    and o.channel_code='CH02' and o.status='ACTIVE'
    and (i.expires_at is null or i.expires_at > now()) and i.uses < i.max_uses
  for update of i;
  if v_invite_id is null then return false; end if;
  update public.dd_portal_identities set entity_id=v_property_id, organization_id=v_org_id, updated_at=now()
  where id=p_portal_identity_id and auth_user_id=p_auth_user_id and portal_role='resident'
    and entity_id is null and organization_id is null;
  if not found then return false; end if;
  insert into public.dd_property_resident_access(portal_identity_id,property_id,client_organization_id,invited_by_user_id)
  values (p_portal_identity_id,v_property_id,v_org_id,null)
  on conflict (portal_identity_id) do update set property_id=excluded.property_id,
    client_organization_id=excluded.client_organization_id,status='ACTIVE',updated_at=now();
  update public.dd_property_resident_invites set uses=uses+1,
    status=case when uses+1 >= max_uses then 'EXHAUSTED' else 'ACTIVE' end, used_at=now()
  where id=v_invite_id;
  return true;
end;
$$;

create or replace function public.dd_consume_apartment_resident_invite(p_token_hash text, p_portal_identity_id uuid, p_auth_user_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
begin
  return private.dd_consume_apartment_resident_invite_impl(p_token_hash,p_portal_identity_id,p_auth_user_id);
end;
$$;

grant execute on function private.dd_resolve_apartment_resident_invite_impl(text) to public;
grant execute on function private.dd_consume_apartment_resident_invite_impl(text,uuid,uuid) to public;