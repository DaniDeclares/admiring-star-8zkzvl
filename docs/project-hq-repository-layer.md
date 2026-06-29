# Project HQ - Repository Data Layer

This document describes the architectural purpose and data specifications for the centralized data access layer of Project HQ.

## 1. Core Architectural Purpose

The repository layer decouples the user interface from the physical database setup.

```txt
React Dashboard Panels
  -> clean JavaScript functions
/src/lib/hq Repository Layer
  -> internal Supabase read queries
Live Tables / Compatibility Views
```

Dashboard components should not fetch data from raw backend tables or SQL views directly. They should import functions from `/src/lib/hq`. If columns are renamed or legacy schemas are unified later, only this repository layer should need to change.

## 2. Fundamental Guardrails

- Zero-mutation rule: repository functions are read-only and perform `select` queries only.
- No `insert`, `update`, `upsert`, or `delete` behavior is permitted in this layer.
- No raw SQL execution belongs in this layer.
- Schema-dependent functions must degrade safely when a table, column, or relationship is missing.
- Public website behavior must not change because of this layer.

## 3. Implemented Function Reference

### Verified Core Pipelines

- `getHqLeads()`: Retrieves lead identity records across statuses.
- `getHqRequests()`: Retrieves service request scope records.
- `getB2BPipeline()`: Retrieves organization-backed leads for B2B follow-up.

### Schema-Dependent Pipelines: Awaiting Schema Verification

- `getHqQuotes()`: Reads general and FieldOps estimate records when those tables are available.
- `getHqJobs()`: Reads operational job records when `dd_jobs` and task relationship data are available.
- `getHqInvoices()`: Reads invoice records when `dd_invoices` is available.

### Filtered Control Indicators

- `getTodaysJobs()`: Reads today's jobs using `America/New_York` business-local date logic.
- `getOpenRequests()`: Reads inbound intakes requiring qualification or pricing.
- `getQuotesAwaitingApproval()`: Filters quote records with approval-pending statuses.
- `getOutstandingPayments()`: Filters invoice records with unpaid or sent statuses.
- `getVendorReadiness()`: Reads vendor-related follow-up records when the fallback structure is available.

## 4. Future Action Signatures

These mutation functions are intentionally not active in this deliverable:

- `authorizeQuote(quoteId)`
- `dispatchJobCrew(jobId, crewIds)`
- `settleLedgerEntry(invoiceId, payload)`
- `createInvoice(payload)`
- `updateJobStatus(jobId, status)`

Those belong in a later manual-actions or automation phase after the read-only dashboard is tested in daily use.

## 5. Acceptance Criteria

- `npm run build` passes.
- Public routes remain unchanged.
- All Project HQ data reads are centralized under `/src/lib/hq`.
- Schema-dependent functions return safe empty states instead of crashing when unverified structures are unavailable.
- No production data is mutated by this deliverable.
