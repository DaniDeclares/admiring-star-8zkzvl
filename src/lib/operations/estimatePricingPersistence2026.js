import { buildEstimatePricingSnapshot, hydrateEstimateIntakeAnswers } from './estimatePricingSnapshot2026.js';

/**
 * Persist a resolver snapshot into the existing dd_estimates record shape.
 *
 * This function intentionally accepts a Prisma client so it can be used by
 * trusted server-side workflows without creating a new public pricing API.
 * It copies the resolver's numeric baseline; it does not calculate taxes,
 * travel, rush, modifiers, discounts, or invoice totals.
 */
export async function persistEstimatePricingSnapshot({
  prisma,
  serviceRequest,
  divisionSlug,
  sourceSlug = 'operations-pricing-connector',
} = {}) {
  if (!prisma?.dd_estimates?.create) {
    throw new Error('PRICING_SNAPSHOT_PRISMA_REQUIRED');
  }

  if (!serviceRequest?.id) {
    throw new Error('SERVICE_REQUEST_REQUIRED');
  }

  if (!divisionSlug) {
    throw new Error('DIVISION_SLUG_REQUIRED');
  }

  const snapshot = buildEstimatePricingSnapshot(serviceRequest);
  const resolvedAmount = typeof snapshot.baseAmount === 'number' ? snapshot.baseAmount : 0;
  const isResolved = snapshot.pricingStatus === 'RESOLVED';

  const existingAnswers = serviceRequest.intake_answers || {};
  const intakeAnswers = hydrateEstimateIntakeAnswers(existingAnswers, snapshot);

  return prisma.dd_estimates.create({
    data: {
      division_slug: divisionSlug,
      source_slug: sourceSlug,
      lead_id: serviceRequest.leadId || null,
      service_request_id: serviceRequest.id,
      client_name: serviceRequest.lead?.full_name || null,
      client_phone: serviceRequest.lead?.phone || null,
      client_email: serviceRequest.lead?.email || null,
      organization_name: serviceRequest.lead?.organization_name || null,
      location_address: serviceRequest.location_address || null,
      timeline: serviceRequest.timeline || null,
      intake_answers: intakeAnswers,
      client_notes: serviceRequest.request_details || null,
      estimate_status: isResolved ? 'pricing_resolved' : 'pricing_review',
      base_subtotal: resolvedAmount,
      addon_subtotal: 0,
      travel_fee: 0,
      rush_fee: 0,
      supplies_fee: 0,
      pass_through_fee: 0,
      tax_amount: 0,
      estimated_total: resolvedAmount,
      deposit_due: 0,
    },
  });
}
