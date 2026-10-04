# DANI Repository and Runtime Authority Map (2026-10-03)

Status: owner-directed governance map. Purpose: prevent parallel systems, stale-repo work, and rebuilds caused by source/runtime confusion.

Read with:
- `AGENTS.md`
- `docs/governance/DANI_AI_DIVISION_OF_LABOR_2026-10-02.md`
- `docs/governance/DANI_HOSTING_RAIL_2026-10-03.md`
- `docs/DANI_DECLARES_CROSS_SYSTEM_AUTHORITY_2026-09-14.md`

## 1. Canonical application repository

### DaniDeclares/admiring-star-8zkzvl
Classification: **CURRENT AUTHORITY**

Use for:
- DANI DECLARES production application source
- DDOS / portal / Owner HQ / provider and customer lifecycle
- Supabase migrations and database source history
- sales / research / automation / Brain integration code
- governed release, CI, deployment configuration, tests and docs

Rules:
- `main` is Production source authority.
- Ordinary changes use one branch / one PR.
- Existing subsystem history must be recovered before downstream changes.
- No other DANI-owned repository may override this repo merely because it contains older or experimental code.

## 2. Noncanonical repositories

### DaniDeclares/danideclares-react-app
Classification: **HISTORICAL / REFERENCE — DO NOT DEPLOY AS DANI AUTHORITY**

Observed lineage:
- Early CodeSandbox-era React application.
- September 30, 2026 demand-capture / demand-radar work was committed here.
- The four surviving Supabase migrations are byte-for-byte identical to the copies now present in canonical `admiring-star-8zkzvl/main`:
  - `20260930230000_demand_capture_staging.sql`
  - `20260930230500_demand_capture_promotion.sql`
  - `20260930231500_demand_radar_controller.sql`
  - `20260930232000_demand_radar_dedupe_repair.sql`
- October 1 deployment-probe commits explicitly diagnosed source mismatch and reverted the probe.

Disposition:
- Demand-radar database work: **ALREADY ABSORBED** into canonical repo.
- Legacy React pages/navigation: **SUPERSEDED** by the canonical application unless a future history audit proves a unique still-needed behavior.
- Do not connect this repo to Production hosting or treat it as a migration source.

### DaniDeclares/dani-declares-fieldops
Classification: **HISTORICAL FOS IMPLEMENTATION / REFERENCE**

Observed lineage:
- Built as a separate Next.js Fulfillment Operating System portal foundation.
- Contains owner, provider and customer portal surfaces; work-order transitions; provider execution actions; change-order request handling; provider application intake; Supabase SSR auth.
- Its core database concepts/RPCs are present and have continued evolution in the canonical repo, including:
  - `dd_work_orders`
  - `dd_owner_transition_work_order`
  - `dd_transition_job`
  - `dd_job_assignments`
  - `dd_change_orders`
  - provider application / portal / QA / payable machinery
- Canonical source later clarified that `dd_jobs` is Production dispatch authority, while `dd_work_orders` is detailed/forward-looking fulfillment state. Therefore the separate FOS app must not become a competing runtime authority.

Disposition:
- Fulfillment concepts: **ALREADY ABSORBED / EVOLVED** in canonical repo.
- Standalone Next.js portal implementation: **SUPERSEDED AS AN ACTIVE APP**.
- Keep as historical reference until all useful UI/flow ideas are explicitly reconciled; do not deploy as a second provider/owner portal.

### DaniDeclares/builderio-shopify-commerce-headless
Classification: **EXPERIMENT / REFERENCE ONLY**

Observed lineage:
- Generic Builder.io + Shopify + Next.js starter created from Vercel.
- No DANI-specific operational authority identified.
- Includes storefront/cart/product/collection starter code and Builder.io integration examples.

Disposition:
- Not DDOS.
- Not DANI Production source.
- Not current commerce authority.
- Reuse code patterns only after a specific need is proven; never wire it into Production merely because the repo exists.

