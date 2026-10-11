# Provider records: classification and five-application requirement review (read-only, 2026-10-11)

No provider was approved, deleted, merged, or dispatched, and no requirement was waived. Counts and anonymized rows only; no names, contact details or documents recorded. The manual payout rail (`MANUAL_PAYOUT_RAIL`, owner-approved 2026-10-09) remains the payout authority; Stripe Connect is not a universal dispatch requirement.

## A. The 51 provider records (`dd_providers`) by evidence
| Class (from `source_system` / `source_channel` / `provider_code` / created date) | Count | Application on file | Evidence |
|---|---|---|---|
| **Imported prospect records**: Airtable import, Facebook channel, with provider codes, all created 2026-08-28 | 44 | none | `source_system=AIRTABLE`, `source_channel=FACEBOOK` |
| **Owner-authorized provider records** (no provider code), created 2026-09-15 and 2026-09-18 | 4 | none | `source_system=OWNER_AUTHORIZED_2026-09-15` (2), `...-09-18` (2) |
| **Direct staff record** | 1 | none | `source_system=STAFF_DIRECT`, created 2026-09-19 |
| **Incomplete onboarding record**: manual owner onboarding through messenger recruitment | 1 | yes (linked) | `source_system=manual_owner_onboarding`, `source_channel=messenger_recruitment`, created 2026-09-25 |
| **Owner-confirmed real-agreement record** | 1 | yes (linked) | `source_system=OWNER_CONFIRMED_REAL_AGREEMENT_2026-09-18` |

So the 49 without applications are 44 imported Airtable/Facebook prospect records, 4 owner-authorized records and 1 direct staff record. Whether any of the 5 owner-authorized/direct records is an historical working provider (one real job already paid a provider $60 flat, bank verified) is **not proven by these records**; that needs owner confirmation. None is dispatch-eligible: all 51 read `assignment_ready = false` in `dd_provider_assignment_readiness_v1` (49 `APPLICATION_NOT_APPROVED`, 2 `W9_REQUIRED`). The records were preserved exactly as found.

## B. Requirement-by-requirement review of the 5 submitted applications (anonymized A1-A5)
Legend: OK = satisfied on file; PENDING/NOT STARTED/MISSING = open. Nothing below was changed.
| Requirement | A1 | A2 | A3 | A4 | A5 |
|---|---|---|---|---|---|
| Applicant type | individual | business | individual | individual | individual |
| Consent recorded | OK | OK | OK | OK | **MISSING** |
| Identity verification | PENDING | PENDING | PENDING | PENDING | PENDING |
| Tax form (W-9) | PENDING | RECEIVED (verify) | PENDING | PENDING | PENDING |
| Agreement | EXECUTED | EXECUTED | EXECUTED | EXECUTED | **PENDING** |
| Background check | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | PENDING |
| Insurance | not required | not required | not required | not required | not required |
| Compliance review | PENDING | PENDING | PENDING | PENDING | PENDING |
| Service ZIP codes | OK | OK | **MISSING** | **MISSING** | **MISSING** |
| Dispatch location verified | no | no | no | no | no |
| Linked to a provider record | no | no | no | yes | yes |
| Owner approval | not reached (0 of 5 reviewed) | | | | |
| Payout setup (manual rail `PAYOUT_SETUP` verified) | not reached | | | | |

How each requirement closes (existing machinery, no new queue): identity and background through the existing provider compliance items (`dd_provider_compliance_items`) by authorized staff; W-9 through the existing W-9 submission path (note #637 makes that path fail closed if encryption is not configured); consent and ZIP codes through the existing application record; owner approval and linkage only after compliance, through the existing readiness view. A2's received W-9 still needs staff verification, not assumption.

## C. Not done and why
- No approval: owner approval is a human decision and depends on the open items.
- No linking of the 3 unlinked applications to provider records: linkage is part of onboarding and changes the readiness view's output.
- No outreach to applicants or the 44 prospects.
