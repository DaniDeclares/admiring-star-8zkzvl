# DANI DECLARES Commercial Authority & Provider Wall

Effective 2026-08-20.

## Commercial authority

DANI DECLARES LLC is the customer-facing commercial authority for the marketplace. This includes:

- customer-facing pricing;
- discounts and promotional offers;
- public service descriptions and marketing copy;
- channel-specific packaging;
- Stripe execution objects used to collect an approved customer amount.

NAWFside's written permission to allow DANI DECLARES to control pricing and marketing is treated as an operating authorization for this platform architecture. It does not make NAWFside the owner of the customer offer.

## Provider wall

Provider organizations are fulfillment lanes. They may receive approved scope, schedule, location, service requirements, and payout terms. They may not write or override customer-facing price or marketing authority.

Provider payout is a separate commercial calculation. It must never be inferred from a customer Stripe price.

## Stripe rule

Stripe Products, Prices, Payment Links, and historical exports are execution/reconciliation artifacts. They are not the source of truth for the catalog.

A Stripe object is safe for customer-facing use only after it maps to an active canonical service, correct transaction model, approved amount/unit, and current status.

## Legacy rule

Historical Stripe objects and historical catalog values remain available for reconciliation but cannot be used to silently resurrect an offer or override the canonical registry.

## Current provider state

NAWFside's organization record has an executed subcontractor agreement but remains `compliance_status = PENDING` and `accepts_new_work = false` until documentary activation is complete. This is intentional: commercial autonomy and fulfillment activation are separate gates.
