# DANI DECLARES Channel Release Procedure — 2026

## Purpose

Use CH02 as the reference procedure for completing each DANI customer channel end-to-end. A channel is not GREEN because its page renders; it is GREEN only when the public journey, routing, commercial authority, quote path, fulfillment, payment, runtime verification and reconciliation all agree.

## 1. Define the channel contract

Lock:
- customer relationship values
- channel code
- allowed service divisions/families
- public-vs-quote-required behavior
- pricing authority
- discount eligibility
- geography/market rules
- scope/tier/modifier rules
- payment terms
- fulfillment/provider requirements
- release gates

Canonical routing pattern:

Customer Relationship → Channel → Market → Service/SKU → Scope/Tier → Modifiers → Final Quote

## 2. Build the public acquisition path

Starting from Who We Serve:
1. customer selects the audience/relationship;
2. destination page clearly identifies that audience;
3. page presents the channel's composed solutions first;
4. every composed solution has either a governed buy path or Get Quote Now;
5. secondary services are discoverable without burying the primary offers;
6. recurring packages/retainers are presented as governed commercial relationships;
7. no customer has to manually select the wrong relationship later.

## 3. Carry routing context through the URL/intake

The CTA must carry the channel context into request intake.

For CH02:
- `channelType=B2B_APT`
- service/SKU is carried when known

The intake record must persist:
- service
- customer relationship
- channel type
- customer name
- email
- phone
- organization
- service location
- requested timing
- request details
- commercial intent
- routing context

## 4. Create the commercial work object early

For quote-controlled B2B requests, create a draft `dd_estimates` record at intake.

The draft must already contain:
- `client_type`
- organization name
- customer contact information
- property/location
- source request
- service/SKU
- original channel
- intake answers
- internal routing note

Staff should open the quote with context already resolved rather than reconstructing the customer.

## 5. Resolve the correct pricing authority before quote editing

The quote builder must resolve the relationship/channel before loading its pricing catalog.

Examples:
- Resident → CH01
- Property Management / Apartment → CH02
- Real Estate → CH03
- Business / Commercial → CH04
- Government / Institutional → CH05

A non-CH01 quote must never inherit resident discounts.

The UI must consume governed pricing rules; it must not invent customer prices.

## 6. Separate market from channel

Market/geography is an independent pricing dimension.

Do not:
- create market-specific duplicate SKUs;
- use market as a substitute for customer relationship;
- allow a resident price to leak into a commercial channel.

Resolve:

Channel → Market → Service/SKU → Scope/Tier → Modifiers

## 7. Commercial cost underwriting

Maintain three internal cost pools:

### Direct COGS
- loaded/direct labor
- consumables/materials
- disposal/pass-through costs

### Operating overhead
- insurance/risk
- fleet/fuel/mobilization
- equipment depreciation

### Corporate G&A
- software/CRM
- AP/invoicing/transaction processing
- cyber and administrative insurance

Benchmark inputs are reference-only until reconciled to actual DANI financial records. They do not directly set customer-facing prices.

## 8. Quote workflow

When staff clicks Process Quote:
1. customer relationship is already resolved;
2. correct channel catalog is already loaded;
3. company/customer information is prefilled;
4. service/SKU is preselected when known;
5. channel-specific price rule is loaded;
6. quote-input schema determines required questions;
7. market and scope modifiers are collected;
8. pricing is calculated;
9. review flags are shown;
10. quote/estimate is saved with a frozen pricing snapshot before sending.

## 9. Fulfillment and payment

Before GREEN:
- service is channel-authorized;
- provider/fulfillment path is authorized;
- task template exists;
- payment path is governed;
- Stripe/payment identifiers are verified where applicable;
- deposit/payment terms match the commercial contract;
- quote-to-job conversion is tested.

