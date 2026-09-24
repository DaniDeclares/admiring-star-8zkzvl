# DANI DECLARES — DANI FIELD / Provider App Architecture
**Effective:** 2026-09-20  
**Status:** GOVERNING DESIGN / IMPLEMENTED BASELINE

## Purpose
DANI FIELD is DANI DECLARES' first-party provider operating experience. It is intentionally built as a DANI-owned field application rather than making providers subscribe to Jobber, Housecall Pro, Jibble, Taskrabbit, DoorDash, or another external platform.

## Canonical lifecycle
Commercial Authority → Authorized Work → Work Order → Job → Provider Eligibility → Dispatch → Assignment → DANI FIELD Execution → Evidence / QA → Settlement → Performance.

## DANI FIELD baseline
- Provider login and approved-provider gating
- Today / field-day workspace
- Assignment accept / decline
- Navigation handoff
- EN_ROUTE / ARRIVED / WORK_STARTED / WORK_PAUSED / WORK_RESUMED / WORK_COMPLETED events
- Provider time-entry ledger
- Service-specific checklist and existing evidence workflow
- Private photo/evidence storage
- Provider job timeline
- Provider notification foundation
- Capability-specific performance foundation
- Integration adapter registry and canonical external-record linkage

## Location rule
Location is event evidence, not continuous surveillance. The provider explicitly grants device geolocation permission when the field workflow requests it. If location is unavailable, the field workflow remains usable unless a specific service/compliance rule requires location evidence.

## What we learned from external platforms
- Jobber: job lifecycle, schedule, dispatch, checklists, on-the-way/status concepts
- Housecall Pro: route/dispatch patterns, structured job fields, checklists
- ServiceTitan: dispatch board, field context, property/job history, materials/equipment, field intelligence
- Jibble: time tracking, GPS/geofence concepts
- Taskrabbit: availability → offer → accept/book → status workflow
- DoorDash / Uber: logistics order and routing abstraction
- Thumbtack / Google Local Services: lead ingress
- AppFolio / Buildium / Yardi / RealPage / Entrata: client property-system connectivity

These are reference architectures. DANI does not copy their commercial authority or require their subscriptions.

## Authority boundary
DANI/Supabase remains authoritative for:
- service identity
- scope
- pricing
- commercial authorization
- SLA
- compliance
- provider eligibility/authorization
- work authorization
- job/work-order state
- evidence/QA
- settlement and financial truth

External systems may supply:
- leads
- provider execution status
- overflow capacity
- logistics
- client-system synchronization
- optional workforce/time data

External IDs never become DANI canonical IDs.

## Supabase structures
- `dd_provider_field_events`
- `dd_provider_time_entries`
- `dd_provider_devices`
- `dd_provider_notifications`
- `dd_provider_field_capabilities`
- `dd_integration_adapters`
- `dd_integration_connections`
- `dd_external_record_links`
- `dd_integration_event_log`
- `dd_provider_field_today`

## Implementation status
Implemented baseline: field event API, provider DANI FIELD route/UI, provider navigation entry, field capability registry, integration adapter registry, canonical external-link model, time/event persistence, and documentation/reference synchronization.

Future capabilities intentionally remain planned rather than fabricated:
- offline cached execution + deferred sync
- geofenced validation rules
- materials/equipment capture
- richer push delivery
- native iOS/Android packaging
- automated dispatch optimization beyond the existing governed eligibility/routing engine

## Connected-system rule
Supabase is runtime authority; GitHub is source authority; Vercel is deployment/runtime; Airtable is governance/economics/reference; Notion is documentation/control knowledge; Asana is execution tracking; PostHog is behavioral evidence. Do not create duplicate runtime authorities.
