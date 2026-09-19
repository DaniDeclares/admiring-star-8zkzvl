-- Restore the authenticated Data API access required by the portal role resolver.
-- RLS remains the authorization boundary: users can only read their own active role row.
grant select on table public.dd_portal_user_roles to authenticated;

-- Role helpers are security-definer functions scoped to the caller's auth.uid().
-- They must be callable by signed-in portal users, but never by anonymous clients.
grant execute on function public.dd_get_my_portal_roles() to authenticated;
grant execute on function private.dd_has_portal_role(public.dd_portal_role) to authenticated;
