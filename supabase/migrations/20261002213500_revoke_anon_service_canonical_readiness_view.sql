-- Owner decision (Dani, 2026-10-02 21:13 UTC): anonymous visitors must not read the
-- internal service readiness view. Production had anon=rm through default privileges,
-- although source only ever granted authenticated and service_role
-- (20260922043101_canonical_service_readiness_authority.sql).
-- Caller check, 2026-10-02: no src, netlify or edge-function caller; no API request
-- named the view in the last 24h of edge logs. The only dependent,
-- dd_sales_closeability_v1, is security_invoker and has no anon grant.
revoke all on public.dd_service_canonical_readiness_v1 from anon;
