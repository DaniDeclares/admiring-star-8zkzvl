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

## 2026-11-10 security review — confirmed findings and held hosted gate

**Authoritative GitHub repository metadata:** `DaniDeclares/admiring-star-8zkzvl` is **PUBLIC**. The owner account `DaniDeclares` has admin permission. The previous SOP workflow could emit sensitive internal job-event timing and categories to GitHub artifacts available through repository access. Seven-day retention was insufficient.

**Authoritative Supabase ACL:** Production `public.dd_job_execution_events` has RLS enabled but `service_role` is granted SELECT, INSERT, UPDATE, DELETE and more; existing service-role credential is **not a read-only permission boundary**. The original SOP code accepted arbitrary valid job UUIDs and used that powerful credential. It did not independently verify caller-to-job authorization. These are release blockers, not resolved by GET-only code.

**Implemented fail-closed repairs in this PR:**
- `sop_draft_review` is eligible only on a **private** repo and when the invoking GitHub actor is the verified owner `DaniDeclares`. On a public repo or unauthorized actor, `sop_draft_security_hold` explicitly fails without loading any database credentials.
- The legacy `deliver` job continues for normal schedule and push events; manual SOP mode always skips it. No new schedule.
- The SOP job no longer receives `PRODUCTION_SUPABASE_SERVICE_ROLE_KEY`. It requires a **separately scoped reader secret** `SOP_REVIEW_READ_ONLY_KEY` with JWT role `dani_sop_reader` and a separate exact approved job binding `SOP_REVIEW_APPROVED_JOB_ID`. Neither new secret has been provisioned or authorized. The JWT-role check is only defense in depth; the database must verify signature, least-privilege GRANT and job-scoped RLS policy.
- Unknown event_type strings are no longer echoed into artifact output. CLI errors only print fixed error codes.
- Artifact retention reduced to one day; however privacy cannot be guaranteed solely by retention or pseudonymization. Private-repository collaborators with appropriate Actions access may still retrieve artifacts.

**To unblock safely, specific governance decisions are still needed:**
1. Approve a **private execution destination or equivalent private artifact sink**, without changing visibility of the current public customer website repository by assumption. The public repository must never run this sensitive SOP review. A new private repository/platform is *not* proposed automatically; an existing private approved host would be preferred.
2. Approve creation of database role `dani_sop_reader` with SELECT on only `id, job_id, event_at, event_type, source_type` from `public.dd_job_execution_events`, and an RLS policy restricted to exactly approved job claim, request purpose and expiration. Provision a signed scoped JWT and place it in the protected execution host only after review. No Production DDL or credential creation was performed by this PR.
3. Approve private reviewer access, exact job, authorized operator and artifact retention. Ensure secure storage and independent reviewer acknowledgment.
4. Run hosted mode on the **exact merged revision**, then verify job-source event count, expected event order, 2 migrated-source exceptions for historical pilot, no customer-PII/raw facts, no mutation/outbound action, and acknowledged reviewer. Only then consider separate approved Airtable publication.

**Current acceptance:** Read-only local historical pilot compiled 10 existing ledger events with 2 classification exceptions. Arya ceremony job has ZERO such events. No hosted SOP run, authorized SOP merge, private artifact destination, new key, or production SOP publication verified. Preserve the original ceremony manual SOP and open print/practice acceptance.

**Rollback:** stop SOP manual invocations and revert only this additive PR. Do not disable existing external-action delivery.
