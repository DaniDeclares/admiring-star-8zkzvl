grant select on table public.dd_portal_user_roles to authenticated;

grant execute on function public.dd_get_my_portal_roles() to authenticated;
grant execute on function private.dd_has_portal_role(public.dd_portal_role) to authenticated;