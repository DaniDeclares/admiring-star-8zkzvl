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