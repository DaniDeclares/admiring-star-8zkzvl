-- Registers a new selectable provider-capability category for the six live, SELL_NOW
-- Division 07 (Marketing, Content & Media Production) services that currently have ZERO
-- providers with any capability record at all, verified 2026-09-18: Social Media Management
-- (DNI-07A-005, $650), Short-Form Content (DNI-07A-007, $250), Video Editing (DNI-07A-020,
-- $199), Property Photography (DNI-07A-018, $199), Content Calendar (DNI-07A-004, $250), and
-- Website Content (DNI-07A-016, $400).
--
-- This is a SELECTION-LAYER change only. It does not authorize anyone for anything: it makes
-- the six SKUs pickable in the existing self-serve provider onboarding wizard
-- (src/pages/PortalAccessPage.jsx), the same way every other capability category already
-- works there. No dd_provider_capabilities rows are created or modified, no SKUs or
-- commercial offers are created (all six already exist and are already SELL_NOW), and the
-- stale, retired "Chris - Provider Beta Cohort" capability rows are intentionally left
-- untouched and NOT copied into anyone's current provider record.
--
-- Division 07 has no sub-prefix scheme -- all 20 of its real canonical SKUs share the single
-- prefix "07A" (unlike Division 01, which splits into 01A/01B/01C for
-- cleaning/pet-care/plant-care). The existing category mechanism can only scope by
-- division_id + an optional whole-family sku prefix, which can't isolate 6 specific SKUs out
-- of a 20-SKU division without also pulling in unrelated services (SEO, keyword research,
-- blog writing, email marketing, etc.) that were never part of what was described. Adding an
-- explicit canonical_skus list is the minimal way to scope this correctly without touching the
-- prefix-based mechanism every other category already relies on.
ALTER TABLE public.dd_provider_capability_categories
  ADD COLUMN IF NOT EXISTS canonical_skus text[];

INSERT INTO public.dd_provider_capability_categories
  (category_key, label, description, division_id, canonical_sku_prefix, canonical_skus,
   requires_credential, credential_prompt, equipment_prompt, display_order, capability_key)
VALUES (
  'CONTENT_MARKETING_PRODUCTION',
  'Content & Social Media Production',
  'Social media management, short-form video, video editing, property/brand photography, content calendars, and website content writing. Verified 2026-09-18 to have zero authorized providers network-wide despite all six services already being live and sellable.',
  7,
  NULL,
  ARRAY['DNI-07A-004','DNI-07A-005','DNI-07A-007','DNI-07A-016','DNI-07A-018','DNI-07A-020'],
  false,
  NULL,
  'Do you have your own camera/recording equipment and editing software for this work?',
  100,
  'CONTENT_MARKETING_PRODUCTION'
);
