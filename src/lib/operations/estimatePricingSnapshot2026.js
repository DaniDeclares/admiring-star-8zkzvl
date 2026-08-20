import { connectRequestToPricing, SNAPSHOT_VERSION } from './pricingConnector2026.js';

/**
 * Build the pricing portion of an estimate without performing any arithmetic
 * outside the canonical resolver. The returned object is safe to persist in
 * dd_estimates.intake_answers.pricingSnapshot during the schema transition.
 */
export function buildEstimatePricingSnapshot(serviceRequest = {}) {
  const propertyDetails = serviceRequest.property_details || {};
  const routing = propertyDetails.operationsRouting || {};
  const serviceId = propertyDetails.pricingServiceId || null;

  const resolution = connectRequestToPricing({
    channelType: routing.channel,
    serviceId,
    propertyDetails,
  });

  return {
    snapshotVersion: SNAPSHOT_VERSION,
    capturedAt: new Date().toISOString(),
    pricingStatus: resolution.pricingStatus,
    resolvedChannel: resolution.resolvedChannel,
    resolverChannel: resolution.resolverChannel || null,
    resolvedOfferId: resolution.resolvedOfferId || null,
    baseAmount: resolution.baseAmount ?? null,
    unit: resolution.unit || null,
    transactionType: resolution.transactionType || null,
    wholesaleCost: resolution.wholesaleCost ?? null,
    disclaimerId: resolution.disclaimerId || null,
    modifierContext: resolution.modifierContext || null,
    reason: resolution.reason || null,
  };
}

/**
 * Merge a frozen pricing snapshot into the existing dd_estimates intake_answers
 * JSON column without disturbing unrelated intake data.
 */
export function hydrateEstimateIntakeAnswers(intakeAnswers = {}, snapshot) {
  return {
    ...intakeAnswers,
    pricingSnapshot: snapshot,
  };
}
