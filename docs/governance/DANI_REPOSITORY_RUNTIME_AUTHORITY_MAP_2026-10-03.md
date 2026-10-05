# DANI Repository and Runtime Authority Map (2026-10-03)

Status: owner-directed governance map. Purpose: prevent parallel systems, stale-repo work, and rebuilds caused by source/runtime confusion.

## Current authority

- Production source: `DaniDeclares/admiring-star-8zkzvl` `main`.
- DANI Production runtime: Supabase `ajxezpczaemunlcmqlgl`.
- DANI Tester / Brain / proof: Supabase `okvepooyxurujcwgfoju`.
- Production hosting: Vercel Hobby project `admiring-star-8zkzvl-dhnz`, linked to the canonical repository.
- Shadow & Sol Supabase `yxhbernpesgzvfdoubyd` is a separate entity/project and is not DANI runtime authority.

## Historical/reference repositories

- `DaniDeclares/danideclares-react-app`: historical/reference. Demand-radar migrations already verified as absorbed into canonical source. Do not deploy as DANI authority.
- `DaniDeclares/dani-declares-fieldops`: historical fulfillment/FOS reference. Core work-order/provider/change-order concepts evolved into canonical source; do not operate it as a second runtime.
- `DaniDeclares/builderio-shopify-commerce-headless`: commerce experiment/reference only; not DANI Production authority.

Do not archive/delete historical repositories solely because they are noncanonical. First confirm unique approved behavior is absorbed or deliberately retired and no live integration still depends on them.

## History-first authority rule

Before declaring a capability missing or creating a replacement:
1. Check current canonical main and relevant merged/open/closed work.
2. Check migrations, tests, proofs and durable receipts.
3. Check the owning current runtime, including Tester and Production where relevant.
4. Check historical repositories when the subsystem predates consolidation.
5. Classify prior work as CURRENT AUTHORITY, STILL VALID/REUSE, SUPERSEDED, FAILED/ABANDONED, DRIFTED, or GENUINELY MISSING.
6. Reuse/reconcile/repair before building a parallel worker, table, queue, scheduler, governor, dashboard, portal, memory path, or integration.
7. Prove outside Production, promote through the existing governed path, then verify exact Production runtime.

A zero-row query, missing UI surface, stale queue, blocked worker, or unavailable historical relation is diagnostic evidence, not proof the capability is absent.

## Environment boundary

Tester proof does not establish Production green. Never copy Tester secrets or whole environments into Production, fabricate Production proof, or seed synthetic Production state merely to produce a passing receipt. Research/Grok/Work-mode/Brain outputs are evidence inputs until reconciled against current source/runtime and promoted through existing governance.

## Release convergence

A lane should terminate explicitly as one of:
- **PRODUCTION_GREEN** — exact current Production behavior verified.
- **SUPERSEDED_RECONCILED** — newer authority verified and older lineage disposed.
- **LEGITIMATELY_HELD** — an exact external/security/legal/credential/owner dependency prevents safe progression.
- **BROKEN_REPAIR_UNDERWAY** — a bounded defect is proven and being repaired on the authoritative path.

A legitimate hold blocks only its dependent lane; unrelated safe lanes continue.
