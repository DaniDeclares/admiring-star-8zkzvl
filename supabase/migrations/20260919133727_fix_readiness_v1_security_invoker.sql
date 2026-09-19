-- Security advisor (ERROR level) flagged dd_service_readiness_v1 as a
-- SECURITY DEFINER view immediately after today's DROP/CREATE VIEW passes --
-- it runs with the view creator's privileges rather than the querying
-- user's, bypassing RLS on dd_governed_service_offers/services for anyone
-- who can query it. This project already has an established fix for this
-- exact class of issue (see migration 20260828234942_set_master_views_
-- security_invoker.sql for other views) -- applying the same fix here.
ALTER VIEW public.dd_service_readiness_v1 SET (security_invoker = true);
