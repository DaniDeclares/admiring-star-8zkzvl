# DANI DECLARES — Government Contracting Acquisition Territory

## Canonical Territory Rule

For current government-contract acquisition and opportunity screening, DANI DECLARES uses a deliberately bounded operating territory:

**Atlanta, Georgia → Northeast Georgia corridor → Greenville, South Carolina, with Spartanburg, South Carolina as the hard maximum.**

This is an acquisition-screening rule. It does **not** replace or narrow the separate commercial service-area architecture, which may use Georgia and South Carolina market coverage where the commercial registry authorizes it.

## Territory Tiers

### CORE — Atlanta Metro
Atlanta and the immediate surrounding metro operating area.

**Treatment:** normal acquisition territory. Pursue qualified opportunities when capability, compliance, economics, and submission requirements fit.

### CORRIDOR — Atlanta → Greenville
The Northeast Georgia / Upstate South Carolina corridor leading toward Greenville, including qualifying locations along that operating path.

**Treatment:** normal acquisition territory and a priority expansion corridor.

### MAXIMUM — Spartanburg
Spartanburg, South Carolina is the **hard maximum** geographic boundary for current GovCon acquisition.

**Treatment:** selective only. Pursue when the opportunity is strong enough to justify the additional travel and fulfillment economics.

### SITE-QUALIFIED — Verify Locations
Statewide, multi-location, or provider-list opportunities whose locations are not all known to be inside the approved territory.

**Treatment:** do not treat as territory-wide. Screen each place of performance and pursue only qualifying locations inside Core, Corridor, or Maximum.

### OUTSIDE — Do Not Pursue
Locations materially beyond the approved Atlanta-to-Greenville corridor and Spartanburg maximum.

**Treatment:** do not keep these as active DANI acquisition targets. They may remain in research systems only as market benchmarks, historical patterns, or reference intelligence.

## Hard Exclusions for Active Pursuit

Examples of locations that are outside the current acquisition territory include Columbia, Charleston, coastal South Carolina, Augusta, Fort Eisenhower/Fort Gordon-area work when the place of performance is outside the approved corridor, Fort Stewart, and other materially distant locations.

An opportunity that is statewide or multi-location is not automatically excluded; it is **SITE-QUALIFIED** until its actual places of performance are screened.

## Decision Rule

Every GovCon opportunity must be screened in this order:

1. Identify the exact place(s) of performance.
2. Assign Core, Corridor, Maximum, Site-Qualified, or Outside.
3. Exclude Outside opportunities from active pursuit.
4. For Site-Qualified opportunities, isolate qualifying locations before deciding to pursue.
5. Apply capability, eligibility, solicitation, staffing, equipment, insurance, economics, and submission gates.

## Cross-System Authority

This territory rule is reflected in:

- Airtable `GOVCON 03 Capability Classification Matrix` via `Acquisition Territory`.
- Supabase `dd_contract_opportunities` via `acquisition_territory` and `acquisition_territory_status`.
- Supabase `dd_govcon_acquisition_territories` as the canonical territory definition for the contract runtime.
- GitHub government-contracting documentation and public government-facing positioning.

## Important Separation

Do not confuse:

- **Commercial market coverage:** where the commercial catalog is authorized to operate.
- **GovCon acquisition territory:** where DANI is currently willing to actively pursue government opportunities.
- **Opportunity place of performance:** where a specific contract actually requires work.

A state being commercially authorized does not make every location in that state an active GovCon acquisition target.
