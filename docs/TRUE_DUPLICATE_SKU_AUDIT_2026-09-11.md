# DANI DECLARES — True Duplicate SKU Audit

**Audit date:** 2026-09-11  
**Scope:** live Supabase commercial catalog tables  
**Authority:** `public.dd_master_service_universe`, `public.dd_governed_service_offers`, `public.danis_specials_offers`

## Definition used

A **true duplicate SKU** means the same SKU identifier appears more than once among simultaneously active/live records in the same commercial layer. Historical lifecycle rows are not counted as true duplicates when one record is `SUPERSEDED` and the live record is `CANONICAL_ACTIVE`.

A repeated service name with different SKUs is a **name collision**, not a duplicate SKU.

## Results

| Source | Rows checked | Distinct SKUs | True duplicate rows |
|---|---:|---:|---:|
| `dd_master_service_universe` — `CANONICAL_ACTIVE` | 302 | 302 | **0** |
| `dd_governed_service_offers` — all lifecycle-linked rows | 313 | 296 | 17 lifecycle duplicates |
| `danis_specials_offers` — `active=true` | 480 | 480 | **0** |

### Governed-table lifecycle duplicates

The 17 repeated governed SKUs are not simultaneous live duplicates. Each resolves to one `CANONICAL_ACTIVE` master record plus one or more `SUPERSEDED` records:

- DNI-01A-001
- DNI-01A-002
- DNI-01A-003
- DNI-01A-007
- DNI-01A-025
- DNI-01A-027
- DNI-01A-029
- DNI-01A-037
- DNI-01A-038
- DNI-01A-040 — one active + two superseded
- DNI-01A-041
- DNI-01B-008
- DNI-01D-001
- DNI-01D-005
- DNI-01E-001
- DNI-01G-001

Example verification: `DNI-01A-001` has one `CANONICAL_ACTIVE` governed record (`Resident Refresh — Standard Maintenance Clean`, `SELL_NOW`) and one `SUPERSEDED` record (`Standard Maintenance Cleaning`, `DO_NOT_SELL`).

## Name collision check

The active canonical master contains one repeated normalized service name:

- `Vendor Coordination` — `DNI-02A-019` and `DNI-10A-006`

This is **not a duplicate SKU** because the identifiers differ. It should be reviewed separately as a service-name/division naming collision if customer-facing clarity requires it.

The active Specials layer has **no repeated normalized service names** in the audit query.

## Conclusion

**True active SKU duplicates found: 0.**

The 17 governed repeats are lifecycle history (active + superseded), not competing live SKUs. No SKU deletion or renumbering was performed as part of this audit. The separate `Vendor Coordination` name collision remains a naming-governance item, not a SKU integrity failure.
