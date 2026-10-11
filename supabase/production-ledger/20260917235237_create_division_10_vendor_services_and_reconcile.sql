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
FROM tmp_d10_vendor_cats t;

UPDATE public.dd_master_service_universe m
SET canonical_sku = t.canonical_sku, commercial_object_type = 'SERV', lifecycle_status = 'CANONICAL_ACTIVE', updated_at = now()
FROM tmp_d10_vendor_cats t
WHERE m.service_name = t.service_name AND m.lifecycle_status = 'PRESERVED_CANDIDATE';

DROP TABLE tmp_d10_vendor_cats;
