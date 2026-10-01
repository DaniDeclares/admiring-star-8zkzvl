-- DANI DECLARES LLC — LEGACY COMMERCIAL PRICING QUARANTINE
-- Effective 2026-08-23
--
-- Historical pricing remains in database history for auditability but is removed
-- from active/public runtime eligibility. New canonical records must be promoted
-- only after the current Master Operating Architecture reconciliation.

UPDATE public.dd_service_packages
SET
  is_active = false,
  is_public = false,
  status_boundary = 'DEPRECATED_HISTORICAL / PENDING RECONCILIATION',
  updated_at = now()
WHERE division_slug = 'propertyops'
  AND package_slug LIKE 'b2b_apt_ret_%';

-- Prevent legacy travel-calculation records from being treated as active pricing
-- inputs if the table exists in this deployment.
DO $$
BEGIN
  IF to_regclass('public.dd_travel_calculations') IS NOT NULL THEN
    EXECUTE 'UPDATE public.dd_travel_calculations SET status = ''DEPRECATED_HISTORICAL'' WHERE status IS DISTINCT FROM ''DEPRECATED_HISTORICAL''';
  END IF;

  IF to_regclass('public.fieldops_travel_calculations') IS NOT NULL THEN
    EXECUTE 'UPDATE public.fieldops_travel_calculations SET status = ''DEPRECATED_HISTORICAL'' WHERE status IS DISTINCT FROM ''DEPRECATED_HISTORICAL''';
  END IF;
END $$;

COMMENT ON TABLE public.dd_service_packages IS
  'Commercial package records are governed by the DANI DECLARES Master Operating Architecture. Historical pricing must not be promoted without reconciliation.';
