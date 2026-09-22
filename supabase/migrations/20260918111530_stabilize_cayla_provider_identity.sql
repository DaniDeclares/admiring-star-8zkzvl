begin;
insert into public.dd_provider_organizations(id,name,vendor_type,is_active,internal_alias,compliance_status,routing_priority,accepts_new_work,capacity_status,agreement_status,network_access_level,equipment_summary,permission_status,qualification_status,primary_contact_name,compliance_tier,source_reference)
select '04d66fe4-e006-4b8e-988e-e063ae93b8ab'::uuid,name,vendor_type,is_active,'cayla',compliance_status,routing_priority,accepts_new_work,capacity_status,agreement_status,network_access_level,equipment_summary,permission_status,qualification_status,primary_contact_name,compliance_tier,source_reference
from public.dd_provider_organizations where name='Cayla Wanzer - Cleaning & Plant Care'
and not exists(select 1 from public.dd_provider_organizations where id='04d66fe4-e006-4b8e-988e-e063ae93b8ab'::uuid)
limit 1;
update public.dd_providers set org_id='04d66fe4-e006-4b8e-988e-e063ae93b8ab'::uuid where first_name='Cayla' and last_name='Wanzer';
update public.dd_provider_capabilities set provider_org_id='04d66fe4-e006-4b8e-988e-e063ae93b8ab'::uuid where provider_id in(select id from public.dd_providers where first_name='Cayla' and last_name='Wanzer');
delete from public.dd_provider_organizations where name='Cayla Wanzer - Cleaning & Plant Care' and id<>'04d66fe4-e006-4b8e-988e-e063ae93b8ab'::uuid;
update public.dd_providers set id='96b78147-c991-43d2-a3fe-4d9dc49fd90d'::uuid where org_id='04d66fe4-e006-4b8e-988e-e063ae93b8ab'::uuid and first_name='Cayla' and last_name='Wanzer' and id<>'96b78147-c991-43d2-a3fe-4d9dc49fd90d'::uuid and not exists(select 1 from public.dd_providers where id='96b78147-c991-43d2-a3fe-4d9dc49fd90d'::uuid);
commit;