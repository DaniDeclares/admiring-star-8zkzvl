-- Cayla replied directly to her own onboarding email confirming her real address is
-- caylawanzer6@gmail.com, not the HubSpot-sourced caylawanzer@gmail.com previously on
-- file (migration 20260918154335) -- a first-party confirmation supersedes a third-party
-- CRM record. Updating so the portal-identity auto-link trigger (20260918195542) matches
-- her correctly when she signs up.
--
-- This migration targeted the wrong org id (a transposition error) and updated zero rows;
-- see 20260918200250 for the corrected, effective version of this same change.
update public.dd_provider_organizations
set contact_email = 'caylawanzer6@gmail.com'
where id = '96b78147-c991-43d2-a3fe-4d9dc49fd90d' and contact_email = 'caylawanzer@gmail.com';
