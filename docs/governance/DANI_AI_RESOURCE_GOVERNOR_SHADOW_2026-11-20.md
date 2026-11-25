# AI Efficiency & Resource Governor — Shadow Capability

Date: 2026-11-20
Status: Draft implementation; exact-head CI, adapter normalization, durable-receipt verification, independent review and owner approval remain required.
Authority: Existing DANI Intent-to-Outcome Engine, AI Execution Governor, assigned-worker bridge, verified worker registry and release controls.

## Scope and non-duplication
Extends `src/lib/aiExecutionGovernor.js` and `src/lib/aiAssignedWorkerBridge.js`. Does not create another agent, queue, scheduler, model registry, telemetry store, memory store, dashboard, integration, or source of truth. Tester and Production remain isolated; this change performs no database or deployment operation.

## Initial resource ceilings (shadow policy hypotheses)
| Execution tier | Input tokens | Output tokens | Model calls | Wall time |
|---|---:|---:|---:|---:|
| Deterministic | 0 | 0 | 0 | 30 s |
| Bounded worker | 8,000 | 2,000 | 1 | 60 s |
| General reasoning | 24,000 | 4,000 | 1 | 120 s |
| Frontier review | 40,000 | 6,000 | 1 | 180 s |

These are conservative starting hypotheses, not observed DANI usage distributions, vendor prices, model guarantees, or provider-enforced limits. Do not use them to forecast spend or rank vendors. Per-task overrides are accepted only for the known numeric resource fields and non-negative finite values. Cost is evaluated only when an authoritative task supplies `resourceLimits.costUsd`; no cost ceiling is invented.

## Measurement contract
The existing `routeModel` adapter receives `resourceGovernance` with the tier limits, requested estimates, standardized field names, and explicit enforcement-boundary flags. When available, it must return normalized `usage` values:
- `inputTokens`: total input tokens billed/consumed for the model call(s)
- `outputTokens`: total output tokens billed/consumed
- `modelCalls`: number of model invocations attributable to this step
- `wallTimeMs`: elapsed inference time for this step
- `costUsd`: provider-reported cost only when a trusted adapter can normalize it

Missing measurements are `UNKNOWN` or `PARTIAL`, never zero and never `WITHIN_LIMITS`. Invalid values are `INVALID`. `WITHIN_LIMITS` is reported only when every configured measurement is present and valid. An overrun is `EXCEEDED`. Unknown, partial, or invalid usage is a measurement gap, not a pass.

## Actual execution and enforcement boundary
The current bridge calls `routeModel` before it can receive provider-reported usage. Therefore the present check is **POST_INFERENCE_PRE_CLAIM**: an observed overrun holds the assignment before claim and worker action, with no automatic retry. This does **not** prevent or cap the model call that already occurred; provider-side input/output/time caps are not proven or enforced by this patch. `preInferenceCapEnforced` is explicitly false.

Repository call-site inspection found no non-test caller of `executeAssignedStep` on this branch. The bridge is an integration seam, not proof of live Production execution. No production adapter implementation was found that demonstrates provider-usage normalization or honors provider-side caps. Consequently, this capability remains shadow/pre-action-gated and is not an active company-wide runtime governor.

## Receipt and outcome handling
The normalized `resourceReceipt` is passed to the existing `complete` and `deliver` adapters and returned with the verified result. This preserves the receipt at the current adapter boundary without adding a new store. Durable persistence is **not verified** until the real completion/delivery adapter is identified and shown to retain the field in the existing authoritative receipt. A test mock accepting the field is not persistence proof.

## Operational controls and staged promotion
1. Keep the mode `SHADOW`; do not enable provider enforcement or change resource ceilings based on unverified estimates.
2. On measured overrun, hold before claim/action, surface the receipt, and do not retry automatically.
3. On missing/invalid usage, surface the measurement gap; do not label the run within limits or green.
4. Preserve existing authorization, security, independent-review, release, and owner-approval gates.
5. Promote only after the actual adapter supports normalized usage and hard limits, the existing receipt path durably stores the resource receipt, exact-head tests and independent review pass, and the owner approves the specific bounded enforcement scope.

## Proof required
1. Run existing and new governor tests and bridge behavioral tests at the exact branch head.
2. Cover missing, partial, invalid, within-limit, overrun-before-claim, adapter failure, no-retry, and receipt propagation.
3. Identify the real executor and model adapter; verify normalization and provider-side cap semantics from its implementation or provider response, not from model-generated text.
4. Verify that the existing authoritative completion/delivery receipt persists resource measurements and remains owner-retrievable.
5. Independently review policy values, security boundaries, and failure handling.
6. Obtain owner approval before any staged enforcement, production wiring, merge, or deployment.

## Rollback
Revert this PR's five-file change only. Existing routing, assignment, approval, and worker execution authorities remain unchanged.
