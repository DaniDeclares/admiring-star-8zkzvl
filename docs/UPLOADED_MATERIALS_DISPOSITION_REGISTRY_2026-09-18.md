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

## Airtable financial/cost-underwriting audit cross-check (2026-09-18)

A separate daily-check report arrived describing work done directly in the Airtable base (not
Supabase): a new **Business Finance & Capital Ledger** table, a funding-opportunity sweep (H&R
Block Fund Her Future, Her Agenda, Credibly, Hey Helen, High Five for Moms, Amber Grant, Georgia
CDFI/SBCG, SBA Microloan/7(a)), and a cost-underwriting recheck concluding **0 of 302 catalog
services currently pass a full labor+materials+margin audit ("PASS 1")**.

This was not taken at face value -- verified directly against live Supabase data before acting:

- **"Business Finance & Capital Ledger" table** — confirmed real; it exists in the Airtable base
  (`appJjOPWnFsZe11zM`) alongside `08 Manual Work Orders`, `Capital Opportunity Matrix`, and
  dozens of other governance tables already built out there this quarter. This Airtable layer has
  been running in parallel to the Supabase catalog work done in this chat all session -- the two
  hadn't been cross-checked against each other until now.
- **The "0 PASS 1" finding** — checked directly against `dd_master_service_universe`. Confirmed
  accurate: the ~150+ services added this session via the Master Pricebook pass, R.E.A.C.H., and
  the events expansion all have a customer-facing `starting_price` but no `internal_cost`/
  `provider_payout`/`margin_economics` populated -- exactly the "commercially cataloged, not
  cost-underwritten" gap the audit describes. This isn't a new problem, just a now-quantified one;
  it's the same gap task #24 (full pricing/checkout verification pass) already exists to close.
- **Two services caught actually selling at a loss** — confirmed real, not a modeling artifact:
  - Apartment Turn (DNI-02A-002): posted price $150 vs. the row's own documented cost model
    (2.5 hrs @ $60/hr + $20 supplies = $170.00) — a real -$20.00 loss per job.
  - Commercial Space Reset (DNI-02A-004): posted price $75 vs. documented cost (1.5 hrs @ $60/hr
    + $10 supplies = $100.00) — a real -$25.00 loss per job.
  Both were live at `commercial_offer_status = SELL_NOW` / `fulfillment_gate_status = READY` --
  a real customer could book either at a guaranteed loss. **Pulled from sale** (set to
  `DO_NOT_SELL`) pending a price increase or scope revision, rather than guessing a new price
  (`20260918103522_pull_loss_making_d02_services_from_sell_now.sql`). Two sibling D02 services
  (Amenity Reset at 10.5% margin, thin but not a loss) were left alone -- not pulled, just worth
  a second look later.
- Everything else in the report (grant deadlines, financing programs, GA certification program)
  is funding/compliance research, not a Supabase catalog change -- no action needed here; it's
  Danielle's and/or the Airtable-side process's to act on directly.

## Full 13-division Airtable-vs-Supabase economics audit (2026-09-18)

