# Revenue-readiness reconciliation (read-only Production evidence, 2026-10-11)

Scope: reconcile the owner-supplied 2026-10-09 catalog/revenue briefs against Production Supabase (`ajxezpczaemunlcmqlgl`) using SELECT only. Nothing in Production, Shopify, Stripe, or pricing was changed. Classifications: PRODUCTION_GREEN, LEGITIMATELY_HELD, SUPERSEDED, BROKEN.

## 1. LIVE_READY vs checkout economics — two different gates
| Gate | Question it answers | Source | Result |
|---|---|---|---|
| Release contract `economics_ready` | Are package/cost components structurally resolved (offer is governed)? | `dd_service_release_contract_v1` + `dd_service_economics_authority_v1` | 108 LIVE_READY: 69 `GOVERNED_SERVICE_OFFER_READY` (policy_ready=false), 39 `READY` (policy_ready=true) |
| App checkout gate `economicGateFromOffer` | Is cost non-draft and margin >= 50%? | `src/lib/operations/governedCommercialGate2026.mjs:13` (floor `ECONOMIC_MARGIN_FLOOR_PERCENT = 50`) | 0 of the 88 remote LIVE_READY services clear it |

They are not the same test, so they do not contradict each other; neither may override the other. LIVE_READY means "sellable by quote then invoice", not "margin approved".

For the 88 LIVE_READY remote services (from `remote_services_2.csv`): 69 carry DRAFT cost text, 85 show margin below 50% when owner pay is counted as cost, 3 show >= 50%, and all 88 are `app_econ_gate=NOT_RECONCILED`. Owner-compensation rows for the admin SKUs are marked `build_phase_only` / `not_actual_job_cost` / `requires_live_calibration` in metadata even where `evidence_status=OWNER_CONFIRMED`. They are underwriting assumptions, not verified costs.

Classification: checkout economics = LEGITIMATELY_HELD (50% floor and draft-cost rule preserved). Not reclassified.
Owner decision needed (business rule, not made here): whether the 50% floor treats owner-delivered labor as a cost or as income. This changes how 85 services evaluate and must not be settled by an engineer.

## 2. Contradictory SELL / DO_NOT_SELL SKUs (16)
Source: `dd_governed_service_offers`, grouped by `canonical_sku`.
- 14 SKUs (DNI-01A-001/002/003/007/025/027/029/037/038/040/041, 01B-008, 01D-001, 01E-001) hold DO_NOT_SELL + INTAKE_ONLY. Release state BLOCKED. Neither status sells, so the system fails closed. LEGITIMATELY_HELD.
- DNI-01D-005 and DNI-01G-001 hold a DO_NOT_SELL row plus a SELL_NOW row. The DO_NOT_SELL rows record "RECONCILED 2026-09-15: duplicate governance row ... Demoted the less-descriptive/legacy-labeled duplicate; canonical fuller-named row retained" (display duplication, identical price, no record deleted). Release contract shows the canonical row, LIVE_READY. This is an intentional duplicate-demotion, not a conflict. SUPERSEDED data, PRODUCTION_GREEN behavior.
- Residual risk: any consumer that reads offers per SKU without picking the canonical row can see both. No repair applied; deleting rows would violate the "no record deleted" provenance. Proposed (not applied): a documented canonical-row view or consumer rule.
- Note: DNI-01D-005's canonical row also records a 2026-10-05 fail-close to INTAKE_ONLY and a 2026-10-07 governed holiday restore. Its evidence is documented in the row itself.

## 3. Stale `services.base_price_cents`
`services.base_price_cents` differs from `round(starting_price*100)` on 52 of 108 LIVE_READY (30 are NULL), 83 of 275 HOLD, 69 of 83 BLOCKED. The checkout/quote gate reads prices from locked `dd_service_pricing_rules.base_price_cents` (`governedCommercialGate2026.mjs:66,94,119,129`), not `services.base_price_cents`. `quoteBuilder2026.js:128` selects `services.base_price_cents` and still needs a consumer check before any claim that it is harmless.
Classification: display-column drift in a non-authoritative column, LEGITIMATELY_HELD pending a consumer audit. A backfill from locked rules would be non-destructive but is a Production data change and needs a governed migration PR. Not applied.

