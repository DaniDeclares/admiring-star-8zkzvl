# DANI external-action routing cutover (proposal only)

## Source evidence and stop boundary
- Repository: `DaniDeclares/admiring-star-8zkzvl`.
- Source claim: `public.dd_claim_external_actions(text,integer)` in `supabase/migrations/20260922233100_external_action_outbox.sql`.
- Indexed default-branch direct RPC claimant: `.github/workflows/dani-external-action-executor.yml`. Search matched `rpc/dd_claim_external_actions` only here; indirect/private/deployed callers are not disproved.
- Existing workflow holds `PRODUCTION_SUPABASE_SERVICE_ROLE_KEY` and asserts a caller-supplied worker key only for telemetry. Such a key is not authenticated worker identity.
- Current workflow claims actions first, then applies allowlist; Tester health check precedes all claiming. Neither behavior is acceptable as a general-purpose finance route.
- Existing outbox lease, retries, status filters, `sequence_no` ordering, idempotency key and receipt uniqueness are preserved by the *proposed* scoped claim.
- Actual installed claim-function body and grants are not verified. **No SQL has been executed.**

## Identity prerequisite — required before production migration or worker change
A dedicated Supabase Auth machine principal with a real Auth-verified session must exist, with trusted/admin-controlled `raw_app_meta_data` keys:
- `dani_machine_capability = EXTERNAL_GITHUB_TESTER_EXECUTOR_V1`
- `dani_machine_enabled = true`

Confirm issuance/refresh/revocation, short token lifetimes, role separation, no password sharing with human users, and auditability. A self-declared `worker_id`/`p_lane` does not confer capability. Any retained service-role credential in the same worker is a potential broad-privilege bypass even if the claim RPC itself is filtered; it must be removed or conclusively segregated before declaring a secure production fix. The source-only proposal does not create a worker user or new identity service.

## Caller compatibility
1. Inventory known direct caller (`.github/workflows/dani-external-action-executor.yml`) and inspect restricted Production-installed contract, execute grants and other callers separately before cutover.
2. Add scoped claim function in an isolated environment and verify its `auth.uid()` + live trusted `auth.users.raw_app_meta_data` checks.
3. Prepare a separate, exact workflow patch calling the scoped RPC by requested lane. Tester preflight applies **only** before Tester-lane claiming. The GitHub lane retains GitHub-specific token/approval checks. Keep a redundant post-claim allowlist.
4. Coordinate activation and legacy retirement; do not leave `dd_claim_external_actions(text,integer)` executable as an unrestricted bypass. Do not revoke an existing active caller before a safe transition path is proven.
5. Rollback must first disable the new claimant/worker and preserve leased actions; reverting to the unrestricted legacy claim is **not** an acceptable unmonitored rollback.

## Proposed isolation and synthetic acceptance suite (NOT run)
Fixture: `tests/fixtures/external_action_capability_claim.json`. Execute only in an approved isolated Supabase/Postgres environment with synthetic `auth.users` and outbox data. Validate:

| Case | Expected invariant |
|---|---|
| Valid TESTER capability | Claim only the two Tester pair types |
| Valid GITHUB capability | Claim only GitHub-approved execution pair |
| Finance/unknown action | Leave status, claimed_at, claimed_by, lease_expires_at, attempt_count, next_attempt_at unchanged |
| Anonymous, disabled, revoked, unconfigured, service-role-only identity | No claims; explicit authorization rejection |
| Forged `p_lane` | Cannot expand fixed server capability |
| `PENDING`, `RETRY_WAIT` due, expired `CLAIMED` | Follow original eligibility; expired leases may be reclaimed once |
| `RETRY_WAIT` not due, unexpired `CLAIMED`, `CANCELLED`, held work | Not touched |
| Two concurrent claimers | No row claimed twice; `FOR UPDATE SKIP LOCKED` protects overlap |
| Duplicate enqueue, duplicate delivery | Preserve unique idempotency key; do not duplicate attempts or receipts |
| Tester unavailable | Tester claim not attempted; GitHub lane decision made independently |
| Repeated failure, max attempts, release of lease | Enforce original bounded retry and owner-visible failure rules (later end-to-end test) |

## Deferred release checks
- Confirm installed PostgreSQL function signature/owner/grants using exact authorized read, because default-branch migrations are not proof of installed behavior.
- Verify Supabase Auth/JWT claims and `auth.users` policy in isolated environment. No service-role bypass.
- Check the exact GitHub default-branch head at branch creation; no overwrite.
- Review migration vs source ledger order, owner grants, SECURITY DEFINER access and RLS implications.
- Require exact-head static checks, isolated SQL integration tests, fail-closed worker tests, review of workflow change, and later approval for each external write.
- During separate rollout: disable worker during cutover; migrate consumer and claim path together; confirm observed execution and resulting receipts without finance actions.
- Finance consumer, eight dated finance-close items, schedules, HQ changes and payment actions are outside this branch proposal.

## Actions authorized by this document
None. It is an implementation proposal, not authority to create a branch, write to GitHub, execute SQL, install dependencies, launch tests/workflows, change credentials, deploy, or process work.
