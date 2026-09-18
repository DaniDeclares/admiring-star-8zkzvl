-- Danielle is building a real third-party vendor network for wedding/event services she does
-- not personally perform (confirmed via her own Facebook vendor-recruiting research thread,
-- 2026-09-17). These are genuinely vendor-fulfilled categories -- distinct from her own
-- officiant/coordination work already live in Division 10 -- added as PRESERVED_CANDIDATE with
-- real scope, deliberately UNPRICED: pricing depends on (a) the payout-model decision (DANI
-- sets customer price + pays vendor, vs. pure referral fee) and (b) real vendor pricing-sheet
-- data collected through the vendor signup flow being built next. No dd_provider_capabilities
-- authorization is added here -- these only become sellable once a real vetted vendor is
-- authorized against them, same rule as every other division this session.

INSERT INTO public.dd_master_service_universe (id, division, service_name, scope, lifecycle_status, source_authority, created_at, updated_at)
VALUES
  (gen_random_uuid(), '10', 'Mobile Bar / Bartending Service',
   'Third-party mobile bartending and bar service for weddings and events, including mocktail/dry-bar options; fulfilled by an authorized vendor, not DANI DECLARES directly.',
   'PRESERVED_CANDIDATE', 'OWNER_VENDOR_NETWORK_INTAKE_2026-09-17', now(), now()),
  (gen_random_uuid(), '10', 'Event Childcare',
   'Vetted, background-checked on-site childcare for weddings and events; fulfilled by an authorized vendor, not DANI DECLARES directly.',
   'PRESERVED_CANDIDATE', 'OWNER_VENDOR_NETWORK_INTAKE_2026-09-17', now(), now()),
  (gen_random_uuid(), '10', 'DJ & Event Production',
   'DJ services, sound, lighting and event production for weddings and events; fulfilled by an authorized vendor, not DANI DECLARES directly.',
   'PRESERVED_CANDIDATE', 'OWNER_VENDOR_NETWORK_INTAKE_2026-09-17', now(), now()),
  (gen_random_uuid(), '10', 'Live Entertainment & Music',
   'Live bands, musicians and specialty performance entertainment for weddings and events; fulfilled by an authorized vendor, not DANI DECLARES directly.',
   'PRESERVED_CANDIDATE', 'OWNER_VENDOR_NETWORK_INTAKE_2026-09-17', now(), now()),
  (gen_random_uuid(), '10', 'MC / Event Host',
   'Master-of-ceremonies and event hosting services for weddings and events; fulfilled by an authorized vendor, not DANI DECLARES directly.',
   'PRESERVED_CANDIDATE', 'OWNER_VENDOR_NETWORK_INTAKE_2026-09-17', now(), now()),
  (gen_random_uuid(), '10', 'Beauty & Makeup Services',
   'On-site hair, makeup and beauty services for weddings and events; fulfilled by an authorized vendor, not DANI DECLARES directly.',
   'PRESERVED_CANDIDATE', 'OWNER_VENDOR_NETWORK_INTAKE_2026-09-17', now(), now()),
  (gen_random_uuid(), '10', 'Florals & Bloom Bar',
   'Wedding and event floral design, including bloom-bar/DIY floral stations; fulfilled by an authorized vendor, not DANI DECLARES directly.',
   'PRESERVED_CANDIDATE', 'OWNER_VENDOR_NETWORK_INTAKE_2026-09-17', now(), now()),
  (gen_random_uuid(), '10', 'Photo Booth Services',
   'Photo booth, digital selfie booth and open-air booth rentals for weddings and events; fulfilled by an authorized vendor, not DANI DECLARES directly.',
   'PRESERVED_CANDIDATE', 'OWNER_VENDOR_NETWORK_INTAKE_2026-09-17', now(), now()),
  (gen_random_uuid(), '10', 'Event Rentals & Decor',
   'Event furniture, decor, tablescape and specialty rental items for weddings and events; fulfilled by an authorized vendor, not DANI DECLARES directly.',
   'PRESERVED_CANDIDATE', 'OWNER_VENDOR_NETWORK_INTAKE_2026-09-17', now(), now()),
  (gen_random_uuid(), '10', 'Catering & Venue Coordination',
   'Catering and venue-partner coordination for weddings and events; fulfilled by an authorized vendor, not DANI DECLARES directly.',
   'PRESERVED_CANDIDATE', 'OWNER_VENDOR_NETWORK_INTAKE_2026-09-17', now(), now()),
  (gen_random_uuid(), '10', 'Event Photography & Videography',
   'Wedding and event photography and videography, including content creation; fulfilled by an authorized vendor, not DANI DECLARES directly.',
   'PRESERVED_CANDIDATE', 'OWNER_VENDOR_NETWORK_INTAKE_2026-09-17', now(), now());
