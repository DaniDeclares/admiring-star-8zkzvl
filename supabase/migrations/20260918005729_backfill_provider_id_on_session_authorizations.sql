-- Retroactive fix: every dd_provider_capabilities row this session inserted for Danielle
-- before this migration (Division 05 notary x20, Division 10 Vow Renewal x1) used
-- provider_org_id only, matching the org-level pattern already used for her earlier
-- capabilities -- but never populated provider_id, unlike her original 45 cleaning
-- authorizations which correctly reference her real dd_providers row. This backfills
-- provider_id so the data is consistent for any future use of the person-level dispatch
-- matching (findEligibleProviders/offerAssignment in dispatchEngine2026.js), which joins on
-- provider_id, not provider_org_id.

UPDATE public.dd_provider_capabilities
SET provider_id = 'acba894f-a8c7-4156-b981-fa08acc9e65b'
WHERE provider_org_id = '19c10267-898f-4c10-a25e-186f6aff8771'
  AND provider_id IS NULL;
