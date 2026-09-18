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

## Stripe/PayPal revenue reconciliation (2026-09-18, same day, direct API access)

Connected directly to the real, live Stripe account ("Dani Declares," acct_1RSlaPChHm1uJK9x) and
reviewed real PayPal transaction screenshots at Danielle's request. Individual client/customer
names are intentionally not repeated here (chat history has the specifics); this is the
disposition summary only.

- Real Stripe revenue ever collected: **$655.00** total across two payments to a Division 05
  notary client, both tied to real signed-agreement line items (Loan Signing, Witness, Gas/travel
  fees matching the real notary agreement rate card).
- A separate $375 open Stripe invoice to a contact at that same client organization is genuinely
  still unpaid -- a matching PayPal payment attempt was fully refunded shortly after, so the
  collection attempt fell through. Still owed; needs direct follow-up.
- Found one additional real payment (~$218) via PayPal from that same contact, the same day a
  real notary agreement addendum was signed -- real revenue that never touched Stripe.
- A second, separate $450 open Stripe invoice to the same client organization -- Danielle
  believes it was settled another way (the two contacts there work together, so a payment could
  have landed under the other person's name); left as-is given the small amount rather than
  pursued further.
- A separate contact's recurring PayPal payments (three visible: ~$330, ~$427, ~$883) are real
  DTF/apparel customer orders, typically passed through to Christopher Walker as fulfiller --
  corroborates real, live order volume for the DTF service line.
- The $80,000 "Reception Deposit" invoice tied to the real wedding-planning contract discussed
  earlier this session was a dead receivable: **the event never happened, and Danielle never
  received any money toward it** (not the deposit, not any other amount). **Voided in Stripe**
  (invoice id in chat history) so it no longer misstates real receivables -- relevant now that
  Cass is handling real bookkeeping.
- Same immediate in-and-out cash pattern seen in the earlier bank-statement forensic work repeats
  here: incoming PayPal payments routinely move straight back out to Cash App/Apple Cash within a
  day, consistent with the "no cash reserve" diagnosis from that earlier reconciliation.

## Decisions closed out (2026-09-18, "It is too low. Fix it..." instruction)

- **Division 02 pricing**: fixed. Added 20 real Master Pricebook package-tier services (Turnover
  Scout through Leasing Office Full-Day Support) at real, sourced prices well above the old
  granular per-task rates.
- **Angel T. Rice**: Danielle confirmed directly -- "Angel doesn't have a legal LLC anymore but
  she still does marketing and street marketing." No formal LLC to tie a provider org to, and no
  specific real service_id was named for her work, so no capability row was created (would be
  fabricating an authorization against nothing concrete). If/when a specific service and scope
  is named for her, she can be authorized the same way Christopher and Cayla were.
- **NawfSide / Joho**: confirmed the same person (Joseph Sink), confirmed active via GA Secretary
  of State lookup (3379 Peachtree Road NE Suite 655, Atlanta -- Active/Compliance; a second
  Duluth LLC under the same registered agent is Administratively Dissolved and is a different
  entity). A real NawfSide provider org and EXECUTED subcontractor agreement (dated 2026-08-11)
  already existed in the database from before this session, with 5 real automotive capability
  rows already correctly matched to real Division 12 services -- all sitting unauthorized and the
  services themselves unwired from the sellable catalog. Both are now fixed and live. Payout
  model: Dani-priced/Dani-sold/NawfSide-fulfilled (same architecture as the cleaning dispatch
  model), since these services get bundled into Danielle's own retainer packages rather than
  sold directly by the vendor.
- **R.E.A.C.H. consulting division**: built (4 real services under Division 04).
- **Master Pricebook pass**: implemented -- ~58 real services added across Divisions 02, 04, 06,
  10, and 11, covering Company Foundation & Operations, Administrative & Document Services,
  Document Prep & Submission, I-9 Verification, Government/Vendor Readiness, R.E.A.C.H., Money/
  CRM/Follow-Up, Property Operations & Turnover, Documentation & Reporting, Field Support/
  Logistics/Courier, Resident Services & Leasing Office, Website/Booking/Payments, and Merch &
  Brand Products.
- **Event division upgrade**: added a premium "Full-Service Destination Event Planning & Budget
  Management" tier (Division 10), priced as a 15% planning fee of the total event budget --
  matching Danielle's own real Wiseman contract precedent, not a guessed number -- explicitly
  designed to pull in cross-division services (property/venue prep, cleaning, notary/officiant,
  DTF merch, courier) into one coordinated package, per her request for "full destination events
  and things that could utilize my other services and divisions."
- **Ryan Zide's $375**: Danielle confirmed "Ryan owes me nothing" -- closed, no further follow-up.

## Still genuinely open

- **Angel T. Rice** — real, active marketing/street-marketing collaborator, but no LLC and no
  specific named service/scope to authorize her against yet. Needs a concrete "she does X, price
  Y" before she can be added the way Christopher and Cayla were.
- **NawfSide's compliance documentation** — activated for automotive/roadside dispatch based on
  a real pre-existing executed subcontractor agreement and owner confirmation of identity/active
  status, but his $2M general liability and CPO/EPA certification are still self-reported, not
  documented. HVAC/pool work remains unauthorized until real certificates are produced.
- **Full Stripe/pricing/checkout verification pass** across everything added today (task #24) —
  worth doing before pointing real traffic at the newly expanded catalog.

## Audit & reconciliation principle (locked 2026-09-18, Danielle's own words)

A large paste arrived (a prior AI chat's "Chris capability inventory," a full "Events &
Hospitality universe" reconstruction, and a "13 DANI divisions" no-money-left-on-the-table
framework) proposing pricing and a division taxonomy that conflict with what's actually live.
Danielle's ruling, verbatim in substance: **the pasted material is non-authoritative input, not
an implementation source.** She locked this as the standing audit principle:

> "Supabase canonical service/commercialization data + reconciled Airtable controls + governed
> Notion operating rules + live production/payment systems = source of truth. Any pasted
> inventory or alternate catalog must reconcile against those systems before it can change
> anything." A pasted inventory "cannot legitimately promote anything to live merely by
> supplying prices." Every service needs "one canonical identity, one governed commercial
> definition, one pricing source, one fulfillment rule, one compliance state, and one production
> representation."

Applied here:
- **Division taxonomy**: the paste's "13 DANI divisions" (D01 Home/Residential ... D13
  Programs/Memberships) is a different numbering/content scheme than the live database's real
  Division 01–13 structure used all session (Division 04 = Admin/Ops, Division 05 = Notary,
  Division 10 = Events, Division 12 = Courier/Vehicle, etc.). **Rejected as a taxonomy source.**
  The live structure stays canonical.
- **Christopher Walker's DTF pricing**: the paste's per-shirt table ($25/$22/$20/$18/$16 by
  volume, +$8 front+back, +$5 sleeve) conflicts with the live Master Pricebook tiered structure
  on DNI-11A-017/018 (Single $25+$18/item, Batch-12 $300, Batch-24 $540, Batch-50 $1050).
  Danielle's call: "I set the price but let's go with what makes the most sense" — resolved as
  keeping the Master Pricebook numbers canonical (real, dated, already governed) and rejecting
  the paste's table. Logged in each SKU's `conflict_register`
  (`20260918030622_reconcile_christopher_walker_pricing_conflict_register.sql`).
- **Christopher Walker's computer-service pricing**: the paste's broader price table (PC Assembly
  $225, Custom PC Build $300, Workstation Setup $175, Tune-Up $125, Printer/Peripheral/Network
  Setup, Data Transfer, Software Config, Troubleshooting $85/hr) doesn't collide dollar-for-dollar
  with the two live SKUs (Computer Setup $125, Workstation Deployment $299) but is likewise not
  adopted — same migration, same reasoning.
- **Events division expansion**: the paste's "no money left on the table" structural idea (turn
  every event touchpoint into a billable line item) had promise per Danielle's "if it has promise,
  expand on it" instruction, so 3 genuinely new Division 10 add-ons were built from the concept —
  Guest Travel & Lodging Coordination, Event Vendor Fund Disbursement & Reconciliation, Event
  Permit & Insurance Coordination (DNI-10A-035/036/037). None of the paste's specific dollar
  figures were used since none are sourced; all three are priced VARIABLE_QUOTE/INTAKE_ONLY, same
  pattern as the real destination-event tier
  (`20260918030615_expand_division_10_destination_event_addons.sql`).
- The rest of the pasted material (the full Chris inventory narrative, the full Events universe
  list, the full 13-division writeup) is kept only as reference in chat history — not transcribed
  into this registry's STORED section since it duplicates the reconciliation above.
