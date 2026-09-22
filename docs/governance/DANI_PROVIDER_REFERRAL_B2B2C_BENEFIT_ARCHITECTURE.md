# DANI Provider Referral, Incentive & CH01-B Resident Benefit Architecture

**Decision date:** 2026-09-22  
**Status:** LOCKED AS ARCHITECTURE; runtime pricing activation remains separately governed.

## Purpose

Create one company-wide framework for provider referrals, client referrals, partner referrals, provider incentives, provider-network admission, and property-sponsored resident benefits.

## Provider admission workflow

Provider application → geography/capability capacity evaluation → OPEN / WAITLIST / REVIEW_REQUIRED → matching email + in-app notice → agreement/document onboarding → qualification/verification → authorized network access → eligible work.

Use **network capacity** language for independent-provider admission rather than employment/hiring language. Capacity admission does not itself create employment status or guarantee work.

## Provider dashboard benefits

The provider portal should show a role-aware **Benefits & Incentives** area at login with:

- active programs and eligibility
- referral activity and qualifying conditions
- earned, pending, paid and expired rewards
- current provider perks/incentives
- program effective/expiration dates

Benefits that require authorization cannot become claimable before the corresponding qualification/network gate.

## Referral economics

All referral programs use the same lifecycle:

referrer → referred party → program → qualifying event → transaction/booking → eligible amount → reward calculation → approval → payout/credit.

Applications or unqualified leads do not create payable rewards. Prevent self-referrals and duplicate rewards.

Supported reward types should include:

- percent of eligible transaction
- fixed amount
- account credit
- service credit
- defined non-cash perk

Provider referral rewards, client referral rewards, and partner referral rewards remain separate program records and rules.

## CH01-B apartment resident benefit

The current system baseline of **15% qualifying CH01 resident pricing remains unchanged for now**.

The design decision is to evaluate a **10% always-on qualifying resident benefit plus practical perks** as the next test structure. Potential perks include priority booking windows, qualifying dispatch benefits, resident-only service days, service credits, and partner offers.

A property/community that explicitly funds a stronger program may use a **15% Signature Resident Benefit** subject to program terms, service-level economics, eligibility, and any required disclosures.

The resident benefit must not leak into CH02 organization pricing and must not create a second price book.

## Economic rule

No blanket resident discount is activated or changed without service-level economics validation. The economics layer should evaluate customer price, provider payout, travel/material costs, contribution, and incremental acquisition/retention value.

## System ownership

- **Supabase:** runtime/provider/application/eligibility/transaction authority
- **GitHub:** source, migrations, tests and configuration
- **Airtable:** economics/governance/reference analysis
- **Notion:** operating policy and control knowledge
- **Asana:** implementation/release execution
- **Resend:** transactional email delivery
- **HubSpot:** CRM relationship/source tracking
- **Stripe / QuickBooks:** transaction and accounting authority

External systems never become DANI authority merely because they contain a duplicate record.

## Implementation boundary

This architecture does **not** itself change live pricing, legal terms, provider compensation, or eligibility. Those changes require their normal governed approval/release path.
