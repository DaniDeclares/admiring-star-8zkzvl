# Cleaning Operator Job Kit, edition 2 (DRAFT, not published)

Replaces nothing yet. Existing Shopify product: "DANI Cleaning Operator Job Kit", $19, SKU `DD-DIG-CLEAN-OP-01`. Price unchanged.
Source reviewed: Drive `DANI_Cleaning_Operator_Job_Kit.pdf` (2026-10-08, 7 pages of blank worksheets).

| File | Contents |
|---|---|
| `DANI_Cleaning_Operator_Job_Kit_v2_printable.pdf` | 10 pages, 89 fillable fields and checkboxes: cover, how to use with worked example, 7 worksheets (inquiry, pricing and profit, walkthrough and scope, arrival and loadout, room QA, issue and change record, completion and follow-up), usage and safety. Brand palette from `docs/design/DANI_CANONICAL_BRAND_PALETTE.md`. |
| `DANI_Cleaning_Operator_Job_Kit_v2_calculator.xlsx` | Pricing tab (labor, supplies, travel, margin, minimum price) and a 50-row job log with profit and hours variance. |

Checks done: every page viewed after rendering (three layout defects found and fixed); PDF field count and unique names verified with pypdf; spreadsheet recalculated in LibreOffice and matches the worked example (total cost $95.38, profit $44.62, margin 31.87 percent, minimum price for a 30 percent target $136.26).
Not done: Acrobat/Preview/mobile form-fill test; spelling review by a person; owner approval; the Shopify digital-delivery replacement. Before replacing the customer download: confirm the live Shopify delivery mechanism and that existing purchasers keep their link. The worked example is labelled as an illustration, not a price or earnings claim.
Generators: `tools/product-art/build_cleaning_kit.py`, `build_cleaning_kit_xlsx.py`.
