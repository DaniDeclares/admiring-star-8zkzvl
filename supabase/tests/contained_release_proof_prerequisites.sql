-- Runner-local only. Execute with psql -v ON_ERROR_STOP=1 against Supabase local DB.
-- Deliberately fails if reconstructed schema lacks real prerequisite data.
BEGIN;
DO $$
DECLARE
  n int;
  s text;
BEGIN
  IF current_setting('server_version_num')::int < 150000 THEN
    RAISE EXCEPTION 'LOCAL_POSTGRES_VERSION_UNSUPPORTED';
  END IF;
  SELECT count(*) INTO n FROM public.services WHERE sku IN ('DNI-02A-003','DNI-02A-009') AND is_active;
  IF n <> 2 THEN RAISE EXCEPTION 'PREREQUISITE_MISSING: expected two active CH02 service rows; found %',n; END IF;
  IF to_regprocedure('public.dd_prove_demanded_sow_release_for_sku(text,text)') IS NULL THEN
    RAISE EXCEPTION 'PROOF_FUNCTION_NOT_REPLAYED: demanded SOW';
  END IF;
  IF to_regprocedure('public.dd_prove_recurring_payment_path(text)') IS NULL THEN
    RAISE EXCEPTION 'PROOF_FUNCTION_NOT_REPLAYED: recurring';
  END IF;
END $$;
-- A full positive lifecycle is intentionally not simulated without frozen approved
-- pricing rules, channel routing and provider/economics prerequisites.
-- This transaction must never write persistent certification evidence.
ROLLBACK;
