# PR #637 scope disclosure and authorization-boundary evidence (2026-10-11)

PR #637 (`feature/owner-morning-outcomes-20261010`, head 3084bbc) is titled as an Owner HQ outcomes change. Its diff is wider than the title. This note records what it actually contains so the owner can review the real scope. #637 was not merged, edited, or pushed to by this session, and no Production role-token verification was run.

## What the diff contains (16 files)
| Area | Files | What changes |
|---|---|---|
| Owner HQ outcomes | `api-handlers/portal-operations.js`, `src/pages/portal/OwnerHQPage.jsx` | New read-only `outcomePipeline` in `getOwnerControlSnapshot`, reading `dd_autobuild_candidates`, `dd_promotion_candidates`, `dd_production_release_receipts` (limit 150 each, labelled SAMPLED) |
| Provider portal redesign | `PortalWorkspacePage.jsx/.css`, `ProviderNav.jsx`, `ProviderServicesPage.jsx`, `ProviderW9Page.jsx`, `VendorOnboardingUploadPage.jsx` | UI restructuring of provider-facing pages (not described in the PR title) |
| W-9 availability gate | `api-handlers/_w9Crypto.js`, `portal-operations.js`, `src/lib/w9Crypto.test.js` | `isW9EncryptionConfigured()`; submission returns 503 "temporarily unavailable. Nothing was saved" when encryption is not configured; snapshot exposes `w9SubmissionAvailable` |
| PWA manifests / service worker | `public/manifest*.json`, `public/service-worker.js` | Manifest and worker edits |
| Migration | `supabase/migrations/20261010230000_fix_autobuild_brief_tech_routing_atomicity.sql` | Atomicity fix for `dd_route_autobuild_briefs_to_tech`; its base function (`20261010214500`) is itself not in Production (see executor dependency gap) |
| Workflow | `.github/workflows/dani-governed-pr-executor.yml` | +134/-10 lines to the governed PR executor |

The title and description should be expanded to disclose the provider portal redesign, the W-9 availability gate, the migration, and the workflow change. That edit belongs to the PR's author; this session did not make it.

## Authorization boundaries
- `outcomePipeline` is built inside `getOwnerControlSnapshot`, which is reached only via `?ownerDashboard=1` after `if (context.role !== 'owner') return fail(res, 'Owner access required.', 403)` (`portal-operations.js:598-599` on the PR head). Staff, provider and customer roles receive 403; the new data adds no new endpoint or permission.
- Existing tests that run and pass on the PR head: `src/lib/portalOwnerAuthority.test.js` (6 tests: anonymous denied, invalid session denied, OWNER_OPERATOR resolves to owner, staff metadata without the governed owner role stays staff, providers and customers keep their identity role, no-identity account denied) and `src/lib/w9Crypto.test.js` (+ `externalActionClaimHealthSecurity.test.js`: 3 tests pass).
- **Gap:** no existing test exercises the `ownerDashboard` handler path itself (owner 200 vs staff/provider/customer 403). Role resolution is proven; the handler gate is read from code, not tested. A handler-level regression test is a candidate follow-up and was not added to the PR here.
- The W-9 gate fails closed (503, nothing saved) and does not alter who may submit.
- Passing CI is not Production role-security proof. Production role-token verification (real owner/staff/provider/customer tokens against the deployed endpoint) remains a separate release gate and was not performed. No permissions were broadened.

## Dependency note
The migration in #637 is a fix on top of `20261010214500`, which is absent from Production. Merging #637's migration alone cannot work until the missing Tech-routing RPCs are installed through a governed migration (see `OP1M_EXECUTION_RECORD_2026-10-11.md`, "Governed PR executor: dependency gap").
