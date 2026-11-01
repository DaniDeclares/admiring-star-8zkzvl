# DANI Intent-to-Outcome Engine (2026-10-04)

Status: OWNER APPROVED architecture contract. Owner: Danielle. Scope: DANI DECLARES engineering and operations execution. This extends, and does not replace, `AGENTS.md`, `docs/governance/DANI_AI_DIVISION_OF_LABOR_2026-10-02.md`, the cross-system authority contract, existing Tester Brain, Owner HQ, release controls, workers, or commercial/runtime systems.

## 1. Product direction

DANI is not building a second coding assistant or a parallel orchestration system. DANI's existing execution architecture is the first real-world implementation of an **intent-to-outcome operating engine**: the owner states what should become true; DANI recovers history and current authority, changes only what is necessary, proves the change, promotes it through existing gates, observes the real-world result, and continues until the requested outcome is true or legitimately held.

DANI DECLARES is the first tenant/use case. Reusable primitives should be made generic and separable when they are encountered naturally in revenue and operations work, without delaying the business to create a speculative standalone product.

## 2. Canonical execution loop

Every substantial owner intent follows this loop where applicable:

`OWNER INTENT -> RECOVER HISTORY -> RESOLVE AUTHORITY/CURRENT STATE -> DEFINE OUTCOME + PROOF -> PLAN SMALLEST DELTA -> EXECUTE -> TEST -> VERIFY -> PROMOTE -> LIVE VERIFY -> OBSERVE BUSINESS OUTCOME -> LEARN -> CONTINUE / GREEN / LEGITIMATELY HELD`

The engine must not equate generated code, a merged PR, a successful deployment, or a scheduled worker with completion when the owner's requested outcome is downstream of those events.

Example: a referral feature is not green merely because code deployed. If the owner asked for social acquisition with referrals, proof continues through the applicable chain: social asset -> trackable CTA -> landing/intake -> attribution -> conversion -> qualifying job/payment -> referral qualification/reward -> analytics/Owner HQ evidence.

## 3. Reusable primitives

These are semantic primitives, not instructions to create duplicate tables/services. Existing canonical objects should implement them whenever possible.

- **Intent** — what the owner wants to become true, including constraints and authority boundaries.
- **History** — prior decisions, fixes, receipts, migrations, PRs, runtime evidence and known failures relevant to the intent.
- **Authority** — which existing system owns each fact/action.
- **Outcome** — the externally meaningful state that satisfies the intent.
- **Proof** — observable evidence required to claim the outcome.
- **Plan** — the smallest compatible sequence of actions using existing rails.
- **Agent/Worker** — the currently verified specialist assigned to an action; models are replaceable workers, never authority.
- **Action** — a bounded executable change or external operation.
- **Evidence** — receipts, tests, runtime records, telemetry or owner confirmation produced by execution.
- **Gate** — a condition that must be satisfied before promotion, external contact, money movement, legal/compliance claim, or other governed action.
- **Promotion** — governed movement of a proven change toward live authority, normally Tester -> Production where applicable.
- **Observation** — post-release/runtime/business evidence about what actually happened.
- **Outcome State** — whether the requested result is achieved, still progressing, failed, or legitimately held.
- **Exception** — contradiction, ambiguity, stale state, missing authority, failed proof, or other condition that prevents safe continuation.
- **Owner Decision** — a decision reserved for Danielle and surfaced through existing owner-attention/HQ mechanisms rather than guessed by a worker.
- **Learning** — governed feedback to Baby/Tester Brain from facts, decisions and observed outcomes.

## 4. Outcome state model

Use these terms when describing execution progress. Do not create a competing state machine where an existing domain-specific state already exists; map domain state to these semantics at the orchestration/receipt layer.

- `REQUESTED` — owner intent captured.
- `RECOVERED` — relevant history and canonical prior work inspected.
- `RESOLVED` — current authority/runtime/source state established.
- `DEFINED` — outcome and proof conditions are explicit.
- `EXECUTING` — smallest compatible delta is underway.
- `TESTED` — implementation-level tests passed where applicable.
- `VERIFIED` — required pre-production evidence passed.
- `PROMOTED` — governed release/promotion completed.
- `LIVE` — exact intended version/change is live at the authoritative runtime.
- `OBSERVING` — downstream real-world outcome is still being measured.
- `GREEN` — owner's requested outcome is proven true, not merely deployed.
- `HELD` — safe continuation requires an owner decision, permission, external dependency, scheduled event, or other legitimate prerequisite.
- `FAILED` — proof shows the attempted path did not produce the required result; recover evidence and repair rather than relabeling it green.
- `SUPERSEDED` — newer owner intent or canonical work replaces this execution thread.

