# DANI DECLARES — Executive Operating Model & Production Audit
**Date:** August 29, 2026  
**Owner:** Danielle Fong, Owner/Managing Director  
**Status:** Locked operating model; remediation in progress

## 1. What is locked
DANI DECLARES is operated as an integrated executive team. ChatGPT is the execution layer across COO/operations, CTO/engineering, product/customer experience, revenue/sales/business development, finance/economics, fulfillment/provider network, compliance/risk, government procurement, marketing/SEO, data/governance and QA/audit. Danielle remains the final owner-level decision-maker.

Routine technical implementation, research, reconciliation, documentation and existing-service pricing maintenance are delegated. Owner approval is reserved for genuinely new strategic/business-direction decisions, legal/financial/entity commitments, formal signatures, irreversible high-risk actions, physical-world execution, or owner-only account authorization.

## 2. Audit findings — August 29
### P0 — Production deployment failure
The latest production deployment on `main` failed because `ServicesPage.jsx` imported `BriefcaseBusiness`, which is not exported by the installed `lucide-react` version. Vercel reported `import_error` during `npm run build`.

**Action:** replace the icon with the supported `Briefcase` export and deploy in one coherent commit.

### P0 — Brand asset mismatch
The navigation was still using `/logo-script.png` while the repository already contained the owner-approved primary logo at `/dani-declares-logo.svg`. The favicon was also an older generated starburst rather than the requested DANI DECLARES seal.

**Action:** navigation and social metadata are aligned to the approved primary logo. A compact transparent seal favicon asset is added and the HTML points to it.

### P0 — Public shop contained legacy pricing authority
`ShopPage.jsx` imported `src/data/pricingCanon`, a quarantined legacy pricing layer, and exposed internal-style labels such as `margin` / `High-Tech NFC` / `Volume Apparel` to customers.

**Action:** replace the shop with a customer-facing production catalog that reads current service pricing from the governed commercial verifier and removes internal economics/terminology.

### P1 — Commercial catalog vs activation gates
The database contains a 284-service active commercial universe, but channel-availability and market-price tables are still being populated/researched. The catalog must not treat a service's existence as proof that every channel, market, fulfillment lane or checkout route is ready.

**Action:** preserve the 284-service universe while continuing channel/buyer/use-case/variant/package/add-on/recurring/fulfillment expansion and activating only records whose required gates are satisfied.

### P1 — Pricing source conflict
Some service rows contain starting-price anchors while the detailed channel/market pricing tables have locked rows without populated numeric overrides and status `RESEARCHING`. Example: `DNI-02A-001 Apartment Turn` currently has a $95 service-row anchor but its market rules are explicitly still researching. This must be reconciled against the approved property-management price book before treating the number as final.

**Action:** do not silently replace the value. Keep the conflict visible and route it through the pricing reconciliation matrix. Existing approved prices remain owner-authorized; unresolved conflicts use `PENDING_RECONCILIATION`.

## 3. Market research baseline completed
Current 2026 Atlanta/Georgia evidence was reviewed for the major commercial families:

- **Residential cleaning:** Atlanta published benchmarks currently cluster around roughly $125–$280 per visit for typical homes; deep cleaning commonly runs materially above standard maintenance. Sources reviewed include Recommended Research, GetQuotePro and ATL Clean.
- **Handyman/property maintenance:** Atlanta 2026 benchmarks vary substantially by provider and scope. Sources reviewed show roughly $40–$90/hr on broad local guides, with some established providers around $60–$110/hr. Project minimums are common.
- **Real-estate media:** Atlanta published packages show residential photography commonly around $150–$375 for standard packages, with drone work commonly $250–$450 for photography and higher for photo/video packages.
- **Event planning:** Atlanta event planners publish month-of coordination around $1,250+ and full planning around $3,200+, with custom scope by guest count and complexity.
- **Custom DTF apparel:** Atlanta DTF providers publish retail prices around $25 for a standard custom shirt, with significant volume discounts.
- **Mobile notary:** Atlanta mobile notary providers publish packages around $50 for basic metro service, $120 for extended services and $200 for broader/premium coverage. Georgia statutory notary fees and travel/appointment pricing must be treated separately.
- **Business formation:** Georgia's official Secretary of State currently lists $110 for LLC filing and $60 annual registration. Market formation-service fees commonly range from low-cost filing assistance to roughly $199–$399+ for bundled services.
- **Social media/marketing:** Atlanta agencies publish roughly $1,500/month for full social management and $2,500/month for social + email, while broader Georgia SEO benchmarks commonly start around $1,500/month for local SEO.
- **Training/workshops:** Atlanta public training examples show interactive 90-minute workshops around $197 per participant; private corporate delivery remains scope/participant dependent.
- **Janitorial/facilities:** Atlanta janitorial benchmarks commonly use square-foot and monthly-contract models; published guides show roughly $0.08–$0.28/sq ft depending on facility size and frequency.

These benchmarks are evidence, not automatic DANI prices. Customer price must remain the governed DANI price after scope, channel, market, fulfillment and economics reconciliation.

## 4. Commercial expansion conclusion
The 284 services are the current commercial/service base, not the ceiling. The next expansion layer is:

**Capability × Channel × Buyer × Use Case × Variant × Package × Add-on × Recurring × Fulfillment**

This is the correct mechanism for reaching a much larger sellable universe without creating duplicate canonical services. The event-merchandise flyers, business-branding flyers, notary/school flyer, property reset flyer and resident concierge collateral are commercial evidence for additional variants and cross-sells.

## 5. Provider/fulfillment rule
Cass, Cayla, Chris, Renee and NAWFside are capability/fulfillment resources. Their actual documented services can be mapped into the fulfillment branch, but no provider rate, qualification, insurance, license, availability or approval is invented. DANI customer pricing remains separate.

## 6. Remaining work
1. Continue service-by-service market benchmark reconciliation across the full commercial universe.
2. Populate channel/buyer/use-case/variant/package/add-on/recurring relationships.
3. Resolve service-row vs market/channel pricing conflicts.
4. Expand qualified fulfillment coverage and qualification records.
5. Complete Stripe/canonical crosswalk for every checkout-eligible offer.
6. Continue customer-facing UX cleanup and live funnel testing after each production deployment.
7. Record every resolved decision in the governing matrices and preserve historical evidence.
