-- The category picker was going to write category_key straight into
-- dd_provider_application_capabilities.capability_key (e.g. 'HOUSEHOLD_CONCIERGE',
-- 'NOTARY_DOCUMENT'), but three of those don't match the capability_key vocabulary
-- already established elsewhere in the system for the exact same skills:
-- dd_provider_capabilities already tags Household Concierge / Move-Transition work as
-- 'CONCIERGE' (used on Danielle Fong's own existing authorizations), and
-- dd_service_capability_requirements already tags every notary LICENSE_SERVICE
-- requirement as 'NOTARY_PUBLIC'. Writing a different tag for the same skill would not
-- break the common dispatch path (which matches by service_id first), but would make
-- any future capability_key-scoped query silently miss these providers. Adding a
-- separate capability_key column so the category grouping (used for the UI) and the
-- tag actually written to the provider's capability rows can differ where a
-- pre-existing convention already exists.

ALTER TABLE public.dd_provider_capability_categories ADD COLUMN capability_key text;
UPDATE public.dd_provider_capability_categories SET capability_key = category_key;
UPDATE public.dd_provider_capability_categories SET capability_key = 'CONCIERGE' WHERE category_key IN ('HOUSEHOLD_CONCIERGE', 'MOVE_TRANSITION');
UPDATE public.dd_provider_capability_categories SET capability_key = 'NOTARY_PUBLIC' WHERE category_key = 'NOTARY_DOCUMENT';
ALTER TABLE public.dd_provider_capability_categories ALTER COLUMN capability_key SET NOT NULL;
