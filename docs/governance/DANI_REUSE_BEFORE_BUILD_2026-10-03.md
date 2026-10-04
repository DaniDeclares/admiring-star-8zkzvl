# DANI Reuse / Repair Before Build

DANI's default engineering posture is recovery and extension, not replacement.

Before creating a new worker, table, queue, scheduler, governor, dashboard, Brain/memory path, portal flow, integration, onboarding path, or release mechanism, prove that the existing authoritative mechanism cannot safely satisfy the requirement through reuse, reconciliation, repair, or bounded extension.

A blocked worker, zero-row query, stale queue, missing UI card, unavailable historical table name, or failed downstream proof does not establish that the capability is absent. Trace current source plus historical migrations/PRs/receipts and the owning runtime first.

When earlier work is found, classify it and preserve the newest still-authoritative behavior. Do not resurrect superseded architecture merely because it is more complete in an old branch. Do not force-merge stale branches; reconstruct still-valid bounded deltas onto current main and rerun exact-head proof.