Danielle asked to check every division and Airtable directly, not just take a summary report at
face value. Ran 4 parallel research passes (Divisions 01-03, 04-06, 07-09, 10-13) cross-checking
Airtable's `04 Service Economics` / `Company Pricing Evidence` / `DANI DECLARES MASTER COMMERCIAL
UNIVERSE` tables against live Supabase pricing and offer status. Findings, verified before acting:

**New confirmed losses (fixed, same pattern as Apartment Turn / Commercial Space Reset):**
- Common Area Detail (DNI-02A-005): $125 price vs $135.00 documented cost = -$10.00 (-8.0%).
- Office Cleaning (DNI-02A-012): $125 price vs $135.00 documented cost = -$10.00 (-8.0%).
Both were SELL_NOW/READY; pulled to DO_NOT_SELL
(`20260918105646_pull_more_d02_losses_and_revert_nawfside_supersession.sql`). 5 more D02 services
flagged THIN (10-16% margin, not a loss) for a later look: Amenity Reset, Field Data Collection,
Make-Ready Cleaning, Property Transition Support, Punch List.

**A real mistake this session made and reverted**: this morning's NawfSide automotive activation
(5 SKUs, DNI-12A-022 through 026) turned out to directly contradict a real, dated governance
decision already on record in Airtable -- a 2026-09-13 entry (5 days before this session started)
stating "Governance supersession confirmed 2026-09-13. Existing canonical SKU is preserved for
audit/history but is not authorized as a DANI sellable service," recommended status DO NOT SELL.
This session's migration flipped `dd_master_service_universe`/`dd_governed_service_offers` to
CANONICAL_ACTIVE/SELL_NOW without knowing about that record -- meanwhile `public.services.
commercial_status` (never touched by that migration) had stayed correctly SUPERSEDED the whole
time, so Supabase's own tables were contradicting each other and Airtable simultaneously for 5
services live for checkout since this morning. Reverted all 5 back to DO_NOT_SELL/SUPERSEDED.
NawfSide's org-level activation (identity, executed agreement, accepts_new_work) stands --
only these 5 specific service records were reverted. The real successor appears to be DNI-12A-021
"Mobile Vehicle Detailing," which Airtable shows as owner-confirmed SELL NOW as of 2026-09-14 --
**open question for Danielle**: should NawfSide be authorized under the Detailing package-tier
model instead of the old granular roadside/tire SKUs?

**Structural finding, worse than any single bad SKU**: across the whole catalog, real cost/margin
engineering barely exists outside Division 02. Rough tally from all 4 passes:
- Division 01: ~2 of ~78 SKUs have a real computed margin (both healthy).
- Division 02: the only division with meaningful coverage (20/48 SKUs priced; this is exactly why
  it's the only division a loss was even detectable in).
- Division 03: 0 of 28 live SKUs have any cost data in either system.
- Division 04: 26/57 have partial data but 0 have a real computed margin.
- Divisions 05 and 06: 0 of 27 and 0 of 29 live SKUs have ANY cost/margin record in Airtable.
- Divisions 07-09: ~5 of 89 combined SKUs have real margin data (all in Division 09, all healthy).
- Division 10: 1 of ~49 SKUs priced.
- Division 11: 0 of 32 SKUs priced -- includes Christopher Walker's DTF/Heat-Press services,
  which have been live since this morning with no materials/press-time/payout cost basis anywhere.
- Division 12: only the 6 automotive SKUs above have any staged cost data, and it's a placeholder
  assumption (55-65% of customer price), not NawfSide's real contracted rate.
- Division 13: 0 of ~25 SKUs have any cost or market-pricing data in either system.

**Bottom line**: outside Division 02, the catalog cannot currently distinguish a healthy-margin
service from a hidden loss, because the underlying cost engineering was never built for ~90% of
the 302-service catalog. This is the same gap the earlier "0 of 302 PASS 1" recheck reported --
now confirmed division-by-division rather than as a single aggregate number. Task #24 (full
Stripe/pricing/checkout verification pass) and a new economics-engineering build-out are the
direct next steps; see chat for the phased plan discussed with Danielle.

**Governance/crosswalk sync gap (separate from pricing)**: Airtable's Master Commercial Universe
marks "Commercialization Readiness = Pending" on nearly every tracked record in Divisions 04, 06,
07, 08, and 09 even though Supabase shows the same SKUs live SELL_NOW -- the two systems' notion
of "is this actually approved to sell" have drifted apart across most of the catalog, not just the
Division 12 case that got reverted. Worth a dedicated reconciliation pass, separate from pricing.

## "C-team" mandate (2026-09-18) and Division 08 pilot

Danielle: "I want you to handle everything that needs to be handled the best way you see fit for
the company. you are officially my c team." Standing boundaries restated and still in force: no
fabricated data/pricing/legal terms/authorizations, no signing anything binding, no moving real
money without flagging it first. Proceeding autonomously on everything else.

**First build under this mandate — Division 08 (Business Development & Growth), the single worst
economics gap found in the audit** (zero cost data anywhere despite a live $1,500 line item):
- Replaced generic boilerplate description text on all 20 canonical SKUs with real, specific
  scope/exclusion definitions (what's included vs. what's a separate add-on), so a customer
  quoting e.g. "Lead List Building" or "Business Expansion Plan" knows exactly what they're
  paying for (`20260918110547_division_08_scope_definitions_and_retainer_fix.sql`).
- Fixed a real bug found while doing this: "Business Development Retainer" (DNI-08A-020, $1,500)
  was tagged `billing_cycle = ONETIME` -- a retainer that bills once isn't a retainer. Corrected
  to RECURRING/MONTHLY, matching the pattern already used for R.E.A.C.H.'s and Division 04's real
  monthly retainers.
- Did NOT fabricate cost/margin data for this division. Reason: the only labor rates documented
  anywhere in this system are Tier 1 ($60/hr field-routine) and Tier 2 ($75/hr coordination/QA),
  both for hands-on field work -- neither fits strategy/consulting work, and inventing a
  consulting hourly rate to force a margin number would be exactly the kind of financial
  fabrication this project doesn't do. Recorded honestly as PENDING in `internal_cost` and
  `margin_economics` instead. **This same gap blocks real cost-underwriting for Divisions 04, 06,
  07, and 13 too** (all consulting/strategy-flavored, none with an hourly rate on file) --
  asked Danielle directly for her real rate rather than guessing.

**Danielle's answer ("whjats the best way?") -- she asked for the recommendation rather than
picking an option herself.** Recommended and applied: set a real rate now, sourced from actual
2026 market research (WebSearch: ZipRecruiter/Glassdoor/industry consulting-rate guides), rather
than an arbitrary guess or leaving it unpriced indefinitely -- independent consultants doing
general small-business work run $75-150/hr at the entry tier (fractional-executive/specialized
consulting runs $150-300+/hr and doesn't match DANI's current positioning; salaried "small
business consultant" benchmarks run $42-54/hr and are too low). Set a new **Tier 3
Strategic/Consulting rate at $90/hr** -- one step above the existing Tier 2 ($75/hr), sourced and
cited, not stored as a formal `dd_provider_rate_cards` row (that table requires a
provider_org_id for negotiated subcontractor rates; Tier 1/2 were never stored there either, only
cited in `margin_economics` text -- Tier 3 follows the same precedent)
(`20260918111013_division_08_draft_cost_model_tier3_consulting_rate.sql`).

**Result, and why it's marked DRAFT not audited fact**: applying $90/hr against a reasonable
hours-per-deliverable estimate for each of the 20 D08 SKUs shows **every single one at 10% margin
or worse, and 12 of 20 are outright negative** (Lead List Building, Lead Research, Sales Process
Design, Outreach Campaign Setup, Follow-Up System, Referral Program Design, Partnership Outreach
Support, Vendor Network Development, Strategic Partnership Research, Growth Strategy Session,
Market Research, Competitive Research -- roughly -$6 to -$20 per job at current prices). Unlike
the Division 02 losses (pulled immediately because both the $60/hr rate AND the hours-per-task
were an independently audited company record), the $90/hr rate here is real and sourced but the
hours-per-deliverable are this pass's own planning estimate, not a verified fact -- so **nothing
was pulled from SELL_NOW**. This needs Danielle's read: either the whole division needs a price
increase, the hour estimates are too high for how she actually works, or a different rate applies.
Logged in each SKU's `margin_economics` field, explicitly labeled DRAFT.

## Vehicle detailing fulfillment gap + Airtable base/workspace check (2026-09-18)

Danielle: "i handle the car washing and detailing. me and cayla." This clarified (and reopened)
the NawfSide question -- if Danielle+Cayla do detailing/car washing themselves, NawfSide's real
scope is something else (the roadside/tire work), not a straightforward "successor service" via
Mobile Vehicle Detailing as guessed earlier. Task #37 updated to reflect this; still needs a
direct answer from Danielle on what NawfSide is actually authorized for now.

While checking this, found Mobile Vehicle Detailing (DNI-12A-021) was live at SELL_NOW/READY with
**zero** authorized provider capability rows in Supabase -- same "live but unwired" pattern found
with NawfSide's services this morning. Authorized both real fulfillers (Danielle and Cayla)
(`20260918111540_authorize_danielle_cayla_mobile_vehicle_detailing.sql`).

**Airtable workspace/base check** (Danielle: "check across all the workspaces on airtable? one
has waaaaayyyy too many records"): confirmed there are 2 bases across 3 accessible workspaces --
"Dani declares" (appJjOPWnFsZe11zM, ~50 tables, the real business one used all session) and a
second, completely separate base called **"Shadow & Sol"** (app8I18E7yBz7pp6P, ~30 tables) that
is NOT part of DANI DECLARES at all -- a distinct concept involving a mystical/seasonal
"Field School," land acquisition (80-160 acre property search), village-economy architecture, and
a "Book of Shadows" reflection system. Not touched or acted on -- flagged for Danielle to confirm
what it is / whether it's intentional, since it's substantial, previously-unreferenced content.

The real bloat is in "Dani declares," confirming the earlier audit's data-integrity flag: the
"DANI DECLARES MASTER COMMERCIAL UNIVERSE" table has **379 records for what should be a
302-service canonical catalog** (~77 excess/duplicate/legacy rows), and "04 Service Economics"
runs 272 rows, most blank. Danielle then shared a real Airtable billing screen showing
**Workspace 3 at 2,061 records against a 1,000-records-per-base plan limit**, workspace at $0
credit with $2 in personal credit available to transfer. This is a real capacity/billing issue,
not just clutter -- new record creation may be blocked until either the plan is upgraded or the
record count comes down. Per standing boundaries, no billing/credit action was taken without
Danielle's explicit go-ahead. Two real paths exist: pay for more capacity, or clean up genuine
dead data (starting with the confirmed 77-record Master Commercial Universe duplication) --
her call which one (or both).

## Reconciling a parallel report against verified ground truth (2026-09-18)

A "chat says" report arrived describing independent Supabase/Airtable audit work (D02/D08
economics recheck, an Airtable cleanup deleting 7 `ABSORBED_REDIRECTED` Master Commercial
Universe records). Per this project's standing rule, nothing in it was accepted without direct
verification against live systems first.

**Confirmed true:**
- D02: exactly 48 services / 42 priced / 6 unpriced, as reported.
- D08's "Business Development Retainer" billing-cycle fix (RECURRING/MONTHLY) is confirmed live.
- Airtable Master Commercial Universe: confirmed now at 372 records (was 379) -- the claimed
  7-record deletion of `ABSORBED_REDIRECTED` rows genuinely happened.
- My earlier Danielle+Cayla Mobile Vehicle Detailing authorization is confirmed fully intact and
  correct (`is_authorized=true` for both) -- the report's own uncertainty about it ("did not
  reproduce the authorization count") was their query missing it, not a real problem on my end.
- **A genuinely new, real finding the report surfaced**: D02/D03 channel-pricing rows can exist
  with `base_price_cents = NULL` even when the service has an approved price -- "row coverage
  != price coverage." Verified directly: 98 NULL rows in Division 02, 100 in Division 03, all for
  services that DO have an approved `starting_price` -- meaning up to 20 real D02 services and
  their D03 equivalents could have been showing broken/blank pricing on some channels. **Fixed**:
  backfilled `base_price_cents` from each service's own already-approved price (not a new number,
  just propagating the existing one) for all 198 safely-fixable rows
  (`20260918112221_backfill_null_channel_pricing_d02_d03.sql`). A separate 15 NULL rows in
  Division 10 were left alone -- those services genuinely have no price at the service level, so
  there's nothing real to propagate.

**Corrected -- not accurate as stated:**
- The report frames `dd_governed_commercial_offers`, `dd_market_provider_economics`, and
  `dd_company_cost_evidence` as an existing, populated economics architecture that just needs
  "populating and connecting" instead of building something new. Checked directly: these tables
  are effectively empty. `dd_governed_commercial_offers` has exactly **1 row total**, for an
  unrelated Division 05 SKU, explicitly labeled "candidate registry entry only" and dated
  2026-08-30 -- it has no row for D08 at all, so the report's specific claim that D08's
  `economics_gate` shows `PENDING_ECONOMICS` there isn't something that table can actually show.
  `dd_market_provider_economics` and `dd_company_cost_evidence` both have **0 rows**. These are
  unused stub tables, the same category as `dd_provider_rate_cards` (also empty) found earlier --
  not active infrastructure. The real, active, populated governance table remains
  `dd_governed_service_offers` (450+ real live rows), which this session has used throughout.

**Real discovery worth acting on**: `dd_company_cost_summary` has exactly one row, but it's
genuine -- a real company-wide cost audit dated 2026-09-10/11 (before this session started),
referencing a file `DANI_DECLARES_FULL_COMPANY_COST_AUDIT.xlsx` with real captured spend: bank
total $6,632.93, Amazon total $5,179.30, exclusion-review total $156.86, status
`EVIDENCE_CAPTURED`, with a real methodology note distinguishing durable equipment from service
material cost, owner draws from fulfillment expenses, and owner labor as a tracked economic
benchmark. This file was not found in the connected Google Drive -- Danielle clarified it lives
in a different chat's own document library/project knowledge store, not a connected Drive. If she
uploads it here, it should replace the Tier 3 $90/hr market-benchmark estimate with DANI's actual
real spend data for the ongoing Division 04/06/07/08/13 cost-modeling work.

## Drive upload processed: cost data, DSS backlog corrected, crosswalk bugs (2026-09-18)

Danielle uploaded ~45 real files to Google Drive (meant for a "chat dump" subfolder, landed in
the parent "DANI DECLARES LLC" folder instead -- left in place, not moved, since she didn't ask
for that). Two research passes read the highest-priority files. Findings:

**Cost data conclusion**: the $90/hr Tier 3 placeholder stays -- confirmed no real consulting/
admin/strategy hourly rate exists anywhere in these files either. Importantly, this isn't a gap
I'm inventing a fix for: `DANI_DECLARES_FULL_COMPANY_COST_AUDIT.xlsx`'s own Execution_Plan has
"Apply owner-time standards: set service-specific time assumptions and economic owner-rate
benchmarks" listed as step 6, status **Required (not done)**, and "Recalculate 251 services" as
step 7, status **Next (not started)**. The $90/hr estimate is doing exactly the next step this
company's own audit process already defined but hadn't reached yet.
**Real, usable data found instead**: actual Amazon spend evidence -- $4,071.04 in durable
equipment (steam cleaners, carpet equipment, printer, laptop, monitors; asset, not consumable,
per the file's own methodology) and $484-636 in real cleaning/pet consumables across ~34-37 line
items (Feb-Jun 2026). This could replace the flat "~$10-20 supplies" guesses already used in the
D01/D02 cost models -- but only once a real job-count denominator for that window is known (a
question posed to Danielle; not guessed). The "302_COST_CAPTURE_LOG.csv" that sounds like it
should hold per-SKU cost data is, in practice, a 299-row empty template: 0 rows have any real
captured cost value, matching the "0 of 302 PASS 1" finding from earlier in this session exactly.

**DSS legacy-offer backlog, corrected**: earlier session notes cited "~107 legacy danis_specials_
offers" needing reconciliation -- that number was wrong. The real master comparison file states
`danis_specials_offers` totals **480** records, with **211** unmatched to any active canonical
service (not 107). Only 135 of those 211 (single-service + seasonal items) have been analyzed so
far, and that analysis is itself draft/proposal data never applied to Supabase -- of those 135,
roughly 60-65 resolve cleanly, ~11 are genuine dead ends, ~7 are bundles, ~7 are gated new-service
candidates, ~5 look like duplicates, and ~39 are still unresolved. The other 70 (add-ons/packages/
recurring) haven't been touched at all. This is a bigger, still-open backlog than previously
tracked -- not urgent to close today, but the "107" figure should not be used again.

**Real Airtable/Supabase crosswalk bugs found** (feeds task #38, not urgent/safety-critical --
metadata drift, not live pricing/checkout risk): some records marked "UNMAPPED" in Airtable
actually match a real Supabase SKU exactly (a stale-status bug, not a real gap); a few are
genuinely wrong mappings (e.g. "Lockbox Installation" mapped to the unrelated "Open House
Staffing"; "Courier/Transaction Runs" mapped to unrelated "Real Estate Photography"); a
force-mapping bug routes 5 unrelated services to the same two generic SKUs (Wall/Vertical Surface
Detail, Window/Glass/Mirror Detail) with no real relationship; 2 claimed Supabase SKUs don't exist
in the active catalog at all; Airtable's own legacy-SKU field has duplicate values reused across
unrelated records. None of this is live/customer-facing -- it's Airtable-side reference data --
so no Supabase action taken.

**Compliance re-check, clean**: the two "CORRECTED" documents (Capability Statement, Funding
Application Packet) contain no new red flags -- the Capability Statement already explicitly
disclaims licensed-professional services and states I-9 is not offered, consistent with today's
fix. **But the Funding Packet uses "Danielle Williams" as owner throughout, matching the W-9 --
not Danielle Fong, her actual current legal name** (confirmed directly: she's divorced, reverting
to Williams, but hasn't yet been to the DMV, let alone updated SSA/IRS). That packet anticipated a
legal change that hasn't happened -- flagged directly to her as a real risk for the Sept 22 Fund
Her Future deadline. Also noted: both DSS/readiness export files still show the two I-9 services
as CANONICAL_ACTIVE -- these are stale pre-fix snapshots, not a sign today's pull didn't take.

## "Everything tackled" pass (2026-09-18)

Danielle: "i want everything tackled." Working through the open backlog systematically.

- **NawfSide roadside/tire, resolved twice today, final state is active**: first, real evidence
  (the dated 2026-09-13 governance note) showed the morning's reactivation was wrong, so it was
  reverted. Then Danielle provided new information -- "nawfside said i can create all the pricing
  and do all the marketing" -- which resolves the exact commercial-authority question that
  governance note was almost certainly gatekeeping. Reactivated the same 5 SKU identities as a
  proper Dani-priced/sold Model A line this time, updating all three governance layers together
  (`20260918115112_reactivate_nawfside_roadside_tire_pricing_authority.sql`). Real gap still open:
  the actual payout/margin split with NawfSide is not yet formally agreed -- tracked, not
  fabricated, doesn't block sale.
- New task opened: notification-channel (text/SMS) preferences in the portal settings --
  investigating the existing portal codebase (`src/pages/portal/`) before building.
- **Notification settings, shipped**: new `/portal/settings` page (all roles), `dd_notification_
  preferences` table, `update_notification_preferences` portal-operations action. Verified with a
  full production build before committing. Honest gap noted: the event broker still assigns
  delivery channel per event type via a static map, not per saved preference -- full wiring is
  follow-up work.
- **Airtable crosswalk bugs, verified before fixing**: checked each of the specific bugs the
  earlier research report claimed, directly against the live Airtable table (not just the Drive
  CSV snapshot it was read from) before touching anything. Result was mixed, exactly why
  verification matters:
  - "Lockbox Installation -> wrong SKU" claim: **false**. It's already correctly mapped to
    DNI-03A-010 "Lockbox/Access Coordination," a real match -- left untouched.
  - "Courier / Transaction Runs -> wrong SKU" claim: **confirmed real**. It pointed at DNI-03A-017
    ("Real Estate Photography," unrelated); the real match is DNI-03A-019 "Transaction Courier."
    Fixed, and promoted its status to VERIFIED_MATCH.
  - "D12-213 Courier Services" was sitting at UNMAPPED despite already having a plausible correct
    candidate (DNI-12A-001 "Local Courier") -- promoted to VERIFIED_MATCH.
  - The "5-service force-mapping bug" (Errand Running, Gift Wrapping, etc. routed to generic
    surface/window-cleaning SKUs) and one of the two "dangling SKU" claims (DNI-01A-042) were
    **not reproducible** in the live Airtable table -- those 5 records actually carry no Supabase
    SKU value at all (status PARENT_MATCH, no bug), and DNI-01A-042 exists fine in Supabase. The
    other dangling reference (DNI-02A-022) is real -- it doesn't exist in Supabase -- but no live
    Airtable record currently references it either, so there's nothing left to fix. Likely
    explanation: the Drive CSV this was read from is an older snapshot than live Airtable, not an
    accurate picture of current state. Nothing was changed based on unverified claims.
- Two background passes launched to continue the Division 08-style scope+draft-cost-model build
  for Divisions 04, 06, 07, and 13, using the same $60/$75/$90-hr tier methodology -- in progress.
- **Division 06/07, done**: real scope/exclusions written and a draft cost model built for all
  41 non-locked canonical SKUs across both divisions (Christopher Walker's 4 locked DTF/computer
  SKUs correctly skipped and verified unchanged). Draft negative-margin outliers found (not
  audited, nothing pulled from sale): Social Media Management, Property Photography, Video
  Editing, and Short-Form Content, all -8% to -13%. Also flagged for a real decision (not
  guessed): "Newsletter Production" (DNI-07A-009) is tagged ONETIME despite its own description
  describing recurring work -- genuinely ambiguous whether $350 means per-issue or monthly,
  unlike the unambiguous D08 "Retainer" bug.
- **Christopher's DTF, done**: real cost model for the single-item tier ($25 setup + $18/item)
  using sourced 2026 DTF consumable costs. The batch-deposit tiers were deliberately left
  unmodeled -- their "100% materials + 50% labor deposit" structure can't be honestly reduced to
  a per-item margin without Christopher's real remaining-labor billing figures.
- **PRICING_SHEET intake, done**: real document type + DB constraint + a distinct staff-review
  treatment (not a compliance verify/reject flow) guiding staff to reconcile real pricing sheets
  into the catalog the same way every other one has been handled this session.
- **Notification settings, done**: see above -- shipped, portal-wide, real gap in end-to-end
  channel wiring documented.
- Three more background passes launched: Divisions 04+13, Division 01 (largest, ~180 SKUs), and
  Divisions 03/05/09(+13 if not already claimed) -- in progress. The Division 01 pass and the
  Division 03/05/09/13 pass both hit this session's API rate limit before completing real work
  (Division 01: nothing done; Division 03/05/09/13: only confirmed D13 was already finished by
  the concurrent D04+13 pass, then died starting D05). Divisions 01, 03, 05, 09 remain open
  (task #34) and need to be relaunched.
- Division 04's owner-approved 2026-09-02 pricing lock (Airtable, dated, owner-approved) was
  found never synced to live Supabase: 20 SKUs (DNI-04A-001..020) were underpriced 1.5x-5x
  against the real locked price (e.g. Virtual Assistant locked $149 vs live $45; Vendor
  Administration locked $275 vs live $85). Corrected `services.starting_price` and propagated to
  all 5 channels in `dd_service_pricing_rules`, then recomputed internal_cost/margin_economics
  against the corrected price. Verified live. Likely the single highest-value fix this segment.

- **2026-09-18, provider-authorization/contact-info verification pass** (real request from
  Danielle: "find where that is and make sure its true across the board" for herself, Cass,
  NawfSide, Angel, Chris, and Cayla, so she can email them a portal signup link). Queried
  `dd_provider_organizations`, `dd_providers`, `dd_provider_capabilities`, `dd_portal_identities`,
  `dd_provider_applications`, and `dd_provider_source_evidence` directly. Findings:
  - **Danielle**: fully consistent -- org APPROVED/QUALIFIED/VERIFIED/EXECUTED, 146/146
    capabilities authorized. Has both a real staff_admin portal login (vendors@danideclares.com)
    and a real provider portal login (danijfong20@gmail.com, via her own self-submitted public
    application, service area Stone Mountain GA / "cleaning"). Minor cosmetic note: that
    application record itself is still sitting at application_status SUBMITTED / agreement_status
    PENDING even though the org and capability layers are fully approved -- not a blocker, just
    never formally closed out.
  - **Cass (Cassandra Rosser)**: found and fixed a real inconsistency -- agreement_status
    EXECUTED, compliance_status VERIFIED, and all 6 of her real capabilities (AP/AR admin,
    financial readiness, cash flow/budgeting, financial reporting, monthly bookkeeping,
    bookkeeping setup) already `is_authorized = true`, but `permission_status`/
    `qualification_status` on the org record were still stuck at PENDING. Fixed via migration
    `20260918153740` to APPROVED/QUALIFIED to match reality already recorded one layer down.
  - **NawfSide (Joseph Sink)**: consistent -- org APPROVED/QUALIFIED, exactly 5/17 capabilities
    authorized, matching the Model A reactivation done earlier this segment.
  - **Chris / Christopher Walker**: found and retired a stale duplicate. An old "Chris - Provider
    Beta Cohort" placeholder org existed with 0/6 capabilities authorized, no contact record, and
    PENDING status across the board -- fully superseded by the real "Christopher Walker - DTF &
    Technical Support" org created today (4/4 capabilities authorized, APPROVED/QUALIFIED). Same
    migration deactivated the placeholder so it stops appearing as a live, unresolved record.
  - **Cayla / Cayla Wanzer**: similar old "Cayla - Provider Beta Cohort" placeholder (1/8
    capabilities, stale) already correctly marked `is_active = false` from earlier -- left as is,
    no action needed. The real "Cayla Wanzer - Cleaning & Plant Care" org is fully authorized
    (46/46 capabilities, APPROVED/QUALIFIED).
  - **Angel (Angel T. Rice)**: **zero records anywhere** -- no organization, no provider contact
    row, no capabilities, no source evidence, no application. There is nothing to "make true" for
    Angel because nothing was ever created for her in this system. Flagging honestly rather than
    fabricating a status.
  - **Structural finding on contact info**: neither `dd_provider_organizations` nor `dd_providers`
    has an email or phone column at all. The only place the schema captures `contact_email`/
    `contact_phone` is the public-facing `dd_provider_applications` intake form, and only one real
    application has ever been submitted -- Danielle's own. Cass, NawfSide, Christopher, and Cayla
    never went through that public application flow (their authorization records were created
    directly, from Danielle's own confirmations, not from a submitted form), so **the system does
    not actually have stored emails or phone numbers for any of them** -- contrary to the
    assumption that this was already on file. The only exception: Christopher's email
    (chriswalkerjobs@gmail.com) was given directly by Danielle in chat earlier this session, but
    was never a structured field anywhere to store it in. Cayla's email was only ever
    "believed but unconfirmed." NawfSide's only known phone number is the public one listed on
    their own business website (source evidence, not a verified direct contact). Per this
    project's standing no-fabrication rule, none of the phone/email figures that appeared in the
    separate, unverified pasted "HubSpot" content earlier this session were used here -- real
    contact info for Cass, NawfSide, and Cayla needs to come from Danielle directly before any
    signup email can be sent to them.

- **2026-09-18, follow-up: chat's HubSpot/Stripe claims independently re-checked, this time
  against the live systems using this session's own HubSpot/Stripe access** (Danielle correctly
  pushed back that "chat" is a real second operational tool for this business, used while this
  session is rate-limited, and that its work should be verified rather than reflexively
  discounted as untrusted). Result: mostly accurate, one real discrepancy found --
  - **HubSpot contacts, all 5 confirmed real**, created 2026-09-18 ~15:02 UTC: Cassandra Rosser
    (404-630-5668 / cprosser1@gmail.com), Joseph Sink (470-891-6391 /
    nre@nawfsideroadside.com), Cayla Wanzer (678-632-8667 / caylawanzer@gmail.com), Christopher
    Walker (470-687-6061 / chriswalkerjobs@gmail.com -- matches exactly what Danielle gave
    directly in this session earlier, cross-confirming this is real, not fabricated), and Angel
    Rice (678-600-7123 / xtra.angel@gmail.com).
  - **Stripe payment links, partially accurate**: "Deep Structural Reset" (DNI-01A-002) is
    genuinely active (https://buy.stripe.com/cNidR80Tv5qKbi72CJ6kg1p). "Culinary Pantry &
    Kitchen Cabinet Organization" (DNI-01A-007) has a real payment link but it is **not**
    active -- Stripe has it explicitly flagged `active: false` with an inactive_message:
    "temporarily unavailable for online checkout while DANI DECLARES completes fulfillment and
    pricing verification." Chat's claim that this one was activated does not hold up; flagging
    for Danielle rather than treating it as done.
  - Added `contact_email`/`contact_phone` columns to `dd_provider_organizations` (migration
    `20260918154335`) -- the schema previously had nowhere to store this at all -- and populated
    them for Cass, NawfSide, Christopher Walker, and Cayla Wanzer with the now-verified HubSpot
    contact info, plus Danielle's own provider-login email, as a single source of truth. Angel
    Rice's verified HubSpot contact was deliberately NOT written into a new provider-org record
    for her, since she still has zero DANI capability/authorization on file and creating one
    would silently imply an authorization decision nobody has made -- she can still be sent a
    signup-link email without one.

- **2026-09-18, Chris/Angel marketing-content capability audit + selection-layer build.**
  Danielle relayed a claim from a parallel chat conversation that Chris (IRL streaming, YouTube
  channel management, video editing, social-media growth work) and Angel (property/apartment
  walkthrough and promotional video work) both have real content/marketing capability profiles
  beyond what's on file. Verified the checkable part directly: six real, live, SELL_NOW
  Division 07 SKUs match this description -- Social Media Management (DNI-07A-005, $650),
  Short-Form Content (DNI-07A-007, $250), Video Editing (DNI-07A-020, $199), Property
  Photography (DNI-07A-018, $199), Content Calendar (DNI-07A-004, $250), Website Content
  (DNI-07A-016, $400) -- and confirmed **zero providers network-wide have any capability
  record, let alone authorization, against any of the six**. The only capability rows that
  exist at all belong to the retired "Chris - Provider Beta Cohort" placeholder (already
  inactive, is_authorized=false, agreement NOT_ON_FILE) -- not copied forward. Angel still has
  no provider-org record at all. The specific "apartment/property promotional walkthrough
  video" product described for Angel has no matching canonical SKU -- flagged as a real catalog
  gap, not silently mapped onto an adjacent service.
  - Could not verify the claim itself (that Danielle previously decided this in an earlier
    chat conversation on a specific date) -- unlike HubSpot/Stripe, a prior conversation has no
    system of record either of us can query, so that part rests on Danielle's own confirmation,
    not independent verification.
  - Built the **selection layer only, no authorization granted**: added a `canonical_skus`
    array column to `dd_provider_capability_categories` (migration `20260918161624`) and
    registered a new "Content & Social Media Production" category covering exactly those 6
    SKUs. Division 07 has no sub-prefix scheme (all 20 of its SKUs share prefix "07A"), so the
    existing division+prefix matching couldn't isolate these 6 without also pulling in
    unrelated SEO/blog/email-marketing SKUs -- the explicit SKU list is additive and backward
    compatible with every other category. Updated `servicesForCategory` in
    `src/pages/PortalAccessPage.jsx` to check the explicit list first, falling back to the
    existing division/prefix logic unchanged for every other category. Build verified clean;
    `dd_provider_capabilities` row count unchanged (282) confirming no authorization was
    touched; Supabase security advisories re-checked post-migration, no new findings. This
    category is global, so it will also surface for Angel (or anyone else) the next time they
    go through the same self-serve onboarding wizard -- no Angel-specific wiring was needed.
  - Not yet done, deliberately: authorizing Chris (or anyone) for these capabilities, and
    reconciling his existing 4/4 DTF/computer authorization against real onboarding documents
    (W-9, agreement, ID, compliance) -- both remain gated behind his actual onboarding, per
    Danielle's explicit instruction not to authorize anything yet.

- **2026-09-18, pre-existing category-scoping bug found and fixed for Chris's two existing
  categories specifically (migration `20260918162358`).** While checking readiness for Chris's
  onboarding reconciliation, found that `COMPUTER_TECHNICAL_SUPPORT`/`COMPUTER_SETUP`/
  `BUSINESS_FORMATION_DIGITAL` (Division 6, 31 services) and `CREATIVE_DESIGN`/
  `DTF_APPAREL_PRODUCTION`/`DTF_PRINTING`/`HEAT_PRESS_APPAREL`/`LASER_ENGRAVING` (Division 11,
  33 services) all shared the same unscoped division-wide match -- a pre-existing bug, not
  introduced today, since neither division has a sub-prefix scheme (single "06A"/"11A" prefix
  each). Selecting any one of those categories in the live onboarding wizard would have
  generated capability rows for the entire division, not the intended narrow skill.
  Narrowed only the two categories whose capability_key exactly matches Chris's real,
  existing dd_provider_capabilities rows: `COMPUTER_TECHNICAL_SUPPORT` -> `DNI-06A-016`,
  `DNI-06A-017`; `DTF_APPAREL_PRODUCTION` -> `DNI-11A-017`, `DNI-11A-018`. Verified selecting
  both together now resolves to exactly his real 4/4, zero unrelated services -- no additional
  scoping was needed. The other six overlapping categories were deliberately left untouched;
  this was scoped tightly to what actually blocks Chris's reconciliation, not general
  Division 6/11 cleanup (that remains real backlog under task #23/#38).
  Full re-verification after the change: `dd_provider_capabilities` count unchanged at 282;
  retired Chris Beta Cohort placeholder unchanged (6 rows, 0 authorized); Chris's real org
  unchanged (4 rows, 4 authorized); the six-SKU `CONTENT_MARKETING_PRODUCTION` category from
  the prior migration unaffected; Supabase security advisories show no new findings (same 3
  pre-existing, unrelated warnings); production build compiles clean.
  Chris's onboarding email is intentionally still NOT sent -- holding until the wizard was
  actually tested against his real capability set, which is now done.

- **2026-09-18, Division 12 + Division 1 category audit (migration `20260918163634`).**
  Extended the same scoping fix to Division 12 (36 services, single "12A" prefix): found 7
  categories -- `COURIER_LOGISTICS`, `VEHICLE_DETAILING`, `ROADSIDE_ASSISTANCE`,
  `MOBILE_TIRE_INSTALLATION`, `PUNCTURE_REPAIR`, `TIRE_MOUNTING_BALANCING`,
  `TIRE_SALES_INSTALLATION` -- all resolving to the same unscoped 36-service list.
  `VEHICLE_DETAILING` is real: Danielle AND Cayla are both authorized for DNI-12A-021 "Mobile
  Vehicle Detailing" -- narrowed, not deleted. The five roadside/tire categories match
  NawfSide's real, currently-authorized 5 capabilities exactly -- narrowed each to its single
  real SKU (DNI-12A-022 through 026). `COURIER_LOGISTICS` is a genuine broad cluster (local
  courier/delivery/sourcing work) -- scoped to its real 21 matching SKUs (DNI-12A-001 through
  020 + DNI-12A-027 Medical Courier), explicitly excluding the detailing/roadside/tire
  specialty SKUs it was wrongly also matching.
  Also found and resolved two Division 1 near-duplicates: `HOME_WATCH` and `LAUNDRY_VALET`
  both have real backing (Danielle, DNI-01D-002 and DNI-01A-004) but were unscoped against all
  66 Division 1 services -- narrowed to their single real SKU each, kept as their own
  checkboxes even though both SKUs are also reachable via the already-correctly-scoped
  `HOUSEHOLD_CONCIERGE`/`CLEANING` categories.
  Deleted four confirmed true orphans: `JUMP_START`, `FLAT_TIRE_CHANGE`, `FUEL_DELIVERY`,
  `LOCKOUT_KEY_SERVICE` -- no canonical SKU exists anywhere in the catalog for any of these as
  a standalone billable service. Their identically-named capability_key does appear on four of
  NawfSide's own dd_provider_capabilities rows, but those are separate, already-correct
  discovery-evidence records (is_authorized=false, service_id=null, "qualification_required")
  from earlier public-directory research -- honest "candidate, not yet a real DANI service"
  markers, left untouched.
  Full re-verification: all touched/kept categories resolve to exactly their intended SKUs
  (COURIER_LOGISTICS: 21; the rest: 1 each); `dd_provider_capabilities` unchanged at 282;
  NawfSide's 4 discovery-evidence rows confirmed untouched; the four deleted categories
  confirmed gone; security advisories unchanged; production build compiles clean.
  Separately searched the full canonical catalog for anything resembling long-haul freight,
  trucking, load-hauling, or dispatch/broker work (raised because Danielle has been
  researching this as a possible side lane, per her own Facebook activity in
  owner-operator/load-board groups) and found nothing -- DANI has no existing SKU for that
  work. No category was mapped or created for it; per instruction, this stays a researched
  lead, not an authorized capability, until a specific person/business with real identifying
  details (name, DOT/MC number, insurance) is actually named.

- **2026-09-18, built `dd_sales_queue` (migration `20260918182419`) + Sales Queue tab in the
  Operations Console.** Real, persistent tracker for the Monday acquisition board, replacing
  ad hoc chat lists. Follows the exact RLS convention already used on `service_requests` (one
  `ALL` policy via `private.dd_is_staff_admin()`) rather than inventing new access rules.
  Columns: contact/company/role/phone/email, lane (INBOUND/WARM/REVISIT_CALLABLE/
  REVISIT_ROUTING/REVISIT_NOT_CALLABLE/EMAIL_ONLY/PARTNER/SCREEN_ONLY), source +
  source_confidence (VERIFIED/SINGLE_SOURCE/LOW_CONFIDENCE, so a HubSpot-native contact is
  never conflated with a single web citation), disposition (the full call-disposition set
  established earlier this session), next_action/next_action_date, suggested_sku,
  quoted_amount, amount_collected, and an optional job_id FK to dd_jobs.
  Seeded with exactly the 30 contacts/accounts actually verified this session -- the 6 Sapir
  Realty HubSpot contacts, Mia Fairly (double-verified HubSpot + web), 5 more web-sourced
  property-management contacts (3 callable, 2 office-routing-only), 3 named-but-not-yet-
  callable revisit accounts, RPM Living's generic vendor inbox, 7 real LinkedIn warm
  conversations, 2 LinkedIn Marketplace inbound requests that match real D04/D10 inventory, 2
  inbound requests flagged unclear-fit (no matching SKU), 1 partner (Flynt Waters/roofing),
  and 2 screen-only new connections. Nothing manufactured to pad the count -- the noise
  filtered out earlier (Suman Singh, Travis Fisher's ad, Janiza Padlan's recruiting InMail)
  was deliberately left out.
  Added a "Sales Queue" tab to `OperationsConsolePage.jsx` (grouped by lane, inline
  disposition/next-action/quoted/collected editing per row via direct `supabase.from(...)`
  calls, same pattern as the existing `updateBooking` handler) and a "Collected / weekly
  target" stat tile so the $1,200 target has a real, live number instead of living only in
  chat. Verified: table + RLS policy confirmed live, all 30 rows landed in correct lanes,
  production build compiles clean, no new Supabase security advisories (same 3 pre-existing,
  unrelated warnings).
