/**
 * DANI-owned, reusable sales-workflow decision policy.
 * Pure decision helper: does not send messages, move money, alter CRM records or create jobs.
 * Tenant scope MUST be verified by the caller against authenticated organization membership.
 */
export const WORKFLOW_ACTION = Object.freeze({
  INTERNAL_REVIEW: 'INTERNAL_REVIEW',
  PREPARE_FOLLOWUP: 'PREPARE_FOLLOWUP',
  SEND_OUTREACH: 'SEND_OUTREACH',
  ISSUE_QUOTE: 'ISSUE_QUOTE',
  CHARGE_PAYMENT: 'CHARGE_PAYMENT',
  ASSIGN_JOB: 'ASSIGN_JOB',
});

const OUTBOUND = new Set(['SEND_OUTREACH']);
const APPROVAL = new Set(['SEND_OUTREACH', 'ISSUE_QUOTE', 'CHARGE_PAYMENT', 'ASSIGN_JOB']);
const REQUIRED = Object.freeze({
  SEND_OUTREACH: ['contactAuthority', 'ownerApproved'],
  ISSUE_QUOTE: ['sellableOffer', 'ownerApproved'],
  CHARGE_PAYMENT: ['paymentAuthorization', 'ownerApproved'],
  ASSIGN_JOB: ['providerEligible', 'jobAuthorized', 'ownerApproved'],
});
const validId = value => typeof value === 'string' && value.trim().length > 0;

/**
 * Evaluate a candidate action without ever performing it.
 * Organization IDs are opaque; caller must validate authenticated tenant scope.
 * Unknown values/absent evidence fail closed. Research-only contacts are not buyers.
 */
export function evaluateSalesAutomationAction(candidate, context = {}) {
  const action = candidate?.action;
  const tenantId = candidate?.tenantId;
  const recordTenantId = candidate?.recordTenantId;
  const source = candidate?.source;
  const evidence = candidate?.evidence || {};
  const reasons = [];
  if (!Object.values(WORKFLOW_ACTION).includes(action)) reasons.push('UNKNOWN_ACTION');
  if (!validId(tenantId) || !validId(recordTenantId) || tenantId !== recordTenantId ||
    context.authenticatedTenantId !== tenantId) reasons.push('TENANT_SCOPE_NOT_VERIFIED');
  if (context.identityAuthorized !== true) reasons.push('IDENTITY_NOT_AUTHORIZED');
  if (evidence.doNotContact === true || evidence.relationshipHold === true ||
      evidence.bounced === true) {
    if (OUTBOUND.has(action)) reasons.push('CONTACT_SUPPRESSED');
  }
  if (OUTBOUND.has(action) && (source === 'RESEARCH_ONLY' || source === 'UNKNOWN' ||
    !validId(source) || evidence.contactAuthority !== true)) reasons.push('NO_CONTACT_AUTHORITY');
  if (APPROVAL.has(action)) {
    for (const field of REQUIRED[action] || []) {
      if (evidence[field] !== true) reasons.push('MISSING_' + field.toUpperCase());
    }
  }
  // No workflow may infer collected revenue from a CRM deal or quote.
  if (candidate?.claimsCollectedRevenue === true && evidence.verifiedPaymentReceipt !== true) {
    reasons.push('PAYMENT_RECEIPT_REQUIRED');
  }
  return Object.freeze({
    allowed: reasons.length === 0,
    reasons: Object.freeze([...new Set(reasons)]),
    action,
    tenantId: validId(tenantId) ? tenantId : null,
    effect: 'DECISION_ONLY_NO_MUTATION',
  });
}

export function evaluateSalesAutomationBatch(candidates, context) {
  if (!Array.isArray(candidates)) throw new TypeError('candidates must be an array');
  return candidates.map(candidate => evaluateSalesAutomationAction(candidate, context));
}
