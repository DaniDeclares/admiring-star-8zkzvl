-- A parallel audit report found that D02's 5 channel-pricing rows per service can exist while
-- still having base_price_cents = NULL -- "row coverage != price coverage." Verified directly:
-- 98 NULL rows in Division 02 and 100 in Division 03 (all legacy original-catalog SKUs,
-- DNI-02A-001..020 and their D03 equivalents), every one of them for a service that DOES have
-- an approved services.starting_price -- meaning these rows were created without ever
-- propagating the already-approved customer price into them. This is a real, live bug: if
-- checkout reads base_price_cents rather than falling back to services.starting_price, these
-- services could display as $0/broken-priced on some channels right now.
--
-- This backfills base_price_cents from the service's own already-approved starting_price --
-- not a new price, not an estimate, just propagating the existing approved number into the
-- channel row that was missing it. A separate, smaller population (15 NULL rows in Division 10)
-- was checked and left alone: those services genuinely have no starting_price at the service
-- level (real quote-based/unpriced candidates), so there is nothing real to propagate -- backfilling
-- those would mean fabricating a price, which this does not do.

UPDATE public.dd_service_pricing_rules r
SET base_price_cents = round(s.starting_price * 100)::int
FROM public.services s
WHERE r.service_id = s.id
  AND s.division_id IN (2, 3)
  AND r.base_price_cents IS NULL
  AND s.starting_price IS NOT NULL;
