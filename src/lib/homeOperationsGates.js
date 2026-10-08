// Pure, fail-closed eligibility rules for existing DANI workflow workers.
// No messages, invoices, dispatches, or payments are performed by this module.
export const cadence = Object.freeze({
  daily: ['scheduled_post_9am','rank_verified_buyer_followups','collect_or_advance_payment','owner_attention_exceptions'],
  weekly: ['batch_original_content','review_consent_to_payment_conversion','repair_one_verified_bottleneck','reconcile_collections_and_margins'],
  monthly: ['reconcile_collected_revenue','review_converting_services','improve_existing_approved_offer','review_capacity_and_family_time']
});
const yes = x => x === true;
export function onboardingEligibility(input = {}) {
  const blocked = [];
  if (!yes(input.verifiedBuyerAcceptance)) blocked.push('UNVERIFIED_ACCEPTANCE');
  if (!yes(input.approvedSellableSku)) blocked.push('SKU_NOT_APPROVED_SELLABLE');
  if (!yes(input.scopeConfirmed)) blocked.push('SCOPE_NOT_CONFIRMED');
  if (yes(input.agreementRequired) && !yes(input.agreementSigned)) blocked.push('AGREEMENT_UNSIGNED');
  if (yes(input.paymentRequiredBeforeWork) && !yes(input.paymentVerified)) blocked.push('PAYMENT_UNVERIFIED');
  if (yes(input.accessRequired) && !yes(input.accessAuthorized)) blocked.push('ACCESS_UNAUTHORIZED');
  if (yes(input.providerRequired) && !yes(input.providerQualified)) blocked.push('PROVIDER_NOT_QUALIFIED');
  if (yes(input.cancelled) || yes(input.noRecontact)) blocked.push('CANCELLED_OR_NO_RECONTACT');
  const ready = blocked.length === 0;
  return {
    ready,
    blocked,
    welcomeEligible: ready && yes(input.communicationAuthorized) && !yes(input.welcomeAlreadySent),
    assignmentEligible: ready && yes(input.schedulingConfirmed),
    monthlyReportEligible: ready && yes(input.recurringAgreement) && yes(input.reportingAuthorized) && yes(input.reportEvidenceComplete)
  };
}
export function contentReleaseEligibility(input = {}) {
  const blocked = [];
  if (!yes(input.originalOrLicensed)) blocked.push('RIGHTS_UNVERIFIED');
  if (!yes(input.approvedClaim)) blocked.push('CLAIM_NOT_APPROVED');
  if (!yes(input.noPrivateCustomerData)) blocked.push('PRIVACY_RISK');
  if (!yes(input.scheduledThroughExistingEngine)) blocked.push('NO_EXISTING_SCHEDULE');
  if (!yes(input.channelAuthorized)) blocked.push('CHANNEL_NOT_AUTHORIZED');
  return { ready: blocked.length === 0, blocked };
}
