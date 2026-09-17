-- These 34 live (SELL_NOW/INTAKE_ONLY) services never had service_family set,
-- so they were falling into a generic "Services" catch-all bucket on the
-- public catalog page instead of their real category -- and would have
-- vanished entirely from the new audience-filtered catalog view, which
-- filters by service_family. Backfill using the same canonical_sku
-- sub-prefix scheme already established for Division 01 (01A=Cleaning,
-- 01B=Pet Care, 01C=Plant Care, 01D=Household Concierge, 01E=Move/Transition,
-- 01F=Seasonal Decor, 01G=Membership), matching the exact family strings
-- already in use elsewhere so existing alias/lookup logic keeps working.

UPDATE public.services s
SET service_family = '01A Home & Cleaning'
FROM public.dd_governed_service_offers o
WHERE s.id = o.runtime_service_id AND s.service_family IS NULL
  AND o.canonical_sku = 'DNI-01A-026';

UPDATE public.services s
SET service_family = '01B Pet Care & Household Pet Support'
FROM public.dd_governed_service_offers o
WHERE s.id = o.runtime_service_id AND s.service_family IS NULL
  AND o.canonical_sku LIKE 'DNI-01B-%';

UPDATE public.services s
SET service_family = '01C Indoor Plant Care'
FROM public.dd_governed_service_offers o
WHERE s.id = o.runtime_service_id AND s.service_family IS NULL
  AND o.canonical_sku LIKE 'DNI-01C-%';

UPDATE public.services s
SET service_family = '01D Household Concierge'
FROM public.dd_governed_service_offers o
WHERE s.id = o.runtime_service_id AND s.service_family IS NULL
  AND o.canonical_sku LIKE 'DNI-01D-%';

UPDATE public.services s
SET service_family = '01E Move & Household Transition'
FROM public.dd_governed_service_offers o
WHERE s.id = o.runtime_service_id AND s.service_family IS NULL
  AND o.canonical_sku LIKE 'DNI-01E-%';

UPDATE public.services s
SET service_family = '01F Seasonal & Holiday Home Services'
FROM public.dd_governed_service_offers o
WHERE s.id = o.runtime_service_id AND s.service_family IS NULL
  AND o.canonical_sku LIKE 'DNI-01F-%';

UPDATE public.services s
SET service_family = 'Recurring Services'
FROM public.dd_governed_service_offers o
WHERE s.id = o.runtime_service_id AND s.service_family IS NULL
  AND o.canonical_sku LIKE 'DNI-01G-%';

UPDATE public.services s
SET service_family = 'Experiences & Resident Programming'
FROM public.dd_governed_service_offers o
WHERE s.id = o.runtime_service_id AND s.service_family IS NULL
  AND o.canonical_sku = 'DNI-10A-022';

UPDATE public.services s
SET service_family = 'Logistics, Courier & Asset Sourcing'
FROM public.dd_governed_service_offers o
WHERE s.id = o.runtime_service_id AND s.service_family IS NULL
  AND o.canonical_sku = 'DNI-12A-028';
