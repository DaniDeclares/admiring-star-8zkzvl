# Recurring service recovery and extension

This change extends the existing paid-first service subscription aggregate and the quote → paid assignment → execution → evidence → QA flow. It does not create a separate marketplace, rate catalog, subscription SKU family, or provider ownership taxonomy.

## Authority checked live

- Source baseline: GitHub `main` at `caa2a65e75b481fa496bf7e0b9ff1db7a2bfc3a3`. Historical PR #560 is now merged. Open PRs #559, #558, #557 and #520 were checked for file overlap; none overlap this change.
- During publication, `main` advanced to `33ddab6824e3c24613dfad347510d4a31c8ec9f5` with a separate channel-pricing/normalization fix. Its four changed files do not overlap this task; that commit is merged into this branch and the combined code is reverified.
- Production divisions: 13 rows. Division 01 is **Home, Pet, Plant & Household Support**; Division 02 is **Property, Facilities & Field Operations**. Division 03–13 names follow canonical hydration, not the older 10-division catalog.
- Canonical channels remain CH01–CH06. Production currently contains CH01–CH05 channel rows, so missing CH06 is runtime drift, not evidence of retirement. This migration does not repair or rename taxonomy.
- Production contains 15 recurring/monthly service records and zero subscription instances. Existing household membership, plant care, administrative retainers, Monthly HQ support, bookkeeping, marketing and business development records are reused subject to their own release gates.
- `src/data/retainerPlansData.js` remains intentionally empty: legacy prices are quarantined. Monthly amounts come from approved frozen estimates, not a newly invented price table.
- Production already has `dd_service_subscriptions`; Tester lacked it. The new migration reuses the exact existing paid-first baseline before extending it.
- Vercel project and environment names were checked in team `team_E1ObiftcLzJdXzNE0W2fs6PG`. `STRIPE_BILLING_PORTAL_CONFIGURATION_ID` is absent. Values were not read. No Stripe cancellation configuration is claimed as verified.

## Resulting behavior

Owner HQ can propose immutable scope, exclusions and included allowance terms for an existing approved monthly quote. The customer accepts those terms in the existing portal and proceeds through the existing checkout gates. Only existing CH01 subscription checkout eligibility is supported; this change does not open CH02–CH06 payments or quote-priced subscriptions.

Subscription checkout requires an active Stripe billing portal configuration with period-end cancellation enabled and self-service subscription updates disabled. The ordinary one-time invoice action refuses monthly services. No customer can buy a subscription through the new path while cancellation management is unconfigured.

Signed paid invoice events must match the approved monthly amount, currency, canonical service/channel identity and accepted terms. An invoice creates one immutable paid period with its own allowance snapshot. Duplicate invoices/periods, overlapping periods, proration and ambiguous invoices are held. Payment evidence is inserted before the existing paid assignment activation gate.

The first eligible paid creation invoice can open a job through `dd_jobs`. Renewal payment records a cycle with `REVIEW_REQUIRED`; a fresh approved quote, current economics snapshot, active Stripe subscription and commercial release are required before opening its job. The existing assignment and provider route gates are reused. No prior assignment or provider compensation is silently renewed.

Usage can be recorded only by staff against that cycle's job after completed execution and approved QA. The database independently enforces this boundary. Excess remains visible and requires a separate quote; it never generates an automatic overage charge. Unused allowances expire, with no rollover. Each billing period begins with its own allowance quantities. Customer billing access is authenticated and scoped to the request owner; residents cannot inherit all subscriptions in their property organization.

The seven commercial types remain `SERV`, `PROD`, `DIGITAL`, `KIT`, `RET`, `EVENT`, `WORK-ORDER`; approving recurring terms must preserve the canonical service's object type. Provider identity does not alter division ownership. Phase 1 reconciliation and canonical release remain prerequisites for commercialization.

## Verification receipts and limits

- Full local suite: 42 suites / 210 tests passed, 7 pre-existing tests skipped. Focused final lifecycle/API/portal suite: 25 tests passed after the final identity and route checks.
- Optimized application build and generated SEO validation pass.
- Isolated PostgreSQL migration proof: 13 checks pass, including existing execution/evidence/QA completion guards, usage restrictions, duplicate cycles/usage, and anonymous access denial.
- Tester migration ledger version: `20261004050403`, name `recurring_terms_cycles_usage`. Rollback-only live proof passes QA denial, invoice uniqueness and client privilege checks. Afterwards subscriptions, terms, cycles and usage each contain zero rows. The earlier attempt that could not locate a linked Tester estimate was not treated as a pass.
- Production business schema and offers are unchanged. Engineering ledger registration: `6c50a2c6-31bd-461e-aa4b-03d90880a3a8`.
- A local build is not deployment or live Stripe proof. Exact-head CI, preview deployment, protected runtime checks, Production migration/promotion and Stripe test-mode lifecycle proof remain release gates. No live charge or cancellation was created for testing.

## Reproduce the isolated database proof

Run from the repository root. The test dependency is installed outside the application and is not a production dependency:

```bash
proof_dir=$(mktemp -d)
npm install --prefix "$proof_dir" --no-audit --no-fund @electric-sql/pglite@0.5.8
cp scripts/proofRecurringSubscriptionPostgres.mjs "$proof_dir/proof.mjs"
DANI_REPO_ROOT="$PWD" node "$proof_dir/proof.mjs"
```

Before activation, verify a dedicated Stripe configuration and its terms, use test-mode invoices to exercise creation, retry, renewal, failure, cancellation-at-period-end and expiration, then verify the exact approved deployment against its intended database. Preserve commercial holds throughout. Do not use a Production customer as a test fixture.
