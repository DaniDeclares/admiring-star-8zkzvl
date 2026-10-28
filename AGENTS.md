# DANI DECLARES — Agent Change Control

This repository is the production application for DANI DECLARES LLC. Multiple AI assistants and human contributors may work on it. This is the shared engineering contract.

## Non-overwrite protocol
1. main is production authority. Never treat a stale local copy, chat transcript, generated paste, or cached tool result as newer than GitHub main.
2. Read before write. Before editing a file, fetch the current version and check open pull requests that touch the same file or subsystem.
3. One task = one branch = one PR. Work in a dedicated feature branch. Do not make unrelated edits in another agent's branch.
4. Never directly push production changes to main for ordinary work. Changes go through a pull request and verification.
5. Do not overwrite another agent's work. If the target file has changed since the branch started, reconcile with the latest main first.
6. Open PR overlap rule. If another open PR changes the same file, stop and reconcile the two changes before modifying that file.
7. Database-first rule. Locate the authoritative record and owning system before creating or changing runtime/business data.
8. External-system authority. Supabase owns DANI runtime state and `dd_jobs` is current production dispatch authority; GitHub owns source/migrations/tests/config; Vercel (Hobby, project `admiring-star-8zkzvl-dhnz`) owns deployment/runtime, see `docs/governance/DANI_HOSTING_RAIL_2026-10-03.md`; Stripe owns payment/invoice/payment events; HubSpot owns CRM relationship/engagement records without owning DANI service/quote/job truth; Airtable owns only explicitly assigned planning/governance/economics/reference datasets; Notion owns operating documentation/control knowledge; Asana owns human execution/release tasks; Google Drive owns collaborative file bytes, Google Calendar owns the human calendar surface, Gmail owns mailbox content/delivery state, and PostHog owns analytics telemetry.
9. API credentials are secrets. Never commit client secrets, refresh tokens, access tokens, private keys, webhook signing secrets, or passwords. Use Vercel/server environment variables or an approved secret store. Never ask the owner to paste a secret into chat when a secure entry point is available.
10. Production verification is mandatory. After a production-affecting change, verify CI, Vercel deployment state for the exact commit, and relevant runtime behavior before declaring green.
11. Intent-to-outcome rule. For substantial owner requests, follow `docs/governance/DANI_INTENT_TO_OUTCOME_ENGINE_2026-10-04.md`: recover history and current authority first, define the owner's actual outcome and proof, make the smallest compatible change, and continue through live/business observation. A generated change, merged PR, deployment, worker run, or scheduled action is not `GREEN` when the requested outcome is downstream of it.

## DANI business rules
- A capability is not automatically a sellable service.
- Service/SKU, price, scope, provider authorization, SLA, compliance state, payment state, and release state stay governed by DANI's canonical runtime architecture.
- External tools are rails. They do not become DANI commercial authority merely because they contain a duplicate record.
- Do not silently change pricing, legal/compliance language, procurement eligibility, certifications, or government-facing claims. Surface these for review.
- Baby (learning AI), Chief of Staff (executive orchestration), Personal Assistant (Danielle's personal logistics), C-Team, Tech and external AIs are separate roles defined in `docs/governance/DANI_AI_DIVISION_OF_LABOR_2026-10-02.md` section 5. Read it before touching any of them; never merge or substitute one for another.

## Agent handoff standard
Every non-trivial change should register its branch/scope in `dd_agent_change_ledger` when database access is available and leave a durable trail in the PR and, where useful, in the DANI Notion authority matrix. State what changed, files/subsystems touched, assumptions, tests/deployments observed, and any permissions still required. For substantial work, also state the requested outcome, current intent-to-outcome state, proof already obtained, remaining proof, and any legitimate hold condition.

For routine handoffs that need a new note, use this short format in the existing authoritative work record or its established handoff location. Link to the work record; do not copy changing project state into instruction files or create competing records. If an adequate current handoff already exists, update or reference it instead of creating a duplicate.

```text
SESSION NOTE — <UTC date> — <session/tool> — <task>
Record: <authoritative work record>   Revision: <SHA/version>
Did: <actual work>
Changed: <local/published/deployed/none>
Side effects: <actual effects/none>
Checked: <method, scope, result>
Not verified: <remaining checks>
Boundary: <applicable approvals and restrictions>
Next: <one action> — Owner: <session/person>
```

Reserve the full DANI receipt template for complex releases or incidents. The authoritative work record remains the coordination destination, not infallible evidence: reconcile discrepancies using current evidence for the same target, revision, and scope, and record corrections without silently erasing history. A session note does not transfer ownership, grant permissions, or replace required approval and verification gates.

### Authoritative-state pickup guard (proposed; applies to agents that actually load this contract)
When resuming from chat, memory, search, a session note, or another model's handoff, identify the target and its owning system. Preserve the original source and last verified outcome; a retrieved historical claim is not current authority or authorization. Before a consequential action, compare relevant current authoritative records, their observation times, entity IDs, and any explicit supersession or reversal evidence. Distinguish reported, source-inspected, tested, deployed, and runtime-verified evidence. Record the result and next permitted action in the existing authoritative work record or established handoff location; do not create a parallel memory store.

- **Current authority accessible:** use the owning system's current state, subject to permissions and existing approval gates. Preserve settled closure, selected assets, accepted choices, expired deadlines, and completed work unless specific newer authoritative evidence supports reconsideration. A newer timestamp alone does not prove a reversal.
- **Current authority inaccessible or identity ambiguous:** mark CURRENT_STATE_UNVERIFIED, preserve the last established disposition as a historical checkpoint, and hold payment requests, reopening, replacement, publication, dispatch, bidding, and other consequential changes. Do not revive an older unpaid/missing/blocked/open status. Continue independent read-only or locally reversible preparation and identify the exact access dependency.
- **Conflicting evidence:** mark CONFLICT_REQUIRES_RECONCILIATION with each source, ID, observation time, and authority. Do not choose the most convenient or newest-looking copy, silently overwrite the governing record, or act on a disputed reversal. Escalate the bounded decision through existing owner-attention/approval mechanisms.
- **Superseded history:** retain as evidence with a superseded label and pointer to the controlling successor; never re-queue it as active merely because search surfaced it.
- **Settled outcome with no new reversal evidence:** retain the established outcome and stop duplicate action. Lack of access, a missing search hit, or an agent's uncertainty is not reversal evidence.

For any handoff, include canonical entity/source references, last verified disposition and timestamp, current-read outcome (including failures), evidence grade, approvals still required, stop condition, and the single next permitted action. Never infer completion from a commit, test, deployment, cron execution, or model summary alone. This is an instruction guard, not a database constraint or a grant of tool access; workers that do not load this file require their own existing instruction/entry-point integration and separate verification.

## Claude
Claude is an authorized engineering collaborator, not a separate source of truth. Claude must follow this file and CLAUDE.md and consult the DANI Notion authority matrix before creating a new integration, database, project, or documentation system.

## Canonical visual identity (owner approved 2026-10-10)
DANI's approved **burgundy, warm ivory and antique gold** palette is centrally defined in `src/index.css`; reference `docs/design/DANI_CANONICAL_BRAND_PALETTE.md` before changing UI, printables or digital-product styling. Reuse `var(--dd-burgundy)`, `var(--dd-ivory)`, `var(--dd-cream)` and `var(--dd-gold)` rather than making new hexadecimal copies or alternate palettes. Maintain accessible contrast and route legacy hard-coded values through normal history-first PR review; do not overwrite other open design branches.
