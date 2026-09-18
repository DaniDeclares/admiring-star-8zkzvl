-- When someone signs up through the self-serve portal wizard with an email that
-- matches an existing, active, already-authorized dd_provider_organizations
-- contact_email, link their new portal identity straight to that real provider
-- record instead of leaving them stranded as a disconnected new applicant.
-- This is exactly the gap that hit Christopher Walker (authorized directly by
-- staff via migration, no application on file, so his first real signup created
-- an orphaned identity with no active-provider link).
--
-- Runs as an AFTER INSERT trigger that performs a separate UPDATE, not a BEFORE
-- INSERT trigger that rewrites NEW: the portal_identity_self_insert RLS policy's
-- WITH CHECK requires entity_id IS NULL on the row as inserted, and Postgres
-- evaluates WITH CHECK against the row *after* BEFORE triggers run, so a BEFORE
-- trigger setting entity_id would make every self-service signup violate its own
-- insert policy. The function is SECURITY DEFINER (owned by a role that bypasses
-- RLS) so the follow-up UPDATE isn't blocked by the absence of any self-service
-- UPDATE policy on this table.
create or replace function public.dd_link_provider_portal_identity()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $function$
declare
  v_user_email text;
  v_provider_id uuid;
begin
  if new.portal_role <> 'provider' or new.entity_id is not null then
    return new;
  end if;

  select email into v_user_email from auth.users where id = new.auth_user_id;
  if v_user_email is null then return new; end if;

  select p.id into v_provider_id
  from public.dd_provider_organizations o
  join public.dd_providers p on p.org_id = o.id and p.is_active = true
  where o.is_active = true and lower(o.contact_email) = lower(v_user_email)
  order by p.created_at asc
  limit 1;

  if v_provider_id is not null then
    update public.dd_portal_identities set entity_id = v_provider_id, updated_at = now() where id = new.id;
  end if;
  return new;
end;
$function$;

drop trigger if exists trg_link_provider_portal_identity on public.dd_portal_identities;
create trigger trg_link_provider_portal_identity
after insert on public.dd_portal_identities
for each row execute function public.dd_link_provider_portal_identity();
