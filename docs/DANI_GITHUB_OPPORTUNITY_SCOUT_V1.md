# DANI GitHub Opportunity Scout V1

Extends the existing DANI lead-mining architecture with GitHub public opportunities.

## Lanes
1. **DIRECT_PAID_WORK** — funded/paid/bounty issues that Danielle, a DANI provider, partner, or governed automation could legitimately deliver.
2. **B2B_DEMAND_SIGNAL** — an issue reveals an organization with a concrete operational need matching an authorized DANI service, even when the issue itself is not a bounty.

## Fail-closed rules
Discovery is not authority to pursue work. Before pursuit, verify:
- issue remains open and unassigned/claimable;
- compensation is real, funded where applicable, and payable in a usable form;
- acceptance criteria and deadline are feasible;
- no upfront payment, wallet deposit, secret, credential, or unsafe access is required;
- work matches an authorized DANI capability/provider/partner/automation lane;
- expected net value clears owner-time and delivery-cost thresholds;
- duplicates are reconciled against canonical sales intake/HubSpot before record creation.

The scout never auto-claims, comments, opens a delivery PR, creates CRM records, spends funds, or represents DANI to a third party.

## Research patterns reused
Scoring borrows the useful ideas—not code—from public bounty discovery tools: explicit bounty/payment labels, dollar extraction, freshness, issue activity/competition, and help-wanted signals. DANI adds funding/payout verification, capability matching, economics, provenance, dedupe, and owner-review boundaries.

## Schedule
The workflow scans hourly and emits a short-lived discovery artifact. Production ingestion into canonical sales intake remains a separate governed transition and must not be inferred from a GitHub artifact alone.
