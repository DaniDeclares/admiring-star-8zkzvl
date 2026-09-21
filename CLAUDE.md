# Claude instructions for DANI DECLARES

Follow AGENTS.md first. This repository is shared with other AI agents and the owner.

## Before coding
- Fetch current main and inspect relevant open PRs before touching files.
- Read the DANI Connected Systems & Authority Matrix in Notion before changing cross-system architecture.
- Determine the owning authority for every piece of data you touch.
- Prefer additive changes, adapters, links, and migrations over replacements.

## Branch policy
- Use a dedicated feature branch for the task.
- Do not work directly on main for ordinary changes.
- Open a PR with a precise title and summary of affected files.
- Never force-push over another agent's branch.
- If another open PR touches the same file, reconcile first.

## Integration policy
- Reuse DANI's existing dd_integration_adapters, dd_integration_connections, dd_external_record_links, and dd_integration_event_log infrastructure rather than inventing a parallel registry.
- External IDs are references; DANI canonical IDs remain authoritative.
- Never commit secrets. Client secrets, access tokens, refresh tokens, signing secrets, and private keys stay server-side.
- OAuth callbacks must validate state and use HTTPS in production.

## Release policy
- Do not merge or declare production-ready merely because a page renders.
- Run relevant tests/build and inspect the Vercel deployment for the exact commit.
- If a change alters pricing, legal/compliance, procurement, certification, or other business rules, stop and flag it for owner review.

## Shared workspaces
Asana = execution/release tasks. Notion = operating documentation/control knowledge. Supabase = runtime/business data. Airtable = governance/economics/reference. HubSpot = CRM. Stripe = payment authority. DANI HQ is the operator front door, not a replacement authority for those systems.
