# Existing DANI External Action Executor — SOP evidence review extension

**Status:** candidate branch, governed review required. No Production merge or deployment authorized by this document.

This extends the EXISTING `.github/workflows/dani-external-action-executor.yml`, not a new worker. The original scheduled/push `deliver` job remains the default. The new `sop_draft_review` job ONLY runs on an explicit manual `workflow_dispatch` with `mode=sop_draft_review` and an exact existing Production job UUID. Selecting that mode **skips** the normal external-action delivery job for that invocation. It never claims outbox actions.

## Source, scope, and output

- Source: scoped GET (read-only) from the existing `public.dd_job_execution_events` ledger; at most 25 events for the exact job ID. No bulk collection.
- Credentials: uses the existing worker's configured Production Supabase credentials at invocation; does not create or retrieve new keys. This credential currently has broader access than needed. Before enabling on main, review whether a least-privilege reader can replace it. The implementation issues GET only; this is not a database permission restriction.
- Output: redacted, pseudonymous **SOP REVIEW DRAFT** Markdown and manifest, never raw source events, free-text `facts`, `source_reference`, private contact information, or the original job ID. GitHub Actions artifact retained seven days, available to those permitted to access the repository workflow.
- No automatic screenshot capture, microphone recording, physical printing validation, customer sending, approval interpretation, SOP registry publishing, or Airtable/Asana writes.
- Failure: no events, invalid job ID, duplicate/wrong-job event, excessive events, blocked/invalid source, or unexpected source response fail closed without producing a valid SOP.
- Evidence events are **not** step-by-step human action recordings. All outputs remain draft and require verified physical operations and approvals where applicable.

## Acceptance evidence

- Local tests: `node --test scripts/dani-sop-review-draft.test.mjs`.
- Read-only connector observation against an existing completed job found 10 event records. Pure compiler produced one redacted DRAFT review: 10 event rows, 2 migration/classification exceptions, no registry save.
- Arya ceremony job has **zero** records in this specific ledger; it must NOT claim this worker captured the ceremony preparation or printing session. The manually reconstructed SOP remains linked to Asana `1219470900106478` and physical print/rehearsal verification remains open.
- Workflow syntax parsed locally; normal delivery job stays scheduled and SOP mode is manually gated.
- Before production release, review credential scope and GitHub artifact visibility, approve exact PR head, run a manual SOP review with source events and verify actual workflow run/artifact, have human review, then separately authorize any registry integration and repeat scheduled continuation. Do not declare unattended SOP capture based on a successful manual run.

## Rollback

Do not invoke `mode=sop_draft_review` or revert this specific PR/workflow addition; the existing delivery worker stays in place. No database migration, new schema, subscription, scheduled SOP job or credentials added.
