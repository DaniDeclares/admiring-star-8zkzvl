-- Restore the original actor-aware execution boundary for the internal readiness view.
-- 20261001070000 recreated the view without preserving security_invoker=true, so
-- PostgreSQL reverted it to owner-rights execution. The Supabase security advisor
-- reports that state as an externally facing ERROR.
--
-- The view is absent in Tester today, so keep this migration replay-safe there.
do $$
begin
  if to_regclass('public.dd_service_canonical_readiness_v1') is not null then
    alter view public.dd_service_canonical_readiness_v1
      set (security_invoker = true);
  end if;
end $$;
