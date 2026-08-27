# DANI DECLARES LLC — CAPABILITY NETWORK / PROVIDER PORTAL ARCHITECTURE

**Effective:** 2026-08-27  
**Status:** GOVERNING DESIGN

## 1. One identity, many capabilities

A network participant has ONE account/profile and may have MANY capabilities. Do not create a separate worker account or dashboard for each service.

Examples:
- Truck driver + field worker + event staff
- Notary + loan signing agent + apostille service provider
- Event planner + day-of coordinator + decorator
- Cleaning business + xTool/engraving production provider
- Crafter + makeup artist
- HVAC company + maintenance technician

The profile stores capabilities as separate records so each capability can have its own service eligibility, geography, pricing/payout rules, documentation, expiration dates, and compliance status.

## 2. Portal routing

All applicants may authenticate through the same provider-network entry point. After authentication, the application resolves the participant's account, roles, capabilities, organization memberships, verification state, and permissions.

The dashboard is therefore **dynamic**, not determined by a single signup category.

Dashboard modules are shown according to permissions and capabilities:

- Overview
- Opportunities / Jobs
- Availability
- Calendar
- Services & Capabilities
- Credentials & Compliance
- Documents
- Equipment / Assets
- Service Areas
- Organization / Team
- Agreements & Payouts
- Performance
- Messages / Notifications
- Profile / Security

A provider can add another capability later without creating another login.

## 3. Capability record

Each capability should support at minimum:

- capability ID
- provider/user ID
- organization ID when applicable
- canonical SKU/service IDs
- service categories
- role/specialty
- coverage geography
- availability
- capacity
- equipment
- credential requirements
- credential status
- insurance requirements/status
- background-check requirements/status where applicable
- agreement status
- compensation/payout model
- activation status
- effective/expiration dates
- performance history

## 4. Compliance is capability-specific

Verification must NOT be a single blanket "verified worker" flag.

A participant can be:

- VERIFIED for cleaning
- PENDING for notary
- NOT AUTHORIZED for HVAC
- VERIFIED for event planning
- PENDING INSURANCE for transportation

DANI may only expose/route an opportunity when all requirements for that SKU/service, jurisdiction, role and fulfillment model are satisfied.

## 5. Document vault

Providers should have one secure document area with document-to-capability mapping.

Document types may include, where applicable:

- government ID
- business registration
- professional license
- occupational license
- certification
- permit
- insurance certificate
- commercial auto documentation
- background-check status/documentation
- tax/vendor forms
- W-9 or applicable business tax documentation
- contracts/independent-provider agreements
- equipment certifications/inspection records
- specialty credentials

Every document needs:

- document type
- issuing authority
- document number where appropriate
- jurisdiction
- issue date
- expiration date
- verification status
- verification method/source
- linked capabilities
- reviewer
- audit timestamp
- replacement/version history

Sensitive document values must never be exposed publicly.

## 6. Compliance lifecycle

REQUIRED → UPLOAD_PENDING → SUBMITTED → UNDER_REVIEW → VERIFIED / REJECTED / EXPIRED → REVERIFICATION_REQUIRED

Capability activation:

DRAFT → PENDING_COMPLIANCE → APPROVED → AUTHORIZED → SUSPENDED / EXPIRED / DEACTIVATED

A capability with an expired mandatory credential must automatically become ineligible for new assignments until resolved.

## 7. Organization + individual model

Support both:

**Individual provider** — one person offering multiple capabilities.

**Provider organization** — business offering multiple services with multiple workers/assets.

An organization may assign team members to specific capabilities and locations. The organization and individual compliance records must remain distinguishable.

## 8. Geography

Providers can define:

- home/dispatch origin
- service ZIP codes
- counties
- metros
- states
- travel radius
- travel availability
- transportation capacity

Geographic eligibility is evaluated against the customer's service location and the SKU's service-area rules.

## 9. Opportunity matching

Customer request → SKU → service location → scope → required capabilities → compliance gates → geography → availability → capacity → equipment → provider ranking → opportunity → acceptance → assignment.

Provider ranking may consider proximity, availability, capability match, compliance, capacity, equipment, performance and agreed commercial terms.

Ranking must never bypass a mandatory compliance gate.

## 10. Worker-side service marketplace behavior

The provider portal should allow participants to:

1. Create account
2. Select initial capabilities
3. Complete onboarding
4. Upload required documentation
5. Add additional capabilities
6. Complete capability-specific verification
7. Set service areas
8. Set availability
9. Configure equipment/assets
10. Receive eligible opportunities
11. Accept/decline within configured rules
12. Execute work
13. Upload required completion evidence
14. Track earnings/settlement
15. Maintain credentials
16. Add/remove services over time

## 11. Dashboard principle

The dashboard is **permission-driven and capability-aware**, not category-locked.

A user who signs up initially as a truck driver can later add:

- field services
- event transportation
- logistics
- other authorized capabilities

without losing access to their existing profile.

Likewise, a notary can add loan signing and apostille-related capabilities, subject to applicable requirements and DANI authorization; a cleaning company can add production/engraving capabilities; and an event planner can add coordination or production capabilities.

## 12. Compliance guardrail

DANI's platform may collect, organize and verify documentation, but the platform must not assume that a document alone makes a service legally authorized. Service activation must consider the applicable jurisdiction, service definition, credential type, entity/individual status, insurance and any other required approval.

## 13. Architecture relationship

This system is subordinate to the canonical architecture:

**DANI DECLARES → Five Commercial Channels → Customer/Segment → Division → SKU → Pricing → Capability Network → Compliance → Dispatch → Fulfillment → Settlement**

The Capability Network is not a sixth customer channel.

## 14. Beta-readiness acceptance criteria

Before opening broad worker beta enrollment:

- Any participant can create one account.
- Multiple capabilities can be attached to one account.
- Capabilities can be added after onboarding.
- Dashboard modules change based on authorized capabilities/roles.
- Required documents are generated from the capability + jurisdiction rules.
- Expired credentials block affected capabilities automatically.
- One person's unrelated capabilities are not blocked by another capability's missing document unless a shared requirement applies.
- Provider-private information is never shown to customers.
- Provider payout data is never shown publicly.
- Job opportunities are filtered by capability, compliance, geography and availability.
- Organizations can have multiple people and capabilities.
- Admins can review, approve, reject, suspend and reactivate capabilities.
- All compliance decisions are auditable.
