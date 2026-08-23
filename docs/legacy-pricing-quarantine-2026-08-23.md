# DANI DECLARES LLC — LEGACY PRICING QUARANTINE

**Effective:** 2026-08-23
**Status:** HISTORICAL EVIDENCE ONLY — NOT COMMERCIAL AUTHORITY

## Purpose

This file establishes a hard boundary between historical pricing artifacts and the new DANI DECLARES Master Operating Architecture.

The old pricing engines, catalogs, modifiers, geographic calculators, Stripe mappings, and package records identified below are **not authorized to determine customer prices, public starting prices, checkout amounts, package eligibility, provider payout, or division ownership**.

Historical code remains in Git history for auditability. It is not to be imported by active pricing code.

## Superseding Authority

The current commercial system is governed by the Master Operating Architecture and its reconciliation process:

- 13 organizational divisions
- Capability → Service Family → Service → Task → SKU hierarchy
- 6 customer channels: CH01–CH06
- 7 core markets: Jonesboro, Tucker, Stone Mountain, Chamblee, Brookhaven, Midtown, Buckhead
- Commercial Ownership separated from Fulfillment Ownership
- Customer Pricing separated from Internal Cost / Provider Payout
- Lifecycle states: CANONICAL_ACTIVE, ABSORBED_REDIRECTED, DEPRECATED_HISTORICAL, PENDING_RECONCILIATION
- 47-point reconciliation schema
- Pricing frozen wherever reconciliation is incomplete

## Quarantined Pricing Engines / Sources

The following repository artifacts were identified during the audit and are now treated as legacy evidence:

1. `src/data/masterCatalog2026.js`
2. `src/data/pricingCanon.js`
3. `src/data/pricingResolver2026.js`
4. `src/data/channelPricingMatrix2026.js`
5. `src/data/b2bCommercialCatalog2026.js`
6. `src/data/b2bEnterprisePackages2026.js`
7. `src/data/b2bPricingResolver2026.js`
8. `src/config/commercialRegistry.js`
9. `src/config/stripeLinks.js`
10. `src/services/travelCalculator.js`
11. `api/travel-quote.js`
12. `src/lib/operations/estimatePricingSnapshot2026.js`
13. `src/lib/operations/pricingConnector2026.js`
14. `src/services/proposalEngine.js`
15. `scripts/generateStripeProducts.js`
16. Pricing-related reconciliation / activation documents under `docs/` that predate the current Master Operating Architecture.

## Legacy Numeric Values Explicitly Identified

The audit recovered numeric values from the old commercial registry and catalog. These values are preserved here as evidence only.

### Residential / B2C cleaning

- Resident Refresh 1BR/1BA: **$100**
- Resident Refresh 2BR/2BA: **$150**
- Resident Refresh 3BR/2BA: **$250**
- Resident Refresh 4BR/3BA: **$375**
- Deep Structural Reset 1BR/1BA: **$275**
- Deep Structural Reset 2BR/2BA: **$325**
- Deep Structural Reset 3BR/2BA: **$425**
- Deep Structural Reset 4BR/3BA: **$550**
- Deposit Security Move-Out 1BR/1BA: **$330**
- Deposit Security Move-Out 2BR/2BA: **$380**
- Deposit Security Move-Out 3BR/2BA: **$480**
- Deposit Security Move-Out 4BR/3BA: **$605**
- Wash/Dry/Fold: **$45**
- Linen & Bedding Reset: **$35**
- Closet Optimization: **$135**
- Pantry/Kitchen Cabinet Organization: **$150**
- Estate Liquidation Baseline: **$65**

### Legacy notary/document values

- Mobile Loan Signing: **$150**
- Apostille Processing: **$175**
- POA / Healthcare Proxy Witness Base: **$35**
- Emergency Notarization Priority: **$95**
- Family Law / Custody Document Witnessing: **$75**
- Vehicle Title Signing: **$50**
- Safety-Deposit Vault Verification: **$125**
- School / Residency Financial Affidavit: **$45**
- Independent Witness Deployment: **$50**

### Legacy membership / product / event values

- Executive Home Care Membership (1BR): **$280/month**
- Ultimate Turnkey Household Care (1BR): **$520/month**
- Pampered Pet Household Track (1BR): **$245/month**
- Digital Nomad Account Plan (1BR): **$180/month**
- Business Startup Launch Kit Starter: **$79**
- SmartTap NFC Functional Card: **$49**
- Full Event Planning Coordination Fee: **$650**
- Exterior Patio/Balcony Holiday Lighting Baseline: **$450**

### Legacy B2B values

