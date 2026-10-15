# Operation $1 Million Dollar Company — Permanent Demand Validation Rule
Owner-approved: 2026-10-15. Scope: all DANI DECLARES divisions, five canonical channels, products, services, digital assets, merchandise, campaigns, provider offers and expansion proposals.

## Authority and integration
This is a **permanent commercial decision gate**, not a standalone project, new agent, planner, governor, queue, or alternative release train. Apply in existing product/opportunity review, owner-attention ranking, and release evidence. Existing owner-locked commercial authority, pricing, provider eligibility, compliance, payment, publication and QA gates remain authoritative. Historical offers are assessed without silently changing their approved state or deleting records.

## Mandatory skeptical assessment
Before building a new product, substantially redesigning or expanding an existing offer, purchasing inventory, committing promotional spend, or proposing new infrastructure:
1. Recover prior decisions, canonical SKU/channel, actual buyer history, inquiries, sales, feedback, competitor/free alternatives, production costs and fulfillment evidence.
2. Identify the **specific paying buyer**, urgency, paid outcome, differentiation, free alternatives, and whether interest is being confused with willingness to pay.
3. Challenge demand, contribution after variable costs, cash at risk, delivery capability, owner time, regulatory constraints and cheaper reuse of existing infrastructure.
4. Produce: strongest case **against**; strongest case **for**; confirmed evidence vs assumptions; smallest reversible test; explicit success/stop criteria; evidence that would reverse the decision; and recommendation **PROCEED / MODIFY / NARROW / ABANDON**.
5. Attach assessment to existing opportunity/product history and surface genuine owner decisions through current owner-attention ranking. Missing demand evidence is UNKNOWN, not zero demand or invented validation.
6. A favorable recommendation authorizes **no** spending, checkout activation, customer contact, provider assignment, price change, credit, investment or deployment. Existing action-specific approval and release machinery still apply.

## Execution priority
Prefer selling and verifying already-approved, fulfillable offers over generating new catalog items. For existing offers, a delivery test validates fulfillment **not demand**. Distinguish listing active, checkout verified, order paid, product delivered, contribution earned, and owner cash received. Track actual paid conversion and economics; do not equate followers, views, likes, inquiries or mockups with purchases.

## System-specific application (reuse existing interfaces)
- **GitHub / Vercel / Supabase:** Apply policy to existing planning, code review, product release evidence and governor owner-attention metadata; no new orchestration. Migrations require history-first dependency audit, replay, tests and deployment gates.
- **Shopify / Printify / Canva:** Preserve approved creative masters and variants; assess buyer demand before expensive customization work; test purchase-to-fulfillment and exact print-file handoff before launch. Do not regenerate original art to bypass integration limits.
- **Stripe / PayPal / accounting:** Distinguish projected vs invoiced vs paid vs net owner earnings; verify fees, refunds, payout and provider costs.
- **HubSpot / Airtable / Asana / email / social / analytics:** Reuse existing lead, evidence, task and campaign objects; attach demand evidence and decision, do not create duplicate queues or send unauthorized messages.
- **Government procurement:** Preserve CH05 agency contracting, purchase-order and approved payment requirements; never route through ordinary consumer checkout.

## Minimal assessment contract
```json
{
  "decision": "PROCEED | MODIFY | NARROW | ABANDON",
  "buyer": null,
  "paid_problem": null,
  "evidence_for": [],
  "evidence_against": [],
  "free_alternatives": [],
  "unverified_assumptions": [],
  "estimated_contribution": null,
  "cash_at_risk": null,
  "smallest_test": null,
  "success_criteria": null,
  "stop_criteria": null,
  "reversal_evidence": [],
  "owner_approval_required": false,
  "release_authorized": false
}
```
Do not infer permission from `decision`; `release_authorized` remains false until existing release checks separately pass.

## Immediate application
1. Verify existing Shopify digital delivery and real customer checkout; validate demand separately.
2. Preserve Pumpkin Spice approved 4×4×4×4 customization specification; test default artwork and economics before funding extensive personalization engineering.
3. Tie faceless content and authorized DM workflows to verified destinations; measure purchases, refunds, contribution and owner earnings.
4. Apply the same skeptical review to new services, packages, marketing ideas, government bids, investments, leverage and software integrations.

**Permanent rule:** IDEA → SKEPTICAL VALIDATION → SMALLEST PAID TEST → GOVERNED BUILD → RELEASE QA → REAL PURCHASE → FULFILLMENT → ACCOUNTING → LEARNING. Never substitute AI confidence for evidence.

## Wealth Operating Framework — same project, no parallel architecture
The existing owner HQ, commercial authority, owner-attention governor and execution workers must incorporate five advisory perspectives:
1. **Wealth Architect:** distinguish annual company revenue, operating profit, owner earnings and personal net worth; use verified balances, debts and household obligations before setting personal allocation targets.
2. **Daily capital discipline:** favor verified paid demand, positive contribution, controlled cash exposure, feasible fulfillment and measurable outcomes over likes, catalog size and speculative projections.
3. **Revenue portfolio:** compare existing services, digital downloads, merchandise and recurring contracts on verified contribution, owner effort, capacity, repeatability and customer demand; do not manufacture five income streams.
4. **Asset acquisition:** review reserves, liquidity, business reinvestment, property and investment alternatives only after confirming source-of-funds, downside, time horizon and authorization.
5. **Leverage:** evaluate provider capacity, automation, partnerships and proposed financing using repayment exposure, failure cases, owner workload and authorization; no automatic borrowing or investing.

### Existing-system implementation boundary
The pure `evaluateDemandValidation` helper in `src/lib/aiExecutionGovernor.js` is advisory. It requires explicit `demandValidationRequired` from an existing caller and cannot silently block already-authorized fulfillment or existing sales. It must not be mistaken for a database enforcement gate. Future integration should pass actual verified demand/cost facts from canonical records, preserve owner-attention ranking as the sole attention surface, and add tests for UNKNOWN demand, nonpositive contribution, unverified fulfillment, unresolved authority and no implied publication permission. No production promotion until existing CI, replay and migration gates pass.
