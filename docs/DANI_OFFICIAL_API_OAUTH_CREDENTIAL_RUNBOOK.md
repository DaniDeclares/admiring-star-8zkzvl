# DANI DECLARES — Official API / OAuth Credential Runbook

Owner front door: https://danideclares.com
Production callback base: https://danideclares.com/api/integrations/

## Shared secret rule
Never paste client secrets, access tokens, refresh tokens, webhook signing secrets, or private keys into chat, Notion, Asana, GitHub, or source files. Enter them directly into the production secret/deployment system. The repo records variable names only.

## 1. Asana — OAuth 2.0

Create a custom Asana app in the Asana Developer Console. Asana's current OAuth flow is authorization-code based. Register the exact HTTPS redirect URL:

https://danideclares.com/api/integrations/asana/callback

Initial least-privilege scopes for DANI's first release:

projects:read tasks:read tasks:write users:read

Add additional write scopes only when a tested DANI workflow actually needs them. The authorization endpoint is https://app.asana.com/-/oauth_authorize and token exchange is https://app.asana.com/-/oauth_token.

Store:
- ASANA_CLIENT_ID
- ASANA_CLIENT_SECRET
- ASANA_REDIRECT_URI

DANI behavior:
- Asana task/project IDs are stored as external references.
- DANI does not copy the entire task database into Supabase merely for convenience.
- Asana remains the execution/release authority.

## 2. Notion — choose the correct official connection type

For DANI's single owner workspace, the simplest official architecture is an internal connection. Create an internal connection in Notion's Developer portal, associate it with the DANI workspace, then share the relevant DANI parent pages/databases with that connection. Store its installation token only server-side as NOTION_TOKEN.

Use public Notion OAuth only when DANI needs other Notion workspaces/users to install the integration. For that model, register:

https://danideclares.com/api/integrations/notion/callback

Store:
- NOTION_OAUTH_CLIENT_ID
- NOTION_OAUTH_CLIENT_SECRET
- NOTION_OAUTH_REDIRECT_URI

Notion's current API version is 2026-03-11. Public connections exchange an authorization code at https://api.notion.com/v1/oauth/token and receive access/refresh tokens. Internal connections use a static installation access token. Tokens must remain out of source control.

## 3. QuickBooks Online — OAuth 2.0

Create an app in the Intuit Developer Portal and use OAuth 2.0 for QuickBooks Online. Register the exact production redirect URL:

https://danideclares.com/api/integrations/quickbooks/callback

Use the QuickBooks Online accounting API scope needed by the app: com.intuit.quickbooks.accounting. Keep sandbox and production credentials/environment separation explicit.

Store:
- QUICKBOOKS_CLIENT_ID
- QUICKBOOKS_CLIENT_SECRET
- QUICKBOOKS_REDIRECT_URI
- QUICKBOOKS_ENVIRONMENT

DANI behavior:
- QuickBooks remains accounting authority for actual revenue, expenses, AR/AP and financial reports.
- Stripe remains payment/invoice-event authority.
- Never infer accounting truth from a sales CRM record alone.

## 4. Google Voice — important boundary

DANI should not build against undocumented Google Voice web endpoints. Current Google documentation supports making and receiving calls through voice.google.com and the Voice app. Google also documents SIP Link for eligible Google Voice Standard/Premier environments, using a certified Session Border Controller, and says some forwarding scenarios to automated systems are unsupported.

Path A — retain Google Voice now: keep the Voice browser/app as the call interface and add a DANI HQ Call Intake workspace that logs caller identity, channel, requested service, scope, timing, outcome and follow-up into DANI. This gives DANI operational visibility without pretending Google Voice is an API platform.

Path B — programmable telephony: deliberately select a programmable business telephony/SIP provider or qualify a Google Voice SIP Link architecture. Only then add provider credentials and browser/WebRTC calling to DANI. Do not port the business number ending in 7173 until the provider, number portability, SMS behavior, emergency calling, recording rules and migration plan have been validated.

## 5. DANI connection storage model

Use the existing DANI integration tables:
- dd_integration_adapters
- dd_integration_connections
- dd_external_record_links
- dd_integration_event_log

Connection status should remain NOT_CONNECTED or PENDING until real provider authorization and a safe read test succeed. Every external record should link back to a DANI canonical record where applicable.

## 6. Production callback checklist

1. Provider app exists and is restricted to the intended workspace/account.
2. Exact HTTPS redirect URL matches provider configuration.
3. Credentials are stored server-side only.
4. OAuth state is generated, tied to the authenticated DANI owner session, and validated on callback.
5. Authorization code is exchanged server-side.
6. Tokens are stored through the approved secret/credential path.
7. A safe read test succeeds.
8. A controlled write test is performed only where intended.
9. External IDs are linked to DANI canonical IDs.
10. Event/sync outcome is logged.
11. Reauthorization/revocation behavior is tested.
12. Vercel production deployment and runtime logs are checked.

## 7. Credentials that still require Danielle's secure action

The DANI codebase can provide callback endpoints, validation, storage and sync logic, but the actual provider secrets belong to the connected accounts and must be entered through the provider/deployment interfaces. Do not send those values through ChatGPT.