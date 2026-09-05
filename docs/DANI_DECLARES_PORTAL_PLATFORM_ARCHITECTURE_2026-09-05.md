# DANI DECLARES Unified Portal Platform Architecture

**Date:** 2026-09-05  
**Status:** Implementation baseline

## Objective

DANI DECLARES is designed to operate without routine direct phone coordination. Printed vendor packets, website pages, QR codes, referrals and other acquisition channels should route people into a secure self-service account and intake flow. The submitted data becomes operational records and appears to DANI DECLARES through the authenticated owner operations workspace.

## Platform principle

Use one authenticated platform with role- and relationship-aware workspaces, not unrelated portals. A person has one account and may have multiple authorized relationships/capabilities. Customer pricing and commercial authority remain upstream; portals consume governed commercial decisions and operationalize them.

## Entry points

- `/portal/access` — public self-service account creation and relationship selection.
- `/portal/login` — authenticated sign-in.
- `/portal` — role-resolved workspace.
- `/portal/operations` — staff/owner operations console.
- `/portal/quotes` — staff quote desk.
- `/portal/provider` — provider field workspace.
- `/portal/resident` — resident workspace.
- `/portal/customer` — general customer workspace.
- `/portal/property-manager` — property operations workspace.
- `/portal/procurement` — government/institutional procurement workspace.

## Relationship intake

The public entry flow supports:

1. Regular Resident — CH01
2. Apartment Resident — CH01
3. Property Manager / Apartment — CH02
4. Real Estate Office / Brokerage — CH03
5. Business — CH04
6. Government / Institution — CH05
7. Provider / Contractor — fulfillment-network application
8. Remote Operations Applicant — future workforce intake; account/intake architecture is reserved, activation remains controlled

No new commercial channel is created by these roles. They map into the five locked channels.

## Data routing

### Customer-side

Account → portal identity → onboarding intake → appropriate customer/organization/request records → quote/proposal → approval/payment → work order → fulfillment → QA/closure → service history.

### Provider-side

Account → provider application → capability/document evidence → qualification/compliance review → authorization → availability/capacity → assignment → field execution → evidence → QA → payable.

Provider application does not equal authorization. Provider compensation is never inferred from public retail pricing.

### Owner-side

All authenticated operational data is surfaced through the owner/staff workspace according to permissions. The owner console is the daily control point for leads, requests, quotes, proposals, contracts, work orders, dispatch, providers, QA, invoices, compliance and operating exceptions.

## Security boundary

- Staff/admin status cannot be self-selected through public signup.
- Customer/provider users can only create/update their own permitted onboarding records.
- Organization-scoped access is preserved for B2B/property/procurement workflows.
- Provider qualification and authorization remain DANI-controlled.
- Private evidence remains protected through authenticated access and secure storage.
- Commercial portals do not invent or rewrite prices.

## Current implementation gap

The existing codebase already contains portal identity, role resolution, organization scoping, operations APIs, quote builder, provider field workspace and fulfillment evidence flows. The missing layer was a complete public self-service entry point tied to those existing systems. This implementation adds the public account/intake entry and unified `/portal` owner routing without rebuilding existing operational infrastructure.

## Next implementation phases

1. Complete role-specific portal modules and navigation.
2. Route onboarding intake into CRM/customer/organization records automatically where safe.
3. Complete owner operations command center around the existing operations API.
4. Add quote/proposal approval and payment handoff from customer portals.
5. Add full property, real-estate, business and procurement organizational workspaces.
6. Activate remote-worker workspace only when staffing/workforce model is ready.
7. Add automated notifications and exception queues so routine work does not require Danielle's phone.
