-- Records Danielle's best guess at Cayla Wanzer's email, given as "I believe her email is her
-- first and last name at gmail" -- explicitly uncertain, so appended as unconfirmed rather than
-- stated as fact. Should be verified directly with Cayla (e.g. during real provider-portal
-- signup) before being relied on for anything operational like dispatch notifications.

UPDATE public.dd_provider_organizations
SET source_reference = source_reference || ' Believed (unconfirmed) email: caylawanzer@gmail.com -- Danielle stated "I believe her email is her first and last name at gmail," not confirmed directly with Cayla. Verify before relying on it operationally.'
WHERE id = '04d66fe4-e006-4b8e-988e-e063ae93b8ab';
