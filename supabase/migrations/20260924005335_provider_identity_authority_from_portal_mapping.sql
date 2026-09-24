
create or replace function public.dd_current_provider_id()
returns uuid
language sql
stable
security definer
set search_path=''
as $$
  select i.entity_id
  from public.dd_portal_identities i
  where i.auth_user_id = auth.uid()
    and i.portal_role = 'provider'
    and i.is_active = true
  order by i.updated_at desc
  limit 1
$$;

create or replace function private.dd_current_provider_id()
returns uuid
language sql
stable
security definer
set search_path=''
as $$
  select i.entity_id
  from public.dd_portal_identities i
  where i.auth_user_id = auth.uid()
    and i.portal_role = 'provider'
    and i.is_active = true
  order by i.updated_at desc
  limit 1
$$;

revoke all on function public.dd_current_provider_id() from public, anon;
grant execute on function public.dd_current_provider_id() to authenticated, service_role;
revoke all on function private.dd_current_provider_id() from public, anon;
grant execute on function private.dd_current_provider_id() to authenticated, service_role;
