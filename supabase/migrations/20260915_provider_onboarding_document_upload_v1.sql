-- Provider onboarding document upload hardening.
-- Preserves the existing qualification/approval pipeline and fail-closed dispatch gates.
-- End users may upload evidence only to their own provider application.

create or replace function public.dd_record_provider_application_document(
  p_application_id uuid,
  p_document_type text,
  p_storage_path text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_app public.dd_provider_applications%rowtype;
  v_document_id uuid;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_application_id is null or p_document_type is null or p_storage_path is null then
    raise exception 'DOCUMENT_FIELDS_REQUIRED';
  end if;

  if p_document_type not in ('GOVERNMENT_ID','W9','COI','AUTO_INSURANCE','AGREEMENT','BUSINESS_REGISTRATION','PROFESSIONAL_LICENSE','CERTIFICATION','BACKGROUND_CONSENT','PORTFOLIO','WORK_SAMPLE','OTHER') then
    raise exception 'INVALID_DOCUMENT_TYPE';
  end if;

  if p_storage_path not like auth.uid()::text || '/%' then
    raise exception 'INVALID_STORAGE_PATH';
  end if;

  select * into v_app
  from public.dd_provider_applications
  where id = p_application_id
    and applicant_user_id = auth.uid()
  for update;

  if not found then
    raise exception 'APPLICATION_NOT_FOUND';
  end if;

  if v_app.application_status not in ('DRAFT','SUBMITTED','NEEDS_INFO') then
    raise exception 'APPLICATION_NOT_EDITABLE';
  end if;

  insert into public.dd_provider_application_documents (
    application_id,
    document_type,
    storage_path,
    verification_status
  ) values (
    p_application_id,
    p_document_type,
    p_storage_path,
    'PENDING'
  )
  returning id into v_document_id;

  update public.dd_provider_applications
  set
    tax_form_status = case when p_document_type = 'W9' then 'RECEIVED' else tax_form_status end,
    insurance_status = case when p_document_type in ('COI','AUTO_INSURANCE') then 'RECEIVED' else insurance_status end,
    identity_status = case when p_document_type = 'GOVERNMENT_ID' then 'RECEIVED' else identity_status end,
    agreement_status = case when p_document_type = 'AGREEMENT' then 'RECEIVED' else agreement_status end,
    updated_at = now()
  where id = p_application_id;

  return v_document_id;
end;
$$;

grant execute on function public.dd_record_provider_application_document(uuid,text,text) to authenticated;

-- Provider applicants may see/insert only their own application documents.
drop policy if exists provider_application_document_self_select on public.dd_provider_application_documents;
create policy provider_application_document_self_select
on public.dd_provider_application_documents
for select to authenticated
using (
  exists (
    select 1
    from public.dd_provider_applications a
    where a.id = dd_provider_application_documents.application_id
      and a.applicant_user_id = auth.uid()
  )
);

drop policy if exists provider_application_document_self_insert on public.dd_provider_application_documents;
create policy provider_application_document_self_insert
on public.dd_provider_application_documents
for insert to authenticated
with check (
  exists (
    select 1
    from public.dd_provider_applications a
    where a.id = dd_provider_application_documents.application_id
      and a.applicant_user_id = auth.uid()
      and a.application_status in ('DRAFT','SUBMITTED','NEEDS_INFO')
  )
);

-- Keep the private onboarding bucket private; each authenticated applicant owns only their folder.
drop policy if exists provider_onboarding_storage_self_insert on storage.objects;
create policy provider_onboarding_storage_self_insert
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'dd-vendor-onboarding'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists provider_onboarding_storage_self_select on storage.objects;
create policy provider_onboarding_storage_self_select
on storage.objects
for select to authenticated
using (
  bucket_id = 'dd-vendor-onboarding'
  and (storage.foldername(name))[1] = auth.uid()::text
);
