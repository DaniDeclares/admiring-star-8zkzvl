-- Provider approval -> fulfillment activation transaction.
-- Owner/staff review happens in the application layer; this function is callable only by the server service-role client.
-- It atomically promotes an approved provider application into an active provider organization,
-- provider identity, authorized canonical service capabilities, and capacity profile.

create or replace function public.dd_approve_provider_application(p_application_id uuid, p_actor_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  a public.dd_provider_applications%rowtype;
  org_id uuid;
  provider_id uuid;
  identity_id uuid;
  cap_count integer := 0;
  verified_cap_count integer := 0;
  required_doc_count integer := 0;
  verified_doc_count integer := 0;
  provider_name text;
  result jsonb;
begin
  if p_application_id is null or p_actor_id is null then
    raise exception 'APPLICATION_AND_ACTOR_REQUIRED';
  end if;

  select * into a
  from public.dd_provider_applications
  where id = p_application_id
  for update;

  if not found then raise exception 'APPLICATION_NOT_FOUND'; end if;

  if a.application_status not in ('SUBMITTED','UNDER_REVIEW','NEEDS_INFO') then
    raise exception 'APPLICATION_NOT_REVIEWABLE:%', a.application_status;
  end if;

  if coalesce(a.tax_form_status,'PENDING') not in ('VERIFIED','NOT_REQUIRED') then
    raise exception 'TAX_DOCUMENT_NOT_VERIFIED';
  end if;
  if coalesce(a.insurance_status,'NOT_REQUIRED') not in ('VERIFIED','NOT_REQUIRED') then
    raise exception 'INSURANCE_NOT_VERIFIED';
  end if;
  if coalesce(a.identity_status,'PENDING') <> 'VERIFIED' then
    raise exception 'IDENTITY_NOT_VERIFIED';
  end if;
  if coalesce(a.agreement_status,'PENDING') <> 'EXECUTED' then
    raise exception 'AGREEMENT_NOT_EXECUTED';
  end if;
  if coalesce(a.background_check_status,'NOT_STARTED') not in ('CLEARED','NOT_REQUIRED') then
    raise exception 'BACKGROUND_CHECK_NOT_CLEARED';
  end if;
  if coalesce(a.compliance_status,'PENDING') <> 'VERIFIED' then
    raise exception 'APPLICATION_COMPLIANCE_NOT_VERIFIED';
  end if;

  select count(*) into cap_count
  from public.dd_provider_application_capabilities
  where application_id = a.id
    and canonical_service_id is not null;

  if cap_count = 0 then raise exception 'NO_CANONICAL_CAPABILITIES_SELECTED'; end if;

  select count(*) into verified_cap_count
  from public.dd_provider_application_capabilities
  where application_id = a.id
    and canonical_service_id is not null
    and authorization_status = 'AUTHORIZED'
    and evidence_status = 'VERIFIED'
    and requirement_status in ('VERIFIED','NOT_REQUIRED');

  if verified_cap_count <> cap_count then
    raise exception 'CAPABILITY_REVIEW_INCOMPLETE:%/%', verified_cap_count, cap_count;
  end if;

  select count(*) into required_doc_count
  from public.dd_provider_application_documents d
  where d.application_id = a.id
    and d.document_type in ('GOVERNMENT_ID','W9','COI','BUSINESS_REGISTRATION','PROFESSIONAL_LICENSE','CERTIFICATION','AUTO_INSURANCE','BACKGROUND_CONSENT','AGREEMENT')
    and exists (
      select 1 from public.dd_provider_application_capabilities c
      where c.application_id = a.id
        and c.requires_license = true
    );

  -- If documents are present for the application, none of the required compliance documents may remain unverified.
  select count(*) into verified_doc_count
  from public.dd_provider_application_documents d
  where d.application_id = a.id
    and d.verification_status = 'VERIFIED';

  if exists (select 1 from public.dd_provider_application_documents d where d.application_id = a.id and d.verification_status in ('PENDING','REJECTED','EXPIRED')) then
    raise exception 'APPLICATION_DOCUMENTS_NOT_CLEAR';
  end if;

  provider_name := coalesce(nullif(a.dba_name,''), nullif(a.legal_name,''), trim(coalesce(a.contact_first_name,'') || ' ' || coalesce(a.contact_last_name,'')));

  select id into org_id
  from public.dd_provider_organizations
  where internal_alias = ('app-' || replace(a.id::text,'-',''))
  limit 1;

  if org_id is null then
    insert into public.dd_provider_organizations (
      name, vendor_type, is_active, internal_alias, legal_name,
      compliance_status, accepts_new_work, capacity_status, agreement_status,
      compliance_verified_at, network_access_level, commercial_relationship_type,
      primary_contact_name, website, capability_summary, services_evidence,
      qualification_status, permission_status, source_reference, operating_rule
    ) values (
      provider_name,
      case when a.applicant_type = 'BUSINESS' then 'PARTNER' else 'INDIVIDUAL' end,
      true,
      'app-' || replace(a.id::text,'-',''),
      a.legal_name,
      'VERIFIED',
      true,
      'AVAILABLE',
      'ACTIVE',
      now(),
      'AUTHORIZED',
      'PROVIDER',
      trim(coalesce(a.contact_first_name,'') || ' ' || coalesce(a.contact_last_name,'')),
      a.website,
      a.service_notes,
      'Approved from provider application ' || a.id::text,
      'QUALIFIED',
      'AUTHORIZED',
      'PROVIDER_APPLICATION:' || a.id::text,
      'Fulfillment-only provider authorization; DANI DECLARES retains customer, pricing and marketing authority.'
    ) returning id into org_id;
  else
    update public.dd_provider_organizations
    set is_active=true, compliance_status='VERIFIED', accepts_new_work=true,
        capacity_status='AVAILABLE', agreement_status='ACTIVE', compliance_verified_at=now(),
        network_access_level='AUTHORIZED', qualification_status='QUALIFIED', permission_status='AUTHORIZED',
        updated_at=now()
    where id=org_id;
  end if;

  select id into provider_id from public.dd_providers where org_id=org_id order by created_at asc limit 1;
  if provider_id is null then
    insert into public.dd_providers (org_id, first_name, last_name, is_active, provider_code, contact_name, role_title)
    values (org_id, a.contact_first_name, a.contact_last_name, true, 'APP-' || upper(substr(replace(a.id::text,'-',''),1,10)), provider_name, 'Authorized DANI DECLARES Provider')
    returning id into provider_id;
  else
    update public.dd_providers set is_active=true, updated_at=now() where id=provider_id;
  end if;

  -- Replace only the application-generated service capability rows for this provider org.
  delete from public.dd_provider_capabilities where provider_org_id=org_id;
  insert into public.dd_provider_capabilities (provider_id, provider_org_id, service_id, service_line, capability_key, is_authorized, tier_availability)
  select provider_id, org_id, c.canonical_service_id, coalesce(s.name,c.capability_description), c.capability_key, true,
         jsonb_build_object('source','PROVIDER_APPLICATION','application_id',a.id,'authorized_at',now())
  from public.dd_provider_application_capabilities c
  join public.services s on s.id=c.canonical_service_id
  where c.application_id=a.id
    and c.canonical_service_id is not null
    and c.authorization_status='AUTHORIZED'
    and c.evidence_status='VERIFIED'
    and c.requirement_status in ('VERIFIED','NOT_REQUIRED');

  insert into public.dd_provider_capacity_profiles (provider_id, provider_org_id, max_jobs_per_day, max_concurrent_jobs, max_hours_per_day, crew_size, capacity_status, activated_at, current_jobs, current_hours, notes)
  values (provider_id, org_id, 1, 1, 8, 1, 'ACTIVE', now(), 0, 0, 'Activated by provider application approval; staff may tune capacity before first dispatch.')
  on conflict (provider_id) do update set provider_org_id=excluded.provider_org_id, capacity_status='ACTIVE', activated_at=coalesce(public.dd_provider_capacity_profiles.activated_at,now()), updated_at=now();

  select id into identity_id from public.dd_portal_identities where auth_user_id=a.applicant_user_id limit 1;
  if identity_id is not null then
    update public.dd_portal_identities
    set portal_role='provider', entity_id=provider_id, is_active=true, updated_at=now()
    where id=identity_id;
  end if;

  update public.dd_provider_applications
  set application_status='APPROVED', reviewed_at=now(), reviewed_by=p_actor_id,
      network_access_level='AUTHORIZED', qualification_status='APPROVED', compliance_status='VERIFIED',
      updated_at=now()
  where id=a.id;

  insert into public.dd_provider_application_events (application_id,event_type,from_status,to_status,actor_id,notes)
  values (a.id,'APPROVED_AND_ACTIVATED',a.application_status,'APPROVED',p_actor_id,
          'Provider organization, provider identity, authorized service capabilities and initial capacity profile activated atomically.');

  insert into public.dd_commercial_authority (provider_org_id, authorization_basis, effective_date, is_active)
  values (org_id, 'APPROVED_PROVIDER_APPLICATION:' || a.id::text, current_date, true)
  on conflict (provider_org_id) do update set authorization_basis=excluded.authorization_basis, effective_date=excluded.effective_date, is_active=true, updated_at=now();

  result := jsonb_build_object(
    'application_id',a.id,
    'provider_org_id',org_id,
    'provider_id',provider_id,
    'portal_identity_id',identity_id,
    'authorized_service_count',cap_count,
    'status','APPROVED_AND_ACTIVATED'
  );
  return result;
end;
$$;

revoke all on function public.dd_approve_provider_application(uuid,uuid) from public;
revoke all on function public.dd_approve_provider_application(uuid,uuid) from anon;
revoke all on function public.dd_approve_provider_application(uuid,uuid) from authenticated;
grant execute on function public.dd_approve_provider_application(uuid,uuid) to service_role;
