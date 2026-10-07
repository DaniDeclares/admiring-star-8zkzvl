# AI Execution Routing Governor

Status: implementation contract for the existing DANI Intent-to-Outcome Engine.

This change does **not** create a new agent, Brain, queue, scheduler, model registry, memory product, or source of truth. It implements the cost/reliability routing rule already approved in `DANI_AI_DIVISION_OF_LABOR_2026-10-02.md` and `DANI_INTENT_TO_OUTCOME_ENGINE_2026-10-04.md`.

## Routing rule

After history and authority are resolved:

- Known deterministic procedures use code/workers, not a reasoning model.
- Bounded mechanical work uses the cheapest **VERIFIED** capable worker.
- Work requiring non-trivial judgment uses general reasoning.
- Security boundaries, architecture decisions, authority conflicts, Production incidents, and failed verification escalate to the strongest available verified reasoning/review lane.
- Existing owner gates remain owner gates. Routing never bypasses approval for outreach, pricing, money, legal/compliance claims, or Production mutation.
- Material changes require independent review.
- Failed verification escalates instead of repeatedly retrying the same worker/tier.
- A live deployment remains OBSERVING until the owner's requested downstream outcome is proven.

## Context budget

History-first does not mean full-repository/full-chat ingestion. The router requests owner intent, authority receipts, relevant prior fixes, and explicitly scoped files/logs. Unrelated repository trees, logs and chat history are excluded by default.

## Worker selection

The module returns `CHEAPEST_VERIFIED_CAPABLE`, not a vendor/model name. Actual worker choice must use current verified capability evidence from the existing Tester integration operating registry. This prevents a hard-coded Claude/ChatGPT/Grok hierarchy from becoming stale authority.

## Code

`src/lib/aiExecutionGovernor.js` is deliberately pure and side-effect free. It can be consumed by existing Chief-of-Staff/Tech execution surfaces without becoming a second orchestrator. It never performs a governed action itself.
