# DANI integrated-service delivery contract — review candidate (2026-11-13)

Status: proposed implementation contract, not a claim of live worker execution. Preserve existing authority, approvals and release gates.

## Brand and purpose
Primary slogan: **We handle the execution.** DANI is an execution/operations coordinator for households, businesses, real estate, property teams, and government/institutions. Cleaning is one capability, never the whole commercial offer. Internal pillars: HANDLE, PREPARE, CREATE, CONNECT, SUPPLY. Divisions D01–D13 are capabilities and CH01–CH05 are the only official channels. B2C/B2B/B2G/B2I are audience descriptions; B2B2C is a relationship model, not CH06.

## Whole relationship
A buyer may bring a multi-need outcome in their own words, e.g. phone/callback and admin support, printed materials, and property work. Intake must retain the complete requested outcome and components without treating inferred categories or unapproved SKUs/prices as accepted scope. Carry buyer, payer, requester, organization, recipient, referral source and preferred provider identities separately. One engagement can have multiple differently priced and fulfilled components. Show component state: requested, under review, eligible, unavailable, approved, assigned, done, declined or canceled, as appropriate. Never hide restricted components to make an estimate appear complete.

## Fulfillment model
- Owner first-refusal where commercially/operationally authorized.
- Approved independent providers only, based on qualification, service coverage, actual availability, authorization and contract terms; support accept/decline and geographic dispatch.
- Preserve source referral-code attribution. For a provider-generated qualifying customer job, record the founder's automatic booking/assignment rule to the referring provider instead of ordinary open dispatch. Verify approval, service qualification, geographic coverage, availability and the terms governing whether provider acceptance is additionally required; do not falsely confirm a booking if the provider cannot perform the work. If unavailable or disqualified, preserve attribution and use documented fallback without erasing the referral.
- Preserve client-preferred provider for future eligible jobs, and permit reoffer/fallback if unavailable or declined.
- Partner companies can refer customers and/or fulfill jobs when approved internal provider capacity is absent. Separate the partner-referral role from partner-fulfillment role. Confirm each payout from its own approved agreement and qualifying paid outcome.
- Authorized providers may stop offering a service, without erasing accepted assignments, completion evidence or historical obligations. PR #684 must resolve this behavior before release.
- Do not assume worker classification as 1099 settles labor classification or that all services share one workflow.

## Existing operational roles (configured does not prove running)
- Intake: `intake_controller`; preserve customer words, eligibility and identities.
- Quote: `quote_builder` and `quote_qa_controller`; canonical pricing, economics and full component scope.
- Revenue: `revenue_controller`, `lead_qualifier`, `opportunity_agent`; match genuine demand to eligible supply, do not lead with only cleaning.
- Fulfillment: `compliance_controller`, `scheduling_dispatch_controller`, `job_coordinator`; provider qualification, offer/decline, partner fallback, assignment evidence.
- Closeout: `qa_completion_controller`, `customer_success_controller`, `cross_sell_agent`; evidence, preferences, repeat and cross-capability needs.
- Health: `system_health_controller`, `operations_controller`; distinguish missing receipts, configured roles and verified customer outcomes. These are not automatically an autonomous development team or dispatching governor.

## Critical non-Production acceptance
Synthetic multi-service request (phone/admin + print + property), unrestricted customer description, persisted request and staff authorized retrieval, unauthorized identity denied, all original needs intact, accurate acknowledgment, stable idempotent retry, no fabricated SKU/price/booking/charge, and confirmed provider-withdrawal/history protection for PR #684. Coordinate PR #709, PR #708 and PR #718 without bypassing their separate reviews. Retain environment, commit SHA, synthetic user IDs, test request ID, results, and reviewer. No Production submission, send, charge or deploy without authorization.

## Historical catalog preservation
Do not replace the 500+ record service universe with a single 466-row count: 518 master, 504 runtime and 466 canonical rows were separate observed populations as of Nov 13 Production inspection; reconciliation ledger was incomplete. Historical service names, variants, add-ons, packages and provider capabilities require source-linked reconciliation and readiness labeling. A LIVE_READY flag is necessary but not sufficient for a customer commitment.
