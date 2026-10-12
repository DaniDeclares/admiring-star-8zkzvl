# OP1M execution record — Sunday 2026-10-11

Docs-only handoff. No runtime code, migration, price, payment, provider, customer or Production data changed.
Ledger: `dd_agent_change_ledger` 9cb7440f-b63b-41f4-a376-10efc48567cc.
Evidence is read-only: GitHub (main `b73e92f`), Vercel, and Supabase Production `ajxezpczaemunlcmqlgl` (677 ledger rows; Tester is `okvepooyxurujcwgfoju`, 846 rows).

## A. Release state

### Hosting: undeployed fixes on Production — BLOCKED (external)
- Production runs main `cf875ff`. Main is `b73e92f`; no Vercel deployment exists for it.
- Undeployed: `f23dcea` (blocks procurement/CH05 checkout by normalized invoice routing identity) and `aa39bbc`/`b73e92f` (disables unsafe bulk Printify product creation).
- Cause: Vercel Hobby build rate limit. Status on #591 and #637: "Deployment rate limited — retry in 24 hours" (set 2026-10-10 22:13 UTC and 2026-10-11 04:42 UTC).
- Next: after the limit resets (about 2026-10-12 04:42 UTC), redeploy main `b73e92f` through the normal release path. Verify the deployment SHA, then re-check CH05 checkout rejection on the live site.
- Not done by me: a Production deploy needs owner authorization.

### PR #591 (migration ledger + replay) — REPAIR IN PROGRESS, not mergeable
- Exact head `3d13eb2`: test, build 22.x, deterministic-quality and CodeQL pass. **`replay` fails.**
- Failure: `20260930140500_owner_dani_three_horizon_planning.sql` references `public.dd_brain_objectives` (SQLSTATE 42P01). Everything before it replays cleanly.
- Root cause (verified): that table exists only in Tester. Its creator is Tester migration `20260926180512_tester_root_brain_constitution_and_trickle_down`, which is in neither main nor #591. Production never applied `20260930140500` (0 rows) and has no `dd_brain_objectives`.
- So the failing file is a Tester-only migration in `main` whose prerequisite is missing from source. Applying it to Production would fail the same way.
- Second finding: #591 is stale relative to Production. 103 Production-applied versions dated 2026-10-02..2026-10-10 (for example `20261002211638`, `20261003032519`, `20261006172531`, `20261010034753`) have no source file on #591 or main. Of the 108 source versions after `20260930140500`, 70 are not in the Production ledger.
- Recommended repair (owner/engineering decision before more shims): (1) scope the Production replay gate to the Production-lineage versions and run Tester-only migrations through a separate promotion preflight; or (2) promote the Tester creator, which also seeds Tester constitution rows and redefines `dd_brain_trickle_down`, so it needs review before it enters Production lineage. Then reconstruct the 103 missing sources from `supabase_migrations.schema_migrations.statements`. Shimming each failure one at a time is unbounded, so I stopped.
- No local replay was possible (no Docker daemon); CI is the only runner.

### PR #637 (Owner HQ outcomes) — TESTER PROVEN, Production proof pending
- All GitHub Actions checks pass on `3084bbc`. Only Vercel fails (rate limit).
- The merge condition "verify Production response and role security" cannot be met until a deployment exists. Do not merge before that.

### PR #629 — closed, superseded by #630
- #630 contains `jobMarginReview2026.js` and its test byte-for-byte (owner comment 2026-10-10 22:01/22:03). Still draft; not wired into Owner HQ. Review of the evaluator against the mandate's rules (UNKNOWN costs, no zero-hour assumption, alert dedup) is still open.

## B. Catalog (Production `dd_service_release_contract_v1`, 410 services)

| release_state | blocking gate | n | payment_path_verified |
|---|---|---|---|
| LIVE_READY | NONE | 108 | 26 |
| HOLD | PAYMENT_LEDGER | 127 | 0 |
| HOLD | ECONOMICS | 76 | 0 |
| HOLD | COMMERCIAL_DEFINITION | 61 | 35 |
| HOLD | RUNTIME_ACCURACY | 11 | 0 |
| BLOCKED | BLOCKED | 83 | 13 |

