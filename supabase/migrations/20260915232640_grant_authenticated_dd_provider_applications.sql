-- 20260905_portal_self_service_intake_v1.sql added the authenticated RLS
-- policies for dd_provider_applications (self insert/select/update) but never
-- granted the underlying table privileges. Postgres checks GRANTs before RLS,
-- so every provider signup that reached this insert failed with
-- "permission denied for table dd_provider_applications" -- previously masked
-- because the RLS violation on dd_portal_identities (fixed separately) always
-- failed first. Matches the grant dd_portal_identities already has; no DELETE,
-- since no RLS policy on this table grants delete access.
grant select, insert, update on public.dd_provider_applications to authenticated;
