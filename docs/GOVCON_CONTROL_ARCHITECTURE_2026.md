# DANI DECLARES — Government Contracting Control Architecture

## Purpose

This document defines the government-only control layer for DANI DECLARES. It is intentionally separate from the commercial catalog and must not be used to infer commercial pricing, consumer eligibility, or sell-now status.

## Primary Government Lane

- NAICS 561720 — Janitorial Services
- PSC S201 — Custodial/Janitorial

## Strategic Adjacent Lane

- NAICS 561210 — Facilities Support Services

## Supporting / Opportunity-Specific Lanes

- 561110 — Office Administrative Services
- 561410 — Document Preparation Services
- 561790 — Other Services to Buildings and Dwellings, when solicitation scope supports it
- Notary services, only when a government procurement specifically calls for them and applicable authority is current
- Printing/signage, supplies/logistics, courier/delivery, and event/community support when separately procured or included in an eligible scope

## Government Acquisition Geography

The current GovCon acquisition territory is deliberately bounded to:

**Atlanta, Georgia → Northeast Georgia corridor → Greenville, South Carolina, with Spartanburg, South Carolina as the hard maximum.**

- **CORE:** Atlanta metro and immediate surrounding operating area.
- **CORRIDOR:** qualifying Northeast Georgia / Upstate South Carolina opportunities along the Atlanta-to-Greenville operating path.
- **MAXIMUM:** Spartanburg, South Carolina; selective only.
- **SITE-QUALIFIED:** statewide or multi-location opportunities; screen each actual place of performance before pursuit.
- **OUTSIDE:** materially beyond the approved territory; do not treat as active acquisition targets.

This acquisition territory is separate from the commercial service-area architecture. Commercial market coverage must be governed by the commercial registry and service-specific compliance gates.

## Classification Rules

1. A listed NAICS or PSC is not evidence of eligibility, certification, licensing, staffing capacity, past performance, or award history.
2. Government-facing claims require evidence from an authoritative source or approved company record.
3. Certification application status must never be represented as certification approval.
4. Market-scale contract examples are market signals only and never DANI DECLARES past performance unless DANI actually performed the contract.
5. Government opportunities are evaluated against the actual solicitation, scope, place of performance, set-aside, qualifications, insurance, licensing, staffing, equipment, and submission requirements.
6. Government pricing is solicitation/proposal based and does not inherit B2C resident discounts or consumer checkout rules.
7. Government acquisition geography is governed by `docs/GOVCON_ACQUISITION_TERRITORY_2026-09-10.md` and must be applied before active pursuit.
8. A state being commercially authorized does not make every location in that state an active GovCon acquisition target.

## Government Revenue Ladder

Commercial capability → local/state/institutional work → subcontracting/teaming → documented government past performance → larger state/federal opportunities → multi-location facility contracts.

## Certification Control

SBA MySBA Certification application #109641 is a correction-required application based on the supplied SBA notice. Outstanding items documented in the control system include incomplete home address, executed Operating Agreement, name/citizenship documentation, 2025 W-2s, and complete 2024/2023 personal tax returns with required schedules and W-2s. The application is not to be represented as approved certification until SBA approval is reflected in the applicable system.

## System Separation

- Airtable: government readiness, opportunity, classification, proposal, and performance control.
- Supabase: canonical application/operational data; government records must respect production security boundaries.
- GitHub: public-facing government content and application implementation.
- Vercel: deployment/runtime layer.

## Contract Families

1. Custodial / Janitorial
2. Facility Turnover / Reset
3. Facilities Support
4. Field Documentation
5. Administrative Support
6. Supplies / Logistics
7. Printing / Signage
8. Event / Community Support
9. Courier / Delivery

## Evidence Principle

The government side is evidence-driven: capability, classification, eligibility, certification, insurance, licensing, past performance, and contract claims are separate controlled facts.