LIVE_READY by division (payment-verified in brackets): 01: 8 (6), 02: 2 (2), 03: 9 (0), 04: 45 (5), 06: 12 (10), 07: 10 (0), 08: 20 (1), 11: 2 (2). Divisions 05, 09, 10, 12 and 13 have none.

Strongest shelf today: the 26 services that are LIVE_READY with a verified payment path.
- Division 06, 10 fixed-price services ($149–$399, all with Stripe link and verified price).
- Division 01 Household Membership at $149 recurring (link and price verified).
- Division 04 monthly HQ support retainers ($650/$1,250/$1,500/$2,250) and the $1,095 Administrative Retainer.
- Division 08 Business Development Retainer ($1,500).
- Division 01 event/guest/seasonal services and Division 02 Asset Verification and Make-Ready Cleaning ($175).
- Division 11 DTF and heat-press apparel ($25, variable quote).
- Items with no payment link are quote-first or manual-invoice only; they must not be advertised as checkout.

Not re-verified here: Division 06 includes legal-adjacent formation support. Its `LIVE_READY` status comes from the release contract; owner review of compliance wording is advisable.

## C. Reported by #630, not re-verified by me
51 provider records with 0 approved and dispatch-ready; 5 submitted applications all BLOCKED (identity/tax and compliance pending, two agreements pending). Sales queue: 129 rows, 39 with a phone, 2 DNC, 0 campaign_eligible. These are the binding limit on fulfilment and outreach and are owner or external actions (agreements, tax documents, consent).

## D. Business scorecard

