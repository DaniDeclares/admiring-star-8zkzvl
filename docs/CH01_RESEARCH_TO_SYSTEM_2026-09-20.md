# CH01 Resident Concierge — Research-to-System Record
## Version 2026-09-20

This document records the completed CH01 research-to-system pass. It intentionally separates research facts from DANI interpretations and system controls.

## Method

SOURCE MATERIAL
→ FACT EXTRACTION
→ FACT vs INFERENCE
→ BUSINESS IMPLICATION
→ COMMERCIAL CROSSWALK
→ DATABASE / GOVERNANCE CONTROL
→ APPLICATION ENFORCEMENT
→ DEPLOYMENT
→ LIVE VERIFICATION
→ AUDIT
→ EXTERNAL ECOSYSTEM RESEARCH
→ NEXT ARCHITECTURE DECISION

## 1. Research facts

| Code | Finding | Basis |
|---|---|---|
| E01 | Atlanta Home Concierge validates a full-spectrum household-management model: one relationship spanning cleaning, organization, move support, pet support, errands/transport and household/property support. | Atlanta Home Concierge |
| E02 | H+H Home Concierge advertises $50/hour with a 2-hour minimum, background-checked providers and upfront pricing. | H+H Home Concierge |
| E03 | A 2026 Atlanta cleaning benchmark reports approximately $130–$215 for a standard 2BR clean and $245–$440 for a first deep clean. | EvenQuote Atlanta 2026 |
| E04 | Atlanta professional organizers benchmark around $40–$80/hour, with larger projects substantially above small task pricing. | Angi Atlanta 2026 |
| E05 | Atlanta Laundry advertises roughly $2.20/lb recurring pickup/delivery, $2.35/lb as-needed and a $45 minimum. | Atlanta Laundry |
| E06 | Pack Leaders ATL lists 2026 visit pricing from $22 for short package visits to $55 for 60-minute as-needed visits, up to two pets. | Pack Leaders ATL |
| E07 | NAA research identifies day-to-day resident/move-in friction as an ongoing apartment-experience issue. | National Apartment Association |
| E08 | NAA reported 87% of 700+ surveyed multifamily professionals planned to increase centralization while 85% worried about loss of personal touch. | National Apartment Association |
| E09 | Georgia DCH regulates private home-care services including nursing, personal-care and companion/sitter services through a licensed private-home-care structure, subject to exceptions. | Georgia DCH |
| E10 | Georgia requires kennel licensing for establishments maintaining dogs/cats for boarding, holding, training or similar compensated purposes, including grooming shops. | Georgia Department of Agriculture |
| E11 | Atlanta requires an Occupational Tax Certificate for businesses operating within city limits and lists a 2026 annual registration fee of $191 before applicable tax. | City of Atlanta |
| E12 | Current Atlanta wealth-ranking reporting identifies 30326, 30306, 30309, 30305 and 30030 as the top five ZIP codes in the cited ranking. | FOX 5 / Atlanta Business Chronicle |
| E13 | Census QuickFacts reports Atlanta city population 520,070 in 2024 and median household income $85,652 for 2020–2024. | U.S. Census Bureau |

## 2. DANI interpretations

### CH01 role
CH01 is the resident-side household execution layer. It is not simply a list of errands or a generic marketplace.

### Core customer value
The commercial value is:
- time returned to the household;
- a trusted relationship;
- less vendor coordination;
- clear scope and price;
- documented completion;
- the ability to expand from one service into an ongoing household relationship.

### Five resident front doors
1. Home Cleaning & Home Reset
2. Household Concierge & Errands
3. Pet & Plant Care
4. Home Watch & Away Support
5. Move, Guest & Seasonal Support

### Buyer / relationship architecture
- CH01-A Household Account Holder
- CH01-A Authorized Household Delegate
- CH01-B Verified Apartment / Property Resident
- CH01-B Property-Sponsored Resident / Beneficiary
- CH01-A Resident Handling Own Small Rental / Unit

### Trigger architecture
- Time pressure
- Household overload
- Cleaning/reset backlog
- Guest/event deadline
- Away-from-home need
- Pet-care gap
- Organization/decluttering
- Move/household transition
- Seasonal change
- Indoor plant care
- Routine maintenance lapse

## 3. System controls

The following are now persistent Supabase structures:
- `dd_ch01_market_evidence`
- `dd_ch01_front_doors`
- `dd_ch01_commercial_triggers`
- `dd_ch01_buyer_authority_map`
- `dd_ch01_service_adjudication`
- `dd_ch01_offer_crosswalk`
- `dd_ch01_sla_matrix`
- `dd_ch01_scope_compliance_matrix`
- `dd_ch01_procurement_requirements`

All nine tables are RLS-enabled and deny direct anon/authenticated access. They are internal governance data.

### Current persistent counts
- 13 market-evidence records
- 5 front doors
- 11 triggers
- 5 buyer/authority mappings
- 121 CH01 service adjudication records
- 121 CH01 offer crosswalk records
- 6 SLA profiles
- 12 scope/compliance controls
- 7 procurement stages
- 1 locked CH01 strategy contract: `2026-09-20.v1`

## 4. Service adjudication rule

Division 01 services are assigned to CH01 front doors or controlled-quote/supporting-layer states.

