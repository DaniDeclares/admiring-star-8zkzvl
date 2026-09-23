ALTER TABLE public.danis_specials_offers
  ADD COLUMN IF NOT EXISTS commercial_status text NOT NULL DEFAULT 'UNDERWRITING_REQUIRED';

ALTER TABLE public.danis_specials_offers
  DROP CONSTRAINT IF EXISTS danis_specials_offers_commercial_status_check;

ALTER TABLE public.danis_specials_offers
  ADD CONSTRAINT danis_specials_offers_commercial_status_check
  CHECK (commercial_status IN ('UNDERWRITING_REQUIRED','ECONOMICS_VERIFIED','PASS_1','GATED'));

UPDATE public.danis_specials_offers
SET commercial_status = 'UNDERWRITING_REQUIRED'
WHERE commercial_status IS NULL;
