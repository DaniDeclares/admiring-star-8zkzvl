-- The server portal auth layer uses app_metadata.role; retain portal_role as the preferred claim while accepting the existing staff role claim.
create or replace function private.dd_is_staff_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'portal_role', auth.jwt() -> 'app_metadata' ->> 'role', '') in ('staff_admin','admin','owner','staff');
$$;
