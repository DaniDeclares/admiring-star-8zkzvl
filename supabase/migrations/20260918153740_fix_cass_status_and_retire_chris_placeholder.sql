-- Fixes two real "not true across the board" authorization inconsistencies found while
-- verifying Danielle's 2026-09-18 request to confirm provider-authorization state for
-- herself, Cass, NawfSide, Angel, Chris, and Cayla before emailing signup links.
--
-- 1) Cass (Cassandra Rosser, org 47eda04f-1ed4-4727-8e07-57018236009c): agreement_status is
--    already EXECUTED and compliance_status VERIFIED, and all 6 of her real capabilities
--    (AP/AR admin, financial readiness, cash flow/budgeting, financial reporting, monthly
--    bookkeeping, bookkeeping setup) are already is_authorized = true in
--    dd_provider_capabilities -- but permission_status/qualification_status on the
--    organization record were still stuck at PENDING. Bringing those two fields in line
--    with the reality already recorded one layer down; no new authorization is being
--    granted here, only a stale status field being corrected.
--
-- 2) "Chris - Provider Beta Cohort" (org 9584c09c-957d-490f-af55-df8d1a4dddf9): an older
--    placeholder record with 0 of 6 capabilities authorized, no dd_providers contact row,
--    and PENDING status across the board. It has been superseded by the real
--    "Christopher Walker - DTF & Technical Support" org (43473f58-c1a6-400b-a8ca-12db91cc618d,
--    created 2026-09-18, 4/4 capabilities authorized, APPROVED/QUALIFIED) covering the same
--    DTF/computer-setup capability set. Deactivating the placeholder so it stops showing as a
--    live, unresolved "Chris" record alongside the real one.

UPDATE public.dd_provider_organizations
SET permission_status = 'APPROVED',
    qualification_status = 'QUALIFIED'
WHERE id = '47eda04f-1ed4-4727-8e07-57018236009c';

UPDATE public.dd_provider_organizations
SET is_active = false,
    operating_rule = coalesce(operating_rule, '') || ' SUPERSEDED 2026-09-18: superseded by Christopher Walker - DTF & Technical Support (org 43473f58-c1a6-400b-a8ca-12db91cc618d); this placeholder had 0/6 capabilities authorized and no contact record.'
WHERE id = '9584c09c-957d-490f-af55-df8d1a4dddf9';
