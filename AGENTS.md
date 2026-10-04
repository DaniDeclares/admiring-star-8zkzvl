# DANI DECLARES — Agent Change Control

This repository is the production application for DANI DECLARES LLC. Multiple AI assistants and human contributors may work on it. This is the shared engineering contract.

Before repository/project work, also read `docs/governance/DANI_REPOSITORY_RUNTIME_AUTHORITY_MAP_2026-10-03.md` for canonical vs historical repo/runtime roles.

## Non-overwrite protocol
1. main is production authority. Never treat a stale local copy, chat transcript, generated paste, or cached tool result as newer than GitHub main.
2. Read before write. Before editing a file, fetch the current version and check open pull requests that touch the same file or subsystem.
3. **History before downstream work.** Before changing, repairing, rebuilding, extending, promoting, or declaring a downstream subsystem missing/broken, recover its prior DANI lineage first. At minimum inspect: current GitHub main; relevant merged, closed-unmerged, and open PRs/issues; prior migrations/tests/proofs/receipts; the authoritative Tester and Production runtime state; and the existing bridge/promotion/drift records when applicable. Search prior DANI work/context when it can materially change the diagnosis. Classify what you find as CURRENT AUTHORITY, STILL VALID/REUSE, SUPERSEDED, FAILED/ABANDONED, DRIFTED, or GENUINELY MISSING. Do not rebuild something merely because the newest worker/view cannot currently see older records.
4. **Reuse/repair before build.** Resume the newest still-authoritative implementation at the first genuinely unfinished gate. Reconcile historical entry paths and data generations into current authority rather than fabricating replacement records or parallel systems. A new worker, table, queue, dashboard, onboarding path, scheduler, governor, memory system, or integration requires evidence that the existing authority cannot be repaired or extended safely. If earlier work already solved the issue, recover and reuse that solution or explain why it is no longer authoritative before writing replacement code.
5. One task = one branch = one PR. Work in a dedicated feature branch. Do not make unrelated edits in another agent's branch.
6. Never directly push production changes to main for ordinary work. Changes go through a pull request and verification.
7. Do not overwrite another agent's work. If the target file has changed since the branch started, reconcile with the latest main first.
8. Open PR overlap rule. If another open PR changes the same file, stop and reconcile the two changes before modifying that file.
9. Database-first rule. Locate the authoritative record and owning system before creating or changing runtime/business data.
10. External-system authority. Supabase owns DANI runtime state and `dd_jobs` is current production dispatch authority; GitHub owns source/migrations/tests/config; Vercel (Hobby, project `admiring-star-8zkzvl-dhnz`) owns deployment/runtime, see `docs/governance/DANI_HOSTING_RAIL_2026-10-03.md`; Stripe owns payment/invoice/payment events; HubSpot owns CRM relationship/engagement records without owning DANI service/quote/job truth; Airtable owns only explicitly assigned planning/governance/economics/reference datasets; Notion owns operating documentation/control knowledge; Asana owns human execution/release tasks; Google Drive owns collaborative file bytes, Google Calendar owns the human calendar surface, Gmail owns mailbox content/delivery state, and PostHog owns analytics telemetry.
11. API credentials are secrets. Never commit client secrets, refresh tokens, access tokens, private keys, webhook signing secrets, or passwords. Use Vercel/server environment variables or an approved secret store. Never ask the owner to paste a secret into chat when a secure entry point is available.
12. Production verification is mandatory. After a production-affecting change, verify CI, Vercel deployment state for the exact commit, and relevant runtime behavior before declaring green.

## Downstream recovery checklist
For any end-to-end or downstream execution loop, use this order unless a safety incident requires immediate containment:

1. Recover prior decisions, fixes, failures, superseded attempts, and proof receipts for the subsystem.
2. Read current GitHub main and inspect overlapping/open work before editing.
3. Read the owning runtime/system of record; compare Tester and Production only where both are relevant.
4. Identify the canonical current authority and historical entry paths. Never infer absence from one empty queue/view/table when older generations may use another legitimate path.
5. Reconcile drift and duplicates through existing reconciliation/triage/promotion machinery where available.
6. Run the existing proof/test/worker before adding code.
7. Repair or extend the existing authority only for a demonstrated gap; preserve fail-closed gates.
8. Prove in Tester or the designated non-production proof surface.
9. Promote through the existing governed release path; do not copy whole environments or bypass approval gates.
10. Verify the exact Production commit/runtime behavior and leave a durable receipt/handoff.
11. Return upstream and repeat until green or legitimately held.

A zero-row result, missing UI card, blocked worker, stale queue, or failed downstream proof is a **diagnostic signal**, not proof that the architecture is absent. Before rebuilding, search the lineage and determine whether the condition is caused by historical data shape, superseded code, environment drift, an unconsumed intake, a direct-authorized/legacy path, or another previously implemented route.

## DANI business rules
- A capability is not automatically a sellable service.
- Service/SKU, price, scope, provider authorization, SLA, compliance state, payment state, and release state stay governed by DANI's canonical runtime architecture.
- External tools are rails. They do not become DANI commercial authority merely because they contain a duplicate record.
- Do not silently change pricing, legal/compliance language, procurement eligibility, certifications, or government-facing claims. Surface these for review.
- Baby (learning AI), Chief of Staff (executive orchestration), Personal Assistant (Danielle's personal logistics), C-Team, Tech and external AIs are separate roles defined in `docs/governance/DANI_AI_DIVISION_OF_LABOR_2026-10-02.md` section 5. Read it before touching any of them; never merge or substitute one for another.

## Agent handoff standard
Every non-trivial change should register its branch/scope in `dd_agent_change_ledger` when database access is available and leave a durable trail in the PR and, where useful, in the DANI Notion authority matrix. State what changed, files/subsystems touched, assumptions, tests/deployments observed, and any permissions still required. Handoffs must also identify the prior lineage reviewed and explicitly state whether relevant earlier work was reused, superseded, drifted, or intentionally left untouched.

## Claude
Claude is an authorized engineering collaborator, not a separate source of truth. Claude must follow this file and CLAUDE.md and consult the DANI Notion authority matrix before creating a new integration, database, project, or documentation system.
