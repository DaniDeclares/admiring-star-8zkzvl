insert into public.dd_service_capability_requirements (canonical_sku, capability_key, requirement_code, required, source)
select sku, sku, 'AUTO_MOBILE', true, 'Division 12 courier/logistics SKU -- driving/delivery service per dd_provider_capability_requirements.AUTO_MOBILE definition ("Required for driving/delivery/mobile services when applicable").'
from (values
  ('DNI-12A-001'),('DNI-12A-002'),('DNI-12A-003'),('DNI-12A-004'),('DNI-12A-005'),
  ('DNI-12A-006'),('DNI-12A-007'),('DNI-12A-008'),('DNI-12A-009'),('DNI-12A-010'),
  ('DNI-12A-011'),('DNI-12A-012'),('DNI-12A-013'),('DNI-12A-014'),('DNI-12A-015'),
  ('DNI-12A-016'),('DNI-12A-017'),('DNI-12A-018'),('DNI-12A-019'),('DNI-12A-020')
) as skus(sku)
where not exists (
  select 1 from public.dd_service_capability_requirements existing
  where existing.canonical_sku = skus.sku and existing.requirement_code = 'AUTO_MOBILE'
);

drop function if exists public.dd_record_provider_application_document(uuid, text, text);

create or replace function public.dd_record_provider_application_document(
  p_application_id uuid,
  p_document_type text,
  p_storage_path text,
  p_document_number text default null,
  p_issuing_authority text default null,
  p_expiration_date date default null
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_app public.dd_provider_applications%rowtype;
  v_document_id uuid;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_application_id is null or p_document_type is null or p_storage_path is null then raise exception 'DOCUMENT_FIELDS_REQUIRED'; end if;
  if p_document_type not in ('GOVERNMENT_ID','W9','COI','AUTO_INSURANCE','AGREEMENT','BUSINESS_REGISTRATION','PROFESSIONAL_LICENSE','CERTIFICATION','BACKGROUND_CONSENT','PORTFOLIO','WORK_SAMPLE','MOTOR_CARRIER_AUTHORITY','OTHER') then raise exception 'INVALID_DOCUMENT_TYPE'; end if;
  if p_storage_path not like auth.uid()::text || '/%' then raise exception 'INVALID_STORAGE_PATH'; end if;
  select * into v_app from public.dd_provider_applications where id = p_application_id and applicant_user_id = auth.uid() for update;
  if not found then raise exception 'APPLICATION_NOT_FOUND'; end if;
  if v_app.application_status not in ('DRAFT','SUBMITTED','NEEDS_INFO') then raise exception 'APPLICATION_NOT_EDITABLE'; end if;
  insert into public.dd_provider_application_documents (application_id,document_type,storage_path,verification_status,document_number,issuing_authority,expiration_date)
  values (p_application_id,p_document_type,p_storage_path,'PENDING',p_document_number,p_issuing_authority,p_expiration_date) returning id into v_document_id;
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

grant execute on function public.dd_record_provider_application_document(uuid, text, text, text, text, date) to authenticated, service_role;