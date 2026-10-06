begin;

-- Keep the public provider application on the curated category layer.
-- Division 10's parent category must not implicitly expand into every specialty
-- event capability (bartending, childcare, DJ, beauty, florals, etc.).
update public.dd_provider_capability_categories
set canonical_sku_prefix = '10A',
    description = 'Event planning, coordination, setup, guest flow, vendor/venue coordination and resident programming. Specialty event services are selected separately.'
where category_key = 'EXPERIENCES_EVENTS'
  and division_id = 10;

commit;
