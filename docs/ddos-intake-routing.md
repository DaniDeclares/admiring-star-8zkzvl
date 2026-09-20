# DDOS Intake Routing Core

## Purpose

The intake layer is the first operational discriminator for DANI DECLARES. A request must resolve to an official DANI channel before pricing, workflow, proposal, checkout, or government procurement logic is selected.

## Official channel state machines

| Official channel | Intake type(s) | Commercial model default | Workflow | Initial state |
| --- | --- | --- | --- | --- |
| CH01 | B2C | B2C | `INSTANT_BOOKING` | `ROUTED` |
| CH02 | B2B_APT | B2B | `B2B_PROPOSAL` | `PROPOSAL_PENDING` |
| CH03 | B2B_RE | B2B | `B2B_PROPOSAL` | `PROPOSAL_PENDING` |
| CH04 | B2B | B2B | `B2B_PROPOSAL` | `PROPOSAL_PENDING` |
| CH05 | B2G | B2G | `B2G_SOW` | `SOW_REVIEW` |

## B2B2C / resident rule

B2B2C is a commercial relationship/economic model, not a channel.

For apartment/community programs:

- organization/property-side relationship → **CH02**
- resident direct experience → **CH01**
- verified community-resident subchannel → **CH01-B**
- organization-side commercial model may be **B2B2C**
- resident-side direct transaction remains **B2C** with CH01-B eligibility context

B2B2C must never be accepted as a replacement for an official channel.

## Routing rules

1. An explicit official channel wins when supplied.
2. Legacy intake types such as B2C/B2B_APT/B2B_RE/B2B/B2G resolve to CH01–CH05.
3. Legacy category fallback is controlled and recorded as `category_fallback`.
4. B2B2C supplied as `channelType` is rejected as a commercial-model/channel mismatch; it is never silently remapped.
5. Unknown or missing channels do **not** default to CH01. They enter `MANUAL_REVIEW` and the API rejects unresolved intake until a valid channel is supplied.
6. Channel selection does not set a price. Pricing remains the responsibility of the canonical pricing resolver.
7. B2C resident discounts do not cross into B2B or B2G pricing.
8. A CH02 contract price is never replaced by a CH01 resident price merely because the recipient is a resident.
9. B2G enters SOW/procurement review and never becomes an instant numeric checkout flow.

## Persistence

The request boundary carries official channel, commercial model, optional subchannel, workflow, routing source/reason, and related relationship context in the existing `property_details.operationsRouting` JSON boundary during schema transition.

The new migration also prepares normalized `official_channel`, `commercial_model`, and `subchannel_code` fields on `service_requests`. The live database has not yet been changed by this PR.

## Next connector

After routing is verified, the validated official channel + canonical service identity + commercial model are passed into the governed commercial/pricing layer. The resulting pricing snapshot remains downstream of the authoritative commercial rules.
