-- Adds real contact_email/contact_phone columns to dd_provider_organizations (previously
-- absent from the schema entirely -- there was nowhere to store this) and populates them for
-- Cass, NawfSide, Christopher Walker, and Cayla Wanzer with contact info cross-verified live
-- in HubSpot on 2026-09-18 (created there today by Danielle's work with chat while this
-- session was rate-limited). Christopher's HubSpot email matches exactly what Danielle gave
-- directly in this session earlier, which cross-confirms the HubSpot contact records are real,
-- not fabricated. Danielle's own contact is already covered by her two real portal logins
-- (vendors@danideclares.com staff, danijfong20@gmail.com provider) and is included here too
-- for a single source of truth. Angel Rice has a real, verified HubSpot contact
-- (678-600-7123 / xtra.angel@gmail.com) but still has zero dd_provider_organizations /
-- dd_provider_capabilities records -- intentionally not creating an org row for her here,
-- since that would imply a capability authorization decision that hasn't been made; she can
-- still be emailed a signup link without one.

ALTER TABLE public.dd_provider_organizations
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_phone text;

UPDATE public.dd_provider_organizations SET contact_email = 'cprosser1@gmail.com', contact_phone = '404-630-5668'
  WHERE id = '47eda04f-1ed4-4727-8e07-57018236009c';
UPDATE public.dd_provider_organizations SET contact_email = 'nre@nawfsideroadside.com', contact_phone = '470-891-6391'
  WHERE id = '6bb73275-cd4d-44ea-98e4-19113d1954cc';
UPDATE public.dd_provider_organizations SET contact_email = 'chriswalkerjobs@gmail.com', contact_phone = '470-687-6061'
  WHERE id = '43473f58-c1a6-400b-a8ca-12db91cc618d';
UPDATE public.dd_provider_organizations SET contact_email = 'caylawanzer@gmail.com', contact_phone = '678-632-8667'
  WHERE id = '04d66fe4-e006-4b8e-988e-e063ae93b8ab';
UPDATE public.dd_provider_organizations SET contact_email = 'danijfong20@gmail.com'
  WHERE id = '19c10267-898f-4c10-a25e-186f6aff8771';
