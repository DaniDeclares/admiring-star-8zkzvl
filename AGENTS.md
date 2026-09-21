# DANI DECLARES — Agent Change Control

This repository is the production application for DANI DECLARES LLC. Multiple AI assistants and human contributors may work on it. This is the shared engineering contract.

## Non-overwrite protocol
1. main is production authority. Never treat a stale local copy, chat transcript, generated paste, or cached tool result as newer than GitHub main.
2. Read before write. Before editing a file, fetch the current version and check open pull requests that touch the same file or subsystem.
3. One task = one branch = one PR. Work in a dedicated feature branch. Do not make unrelated edits in another agent's branch.
4. Never directly push production changes to main for ordinary work. Changes go through a pull request and verification.
5. Do not overwrite another agent's work. If the target file has changed since the branch started, reconcile with the latest main first.
6. Open PR overlap rule. If another open PR changes the same file, stop and reconcile the two changes before modifying that file.
7. Database-first rule. Locate the authoritative record and owning system before creating or changing runtime/business data.
8. External-system authority. Supabase owns DANI runtime state; GitHub owns source/migrations/tests/config; Vercel owns deployment/runtime; Stripe owns payment/invoice/payment events; HubSpot owns CRM accounts/contacts/deals; Airtable owns governance/economics/reference analysis; Notion owns operating documentation/control knowledge; Asana owns human execution/release tasks.
9. API credentials are secrets. Never commit client secrets, refresh tokens, access tokens, private keys, webhook signing secrets, or passwords. Use Vercel/server environment variables or an approved secret store. Never ask the owner to paste a secret into chat when a secure entry point is available.
10. Production verification is mandatory. After a production-affecting change, verify CI, Vercel deployment state, and relevant runtime behavior before declaring green.

## DANI business rules
- A capability is not automatically a sellable service.
- Service/SKU, price, scope, provider authorization, SLA, compliance state, payment state, and release state stay governed by DANI's canonical runtime architecture.
- External tools are rails. They do not become DANI commercial authority merely because they contain a duplicate record.
- Do not silently change pricing, legal/compliance language, procurement eligibility, certifications, or government-facing claims. Surface these for review.

## Agent handoff standard
Every non-trivial change should leave a durable trail in the PR and, where useful, in the DANI Notion authority matrix. State what changed, files/subsystems touched, assumptions, tests/deployments observed, and any permissions still required.

## Claude
Claude is an authorized engineering collaborator, not a separate source of truth. Claude must follow this file and CLAUDE.md and consult the DANI Notion authority matrix before creating a new integration, database, project, or documentation system.
