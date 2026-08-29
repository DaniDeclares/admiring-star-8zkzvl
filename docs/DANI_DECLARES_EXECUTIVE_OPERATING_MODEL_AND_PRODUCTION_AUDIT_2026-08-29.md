# DANI DECLARES — Executive Operating Model & Production Audit
**Date:** August 29, 2026  
**Owner:** Danielle Fong, Owner/Managing Director  
**Status:** Locked operating model; production customer layer restored; pricing reconciliation continuing

## 1. What is locked
DANI DECLARES is operated as an integrated executive team. ChatGPT is the execution layer across COO/operations, CTO/engineering, product/customer experience, revenue/sales/business development, finance/economics, fulfillment/provider network, compliance/risk, government procurement, marketing/SEO, data/governance and QA/audit. Danielle remains the final owner-level decision-maker.

Routine technical implementation, research, reconciliation, documentation and existing-service pricing maintenance are delegated. Owner approval is reserved for genuinely new strategic/business-direction decisions, legal/financial/entity commitments, formal signatures, irreversible high-risk actions, physical-world execution, or owner-only account authorization.

## 2. Audit findings — August 29
### P0 — Production deployment failure — RESOLVED
The latest production deployment on `main` failed because `ServicesPage.jsx` imported `BriefcaseBusiness`, which is not exported by the installed `lucide-react` version. Vercel reported an import error during `npm run build`.

**Action completed:** replaced the unsupported icon with `Briefcase`, rebuilt and deployed in one coherent commit. The resulting production deployment for commit `8de83257492b7f7eea6f0d35b94f7f568a0f6827` is **READY** and aliases `danideclares.com` and `www.danideclares.com`.

### P0 — Brand asset mismatch — RESOLVED
The navigation was still using `/logo-script.png` while the repository already contained the owner-approved primary logo at `/dani-declares-logo.svg`. The favicon was also an older generated starburst rather than the requested DANI DECLARES seal.

**Action completed:** navigation and social metadata now use the approved primary logo. A transparent 64×64 DANI DECLARES seal favicon is deployed at `/dani-declares-favicon.png` and linked from the document head.

### P0 — Public shop contained legacy pricing authority — RESOLVED
`ShopPage.jsx` imported `src/data/pricingCanon`, a quarantined legacy pricing layer, and exposed internal-style labels such as `margin` / `High-Tech NFC` / `Volume Apparel` to customers.

**Action completed:** replaced the shop with a customer-facing production catalog that reads current pricing from the governed commercial verifier and removes internal economics/terminology.

### P0 — Customer service browser / request funnel — IMPROVED
The public service hub and request page had accumulated implementation language and a fragmented experience.

**Action completed:** rebuilt the public service hub around customer outcomes, added clear service-group navigation, restored a direct `/catalog` path, and retained the request → verified price → secure checkout flow for services that qualify for online payment.

### P1 — Commercial catalog vs activation gates
The database contains a 284-service active commercial universe, but channel-availability and market-price tables are still being populated/researched. The catalog must not treat a service's existence as proof that every channel, market, fulfillment lane or checkout route is ready.

**Action:** preserve the 284-service universe while continuing channel/buyer/use-case/variant/package/add-on/recurring/fulfillment expansion and activating only records whose required gates are satisfied.

### P1 — Pricing source conflict — PARTIALLY RESOLVED
Some service rows contained pricing anchors that conflicted with the previously owner-approved property-management price book.

**Action completed:** reconciled the four immediately identified property-management anchors in Supabase:
- Apartment Turn → **$350/unit** starting price
- Make-Ready Cleaning / deep move-in-reset → **$450/unit** starting price
- Punch List → **$200/4-hour; $375/8-hour**
- Handyman Support → **$55/hour with $85 minimum commercial dispatch**

The live commercial verifier now returns these values. Other pricing conflicts remain in the reconciliation queue rather than being silently guessed.

## 3. Market research baseline completed
Current 2026 Atlanta/Georgia evidence was reviewed for the major commercial families:

