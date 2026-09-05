-- Portal authorization hardening.
-- Self-service identities may not self-assign organization/property/provider scope.
-- Apartment Resident scope is assigned only by verified invitation consumption.

DROP POLICY IF EXISTS portal_identity_self_update ON public.dd_portal_identities;
DROP POLICY IF EXISTS portal_identity_self_insert ON public.dd_portal_identities;

CREATE POLICY portal_identity_self_insert
ON public.dd_portal_identities
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = auth_user_id
  AND portal_role IN ('resident','customer','property_manager','procurement','provider')
  AND is_active = true
  AND entity_id IS NULL
  AND organization_id IS NULL
);

CREATE OR REPLACE FUNCTION public.dd_portal_identity_strip_self_assigned_scope()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  IF auth.role() = 'authenticated'
     AND coalesce(auth.jwt() -> 'app_metadata' ->> 'portal_role','') NOT IN ('staff_admin','admin','owner','staff') THEN
    NEW.entity_id := NULL;
    NEW.organization_id := NULL;
  END IF;
  return NEW;
end;
$function$;

DROP TRIGGER IF EXISTS dd_portal_identity_strip_self_assigned_scope ON public.dd_portal_identities;
CREATE TRIGGER dd_portal_identity_strip_self_assigned_scope
BEFORE INSERT ON public.dd_portal_identities
FOR EACH ROW
EXECUTE FUNCTION public.dd_portal_identity_strip_self_assigned_scope();

CREATE OR REPLACE FUNCTION public.dd_consume_apartment_resident_invite(
  p_token_hash text,
  p_portal_identity_id uuid,
  p_auth_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_property_id uuid;
  v_org_id uuid;
  v_invite_id uuid;
begin
  IF (SELECT auth.uid()) IS NULL OR (SELECT auth.uid()) <> p_auth_user_id THEN
    return false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.dd_portal_identities pi
    WHERE pi.id = p_portal_identity_id
      AND pi.auth_user_id = p_auth_user_id
      AND pi.portal_role = 'resident'
      AND pi.is_active = true
      AND pi.entity_id IS NULL
      AND pi.organization_id IS NULL
  ) THEN
    return false;
  END IF;

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

  update public.dd_portal_identities
  set entity_id=v_property_id,
      organization_id=v_org_id,
      updated_at=now()
  where id=p_portal_identity_id
    and auth_user_id=p_auth_user_id
    and portal_role='resident'
    and entity_id is null
    and organization_id is null;

  if not found then return false; end if;

  insert into public.dd_property_resident_access(portal_identity_id,property_id,client_organization_id,invited_by_user_id)
  values (p_portal_identity_id,v_property_id,v_org_id,null)
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
$function$;
