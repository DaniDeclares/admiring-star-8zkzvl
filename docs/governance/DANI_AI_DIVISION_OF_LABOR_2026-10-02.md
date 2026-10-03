# DANI AI Division of Labor (2026-10-02)

Status: contract (merged 2026-10-02); section 5 added the same day. Owner: Danielle. Applies to every AI assistant working for DANI DECLARES (ChatGPT, Claude, Codex, Grok, and any future model).

Read with `AGENTS.md` (change control and external-system authority) and `docs/DANI_DECLARES_CROSS_SYSTEM_AUTHORITY_2026-09-14.md`. This file does not change either; it adds the rules for which AI does what.

## 1. DANI owns the knowledge. Models are workers.

- Business truth lives where `AGENTS.md` rule 8 already puts it: Supabase (runtime state; Tester for research and proof, Production for live), GitHub (code, migrations, config), HubSpot (CRM relationship records), Gmail (mailbox content), Stripe/PayPal/Zelle (payment events).
- No AI vendor's chat history, memory, Space, Page or agent is a system of record. Anything an AI learns that DANI must keep goes into one of the systems above, labeled FACT / INFERENCE / RESEARCH / SIMULATION / OWNER DECISION.
- When a better model ships, DANI changes which worker it asks. It never migrates business data to follow a model.

## 2. Routing is evidence-based, not vendor-based

Work is routed to whichever tool has a **verified** capability for it today, weighing data access, permissions, cost, reliability and governance. "Vendor X is best at Y" is never a permanent rule.

Capability evidence is kept as data in Tester `dd_integration_operating_registry` (one row per AI vendor, `layer = SPECIALIST`). Each capability in a row's `notes` carries one status:

| Status | Meaning | May DANI depend on it? |
|---|---|---|
| VERIFIED | Exercised successfully from DANI's own accounts, with a receipt or tool output | Yes |
| CLAIMED | Stated by the vendor's docs or another AI, not yet exercised on Danielle's account | Plan around it, don't depend on it |
| UNVERIFIED | Seen only in search results, videos or marketing | No |

A capability moves to VERIFIED only with evidence (a tool result, receipt, PR, or Danielle confirming it is on her plan). Update the row's `notes`, `source_basis` and `updated_at`; no schema change is needed.

## 3. Current assignment (as of 2026-10-02)

