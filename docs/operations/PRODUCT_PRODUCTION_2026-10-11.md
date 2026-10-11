# Product production record — 2026-10-11

Inventory and draft artwork only. Nothing here is approved, priced, published, or released. No Shopify, Printify, Stripe or Supabase write was made.
Machine-readable authority for this record: `data/product-production/inventory.json` (CSV mirror alongside). Tested by `src/lib/operations/productProductionInventory.test.js`.

## Counts (verified from the files above)
| Measure | Count |
|---|---|
| Approved merch slogans recovered (owner list 2026-10-11): Halloween 20, Fall 9, Christmas 15 | 44 |
| Of those already in Shopify | 0 (per Notion 2026-10-10 14-product read; live Shopify not re-read) |
| Of those already in Printify | UNVERIFIED (no Printify access in session) |
| Of those already in Production `dd_merch_product_candidates` | 0 (that table holds 9 other candidates: DDP-NOTARY/CLEAN/WORKFORCE/FIELD/PROP) |
| Draft artwork files rendered | 44 (4500×5400, 300 dpi metadata, transparent background, self-contained badge, min 127 px edge margin) |
| Artwork approved by owner | 0 |
| Digital rows tracked | 40: 13 exist in Shopify, 25 new required, 2 historical/unverified groups (Cookout Crew, ELI10) |
| Digital products repaired or newly built | 1 draft (Cleaning Operator Job Kit v2: printable PDF + calculator); 0 published |
| Passed underwriting / genuinely sellable | 0 |
| Chris's horror merchandise | 0 records found (Supabase, Drive, Notion, repo); blocked |

## Conflicts and duplicates
- Shopify baseline disagrees between the Drive handoff (4 active, 7 draft; several $0) and Notion (14 active, none $0), one day apart. Several previously $0 or draft items (DIY Marketing $19, No-Face Reels $29, Home Command Center $12, House Manager $19) appear active at prices with no recorded owner approval, and the Holiday Home Planner, Home Manual Binder and $39 Bundle are in Notion only. Needs a live Shopify read and owner confirmation. Not changed.
- Production candidates DDP-FIELD-001 and DDP-PROP-001/002 overlap the requested Field Job Execution & Evidence Kit and Property Turn & Field Kit. Owner mapping needed before building duplicates.
- "Holiday Home Planner" and "Holiday Home Command Center" are treated as one product.
- The wording "Pumpkin Spice & Real Estate Advice" is already sold by at least one third-party seller (owner upload). It is not exclusive to DANI; the DANI art is original and the phrase needs a trademark search.

## Artwork
Generator: `tools/product-art/` (`render.mjs`, `icons.mjs`, `designs.mjs`, `package_art.py`; fonts Shrikhand, Alfa Slab One and Oswald, all SIL OFL). Outputs: `products/seasonal-art-2026/{halloween,fall,christmas}/` plus contact sheets and `qa-manifest.json`. All icons are hand-built vectors; no third-party art.
Palettes follow the owner's approved direction (Halloween: orange, cream, black, muted purple; Fall: rust, caramel, sage, oatmeal; Christmas: red, green, gold, cream). Each design is a self-contained badge, so it reads on any garment colour.
Checked by viewing every design on three contact sheets: legible, no clipped text after fixes (two defects found and fixed: icon overlapping the ribbon, "SOLD" tag clipped).
Not checked: Printify blueprint print areas, on-garment mockups, owner approval. These are drafts.
Owner-uploaded Etsy-style references were used for art direction only (see `reference_inputs` in the inventory); nothing was copied.

## IP screening (not legal clearance; no trademark search was run)
LOW: 39, LOW_MEDIUM: 4, MEDIUM: 1. "Witch Better Have My Signatures" parodies a well-known song title and needs an owner or counsel decision. Four song/film-title echoes need a trademark search. "Jingling All the Way to the Post Office" must not imply USPS affiliation.

## Existing digital products
- Cleaning Operator Job Kit ($19): edition 2 built as a draft (10-page fillable PDF plus calculator workbook) in `products/digital/cleaning-operator-job-kit/`. Not published; delivery replacement not done. See its README.
- Small Business Weekly Operations Planner ($15) and 7-Day Home Reset Kit ($9): customer files not found in Drive search. Cannot inspect or repair until the files are supplied.

## Blockers
1. No Shopify or Printify access in this session (no connector, token is server-side). Live listings, product IDs, variants and delivery links are unverified.
2. Printify cost, blueprint and variant data unverified; every price is null and every margin gate is open (policy: 30% net margin floor).
3. Owner approval of artwork, prices and release is required for every item.
4. Horror merchandise: no source records.
5. Two customer files missing for the existing digital products.

## Next actions
1. Owner: provide the planner and reset-kit files or a Shopify export; confirm the Shopify price and status conflicts.
2. Owner: approve, reject or edit the 44 draft designs from the contact sheets.
3. Owner review of the Job Kit v2; then repair the other two once their files exist.
4. After the Vercel limit resets and the Printify protections are deployed, verify Printify blueprints and costs read-only before any listing.
