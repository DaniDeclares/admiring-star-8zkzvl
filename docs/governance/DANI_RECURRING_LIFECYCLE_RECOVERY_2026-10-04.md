# Recurring service recovery and extension

This change extends the existing paid-first service subscription aggregate and the quote → paid assignment → execution → evidence → QA flow. It does not create a separate marketplace, rate catalog, subscription SKU family, or provider ownership taxonomy.

## Authority checked live

- Source baseline: GitHub `main` at `caa2a65e75b481fa496bf7e0b9ff1db7a2bfc3a3`. Historical PR #560 is now merged. Open PRs #559, #558, #557 and #520 were checked for file overlap; none overlap this change.
- During publication, `main` advanced to `33ddab6824e3c24613dfad347510d4a31c8ec9f5` with a separate channel-pricing/normalization fix. Its four changed files do not overlap this task; that commit is merged into this branch and the combined code is reverified.
- Production divisions: 13 rows. Division 01 is **Home, Pet, Plant & Household Support**; Division 02 is **Property, Facilities & Field Operations**. Division 03–13 names follow canonical hydration, not the older 10-division catalog.
- The owner explicitly corrected the earlier six-channel recovery on 2026-10-04: the existing **five Production channels are correct**. Preserve CH01 Resident Concierge; CH02 Property Management & Apartments; CH03 Real Estate Offices & Brokerages; CH04 Businesses; CH05 Government & Institutional Procurement. The six-channel transcript is historical evidence superseded by that owner correction. CH06 is not accepted or added. No taxonomy rows are changed.
- Production contains 15 recurring/monthly service records and zero subscription instances. Existing household membership, plant care, administrative retainers, Monthly HQ support, bookkeeping, marketing and business development records are reused subject to their own release gates.
- `src/data/retainerPlansData.js` remains intentionally empty: legacy prices are quarantined. Monthly amounts come from approved frozen estimates, not a newly invented price table.
- Production already has `dd_service_subscriptions`; Tester lacked it. The new migration reuses the exact existing paid-first baseline before extending it.
- Vercel project and environment names were checked in team `team_E1ObiftcLzJdXzNE0W2fs6PG`. `STRIPE_BILLING_PORTAL_CONFIGURATION_ID` is absent. Values were not read. No Stripe cancellation configuration is claimed as verified.

## Resulting behavior

Owner HQ can propose immutable scope, exclusions and included allowance terms for an existing approved monthly quote. The customer accepts those terms in the existing portal and proceeds through the existing checkout gates. Only existing CH01 subscription checkout eligibility is supported; this change does not open CH02–CH05 payments or quote-priced subscriptions.

Subscription checkout requires an active Stripe billing portal configuration with period-end cancellation enabled and self-service subscription updates disabled. The ordinary one-time invoice action refuses monthly services. No customer can buy a subscription through the new path while cancellation management is unconfigured.

Signed paid invoice events must match the approved monthly amount, currency, canonical service/channel identity and accepted terms. An invoice creates one immutable paid period with its own allowance snapshot. Duplicate invoices/periods, overlapping periods, proration and ambiguous invoices are held. Payment evidence is inserted before the existing paid assignment activation gate.

The first eligible paid creation invoice can open a job through `dd_jobs`. Renewal payment records a cycle with `REVIEW_REQUIRED`; a fresh approved quote, current economics snapshot, active Stripe subscription and commercial release are required before opening its job. The existing assignment and provider route gates are reused. No prior assignment or provider compensation is silently renewed.

Usage can be recorded only by staff against that cycle's job after completed execution and approved QA. The database independently enforces this boundary. Excess remains visible and requires a separate quote; it never generates an automatic overage charge. Unused allowances expire, with no rollover. Each billing period begins with its own allowance quantities. Customer billing access is authenticated and scoped to the request owner; residents cannot inherit all subscriptions in their property organization.

The seven commercial types remain `SERV`, `PROD`, `DIGITAL`, `KIT`, `RET`, `EVENT`, `WORK-ORDER`; approving recurring terms must preserve the canonical service's object type. Provider identity does not alter division ownership. Phase 1 reconciliation and canonical release remain prerequisites for commercialization.

## Verification receipts and limits

