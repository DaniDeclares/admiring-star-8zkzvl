begin;
create or replace function private.dd_has_portal_role(p_role public.dd_portal_role)
returns boolean language sql stable security definer set search_path=''
as $$ select exists (select 1 from public.dd_portal_user_roles r where r.user_id=(select auth.uid()) and r.role=p_role and r.is_active=true); $$;
commit;