-- Wires the 11 vendor-fulfilled Division 10 candidates (added in
-- 20260917234712_add_division_10_vendor_fulfilled_candidates.sql) into the REAL, existing
-- provider signup wizard (PortalAccessPage.jsx -> dd_provider_capability_categories ->
-- services table), instead of leaving them as inert catalog stubs.
--
-- Division 10 previously had only one broad capability category ("Experiences & Resident
-- Programming", division_id=10, no canonical_sku_prefix filter -- covering all ~28 Division
-- 10 services at once). That's too coarse for a mobile bartender or florist to indicate their
-- actual single specialty during signup. Each new category below gets its own distinct
-- canonical_sku_prefix (10B-10L; 10A remains Danielle's own wedding/coordination work), so a
-- vendor checks exactly one real specialty box and it resolves to exactly one real service.
--
-- Deliberately NOT creating dd_service_pricing_rules or dd_governed_service_offers here --
-- these services are not priced or checkout-eligible yet (payout-model decision pending,
-- real vendor rates not yet known -- see task "Get payout-model decision..."). This migration
-- only makes them real, named, signup-eligible services with the right division/SKU shape; a
-- vendor applying against one still goes through Danielle's review in
-- dd_provider_applications before anything is authorized.
--
-- NOTE ON APPLICATION ORDER: this was actually applied in two steps against the live database
-- (the dd_provider_capability_categories insert first, once the table's actual NOT NULL
-- columns -- capability_key, requires_credential -- were discovered by trial; the services/
-- dd_master_service_universe reconciliation second, after an earlier combined attempt rolled
-- back entirely due to a missing `services.slug` value). Both statements are idempotent-safe
-- to run together here since dd_master_service_universe starts every one of these rows at
-- PRESERVED_CANDIDATE and the WHERE clause only matches that state.

INSERT INTO public.dd_provider_capability_categories (category_key, capability_key, label, division_id, canonical_sku_prefix, equipment_prompt, requires_credential, credential_prompt, display_order) VALUES
  ('EVENT_BAR_SERVICE','EVENT_BAR_SERVICE','Mobile Bar / Bartending Service',10,'10B','Do you have your own bar equipment/mobile bar setup?',true,'Do you hold current responsible-alcohol-service (e.g. TIPS) certification?',19),
  ('EVENT_CHILDCARE','EVENT_CHILDCARE','Event Childcare',10,'10C','Do you have supplies/equipment appropriate for on-site event childcare?',true,'Are you background-checked and do you carry current childcare liability insurance?',20),
  ('EVENT_DJ_PRODUCTION','EVENT_DJ_PRODUCTION','DJ & Event Production',10,'10D','Do you have your own sound, lighting and production equipment for events?',false,null,21),
  ('EVENT_LIVE_ENTERTAINMENT','EVENT_LIVE_ENTERTAINMENT','Live Entertainment & Music',10,'10E','Do you have your own instruments/sound equipment and a performance portfolio or sample?',false,null,22),
  ('EVENT_MC_HOST','EVENT_MC_HOST','MC / Event Host',10,'10F','Do you have experience hosting weddings or events, and can you provide a sample or reference?',false,null,23),
  ('EVENT_BEAUTY_MAKEUP','EVENT_BEAUTY_MAKEUP','Beauty & Makeup Services',10,'10G','Do you carry your own kit/supplies?',true,'Do you hold any relevant cosmetology licensing required in your state?',24),
  ('EVENT_FLORALS','EVENT_FLORALS','Florals & Bloom Bar',10,'10H','Do you have floral design experience and your own sourcing/supply setup?',false,null,25),
  ('EVENT_PHOTO_BOOTH','EVENT_PHOTO_BOOTH','Photo Booth Services',10,'10I','Do you own your photo booth equipment/props, and what is your typical setup time?',false,null,26),
  ('EVENT_RENTALS_DECOR','EVENT_RENTALS_DECOR','Event Rentals & Decor',10,'10J','Do you own your own rental inventory (furniture, decor, tablescape items), and how is delivery/pickup handled?',false,null,27),
  ('EVENT_CATERING_VENUE','EVENT_CATERING_VENUE','Catering & Venue Coordination',10,'10K','Do you have a venue-partner agreement or catering setup you can share?',true,'Do you hold current food-service permits/insurance?',28),
  ('EVENT_PHOTOGRAPHY_VIDEO','EVENT_PHOTOGRAPHY_VIDEO','Event Photography & Videography',10,'10L','Do you have your own camera/video equipment and a portfolio link to share?',false,null,29)
ON CONFLICT (category_key) DO NOTHING;

CREATE TEMP TABLE tmp_d10_vendor_cats (
  service_name text PRIMARY KEY,
  canonical_sku text
);

INSERT INTO tmp_d10_vendor_cats (service_name, canonical_sku) VALUES
  ('Mobile Bar / Bartending Service', 'DNI-10B-001'),
  ('Event Childcare', 'DNI-10C-001'),
  ('DJ & Event Production', 'DNI-10D-001'),
  ('Live Entertainment & Music', 'DNI-10E-001'),
  ('MC / Event Host', 'DNI-10F-001'),
  ('Beauty & Makeup Services', 'DNI-10G-001'),
  ('Florals & Bloom Bar', 'DNI-10H-001'),
  ('Photo Booth Services', 'DNI-10I-001'),
  ('Event Rentals & Decor', 'DNI-10J-001'),
  ('Catering & Venue Coordination', 'DNI-10K-001'),
  ('Event Photography & Videography', 'DNI-10L-001')
;

INSERT INTO public.services (id, name, slug, sku, division_id, service_family, commercial_status, created_at, updated_at)
SELECT gen_random_uuid(), t.service_name, lower(t.canonical_sku), t.canonical_sku, 10, 'Experiences & Resident Programming', 'PENDING_RECONCILIATION', now(), now()
FROM tmp_d10_vendor_cats t
WHERE NOT EXISTS (SELECT 1 FROM public.services s WHERE s.sku = t.canonical_sku);

UPDATE public.dd_master_service_universe m
SET canonical_sku = t.canonical_sku, commercial_object_type = 'SERV', lifecycle_status = 'CANONICAL_ACTIVE', updated_at = now()
FROM tmp_d10_vendor_cats t
WHERE m.service_name = t.service_name AND m.lifecycle_status = 'PRESERVED_CANDIDATE';

DROP TABLE tmp_d10_vendor_cats;
