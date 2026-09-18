-- Danielle confirmed she performs 3 real, market-verified notary niches not yet in the
-- Division 05 catalog (identified via market research, not invented): vehicle title/DMV
-- notarization, power of attorney & advance directive signing, and estate planning document
-- signing. Added as PRESERVED_CANDIDATE with real scope but NO price, matching the exact
-- treatment of the 4 existing Division-05 candidates -- per her explicit standing instruction
-- that notary pricing must come from her own real rates, not researched/guessed numbers.
--
-- Remote Online Notarization was explicitly NOT added: Georgia does not currently permit RON,
-- so it isn't a legal service for her to offer under a GA commission.
--
-- Mobile fingerprinting was also NOT added: she does not currently hold the required
-- certification. Tracked instead in docs/DANIELLE_CREDENTIALS_AND_CAPABILITY_NEEDS.md as a
-- capability to acquire, not catalogued as a service she can't yet legally/practically perform.

INSERT INTO public.dd_master_service_universe (id, division, service_name, scope, lifecycle_status, source_authority, created_at, updated_at)
VALUES
  (gen_random_uuid(), '05', 'Vehicle Title & DMV Document Notarization',
   'Notarization of vehicle title transfers, DMV power-of-attorney forms and related motor-vehicle documents.',
   'PRESERVED_CANDIDATE', 'OWNER_CONFIRMED_MARKET_RESEARCH_2026-09-17', now(), now()),
  (gen_random_uuid(), '05', 'Power of Attorney & Advance Directive Signing',
   'Specialized notarization and witnessing support for power-of-attorney and advance-directive/healthcare-directive documents, including any additional witness requirements beyond standard notarization.',
   'PRESERVED_CANDIDATE', 'OWNER_CONFIRMED_MARKET_RESEARCH_2026-09-17', now(), now()),
  (gen_random_uuid(), '05', 'Estate Planning Document Signing',
   'Notarization and witnessing support for estate-planning documents such as wills and trusts, including any additional witness requirements beyond standard notarization.',
   'PRESERVED_CANDIDATE', 'OWNER_CONFIRMED_MARKET_RESEARCH_2026-09-17', now(), now());
