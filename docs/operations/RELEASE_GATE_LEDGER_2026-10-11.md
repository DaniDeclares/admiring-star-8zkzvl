# Release-gate ledger (2026-10-11)

Why this exists: GitHub reports "check suite completed" for any finished run, including runs that were **skipped** or that are not the gates a release needs. A completed suite is evidence about CI only. A release candidate needs the whole gate set below, each judged on the **exact head commit**.

## Gate taxonomy
| Class | Gate | What "satisfied" means |
|---|---|---|
| CI (automatic) | `build (22.x)`, `deterministic-quality`, `Analyze (actions / javascript-typescript / python)` (CodeQL) | conclusion `success` on the exact head |
| CI (conditional) | `Supabase Preview`, `preview-runtime`, `ch01-release-gate-investigation`, `ch01-sku-release-contract-proof`, `critical-production-smoke` | `success` when triggered; **`skipped` is not a pass**, it means the condition did not apply or the check did not run. Say which. |
| CI (migration) | `supabase-migration-replay` (PR #591 only) | `success`; currently held red by design |
| Deployment preview | Vercel preview `Ready` on the exact head | Ready, plus a smoke of the changed surface when the change is runtime |
| Release (human/Production) | owner approval; Production migration application with pre/post readback; Production deployment verification (Vercel is the deployment authority); Production role-token verification for portal changes (#637); Brain/ledger receipt | recorded by the owner or authorized staff; **never inferred from CI** |

## Status by PR (exact heads as of this write)
| PR | Head | CI observed | Conditional gates | Release gates still open |
|---|---|---|---|---|
| #638 (this branch) | moves with each push | build, deterministic-quality and CodeQL were `success` on earlier heads (ec242ff, c9d6935, 347c2a5 reported complete); the current head's runs were still in progress when this was written | `Supabase Preview` skipped (no change under `supabase/migrations`); `preview-runtime` skipped | owner approval; no deployment is requested; nothing is applied to Production |
| #630 | dd8ce29 | `build (22.x)` success, `deterministic-quality` success, CodeQL success (3 of 3), Vercel Preview Comments success | `critical-production-smoke`, `ch01-sku-release-contract-proof`, `preview-runtime`, `ch01-release-gate-investigation`, `Supabase Preview` all **skipped** | draft; Monday-readiness evidence, human Google Voice test, owner approval |
| #637 | aa2136c (test added) | `build (22.x)` **failure** and `deterministic-quality` **failure**: both are the same 4 stale CH05 direct-checkout tests in `governedCommercialGate2026.channelAuthority.test.js` (source already blocks CH05 with `GOVERNMENT_PROCUREMENT_NO_PUBLIC_CHECKOUT`; the tests still expect checkout). The failure predates the added test; the new handler test passed in that run (343 passed, 4 failed, 7 skipped). `test` success, CodeQL x4 success, Vercel Preview Comments success | `Supabase Preview`, `preview-runtime`, `ch01-*`, `critical-production-smoke` **skipped** | The identical test alignment already on #630 and #638 (commit 35a9556, 19 lines, test-only) would turn this green; **not pushed** to #637 because it was not part of the authorization. Also open: Production role-token verification, executor migrations 1-6 before its migration 7, owner approval |
| #591 | e1cda49 | replay gate **red by design** at `20261003184925` (E1); other CI not reasserted | n/a | exceptions E1, E2 still need an owner decision; E4 reconstruction is on the branch |

## Rules adopted
1. Report "N of M required gates success on <sha>", not "checks passed".
2. A `skipped` conclusion is listed with its reason; it is never counted as success.
3. A release candidate is not declared until CI, the Vercel preview, and every applicable human gate are all recorded against one commit.
4. A new push resets the exact-head evidence; the ledger is re-read, not carried over.
