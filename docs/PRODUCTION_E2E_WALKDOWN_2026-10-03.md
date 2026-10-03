# DANI DECLARES Production E2E Walkdown

**Started:** 2026-10-03  
**Control issue:** #549  
**Status:** ACTIVE — evidence-first reconciliation

## Authority chain

Tester proof → governed promotion gate → GitHub `main` → Vercel Production deployment → real Production proof → feedback/learning to Tester.

Tester is proof/staging authority, not a substitute for Production verification. GitHub `main` is source authority. Vercel is current Production hosting authority. Historical Netlify previews are evidence only and must resolve to exact Git commits. Never copy Tester secrets into Production.

## Evidence states

- `GREEN` — exact checkpoint proven in current Production.
- `HELD` — legitimate gate/blocker prevents proof; blocker and owner recorded.
- `FAIL` — attempted proof failed; repair must reuse existing architecture first.
- `UNKNOWN` — not yet walked; never treat as green.

## Current ledger

| Checkpoint | Current state | Evidence / blocker | Next |
|---|---|---|---|
| Public site deployment | GREEN | Current main is deploying through Vercel; prior reconciled Production releases returned 200 | Continue release-SHA verification after each merge |
| Public navigation | GREEN | #544 merged: My Dashboard label + redundant nav cleanup, route authority preserved | Include in browser walkdown |
| General request creation | GREEN | Real Production request created and confirmation email received | Preserve as baseline |
| Governed explicit service selection | FAIL | Bathroom Detail exists in governed catalog but normal Request Service entry does not expose service selection | #548 |
| Provider incomplete staging/login | HELD | #543 fixed primary blocker; post-merge missing-providerPayload edge case remains | #546, Tester proof before Production promotion |
| Provider assignment readiness E2E | HELD | Production previously had no assignment-ready providers; do not fabricate readiness | Complete provider lifecycle after #546 |
| Public imagery/content fit | FAIL | Repeated/mismatched/missing visual behavior demonstrated | #547 |
| Role-aware unified portal | PARTIAL | Architecture and multiple workspaces exist; surfacing/completeness requires reconciliation | #547 |
| Owner HQ authentication | PARTIAL | Owner HQ load proven; exact sign-out → sign-in → reopen sequence still needs current Production proof | Walkdown checkpoint |
| GitHub Opportunity Scout | GREEN_SOURCE | #545 repaired Boolean-query failure and merged; Production/next scheduled-run receipt still required | Verify next real run |
| Research convergence guard | GREEN_SOURCE | #523 merged; Production guard applied and over-limit active research cleared in prior pass | Verify no recurrence during walkdown |
| Nextdoor Demand Radar | GREEN_SOURCE | #522 merged; governed fields/function promoted; zero observations is valid until real evidence arrives | Verify first real observation when available |
| Sales outreach rail | PARTIAL | danideclaresns Gmail is active temporary rail; bounces are tracked and excluded from successful sends | Reconcile replies/outcomes into canonical DANI records |
| Migration ledger recovery | HELD | #520 historical branch requires reconstruction/rebase + fresh isolated migration replay | Do not blind merge |

## Full walkdown order

1. Tester candidate evidence and promotion receipt.
2. Production release SHA/deployment health.
3. Public homepage, catalog, service category, request-service, portal access/login.
4. Customer account → request → quote → payment → work order → fulfillment → QA → history.
5. Provider account → application → evidence/docs → approval → readiness → assignment → evidence → QA → payable.
6. Property manager / real estate / business / procurement org-scoped flows.
7. Owner login → HQ/operations → sales/request/quote/dispatch/provider/QA/money/exception actions → logout/login restoration.
8. Revenue communications and CRM/queue reconciliation.
9. Research/automation/bridge idempotency and feedback to Tester.
10. Repeat from the top after each repair until every checkpoint is GREEN or legitimately HELD.

## Rules

- Reuse/upgrade demonstrated existing machinery before adding anything.
- Do not manufacture synthetic Production success to close a gate.
- Do not count a send as delivered when it bounced or was blocked.
- Do not infer provider authorization from application/signup.
- Do not infer Production success from Tester proof.
- Every repair must return to this walkdown and prove the next downstream checkpoint.
