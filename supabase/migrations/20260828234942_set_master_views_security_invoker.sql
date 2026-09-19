begin;
alter view public.dd_master_service_customer_routing set (security_invoker = true);
alter view public.dd_master_service_capability_channel_matrix set (security_invoker = true);
commit;