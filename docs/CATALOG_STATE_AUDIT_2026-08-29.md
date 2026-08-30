# Catalog State Audit — 2026-08-29

## Verified runtime state

Supabase currently contains 284 rows in `public.services`.

Current `commercial_status` distribution:
- 260 active `CANONICAL_ACTIVE` records across current source states
- 19 inactive `CANONICAL_ACTIVE` records
- 5 additional `CANONICAL_ACTIVE` records from `RECONCILED`

The database therefore does not currently distinguish canonical identity from public commercial activation.

## Verified active launch candidates

The current runtime contains these five previously identified CH01 launch offers:
- `DNI-01A-009` — Bin Sanitation — $59
- `DNI-01A-010` — Odor Neutralization — $99
- `DNI-01C-001` — Indoor Plant Care — $149/month
- `DNI-01D-002` — Home Watch / Household Absence Check — $65/visit
- `DNI-01D-004` — Event / Party Home Preparation & Reset — $175

## Fulfillment reality

`dd_provider_capabilities` currently has 44 records and **0 authorized capabilities**. Provider organizations exist, but all currently have `accepts_new_work = false`; qualification/compliance/agreement gates are not closed for the network as a whole.

## Required state correction

`CANONICAL_ACTIVE` must be treated as canonical catalog identity, not as permission to sell. Public exposure should resolve through an activation gate that requires:
1. approved price,
2. channel/subchannel and buyer mapping,
3. valid territory,
4. qualified fulfillment capability,
5. applicable compliance evidence,
6. SOP/QA readiness,
7. enabled checkout route.

Until those gates are satisfied, offers belong in FULFILLMENT_GATED or INTAKE / QUOTE rather than direct production checkout.

## Safety rule

Do not bulk-change `public.services.commercial_status` or `is_active` until the current public-catalog query path has been inspected and the downstream effects verified. The correct fix is to add a gate, not blindly hide or delete the catalog.
