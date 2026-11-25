'use strict';

// Agent identity is only trusted when verified by a trusted server-side provider.
// Never derive "verified" from User-Agent, X-Agent-Name, or other client headers.
const PUBLIC_READ = new Set(['GET', 'HEAD', 'OPTIONS']);
const SENSITIVE_ROUTES = new Set([
  'create-checkout-session', 'verify-commercial-intent',
  'portal-operations', 'portal-fulfillment-dispatch',
  'provider-accounting', 'provider-routing', 'process-outbox',
  'process-provider-routing', 'stripe-webhook'
]);
function evaluateAgentTraffic({method = 'GET', route = '', identity = {}, risk = {}} = {}) {
  const verb = String(method).toUpperCase();
  const publicRead = PUBLIC_READ.has(verb);
  const sensitive = SENSITIVE_ROUTES.has(route) || route.startsWith('integrations/');
  const verified = identity.source === 'trusted-server-verifier' &&
    identity.signatureValid === true && identity.expiresValid === true &&
    typeof identity.subject === 'string' && identity.subject.length > 0;
  const claimedAgent = identity.claimedAgent === true;
  const score = Number.isFinite(risk.suspectScore) ? risk.suspectScore : null;
  const classification = verified ? 'verified-agent' : claimedAgent ? 'unverified-agent' : 'unknown';
  // A verified agent is not a customer authorization grant.
  // All business authentication, channel pricing, payment, and anti-abuse checks remain in force.
  if (publicRead) return { classification, action: 'allow', reason: 'public-read', sensitive };
  if (sensitive) return { classification, action: 'verify', reason: 'sensitive-action-requires-existing-auth', sensitive };
  if (risk.explicitAbuse === true && risk.abuseEvidenceVerified === true) {
    return { classification, action: 'block', reason: 'verified-abuse', sensitive };
  }
  if (score !== null && score >= 80 && risk.scoreSource === 'trusted-server-verifier') {
    return { classification, action: 'limit', reason: 'high-trusted-risk-score', sensitive };
  }
  return { classification, action: 'verify', reason: 'state-changing-request', sensitive };
}
module.exports = { evaluateAgentTraffic, SENSITIVE_ROUTES };
