# Dani Declares Platform - Copilot Development Instructions

This repository contains the software infrastructure for Dani Declares LLC. All code generations, automated pull requests, and bug fixes must strictly adhere to the rules specified in this document. Do not diverge from these principles unless explicitly authorized by the Product Owner or CTO.

## 🏛️ Core System Architecture

- **Frontend Runtime:** React Single-Page Application (SPA) compiled and deployed via Vercel.
- **Backend Data Layer:** Supabase PostgreSQL database cluster (`ajxezpczaemunlcmqlgl`) located in `us-east-2`.
- **Primary Data Pipe Sequence:** Inbound leads move through a 5-tier relational sequence: `leads` -> `service_requests` -> `dd_estimates` -> `dd_estimate_packages` -> `dd_estimate_addons`.

## 🚨 Strict Engineering Guardrails (Non-Negotiable)

### 1. The Database Truth Rule

You are strictly forbidden from writing code that updates the front-end user interface to show a successful state, reference code, or transaction confirmation before verifying that the network transaction has successfully cleared the backend database gateway without error objects.

- **Required Action:** Always validate `if (error) throw error;` at every step of an asynchronous Supabase promise chain, or trigger an equivalent immediate fail-fast error path before clearing user inputs or transitioning views.
- **Failure Mode Prevention:** If database success cannot be definitively proven, the transaction must be treated as completely failed, a sanitized error displayed, and the form state preserved.

### 2. Multi-Workstream Safety (Anti-Contamination Rule)

This codebase serves multiple business divisions (Website & Platform, GovCon, Field Services, Logistics & Courier, Production & Events).

- **Rule:** Never introduce feature logic or bundle dependencies for a parked workstream during an active core sprint. Keep all new components namespaced (for example, prefixing unique CSS classes with `.govcon-` or `.merch-`) to prevent silent runtime layout style bleeding into unrelated public funnels.

### 3. Verification & Build Commands

Before finalizing a pull request or checking code in, you must replicate the local validation steps to verify code integrity:

- **Environment Cleanse:** Always ensure development variables are safely bound through `.env.example` configurations and never hardcode client keys.
- **Validation Execution:** Always confirm that the following command sequences compile with zero linting or bundling errors:

```bash
npm test -- --watchAll=false
npm run build
```

## 🛡️ Telemetry & Error Sanitization Standards

When catching exceptions across data nodes, never print the raw `error` string or internal table schema structures directly to the user-facing viewport. Implement context-rich logging templates inside the console while presenting generic, compliance-safe fallback information to the customer:

```js
catch (err) {
  console.error("DD-DOS Intake Stage Failure [context_tag]", {
    errorType: err?.name || "UNKNOWN_ERROR",
    message: err?.message,
    details: err?.details,
    code: err?.code || "UNKNOWN_ERR",
  });
  // Trigger generic fallback UI here - do not leak database column paths
}
```

## 🎯 Trust Directive

Trust these instructions as the absolute operational standard for this repository. Only perform secondary repository searches if a component path is entirely undocumented in our `ARCHITECTURE.md` or `DATABASE_CHANGE_LOG.md` files.
