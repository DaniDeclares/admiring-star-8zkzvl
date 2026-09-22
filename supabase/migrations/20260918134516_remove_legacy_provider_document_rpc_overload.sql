-- Remove the legacy six-argument overload after the provider upload UI migrated.
-- The seven-argument overload is created later by the price-sheet requirement migration,
-- so its grants must remain with that migration rather than referencing a future function here.
drop function if exists public.dd_record_provider_application_document(uuid, text, text, text, text, date);
