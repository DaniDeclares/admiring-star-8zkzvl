# DANI History-First Downstream Recovery

Owner directive: recover prior work before moving downstream because DANI repeatedly rediscovers capabilities and defects already handled in earlier release cycles.

## Required sequence
1. Read current canonical `main`.
2. Recover relevant merged, closed-unmerged, and open PRs/issues.
3. Recover relevant migrations, tests, proof receipts, runtime receipts, and bridge/drift records.
4. Check the owning live runtime; compare Tester and Production where both are relevant.
5. Classify prior work as CURRENT AUTHORITY, STILL VALID/REUSE, SUPERSEDED, FAILED/ABANDONED, DRIFTED, or GENUINELY MISSING.
6. Reuse/reconcile/repair before building.
7. Run the existing proof or worker before adding architecture.
8. Prove bounded changes in Tester/non-production.
9. Promote only through the existing governed release path.
10. Verify exact Production commit and runtime behavior.
11. Return upstream and repeat until green or legitimately held.

## Anti-duplication rule
An empty table/view, missing card, stale queue, failed worker, or inaccessible older record is diagnostic evidence only. It does not authorize a new worker, queue, scheduler, governor, Brain, dashboard, integration, onboarding path, or replacement data model until historical entry paths and current authority have been reconciled.

## Handoff requirement
Every non-trivial engineering handoff records the prior lineage reviewed, what was reused or superseded, exact proof run, exact Production verification if promoted, and any legitimate hold. Historical chat/AI statements remain receipts until checked against live authority.
