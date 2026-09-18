-- Provider document capability linkage
-- Keeps the existing 6-argument RPC for backward compatibility while adding
-- an optional capability_id-aware signature for the updated onboarding UI.

create or replace function public.dd_record_provider_application_document(
  p_application_id uuid,
  p_document_type text,
  p_storage_path text,
  p_document_number text default null,
  p_issuing_authority text default null,
  p_expiration_date date default null,
  p_capability_id uuid default null
) returns uuid
language plpgsql
security definer
set search_path = public, pg_catalog
as $function$
declare
  v_app public.dd_provider_applications%rowtype;
  v_document_id uuid;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_application_id is null or p_document_type is null or p_storage_path is null then raise exception 'DOCUMENT_FIELDS_REQUIRED'; end if;
  if p_document_type not in ('GOVERNMENT_ID','W9','COI','AUTO_INSURANCE','AGREEMENT','BUSINESS_REGISTRATION','PROFESSIONAL_LICENSE','CERTIFICATION','BACKGROUND_CONSENT','PORTFOLIO','WORK_SAMPLE','MOTOR_CARRIER_AUTHORITY','OTHER') then raise exception 'INVALID_DOCUMENT_TYPE'; end if;
  if p_storage_path not like auth.uid()::text || '/%' then raise exception 'INVALID_STORAGE_PATH'; end if;

  select * into v_app
  from public.dd_provider_applications
  where id = p_application_id and applicant_user_id = auth.uid()
  for update;
  if not found then raise exception 'APPLICATION_NOT_FOUND'; end if;
  if v_app.application_status not in ('DRAFT','SUBMITTED','NEEDS_INFO') then raise exception 'APPLICATION_NOT_EDITABLE'; end if;

  if p_capability_id is not null and not exists (
    select 1 from public.dd_provider_application_capabilities c
    where c.id = p_capability_id and c.application_id = p_application_id
  ) then
    raise exception 'CAPABILITY_NOT_FOUND_FOR_APPLICATION';
  end if;

  insert into public.dd_provider_application_documents
    (application_id, capability_id, document_type, storage_path, verification_status, document_number, issuing_authority, expiration_date)
  values
    (p_application_id, p_capability_id, p_document_type, p_storage_path, 'PENDING', p_document_number, p_issuing_authority, p_expiration_date)
  returning id into v_document_id;

  update public.dd_provider_applications set
    tax_form_status = case when p_document_type = 'W9' then 'RECEIVED' else tax_form_status end,
    insurance_status = case when p_document_type in ('COI','AUTO_INSURANCE') then 'RECEIVED' else insurance_status end,
    identity_status = case when p_document_type = 'GOVERNMENT_ID' then 'RECEIVED' else identity_status end,
    agreement_status = case when p_document_type = 'AGREEMENT' then 'RECEIVED' else agreement_status end,
    updated_at = now()
  where id = p_application_id;

  return v_document_id;
end;
$function$;

revoke all on function public.dd_record_provider_application_document(uuid,text,text,text,text,date,uuid) from public;
grant execute on function public.dd_record_provider_application_document(uuid,text,text,text,text,date,uuid) to authenticated;
