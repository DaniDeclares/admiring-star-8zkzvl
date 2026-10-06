-- Provider signup must never grant dispatch authority from browser-supplied state.
-- Applicants may select capabilities; DANI staff/server remains authorization authority.

create or replace function private.dd_guard_provider_capability_authority()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_catalog'
as $function$
declare
  v_role text := nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role';
  v_uid uuid := auth.uid();
  v_trusted boolean;
begin
  v_trusted := v_role is null or v_role = 'service_role'
    or (v_uid is not null and exists (
      select 1
      from public.dd_portal_identities p
      where p.auth_user_id = v_uid
        and p.is_active
        and p.portal_role = 'staff_admin'
    ));

  if v_trusted then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.authorization_status := case when new.requires_license then 'GATED' else 'PENDING_REVIEW' end;
    new.evidence_status := 'PENDING';
    new.requirement_status := 'PENDING';
  else
    new.authorization_status := old.authorization_status;
    new.evidence_status := old.evidence_status;
    new.requirement_status := old.requirement_status;
    new.requires_license := old.requires_license;
  end if;

  return new;
end;
$function$;

revoke all on function private.dd_guard_provider_capability_authority() from public, anon, authenticated;

drop trigger if exists dd_guard_provider_capability_authority on public.dd_provider_application_capabilities;
create trigger dd_guard_provider_capability_authority
before insert or update on public.dd_provider_application_capabilities
for each row execute function private.dd_guard_provider_capability_authority();
