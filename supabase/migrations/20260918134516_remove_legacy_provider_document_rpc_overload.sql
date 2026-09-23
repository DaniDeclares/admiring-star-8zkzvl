-- Remove the legacy six-argument overload after the provider upload UI migrated
-- to the capability-aware seven-argument RPC. Keeping both overloads makes the
-- public RPC name ambiguous for older positional calls and leaves two authorities
-- for the same operation.
drop function if exists public.dd_record_provider_application_document(uuid, text, text, text, text, date);

revoke execute on function public.dd_record_provider_application_document(uuid, text, text, text, text, date, uuid) from public;
grant execute on function public.dd_record_provider_application_document(uuid, text, text, text, text, date, uuid) to authenticated, service_role, postgres;
