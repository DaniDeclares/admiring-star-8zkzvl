begin;
update public.dd_provider_organizations
set id='47eda04f-1ed4-4727-8e07-57018236009c'::uuid
where internal_alias='cass'
  and id<>'47eda04f-1ed4-4727-8e07-57018236009c'::uuid
  and not exists(select 1 from public.dd_provider_organizations where id='47eda04f-1ed4-4727-8e07-57018236009c'::uuid);
commit;