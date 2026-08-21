# Stripe ↔ Canonical Commercial Crosswalk — 2026-08-20

## Purpose

Inventory live Stripe payment objects without treating Stripe as the commercial source of truth. Every live object must ultimately map to an approved canonical offer, transaction type, amount/unit, and current status before it is changed or retired.

## Safety rule

This audit makes **no Stripe mutations**. A mismatch is a review state, not permission to change a Stripe Price or Payment Link.

## Live Stripe observations

The connected Stripe account currently contains active live Payment Links created in multiple generations. The newest observed set includes:

| Stripe Payment Link | Stripe product | Stripe price | Amount | Preliminary canonical disposition |
| --- | --- | --- | ---: | --- |
| `plink_1TePI2ChHm1uJK9xP30I4QEu` | Premium Custom Event Deposit | `price_1TePHvChHm1uJK9xmOHG0CQg` | $100 | `CUSTOM_PROJECT / DEPOSIT — REVIEW` |
| `plink_1TePHNChHm1uJK9xvtJ7nQLg` | Cookout Crew We Outside Package | `price_1TePGJChHm1uJK9xuwozBBX9` | $699 | `NO_CURRENT_CANONICAL_MATCH — REVIEW` |
| `plink_1TePFhChHm1uJK9xLs0CEQSv` | Cookout Crew Family Function Package | `price_1TePFYChHm1uJK9xYPJL9Ywa` | $399 | `NO_CURRENT_CANONICAL_MATCH — REVIEW` |
| `plink_1TePCZChHm1uJK9x9Cxgqk9d` | Cookout Crew Bronze Event Package | `price_1TePCGChHm1uJK9x9Uqah4Cb` | $199 | `NO_CURRENT_CANONICAL_MATCH — REVIEW` |
| `plink_1TeOPCChHm1uJK9xobwvjkDK` | Olivia & Eddie Wedding Operations Retainer | `price_1TeOOsChHm1uJK9xsz89BE8v` | $500 | `CUSTOM_PROJECT / DEPOSIT — REVIEW` |
| `plink_1Te5XZChHm1uJK9x9cqIshM2` | Property Reset Deposit | `price_1Te5VDChHm1uJK9xv09pr6al` | $250 | `NO_CURRENT_CANONICAL_MATCH — REVIEW` |
| `plink_1Te5XMChHm1uJK9xS8TYFkZW` | Court Filing Courier | `price_1Te5UkChHm1uJK9xW24MFynF` | $125 | `NO_CURRENT_CANONICAL_MATCH — REVIEW` |
| `plink_1Te5X0ChHm1uJK9xh5c6iFZu` | Records Organization Starter | `price_1Te5TCChHm1uJK9xZVzIZN7G` | $150 | `NO_CURRENT_CANONICAL_MATCH — REVIEW` |
| `plink_1Te5WvChHm1uJK9xHg8PUoNT` | Document Packaging & Submission Support | `price_1Te5FRChHm1uJK9xqvAWFKu3` | $250 | `NO_CURRENT_CANONICAL_MATCH — REVIEW` |
| `plink_1Te5WRChHm1uJK9xAhw9PadI` | Administrative Support Session | `price_1Te5URChHm1uJK9xkFYepRqU` | $125 | `POSSIBLE_01-ADM — AMOUNT_REVIEW` |

The repository's historical Stripe inventory contains additional active Payment Links, including older notary, apostille, I-9, POA, signing, courier, document-preparation, and convenience-fee objects. Those remain part of the crosswalk backlog until each live object is mapped individually.

## Known architectural result

The public application now routes customer payment intent through `/request-service` rather than treating raw `buy.stripe.com` URLs as the public commercial authority. The raw Stripe links remain an internal reconciliation surface.

## Required final disposition values

- `MATCHED` — exact canonical offer, transaction type, amount/unit and active status verified.
- `MATCHED_REVIEW` — canonical offer identified but amount/unit/status needs business verification.
- `UNMAPPED` — no safe canonical offer match exists.
- `LEGACY` — Stripe object predates the current canonical commercial catalog and is not part of the current public offer set.
- `RETIRE_AFTER_REPLACEMENT` — replacement path is verified and the old object can then be disabled.

## Do not do automatically

- Do not change live Stripe amounts.
- Do not deactivate Payment Links merely because they are absent from the current React config.
- Do not infer provider payout from a Stripe customer price.
- Do not create a new canonical offer solely to make a legacy Stripe object fit.

## Next engineering gate

Generate this crosswalk directly from the Stripe API and canonical catalog, store the audit result outside the public surface, and fail CI only for newly introduced customer-facing Stripe references or hardcoded commercial amounts. Existing Stripe mismatches remain explicit review records until business disposition is established.
