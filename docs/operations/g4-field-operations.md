# PR G4 — Field Operations & Provider Dispatch

G4 is the fulfillment boundary after G1 intake routing, G2 pricing connection, and G3 channel workflow state machines.

## Operational rule

**Pricing is read-only at dispatch.** Dispatch never calculates, discounts, taxes, travel, materials, or invoice totals. A job inherits its financial baseline from the existing estimate ledger established upstream.

## Provider network

Providers are modeled relationally:

- `dd_provider_organizations` — partner, subcontractor, or employee organization.
- `dd_providers` — individual fulfillment providers.
- `dd_provider_capabilities` — explicit service-line authorization.
- `dd_provider_coverage` — explicit territory coverage.
- `dd_job_assignments` — offer/accept/reject/cancel lifecycle.
- `dd_dispatch_events` — append-only operational audit history.

This intentionally replaces loose capability strings with relational authorization records.

## Dispatch lifecycle

```text
CREATED
  ↓
DISPATCH_REVIEW
  ↓
ASSIGNMENT_OFFERED
  ├── PROVIDER_REJECTED → DISPATCH_REVIEW
  └── PROVIDER_ACCEPTED → SCHEDULED
                            ↓
                         IN_PROGRESS
                            ↓
                         COMPLETED
```

An administrator is the dispatch gate. Providers cannot self-assign and cannot accept an assignment that is not currently `OFFERED`.

## Eligibility gate

A provider must be:

1. active;
2. attached to an active provider organization;
3. explicitly authorized for the requested `serviceLine`; and
4. covered for the requested `territoryId` when territory matching is supplied.

Availability is intentionally not represented as a guessed boolean in G4. Scheduling/availability can be added as a separate operational capability without corrupting provider authorization.

## Existing `dd_job_tasks`

`dd_job_tasks.task_type` already exists and is the correct downstream hook for task-template matching. G4 does **not** infer provider capability from arbitrary task names. The preferred sequence is:

`ServiceRequest / canonical service → job task template → service line → provider capability`

This keeps task execution semantics separate from human-readable task labels.

## Acceptance transaction

Provider acceptance/rejection is executed in one database transaction. The transaction verifies assignment ownership and `OFFERED` state, updates the assignment/job, and writes the dispatch event together. This prevents an accepted provider assignment from being recorded without the corresponding job state transition.

## Next integration boundary

The next field-operations layer can add:

- provider availability windows;
- appointment scheduling;
- task/checklist generation from canonical service templates;
- field photo/document uploads;
- customer/provider notifications;
- completion verification and change-order routing;
- Housecall Pro-style provider portal/mobile workflows.
