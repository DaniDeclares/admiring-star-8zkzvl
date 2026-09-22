begin;
insert into public.dd_provider_organizations(id,name,vendor_type,is_active,internal_alias,compliance_status,routing_priority,accepts_new_work,capacity_status,agreement_status,network_access_level,equipment_summary,permission_status,qualification_status,primary_contact_name,compliance_tier,source_reference)
select '04d66fe4-e006-4b8e-988e-e063ae93b8ab'::uuid,name,vendor_type,is_active,'cayla',compliance_status,routing_priority,accepts_new_work,capacity_status,agreement_status,network_access_level,equipment_summary,permission_status,qualification_status,primary_contact_name,compliance_tier,source_reference
from public.dd_provider_organizations where name='Cayla Wanzer - Cleaning & Plant Care'
and not exists(select 1 from public.dd_provider_organizations where id='04d66fe4-e006-4b8e-988e-e063ae93b8ab'::uuid)
limit 1;
insert into public.dd_providers(id,org_id,first_name,last_name,is_active,created_at,updated_at,provider_code,contact_name,role_title,source_system)
select '96b78147-c991-43d2-a3fe-4d9dc49fd90d'::uuid,'04d66fe4-e006-4b8e-988e-e063ae93b8ab'::uuid,first_name,last_name,is_active,created_at,updated_at,provider_code,contact_name,role_title,source_system
from public.dd_providers where first_name='Cayla' and last_name='Wanzer'
and not exists(select 1 from public.dd_providers where id='96b78147-c991-43d2-a3fe-4d9dc49fd90d'::uuid)
limit 1;
update public.dd_provider_capabilities set provider_org_id='04d66fe4-e006-4b8e-988e-e063ae93b8ab'::uuid,provider_id='96b78147-c991-43d2-a3fe-4d9dc49fd90d'::uuid
where provider_id in(select id from public.dd_providers where first_name='Cayla' and last_name='Wanzer') or provider_org_id in(select id from public.dd_provider_organizations where name='Cayla Wanzer - Cleaning & Plant Care');
delete from public.dd_providers where first_name='Cayla' and last_name='Wanzer' and id<>'96b78147-c991-43d2-a3fe-4d9dc49fd90d'::uuid;
delete from public.dd_provider_organizations where name='Cayla Wanzer - Cleaning & Plant Care' and id<>'04d66fe4-e006-4b8e-988e-e063ae93b8ab'::uuid;
commit;