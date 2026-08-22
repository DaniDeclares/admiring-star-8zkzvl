# DANI DECLARES LLC — COMMERCIAL MASTER AUTHORITY 2026

**Version:** 1.0 — 2026-08-21  
**Purpose:** Single commercial decision record for the website, catalog resolvers, Stripe execution, dashboards, proposals, and provider routing.  
**Executable authority:** `src/config/commercialRegistry.js`  
**Legacy/non-authoritative:** `src/data/masterCatalog2026.js`, legacy solution totals, and historical Stripe links unless explicitly mapped by the canonical registry.

---

## 1. NON-NEGOTIABLE COMMERCIAL RULES

1. **DANI DECLARES controls customer-facing pricing, packaging, descriptions, discounts, and channel presentation.** Provider compensation is separate and is never inferred from the public price.
2. A service may exist in several channels, but **its commercial treatment is channel-specific**.
3. **B2C retail pricing is not B2B pricing.** B2B must not inherit B2C rates or resident discounts.
4. **B2B2C/community economics are two layers:** a property/community contract price plus a separate resident-perk layer. A resident retail rate is never the property contract price.
5. **B2G/government pages do not publish retail numeric prices.** Government work is solicitation/RFQ/RFP/SOW/task-order/contract based.
6. Stripe is a transaction/execution layer, not the pricing authority. Checkout may only use a canonical commercial record.
7. Provider lanes are fulfillment boundaries. Work requiring licenses/certifications/insurance/geographic coverage is routed only to an authorized provider.
8. Custom, variable, regulated, or procurement work uses quote/manual-invoice/contract workflows unless a canonical fixed price explicitly exists.
9. Historical prices that conflict with the canonical registry are deprecated and must not leak into public UI, checkout, or Stripe product generation.

---

# 2. CHANNEL ARCHITECTURE

| Channel | Customer | Commercial model | Public numeric pricing | Stripe |
|---|---|---|---|---|
| **B2C / Direct Retail** | Individual/household | Retail service/product pricing | Yes where fixed | Yes when canonical checkout eligible |
| **B2B / Commercial** | Property managers, brokerages, offices, businesses | Scope/volume/rate/retainer | Selective; proposals may show rates | Yes for approved fixed/frozen estimates |
| **B2B2C / Community** | Property pays/contracts; resident consumes perk | Contract economics + resident benefit | Resident-facing perk pricing only | Yes for eligible resident services |
| **B2G / Government** | Federal/state/local/institutional buyer | Solicitation/SOW/CLIN/task order/contract | **No retail numeric pricing** | **No public consumer checkout** |

Government positioning remains procurement-first, centered on **561720/S201 Custodial/Janitorial** and **561210 Facilities Support Services**; public government pages should emphasize capabilities, readiness, past-performance-style proof, NAICS/PSC alignment, compliance and solicitation response rather than consumer price lists.

---

# 3. B2C / DIRECT RETAIL — CANONICAL LOCKED SERVICES

## Home Cleaning & Reset

| Service | Configuration | Retail | Resident Preferred |
|---|---|---:|---:|
| Resident Refresh Standard Clean | 1BR/1BA | $100 | $85 |
| Resident Refresh Standard Clean | 2BR/2BA | $150 | $127.50 |
| Resident Refresh Standard Clean | 3BR/2BA | $250 | $212.50 |
| Resident Refresh Standard Clean | 4BR/3BA | $375 | $318.75 |
| Deep Structural Reset | 1BR/1BA | $275 | $233.75 |
| Deep Structural Reset | 2BR/2BA | $325 | $276.25 |
| Deep Structural Reset | 3BR/2BA | $425 | $361.25 |
| Deep Structural Reset | 4BR/3BA | $550 | $467.50 |
| Deposit Security Move-Out Turn | 1BR/1BA | $330 | $280.50 |
| Deposit Security Move-Out Turn | 2BR/2BA | $380 | $323.00 |
| Deposit Security Move-Out Turn | 3BR/2BA | $480 | $408.00 |
| Deposit Security Move-Out Turn | 4BR/3BA | $605 | $514.25 |

**Resident discount rule:** 15% only on records explicitly marked eligible. Government fees, pass-through costs, materials and protected/severe-condition charges are not automatically discounted.

