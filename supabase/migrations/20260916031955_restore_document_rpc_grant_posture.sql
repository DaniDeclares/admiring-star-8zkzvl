revoke execute on function public.dd_record_provider_application_document(uuid, text, text, text, text, date) from public;
revoke execute on function public.dd_record_provider_application_document(uuid, text, text, text, text, date) from anon;
grant execute on function public.dd_record_provider_application_document(uuid, text, text, text, text, date) to postgres;