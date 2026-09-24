# DANI DECLARES — Call Disposition Codes (Draft)

Pairs with `DANI_SALES_CONTRACTOR_TRAINING_GUIDE_DRAFT.md`. Every outbound or
inbound sales call gets exactly one disposition logged against the lead/service
request. Codes map loosely to the `status` field already on `Lead` and
`ServiceRequest` (`prisma/schema.prisma`) — align the two if/when this becomes
a real field in the portal rather than a paper list, instead of inventing a
second parallel status vocabulary.

| Code | Meaning | Suggested next step |
|---|---|---|
| `QUOTE-SENT-PAID` | Customer completed checkout on the call or immediately after | Move request to fulfillment; no further sales follow-up |
| `QUOTE-SENT-PENDING-DECISION` | Quote/checkout link sent, customer wants time | Scheduled follow-up per customer's stated timeline, not a fixed "call back tomorrow" default |
| `CALLBACK-SCHEDULED` | Specific date/time agreed for a follow-up call | Calendar the callback; do not call earlier than agreed |
| `NOT-INTERESTED` | Customer declined, no interest in follow-up | No further calls; suppress the lead from future dialing |
| `WRONG-CONTACT` | Lead's info doesn't match a real prospect for this service, or reached the wrong person | Correct/remove lead record |
| `NO-ANSWER` | No pickup, no voicemail available | Requeue per DANI's max-attempt policy |
| `VOICEMAIL-LEFT` | Left a message | Requeue per follow-up cadence |
| `DO-NOT-CALL` | Customer asked to be removed from calling | Immediate suppression across all campaigns — this is a legal requirement, not a courtesy |
| `PAYMENT-LINK-ISSUE` | Customer couldn't complete checkout (declined card, link expired, technical issue) | Escalate to ops/finance contact; never re-collect card info by voice as a workaround |
| `DISPUTE-OR-COMPLAINT` | Customer disputes a prior charge or raises a complaint | Stop the sales conversation, route to ops same day |
| `INELIGIBLE` | Customer/property doesn't qualify for the requested channel or subchannel | Explain honestly why, offer an eligible alternative if one exists |
| `DUPLICATE` | Lead already has an open request/quote in progress | Merge or close as duplicate; don't run two parallel pitches on one customer |
| `COMPLIANCE-ESCALATION` | Anything touching the Section 0 non-negotiables in the training guide | Same-day escalation to DANI, independent of the sales outcome |

Notes:

- A disposition is about what actually happened on the call, not what the
  contractor wishes had happened — `NOT-INTERESTED` isn't a failure to avoid
  logging by leaving a lead in limbo.
- `DO-NOT-CALL` and `COMPLIANCE-ESCALATION` are never optional or skippable
  regardless of how the rest of the call went.
- If this list grows past what a person can hold in their head, that's a
  signal to move it into the portal as a real enum tied to `ServiceRequest`
  and `Lead` status rather than a document contractors have to remember.