### Cleaning modifiers / condition logic
- Severe pet mess / heavy soil: historical resident-facing protected rate **$150 flat, non-discountable**.
- B2B heavy-condition modifiers are separate from B2C and must never be copied into B2C checkout without a canonical B2C record.
- Bedroom/bathroom configuration is part of the canonical service identity; it is not a cosmetic UI choice.
- Any additional condition, square-footage, debris, pet, odor, construction, or access charge must be explicitly represented by a canonical modifier before checkout.

## Laundry & Linen

- Wash/Dry/Fold — **$45/basket**; resident preferred **$38.25**.
- Linen & Bedding Reset — **$35/bed**; resident preferred **$29.75**.

## Organization

- Closet Optimization — **$135**, 3-hour minimum; resident preferred **$114.75**.
- Pantry / Kitchen Cabinet Organization Base — **$150**; resident preferred **$127.50**.
- Estate Liquidation Baseline — **$65**, manual invoice; resident preferred eligibility is recorded but fulfillment remains quote/manual where scope requires it.

## Notary / Document / Witnessing

- Mobile Loan Signing — **$150**.
- Apostille Processing — **$175**; statutory/state fees are pass-through where applicable.
- POA / Healthcare Proxy Witness Base — **$35**; travel premium only through an approved modifier.
- Emergency Notarization Priority — **$95**.
- Family Law / Custody Document Witnessing — **$75**.
- Vehicle Title Signing — **$50**.
- Safety-Deposit Vault Verification — **$125**.
- School / Residency Financial Affidavit — **$45**.
- Independent Witness Deployment — **$50**.

**Important:** statutory notary/government fees and pass-through costs are not silently included in these service prices.

## Membership / Household Programs

- Executive Home Care Membership (1BR) — **$280/month**.
- Ultimate Turnkey Household Care (1BR) — **$520/month**.
- Pampered Pet Household Track (1BR) — **$245/month**.
- Digital Nomad Account Plan (1BR) — **$180/month**.

The membership layer is a package architecture, not permission to copy component prices into unrelated channels.

## Business / Smart Products

- Business Startup Launch Kit — Starter **$79**; the broader historical tier family also contains **$149 Growth** and **$249 Master Pro**. The latter two require reconciliation into the canonical registry before checkout.
- SmartTap NFC Functional Card — **$49**.
- Smart Review Counter Stand — **$49** (canonical product family; resident guide references this product).
- Smart Property/Event NFC Tag Set — historical starting reference **$75/5-pack**; canonical product treatment requires final registry mapping before new Stripe creation.

## Events

- Full Event Planning Coordination — **$650 baseline**, bespoke/manual invoice; scope may be adjusted by event complexity/budget through an approved SOW.
- Pop-Up Elopement Officiant — historical established baseline **$99 local / $150 travel**; must be mapped to the canonical event registry before automatic checkout.
- Full Wedding Ceremony Officiant — historical established baseline **$199**; must be mapped to the canonical event registry before automatic checkout.
- Holiday Patio/Balcony Lighting — **$450 baseline**; height/safety premiums require an approved modifier.
- Event planning, wedding planning, birthday parties, graduations, gender reveals, baby showers, anniversaries, corporate events, remote coordination and day-of coordination are **capabilities**, but custom event scope is quote/SOW unless a fixed canonical SKU exists.

## Custom Merchandise / Decor

Capability remains active for:
- Family reunion shirts and matching apparel.
- Birthday/party/event apparel.
- Custom drinkware: tumblers, mugs, stadium cups.
- Banners, welcome signs, hand fans, sticker packs and favor items.
- Event branding, signage, guest merchandise and welcome gifts.
- Corporate/agent/property apparel and promotional goods.

Historical **$15–$35/unit** Custom Party Decor & Merch is **not a universal retail price**. It is a historical working range and must not be used as an automatic Stripe amount because quantity, blank, print method, design, material, shipping and complexity change the price.

Custom DTF apparel and custom tumbler orders use a deposit workflow when a canonical quote is approved; historical material/production baselines are cost references, not customer-facing authority.

## Snacks / Gifting / Referrals

- Quick Snack Pack — **$3**.
- Gamer / Daily Combo Box — **$5**.
- Family Movie Night / Office Box — **$15**.
- Mega Bundle — historical **$10**; delivery qualification must be represented by the order rules, not hidden in the product price.
- Gift cards — **$25 / $50 / $75 / $100 / $150 / $250 / $500**, 100% face value; no resident discount.
- Giftable service experiences — variable according to selected canonical service.
- Referral reward — **$25 service credit** after the first completed qualifying transaction.