| Role | Assigned to | Basis |
|---|---|---|
| Owner interface (talking with Danielle, Voice, approvals) | ChatGPT (Chat / Voice) | CLAIMED: Voice can use connected plugins (OpenAI 2026-09-23 release notes, per ChatGPT). Needs Danielle to confirm on her phone. |
| Cross-system business orchestration through plugins | ChatGPT (Work) | CLAIMED. Work tasks run under Danielle's plugin permissions. |
| Repository engineering, migrations, PRs, Supabase proofs | Claude Code and Codex | Claude VERIFIED (this repo's PRs #523 and #525, Tester/Production SQL). Codex CLAIMED. |
| Review of another AI's PR | Whichever of Claude/ChatGPT/Codex did **not** author it | Existing rule: only the PR author pushes; the other reviews. |
| Prospect search and enrichment | Apollo + HubSpot (via whichever AI has them connected) | VERIFIED from Claude threads 2026-10-02. |
| Persistent background monitoring | Existing DANI workers and Claude routines, **until** a ChatGPT Dot is verified on Danielle's account | Dots UNVERIFIED on Danielle's plan. |
| Real-time news / X-platform signal | Grok, only when a question needs evidence nothing else has | UNVERIFIED; no DANI account evidence. Not used by default. |
| Institutional learning (facts, decisions, outcomes) | Tester Brain (Supabase Tester) | Existing architecture. |
| Live changes | Governed promotion to Production (Tester proof → Danielle approval → promote) | Existing release playbooks. |

### Rules for adopting a new AI capability

1. Verify it is enabled on Danielle's account before designing around it.
2. Check whether it replaces existing DANI code or a worker. If it does, retire the old path in the same change; never run two systems for one job.
3. It may read and act only within the permissions Danielle granted in that product, and only on actions the existing approval rules allow (no outbound messages, pricing, legal or Production changes without her approval).
4. It writes what it learns back to the systems in section 1, not into its own workspace only.

### Dots, Space, Pages, Data (ChatGPT)

- **Dot** (if verified): at most one, an owner-operations watcher. Custom rules must include: never send outreach without approval; never change Production; existing relationship history beats rediscovery; research is not business truth; keep personal and family information out of business systems; revenue blockers outrank speculative improvements. When a Dot takes over a monitoring job, the matching DANI routine or worker is disabled in the same change.
- **Space / Pages**: a human-readable working layer only. Not a database; nothing there is authoritative until written to a system in section 1.
- **Data plugin**: check it before building any new report or dashboard in DANI code.

## 4. Telephony: Google Voice

FACT: Google Voice has no native ChatGPT or Claude integration and no supported public API (registry row `GOOGLE_VOICE`, REFERENCE_ONLY). Do not build against private or unofficial endpoints.

Supported path:

```
Google Voice  --(Voice settings: forward texts, missed calls, voicemail to email)-->  Gmail (Vendors@)
Gmail  --(read-only)-->  DANI Gmail reconciliation  -->  dd_sales_queue / relationship records
```

- Inbound only. Replying, calling and texting stay with Danielle in the Voice app. A click-to-call link may be prepared for her, but a person places every call.
- Voice notifications arrive from `voice-noreply@google.com` and `*@txt.voice.google.com`, so they cannot match the queue by email address. Matching must use the phone number already stored on the queue row; a number that matches nothing is listed for Danielle and is **not** written as a new record.
- FACT 2026-10-02: Vendors@ had no Google Voice mail in the last 180 days, so forwarding is not on for that mailbox yet.
- If a supported Voice integration appears later, it plugs into the same reconciliation and relationship records; nothing is rebuilt.

## 5. DANI's internal roles (owner definitions, 2026-10-02)

OWNER DECISION (Danielle, 2026-10-02). These are the authoritative meanings. They are separate identities: no AI, worker, prompt, doc or UI may merge, rename or substitute one for another. When existing components carry different names, reconcile them to these meanings; don't rename or rebuild them for that reason alone.

- **Baby** = DANI's learning AI. Baby ingests governed evidence, research, decisions and outcomes; learns patterns; identifies gaps, contradictions and opportunities; and improves DANI's institutional intelligence. Baby learns. Baby is not the Chief of Staff, Personal Assistant, C-Team, Tech, or an external model.
- **Chief of Staff** = Danielle's executive/business orchestrator. It coordinates the C-Team, departments and workers, priorities, dependencies, exceptions, owner approvals and execution against Danielle's business objectives. It uses Baby's intelligence but does not replace Baby.
- **Personal Assistant** = Danielle's personal operating assistant. It coordinates Danielle's personal schedule, reminders, household/family logistics, appointments, personal deadlines and other owner-life execution. It can exchange the minimum necessary availability/constraint information with the Chief of Staff, but personal details do not freely propagate into DANI's business systems.
- **C-Team** leads business functions.
- **Tech** owns technology execution.
- **External AIs** (ChatGPT, Claude, Codex, Grok and any future model) are workers and resources, not any of the identities above.

In short: Baby learns DANI. Chief of Staff runs executive coordination for DANI. Personal Assistant assists Danielle's personal life.

### What implements each today (traced 2026-10-02, read-only)

No table, function, worker, cron, prompt, registry row or UI card is literally named Baby, Chief of Staff or Personal Assistant, in this repo (every branch) or in either Supabase project.

| Role | Existing implementation | Gap |
|---|---|---|
| Baby | Tester Brain learning loop: `dd_brain_*` (signals, hypotheses, learning ledger/rules/replays, constitution, objectives), `dd_run_dani_brain_cycle`, `dd_run_brain_learning_governance_v1`. Production captures learning and ships it to Tester through the Production learning bridge. | None structural. |
| Chief of Staff | Company, revenue and research controllers; owner daily and morning briefs; `dd_owner_attention_queue`; DANI HQ (`src/pages/portal/OwnerHQPage.jsx`); Tester constitution rule `EXECUTIVE_TECHNICAL_STEWARDSHIP`. | Pieces run separately; nothing owns them as one role yet. |
| Personal Assistant | Not built. | No authoritative personal store exists. Don't build one without Danielle's decision. |

"Chief of Staff/PMO" in the service catalog is a customer offering, unrelated to the internal role. "Baby showers" in the events catalog is unrelated to Baby.

### Privacy boundary between business and personal

Business systems may retain business-relevant owner constraints and goals, but not unnecessary personal or family details. The Chief of Staff may need "Danielle unavailable 3–5 PM", "owner requires $X personal draw by date Y" or "protect weekends" when those materially affect company planning. It does not need children's names, birthdays, custody details, school information, private family circumstances, or the reason behind an unavailable calendar block.

This rule applies going forward. Personal or family data already in the Brain is classified and quarantined from business-worker consumption, never deleted blindly. Personal-only material moves to the Personal Assistant's authoritative store only if one exists; otherwise it is held, and the gap goes back to Danielle.

## 6. What this contract does not do

No schema change, no new worker, no new orchestration or memory tool (consistent with the capability evaluation Danielle accepted 2026-10-02). Revenue work comes first; this contract exists so new AI features are adopted by evidence instead of by announcement.
