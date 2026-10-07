# Operation $1 Million — AI Operating Doctrine

Authority: OWNER directive, 2026-10-06.

This receipt preserves the operating decisions implemented in Production and Tester. Runtime database authority remains environment-specific and must be recovered history-first before future edits.

## OWNER_DECISION_LENS_V1

For consequential owner recommendations, campaign strategy, offer changes, major builds, prioritization, and go/no-go decisions:

1. **Find my blind spots.** Identify what is missing, overbuilt, underused, assumed, avoided, or likely to fail.
2. **ELI10.** Explain the important conclusion in plain language without removing important substance.
3. **Ask up to 3 material questions.** Ask only when the answers would materially change the decision or execution. Do not create ritual questions when known history already answers them.
4. **Pros and cons.** State meaningful benefits, drawbacks, and tradeoffs for the recommended path and serious alternatives.
5. **History first.** Recover existing authority, prior decisions, workers, receipts, evidence, and current state before building or changing.

Production authority:
- `public.dd_ai_operating_doctrine_v1` → `OWNER_DECISION_LENS_V1`
- `public.dd_prompt_shortcut_patterns` → `/blindspots`, `/eli10`, `/3questions`, `/proscons`, `/ownerlens`

Tester Brain authority:
- `public.dd_brain_constitution` → `OWNER_DECISION_LENS`

## OP1M_CREATOR_VOICE_V1

Operation $1 Million is a documentary-style founder story, not 30 advertisements.

Voice benchmark: **RAW** — self-aware, specific, imperfect, naturally funny, discovery-in-public, human rather than corporate.

Rules:
- Use percentages and milestones for public revenue disclosure.
- Concrete verified activity counts are allowed. Example: “I sent 20 pitches and nobody bought.”
- Never fake revenue, manufacture struggle, or sanitize failure into corporate marketing.
- Real life and parenting may appear naturally, while private family details remain protected.
- Prefer problem → realization → correction over failure → pity.
- Comments and DMs are research and sales signals, not vanity engagement.
- Danielle’s highest-value work: talk, show, sell, respond, approve.
- System work: research, recover history, draft, repurpose, classify, attribute, prioritize, prepare follow-up, and measure.
- Campaign performance must connect attention to platform revenue and/or DANI acquisition outcomes.

Production authority:
- `public.dd_ai_operating_doctrine_v1` → `OP1M_CREATOR_VOICE_V1`
- `public.dd_acquisition_campaigns_v1.OP1M_CREATOR_ENGINE.metadata`

Tester Brain authority:
- `public.dd_brain_constitution` → `OP1M_RAW_CREATOR_VOICE`

## FAMILY_COMPATIBLE_EXECUTION_V1

Operation $1 Million must fit the owner's real household rather than assume uninterrupted creator days.

Operating rules:
- Standard owner work boundary remains weekdays, approximately 9:00 AM–5:00 PM. Evenings and weekends are protected by default.
- The youngest children have a target nap start around 12:30–1:30 PM and target bedtime around 9:00 PM, but neither is a reliable dependency.
- Morning capacity carries mission-critical owner work: outward-facing revenue action, recording that requires focus, decisions, and approvals.
- Nap time is **bonus capacity**, not a hard dependency. Use it for editing/review/deeper work when available; failure to nap must not break the campaign.
- Afternoon work should be interruption-tolerant: household reset, B-roll captured during real work, voice notes, light administration, comments and DMs.
- After 9:00 PM is overflow only, not a normal second shift.
- A materially late afternoon/evening nap automatically converts the evening to family/low-brain activity rather than extending the workday late into the night.
- Recording should be integrated into real life where appropriate; do not stage a separate fake creator life.
- Protect children's private details, locations, school/legal/health information, and sensitive family context.
- Editing burden should be minimized for Danielle. Danielle talks, shows, sells, responds and approves; the system drafts, repurposes, classifies, attributes, prioritizes, prepares follow-up and measures.
- Household care is an operating constraint, not invisible labor. The 30-day execution plan must include recurring house-reset capacity and may be recalibrated from real household conditions.
- Calendar is the authority for Danielle's time commitments; Asana is work/deadlines; Airtable is operational/research evidence; HubSpot is CRM/sales activity; Production remains campaign/service/attribution authority. Synchronize identifiers and state, not indiscriminately duplicate every object.

## 30-DAY CAMPAIGN EXECUTION

Production authority:
- `public.dd_op1m_30day_calendar_v1` contains Days 1–30, 2026-10-06 through 2026-11-04.
- All campaign content remains owner-approval gated; no external publish authorization is implied by scheduling.
- Days 22–30 remain adaptive and must use actual attribution, objections, conversion evidence and scorecards rather than predictions made at campaign start.
- Every business day should include outward-facing revenue action before substantial optional internal building.

## Environment note

Production and Tester intentionally use different existing governance structures. Do not flatten them into one schema merely for symmetry. Tester’s Brain constitution is its native control surface; Production uses the acquisition/doctrine layer. Future promotion remains evidence-first and independently reviewed.