---

# 4. B2B / COMMERCIAL PROPERTY MANAGEMENT — ESTABLISHED COMMERCIAL RATES

These are commercial-channel rates and **do not inherit B2C resident pricing**.

## Property / Turnover

- Standard 1–2BR Unit Turn — **$350/unit**.
- Deep Move-In / Reset — **$450/unit**.
- Minimum Maintenance Dispatch — **$85/call**, including first 30 minutes.
- Commercial Handyman — **$55/hour**, billed in 30-minute increments.
- Materials sourcing — **cost + 10% sourcing fee**.

A separate newer B2B taxonomy exists in the registry (Rough $450 / Final $650 / Detailed $1,200). **Those three rates are not allowed to silently replace the established $350/$450 commercial sheet.** They remain a separate taxonomy awaiting explicit scope reconciliation.

## Property Administration / Leasing Support

Historical established commercial menu:
- Hourly Fractional Office Coverage — **$35/hour**.
- Daily Leasing Pipeline Blitz — **$250/day**.
- Lease-Up Performance Bonus — **$150/signed lease**.
- Notice Delivery & Legal Property Posting — **$35/unit**.
- Compliance Condition Reporting — **$65/report**.
- Field Courier & Supply Run — **$45/local run**.
- Package Locker / Mailroom Audit — **$75/session**.
- Key Audit / Lockbox Compliance Inventory — **$125/audit**.
- Form I-9 Employment Eligibility Verification — **$45/verification**.
- Certified Field Inspection — **$125/property inspection**.
- Certified Professional Test Proctoring — **$95/session**.

## Technical / Maintenance / Fleet

- Minimum Maintenance Dispatch — **$85/call**.
- Standard Handyman — **$55/hour** established B2B rate.
- Half-Day Multi-Unit Punch List — **$200/4 hours**.
- Full-Day Facility Blitz — **$375/8 hours**.
- Entry/Deadbolt Lock Modernization — **$45/unit labor**.
- Drywall Patch & Texture up to 12x12 — **$95/patch**.
- Faucet/Fixture Replacement — **$120/fixture labor**.
- Pet Waste Station Maintenance — **$45/station/visit**.
- Automotive Roadside Dispatch — **$65/callout**.
- Mobile Tire Plug/Repair — **$45–$65/fix**.

**NAWFside technical capability:** Handyman, punch-list repairs, fixture installation, minor repairs, HVAC diagnostics/service, CPO pool support, property maintenance, water-heater installation, emergency dispatch, fleet support, tire services and roadside dispatch. These are provider-routed services and require active provider authorization, insurance, geographic availability and applicable licensing/certification. NAWFside's agreement requires project compensation to be established by Work Order/SOW rather than inferred from public customer pricing. NAWFside is documented as maintaining required technical certifications including EPA/CPO/trade credentials where applicable. fileciteturn133file3L350-L380

## Cleaning / Condition / Technical Add-ons

The B2B master sheet contains these commercial modifiers:
- 1BR/1BA layout credit — **-$50** from the applicable B2B baseline.
- 3BR/2BA layout adjustment — **+$100**.
- 4BR/3BA layout adjustment — **+$225**.
- Square-footage overage — **$0.15/additional sq ft over 1,100 sq ft**.
- Vapor steam sanitation loop — **$150**.
- 24-hour HEPA air-scrubbing cycle — **$150**.
- High-velocity air circulation/drying — **$65**.
- Carpet steam extraction — **$175/area**.
- Tier 2 heavy soil — **+$150**.
- Heavy pet damage/extreme hair mitigation — **$200–$400**.
- Severe pet urine/odor neutralization — **$250–$500**.
- Tier 3 severe trash-out — **$350–$500**.
- Adhesive/window detail — **$150**.
- Post-construction/pre-lease fine-dust sweep — **$150/unit**.
- Ladder/height safety over 12 ft — **+$125 risk surcharge**.

These modifiers belong to the B2B commercial service resolver. They must not be blindly copied into B2C.

## B2B Print / Branding / Digital Products

- High-gloss move-in folder — **$8.50/resident packet**.
- Corporate office print — **materials + $45/hour**.
- Custom signage/banner production — **materials + $35/hour design fee**.
- Physical document scanning/digitization — **$0.10/page + $45/hour preparation**.
- Custom unit number plates — **$35–$55/plate**.
- Custom resident welcome kits — **$75/package**.
- Programmable NFC smart cards — **$15/piece** in the B2B production schedule; do not confuse this with the **$49 B2C SmartTap retail package**.
- DTF custom apparel production — **$25 low volume / $18 mid volume / $12.50 bulk 50+** as the B2B production schedule; customer quotes remain configuration-dependent.

