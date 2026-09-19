-- Joseph Sink is the real, owner-confirmed contact for NawfSide Roadside Enterprise LLC
-- (Georgia Secretary of State registered agent; Danielle directly confirmed identity/status
-- in chat 2026-09-18: "Joho and Joseph are the same. He is NAWFside and active").
-- The org's dd_provider_organizations row is already EXECUTED/AUTHORIZED, but no individual
-- dd_providers row existed under it -- so the existing email-match trigger
-- (dd_link_provider_portal_identity, 20260918195542) had nothing to join against when Joseph
-- tried to get portal access, leaving him with no account and no way to reach his org's already-
-- authorized capabilities. This is the same portal-identity gap that hit Christopher Walker.
--
-- This creates only the missing dd_providers record. It does not touch auth.users or
-- dd_portal_identities -- Joseph still creates his own account through the normal, fully-
-- supported public signup flow, and the existing trigger links it automatically on signup.
insert into public.dd_providers (org_id, first_name, last_name, is_active, contact_name, role_title, source_system, source_channel)
values (
  '6bb73275-cd4d-44ea-98e4-19113d1954cc',
  'Joseph',
  'Sink',
  true,
  'Joseph Sink',
  'Owner',
  'STAFF_DIRECT',
  'OWNER_CONFIRMED_2026-09-18'
);