- Rough Multifamily Turn: **$450**
- Final Multifamily Turn: **$650**
- Detailed Finish Turn: **$1,200**
- Property Reset / Move-In Unit Prep: **$125**
- Final Handover Walkthrough Prep: **$75**
- Automotive Roadside Fleet Dispatch Trip: **$65**
- Mobile Fleet Tire Plug / Assembly Swap Base: **$45**
- I-9 Employment Identity Verification Run: **$45**
- Key Vault / Delivery Locker Fleet Audit: **$125**
- Legal Property Notice Hand-Delivery Run: **$35**
- Leasing Office Event / Seasonal Staging Run: **$450**
- Base Glow Structural Lighting Installation: **$750**
- Move-In Folder Portfolio Resident Handout Pack: **$8.50**
- DTF Branded Client Apparel Low-Volume Tier: **$25**

### Legacy B2B retainer values

- Property Readiness Subscription Tier: **$1,500/month**
- Resident Experience Subscription Tier: **$3,250/month**
- Portfolio Optimization Subscription Tier: **$5,500/month**
- Facility Compliance Shield Subscription Tier: **$1,850/month**
- Complete Enterprise Omnichannel Subscription Tier: **$7,500/month**
- Historical Institutional Partner Retainer Escalation: **$10,500/month** — explicitly historical/deprecated

### Legacy master-catalog values also identified

Examples recovered from `masterCatalog2026.js` include:

- Administrative Execution Support baseline: **$45/hr** with an obsolete **$5/hr** starting-price token
- Non-Attorney Doc Prep baseline: **$75** with obsolete **$5/package** token
- Mobile Notary baseline: **$50/visit** with obsolete **$0** local token
- Loan Signing Package: **$150** with obsolete **$50** starting token
- Remote I-9 Verification: **$50** with obsolete **$0/visit** token
- Expedited Apostille: **$175** with obsolete **$75** starting token
- Multifamily Turnover 1BR: **$250** baseline with obsolete **$50** starting token and legacy investment values of **$250 / $275 / $375**
- Multifamily Turnover 2BR: **$350** baseline
- Multifamily Turnover 3BR: **$450** baseline
- STR/Airbnb Turnover: **$125** baseline with obsolete **$25/turn** token
- Residential Deep Cleaning: **$200** baseline with obsolete **$0/home** token
- Pop-Up Elopement Officiant: **$99** baseline with obsolete **$9 local / $50 travel** token
- Full Wedding Officiant: **$199** baseline with obsolete **$99** starting token
- Custom Heat-Press Apparel: **$98** estimated order baseline
- Sublimated 20 oz Tumbler: **$48** estimated order baseline
- Custom Packaging Labels: **$45/roll** with obsolete **$5/roll** token
- SmartTap Business Card: **$49** with obsolete **$9** token
- Smart Google Review Stand: **$49** with obsolete **$9** token
- Smart Property Tag Set: **$75 / 5-pack** with obsolete **$5** token
- Startup Infrastructure Kit: **$199** with obsolete **$99** token

The complete historical source remains recoverable from Git history if an audit requires additional entries. No numeric value in this document is current pricing authority.

## Legacy Pricing Logic That Must Not Survive

The following logic families are quarantined:

### 1. Old channel taxonomy

Old B2C/B2B/B2B2C/B2G structures must not replace CH01–CH06.

### 2. Legacy working-baseline pricing

Fields such as `workingBaselineRate`, `startingPrice`, `baseCustomerPrice`, and legacy `baseRate` are historical until individually reconciled.

### 3. Legacy geographic/travel surcharge engines

Travel-distance percentages, old travel premiums, and deprecated geographic surcharges must not be used. Market treatment will come from the current seven-market architecture.

### 4. Legacy provider economics

`wholesaleCost`, provider lane assumptions, platform fees, and old provider splits must never determine customer pricing.

### 5. Legacy Stripe product mapping

Stripe is a payment execution layer, not commercial authority. Old product/price IDs must not be treated as authoritative catalog records.

### 6. Legacy package / retainer generations

Old memberships, packages, subscriptions, and retainer values remain evidence until reconciled against the current commercial object model.

### 7. Legacy task-to-SKU flattening

Tasks such as cleaning a bathroom, vacuuming, wall detail, appliance detail, or transporting an item must not automatically become independent public SKUs.

### 8. Legacy division structure

The old HANDLE / PREPARE / CREATE / CONNECT / SUPPLY structure is not the current 13-division organizational architecture.

## Hard Runtime Rule

Until a new canonical pricing registry is intentionally established:

**NO LEGACY NUMERIC PRICE MAY BE RETURNED AS CUSTOMER PRICING.**

Unreconciled offers must return one of:

- `PENDING RECONCILIATION`
- `CUSTOM QUOTE`
- `CONTRACT / SOLICITATION PRICING`
- `STARTING AT / QUOTED`

The system must fail closed rather than guess.

## Reconciliation Rule

Historical pricing is not deleted from Git history. It is quarantined from runtime authority.

A historical price can only become active again after a service record has passed the current reconciliation process and is explicitly promoted to `CANONICAL_ACTIVE`.
