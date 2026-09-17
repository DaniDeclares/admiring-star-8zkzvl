-- Completes the apartment-resident invite loop. dd_resolve_apartment_resident_invite
-- and dd_consume_apartment_resident_invite already exist and are fully wired
-- (verified: consuming an invite sets dd_portal_identities.organization_id and
-- inserts a durable dd_property_resident_access row), but nothing could ever
-- create an invite in the first place -- dd_property_resident_invites has zero
-- rows and no property-manager-facing UI or RPC existed to populate it.
CREATE OR REPLACE FUNCTION public.dd_create_apartment_resident_invite(
  p_property_id uuid,
  p_max_uses int DEFAULT 1,
  p_expires_at timestamptz DEFAULT NULL,
  p_invited_email text DEFAULT NULL
) RETURNS TABLE(invite_id uuid, raw_token text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pg_catalog'
AS $function$
declare
  v_org_id uuid;
  v_caller uuid;
  v_token text;
  v_hash text;
  v_id uuid;
begin
  v_caller := auth.uid();
  if v_caller is null then raise exception 'Authentication required'; end if;

  select p.organization_id into v_org_id
  from public.dd_client_properties p
  where p.id = p_property_id and p.status = 'ACTIVE' and p.resident_access_enabled = true;
  if v_org_id is null then
    raise exception 'Property not found, inactive, or not enabled for resident access';
  end if;

  if not exists (
    select 1 from public.dd_portal_identities pi
    where pi.auth_user_id = v_caller and pi.portal_role = 'property_manager'
      and pi.is_active = true and pi.organization_id = v_org_id
  ) then
    raise exception 'Not authorized to invite residents for this property';
  end if;

  v_token := encode(gen_random_bytes(24), 'hex');
  v_hash := encode(digest(v_token, 'sha256'), 'hex');

  insert into public.dd_property_resident_invites
    (property_id, invite_token_hash, invited_email, expires_at, max_uses, created_by_user_id)
  values
    (p_property_id, v_hash, nullif(trim(coalesce(p_invited_email, '')), ''), p_expires_at, greatest(1, coalesce(p_max_uses, 1)), v_caller)
  returning id into v_id;

  return query select v_id, v_token;
end;
$function$;

CREATE OR REPLACE FUNCTION public.dd_list_property_resident_invites(p_property_id uuid)
RETURNS TABLE(id uuid, invited_email text, expires_at timestamptz, max_uses int, uses int, status text, created_at timestamptz, used_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pg_catalog'
AS $function$
declare
  v_org_id uuid;
  v_caller uuid;
begin
  v_caller := auth.uid();
  if v_caller is null then raise exception 'Authentication required'; end if;
  select p.organization_id into v_org_id from public.dd_client_properties p where p.id = p_property_id;
  if v_org_id is null or not exists (
    select 1 from public.dd_portal_identities pi
    where pi.auth_user_id = v_caller and pi.portal_role = 'property_manager'
      and pi.is_active = true and pi.organization_id = v_org_id
  ) then
    raise exception 'Not authorized to view invites for this property';
  end if;
  return query
    select i.id, i.invited_email, i.expires_at, i.max_uses, i.uses, i.status, i.created_at, i.used_at
    from public.dd_property_resident_invites i
    where i.property_id = p_property_id
    order by i.created_at desc;
end;
$function$;
