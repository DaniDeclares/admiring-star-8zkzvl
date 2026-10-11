# Provider readiness breakdown (read-only Production, 2026-10-11)

Reuses the live Production manual payout rail (`MANUAL_PAYOUT_RAIL`, owner-approved, requires a verified `PAYOUT_SETUP` item per provider). No new payout integration, approval, assignment, or dispatch was created. Counts only; no names or contact data recorded here.

## Correction to the earlier reconciliation
`REVENUE_READINESS_RECONCILIATION_2026-10-11.md` said "49 providers whose applications are not approved". More precisely: **49 of the 51 active provider records have no application record at all** (every application-derived field is null in `dd_provider_assignment_readiness_v1`). Applications exist for only 5 people, all `SUBMITTED`, none reviewed.

## The 5 submitted applications (`dd_provider_applications`)
| Gap type | Detail |
|---|---|
| Missing documentation | W-9 not received for 4 of 5 (individual applicants: tax form PENDING); 1 business applicant has its tax form RECEIVED. This is the "2 W9_REQUIRED" the readiness view shows for the 2 applications linked to provider records |
| Incomplete screening | Identity PENDING for 5 of 5; background check NOT_STARTED for 4, PENDING for 1; compliance PENDING for 5 of 5 |
| Missing intake data | Service ZIP codes absent on 3 of 5; dispatch location unverified on 5 of 5; consent not recorded on 1; agreement PENDING on 1 (executed on 4) |
| Owner approval decisions | None reachable yet: 0 of 5 reviewed (`reviewed_at` null), and approval depends on the screening above |
| Linkage | Only 2 of 5 applications are linked to a provider record; 3 are unlinked |

Insurance is NOT_REQUIRED for all 5. Payout setup is a separate gate (the manual rail needs `PAYOUT_SETUP` VERIFIED per provider by authorized staff), not yet reached.

## What blocks dispatch, in order
1. Identity verification and background screening (staff/vendor action, not owner approval).
2. W-9 for individuals (document collection; fail-closed W-9 gate in #637 is separate).
3. Service area/ZIPs and dispatch location (data completion).
4. Compliance review, then owner approval decision (the owner decision; not made here).
5. `PAYOUT_SETUP` verification for the manual rail, then readiness view yields assignment-ready.

## The 49 records without applications
They cannot become assignment-ready without an application path or an owner decision to keep or deactivate them. Nothing changed. This is a bounded owner decision, not an engineering fix.

No provider was approved, no one was dispatched, and no gate was weakened.
