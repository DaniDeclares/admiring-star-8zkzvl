# DANI Business OS tenant isolation release gate

Review only. Do not deploy to Production.

Tester evidence on October 10: 62 sales queue rows, all with NULL created_by, and no active organization-bound portal identities. Existing sales records must remain unassigned until authoritative ownership evidence exists.

The additive migration introduces nullable CRM organization ownership and customer-specific SELECT policies using the verified JWT identity and an active organization membership. It preserves staff/provider rules and introduces no customer write, action, dispatch or storage access.

Tester proof requires two distinct signed-in users with explicitly approved active organization memberships, an owned CRM row and job for each, and authorized access to each user's own records with denial for the other user's records. Run PR #627's read test and add negative tests for revoked memberships, outbound API actions, file downloads and writes. Deny-all is not a pass.

Reconcile _portalAuth.js single-identity selection before supporting users with multiple customer organization memberships. Existing client organizations must not be treated as licensed SaaS tenants without explicit onboarding and eligibility.

No automatic backfill. No Production deployment or paid onboarding before isolation, API and storage proof.
