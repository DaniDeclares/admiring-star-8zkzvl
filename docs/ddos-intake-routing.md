# DDOS Intake Routing Core

## Purpose

The intake layer is the first operational discriminator for Dani Declares. A request must identify its commercial channel before pricing, workflow, proposal, checkout, or government procurement logic is selected.

## Channel state machines

| Channel | Workflow | Initial state |
| --- | --- | --- |
| B2C | `INSTANT_BOOKING` | `ROUTED` |
| B2B_APT | `B2B_PROPOSAL` | `PROPOSAL_PENDING` |
| B2B_RE | `B2B_PROPOSAL` | `PROPOSAL_PENDING` |
| B2B | `B2B_PROPOSAL` | `PROPOSAL_PENDING` |
| B2B2C | `B2B_PROPOSAL` | `PROPOSAL_PENDING` |
| B2G | `B2G_SOW` | `SOW_REVIEW` |

## Routing rules

1. An explicit `channelType` always wins when it is one of the controlled channel values.
2. Legacy callers may use a controlled category fallback. The fallback is recorded as `category_fallback` so it can be retired after migration.
3. Unknown or missing channels do **not** default to B2C. They enter `MANUAL_REVIEW` and the API rejects unresolved intake until a valid channel is supplied.
4. Channel selection does not set a price. Pricing remains the responsibility of the canonical pricing resolver.
5. B2C discounts do not cross into B2B, B2B2C, or B2G simply because a capability is shared.
6. B2G enters SOW/procurement review and never becomes an instant numeric checkout flow.

## Persistence

The migration adds `channel_type`, `intake_workflow`, `routing_source`, and `routing_reason` to `service_requests` for the durable operations model. The current application also stores the routing context in the existing `property_details.operationsRouting` JSON boundary so the intake path remains backward-compatible while the Prisma model catches up with the database migration.

## Next connector

After this routing foundation is verified, the next step is to pass the validated `channel` + `serviceId` into `pricingResolver2026`. The resolver returns the authorized offer/status/amount (or an explicit undefined/custom result), and the resulting pricing snapshot becomes part of the quote rather than being recalculated by invoices or frontend components.
