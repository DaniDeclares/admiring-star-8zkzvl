-- Provider approval -> fulfillment activation transaction.
-- Approval remains staff-controlled and fail-closed. This function is callable only by service_role.

create or replace function public.dd_approve_provider_application(p_application_id uuid, p_actor_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  a public.dd_provider_applications%rowtype;
  v_org_id uuid;
  v_provider_id uuid;
  v_identity_id uuid;
  v_cap_count integer := 0;
  v_verified_cap_count integer := 0;
  v_provider_name text;
begin
  if p_application_id is null or p_actor_id is null then raise exception 'APPLICATION_AND_ACTOR_REQUIRED'; end if;
  select * into a from public.dd_provider_applications where id=p_application_id for update;
  if not found then raise exception 'APPLICATION_NOT_FOUND'; end if;
  if a.application_status not in ('SUBMITTED','UNDER_REVIEW','NEEDS_INFO') then raise exception 'APPLICATION_NOT_REVIEWABLE:%',a.application_status; end if;
  if coalesce(a.tax_form_status,'PENDING') not in ('VERIFIED','NOT_REQUIRED') then raise exception 'TAX_DOCUMENT_NOT_VERIFIED'; end if;
  if coalesce(a.insurance_status,'NOT_REQUIRED') not in ('VERIFIED','NOT_REQUIRED') then raise exception 'INSURANCE_NOT_VERIFIED'; end if;
  if coalesce(a.identity_status,'PENDING') <> 'VERIFIED' then raise exception 'IDENTITY_NOT_VERIFIED'; end if;
  if coalesce(a.agreement_status,'PENDING') <> 'EXECUTED' then raise exception 'AGREEMENT_NOT_EXECUTED'; end if;
  if coalesce(a.background_check_status,'NOT_STARTED') not in ('CLEARED','NOT_REQUIRED') then raise exception 'BACKGROUND_CHECK_NOT_CLEARED'; end if;
  if coalesce(a.compliance_status,'PENDING') <> 'VERIFIED' then raise exception 'APPLICATION_COMPLIANCE_NOT_VERIFIED'; end if;
  select count(*) into v_cap_count from public.dd_provider_application_capabilities c where c.application_id=a.id and c.canonical_service_id is not null;
  if v_cap_count=0 then raise exception 'NO_CANONICAL_CAPABILITIES_SELECTED'; end if;
  select count(*) into v_verified_cap_count from public.dd_provider_application_capabilities c where c.application_id=a.id and c.canonical_service_id is not null and c.authorization_status='AUTHORIZED' and c.evidence_status='VERIFIED' and c.requirement_status in ('VERIFIED','NOT_REQUIRED');
  if v_verified_cap_count<>v_cap_count then raise exception 'CAPABILITY_REVIEW_INCOMPLETE:%/%',v_verified_cap_count,v_cap_count; end if;
  if exists (select 1 from public.dd_provider_application_documents d where d.application_id=a.id and d.verification_status in ('PENDING','REJECTED','EXPIRED')) then raise exception 'APPLICATION_DOCUMENTS_NOT_CLEAR'; end if;
  v_provider_name:=coalesce(nullif(a.dba_name,''),nullif(a.legal_name,''),trim(coalesce(a.contact_first_name,'')||' '||coalesce(a.contact_last_name,'')));
  select po.id into v_org_id from public.dd_provider_organizations po where po.internal_alias=('app-'||replace(a.id::text,'-','')) limit 1;
  if v_org_id is null then
    insert into public.dd_provider_organizations (name,vendor_type,is_active,internal_alias,legal_name,compliance_status,accepts_new_work,capacity_status,agreement_status,compliance_verified_at,network_access_level,commercial_relationship_type,primary_contact_name,website,capability_summary,services_evidence,qualification_status,permission_status,source_reference,operating_rule)
    values (v_provider_name,case when a.applicant_type='BUSINESS' then 'PARTNER' else 'INDIVIDUAL' end,true,'app-'||replace(a.id::text,'-',''),a.legal_name,'VERIFIED',true,'AVAILABLE','ACTIVE',now(),'AUTHORIZED','PROVIDER',trim(coalesce(a.contact_first_name,'')||' '||coalesce(a.contact_last_name,'')),a.website,a.service_notes,'Approved from provider application '||a.id::text,'QUALIFIED','AUTHORIZED','PROVIDER_APPLICATION:'||a.id::text,'Fulfillment-only provider authorization; DANI DECLARES retains customer, pricing and marketing authority.') returning id into v_org_id;
  else
    update public.dd_provider_organizations set is_active=true,compliance_status='VERIFIED',accepts_new_work=true,capacity_status='AVAILABLE',agreement_status='ACTIVE',compliance_verified_at=now(),network_access_level='AUTHORIZED',qualification_status='QUALIFIED',permission_status='AUTHORIZED',updated_at=now() where id=v_org_id;
  end if;
  select p.id into v_provider_id from public.dd_providers p where p.org_id=v_org_id order by p.created_at asc limit 1;
  if v_provider_id is null then
    insert into public.dd_providers (org_id,first_name,last_name,is_active,provider_code,contact_name,role_title)
    values (v_org_id,a.contact_first_name,a.contact_last_name,true,'APP-'||upper(substr(replace(a.id::text,'-',''),1,10)),v_provider_name,'Authorized DANI DECLARES Provider') returning id into v_provider_id;
  else update public.dd_providers set is_active=true,updated_at=now() where id=v_provider_id; end if;
  delete from public.dd_provider_capabilities pc where pc.provider_org_id=v_org_id and pc.service_id in (select c.canonical_service_id from public.dd_provider_application_capabilities c where c.application_id=a.id and c.canonical_service_id is not null);
  insert into public.dd_provider_capabilities (provider_id,provider_org_id,service_id,service_line,capability_key,is_authorized,tier_availability)
  select v_provider_id,v_org_id,c.canonical_service_id,coalesce(s.name,c.capability_description),c.capability_key,true,jsonb_build_object('source','PROVIDER_APPLICATION','application_id',a.id,'authorized_at',now())
  from public.dd_provider_application_capabilities c join public.services s on s.id=c.canonical_service_id
  where c.application_id=a.id and c.canonical_service_id is not null and c.authorization_status='AUTHORIZED' and c.evidence_status='VERIFIED' and c.requirement_status in ('VERIFIED','NOT_REQUIRED');
  insert into public.dd_provider_capacity_profiles (provider_id,provider_org_id,max_jobs_per_day,max_concurrent_jobs,max_hours_per_day,crew_size,capacity_status,activated_at,current_jobs,current_hours,notes)
  values(v_provider_id,v_org_id,1,1,8,1,'ACTIVE',now(),0,0,'Activated by provider application approval; staff may tune capacity before first dispatch.')
  on conflict (provider_id) do update set provider_org_id=excluded.provider_org_id,capacity_status='ACTIVE',activated_at=coalesce(public.dd_provider_capacity_profiles.activated_at,now()),updated_at=now();
  select pi.id into v_identity_id from public.dd_portal_identities pi where pi.auth_user_id=a.applicant_user_id limit 1;
  if v_identity_id is not null then update public.dd_portal_identities set portal_role='provider',entity_id=v_provider_id,is_active=true,updated_at=now() where id=v_identity_id; end if;
  update public.dd_provider_applications set application_status='APPROVED',reviewed_at=now(),reviewed_by=p_actor_id,network_access_level='AUTHORIZED',compliance_status='VERIFIED',updated_at=now() where id=a.id;
  insert into public.dd_provider_application_events (application_id,event_type,from_status,to_status,actor_id,notes) values(a.id,'APPROVED_AND_ACTIVATED',a.application_status,'APPROVED',p_actor_id,'Provider organization, provider identity, authorized service capabilities and initial capacity profile activated atomically.');
  insert into public.dd_commercial_authority (provider_org_id,authorization_basis,effective_date,is_active) values(v_org_id,'APPROVED_PROVIDER_APPLICATION:'||a.id::text,current_date,true) on conflict (provider_org_id) do update set authorization_basis=excluded.authorization_basis,effective_date=excluded.effective_date,is_active=true,updated_at=now();
  return jsonb_build_object('application_id',a.id,'provider_org_id',v_org_id,'provider_id',v_provider_id,'portal_identity_id',v_identity_id,'authorized_service_count',v_cap_count,'status','APPROVED_AND_ACTIVATED');
end; $$;
revoke all on function public.dd_approve_provider_application(uuid,uuid) from public;
revoke all on function public.dd_approve_provider_application(uuid,uuid) from anon;
revoke all on function public.dd_approve_provider_application(uuid,uuid) from authenticated;
grant execute on function public.dd_approve_provider_application(uuid,uuid) to service_role;
