-- We only know Shiletha is an "experienced cleaner" -- we never established a
-- specific years-of-experience figure. The 20260925000500 migration invented
-- "3" as a placeholder; the owner caught this in review. Correcting to NULL
-- (unknown, pending her own input) rather than guessing.

update public.dd_provider_applications
set
  years_experience = null,
  notes = notes || E'\n\n2026-09-25 UPDATE: years_experience corrected to unknown/NULL -- "3" in the original intake record was an invented placeholder, not something Shiletha reported. Collect the real figure when she completes onboarding.',
  updated_at = now()
where provider_id = (select id from public.dd_providers where provider_code = 'PROV-SHILETHA-TUCKER')
  and years_experience = 3;
