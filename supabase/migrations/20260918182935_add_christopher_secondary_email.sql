-- Adds a secondary-email field to dd_provider_organizations (previously only one contact_email
-- slot existed) and records Christopher Walker's other real email, per Danielle's direct
-- instruction, without overwriting his already-verified primary email (chriswalkerjobs@gmail.com,
-- matched independently against his real HubSpot contact).
ALTER TABLE public.dd_provider_organizations
  ADD COLUMN IF NOT EXISTS contact_email_secondary text;

UPDATE public.dd_provider_organizations
SET contact_email_secondary = 'kinghundun@gmail.com'
WHERE id = '43473f58-c1a6-400b-a8ca-12db91cc618d';
