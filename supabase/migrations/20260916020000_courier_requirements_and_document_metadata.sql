-- Two real gaps found while checking whether Dave's actual provider path
-- would work end to end, not just whether the pages render:
--
-- 1. dd_service_capability_requirements had zero rows for any of the 20
--    live Division-12 courier/logistics SKUs. Confirmed by reading
--    dd_approve_provider_application's own function body that this table
--    (and dd_provider_capability_requirements) is never read by the
--    approval gate or any application code -- it's purely descriptive
--    unless something actually surfaces it. Populating it here plus
--    wiring it into ProviderApprovalPage (separate frontend change) is
--    what makes it a real, visible hint to staff instead of inert data.
-- 2. dd_record_provider_application_document() never accepted
--    document_number/issuing_authority/expiration_date, even though
--    dd_provider_application_documents has had those columns all along --
--    so a DOT/MC authority number, a license number, an insurance policy
--    number, none of it could ever be captured as structured data, only
--    buried in a filename.

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

-- CREATE OR REPLACE cannot change a function's parameter list -- adding
-- new params creates a second overload instead of replacing this one,
-- which breaks PostgREST's RPC resolution (ambiguous function name). Drop
-- the old 3-arg signature explicitly so there is exactly one version.
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

-- The DROP above also drops the old signature's grants, and recreating the
-- function resets to Postgres/Supabase default privileges, which include
-- PUBLIC (and therefore anon) -- broader than the original, which only
-- granted authenticated/service_role/postgres. The function's own
-- auth.uid() check would still block anon calls, but restore the exact
-- original grant posture rather than rely on that as the only defense.
grant execute on function public.dd_record_provider_application_document(uuid, text, text, text, text, date) to authenticated, service_role, postgres;
revoke execute on function public.dd_record_provider_application_document(uuid, text, text, text, text, date) from public;
