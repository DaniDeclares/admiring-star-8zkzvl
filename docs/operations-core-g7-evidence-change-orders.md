# Operations Core G7 — Evidence, Completion Verification & Change Orders

## Purpose

G7 proves field execution and handles real-world scope changes without granting the field layer authority to rewrite commercial pricing.

## Evidence

`dd_job_evidence` stores the operational evidence ledger: job/task binding, provider identity, evidence type, storage pointer, file metadata, and verification state. File bytes remain in the eventual storage provider; G7 does not prescribe an S3/CDN implementation.

## Change Orders

`dd_change_orders` is a standalone additive ledger. It is intentionally separate from `dd_estimates` and `dd_invoices`.

Flow:

`FIELD ISSUE → DRAFT/PENDING_APPROVAL → PRICING RESOLVER → FROZEN DELTA → APPROVAL → ADDITIONAL TASKS`

The original estimate is never rewritten. A change order stores its own channel, offer, catalog version, disclaimer, modifiers, and monetary delta snapshot.

Pricing is resolved only through an injected resolver adapter. G7 never infers rates from free-form field notes.

### Channel preservation

- B2C retains the B2C commercial context.
- B2B-APT retains the apartment workflow context.
- B2B-RE retains the real-estate workflow context.
- B2G remains procurement/SOW governed.

## Completion verification

All required G6 tasks must be completed first.

- **B2C:** eligible for automatic completion verification after the required-task gate.
- **B2B-APT:** supervisor/admin verification required.
- **B2G:** supervisor/admin verification required.
- **B2B-RE/B2B/B2B2C:** no new assumption is introduced by G7; their policy remains configurable rather than being silently classified.

G7 does not create an invoice or recalculate an invoice. Invoice generation remains downstream of approved commercial records.

## Security

The three G7 tables have RLS enabled and no anonymous/public write policy. Server-side authenticated operations own evidence, approval, and verification transitions.

## Pricing safety rule

> Field execution may document, propose, and verify. It may not invent, mutate, or silently approve commercial pricing.
