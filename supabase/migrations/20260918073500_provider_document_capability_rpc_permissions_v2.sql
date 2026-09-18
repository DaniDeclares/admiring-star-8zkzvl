-- The capability-aware provider document RPC is a signed-in provider endpoint.
revoke execute on function public.dd_record_provider_application_document(uuid,text,text,text,text,date,uuid) from public;
grant execute on function public.dd_record_provider_application_document(uuid,text,text,text,text,date,uuid) to authenticated;
