create or replace function private.dd_request_is_provider_authority()
returns boolean language plpgsql stable security definer set search_path to 'public', 'pg_catalog'
as $$
declare
  v_role text := nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role';
  v_uid uuid := auth.uid();
begin
  return v_role is null
      or v_role = 'service_role'
      or (v_uid is not null and exists (
            select 1 from public.dd_portal_identities p
            where p.auth_user_id = v_uid and p.is_active and p.portal_role = 'staff_admin'))
      or private.dd_is_staff_admin();
end;
$$;
revoke all on function private.dd_request_is_provider_authority() from public, anon, authenticated;

create or replace function private.dd_guard_provider_application_authority()
returns trigger language plpgsql security definer set search_path to 'public', 'pg_catalog'
as $$
declare
  v_signed boolean;
begin
  if private.dd_request_is_provider_authority() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.tax_form_status := 'PENDING';
    new.insurance_status := 'NOT_REQUIRED';
    new.identity_status := 'PENDING';
    new.agreement_status := 'PENDING';
    new.background_check_status := 'NOT_STARTED';
    new.compliance_status := 'PENDING';
    new.network_access_level := 'NONE';
    new.provider_id := null;
    new.reviewed_at := null;
    new.reviewed_by := null;
    new.legacy_provider_code := null;
    new.dispatch_location_verified_at := null;
    if new.application_status not in ('DRAFT', 'SUBMITTED') then
      new.application_status := 'SUBMITTED';
    end if;
    return new;
  end if;
  new.applicant_user_id := old.applicant_user_id;
  new.source := old.source;
  new.background_check_status := old.background_check_status;
  new.compliance_status := old.compliance_status;
  new.network_access_level := old.network_access_level;
  new.provider_id := old.provider_id;
  new.reviewed_at := old.reviewed_at;
  new.reviewed_by := old.reviewed_by;
  new.legacy_provider_code := old.legacy_provider_code;
  new.dispatch_location_verified_at := old.dispatch_location_verified_at;
  if new.tax_form_status is distinct from old.tax_form_status
     and not (new.tax_form_status = 'RECEIVED' and old.tax_form_status in ('PENDING', 'REJECTED')) then
    new.tax_form_status := old.tax_form_status;
  end if;
  if new.identity_status is distinct from old.identity_status
     and not (new.identity_status = 'RECEIVED' and old.identity_status in ('PENDING', 'REJECTED')) then
    new.identity_status := old.identity_status;
  end if;
  if new.insurance_status is distinct from old.insurance_status
     and not (new.insurance_status = 'RECEIVED' and old.insurance_status in ('PENDING', 'NOT_REQUIRED', 'REJECTED')) then
    new.insurance_status := old.insurance_status;
  end if;
  if new.agreement_status is distinct from old.agreement_status then
    if new.agreement_status = 'EXECUTED' then
      select exists (
        select 1 from public.dd_provider_agreement_signatures s
        where s.application_id = old.id and s.signer_user_id = old.applicant_user_id
      ) into v_signed;
      if not coalesce(v_signed, false) then
        new.agreement_status := old.agreement_status;
      end if;
    elsif not (new.agreement_status = 'RECEIVED' and old.agreement_status in ('PENDING', 'REJECTED')) then
      new.agreement_status := old.agreement_status;
    end if;
  end if;
  if new.application_status is distinct from old.application_status
     and not (old.application_status in ('DRAFT', 'NEEDS_INFO') and new.application_status = 'SUBMITTED') then
    new.application_status := old.application_status;
  end if;
  return new;
end;
$$;

create or replace function private.dd_sync_application_agreement_from_signature()
returns trigger language plpgsql security definer set search_path to 'public', 'pg_catalog'
as $$
begin
  if new.application_id is not null then
    update public.dd_provider_applications a
       set agreement_status = 'EXECUTED', updated_at = now()
     where a.id = new.application_id
       and a.applicant_user_id = new.signer_user_id
       and a.agreement_status in ('PENDING', 'RECEIVED');
  end if;
  return new;
end;
$$;

create or replace function private.dd_guard_provider_w9_authority()
returns trigger language plpgsql security definer set search_path to 'public', 'pg_catalog'
as $$
declare
  v_uid uuid := auth.uid();
  v_app_org uuid;
begin
  if private.dd_request_is_provider_authority() then
    return new;
  end if;
  if tg_op = 'UPDATE' then
    new.status := old.status;
    new.verified_by := old.verified_by;
    new.verified_at := old.verified_at;
    new.provider_org_id := old.provider_org_id;
    new.provider_application_id := old.provider_application_id;
    new.auth_user_id := old.auth_user_id;
    return new;
  end if;
  new.status := 'SUBMITTED';
  new.verified_by := null;
  new.verified_at := null;
  if new.provider_application_id is not null then
    select p.org_id into v_app_org
      from public.dd_provider_applications a
      left join public.dd_providers p on p.id = a.provider_id
     where a.id = new.provider_application_id and a.applicant_user_id = v_uid;
    if not found then
      raise exception 'W9_APPLICATION_NOT_OWNED';
    end if;
  end if;
  if new.provider_org_id is not null
     and new.provider_org_id is distinct from v_app_org
     and new.provider_org_id is distinct from private.dd_current_org_id() then
    raise exception 'W9_PROVIDER_ORG_NOT_OWNED';
  end if;
  return new;
end;
$$;

create or replace function public.dd_portal_identity_strip_self_assigned_scope()
returns trigger language plpgsql security definer set search_path to 'public'
as $$
begin
  if auth.role() = 'authenticated'
     and coalesce(auth.jwt() -> 'app_metadata' ->> 'portal_role', '') not in ('staff_admin', 'admin', 'owner', 'staff') then
    new.entity_id := null;
    new.organization_id := null;
  end if;
  if new.portal_role = 'staff_admin' and not private.dd_request_is_provider_authority() then
    raise exception 'STAFF_ROLE_NOT_SELF_ASSIGNABLE';
  end if;
  return new;
end;
$$;

revoke all on function private.dd_guard_provider_application_authority() from public, anon, authenticated;
revoke all on function private.dd_sync_application_agreement_from_signature() from public, anon, authenticated;
revoke all on function private.dd_guard_provider_w9_authority() from public, anon, authenticated;

do $$
declare
  v_old text := pg_get_functiondef('public.dd_approve_provider_application(uuid,uuid)'::regprocedure);
  v_new text;
begin
  if position('on conflict (provider_id) where provider_id is not null do update' in v_old) > 0 then
    return;
  end if;
  v_new := replace(v_old, 'on conflict (provider_id) do update', 'on conflict (provider_id) where provider_id is not null do update');
  if v_new = v_old then
    raise exception 'APPROVAL_FUNCTION_SHAPE_CHANGED';
  end if;
  execute v_new;
end $$;