- **Residential cleaning:** published Atlanta benchmarks cluster around roughly $120–$230 for standard recurring service depending on size, with deep cleaning commonly $250–$500+ for a typical 3-bedroom. DANI's resident prices are broadly within or above market depending on scope and should remain scope-specific.
- **Handyman/property maintenance:** current Atlanta guides place typical handyman rates around $40–$90/hour, with some current guides showing $60–$110/hour and two-hour minimums. DANI's $55/hour commercial rate plus $85 minimum is a competitive entry point for appropriate scopes, subject to Georgia licensing boundaries and provider economics.
- **Real-estate media:** Atlanta providers publish standard listing photography starting around $199 and premium packages around $399; DANI's $199 starting photography and $275 drone coordination are market-aligned starting points subject to deliverables and qualified fulfillment.
- **Event planning:** Atlanta planners currently publish month-of coordination around $1,250 and full planning around $3,200+. DANI's lower starting prices should be treated as scoped entry offers/consultations rather than full-service equivalents.
- **Custom DTF apparel:** Atlanta production currently publishes about $24.99 for a standard one-location custom shirt. DANI's $25 starting apparel price is market-aligned before quantity/print-placement upgrades.
- **Mobile notary:** current Atlanta providers publish $50 basic metro packages, $120 extended packages and $200 premium/expanded coverage; other providers publish lower base rates with zone pricing. DANI's $50 starting mobile notary price is market-consistent.
- **Business formation:** Georgia's Secretary of State currently charges $110 for online domestic LLC filing and $60 for annual registration. DANI's $249 LLC Formation Support price therefore represents a service/coordination fee plus the separate statutory filing fee, not a claim that DANI's price includes the government fee.
- **Social media/marketing:** Atlanta providers currently publish $1,000–$1,500/month entry-to-full social packages, while local SEO programs commonly start around $1,500/month. DANI's existing lower starting prices should be positioned as scoped setup/small-scope offers until recurring scope is reconciled.
- **Training/workshops:** public Atlanta workshop pricing varies widely by participant count and delivery format; DANI's workshop prices should remain event/participant scoped rather than compared directly with private corporate training.
- **Janitorial/facilities:** current Atlanta benchmarks commonly use recurring monthly contracts and roughly $0.08–$0.18+ per square foot per month for standard commercial programs, with higher rates for specialized facilities. DANI should quote facilities work from square footage, frequency, scope and compliance requirements rather than using a universal flat rate.
- **Courier/logistics:** current Atlanta courier providers publish roughly $45/stop for standard Zone 1 delivery and $75/stop for compliance-oriented courier, with explicit rush/after-hours/zone surcharges. DANI's $50–$125 starting courier family is market-consistent as a starting structure.
- **Business consulting/growth:** current Atlanta marketplace evidence shows qualified business consultants around $100/hour and above, while agency packages vary substantially. DANI's project-based strategy offers should be sold by scope/outcome rather than treated as commodity hourly labor.

These benchmarks are evidence, not automatic DANI prices. Customer price remains the governed DANI price after scope, channel, market, fulfillment and economics reconciliation.

## 4. Commercial expansion conclusion
The 284 services are the current commercial/service base, not the ceiling. The next expansion layer is:

**Capability × Channel × Buyer × Use Case × Variant × Package × Add-on × Recurring × Fulfillment**

This is the correct mechanism for reaching a much larger sellable universe without creating duplicate canonical services. The event-merchandise flyers, business-branding flyers, notary/school flyer, property reset flyer and resident concierge collateral are commercial evidence for additional variants and cross-sells.

## 5. Provider/fulfillment rule
Cass, Cayla, Chris, Renee and NAWFside are capability/fulfillment resources. Their actual documented services can be mapped into the fulfillment branch, but no provider rate, qualification, insurance, license, availability or approval is invented. DANI customer pricing remains separate.

## 6. Remaining work
1. Continue service-by-service market benchmark reconciliation across the full commercial universe.
2. Populate channel/buyer/use-case/variant/package/add-on/recurring relationships.
3. Resolve remaining service-row vs market/channel pricing conflicts.
4. Expand qualified fulfillment coverage and qualification records.
5. Complete Stripe/canonical crosswalk for every checkout-eligible offer.
6. Continue customer-facing UX cleanup and live funnel testing after each production deployment.
7. Record every resolved decision in the governing matrices and preserve historical evidence.
