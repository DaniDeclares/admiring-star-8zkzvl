-- #676: native synthetic-estimate classification, default safe for historical rows.
-- Deploy after Tester migration replay; rollback: ALTER TABLE public.dd_estimates DROP COLUMN is_test;
ALTER TABLE public.dd_estimates ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN public.dd_estimates.is_test IS 'Synthetic workflow test. Must be true at issuance; external billing, live messaging and work dispatch forbidden.';