## 5. History-first compiler rules

Before creating architecture, tables, workers, schedulers, integrations, pages, queues or agents:

1. Search current `main` and relevant open PRs.
2. Inspect the authoritative runtime/data system.
3. Recover prior fixes/decisions and determine whether the requested capability already exists partially or fully.
4. Identify the smallest broken handoff or missing invariant.
5. Extend the existing canonical path.
6. Create a new primitive only when no canonical owner exists and the need is proven.

Repeated rediscovery of an already-solved problem is a defect. When it occurs, feed the lesson through the existing Brain learning/governance path rather than creating another memory product.

## 6. Intent compiler behavior

Owner input may be conversational, voice-dictated, incomplete, nontechnical or contain several implementation guesses. Workers must preserve the owner's desired outcome and explicit constraints while translating it into technical work.

The compiler should derive, where evidence permits:

- desired outcome;
- affected business/runtime domains;
- authoritative systems;
- existing implementation/history;
- constraints and non-negotiables;
- actions that can proceed without owner intervention;
- actions requiring owner approval;
- proof conditions;
- legitimate hold conditions;
- downstream business observation needed after deployment.

Do not require Danielle to convert her intent into engineering language first.

## 7. Execution and agent rules

- Existing DANI roles remain distinct: Baby learns; Chief of Staff coordinates business execution; Tech owns technology execution; external AIs are replaceable workers.
- Route work by verified capability, access, cost, reliability and governance, per the AI Division of Labor contract.
- Multiple agents may work on independent lanes, but must not create competing authority, duplicate workers or overlapping implementations.
- One code task = one branch = one PR unless an existing release procedure explicitly says otherwise.
- A worker that did not author a material change should review it when practical under existing review rules.
- Outbound messages, pricing changes, money movement, legal/compliance claims and other owner-gated actions remain gated even when an intent is otherwise autonomous.

## 8. Proof hierarchy

Evidence strength, highest first where applicable:

1. Real Production business outcome/receipt.
2. Production runtime record tied to exact version/action.
3. Verified external-system receipt from the authoritative system.
4. Production deployment for the exact commit plus live behavior proof.
5. Tester/runtime proof against production-compatible schema/config.
6. Automated tests/CI.
7. Static/source inspection.
8. Research/vendor claim.
9. AI assertion.

A lower level must not be presented as a higher one. Research is not runtime truth. Deployment is not business outcome.

## 9. Outcome-driven continuation

After release, determine whether the owner's requested outcome has actually happened. If not:

- collect observation evidence;
- identify the next broken handoff or bottleneck;
- repair the smallest compatible delta;
- repeat the same governed loop.

Do not stop merely because a PR merged. Do not loop indefinitely on diagnostics when safe executable work is available. Stop only at `GREEN`, `HELD`, `FAILED` pending a new repair path, or `SUPERSEDED`.

## 10. Owner HQ contract

Owner HQ is the human authority surface for this engine. Reuse its existing attention/ranking/decision mechanisms. It should increasingly answer:

- What outcome is DANI pursuing?
- What changed?
- What is proven?
- What is live but still awaiting business evidence?
- What is making or blocking money?
- What failed?
- What specifically needs Danielle's decision?
- What will continue without her?

Do not create a separate "vibe coding dashboard" while Owner HQ can be extended to expose these semantics.

## 11. Learning contract

Observed outcomes feed Baby/Tester Brain through existing governed learning rails. Useful learning includes:

- repeated implementation mistakes;
- architecture/history rediscovery;
- conversion bottlenecks;
- failed assumptions;
- provider/customer behavior;
- release/runtime failure patterns;
- successful reusable execution patterns.

Baby may recommend improvements but does not silently rewrite Production authority.

## 12. Productization boundary

Treat reusable primitives encountered during DANI work as potential product primitives. Keep them tenant-neutral where doing so is low-cost and does not weaken DANI-specific correctness.

Do **not** yet:

- fork a separate product/repository solely for this concept;
- duplicate DANI's Brain, Chief of Staff, Owner HQ, scheduler, worker, evidence, or release systems;
- pause revenue work to generalize speculative features;
- market the engine as autonomous or outcome-proven beyond evidence.

