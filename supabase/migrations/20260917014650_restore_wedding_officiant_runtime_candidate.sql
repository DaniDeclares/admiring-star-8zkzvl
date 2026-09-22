begin;
insert into public.services(id,division_id,slug,name,description,is_active,sort_order,service_family,source_status)
select '0fd8d9b9-fe4f-47d2-a78b-27eed38ddd69'::uuid,10,'wedding-officiant-services','Wedding Officiant Services',
'Preserved runtime service candidate for later officiant reconciliation.',false,0,'Experiences & Resident Programming','PRESERVED_CANDIDATE'
where not exists(select 1 from public.services where id='0fd8d9b9-fe4f-47d2-a78b-27eed38ddd69'::uuid or slug='wedding-officiant-services');
commit;