## B2B Events / Marketing / Operations

- B2B Office Event Staging — **$450/event**.
- Live Property Activation — **$400/event**.
- All-Season Leasing Office Lighting Base Glow — **$750 setup / $450 takedown** up to 400 linear ft.
- Master Lighting Expansion — **$1,850+ setup / $900 takedown**.
- On-Site Office Staffing / Leasing Coverage — **$45/hour**.
- Administrative Overflow — **$35–$50/hour**.
- Virtual Assistant / Remote Admin — **$25–$40/hour**.
- Cinematic Mobile Walkthrough — **$250/video asset**.
- Business Development/Sales Sprint — **$750/2 weeks** or **$1,500/month**.
- Marketing/Creative Design/Capability Statements — **$750–$3,000**.
- Community Partnership Development — **starting at $1,000**.

## B2B Retainer Architecture — 12 Packages

1. Property Readiness — **$1,500/month**.
2. Resident Experience — **$3,250/month**.
3. Portfolio Optimization — **$5,500/month**.
4. Multi-Family Facility Compliance Shield — **$1,850/month**.
5. Premium Mechanical Asset Preservation Shield — **$2,450/month**.
6. Executive Administrative & Onboarding Support — **$1,750/month**.
7. High-Velocity Print & Resident Collateral — **$1,650/month**.
8. Property Fleet & Mobile Support — **$1,450/month**.
9. B2B Brand Merchandising & Apparel — **$1,950/month**.
10. Leasing Office Event & Seasonal Staging — **$2,150/month**.
11. Rapid-Response Trash-Out & Heavy Turn — **$2,850/month**.
12. Complete Enterprise Omnichannel Bundle — **$7,500/month**.

These packages remain commercial/property agreements. Their inclusions must be implemented as entitlements, not as a loose list of Stripe products.

### Additional established B2B channel rates
- Property Support Retainer — **$1,500/month**.
- Resident Experience Program — **$3,250/month**.
- Operations Partner — **$4,500/month**.
- Real Estate Listing / Physical Support — **$55/hour**.
- Open-House Setup & Takedown — **$300/event**.
- Listing & Transaction Support — **$1,200/month**.
- Office Operations — **$2,500/month**.

Where these overlap with the 12-package architecture, the service definition—not the name alone—determines which SKU is canonical.

---

# 5. B2B2C / APARTMENT COMMUNITY RESIDENT PERK LAYER

The property/community is the commercial customer. The resident is a separate consumer experience.

**Locked architecture:**
- Property contract pricing is negotiated separately.
- Resident retail pricing references canonical B2C records.
- A participating resident may receive the configured resident discount (currently 15% on eligible records).
- Property contract rates must never be calculated from the resident's discounted retail price.
- Property-funded packages may include resident services, events, printing, welcome kits, turn guarantees, and dispatches as contractual entitlements.

The old implementation that directly used a B2C `workingBaselineRate` as a B2B2C contract amount is deprecated and must not return.

---

# 6. B2G / GOVERNMENT & INSTITUTIONAL PROCUREMENT

## Public presentation
**No public retail price table.** The government page should sell capability/readiness, not consumer checkout.

### Canonical procurement posture
- 561720 — Janitorial Services / S201 Custodial-Janitorial.
- 561210 — Facilities Support Services.
- 561110 — Office Administrative Services where appropriate.
- 561790 — Other Services to Buildings and Dwellings where the scope actually supports it.

### Capability families
- Custodial/janitorial and turnover restoration.
- Deep cleaning and specialized sanitation.
- Facility maintenance and technical support through qualified providers.
- HVAC diagnostics/service through appropriately certified technicians.
- CPO pool operations/support through certified operators.
- Water-heater installation and related technical work through qualified provider routing.
- Handyman/punch-list/fixture installation.
- Property/fleet/roadside support.
- Administrative field logistics.
- Document preparation and non-attorney administrative support.
- Notice delivery, field verification, photo documentation and condition reporting.
- Signage, banners, staff apparel and physical collateral.
- Event/logistics support.