A separate product boundary becomes appropriate only after repeated DANI use demonstrates stable reusable contracts and there is an owner-approved commercialization decision.

## 13. Current proving workload

The current social/referral/provider acquisition work is an active proving workload for this engine. Its outcome is not "referral code deployed." The outcome is a measured acquisition path from social/referral CTA through attributed customer/provider conversion and downstream commercial evidence. Continue that work under this contract rather than pausing it to build a demo of the engine.

## 14. Evidence-Backed Execution

This section clarifies the existing intent-to-outcome contract. It creates no new state machine, runtime authority, worker, database, or approval.

### Actions and outcomes

Record preparation, action execution, intended outcome, fulfillment, and financial availability as distinct facts using existing domain records and outcome states. A completed action remains completed even when its downstream outcome is pending, failed, or legitimately held.

- Draft prepared != message sent; sent != delivered, read, answered, or sold.
- Prospect contacted != qualified opportunity.
- Quote accepted != customer payment collected.
- Payment successful != settled or currently accessible funds.
- Collected revenue != profit; profit != owner-available cash.
- Provider information collected != authorized, assignment-ready provider.
- Code committed != merged; merged != deployed; deployed != verified in use.
- Automation completed != its intended downstream outcome achieved.
- Learning evidence stored != Baby/DANI retrieved or applied that evidence.
- Calendar entry created != permission, childcare, or appointment confirmed.

### Timing and assignment evidence

Classify timing as contractual deadline, external deadline, proposed internal target, flexible timing, or no deadline established. Preserve the source, date, time, and timezone when relevant. Calculate event-relative requirements, including "48 hours before," against the verified event time and timezone. Never invent a deadline or invalidate long-term aspirations and personal activities for lacking one.

For substantial assignments, make the intended outcome, timing source, next authorized action, responsible worker, action status, outcome status, evidence reference/date, exact blocker, and any owner decision retrievable through existing records. Do not migrate schemas merely to add these labels.

### Evidence, uncertainty, and account coverage

Classify material findings as directly inspected, user-reported, supplied investigation finding, historically documented, proposed, or unknown. Preserve source/record identifiers, source date, verification date, what is established, and material limitations. Workers must distinguish their own inspections from another worker's reports; never reuse unsupported citation identifiers.

A later incomplete search does not erase an earlier retrieved record. Reconcile conflicting findings against source evidence and chronology. For relevant authorized accounts, identify every account searched, associate findings with their originating account, follow material pagination or disclose limits, and do not claim exhaustive coverage from a bounded search. Deduplicate by account, transaction/invoice, and billing period, not service name alone. Later successful payments may resolve earlier failures; repeated notices may concern one debt; separate accounts may have separate subscriptions.

### Financial availability

Before asserting owner-available cash, reconcile successful customer receipts; settlement, destination and access; processing fees; refunds, disputes, restrictions and holds; outstanding fulfillment, provider and other commitments; and payments already made to the owner. Preserve business-versus-personal authority and applicable accounting classification. Unknown is not zero. Failed charges are not withdrawals. Internal transfers are not automatically earned income. Historical balances are not current cash; predicted bills are not confirmed amounts due. Do not infer profit or owner-available funds from a successful deposit alone.

### Component identity and owner capacity

Tester Brain feeds Baby/DANI through governed learning evidence. Tester Brain and Baby/DANI are separate components. Baby is the earlier name for the learning AI Danielle now calls DANI. Preserve the distinct identities and authorities of Tester Brain, Baby/DANI, Production operations, Owner HQ, Chief of Staff, Personal Assistant, and external AI workers/models. Historical implementation mappings do not establish component identity or prove a separate Baby/DANI runtime or Owner HQ integration is live.

Commercial work must respect verified owner availability, childcare, education, family commitments, legal and contractual duties, safety, security, privacy, and protected personal time. An empty calendar does not prove availability. Noncommercial responsibilities remain legitimate priorities. Rest, nature, plants, craft, reflection, and personal practices are not mandatory productivity assignments. Keep sensitive family details out of shared engineering policy.

### Adoption and truthful completion

Report separately: policy prepared, committed, PR opened, merged, worker retrieval tested, and runtime behavior verified. Publishing documentation does not establish that ChatGPT, Claude, Codex, Grok, Perplexity, or Baby/DANI retrieved or applied it. Verify each supported retrieval path independently before claiming adoption. All existing owner approvals, privacy boundaries, release gates, and rollback requirements remain in force.
