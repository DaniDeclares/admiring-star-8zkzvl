# DANI Tester Enterprise Control Plane

Status: TESTER-FIRST. This contract composes existing DANI authorities; it does not create a new commercial, payment, accounting, provider, CRM, or deployment authority.

## Operating loop

Evidence / Research → Reconciliation → Governance → Economics → Accounting → Compliance → Commercial Release → Sales → Quote → Approval → Payment → Job → Provider Qualification / Dispatch → Execution → Evidence → QA → Customer Closeout → AP / Payout → Accounting Reconciliation → CRM / Retention → Analytics / Outcome Learning → Research.

Permanent control planes: Owner HQ, governed digital workforce, security, external-action outbox, integration adapters, immutable decision snapshots, system health, human approval, Asana execution, and Notion operating knowledge.

## Authority contract

- Supabase: canonical runtime / operational state.
- GitHub: source, migrations, CI and change control.
- Asana: human execution and release work.
- Notion: durable procedures, architecture and control knowledge.
- Airtable: assigned business governance, catalog/economics planning and reconciliation.
- Stripe / other payment rails: payment execution evidence, never catalog/pricing authority.
- HubSpot: CRM relationship/engagement layer.
- PostHog: analytics authority.
- Google Drive: supporting files/evidence; historical material is evidence until reconciled.
- External systems: adapters/rails. External IDs link to DANI canonical IDs.

## Non-negotiable release boundaries

The enterprise controller may invoke existing low-risk detection/reconciliation controllers and aggregate health. It must not by itself:
- publish or change canonical pricing;
- activate a service;
- authorize a provider or assign a job;
- send customer/provider communications;
- move money or clear external payout;
- merge code or promote production;
- reinterpret research/historical evidence as authority.

Consequential actions require the existing authority map, immutable decision snapshot, human approval where configured, durable outbox intent, idempotent worker execution, receipt, verification, and downstream state update.

## Tester acceptance matrix

1. Research: signal → classification → evidence → governed reconciliation → no silent authority promotion.
2. Commerce: canonical customer/service → governed quote → approval → payment evidence → job.
3. Provider: application → qualification → authorization → capability/geography/availability → offer → assignment.
4. Fulfillment: job → work → evidence → QA → customer closeout.
5. Money: accepted assignment economics → canonical AP → payout-clearance policy → external payout only when explicitly authorized → settlement reconciliation.
6. Sales/CRM: demand → dedupe/qualification → governed offer → disposition/follow-up → lifecycle handoff.
7. Accounting: operational/payment evidence → accounting exception/reconciliation path without creating competing books.
8. External actions: enqueue → claim/lease → attempt → external effect → receipt → verification; duplicate/retry/ambiguous effect must not duplicate business effect.
9. Security: RLS/RPC/caller binding, cross-tenant/provider isolation, secret/service-role isolation, webhook replay/signature controls, upload/storage boundaries, AI/tool authority isolation.
10. Failure/recovery: stale lease, worker crash, 429/5xx, missing optional source, dead letter and breaker all become visible without fabricating success.
11. Owner HQ: open exceptions, P0s, worker/run health, research/build queues and external-action state show the same canonical truth.
12. Knowledge/execution: Asana and Notion inform and track work; neither overrides runtime authority.

## Green definition

A table, cron, agent registration, queued outbox item, PR, preview or deployment is not proof of operation. A lane is green only when its controlled tester replay proves the authoritative state transition, required external effect if any, receipt/evidence, downstream handoff, and owner visibility. Production remains separately gated.


## Umbrella integration order and dependency ledger

This document is the integration contract for the current tester build. Individual PRs are inputs to this umbrella, not independent release programs.

### Phase 0 — current-state reconciliation

Before integrating a lane, re-read its live authority and compare the open implementation branches with tester runtime. Never infer that a migration exists in tester merely because it exists in GitHub.

Current audited facts (2026-09-25):
- Tester does not yet contain `dd_enterprise_control_runs` or `dd_run_enterprise_control_plane()`; PR #437 is source-only until its migration is deliberately applied.
- Tester does contain the four component controllers that #437 composes: research pipeline, safe automation recipes, service discovery, and commercial reconciliation.
- Tester research queue is 1,496 rows: 155 GREEN, 1,328 QUEUED, 13 RESEARCHING.
- Owner Attention currently has 20 OPEN rows.
- External-action outbox currently has one SUCCEEDED row and no observed open row in the audited status aggregation.
- PostHog project 580301 is the DANI analytics project, but it has not ingested an event. Analytics is therefore an acceptance dependency, not current operating evidence.
- Production promotion remains prohibited until the integrated tester acceptance replay passes.

### Phase 1 — foundation/control plane

Integrate and reconcile the reusable controls before domain behavior:
- #422 audit autopilot: run receipts, claim/lease/retry/dead-letter and proof registry.
- #436 research clock: governed research reconciliation and worker trigger.
- #437 enterprise composition: cross-domain health and acceptance contract.

Required proof: controller execution, durable run receipt, retry/failure visibility, Owner Attention visibility, and no consequential side effect from the controller itself.

### Phase 2 — authoritative lifecycle

Reconcile existing implementation rather than rebuilding it:
- #420 provider field execution authorization.
- #423 evidence/completion QA authority.
- #424 assignment compensation, canonical AP and payout-clearance hold.
- #431 PayPal adapter as a payment rail only.
- #435 verified tester operational controls and governed job timeline.

#419 is evidence/history for the provisional one-job case; its narrow override must not become a general provider-qualification bypass.

Required proof: governed quote/payment evidence → job → eligible assignment → work/evidence → QA/customer closeout → canonical AP. External payout remains blocked while payout-clearance policy is UNRESOLVED.

### Phase 3 — intelligence/economics

Reconcile:
- #425 research intelligence classification.
- #429 hybrid workforce economics research.
- #430 treasury/learning/owner-test contract.

Research and estimates may create evidence, exceptions and proposed decisions. They may not silently change pricing, commercial release, provider authorization, accounting facts or capital decisions.

### Phase 4 — application/runtime adapters

Reconcile #434/#435 Netlify continuity with the actual production-routing audit. A successful static build is not API/runtime parity. Netlify and Vercel authority must be resolved from domain/API routing and live behavior before production promotion.

### Phase 5 — observability

PostHog is downstream of working lifecycle behavior:
1. build with the correct DANI public project token;
2. exercise controlled tester/preview journeys;
3. verify actual ingestion in project 580301;
4. inspect event properties for PII/secret leakage;
5. enable only the observability products justified by the acceptance contract;
6. feed verified health/outcome signals to Owner HQ.

Do not enable replay, exception autocapture, web-vitals, surveys or heatmaps merely because PostHog supports them. Each must have an explicit operational purpose and privacy/security review.

### Phase 6 — integrated replay

Run the 12 acceptance lanes as connected journeys, including negative paths: duplicate request, stale lease, worker crash, authorization denial, missing evidence, failed external action, payment ambiguity and payout-policy hold.

The controlled replay must prove continuity with conversational AI unavailable. Chat sessions may audit and build the system; they are not the production scheduler or runtime worker.

### Phase 7 — production promotion

Only after tester replay is green:
- reconcile source migrations against live tester state;
- resolve deployment authority;
- run release-candidate smoke;
- promote forward-only changes;
- run production smoke and identity-bound journeys;
- verify payment/provider/accounting/CRM/analytics receipts;
- update Asana/Notion with verified results.

No phase may be called complete because its PR is mergeable, its migration compiles, its deploy succeeds, or its dashboard renders.
