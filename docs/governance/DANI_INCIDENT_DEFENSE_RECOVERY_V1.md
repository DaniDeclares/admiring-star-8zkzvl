# DANI Incident Defense & Recovery v1

Status: bounded defensive security capability. This extends existing DANI observability/governance; it does **not** create a second Brain, governor, scheduler, or retaliation system.

## Mission

Give DANI an immune-system response for cyber incidents:

**Detect → Verify → Contain → Protect → Investigate → Recover → Learn**

The objective is continuity, evidence preservation, least-privilege containment, owner visibility, and safe recovery.

## Hard boundary

DANI must never automatically or manually through this rail:
- DDoS or flood another system;
- compromise, scan, exploit, scrape private data from, or disrupt suspected attackers;
- deploy botnets, malware, credential attacks, or hack-back tooling;
- treat an attacking IP as proof of the human attacker’s identity.

Suspected malicious infrastructure is evidence. Containment applies to DANI-controlled systems and authorized provider controls only.

## Existing machinery to reuse

History-first audit found existing building blocks on canonical `main`:
- browser and server Sentry capture (`src/lib/sentry.js`, `src/lib/serverSentry.js`);
- Sentry exception capture in portal/API handlers;
- PostHog instrumentation;
- Vercel as production hosting authority;
- Supabase Auth, RLS, portal authorization and governed RPCs;
- Owner Attention / Exception Center / Owner HQ patterns;
- integration operating registry;
- governed release and Production verification machinery.

Therefore v1 is a contract and routing layer around those controls, not a replacement observability stack.

## Incident classes

- `AUTH_ABUSE`: credential stuffing, repeated failed authentication, OTP/reset abuse, impossible account behavior.
- `TRAFFIC_ABUSE`: request storms, bot/flood patterns, unusual endpoint concentration.
- `AUTHORIZATION_VIOLATION`: denied cross-account/provider/customer access or suspicious privileged calls.
- `DATA_EXPOSURE_SIGNAL`: evidence suggesting unintended data visibility or extraction.
- `SECRET_EXPOSURE`: leaked credential/token/key or accidental secret publication.
- `DEPLOYMENT_INTEGRITY`: unexpected deploy, commit/runtime mismatch, unauthorized configuration drift.
- `PAYMENT_WEBHOOK_ABUSE`: replay, signature failure, abnormal webhook volume or payment-state inconsistency.
- `DEPENDENCY_SUPPLY_CHAIN`: vulnerable or compromised dependency/build artifact signal.
- `AVAILABILITY_DEGRADATION`: service instability correlated with abuse or anomalous load.

## Severity

- `INFO`: evidence retained; no material effect.
- `LOW`: suspicious but contained/no protected resource affected.
- `MEDIUM`: credible abuse affecting a bounded surface; automated safe containment may execute.
- `HIGH`: material account/data/payment/availability risk; Owner HQ attention required.
- `CRITICAL`: confirmed or strongly evidenced compromise, material data exposure, privileged secret exposure, or widespread outage; fail closed where safe and require owner/human incident response.

## Evidence envelope

Every security signal should normalize to:
- event id / correlation id;
- observed_at;
- environment (Preview/Tester/Production);
- source system (Vercel/Supabase/Sentry/GitHub/Stripe/application/etc.);
- incident class + severity;
- affected surface;
- actor/user/provider/customer id only when lawfully known from DANI's own records;
- network indicators when supplied by authorized logs (never treated as identity proof);
- request/deploy/commit/session identifiers where available;
- evidence references, not copied secrets;
- containment state;
- customer/provider/payment/data impact assessment;
- owner action required;
- recovery/proof state.

Do not store passwords, raw secret keys, full payment credentials, or unnecessary personal data in incident evidence.

## Safe automated containment allowlist

Automations may only perform previously authorized, reversible defensive actions against DANI-controlled resources, such as:
- reject invalid authentication/authorization requests;
- honor platform/provider rate limits and bot protections;
- fail closed on invalid webhook signatures or replay/idempotency failures;
- stop a governed worker/action when its authorization/evidence contract fails;
- quarantine a DANI-owned execution candidate or promotion when integrity proof fails;
- mark a security incident for Owner Attention;
- preserve identifiers/evidence needed for investigation;
- keep Production unchanged when deployment/runtime proof fails.

Credential rotation, account disabling, destructive data mutation, customer/provider suspension, firewall/network rule mutation, payment freezes, or broad Production shutdown require explicit authority unless an existing narrowly scoped policy already authorizes that exact action.

## Owner HQ incident card

Owner-facing security cards should answer, in plain language:
- What happened?
- When did it start / last occur?
- What DANI surface is affected?
- Is there evidence of customer/provider/personal data exposure?
- Are payments affected?
- Is Production stable?
- What was contained automatically?
- What evidence was preserved?
- What action, if any, does the owner need to take?
- What proof is required before closure?

`NO EVIDENCE DETECTED` must never be rendered as `NO EXPOSURE` unless investigation actually proves that stronger claim.

## Recovery gate

An incident closes only after:
1. signal has stopped or is controlled;
2. affected credentials/sessions/configuration are addressed where applicable;
3. authorization/data integrity is checked;
4. service health is restored;
5. exact Production runtime/deploy state is verified;
6. evidence and decisions are durable;
7. any genuinely missing preventive control is routed through normal engineering governance.

## Learning

Post-incident learning may feed Baby/Brain with sanitized evidence and conclusions: trigger/cause, detection/containment controls, missing controls, recovery timing, recommended preventive change, confidence, and unresolved questions. Learning cannot itself authorize retaliation, outbound contact, pricing, hiring, spending, or Production mutation.

## Proof requirements

Before calling v1 operationally green:
- verify existing Sentry browser/server capture is wired in current deployment;
- verify Supabase Security Advisor findings are triaged rather than mass-fixed;
- verify portal/auth ownership controls still fail closed;
- verify payment/webhook signature + idempotency controls;
- verify deployment exact-head/runtime proof;
- exercise a safe synthetic incident in Tester/Preview only (no request flooding/DoS);
- prove the signal reaches the existing owner-attention/exception path or document the bounded missing adapter;
- prove no retaliatory/external offensive action is possible from this rail.
