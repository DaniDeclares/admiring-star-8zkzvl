# PR G6 — Tasks, Checklists & Field Execution

G6 is the field-execution boundary between scheduling and completion.

## Operational flow

```text
G1 Intake
  ↓
G2 Canonical Pricing / Frozen Estimate
  ↓
G3 Channel Workflow
  ↓
G4 Provider Eligibility + Assignment
  ↓
G5 Availability + Appointment
  ↓
G6 Task Hydration + Field Execution
  ↓
G7 Media / Completion Evidence / Change Orders
```

## Task hydration

`dd_job_tasks.task_type` remains the compatibility hook for the existing task model. G6 adds `dd_task_templates` so checklist definitions can be managed independently from individual jobs.

Template selection is deterministic:

1. Prefer an exact canonical `service_id` template when one exists.
2. Restrict by explicit `channel_type` when supplied.
3. Fall back to channel-level templates when a service-specific template has not yet been verified.
4. Never infer a commercial price from a task template.

Service-specific templates should only be added after the corresponding canonical service ID has been verified in the pricing catalog.

## Provider task controls

A provider can update a task only when:

- the task exists;
- the actor is the assigned provider;
- the job is not cancelled;
- the requested status is valid;
- blocked/skipped tasks include an operational note; and
- tasks marked `evidence_required` include an evidence reference before completion.

The evidence reference is deliberately framework-neutral so the later media layer can connect Supabase Storage, signed uploads, or another approved evidence provider without changing the task state machine.

## Job completion gate

A job cannot transition to `COMPLETED` while any `is_required = true` task remains anything other than `COMPLETED`.

Blocked or skipped required tasks therefore cannot silently disappear from the operational record. The future change-order layer can route those conditions for scope review without allowing the field layer to rewrite the commercial amount.

## Pricing boundary

G6 contains no pricing calculations and does not modify:

- B2C discounts;
- B2B-APT or B2B-RE modifiers;
- B2G/SOW pricing;
- tax;
- travel;
- materials/pass-through charges; or
- invoice totals.

The frozen estimate remains the commercial source of truth. Field tasks describe execution, not price.

## Security

The migration creates RLS-enabled task-template and task-event tables without anonymous/public write policies. Provider/admin APIs should call the server-side execution functions after authentication and authorization.