Services from other canonical divisions that happen to be present in the legacy CH01 channel-availability table are classified `CROSS_CHANNEL_REVIEW` until their native division explicitly authorizes the cross-channel relationship.

This prevents CH01 from becoming an uncontrolled aggregation channel.

## 5. Pricing rule

The canonical runtime price source is the governed Supabase pricing layer, not the legacy static JavaScript registry and not an older price-book document.

Examples verified in the live database:
- DNI-01A-001 Resident Refresh: CH01 $140, ACTIVE + LOCKED
- DNI-01A-002 Deep Structural Reset: CH01 $275, ACTIVE + LOCKED
- DNI-01A-003 Move-Out Turn: CH01 $330, ACTIVE + LOCKED
- DNI-01A-004 Valet Wash, Dry & Fold: CH01 $45, ACTIVE + LOCKED
- DNI-01C-001 Plant Care: CH01 $89 monthly, ACTIVE + LOCKED
- DNI-01D-002 Home Watch: CH01 $65, ACTIVE + LOCKED

CH01-A now resolves exact active/locked CH01 pricing rules.

CH01-B requires:
1. verified resident identity derived server-side from a real property relationship;
2. an explicit active CH01-B subchannel price rule;
3. no silent fallback to CH01-A.

Because explicit CH01-B subchannel prices are not currently populated, CH01-B direct checkout remains gated by design.

## 6. Scope and compliance boundaries

CH01 must remain outside:
- regulated private-home-care/personal-care work unless a separate compliant licensed structure exists;
- unlicensed animal boarding/grooming-facility activity;
- hazardous/biohazard remediation under ordinary household-cleaning scope;
- unapproved regulated trade work;
- unapproved passenger transportation for hire;
- security/alarm-response representation under Home Watch.

## 7. SLA / operating behavior

CH01 has six persistent SLA profiles:
- Routine Resident Request
- Rush / Short-Notice Request
- Quote-Required Project
- Move / Date-Driven Support
- Recurring Household Program
- Home Watch / Away Support

No customer-facing 24/7 or guaranteed same-day promise is implied. Confirmation remains capacity, scope, provider and compliance dependent.

## 8. Economics

The live CH01 catalog is not yet fully economically evidenced.

The current Division 01 cost-model migration is explicitly a draft planning model. There are currently no `dd_service_economic_baselines` rows linked to D01 services.

Therefore:
- market price evidence is not treated as DANI cost evidence;
- draft labor/material assumptions do not authorize checkout;
- observed job telemetry and direct-cost evidence must be collected before promoting economics to audited clearance.

## 9. Application enforcement

The application has been changed so CH01 request verification now uses the persistent CH01 governance registry.

The runtime behavior is:
- CH01 channel governance is checked server-side;
- exact CH01 pricing is resolved from the active/locked pricing rule;
- CH01-B cannot use client-supplied claims of community status;
- CH01-B cannot silently use CH01-A pricing;
- services classified as cross-channel review are blocked from the resident path;
- quote-required services remain intake/quote paths rather than being presented as direct checkout.

The resident-facing UI was also corrected so verified community access is not described as receiving a discount until executable CH01-B pricing is actually governed.

## 10. Remaining controlled holds

1. Reconcile customer-facing CH01 price-book content with the canonical runtime CH01 price rules.
2. Populate explicit CH01-B pricing/subchannel rules only after community pricing is intentionally defined.
3. Build audited D01 economic baselines from observed jobs/direct costs.
4. Keep legacy static commercial registry as compatibility only.
5. Keep fulfillment-gated D01 services gated until provider/scope/economic/QA conditions pass.
6. SEO keyword-volume research remains incomplete because the connected Semrush account returned no available API units during this pass.

## 11. Sources

- Atlanta Home Concierge — https://www.atlantahomeconcierge.com/services
- H+H Home Concierge — https://hhhomeconcierge.com/
- EvenQuote Atlanta 2026 cleaning guide — https://www.evenquote.com/cost-guide/house-cleaning-cost-atlanta-2026
- Angi Atlanta organizer pricing — https://www.angi.com/articles/what-do-professional-organizers-charge/ga/atlanta
- Atlanta Laundry — https://www.atlantalaundry.com/pick-up-delivery/
- Pack Leaders ATL 2026 rates — https://www.packleadersatl.com/2026-rates
- NAA resident experience research — https://naahq.org/news/maximizing-resident-retention-day-one
- NAA centralization research — https://naahq.org/news/what-2026-data-reveals-about-multifamily
- Georgia DCH Private Home Care Program — https://dch.georgia.gov/divisionsoffices/hfrd/facilities-provider-information/private-home-care-program
- Georgia Department of Agriculture kennel licenses — https://agr.georgia.gov/kennel-licenses
- City of Atlanta Occupational Tax Certificate — https://www.atlantaga.gov/government/departments/finance/office-of-revenue/apply-for-a-new-business-occupational-tax-certificate
- FOX 5 Atlanta / Atlanta Business Chronicle wealth ZIP ranking — https://www.fox5atlanta.com/news/atlantas-wealthiest-zip-codes-probably-where-you-think
- U.S. Census QuickFacts — https://www.census.gov/quickfacts/fact/table/atlantacitygeorgia/INC110222
