# AI Gateway Migration Audit

This audit is staged from the Vercel AI Gateway migration requirements. It is intentionally documentation-only until repository-wide AI call sites and credentials are verified.

## Required inventory
Search all source, tests, server routes, background jobs, cron handlers, and configuration for:

- `openai`, `@ai-sdk/`, `@anthropic-ai/sdk`, `@google/genai`
- `generateText`, `streamText`, `generateObject`, `embed`, `embedMany`, `rerank`, `useChat`
- `baseURL`, `base_url`, `apiKey`, `api_key`
- provider credential environment variables
- OpenRouter, LiteLLM, Portkey, Helicone, direct model API fetches

For each call site record provider, model, modality, streaming, tools, structured output, credential, and persisted-data dependencies.

## Non-negotiable migration rules

1. Keep the existing application protocol and response shapes.
2. Route supported text/tool/structured-output calls through Vercel AI Gateway using `creator/model` IDs.
3. Preserve streaming, tools, schemas, retries, error handling, fallbacks, and provider options.
4. Never expose AI credentials in browser code.
5. Leave embeddings on their current provider unless a reindexing plan is explicitly approved.
6. Do not substitute ambiguous or missing model IDs.
7. Do not change DANI DECLARES pricing, payment, provider authorization, or commercial-gate logic to depend on AI output.
8. AI may assist with reconciliation, search, classification, intake, content, and administrative workflows, but deterministic database rules remain authoritative for commercial eligibility, pricing, checkout totals, payment state, and fulfillment authorization.

## Credential requirements

Use Vercel OIDC when available; otherwise `AI_GATEWAY_API_KEY`. Check presence only and never log or commit secret values.

## Verification requirements

Run formatter, lint, type checks, tests, production build, stale-provider search, and at least one real route per migrated modality. Verify model IDs against the current AI Gateway catalog before changing them.

## Current status

This file is a governance/audit artifact. Repository changes must be made only after the actual call-site inventory is complete and each model is resolved against the current gateway catalog.
