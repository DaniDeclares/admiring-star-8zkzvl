-- Correction: 20260918200215 targeted the wrong org id (a transposition error) and
-- silently updated zero rows. Cayla's real org id is 04d66fe4-e006-4b8e-988e-e063ae93b8ab
-- ("Cayla Wanzer - Cleaning & Plant Care"). Re-applying the same real change: she replied
-- directly to her own onboarding email confirming caylawanzer6@gmail.com, superseding the
-- HubSpot-sourced caylawanzer@gmail.com on file.
update public.dd_provider_organizations
set contact_email = 'caylawanzer6@gmail.com'
where id = '04d66fe4-e006-4b8e-988e-e063ae93b8ab' and contact_email = 'caylawanzer@gmail.com';
