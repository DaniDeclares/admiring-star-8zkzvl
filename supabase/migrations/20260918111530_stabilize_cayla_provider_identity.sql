begin;
update public.dd_provider_organizations set id='04d66fe4-e006-4b8e-988e-e063ae93b8ab'::uuid
where name='Cayla Wanzer - Cleaning & Plant Care' and id<>'04d66fe4-e006-4b8e-988e-e063ae93b8ab'::uuid
and not exists(select 1 from public.dd_provider_organizations where id='04d66fe4-e006-4b8e-988e-e063ae93b8ab'::uuid);
update public.dd_providers set id='96b78147-c991-43d2-a3fe-4d9dc49fd90d'::uuid
where org_id='04d66fe4-e006-4b8e-988e-e063ae93b8ab'::uuid and first_name='Cayla' and last_name='Wanzer'
and id<>'96b78147-c991-43d2-a3fe-4d9dc49fd90d'::uuid
and not exists(select 1 from public.dd_providers where id='96b78147-c991-43d2-a3fe-4d9dc49fd90d'::uuid);
commit;