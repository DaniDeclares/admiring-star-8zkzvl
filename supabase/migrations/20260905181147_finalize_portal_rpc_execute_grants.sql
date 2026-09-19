REVOKE EXECUTE ON FUNCTION public.dd_consume_apartment_resident_invite(text, uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.dd_get_my_portal_roles() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.dd_owner_transition_work_order(uuid, text, jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.dd_create_work_order_from_request(uuid) FROM anon, authenticated;