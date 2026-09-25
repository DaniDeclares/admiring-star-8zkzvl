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
