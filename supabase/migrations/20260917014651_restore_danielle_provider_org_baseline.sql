begin;
insert into public.dd_provider_organizations
(id,name,vendor_type,is_active,internal_alias,routing_priority,accepts_new_work,capacity_status,primary_contact_name,source_reference)
select
'19c10267-898f-4c10-a25e-186f6aff8771'::uuid,
'Danielle Fong - Owner/Operator','INDIVIDUAL',true,'danielle',100,true,'AVAILABLE','Danielle',
'Provider Beta Activation — shell record, vendor_type defaulted to INDIVIDUAL pending owner confirmation of actual relationship type (2026-08-30)'
where not exists(select 1 from public.dd_provider_organizations where id='19c10267-898f-4c10-a25e-186f6aff8771'::uuid);
commit;