- Full local suite after current main reconciliation: 42 suites / 217 tests passed, 7 pre-existing tests skipped. Focused lifecycle/API/portal tests: 27 tests pass after the final identity and route checks.
- Optimized application build and generated SEO validation pass.
- Isolated PostgreSQL migration proof: 13 checks pass, including existing execution/evidence/QA completion guards, usage restrictions, duplicate cycles/usage, and anonymous access denial.
- Tester migration ledger version: `20261004050403`, name `recurring_terms_cycles_usage`. Rollback-only live proof passes QA denial, invoice uniqueness and client privilege checks. Afterwards subscriptions, terms, cycles and usage each contain zero rows. The earlier attempt that could not locate a linked Tester estimate was not treated as a pass.
- Production business schema and offers are unchanged. Engineering ledger registration: `6c50a2c6-31bd-461e-aa4b-03d90880a3a8`.
- Stripe **test mode**, DANI DECLARES account: fixture clock `clock_1UMhqTChHm1uJK9xy2dvKtFD`, customer `cus_VNSm4BzEV0rMSn`, subscription `sub_1UMhsKChHm1uJK9x6Pgs2gIA`, paid creation invoice `in_1UMhsKChHm1uJK9xjjKjg5mV`. The $1 monthly price is exclusively a labeled TEST_ONLY fixture, never a DANI catalog rate. Period-end cancellation was verified with the subscription still active and `cancel_at=1793769600`. Cleanup then canceled only that test subscription and archived fixture product `prod_VNSmQTq9oCOUQD`; the default price cannot be independently archived. No email was attached to the test customer. The connector did not expose test-clock advancement, so external renewal and expiration proof remain pending. A sanitized real-invoice fixture is checked by the application validator.
- Actual Stripe API receipts omitted the older `paid` boolean and moved subscription period fields to items. Verification now relies on paid status plus exact paid amount/total and rejects explicit `paid=false`. Subscription notifications cannot replace the verified paid-period end with an unverified future period.
- Node CI and DANI Software Quality Loop passed for reconciled head `5c33eea6358134faf5fc2ee0bdcb7a0073e254f2`; its exact Vercel preview is READY (`dpl_yXziRUcUxrAyEoQgHwZ1xEGrRXxQ`). Authenticated fetch remained blocked with `deployment_authentication_required`, so this is deployment proof, not runtime proof. The owner channel correction and Stripe compatibility changes require fresh exact-head checks.
- A local build is not deployment or live Stripe proof. Exact-head CI, preview deployment, protected runtime checks, Production migration/promotion and Stripe test-mode lifecycle proof remain release gates. No live charge or cancellation was created for testing.

## Post-merge Billing Portal dependency receipt (2026-10-05)

Read-only re-verification after #562 merged as `b92320fe`. Supersedes the "absent" observation in *Authority checked live* above for the Billing Portal dependency only.

- Vercel team `team_E1ObiftcLzJdXzNE0W2fs6PG`, project `admiring-star-8zkzvl-dhnz` (`prj_sjL4eMox6OLrt6daRuJxUJeKA1Ba`): `STRIPE_BILLING_PORTAL_CONFIGURATION_ID` exists, type `encrypted`, target `production` only, created 2026-10-04 20:42:07 UTC. Value was not decrypted or read.
- Current Production deployment `dpl_8kGxGw9mGvMYpnQWAtRG9KuVwsAN` (READY, `main` `943e9b532e4226ff7ca2650152577edd99e8aa5c`) was created after that variable, so the current Production build carries it.
- Stripe **live** mode, DANI DECLARES account, configuration `bpc_1UMwA4ChHm1uJK9xO55YGP2W` (read via GET only): `active=true`, `is_default=true`, `subscription_cancel.enabled=true`, `mode=at_period_end`, `proration_behavior=none`, `subscription_update.enabled=false`, `subscription_pause.enabled=false`. This satisfies `hasPeriodEndCancellation()` in `src/lib/operations/recurringServiceLifecycle2026.js`. The Vercel variable comment names this configuration; equality of the encrypted value with this ID is attested by the owner's #562 closing comment, not by reading the secret.
- Production `dd_service_subscriptions`, `dd_service_subscription_terms`, `_cycles` and `_usage` each contain 0 rows. No customer charge, subscription or cancellation was created by this check.

Disposition: the Billing Portal configuration dependency is **resolved**. Recurring checkout is no longer held on it. Recurring checkout remains gated by its other existing controls (accepted immutable terms, frozen monthly amount, CH01-only eligibility, canonical release). Live renewal/expiration outcomes remain `OBSERVING` until a real governed subscription completes a cycle; Stripe test-clock renewal/expiration proof remains pending as recorded above.

## Reproduce the isolated database proof

Run from the repository root. The test dependency is installed outside the application and is not a production dependency:

```bash
proof_dir=$(mktemp -d)
npm install --prefix "$proof_dir" --no-audit --no-fund @electric-sql/pglite@0.5.8
cp scripts/proofRecurringSubscriptionPostgres.mjs "$proof_dir/proof.mjs"
DANI_REPO_ROOT="$PWD" node "$proof_dir/proof.mjs"
```

Before activation, verify a dedicated Stripe configuration and its terms, use test-mode invoices to exercise creation, retry, renewal, failure, cancellation-at-period-end and expiration, then verify the exact approved deployment against its intended database. Preserve commercial holds throughout. Do not use a Production customer as a test fixture.
