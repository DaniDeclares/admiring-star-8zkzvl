# DANI Owner HQ — Command Center Design Authority

Date: 2026-10-04
Status: implementation authority for Owner HQ visual/interaction work

## Owner outcome

Owner HQ is not a database dump or engineering console. It is Danielle's company command center. The first screen must answer, in order:

1. What happened while I was away?
2. What genuinely needs me now?
3. What is making or blocking money?
4. What work is running today?
5. What is broken or held?
6. What did the agents complete, and what are they doing next?

Deep research, source snapshots, raw integration inventories, accounting reconciliation records and engineering traces remain inspectable, but they are progressive-disclosure/detail surfaces rather than first-paint content.

## Research-derived product rules

Research pass: Stripe, Linear, Vercel, Attio, PostHog, Mercury, Supabase, Retool and contemporary SaaS command dashboards.

Patterns adopted:
- quiet chrome and restrained visual hierarchy;
- fixed/collapsible left navigation on desktop, horizontal compact navigation on small screens;
- one primary company state plus a small KPI set above the fold;
- color communicates state, not decoration;
- tables/lists are preferred for operational truth; charts only when shape/trend matters;
- AI output is a designed summary/action surface, not a floating chatbot;
- progressive disclosure keeps research, source checks and system detail available without forcing the owner to scan it every visit;
- loading, empty, held, stale and error states are first-class UI states;
- microstates (hover/focus/disabled/loading) are part of perceived quality;
- desktop favors useful density; mobile reflows around owner decisions, not merely smaller cards.

## DANI visual system

Brand expression: cream/gold identity without decorative overload. Primary working surfaces are neutral white/warm-gray. Gold is the action/brand accent. Burgundy is not a dominant application surface. State colors are reserved for success/warning/failure/information.

Typography: restrained scale; hierarchy comes from weight, spacing and alignment. Avoid giant marketing-site headings inside operational workspaces.

Cards: fewer cards, softer borders, minimal shadow. Do not wrap every row in a card.

## Home information architecture

Persistent navigation:
- Overview
- Sales
- Operations
- Providers
- Customers
- Money
- Marketing
- Research
- Catalog
- Tech
- Connections / Settings

Overview primary surfaces:
- Morning Brief / While You Were Away
- Needs Danielle
- Commercial Pipeline / Quote Actions
- Today's Operations
- Exception Center
- Provider Operations
- Money state
- Agent Activity summary

Secondary/detail surfaces:
- company domain controller rows
- full prospecting queue
- full research queue and source snapshots
- accounting reconciliation records
- communications/runtime traces
- connected-system directory
- operating rhythm / architecture explanations

## Agentic UX contract

The HQ shows outcomes, not agent paperwork. Preferred summary grammar:

> While you were away: X tasks completed, Y opportunities qualified, Z records reconciled, N production defects repaired. Revenue opportunity: $A. B things need Danielle.

Every agent summary must link/drill to inspectable evidence. No agent may mark work complete merely because code/config exists; downstream consumer/business evidence is required.

## Truth contract

- Never display stale owner-attention state after the authoritative downstream record has satisfied the condition.
- Never display `0/0` for a subsystem when the denominator is unknown or sourced from a different authority. Use `—` / `not measured` / explicit denominator provenance instead.
- Never infer GREEN.
- Tester evidence is labeled and cannot imply Production mutation.
- Owner-only work is separated from deferred/system-executable work.
- External/permission holds remain visible but do not block independent lanes.

## Implementation boundary

This redesign changes presentation and information architecture without weakening auth, payment, accounting, QA, release, provider or compliance gates. Existing authoritative APIs/tables remain the source until explicitly replaced. Research patterns are adapted, not pixel-copied from other companies.