### Government commercial rule
Every opportunity is handled through **solicitation/RFQ/RFP/SOW/CLIN/task-order/contract pricing**. Stripe consumer checkout is disabled for B2G.

---

# 7. PROVIDER / PARTNER CAPABILITY LAYER

## NAWFside — technical/property execution
Authorized capability classification includes:
- Handyman and punch-list work.
- Fixture installation and minor repairs.
- HVAC diagnostics/service — certified HVAC capability.
- CPO pool support — certified CPO capability.
- Water-heater installation — certified/authorized capability.
- Property maintenance.
- Emergency dispatch.
- Fleet support.
- Tire services.
- Roadside dispatch.
- Other appropriately licensed/certified technical work within the provider agreement.

**Commercial rule:** NAWFside does not set the public Dani Declares price. Dani Declares sells the service; NAWFside fulfills approved work under a Work Order/SOW and the provider agreement.

## Cass / Connoisseur Cash — financial operations
Authorized provider service lane includes:
- Bookkeeping setup.
- Chart of Accounts.
- Bank-feed setup.
- Merchant-feed setup.
- Transaction categorization.
- Reconciliation.
- Ledger cleanup.
- Monthly bookkeeping.
- P&L organization.
- Balance Sheet organization.
- Financial-record organization.
- Month-end support.
- Cash-flow forecasting.
- Budgeting.
- Break-even analysis.
- Startup-cost organization.
- A/P and A/R tracking.
- Payroll-system support.
- Accounting-system setup.
- Financial statement organization.
- Historical expense organization.
- Financial-readiness packets.
- Cash-flow projections.
- Budget documentation.
- Financial accountability and pricing-related financial analysis when separately authorized. fileciteturn133file4L462-L520

**Provider compensation reference:** $25/hour is a negotiation baseline, not a guaranteed customer-facing price; actual provider compensation is established by Work Order/amendment. fileciteturn133file4L538-L550

**Not automatically authorized:** CPA services, audit/attestation, tax representation, legal services, investment/securities services, grant narrative/submission, direct contracting on Dani Declares' behalf, field services, cleaning or property maintenance without separate authorization. fileciteturn133file4L521-L534

### Partner pricing rule
Any researched Connoisseur Cash public/package range is a **provider-market reference only**, not a locked Dani Declares customer price. Customer-facing pricing must be created through Dani Declares' commercial registry and approved provider work order.

---

# 8. LEGACY / HISTORICAL PRICES THAT MUST NOT RETURN

The following legacy `startingPrice` values were identified as inconsistent or malformed and are not pricing authority:

- Admin Support legacy $5/hr → **do not use**; quote/custom treatment.
- Non-attorney Doc Prep legacy $5/pkg → **do not use**; channel-specific reconciliation required.
- Mobile Notary legacy $0 → **do not use**.
- Loan Signing legacy $50 → **do not use**; canonical B2C mobile loan signing is $150.
- Remote I-9 legacy $0 → **do not use**; channel-specific commercial/quote treatment.
- Apostille legacy $75 → **do not use**; canonical B2C processing is $175.
- Multi-family legacy $50 starting values → **do not use**.
- STR legacy $25 → **do not use**.
- Residential Deep Cleaning legacy $0 → **do not use**.
- Elopement legacy $9 → **do not use**.
- Wedding legacy $99 → **do not use**.
- Smart Property Tag legacy $5 → **do not use**.
- Startup Kit legacy $99 → **do not use**; canonical Starter is $79.
- Legacy solution bundle totals derived from malformed prices → **remove from checkout authority**.

Historical Stripe payment links that are unmapped remain historical data only. They must not automatically become new products or checkout links.

---

# 9. STRIPE GOVERNANCE

### Direct-link eligible
Only canonical fixed-price services/products whose amount is explicitly locked and whose provider/channel rules permit direct checkout.

### Frozen-estimate checkout
Variable services may enter Stripe only after the server has frozen the canonical calculated estimate and stored the underlying service/modifier selections.

### Manual invoice
Custom events, bespoke projects, provider quotes, unusual conditions, government procurement, and unresolved products use manual invoicing/contract workflows.

### Never generate automatically
- Any `PRICE_PENDING` or unresolved service.
- Any legacy product without a canonical offer mapping.
- Any B2G public price.
- Any provider payout inferred from customer price.
- Any B2B2C amount copied from B2C retail.

---

# 10. OPEN DECISIONS — THE ONLY ITEMS THAT STILL NEED BUSINESS LOCK

