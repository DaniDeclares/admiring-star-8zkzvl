# Consumer routing proof (Tester, rolled-back transactions, 2026-10-11)
- Two claimants each claimed 3 items: 0 overlap. Claim wrote a CLAIMED_BY_SESSION receipt and set RESEARCHING, attempts 1.
- Existing executor ran afterwards and left the claimed item untouched (lease honoured).
- Release with NO_COMPARABLE_FOUND re-queued the item with retry_after = +24h; re-claim before cool-off returned nothing.
- After 3 attempts the item parked as BLOCKED/RETRY_LIMIT_REACHED with owner_decision_required = true.
- Unknown work key and bad outcome were rejected; releasing an unclaimed item was rejected.
- Three DIRECT observations through the ingest contract moved a claimed item to EVIDENCE_READY; it was no longer claimable.
- Note: reads in the same SQL statement as a volatile write do not see that write; assertions must be separate statements.