| Area | Operational proof | Experience proof |
|---|---|---|
| Release | BLOCKED: undeployed security fixes; #591 replay failing | not inspected |
| Catalog / shelf | 108 LIVE_READY, 26 with verified payment path; no real transaction proven | not inspected |
| Fulfilment | BLOCKED: no dispatch-ready providers (per #630) | not inspected |
| Sales | BLOCKED: 0 campaign-eligible rows (per #630) | not inspected |
| Owner HQ | #637 TESTER PROVEN; Production unproven | not inspected |
| Collected revenue | none verified in this session | n/a |

Rendered-page and screenshot QA, Stripe/Shopify/Gmail status (the Stripe connector requires owner authorization), and the economics evaluator review were not completed in this pass.

## E. Next executable actions
1. After about 2026-10-12 04:42 UTC: redeploy main `b73e92f`, verify SHA and CH05 checkout rejection. (Owner authorization needed.)
2. Decide the #591 replay-scope option in section A, then reconstruct the 103 missing sources.
3. Merge #637 only after a Production deployment shows correct role-gated responses.
4. Owner-only: provider identity/tax/agreement completion; consent confirmation for any outreach.

## Update (2026-10-11 later)

### Vercel
- Hobby build limit appears lifted: previews for this branch built and went READY (46b2ce7, 14ad62f). Still no deployment for main `b73e92f`; Production still runs `cf875ff`. A Production deployment needs owner authorization. Each push also costs a build, so pushes were kept few.

### PR #591 / Option 1 (see `docs/governance/PRODUCTION_REPLAY_SCOPE_2026-10-11.md`)
- Reconciled all 677 Production ledger rows against #591 source by SQL hash: 549 identical, 20 identical but renamed, 78 missing, 23 + 5 drifted, 2 with no recorded SQL. The earlier "103 missing" was overstated; 25 of those exist in source under another version. True gap: 78 missing + 28 drifted.
- Exact ledger SQL for those 106 is archived (hash-verified) and a deterministic assembler builds a Production-lineage replay set (686 files, zero errors). Tester-only files, including `20260930140500`, are excluded and still need their own promotion preflight. Replay not yet run on this set; wiring into #591's workflow needs that branch.

### PR #630 evaluator review (`jobMarginReview2026.js`, read only)
Sound: unknown inputs hold the job (nothing defaults to zero), gates are independent, no side-effect flags are ever true, hour thresholds and previous-level dedup work.
Defects to fix before wiring into Owner HQ: (1) `holds` is computed before the measured-margin gate updates, so it can still list `MEASURED_MARGIN_UNVERIFIED` after reconciliation; (2) `state`/`ownerReviewRequired` stay true for already-acknowledged reasons, so a consumer must key notifications on `newlyAppearedReasons`, not on state, or alerts will repeat; (3) an explicit 0 for remaining hours or costs passes validation and is only protected by the `costEvidenceVerified` flag, so the caller must derive that flag from real evidence. Not changed (not my branch).

### Products
See `docs/operations/PRODUCT_PRODUCTION_2026-10-11.md` and PR #638.

### Governed PR executor: dependency gap (verified 2026-10-11 PM; supersedes the earlier "warn and continue" idea)
Main's scheduled `DANI Governed PR Executor` has failed on every run since #636 merged (runs 71–74). It fails closed at step 6, before any candidate is claimed. The workflow calls six Production RPCs; only one exists in Production (`pg_proc` read):

| RPC | Used by step | In Production | Migration (in source, not applied) |
|---|---|---|---|
| `dd_claim_autobuild_candidate` | claim | yes (older body) | `20261010201500` replaces it |
| `dd_reconcile_autobuild_promotion_reviews` | recover stranded handoffs | **no** | `20261010210000` |
| `dd_hold_expired_autobuild_leases` | quarantine expired leases | **no** | `20261010213000` |
| `dd_route_autobuild_briefs_to_tech` | route briefs to Tech | **no** | `20261010214500` (atomicity fix is `20261010230000` in #637) |
| `dd_record_autobuild_pr_evidence` | record PR evidence | **no** | `20261010204500` |
| `dd_register_autobuild_promotion_review` | route built PR to review | **no** | `20261010203000` |

None of the six migrations is applied in Tester either (Tester ledger ends 20261010163007 and Tester lacks `dd_claim_autobuild_candidate` entirely), so #636 merged workflow code ahead of any database proof.
Why warn-and-continue was wrong: letting the two recovery steps pass would reach claim, open a PR, then fail at "record PR evidence" because that RPC is also missing, leaving a PR with no durable record and no lease reconciliation. The earlier commit doing this was reverted on #638.
Current state is fail-closed and safe: no new leases or PRs. Backlog is durable in `dd_autobuild_candidates` (49 pending candidates: 40 BLOCKED and 9 MANIFEST_READY, all BUILD_BRIEF_V1; 2 PR_OPENED; 0 expired leases), so nothing is lost while it is red.
The executor is NOT healthy and must not be reported healthy until the six migrations (in order, with `20261010230000`) are installed through the governed path with a Tester syntax proof and a Production readback. Needs owner authorization to apply to Production.

## Owner-supplied revenue-readiness inputs (received 2026-10-11)

Four files were supplied without instructions: `2026-10-09-addable-offers.md`, `remote_ranked_2.csv` (88 rows), `remote_services_2.csv` (188 rows), and `DANI_Catalog__Revenue_Readiness___Oct_9.docx`. They are dated 2026-10-09 and describe a read-only Production snapshot. They are **reference inputs, not authority**: Production Supabase remains the source of truth and every figure must be re-read before it is used for a public change.

What was done: nothing was changed. No price, listing, release state, quote, or outreach was altered from these files.

Material points carried into planning (all unchanged, all need owner decisions):
- 108 of 397 public services are LIVE_READY (88 remote). None is online-checkout eligible: the app economics gate needs a non-draft cost and a margin of at least 50%, and 106 of the 108 have draft costs. The release contract and the economics gate disagree.
- Sellable now by quote then invoice: the 88 remote services (business channels only) plus the three live remote services and Shopify kits. Owner-fulfilled hourly estimates ($80–177) rely on unaudited draft hours and assume owner pay is income; they are not margin approvals.
- Data defects flagged by the owner's analysis and not repaired here: `base_price_cents` vs `starting_price` mismatch (55), customer price text vs price on file (11+), 16 SKUs with both DO_NOT_SELL and SELL rows (DNI-01D-005 and DNI-01G-001 are LIVE_READY), duplicate "Vendor Coordination" (DNI-02A-019 / DNI-10A-006), labor-rate conflict for DNI-04A-001..020 ($30 vs $75–90/hr).
- Held for owner review (legal-adjacent / reputational): business-formation help including EIN Application Assistance ($299; the IRS issues EINs free) and similar DNI-06A items; the document's top-20 list includes them, so ranking by hourly must not promote them.
- Tier-2 Guest Room & Hospitality Setup ($85, DNI-01D-009) is the only residential item flagged clean in records; it still needs a Production re-read before promotion.
- The brief lists the Shopify storefront password as an owner decision and the store name "My Store 2". Neither was touched; no Shopify access exists in this session.
- Provider dispatch defect (zero of 51 providers can pass because a Stripe Connect record is required but never created) overlaps the #637 provider work. Fix scope belongs to the owner-approved business-rule change, not this session.

SHA-256 of the received files: see `docs/operations/` provenance list below.
    d55e16a2ae744aabf277c64da0bd5b9c0eeab1bb4878ba37795415553c4f9cc9 a54557d3-2026-10-09-addable-offers.md
    42652cc00b3e5286b9c9228c1ef47690188c962de86727f3649c90ddc9db1eab 9388f783-remote_ranked_2.csv
    c412394cebf87dc8f14e31c08604f64bc02e5ebedaa7b754dcc1ce24eca35670 23d4576d-remote_services_2.csv
    3d5473e47623299219ce236146a9cbbb11157e1d2ee16740766d1aa1f67bb58a f18f86b0-DANI_Catalog__Revenue_Readiness___Oct_9.docx

## Vercel deploy check for main `b73e92f` (scheduled routine, 2026-10-12 04:50 UTC)
State only; nothing was deployed, retried, or changed.
- `origin/main` head is `b73e92f` ("Handle relative CLI invocation for safe Printify audit entrypoint"); this branch already contains it (merge of main was a no-op).
- Vercel project `prj_sjL4eMox6OLrt6daRuJxUJeKA1Ba`, deployments filtered by sha `b73e92f`: **0 deployments exist**. Vercel has not built that commit (no READY, ERROR, or CANCELED entry).
- Latest Production deployment is still `dpl_7oAbP2prZQ9SpXQVfdD6gNusFbin`, `main` @ `cf875ff`, READY, created 2026-10-10T22:56Z. Production is therefore not serving `b73e92f`.
- Whether the Hobby rate limit has reset cannot be read from deployment listings; the absence of any `b73e92f` deployment is consistent with the limit still applying or with no build having been requested. Verify by the owner triggering or confirming a build, which this routine was not authorized to do.
- Next action (owner): decide whether to trigger a Production build of `b73e92f`; then confirm READY and function against the live site (READY alone is not proof).

## 9:00 AM Oct 13 readiness pass (2026-10-12, read-only plus Asana tasks)
AUDITED: Production service_requests, governed follow-up view, sales queue, Vercel production deployments, repo attribution code, Asana OP1M project `1219248953323716`.
FOUND:
- Service requests: 16 total; 11 `routed` (oldest 2026-08-29), 3 `proposal_pending` (newest 2026-10-11), 1 `scheduled` (the only one with a quote), 1 cancelled. 0 carry campaign attribution. The 3 proposal_pending and the 11 routed requests are the real inquiries needing owner response.
- `dd_governed_sales_followup_candidates_v1`: 9 rows, all due 2026-10-12, all matched to `DNI-02A-009` (LIVE_READY, quote-eligible, not checkout-ready). Named: Asset Living, Atlanta Area Property & Management, DHC, Evernest, Fort Knox, Fortis, Golden Gate, HomeOwners Advantage / Five Star, Sapir Realty.
- S-named CH02 accounts: Sapir Realty (5 duplicate rows), Stonemark (emailed 9/30), Summerfield (never contacted); Southern Homes and Rentals and Sharp Management are SUPPRESSED. Dunwoody Exchange: no row in sales queue, HubSpot, or Gmail.
- Conflict to resolve: lead metadata (set 2026-10-06) cites a "CH02 pilot baseline Essential 750 / Operations 1550 / Portfolio 2500, 30 pct hard floor". Those are not governed prices and the 30% floor contradicts the owner's 50% floor. Do not quote them. `outreach_authorized` is false on the Asset Living target.
- Sales queue consent: 0 verified `consent_marketing`; 2 do-not-contact.
- Production lags main: Production is `cf875ff`; main is `b73e92f` with no Vercel deployment.
AUTHORITY: Supabase Production (sales queue, requests, release contract); Vercel (deployment); Asana (execution tasks).
CHANGES MADE: 4 Asana tasks added to OP1M for 2026-10-13 (CH02 follow-ups, link click-verification, post-draft approval, unlinked provider applications). No Production, price, release-state or outreach change.
NOT SAFE (needs owner): any send to the follow-up list (consent unverified), provider approvals, Production build of `b73e92f`, promoting the cost-attribution view.
VERIFIED: counts above from live Production reads. NOT VERIFIED: public site behavior, checkout, Shopify delivery (no browser, site blocked, Shopify sign-in expired).
REMAINING RISKS: 0 services economically verified; 0 dispatch-ready providers; attribution never exercised.
REVENUE IMPACT: $160.00 verified collected; nothing new.
FIRST REVENUE ACTION: respond to the 3 `proposal_pending` requests, then call the Sapir/Summerfield/Stonemark follow-ups quote-only.

### Correction (2026-10-12): the "3 proposal_pending" requests are not real customer inquiries
My earlier addendum called the 3 `proposal_pending` and 11 `routed` requests "the real inquiries." Reading them shows that was wrong:
- 2026-09-20 (CH02, 5 apartment turns, 2 pet-damage, 1 eviction haul-out): submitted with DANI's own sales mailbox (`danideclaresns`), organization "ddl inc". Looks like an internal scenario test; no quote, scope NOT_STARTED. Confirm with owner.
- 2026-10-09 (CH04): request text says "TEST ONLY ... Not a real customer. Do not quote or schedule."
- 2026-10-11 (CH02, labeled Property Turnover): inbound vendor-referral solicitation from "The Cradle Holdings Facility Solutions" asking DANI to send an intake profile and verify coverage "before Tuesday". Unverified, not a buyer. Do not send an intake profile; treat as an unverified solicitation.
- 2026-09-23 routed CH01 two-story house request (Stone Mountain): unverified; wording echoes the 9/20 test. Confirm with owner.
- All other `routed` rows are tests, probes or junk text; one cancelled row is a state-machine test. The 1 `scheduled` request is the completed Thumbtack job ($160 collected).
Net: there is no verified open inbound customer demand. The revenue path tomorrow is the permitted CH02 follow-ups, quote-only. Asana task `1219397649342143` carries the same correction. No customer or lead data was changed.

### Follow-up reconciliation, 9 governed candidates (2026-10-12, read-only)
Source: `dd_governed_sales_followup_candidates_v1` plus `dd_sales_queue`. No contact details recorded here. No record was created, changed, or contacted.

| Account | Cadence state | Prior touch | Route on file | Action |
|---|---|---|---|---|
| Asset Living | NORMAL, permitted since 10/05 | 1 email 9/30, no reply | phone + email | Owner may call (named decision maker on file) or follow up by email. `outreach_authorized=false` in lead metadata: owner must set or accept that explicitly. |
| DHC Property Management | NORMAL, permitted since 10/05 | 1 email 9/30 | phone + email | Same as above |
| Sapir Realty | NORMAL, permitted since 10/05 | 2 attempts, last 9/30 | phone + email | Same as above. 5 duplicate rows exist; contact once, then merge duplicates through the existing dedupe path |
| Fortis Property Management | NORMAL, permitted since 10/05 | 1 email 9/30 | email only | Email follow-up only |
| Golden Gate Management | NORMAL | 1 email | email only | Email follow-up only; no permitted-from date, confirm cadence first |
| Atlanta Area Property & Mgmt | PAUSED | none | phone | Do not contact today |
| Evernest | PAUSED | 2 LinkedIn attempts | phone | Do not contact today |
| Fort Knox | PAUSED | none | phone | Do not contact today |
| HomeOwners Advantage / Five Star | PAUSED | none | phone | Do not contact today |
Other S-named accounts: Stonemark (emailed 9/30, not in the governed list), Summerfield (never contacted, not in the governed list), Southern Homes and Rentals and Sharp Management (SUPPRESSED). Dunwoody Exchange has no CRM, sales-queue, or Gmail record: do not create one from a name; add it only after the owner supplies the source and contact.
Rules for any contact: quote-only and scoped to actual hours; no bundle, retainer, or "pilot baseline" prices; no crew-availability promise; honor SUPPRESSED, PAUSED, and do-not-contact states. Nothing here may be sent without the owner's explicit approval of the specific message.

Draft call opener (for the owner to adapt): "Hi, this is Dani with DANI DECLARES. We handle the execution on apartment turns: cleaning, make-ready, and condition documentation. I emailed on the 30th about [community]. Would a short walkthrough of one unit be useful so we can send you a scoped quote?"
Draft follow-up email (not sent): subject "Following up: apartment turn support"; two sentences restating the 9/30 note, offering one unit walkthrough, no prices, opt-out line.

### Apartment blitz reconciliation, first pass (2026-10-12, read-only)
Sources checked: `dd_sales_queue` (named accounts), Gmail search for the named communities, HubSpot company search. No send, no record created or merged.

| Target | What the records show | Status |
|---|---|---|
| RPM Living / District at Parkview | One RPM row, SUPPRESSED: `ACTIVE_VENDOR_MANAGEMENT_TICKET_1337776`, disposition EXISTING_VENDOR_REVISIT, 2 attempts, last 10/01. No District at Parkview property row exists. | HOLD. Follow the open vendor ticket via the community-manager / NetVendor route RPM gave; no generic intro. |
| Acento (Lakeview, INDIGO, Woodgate) | One Acento row, 3 attempts, last 10/06; an unsent Gmail draft already targets the contact. Lakeview mailbox was emailed 7/31, 9/28, 10/06; the only reply on file is an out-of-office auto-reply (7/31). No INDIGO or Woodgate rows. | HOLD a 4th send. Reconcile the existing draft first; find INDIGO/Woodgate community-manager routes. |
| East Ponce Village | Not in sales queue or HubSpot. An email on 10/03 to the old Blue Parc address bounced (mailer-daemon). | CONTACT DISCOVERY. Do not reuse that address; owner supplied a leasing-office phone route. |
| Park at 500 (Stone Mountain) | Not in sales queue. An email on 10/03 to a dekalbhousing.org "residents" address bounced (postmaster). | CONTACT DISCOVERY. Find the actual management/vendor contact. |
| Golden Gate Management | 2 rows: one BOUNCED, one SENT. | Do not resend to the bounced address; recover a valid manager route. |
| Wildwood / Peak Living | 3 attempts, last 10/04; an unsent Gmail draft already targets the contact. | HOLD; reconcile the draft before any send. |
| Dunwoody Exchange, The Savoy, Camden Creekstone, Five Oaks, Emerald Creek, Linden Ridge, Hairston Woods, The Pointe, Midwood Gardens, Mirador/Venterra | No sales-queue row by these names; no HubSpot match for Dunwoody or Ponce; Gmail shows no correspondence for Savoy, Dunwoody Exchange, or Creekstone. | CONTACT DISCOVERY / research-only. Verify property, management company and contact before any CRM record. |
| Portfolio accounts with rows | Asset Living (sent 9/30), Atlantic Pacific (sent 9/30), Bay (sent, context incomplete), Keyrenter (sent 10/06, context incomplete), One Source Atlanta (2 rows, one SUPPRESSED), Vision (sent, context incomplete), Cobalt (SUPPRESSED, recent outreach), Integral (sent 10/06), Summerfield (callable, never contacted), Bridge and ResiHome (no contact route), Willow Bridge (SUPPRESSED, context incomplete) | Eligible follow-ups are limited to rows with a verified route that are not suppressed or paused; see the 9-candidate table above. |
NOT DONE: the two five-mile territory censuses (SM-5 around Park at 500, CH-5 around Ashford Dunwoody / Savoy Dr). They need a geocoder and a property-data source; this session has no verified geographic or property dataset, so no distances or complete lists are claimed. The map in the owner's relayed note is unverified. "The Savoy" (4306 N Shallowford Rd) is a candidate for the S-named apartment, not confirmed.
Next safe step: build the territory lists in the existing CRM tables from a verified source, then classify each row ready / contact-discovery / held. Nothing may be sent without the owner's approval of the specific message.
