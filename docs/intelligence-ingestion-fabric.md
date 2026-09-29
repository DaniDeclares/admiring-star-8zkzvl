# DANI Intelligence Ingestion Fabric

Status: governed build specification for branch `umbrella/research-production-brain`.

## Reuse, don't duplicate
- Gmail delivery/mailbox authority stays with Gmail.
- Drive document/file authority stays with Google Drive.
- Supabase is DANI's governed observation, evidence, provenance, routing and operational-state authority.
- Existing `dd_ingest_email_communication` remains the communication ingestion path.
- Existing sales provenance/campaign controls from PR #336 remain canonical.
- Recover the deterministic Gmail mailbox/intelligence sorter from closed-unmerged PR #390.
- Reuse tester intelligence collection, observation, miner, evidence-registry, conflict, snapshot and learning-intake structures.

## Gmail collector
1. One bounded historical backfill per connected authorized mailbox.
2. Store a mailbox sync cursor using Gmail `historyId`.
3. Incremental collection uses Gmail History rather than repeatedly rescanning the same recent window.
4. Periodic reconciliation is retained as a backstop.
5. Fetch full authorized message structure for intelligence-eligible records.
6. Treat attachments as first-class source records with parent message/thread lineage.
7. Preserve account, message id, thread id, history id, direction, headers, labels and occurred-at.
8. Content is fingerprinted/deduplicated before downstream routing.
9. A single source may emit multiple observations/miner hits.
10. Historical material is evidence, never automatic current authority.

## Drive collector
Owner approved whole-Drive read-only intelligence access on 2026-09-26.
- Existing `drive.file` grant is insufficient for whole historical Drive.
- OAuth flow must explicitly request the approved read-only Drive scope and require Google re-consent.
- Historical collector remains disabled until the returned grant is verified.
- Collector may list/read/export accessible files and metadata.
- No edits, deletes, moves, permission changes or sharing mutations.
- Preserve file id, drive/account, MIME type, owners/modified time where available, version/revision identity, content hash and source reference.
- Prefer incremental Drive Changes after initial inventory/backfill.
- Keep Shadow & Sol / Own Land project-specific intelligence outside DANI production evidence.

## Classification/routing
Recover PR #390 categories and intelligence signals, then route to one or more of:
sales/relationship, customer-market, procurement-capital, legal-contract/compliance, accounting/finance evidence, provider/workforce, vendor-tech/security, service quality/operations, training/learning, brand/growth, records/knowledge, research governance.

System/auth/OAuth noise and INTERNAL_OPS_TESTING traffic must not become commercial leads or production metrics merely because it exists.

## Authority
Collection is observation-only. It may not:
- send customer/provider messages;
- move money;
- publish/change canonical pricing;
- authorize providers or worker classification;
- expand permissions;
- deploy/merge production code;
- make historical evidence current authority without governed reconciliation.

## Proof before production
- deterministic fixture for Gmail message + attachment;
- duplicate replay creates no duplicate canonical observation;
- one message can route to multiple miner families;
- internal/test and auth noise are suppressed from commercial routing;
- historical price/document is marked historical/authority-candidate, not current;
- stale Gmail history cursor triggers bounded full-sync recovery;
- Drive collector refuses to run without verified read-only whole-Drive grant;
- Drive collector performs no write API operations;
- provenance reaches evidence/learning intake and can be traced back to source record.
