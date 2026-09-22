# DANI Provider Referral, Incentive & CH01-B Resident Benefit Architecture

**Decision date:** 2026-09-22  
**Status:** LOCKED AS ARCHITECTURE; runtime pricing implementation follows governed release controls.

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

## Locked CH01-A / CH01-B resident-benefit rule

**CH01-A — regular/direct residents:** standard CH01 pricing. No apartment-program discount or perk package by default.

**CH01-B — apartment/property residents:** the B2B2C apartment-resident customer/beneficiary path. CH01-B is available only after the apartment/property has become a DANI DECLARES client and sends residents an authenticated enrollment link/invitation.

### CH01-B benefit

The locked baseline is **10% off qualifying CH01-B services + the governed apartment-program perk package**.

The perk package may include, where the property program enables it and economics support it:

- priority booking windows
- resident-only service days
- qualifying dispatch benefits
- service credits
- partner offers
- other explicitly defined property-program benefits

The 10% + perks benefit is **not a public resident promotion**. It exists primarily to strengthen the DANI value proposition for winning and retaining apartment/property clients.

The previous **15% baseline is retired**. Do not implement or describe 15% as the standard CH01-B benefit.

A stronger/different property-specific benefit requires a separately governed program with explicit eligibility, funding, effective dates, disclosures, and economic approval.

## Economic rule

The 10% resident benefit must be evaluated at the service/program level against customer price, provider payout, travel/material costs, contribution margin, and the incremental value of the property relationship. It must not be applied by an uncontrolled client-side percentage toggle.

## Property-led commercial sequence

**DANI wins property/client → property program is activated → property distributes resident enrollment link → resident joins CH01-B → resident receives 10% + perks → resident usage demonstrates program value → property relationship can be retained/expanded.**

Resident enrollment and usage are supporting evidence of property-program value, not the primary consumer acquisition target.

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

This architecture supersedes the prior 15% CH01-B baseline. Runtime pricing changes must still follow the governed GitHub/Supabase release process and must not be made by creating a second pricing authority.
