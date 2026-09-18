# Uploaded Materials Disposition Registry — 2026-09-18

Danielle's instruction: "I want everything I've uploaded to be utilized properly. If it's
something that builds the business, implement it. If it's data for history, store it. If it's
non sense disregard it. If it has promise, expand on it." This registry is that sort, covering
every document/screenshot batch uploaded in this session. It exists so nobody has to
re-derive "did we already deal with this file" from chat scrollback.

## IMPLEMENTED (live in the database, verified, migrated)

- **Master Provider Agreement (Cassandra Rosser, v3.0, signed 08/11/2026)** + **Section 01
  Financial & Funding Mandate** — Cass's 6 real Division 04 bookkeeping capabilities activated
  (`20260918020500_activate_cass_division_04_bookkeeping_authorization.sql`).
- **Christopher Walker relationship** (owner-confirmed in chat) — authorized for DTF/heat-press
  apparel and computer/workstation setup
  (`20260918021058_authorize_christopher_walker_dtf_computer_capabilities.sql`).
- **Cayla Wanzer relationship** (owner-confirmed in chat) — authorized as second cleaner +
  plant-care provider across all 39 real cleaning services and 6 plant-care services
  (`20260918021414_authorize_cayla_wanzer_cleaning_and_plant_care.sql`,
  `20260918021536_add_cayla_wanzer_unconfirmed_email_note.sql`).
- **Exclusive Notary Service Agreement + Addendum (Estate Plan Greenville, signed 08/27/2025)**
  and Google Drive historical notary rates — used to finally price and authorize all 7
  previously-pending Division 05 notary candidates with Danielle's own real, sourced numbers
  (`20260918022314_price_and_authorize_remaining_division_05_notary_candidates.sql`).
- **Dani Declares Master Pricebook (June 21, 2026)** DTF tiered pricing — applied to Christopher's
  two DTF/apparel services as the documented pricing structure
  (`20260918022345_update_dtf_apparel_tiered_pricing_description.sql`).
- Earlier in this session: Division 10 vendor-fulfilled event categories, pet-mess/yard-sale/
  engraving services, quote-builder and catalog pricing-display bug fixes — see prior migrations
  in `supabase/migrations/` dated 2026-09-17/18.

## STORED (real historical/reference data — not live catalog changes, kept for record)

- **CP575 EIN confirmation letter** — legitimate, EIN 33-4667104, on file for tax/1099 reference.
- **Business bank statements** (Relay Business Checking & Field Services, Mar–Jun 2026; personal
  Chase checking Feb–May 2026; Cash App Aug 2024) — used for the Thumbtack ROI forensic
  reconciliation. Conclusion on record: Thumbtack was net profitable (~+$3,276, Mar–Apr) via
  Zelle/Apple Cash payments that mostly bypassed Thumbtack's own payout rail; May was a complete,
  total stop (two transfer-only transactions, no business activity) caused by personal capacity/
  burnout, not lead economics. Also surfaced Cayla Wanzer's last name (real Zelle payment) and a
  recurring real payment relationship with "Christopher" (later confirmed as Christopher Walker,
  DTF/computer support).
- **AFRO Print & Link Packet, Vendor Market Packet, Business Growth Playbook, Business Client
  Packet** — real, usable marketing collateral. Vendor Market Packet has a real working intake
  link; the others have QR placeholders that need real links before distribution. Business
  Growth Playbook's "Success Stories" and stat claims are unverified templates, not confirmed
  real case studies — do not present externally as real results without confirmation.
- **NawfSide Roadside Enterprise LLC / "Joho" text threads** — real vendor conversation in
  progress. Real facts on record: 1099, $2M general liability, CPO/EPA certification claimed
  (self-reported, hard copy pending — not yet documented). Georgia Secretary of State search
  found two LLCs tied to "Joseph Sink": one Active/Compliance (3379 Peachtree Rd NE, Atlanta),
  one Administratively Dissolved (4191 Gravitt Pl NW, Duluth). **Not yet confirmed which entity
  is actually NawfSide, or whether "Joho" and "Joseph Sink" are the same person** — do not treat
  as a formalized vendor relationship until that's resolved (see task list).
- **Dani Declares Service Strategy** (document/compliance positioning, including trucking
  compliance paperwork support as a target vertical) — coherent real strategy note, kept as
  reference for future content/positioning work.

## DISREGARDED (AI-generated draft content or unreliable framing — not implemented)

- **"Business Overview" / Organizational, Technical, and Commercial Operations Report** —
  contains fabricated source code, an out-of-place medical disclaimer on every page, and a false
  "10-division" claim contradicting the real 13-division catalog.
- **"Stuff.pdf"** — raw ChatGPT continuation output describing a multi-state agritourism compound
  and magazine/publishing empire; not decided company structure.
- **"10-Division Institutional Master Pricing Matrix"** — invents "Shareholder Control,"
  "Executive Governance," "Capital Contribution Registry" divisions and a "parent company"
  reference disproportionate to the real one-to-two-person operation. Its one useful, corroborated
  fact (Cass's grant-readiness bookkeeping role) is already captured under "Implemented" above.
  Its "Workforce Coordination — Transitional Housing Placement" line item ($350/cohort) is
  flagged as needing real legal review before ever being offered, not disregarded outright.
- **B2B Pricing Structure / Compensation Agreement (both versions)** — confirmed AI-generated
  draft (visible "AI responses may include mistakes" disclaimer in one screenshot). The leasing/
  referral-commission model it describes is a real legal risk (unlicensed real-estate-brokerage
  activity) whichever version is used — not implemented pending actual attorney review.
- **Business & Inventory Workbook (snack/vending side business)** — the "Non-TCS strategy"
  compliance claims are not accurate (food-safety classification does not exempt a vendor
  operation from business licensing); the "avoid code enforcement" framing and informal
  cash-ledger system are not incorporated into official records.

## HAS PROMISE — queued for a dedicated follow-up pass, not yet implemented in full

- **R.E.A.C.H. & Outside Company Buildouts** (from the Master Pricebook) — a real, coherent
  consulting line (auditing/launching other people's businesses) not previously modeled anywhere
  in the catalog. Needs its own division/SKU buildout pass.
- **Full Master Pricebook reconciliation** — the Pricebook covers ~15 service categories with
  package-style B2B/back-office pricing that doesn't map 1:1 onto the current consumer-property
  13-division catalog. This is a larger structural question (does it replace, extend, or run
  alongside the current catalog?) worth its own dedicated session rather than a partial migration.
- **NawfSide automotive/roadside services** (Automotive Roadside Dispatch, Mobile Tire Plug &
  Repair, Wheel & Tire Assembly Swaps, Property Fleet Support Retainer) — real pricing already
  exists in multiple uploaded docs; blocked on confirming NawfSide's actual entity status and the
  payout model (Dani-priced/pays-sub vs. referral-fee), same fork as the Division 10 vendor model.
- **Division 02 property-turnover pricing** — five-plus independent documents now suggest the
  live $150–225 rate is significantly underpriced ($220–450 to $500–1,500+ depending on source).
  Still an open owner decision, not something to average or guess into the catalog.
