# DANI DECLARES — Historical Location / Geography Audit
**Date:** 2026-09-15
**Scope:** Every location DANI DECLARES has ever priced, researched, planned, marketed, contacted a customer about, established provider coverage for, or configured in code — traced across Supabase, Airtable, the production codebase, and prior audit docs. Non-destructive: no rows were changed.

## How to read this

This is a *register*, not a claim that DANI operates everywhere listed. Per the audit rules that were set going in:
- A location is only "current/operating" if it is `ACTIVE` in the authoritative runtime geography layer (`dd_geographies` / `dd_service_markets`) **and** has real linked rules or transactions — not just a mention in marketing copy or a code constant.
- Provider coverage, competitor research, and marketing copy are evidence of *research or intent*, never proof DANI has commercially opened a market.
- Cities are preserved individually; nothing is collapsed into "Atlanta Metro" if the source named a specific city/neighborhood.

## 1. Headline finding

**"Atlanta" itself has no row in the authoritative geography layer.** `dd_geographies` and `dd_service_markets` model Metro Atlanta only as **7 constituent neighborhood markets** (Buckhead, Midtown, Brookhaven, Chamblee, Tucker, Stone Mountain, Jonesboro). Yet "Atlanta" / "Atlanta Metro" / `ATLANTA_GA` appears as its own distinct value in Airtable pricing evidence, the GovCon territory table, SEO landing pages, and every public page. That's a structural gap, not a duplicate — see §11.

**All 8 `dd_service_markets` rows are `status = RESEARCHING`.** Not one neighborhood-level market has been activated, even though the *state*-level rows (GA, SC) in `dd_geographies` are `status = ACTIVE`. "GA is our operating state" is true at the state layer and not yet true at the market layer.

**South Carolina has a market placeholder but zero linked pricing/commercial rules.** All 8,575 `dd_service_market_pricing_rules` and all 1,848 `dd_market_service_commercial_rules` are allocated across the 7 GA neighborhoods only (1,225 and 264 each, respectively). `SC_GENERAL` exists as a row but carries 0 of either.

**No real operating/transactional geography exists yet.** `leads`, `dd_estimates`, `dd_client_properties`, `dd_portal_onboarding_intakes` — the tables that would hold an actual customer's city/state — are entirely NULL on those fields (5 leads, all blank). Everything below is planning, pricing-research, marketing, or code-configuration evidence, not operating history.

---

## 2. Register — Georgia

