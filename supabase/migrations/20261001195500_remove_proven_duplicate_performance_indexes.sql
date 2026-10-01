-- Remove only standalone indexes proven identical to constraint-backed unique
-- indexes by the Supabase performance advisor and pg_index/pg_constraint audit.
-- The uniqueness constraints and their backing indexes remain authoritative.

drop index if exists public.dd_lead_source_performance_snapshots_day_source_uidx;
drop index if exists public.dd_provider_performance_snapshots_day_provider_uidx;
