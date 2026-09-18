-- Fixes a real bug surfaced by Danielle's own live test signup (danideclaresns@gmail.com,
-- application 53647953-3372-4582-84c3-64e037129f06): the OFFICIANT_ORDAINED selection
-- category was scoped to canonical_sku_prefix '10A', which is actually Division 10's general
-- event-planning family (Event Consultation, Wedding Day Coordination, Corporate Event
-- Coordination, etc, 29 real SKUs) -- not officiant work. Selecting "Wedding Officiant" in the
-- onboarding wizard generated 21 wrong capability rows for the test application.
--
-- Danielle's own real, already-authorized OFFICIANT_ORDAINED capability
-- (dd_provider_capabilities) is correct and untouched: exactly 2 real services, "Wedding
-- Officiant Services" and "Vow Renewal Ceremonies". Neither was ever assigned a canonical
-- DNI- SKU code, so the canonical_skus text[] mechanism used for every other fix tonight can't
-- reference them. Adding a parallel canonical_service_ids uuid[] column lets the category
-- point at the exact same two real services rows Danielle is actually authorized for, without
-- inventing a SKU number for either one.

ALTER TABLE public.dd_provider_capability_categories
  ADD COLUMN IF NOT EXISTS canonical_service_ids uuid[];

UPDATE public.dd_provider_capability_categories
SET canonical_service_ids = ARRAY['0fd8d9b9-fe4f-47d2-a78b-27eed38ddd69','ec0c198a-24f3-4665-ad85-749aafd5f57c']::uuid[],
    canonical_sku_prefix = NULL
WHERE category_key = 'OFFICIANT_ORDAINED';