## 3. Supabase projects

### ajxezpczaemunlcmqlgl — DaniDeclares's Project
Classification: **DANI PRODUCTION RUNTIME AUTHORITY**
Status at audit: ACTIVE_HEALTHY, us-east-2.

Use for:
- real DANI operational state
- customers/providers/jobs/dispatch
- live portal identities
- commercial and operational records
- Production verification after governed release

Never:
- seed synthetic proof data to manufacture green
- copy Tester wholesale into Production
- treat historical repo state as newer than current Production + canonical source reconciliation

### okvepooyxurujcwgfoju — DANI Owner Walkthrough Test
Classification: **DANI TESTER / PROOF / RESEARCH / BRAIN ENVIRONMENT**
Status at audit: ACTIVE_HEALTHY, us-east-2.

Use for:
- deterministic proof
- research and Brain learning
- simulations and safe fixtures
- promotion candidates
- pre-Production verification

Rules:
- Tester is not a second company.
- Tester passing does not mean Production is green.
- Material Tester artifacts must resolve through existing promotion / research-only / retire semantics and bridge evidence.

### yxhbernpesgzvfdoubyd — shadow-and-sol
Classification: **SEPARATE ENTITY / SEPARATE PROJECT**
Status at audit: INACTIVE, us-east-1.

Use for:
- Shadow & Sol only when that entity is explicitly being worked on.

Never:
- use as DANI Tester
- mix DANI provider/customer/business runtime into it
- promote DANI state into it by default

## 4. Vercel deployment projects

Live connected Vercel context at audit:

### Team: danideclares — Hobby
Linked project:
- `admiring-star-8zkzvl-dhnz`
- Git source: `DaniDeclares/admiring-star-8zkzvl`

Classification: **CURRENT DANI PRODUCTION HOSTING AUTHORITY**

Use for:
- Production/Preview deployment of canonical repo
- runtime/deployment verification for exact commit

### Team: danideclares' projects — Pro
Live connected Git projects at audit: **none**

Classification: **NOT CURRENT DANI DEPLOYMENT AUTHORITY**

Do not assume an unused paid team/project is part of the runtime merely because the account exists.

## 5. Authority decision table

| Concern | Authority |
|---|---|
| Production source code | `DaniDeclares/admiring-star-8zkzvl main` |
| Production DANI runtime data | Supabase `ajxezpczaemunlcmqlgl` |
| Tester / research / Brain proof | Supabase `okvepooyxurujcwgfoju` |
| Shadow & Sol runtime | Supabase `yxhbernpesgzvfdoubyd`, separate entity |
| Production hosting | Vercel `admiring-star-8zkzvl-dhnz` on Hobby team |
| Old React repo | history/reference only |
| FieldOps repo | history/reference only; canonical fulfillment evolved beyond it |
| Shopify/Builder repo | experiment/reference only |

## 6. Required history-first behavior

Before declaring a capability missing or building another system:
1. Check canonical main.
2. Check relevant merged/open/closed work.
3. Check this authority map.
4. Check noncanonical repositories if the subsystem predates consolidation.
5. Check Tester and Production current truth.
6. Classify the finding as CURRENT AUTHORITY, STILL VALID/REUSE, SUPERSEDED, FAILED/ABANDONED, DRIFTED, or GENUINELY MISSING.
7. Reuse or repair first.
8. Build only for a demonstrated missing capability.
9. Prove in Tester/non-production where applicable.
10. Promote through the existing release path and verify Production.

## 7. Archival policy

Do not delete or archive a noncanonical repo solely because it is no longer authoritative. First confirm:
- unique approved behavior is not stranded there;
- migrations/source were absorbed or deliberately retired;
- deployment/integration references do not still point at it;
- historical evidence needed for reconciliation remains recoverable.

After that audit, a repo may be marked archival/reference to reduce future source confusion.