## 4. Other defects
- Price-text mismatch: a regex comparison of `public_price_display` against the locked price found no mismatch among LIVE_READY rows that have display text. The owner brief cites DNI-04A-023 and DNI-09A-024; those need a targeted check (rows may be HOLD or display NULL). Not yet verified either way.
- Duplicate "Vendor Coordination": two distinct SKUs, DNI-02A-019 (division 02, $125) and DNI-10A-006 (division 10, $250), both HOLD on PAYMENT_LEDGER. Naming collision, not a sell conflict. Owner decision whether they are one service.
- Labor-rate conflict: `dd_owner_compensation_rules` mixes `RESEARCH_BENCHMARK` ($30 cleaning benchmark) with `OWNER_CONFIRMED` $60/$75/$90 build-phase assumptions. The brief's $30 vs $75–90 is benchmark vs assumption. Neither is a measured job cost. LEGITIMATELY_HELD until live calibration.

## 5. Provider dispatch — brief is SUPERSEDED
The 2026-10-09 brief says no provider can pass because Stripe Connect is required. Production now differs:
- Migration `20261010030034 provider_manual_payout_rail_readiness` is in the Production ledger (repo source `20261010030000`).
- `dd_provider_payout_clearance_policy` `MANUAL_PAYOUT_RAIL`: owner_approved=true, external_payout_authorized=true (rationale: owner approved manual Zelle/PayPal rail 2026-10-09; requires each provider's PAYOUT_SETUP item VERIFIED by authorized staff).
- `dd_provider_assignment_readiness_v1` now requires `stripe_payout_ready OR manual_payout_ready`, plus application approved, agreement, identity, compliance, insurance, and W-9 for individuals.
- Current state of 51 providers: 49 `APPLICATION_NOT_APPROVED` (corrected: these 49 have no application record at all; see PROVIDER_READINESS_BREAKDOWN_2026-10-11.md), 2 `W9_REQUIRED`; 0 assignment-ready.
Conclusion: Stripe Connect is a payout-rail prerequisite folded into the assignment gate (original migration `20260922190000` made it mandatory; the manual-rail alternative is now live). It is no longer the blocking item. The blocker is provider approval and W-9, which are owner/staff actions. No gate was weakened and no account was created. Status: SUPERSEDED defect; dispatch itself LEGITIMATELY_HELD.

## 6. Release-machinery classification (unchanged, for the consolidated report)
- Governed PR executor missing Tech-routing RPCs: BROKEN (fail-closed, 49 candidates durable).
- #591 replay: LEGITIMATELY_HELD (four exceptions proposed, none applied).
- #638 / #630 / #637: held for CI and owner approval; no merge or deploy.

## 7. Quote builder audit (`src/lib/operations/quoteBuilder2026.js`)
- Quote price path: `loadRules` → `dd_service_pricing_rules` (ACTIVE), then `calculate` uses `rule.base_price_cents`, falling back to `services.starting_price` / `public_price_low`. `services.base_price_cents` is **not** a price source for quotes.
- The only read of `services.base_price_cents` is the specials de-duplication (`resolveCanonicalOffers`, `exactCommercialMatch`). A stale or NULL value makes a matching special look like a price conflict (`UNRESOLVED_PRICE_CONFLICT` variant, extra operator noise). It fails safe: no customer price is taken from it.
- Gap vs the checkout gate: `loadRules` filtered ACTIVE only, while `governedCommercialGate2026` requires ACTIVE + LOCKED. Production today has 2,270 ACTIVE rules, all LOCKED (the 5 non-LOCKED are PENDING_RECONCILIATION), so no live exposure.
- Smallest safe correction (prepared, not applied): add `.eq('lock_status','LOCKED')` to `loadRules`, export it, add a regression test. Quote builder tests: 7 pass. Saved as `docs/governance/proposed-patches/quote-builder-locked-pricing-authority.patch`. It is runtime code, so it does not belong in #638 (docs/data only). It needs its own branch and PR by the owner's instruction; none exists. (I pushed this patch to a scratch branch `claude/quote-locked-pricing-authority` before noticing it was outside my designated branch; my attempt to delete it was refused with 403, so it still exists remotely, has no PR, and can be deleted or adopted by the owner.)

## 8. Vendor Coordination: scope evidence (both SKUs stay held, not merged)
Read-only `services` descriptions: **DNI-02A-019** (Division 02, $125) is "coordination of approved vendors and field workers for property tasks, including assignment, access instructions, scheduling, status tracking and completion evidence"; **DNI-10A-006** (Division 10 Experiences & Resident Programming, $250) is a "canonical Division 10 experience/event offer; venue, vendor, staffing, travel and production costs are quoted separately unless explicitly included". Different division, scope, pricing basis and cost treatment; only 02A-019 has a cost model on file ($75 at Tier 2, 40% draft margin). They are distinct services that share a name. Both remain HOLD on PAYMENT_LEDGER; no merge, rename or price change was made. A customer-facing naming difference (for example by division) is an owner decision.
