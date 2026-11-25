# DANI DECLARES — Provider/Fulfillment P0 Alignment

## Canonical architecture

Public provider recruitment uses the current provider application model. The provider network is fulfillment infrastructure, not a commercial channel.

Provider lifecycle:

Application → Identity → Capability Selection → Requirements/Documents → Qualification → Compliance → Agreement → Capability Authorization → Provider Activation → Capacity/Availability → Dispatch Eligibility.

Fulfillment lifecycle:

Commercial Authority → Authorized Work → Work Order → Job → Assignment → Provider → Execution → Evidence/QA → Settlement.

## Changes applied

1. Request-to-work-order creation now enters the actual FOS lifecycle at `INSTANTIATED`, not the invalid `DRAFT` state.
2. Automated dispatch remains service-role only and requires current provider activation gates.
3. Provider capability must be authorized for the specific service before automated dispatch can offer work.
4. Historical/legacy provider-intake data is preserved; the newer provider application model is the canonical recruitment path.

## Intentional non-changes

- No sixth commercial channel was created.
- No replacement provider directory was created.
- No duplicate work-authorization table was created without first proving an existing object could not support the role.
- Provider payout/economic data remains private.
- No provider was artificially activated for testing.

## Verification target

An approved provider should progress through capability authorization and capacity activation, then become eligible for a real work offer. Until those gates are satisfied, dispatch must fail closed.


## Staff provider-application review surface (source-level handoff; not live acceptance)

- Public canonical provider application URL: `https://danideclares.com/providers`. `/connect` remains the broader multi-audience gateway, whose independent-provider option links to `/providers`. These are not competing provider applications.
- Authorized staff review surface: `/portal/provider-approval` (`src/pages/portal/ProviderApprovalPage.jsx`), guarded by `RequireStaffAuth`. The screen calls the `provider-application-review` Supabase Edge Function with `action: 'list'` and presents applications, selected capabilities and reviewable documents. Server-side authorization in `supabase/functions/provider-application-review/index.ts` requires a valid Supabase user token and one of the staff roles in the user's **app_metadata** (`admin`, `owner`, `staff_admin`, `staff`); requests without valid authorization return 401 or 403. A UI guard alone is not a server authorization test.
- Owner HQ navigation fix is **committed but not deployed/accepted**: `fix/owner-hq-provider-review-link-20261114` at `ca7e4899d31c3d1f8c392f17aa426d6cb29721bd` changes the “Providers” link from `/portal/providers` (public access flow) to `/portal/provider-approval`. Do not treat the branch as Production behavior.
- The signup page calls `dd_create_provider_intake_staging` **before** Supabase `auth.signUp`; `dd_provider_intake_staging` has statuses `pending`, `consumed`, `expired` and a seven-day default expiration. The SQL upserts by normalized email **only while pending**. After authenticated confirmation/sign-in, `dd_consume_provider_intake_staging` checks the authenticated email, atomically claims a pending row and creates or reuses an applicant-linked `dd_provider_applications` record (new record status `SUBMITTED`) and capabilities; a previously consumed intake can return an existing identity. See `supabase/migrations/20260919141500_provider_intake_staging_and_identity_grant_hardening.sql`, `src/lib/pendingOnboarding.js`, `src/pages/PortalAccessPage.jsx`. These are **source-level** behaviors, not a proven deployed applicant journey.
- For a recorded application, the staff Edge Function allows `set_review_status` values `UNDER_REVIEW`, `NEEDS_INFO`, `REJECTED`; `approve_and_activate` delegates to the existing `dd_approve_provider_application` database RPC. The function also supports bounded capability, document, background and compliance review actions. The function does **not** itself constrain `set_review_status` by previous application status; do **not** infer a complete allowed transition graph or permit staff to bypass the underlying database authorization/activation gates. Application registration, qualification, approval, capacity and dispatch eligibility remain separate, and work is never guaranteed.
- Recovery evidenced in source: a pending signup can be resumed by an authenticated session with matching email (even if the original confirmation query string is unavailable); repeat pending submissions refresh the row; a concurrent duplicate consumption is guarded by its atomic pending-to-consumed claim. An expired/missing/mismatched row returns a distinct no-attempt result unless a linked identity already exists. Signup errors display actionable sign-in/password-reset or rate-limit guidance. The actual failure-to-recovery, duplicate-account and cross-browser behavior still require synthetic tests. Never represent a `pending` intake as a completed `SUBMITTED` application without successful consumption.
- **Pending E2E acceptance:** in an explicitly approved isolated environment with synthetic applicant and authorized/unauthorized staff identities, prove pre-auth intake, email confirmation or documented retry, one durable application, review-list visibility, unauthorized denial, truthful status, applicable document/capability gates, and cleanup. No Production or Tester submissions by implication. Existing QA owner: [Customer / Client Portal E2E QA](https://app.asana.com/1/1218540418974397/task/1218706508620155). Any governed process amendment and release acceptance remain separate from this source-only documentation update.