| Location | County/Region | Source | System | Evidence type | Status | In runtime geography? |
|---|---|---|---|---|---|---|
| Buckhead | Fulton (intown premium zone `GA-PREMIUM-INTOWN`) | `dd_service_markets`, `dd_geographies`, Airtable *03 Market Pricing*, *02 Provider Coverage*, *Provider Recruitment Targets*, `canonicalCatalogRegistry.js`, `nationalPricingEngine2026.js` (`BUCKHEAD_ATLANTA_GA`) | Supabase + Airtable + code | Priced (researched baseline), commercial rules, compliance rules, code constant | RESEARCHING | Yes — market row exists |
| Midtown | Fulton (`GA-PREMIUM-INTOWN`) | same as above (`MIDTOWN_ATLANTA_GA` in code) | Supabase + Airtable + code | Same | RESEARCHING | Yes |
| Brookhaven | DeKalb (`GA-NORTH-INTOWN`) | Same; pricing note cites "TotalCare Cleaning" (Aug 2026) as external benchmark | Supabase + Airtable + code | Same | RESEARCHING | Yes |
| Chamblee | DeKalb (`GA-NORTH-INTOWN`) | Same; pricing note cites Bark and Booksy market data | Supabase + Airtable + code | Same | RESEARCHING | Yes |
| Tucker | DeKalb (`GA-EAST-METRO`) | Same; **has a live SEO landing page** `mobile-notary-tucker-ga`; `partnerData.js`, `residentPerkValidator.js` | Supabase + Airtable + code + marketing | Priced, marketed (live page), commercial/compliance rules | RESEARCHING | Yes |
| Stone Mountain | DeKalb (`GA-EAST-METRO`) | Same | Supabase + Airtable + code | Same | RESEARCHING | Yes |
| Jonesboro | Clayton (`GA-SOUTH-METRO`) | Same; pricing note cites Care.com labor rates | Supabase + Airtable + code | Same | RESEARCHING | Yes |
| **Atlanta / Atlanta Metro** | — | Airtable *03 Market Pricing* (`ATLANTA_GA` as its own market code, 40+ rows), *Company Pricing Evidence* ("Atlanta Metro GA"), `dd_master_service_universe.market_treatment` ("Atlanta 2026 benchmark…"), `dd_govcon_acquisition_territories` (CORE tier = "Atlanta Metro"), SEO page `apartment-turnover-atlanta-ga`, `ContactPage.jsx`, `Footer.jsx`, `ecosystemData.js`, `VendorPortal.jsx` | Supabase + Airtable + code + production site | Priced, marketed, GovCon territory anchor, public positioning | Referenced everywhere; **no dedicated market row** | **No** — only its 7 sub-neighborhoods exist as rows |
| Georgia (statewide) | — | `dd_geographies` (STATE, `status=ACTIVE`, "Initial production commercial jurisdiction"), `src/config/markets.js` (`ATL` config, $95/hr labor), virtually every public page | Supabase + code + production site | Declared operating jurisdiction | **ACTIVE at state level** | Yes |
| Metro Atlanta counties: Fulton, Gwinnett, Cobb, DeKalb, Clayton | — | Airtable *02 Provider Coverage*: "Metro Atlanta — Fulton, Gwinnett, Cobb, DeKalb, Clayton; Georgia" | Airtable | Provider-coverage note (unverified) | Researching | No — county-level, not modeled anywhere else |
| Roswell | North Fulton | Airtable *Provider Recruitment Targets*: "Roswell / Metro Atlanta" | Airtable | Recruitment outreach | Researched/contacted | No |
| Smyrna | Cobb | Airtable *Provider Recruitment Targets*: "Buckhead / Smyrna / Metro Atlanta" | Airtable | Recruitment outreach | Researched/contacted | No |
| Vinings | Cobb | Airtable *Provider Recruitment Targets*: "Atlanta / Vinings / surrounding metro" | Airtable | Recruitment outreach | Researched/contacted | No |
| West Midtown | Fulton | Airtable *Provider Recruitment Targets* | Airtable | Recruitment outreach | Researched/contacted | No |
| Morningside | Fulton/DeKalb | Airtable *Provider Recruitment Targets* | Airtable | Recruitment outreach | Researched/contacted | No |
| Doraville | DeKalb/Gwinnett | `src/data/siteConfig.js`: `serviceAreaText: "Serving Atlanta, Doraville, Dunwoody, and beyond."` | Code (public site) | Marketed (public copy) | Planned/marketed | No |
| Dunwoody | DeKalb | Same | Code (public site) | Marketed (public copy) | Planned/marketed | No |
| Augusta | — | `src/config/markets.js` (`MARKET_CONFIGS.AUGUSTA`, $85/hr labor, no mileage/tax linkage to anything else) | Code only | Pricing config, **orphaned** | Configured, no other evidence | No — not in Supabase, Airtable, GovCon territories, or public copy |
| "All 7 GA markets" (aggregate) | — | Airtable *02 Provider Coverage*, `dd_master_service_universe.market_treatment`: "Seven Georgia markets individually priced…" | Supabase + Airtable | Governance/aggregate reference | Researching | N/A (refers to the 7 above) |
| GovCon "Atlanta Metro" (CORE territory) | — | `dd_govcon_acquisition_territories` (tier CORE, "Atlanta metro and immediate surrounding operating area") | Supabase | Acquisition-territory tier, `is_active=true` | Active pursuit tier | Separate table from `dd_service_markets`/`dd_geographies` |

## 3. Register — South Carolina

| Location | Source | System | Evidence type | Status | In runtime geography? |
|---|---|---|---|---|---|
| South Carolina (statewide) | `dd_geographies` (STATE, `status=ACTIVE`, "Commercial market authority reconciled 2026-08-29"); `dd_service_markets` `SC_GENERAL` (`status=RESEARCHING`, `dispatch_origin_code=SC_PENDING`, "non-active state coverage placeholder... no SC customer prices or activation are inferred from GA pricing"); `Footer.jsx`, `ContactPage.jsx`, `ecosystemData.js` ("Regional SC") | Supabase + code + production site | State-level jurisdiction declared, but **zero pricing/commercial rules attached** (0 of 8,575 / 0 of 1,848) | ACTIVE (state) / RESEARCHING (market) | Yes — state row + SC_GENERAL market row |
| Upstate South Carolina | `ContactPage.jsx`: "Atlanta, GA, and Upstate SC"; `FederalPage.jsx`; `src/config/markets.js` (`SC_UPSTATE`, $88/hr labor) | Code + production site | Marketed + pricing config, **not linked to Supabase geography** | Planned/marketed | No — code/marketing only |
| Greenville, SC | `dd_govcon_acquisition_territories` (CORRIDOR tier, "Atlanta to Greenville" — "Northeast Georgia corridor through Greenville, South Carolina"); `FederalPage.jsx` | Supabase + code | GovCon acquisition-territory boundary | Active pursuit tier | No — GovCon territory table only, not `dd_geographies` |
| Spartanburg, SC | `dd_govcon_acquisition_territories` (MAXIMUM tier — "hard maximum geographic boundary"); `FederalPage.jsx` | Supabase + code | GovCon acquisition-territory hard limit | Selective pursuit only | No |
| Atlanta→Greenville→Spartanburg corridor | `dd_govcon_acquisition_territories` (SITE_QUALIFIED = "Verify Locations", OUTSIDE = "Outside Territory — retain only for benchmark/research context") | Supabase | Governance boundary + screening rule | Active framework | N/A — a rule, not a place |
| Individual SC apartment/property markets from expansion outreach | *Not found as named cities in Supabase or Airtable during this pass* | — | — | — | Not yet located — see §5 gaps |

## 4. Outside GA/SC — a real conflict

