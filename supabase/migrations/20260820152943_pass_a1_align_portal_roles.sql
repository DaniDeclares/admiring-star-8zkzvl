-- Align the persisted portal-role vocabulary with the staff-admin role used by the portal auth layer.
alter table public.dd_portal_identities drop constraint if exists dd_portal_identities_portal_role_check;
alter table public.dd_portal_identities add constraint dd_portal_identities_portal_role_check
check (portal_role = any (array['provider','resident','customer','property_manager','procurement','staff_admin']));
