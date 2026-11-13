# AI-agent visitor policy: implementation boundary (2026-11-13)

This is a tested policy decision module, not a deployed bot-detection service. It is isolated from the #714/#715/#716 release and does not change production traffic.

- Public GET/HEAD/OPTIONS remains accessible to humans and AI assistants.
- Client-controlled headers and User-Agent do not establish verified agent identity.
- Only a trusted server-side verifier's validated signature, expiration, and subject may classify an agent as verified. Classification never grants customer authentication, pricing authority, checkout access, or inquiry permission.
- State-changing requests require existing application authorization. Sensitive routes always require verification.
- Trusted high-risk scores produce a limit decision; verified abuse can produce block. Untrusted scores are not grounds for blocking.
- The module returns decisions but does not yet enforce rate limits, block traffic, collect identification events, or prove agent identity.

## Before runtime enforcement

1. Identify actual ingress and an approved verifier, if any; verify signatures, freshness, replay protection and key rotation. Do not invent Muse identification signals.
2. Preserve existing anti-abuse, authentication, payment and quote controls, including CH05 procurement-only payment rules.
3. Add durable privacy-limited audit events and shared-store rate limiting (not per-instance memory).
4. Roll out with observe-only telemetry, false-positive review, then scoped enforcement with owner approval. Test human, unknown agent, spoofed header, verified agent and verified abuse against real handlers.
5. Reconcile open PR overlap before modifying the shared API router or Vercel edge settings. Obtain separate governed Production approval.

Test command: node --test tests/agentTrafficPolicy.test.cjs.