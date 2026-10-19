# Apartment campaign reconciliation — October 19, 2026

## Verified state

- Gmail contains 43 campaign messages today: 40 expanded-service follow-ups plus three earlier Sabra messages. They are not 80 sends. All 43 have the current 3,501-byte overview PDF. SENT means Gmail accepted the message, not delivery, reading or a sale.
- The existing live call workbook has seven property-specific attempts with owner-entered notes; exact call times were not recorded. Two other reported attempts have no confirmed property identity and remain unassigned. Email is never evidence of a phone call.
- The existing calling view now prioritizes the requested Chamblee/Dunwoody and Park at 500 clusters; previously entered notes, permanent community IDs and holds are retained. Resident services and the eight property capability routes remain separate from SKU release authority.
- Production inspection found no Gmail connection rows in `dd_integration_connections` and no Gmail communication events for today. Chat connector access does not establish HQ OAuth configuration. The source Gmail sync cron is daily; it does not provide immediate campaign synchronization.
- Existing queue records still carry older contact dates. Two addresses contacted today have existing RECENT_OUTREACH suppression in HQ; preserve that contradiction and repair synchronization before further sending. Do not erase holds to make the campaign appear consistent.
- Of 46 external recipient addresses, 24 match existing sales queue rows and 22 have no exact email match. Missing matches must use the existing identity resolver before any lead creation; do not create duplicate contacts merely to import a receipt.

## Messaging and authority

Exact slogan: **We Handle The Execution.** Use the approved seasonal-workload opening, broader property capabilities, the existing PDF and separate resident-service partnership. The approved resident benefit is 10% off selected eligible services under agreed rules, not a payment to managers. Confirm scope, price and availability before booking. Existing SKU, pricing, insurance, capacity, consent and fulfillment gates remain authoritative.

No additional outreach is authorized by this reconciliation. New sends require approval of exact recipients, content and attachments. Preserve failed addresses, opt-outs, no-interest responses, payment-request holds and drafts lacking confirmed recipients. Corporate and property-level introductions remain distinct; do not disclose another property's internal needs.

## Bounded code repair

The existing Gmail sync parsed display names into recipient strings that the exact-email sales bridge could not match. It also ingested drafts and substituted the current time for missing chronology. The repair normalizes recipient addr-specs, excludes drafts and own-address messages without SENT evidence, uses the SENT label for aliases, and rejects incomplete receipt chronology. Existing RPC ingestion and database message-ID uniqueness remain unchanged. This is not a campaign sender or a new queue.

Tests: `node --test tests/gmail-message-receipt.test.mjs` (seven passing). No database schema changes, production writes, merge or deployment are included. The pure tests do not establish end-to-end sync, concurrency, send idempotency or delivery. Production change-ledger registration is pending the owner's bounded production-write approval.

## Required next proof

1. Approve the reviewed receipt backfill and no-interest hold in existing production records. It must preserve current suppression and consent, ingest each Gmail ID once, and use the existing sales-touch bridge. No email is sent.
2. Establish the existing HQ Gmail connection through its authorized OAuth surface; do not copy ChatGPT tokens or secrets.
3. Review the draft PR, run normal CI/tester gates and approve promotion separately. Verify the exact production deployment and replay before claiming live synchronization.
4. The existing reply watcher is configured for weekday read-only monitoring. Configuration is not evidence that its next scheduled run occurred. Automatic campaign sending remains off pending exact-batch approval and proven dedupe/reconciliation safeguards.