### CH05 procurement payment prohibition (hard release gate)\n\nCH05 Government & Institutional Procurement is a distinct authorized channel, not a consumer checkout audience. No CH05 offer may generate, activate, display, or validate a public Stripe Payment Link, Checkout Session, direct-pay button, or consumer deposit request. CH05 must use solicitation/qualification → award and signed contract or purchase order → authorized performance → compliant invoice → agency-approved payment terms. An agency-authorized electronic invoice or remittance does not grant permission for public checkout. Fail closed if channel identity is missing or contradictory; do not silently fall back to CH04 or CH01. Historical CH02 property-management records remain CH02 and must not be renumbered.\n\nRelease regression proof must exercise CH01–CH04 permitted paths, CH05 public-checkout rejection, CH05 procurement invoice path, and ambiguous-channel rejection. Existing public payment links associated with CH05 require review and controlled deactivation; never silently delete historical financial evidence.\n\n## 10. Public/runtime smoke test

Test the entire path, not isolated components:

Who We Serve → Channel Page → Composed Solution → Get Quote → Intake → Request Record → Draft Estimate → Quote Builder → Channel Pricing → Customer/Company Prefill → Quote Save → Payment/Approval → Fulfillment

Record:
- preview build result
- authenticated quote-builder result
- runtime logs
- pricing resolution
- final estimate snapshot
- release-contract verification

## 11. GREEN criteria

A service/channel combination is GREEN only when:
- canonical identity passes;
- commercial definition passes;
- channel authorization passes;
- locked pricing rule exists;
- market resolution passes;
- quote-input contract passes;
- fulfillment path passes;
- payment path passes;
- runtime accuracy passes;
- regression passes;
- production smoke passes.

Never manufacture verification timestamps or bypass a HOLD gate.

## 12. CH02 reference implementation

CH02 currently demonstrates:
- property-specific public landing page;
- two composed Turnover Ready solutions;
- channel-specific public pricing;
- broader CH02 service discovery;
- recurring-property relationship entry;
- B2B_APT routing;
- draft estimate creation for B2B intake;
- organization/contact/location prefill;
- CH02 pricing authority;
- CH01-only resident discount enforcement;
- internal commercial cost benchmark ledger;
- quote-builder channel resolution.

## 13. Replication for CH01 / CH03 / CH04 / CH05

For each new channel, copy the procedure—not the pricing.

Create a new channel dossier containing:
1. audience/relationship map;
2. public journey;
3. composed solutions;
4. service catalog;
5. pricing authority;
6. market rules;
7. quote schema;
8. commercial cost model;
9. payment terms;
10. fulfillment/provider matrix;
11. runtime smoke script;
12. release evidence.

Channel-specific pricing and commercial rules must be researched and reconciled independently.


## Front-door regression operating controls (2026-10-21)

Accountable owner: DANI owner / authorized release maintainer. Reuse
`.github/workflows/dani-software-quality-loop.yml`; do not add a scheduler.
The existing triggers are PRs to main, pushes to main, manual dispatch, and
`23 */4 * * *` (UTC). The deterministic job has read-only repository permission,
a 20-minute limit, and one cancellable run per Git ref.

After the ordinary build, the added browser step runs
`node --test checks/requestFrontDoorBrowser2026.test.mjs`. It serves only the
local build, uses fixed synthetic catalog fixtures, blocks every non-local
request and every non-GET request, and blocks service workers. No credentials,
database, queue, customer data, payment, dispatch, or delivery provider is used.
The test has a 90-second ceiling and a 15-second browser launch ceiling; failures
are terminal check failures, without automatic submission retries. GitHub job
logs/check status are the existing failure visibility destination; this change
adds no messages or alert recipients. The existing live smoke is now GET/HEAD
only; it does not submit validation payloads to production.

The event broker already deduplicates outbox intents using event_key; that does
not make HTTP intake retries idempotent. Intake creates requests and booking
holds, then queues customer/operator messages. Do not enable automatic intake
retries or claim end-to-end reliability until persistence, authorization,
transaction/outbox failure handling, and concurrent equivalent retries have
been verified through the authorized database/release process. PR #670 remains
the separate outbox repair; this release does not replace it.

Pause/rollback only the new browser check by reverting its two workflow steps
and associated regression changes. Disabling the entire quality loop also
stops existing checks and requires a separate decision. UI repair rollback is
a reviewed revert of the front-door commits and normal Vercel redeployment;
there is no migration or data reversal in this change. Verify the exact deployed
SHA and read-only catalog/routes after release. Database writes and production
test submissions require their own exact payload/effects approval.

Status: new checks and repairs are locally prepared, not published or enabled
by this document. Historical successful runs do not verify this new revision.