These are the actual unresolved commercial decisions surfaced from the materials; they are intentionally **not invented** here:

1. **B2B turn taxonomy:** formally decide whether the established $350 standard / $450 deep structure remains the public B2B menu while Rough/Final/Detailed ($450/$650/$1,200) becomes an internal tier, or whether the newer three-tier taxonomy replaces it. Do not silently choose one.
2. **B2B bedroom/bathroom modifier table:** lock exact mapping for 1BR/1BA, 2BR/2BA, 3BR/2BA, 4BR/3BA across each B2B cleaning tier.
3. **B2B condition matrix:** lock exact triggers for heavy soil, pet hair, pet damage, urine/odor, severe trash-out, construction dust, adhesive/overspray, carpet extraction and access/wait/second-trip charges.
4. **B2B2C contract prices:** create separate property/community contract SKUs rather than deriving them from resident retail.
5. **Administrative/document/I-9 canonical public prices by channel:** B2C/B2B/B2G applicability and final customer prices still require mapping.
6. **Custom apparel:** lock customer-facing retail/quote formula by garment type, print area, quantity, design fee, rush fee and deposit/balance rule. Existing $12.50–$25 B2B production numbers are production references, not universal retail prices.
7. **Custom tumblers:** lock customer-facing formula and quantity tiers. Existing historical $48/$5 material model is not a universal custom-order price.
8. **Reunion/party custom merch & decor:** lock whether pricing is per unit, package, design fee + production, or SOW. Historical $15–$35/unit remains a reference only.
9. **Business Startup Kit Growth/Master Pro:** $149/$249 exist historically, while Starter $79 is canonical. Lock the two higher tiers before creating Stripe products.
10. **Smart Property/Event NFC Tag Set:** historical $75/5-pack requires canonical product mapping before automatic Stripe creation.
11. **Event planning:** $650 baseline is locked as a bespoke/manual starting point, but event budget percentage, guest-count tiers, travel, vendor management, décor and production rules still need a canonical modifier schema.
12. **Pet service catalog:** the Pampered Pet membership exists, but standalone pet-service SKUs and exact pet-specific rates need explicit canonical records.
13. **Cass customer pricing:** provider capabilities are established, but Dani Declares customer-facing prices for Cass's financial services are not yet locked. Provider compensation is separate.
14. **NAWFside technical customer pricing:** public Dani Declares prices for HVAC, CPO, water heater, fleet, tire, roadside and other regulated/technical services must be created by channel/SOW; the provider's Work Order compensation is not a customer price.
15. **Government CLIN/Schedule pricing:** remains solicitation-specific and must not be converted into public website retail prices.
16. **Legacy Stripe cleanup:** 87 historical payment-link rows were audited; 77 were unmapped and 10 were matched for review. No unmapped historical link becomes canonical merely because it exists in Stripe. fileciteturn132file3L466-L478

---

# 11. IMPLEMENTATION ORDER

1. **Commercial authority:** keep `src/config/commercialRegistry.js` as the executable customer-facing authority.
2. **Resolvers:** make every frontend service card, quote calculator, checkout route and Stripe product resolver call the canonical registry rather than legacy catalog numbers.
3. **Channel guards:** enforce B2C/B2B/B2B2C/B2G separation server-side.
4. **Modifiers:** encode only approved modifiers; unresolved modifiers must force quote/manual review.
5. **Provider routing:** route technical work to NAWFside only when compliance records are active; route authorized financial work to Cass; keep provider payout separate from customer price.
6. **Stripe reconciliation:** map existing links to canonical IDs, deactivate/retire unmapped legacy products/links where appropriate, and generate new products only from canonical fixed records.
7. **Frontend:** service cards, detail pages, quote forms, cart, booking, resident perks and checkout must render the same canonical record.
8. **Dashboards:** customer, property, provider, operations and finance dashboards must use the same service IDs and transaction metadata.
9. **Testing:** every canonical SKU needs a price test, channel test, discount test, provider-routing test and payment-status test before production.

---

## FINAL AUTHORITY STATEMENT

**One service ID. One canonical definition. Channel-specific commercial treatment. Provider-specific fulfillment. Stripe executes; it does not decide.**

No developer, page, resolver, Stripe product, proposal, dashboard or provider workflow may invent a price outside this authority. If a price is not locked here or in the executable canonical registry, the system must route the transaction to quote/manual review instead of guessing.
