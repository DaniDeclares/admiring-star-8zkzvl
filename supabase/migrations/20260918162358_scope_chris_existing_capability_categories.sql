-- Narrows the two capability categories that exactly match Christopher Walker's existing,
-- real dd_provider_capabilities rows (capability_key COMPUTER_TECHNICAL_SUPPORT and
-- DTF_APPAREL_PRODUCTION), so his onboarding re-selection reproduces his actual 4/4
-- capabilities instead of exposing the rest of Division 6 (31 services) or Division 11
-- (33 services) -- both divisions share a single SKU prefix with no sub-family split, so
-- every category pointing at them with no canonical_skus list currently resolves to the
-- full division list. This is a direct prerequisite for Chris's onboarding reconciliation,
-- not general Division 6/11 category cleanup -- the other overlapping categories
-- (COMPUTER_SETUP, BUSINESS_FORMATION_DIGITAL, CREATIVE_DESIGN, DTF_PRINTING,
-- HEAT_PRESS_APPAREL, LASER_ENGRAVING) are deliberately left untouched today.
--
-- No dd_provider_capabilities rows are created, modified, or copied. No authorization is
-- granted. No prices or commercial offers change.
--
-- Verified post-change: selecting COMPUTER_TECHNICAL_SUPPORT + DTF_APPAREL_PRODUCTION
-- resolves to exactly Chris's real 4 services (Computer Setup, Workstation Deployment, DTF
-- Apparel, Heat Press Apparel) with zero unrelated Division 6/11 services; the six-SKU
-- CONTENT_MARKETING_PRODUCTION category from the prior migration is unaffected;
-- dd_provider_capabilities row count unchanged at 282; the retired Chris Beta Cohort
-- placeholder's 6 rows remain untouched at 0 authorized; Chris's real org's 4 rows remain
-- unchanged at 4 authorized; Supabase security advisories show no new findings; production
-- build compiles clean.

UPDATE public.dd_provider_capability_categories
SET canonical_skus = ARRAY['DNI-06A-016','DNI-06A-017']
WHERE category_key = 'COMPUTER_TECHNICAL_SUPPORT';

UPDATE public.dd_provider_capability_categories
SET canonical_skus = ARRAY['DNI-11A-017','DNI-11A-018']
WHERE category_key = 'DTF_APPAREL_PRODUCTION';
