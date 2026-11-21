# AI Efficiency & Resource Governor — Shadow Capability

Date: 2026-11-20
Status: Draft implementation; CI and behavioral verification required before merge.
Authority: Existing DANI Intent-to-Outcome Engine, AI Execution Governor, assigned-worker bridge, verified worker registry and release controls.

## Scope
Extends `src/lib/aiExecutionGovernor.js` and `src/lib/aiAssignedWorkerBridge.js`. Does not create another agent, queue, scheduler, model registry, telemetry store, memory store, dashboard, or source of truth.

## Initial resource ceilings (advisory)
| Execution tier | Input tokens | Output tokens | Model calls | Wall time |
|---|---:|---:|---:|---:|
| Deterministic | 0 | 0 | 0 | 30 s |
| Bounded worker | 8,000 | 2,000 | 1 | 60 s |
| General reasoning | 24,000 | 4,000 | 1 | 120 s |
| Frontier review | 40,000 | 6,000 | 1 | 180 s |

Values are conservative policy starting points, not observed vendor prices, model guarantees, or hard enforcement. Per-task overrides may be supplied through the existing resolved task input. A cost limit is not invented; cost is evaluated only when a governed input supplies `resourceLimits.costUsd`.

## Behavior
- Routes continue to select the minimum tier from deterministic facts and verified capability evidence.
- Each route carries a `SHADOW` resource envelope to the existing model adapter.
- The assigned-worker bridge evaluates standardized usage fields (`inputTokens`, `outputTokens`, `modelCalls`, `wallTimeMs`, `costUsd`) before claim or execution.
- A reported overrun returns `HELD / RESOURCE_LIMIT_EXCEEDED`; it does not claim the action or retry.
- Missing provider usage remains unknown; it is never silently treated as zero.
- Resource policy has no authority to bypass approval, release, security or independent-review gates.

## Proof required
1. Run existing and new `aiExecutionGovernor` tests at exact branch head.
2. Run bridge integration tests covering missing usage, within-limit usage, overrun-before-claim and adapter failure.
3. Confirm adapter/provider usage normalization is documented and verified; do not infer it from model responses.
4. Review the shadow receipt behavior and policy ceilings with owner/independent reviewer.
5. Only after approval, separately decide whether to move from SHADOW to enforceable limits. No automatic rollout or production change in this PR.

## Rollback
Revert this PR's three-file change only. Existing routing and worker assignment behavior is retained.