| Location | Source | System | Status | Note |
|---|---|---|---|---|
| **Charlotte, NC** | `src/config/markets.js` (`MARKET_CONFIGS.CHARLOTTE`, $92/hr labor, $1.35/mi) | Code only | Orphaned config | Not in `dd_service_markets`, `dd_geographies`, `dd_govcon_acquisition_territories`, Airtable, or any production page found. It's also **outside** the GovCon "hard maximum" boundary declared at Spartanburg — a live pricing constant for a market the rest of the system says isn't in scope. |

## 5. National / framework layer

| Item | Source | Meaning |
|---|---|---|
| United States (COUNTRY) | `dd_geographies`, `status=ACTIVE` | "National architecture authority; market activation is managed below country level" — the schema is built for nationwide expansion, not just GA/SC |
| `MARKET_TIERS` (T1 CORE_CALIBRATION … T5 RURAL_OR_LOW_DENSITY, CUSTOM) | `nationalPricingEngine2026.js` | Tiering framework for future markets, not yet populated beyond the 7 GA neighborhoods |
| `INITIAL_CALIBRATION_MARKETS` | `nationalPricingEngine2026.js` | Exactly the same 7 GA neighborhoods, confirming code and Supabase agree on the current calibration set |
| "Southeast" | Airtable *Provider Recruitment Targets* | Regional shorthand, not a location |
| "Remote / B2B" | Airtable *Provider Recruitment Targets* | Non-geographic tag mixed into the Market field — data-quality note, not a place |

## 6. Categorized per your 11-bucket framework

1. **Current authoritative markets:** none — all 8 `dd_service_markets` rows are RESEARCHING, not ACTIVE.
2. **Current service-specific markets:** none with `status=ACTIVE`; pricing rules exist for the 7 GA neighborhoods (8,575 rows) but the markets themselves aren't flagged live.
3. **Historical markets:** none found removed/deprecated — everything traced is still present in its source table.
4. **Research-only locations:** the 7 GA neighborhoods + SC_GENERAL (all literally `status=RESEARCHING`), plus Roswell, Smyrna, Vinings, West Midtown, Morningside, the 5-county Metro Atlanta note.
5. **Marketing/outreach locations:** Atlanta, Tucker (both have live SEO landing pages), Doraville, Dunwoody, Upstate SC, "Regional SC" (public site copy).
6. **Provider-only geography:** *02 Provider Coverage* Airtable — mostly "Unverified"/"Not established"/"TBD"; not proof of an open market per your own caution.
7. **Planned expansion geography:** South Carolina generally, Upstate SC, Greenville, Spartanburg corridor (GovCon), Augusta (code-only), Charlotte NC (code-only, unexplained).
8. **Locations in code/configuration:** ATL, SC_UPSTATE, AUGUSTA, CHARLOTTE (`src/config/markets.js`); the 7-neighborhood `MARKETS` array (`canonicalCatalogRegistry.js`); `INITIAL_CALIBRATION_MARKETS` (`nationalPricingEngine2026.js`).
9. **Locations in pricing:** the 7 GA neighborhoods (8,575 `dd_service_market_pricing_rules` rows, 100% of the table); Atlanta/Atlanta Metro as free-text `market_treatment` on 158+ `dd_master_service_universe` rows; Company Pricing Evidence and 03 Market Pricing in Airtable.
10. **Locations in compliance rules:** 7 GA neighborhoods (39 rules each, 273 total) + Georgia state (3) + South Carolina state (3) in `dd_geographic_service_compliance`.
11. **Conflicts/missing geography to investigate next:**
    - Atlanta/Atlanta Metro has no row of its own in `dd_geographies`/`dd_service_markets` despite being the most-referenced location in the entire system.
    - Charlotte, NC and Augusta, GA exist only as pricing constants in `src/config/markets.js` with no backing anywhere else — origin unknown, should be confirmed with whoever added them or removed if stale.
    - South Carolina is `ACTIVE` at the state layer but has zero linked pricing or commercial rules — the state authority and the commercial buildout are out of sync.
    - Roswell, Smyrna, Vinings, West Midtown, Morningside, Doraville, Dunwoody, and the 5-county list (Fulton/Gwinnett/Cobb/DeKalb/Clayton) all appear in real evidence (outreach records, public copy) but have no market/geography row anywhere.
    - No named South Carolina cities (Greenville and Spartanburg aside, which live only in the GovCon territory table) were found in Supabase or Airtable as market/pricing records — the "individual SC apartment/property markets contacted during expansion" you mentioned were not located in this pass and likely live outside these two systems (CRM, email, or a source not yet connected in this session).

## 7. What wasn't searched in this pass

- Vercel project environment variables/config (tool access didn't surface a geography-specific setting; worth a targeted check if a deploy-time market flag is suspected).
- GitHub history/commit messages beyond the current branch tip (older commits may reference markets since removed from live code).
- Any CRM/outreach system outside Airtable and Supabase (e.g., email records) for the SC apartment/property outreach campaign specifically named in the brief.

This register is additive evidence, not a final "every location ever" claim — the gaps in §7 are the next places to look.
