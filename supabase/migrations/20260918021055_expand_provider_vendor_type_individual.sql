begin;
alter table public.dd_provider_organizations drop constraint if exists dd_provider_organizations_vendor_type_check;
alter table public.dd_provider_organizations add constraint dd_provider_organizations_vendor_type_check
 check (vendor_type = any(array['PARTNER'::text,'SUBCONTRACTOR'::text,'EMPLOYEE'::text,'INDIVIDUAL'::text]));
commit;