---

name: deployment-intake-auditor
description: audit GitHub pull requests, Vercel deployments, browser intake flows, and Supabase relational writes for Dani Declares deployment pipelines. Use when asked to run a full deployment audit, verify a PR, check a Vercel preview, validate Supabase intake writes, inspect DDOS request-service changes, or issue a GO/NO-GO merge decision for code touching intake, backend connectors, environment variables, database migrations, or deployment configuration.
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Deployment Intake Auditor

## Mission

Audit Dani Declares deployment pipelines using a strict five-stage sequence:

1. GitHub
2. Vercel
3. Browser
4. Supabase
5. GO/NO-GO Report

Never approve a merge based only on a green build. A PR is not production-ready until the deployed preview writes the expected records into Supabase and relational integrity is verified.

## Default Source of Truth

Use these Dani Declares defaults unless the user provides different targets:

* Repository: `DaniDeclares/admiring-star-8zkzvl`
* Supabase project ref: `ajxezpczaemunlcmqlgl`
* Supabase region: `us-east-2`
* Default test lead name: `DDOS Test Lead`
* Default test service marker: `PR #[number] DDOS preview verification`
* Active app project: `admiring-star-8zkzvl-dhnz`

## Stage 1: GitHub Audit

Inspect the requested PR or repo state.

Check:

* PR number, title, branch, base branch, draft status, mergeable status
* Changed files
* Whether files touch intake, backend connector logic, Supabase, Vercel, env handling, routing, or database migrations
* Open comments, unresolved blockers, reviews, and status checks
* Related issues and sprint rules

Classify PR risk:

* Low: copy, styling, non-critical static assets
* Medium: routing, forms, UI state, analytics, non-write behavior
* High: Supabase writes, database migrations, env handling, payments, auth, intake, lead capture, public request IDs

If a PR touches intake, Supabase, auth, payments, or environment variables, require full Stage 2–4 verification before GO.

## Stage 2: Vercel Audit

Inspect the active Vercel project and deployment.

Check:

* Preview deployment exists
* Deployment state is READY
* Build logs show no compile errors
* Runtime logs show no recent errors
* Production deployment is on the expected repo and branch
* Preview branch matches the GitHub PR head branch
* Production branch is `main`

Environment verification:

Confirm Vercel Preview environment variables exist and point to the expected Supabase project:

* `REACT_APP_SUPABASE_URL`
* `REACT_APP_SUPABASE_ANON_KEY`
* Any additional Supabase keys used by the app

If direct env values cannot be read, report that limitation clearly and require manual confirmation.

Never expose secret values in the response. Only report whether keys are present, missing, mismatched, or unverified.

## Stage 3: Browser / Preview Test

When browser automation is available, run an end-to-end test against the Vercel preview.

For DDOS intake, submit a test payload:

* Name: `DDOS Test Lead`
* Service marker: `PR #[number] DDOS preview verification`
* Select one package
* Select at least one add-on if available
* Submit the form
* Capture public reference displayed after submission

If browser automation is unavailable, instruct the user to submit the payload manually and then proceed to Supabase verification after they confirm submission.

A UI success state alone is not enough. Supabase rows must be verified.

## Stage 4: Supabase Verification

Verify both core writes and relationship integrity.

Core tables:

* `leads`
* `service_requests`
* `dd_estimates`

Junction / child tables:

* `dd_estimate_packages`
* `dd_estimate_addons`

Optional workflow table:

* `dd_followup_tasks`

Run targeted queries for the test marker.

Core lead check:

```sql
select id, full_name, organization_name, phone, email, source_text, status, created_at
from public.leads
where full_name = 'DDOS Test Lead'
order by created_at desc
limit 10;
```

Service request check:

```sql
select id, lead_id, service_category, service_needed, status, priority, quote_amount, created_at
from public.service_requests
where service_needed ilike '%PR #%DDOS preview verification%'
order by created_at desc
limit 10;
```

Estimate check:

```sql
select id, public_reference, lead_id, service_request_id, division_slug, estimate_status,
       base_subtotal, addon_subtotal, rush_fee, estimated_total, deposit_due, created_at
from public.dd_estimates
where client_name = 'DDOS Test Lead'
order by created_at desc
limit 10;
```

Relational integrity check:

```sql
select 
  l.id as lead_id,
  sr.id as request_id,
  est.id as estimate_id,
  est.public_reference,
  count(distinct pkg.id) as package_mappings,
  count(distinct addn.id) as addon_mappings
from public.leads l
left join public.service_requests sr on sr.lead_id = l.id
left join public.dd_estimates est on est.service_request_id = sr.id
left join public.dd_estimate_packages pkg on pkg.estimate_id = est.id
left join public.dd_estimate_addons addn on addn.estimate_id = est.id
where l.full_name = 'DDOS Test Lead'
group by l.id, sr.id, est.id, est.public_reference
order by max(l.created_at) desc;
```

Hard failure conditions:

* No lead row created
* Lead exists but no service request
* Service request exists but no estimate
* Estimate exists but no public reference
* Estimate exists but no package row
* Add-on was selected but no add-on row exists
* Orphaned estimate without lead or service request
* Any RLS, foreign key, null constraint, or missing-column error
* Vercel preview points to the wrong Supabase project
* Browser success state appears but database rows are missing

## Common Supabase Error Codes

Use these codes when interpreting Supabase/Postgres errors:

* `42501`: RLS or permission violation
* `42703`: missing column
* `23502`: null constraint violation
* `23503`: foreign key violation
* `23505`: unique constraint violation
* `22P02`: invalid input syntax, often bad UUID or type mismatch
* `42P01`: undefined table

## Stage 5: Final Report Format

Always produce a structured Deployment & Intake Health Report.

Include:

1. Current Status
2. GitHub Findings
3. Vercel Findings
4. Browser Test Findings
5. Supabase Findings
6. Relational Integrity Results
7. Blockers
8. Prioritized Fix List
9. GO/NO-GO Recommendation
10. Exact Next Action

Use binary merge language:

* `GO` only if GitHub, Vercel, browser test, Supabase writes, public reference, and relational integrity all pass.
* `NO-GO` if any required verification is missing, blocked, or failed.
* `HOLD` if the environment prevents verification.

## Merge Rules

Never recommend merging an intake, Supabase, payment, auth, or deployment PR if:

* Preview was not tested
* Supabase rows were not verified
* Public reference was not confirmed
* Junction integrity was not checked
* Environment variables are unverified
* RLS or schema errors are unresolved

For Dani Declares DDOS work, revenue path beats architecture polish. Keep analytics, dashboard abstractions, and portal expansion parked until the active intake PR is verified.

## Recommended Fix Ordering

When a write fails, inspect in this order:

1. Vercel Preview environment variables
2. Browser console/network response
3. Supabase RLS policies
4. Schema drift / missing columns
5. Foreign keys and null constraints
6. Application code in `ddosIntake.js`

Do not start by rewriting code unless the error proves code is the problem.

## Output Tone

Be direct, operational, and merge-focused.

Do not overstate success.

Say clearly what was verified, what failed, and what remains unverified.
