-- Pre-auth onboarding RPCs use an invoker wrapper that calls a SECURITY DEFINER helper in private.
-- The anon role needs schema resolution rights to enter that helper; it does not receive
-- table access or broader function EXECUTE rights from this grant.
GRANT USAGE ON SCHEMA private TO anon;
