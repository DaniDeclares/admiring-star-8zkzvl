begin;
insert into public.dd_providers(id,org_id,first_name,last_name,is_active,contact_name,role_title,source_system)
select 'acba894f-a8c7-4156-b981-fa08acc9e65b'::uuid,'19c10267-898f-4c10-a25e-186f6aff8771'::uuid,'Danielle','Fong',true,'Danielle Fong','Owner/Operator','OWNER_AUTHORIZED_2026-09-15'
where not exists(select 1 from public.dd_providers where id='acba894f-a8c7-4156-b981-fa08acc9e65b'::uuid);
commit;