# DANI real-income opportunity seam — 2026-10-03

## Authority
This document records the existing seam. It does not create a new agent, queue, scheduler, CRM, workforce engine, commercial classifier, or owner-attention system.

Canonical path:

`external source adapter -> dd_demand_capture_staging -> opportunity_route/work-mode evidence -> existing commercial/provider/machine economics -> dd_sales_queue or owner decision -> dd_owner_attention_queue governor -> weekly cash horizon -> governed execution -> outcome/accounting/learning`

Existing route vocabulary from the sales-queue context contract remains authoritative:
- `DANI_AS_VENDOR`
- `PROVIDER_ROUTED`
- `DANIELLE_AS_CONTRACTOR`
- `NOT_DELIVERABLE`

Existing mined signal types remain authoritative: `JOB_POSTING`, `CONTRACT_GIG`, `GITHUB_ISSUE`, `GITHUB_BOUNTY`, `PROCUREMENT_NOTICE`, `MARKETPLACE_REQUEST`.

## Source adapter boundary
External search systems are evidence rails, not DANI commercial authority. An adapter may normalize a real posting into the existing `dd_demand_capture_staging` envelope only when its terms and connector authorization permit persistence. It must preserve source identity/URL, posting/company/title, compensation evidence, work-mode evidence, observed time, and provenance.

Currently proven in-repo source:
- GitHub Opportunity Scout: hourly discovery, discovery-only artifact. It already scores funding/pay signals, async/remote signals, synchronous/location dependency, competition, capability hints, and refuses auto-claim/contact/CRM creation.

Available connected job sources that are NOT yet DANI runtime adapters:
- FoundRole Jobs
- Jobicy
- Job Search by Jobtome
- SonicJobs
- Jobs by Wizehire
- joblet.ai
- Remote Jobs

Do not claim these sources are attached to DANI runtime merely because ChatGPT can call them. They can be used interactively to find evidence now; durable runtime ingestion requires a source-specific authorized adapter or an existing approved external-action handoff.

## Danielle personal-work policy
Applies only when `opportunity_route = DANIELLE_AS_CONTRACTOR` (W-2 or non-dispatchable 1099). It does not block DANI/provider work merely because fulfillment is field-based.

- remote is mandatory;
- primarily asynchronous is preferred; synchronous-required work is rejected;
- high phone burden is rejected;
- high meeting/Zoom burden is rejected;
- fixed-presence work is rejected;
- required driving, field work, or travel is rejected;
- flexible or deliverable-oriented work is eligible when the other hard constraints pass;
- missing work-mode evidence stays `NEEDS_EVIDENCE`, never guessed;
- provider-dispatchable 1099 belongs to `PROVIDER_ROUTED`, not Danielle personal work;
- work DANI can lawfully and truthfully deliver as a company belongs to `DANI_AS_VENDOR`;
- work a governed automation can execute still requires the existing economics, capability, acceptance, platform-policy, approval, QA, submission, and collection controls.

## GitHub machine-executable lane already present
The repository already contains `scripts/dani-github-approved-work-executor.mjs`. It accepts only an already-governed execution envelope and only `AUTOMATION`/`MIXED` lanes. It fails closed on compensation, unsafe scope/spend/secret flags, assignment state, changed issue state, bounty platform/KYC/claim/deadline/license/originality/dependency requirements. Do not create another executor.

## Cash ranking
Do not create a new cash queue. Reuse:
- `dd_prepare_weekly_cash_conversion_queue`
- `dd_run_sales_marketing_cash_controller`
- `dd_owner_attention_queue`
- `private.dd_governor_evaluate_attention`
- `dd_governor_rerank_owner_attention`

The governor already accepts economics metadata including expected gross, direct cost, time-to-cash, fulfillment confidence, compensation-known, authority, and evidence age. Real external opportunities should populate those existing fields after evidence/economics evaluation; unknown pay/cost remains unknown.

## Promotion rule
Tester proves the seam. Production promotion uses existing `dd_promotion_candidates` / governed release machinery. Never copy the whole Tester architecture to Production solely because Tester contains more objects.
