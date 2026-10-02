-- FORENSIC RECOVERY OF AN UNRECORDED PRODUCTION DATA STEP (read-only evidence). Not a redesign.
-- Authority: Danielle, 2026-10-02 13:45 UTC (read-only Production recovery into #520 replay).
-- Why: replay of 20260830011946_create_governed_service_offers fails with
--   null value in column "canonical_sku" of relation "dd_governed_service_offers".
--   20260828025455 inserts 22 Division 01 master rows with canonical_sku NULL. The same
--   files ran in Production (ledger md5 identical for 025455..011946), and the 011946 insert
--   succeeded there on 2026-08-30 01:19:46 UTC, so these rows had SKUs by then.
--   No ledger entry in Production or source sets them: the change was made outside migrations.
-- Values: Production dd_master_service_universe joined to dd_governed_service_offers
--   (offer rows created 2026-08-30 01:19:46), read 2026-10-02. Offer and master SKUs agree
--   for all 22 rows. INFERENCE: these are the SKUs in place on 2026-08-30; later edits to
--   these rows cannot be ruled out from the catalog alone.
-- Only fills rows that are still NULL, so it is a no-op wherever the SKUs already exist.

update public.dd_master_service_universe m
set canonical_sku = v.sku
from (values
  ('Bin Sanitation','DNI-01A-009'),
  ('Decluttering','DNI-01A-040'),
  ('Deep Structural Reset','DNI-01A-002'),
  ('High-Dust / Ceiling / Overhead Detail','DNI-01A-025'),
  ('Home Watch','DNI-01D-002'),
  ('Household Bundled Care','DNI-01G-001'),
  ('Household Concierge','DNI-01D-001'),
  ('Household Organization','DNI-01A-040'),
  ('Laundry / Utility Area Detail','DNI-01A-029'),
  ('Mattress / Bedding Refresh','DNI-01A-038'),
  ('Move / Transition Support','DNI-01E-001'),
  ('Move-In / Move-Out Cleaning','DNI-01A-003'),
  ('Odor Neutralization','DNI-01A-010'),
  ('Pantry / Cabinet Interior','DNI-01A-007'),
  ('Pet Care','DNI-01B-008'),
  ('Plant Care','DNI-01C-001'),
  ('Standard Maintenance Cleaning','DNI-01A-001'),
  ('Trash / Debris Removal','DNI-01A-041'),
  ('Upholstery Care','DNI-01A-037'),
  ('Vacation Preparation','DNI-01D-005'),
  ('Wall / Vertical Surface Detail','DNI-01A-026'),
  ('Window / Glass Detail','DNI-01A-027')
) v(service_name, sku)
where m.division = '01'
  and m.service_name = v.service_name
  and m.canonical_sku is null
  and m.source_authority = 'Master Operating Authority Synchronization / historical Division 01 evidence';
