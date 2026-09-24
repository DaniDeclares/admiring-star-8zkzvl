import { createEstimateEconomicsSnapshot, DANI_OWNER_USER_ID } from './estimateAssignments2026.js';

const verifiedEvidence = new Set(['OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED']);

function effective(row, now) {
  const from = row.effective_from ? Date.parse(row.effective_from) : 0;
  const to = row.effective_to ? Date.parse(row.effective_to) : Infinity;
  return Number.isFinite(from) && from <= now && to > now;
}

// Direct CH01 intake freezes a price but does not create the component economics
// needed for paid-first owner routing. Reuse the quote builder's governed
// economics computation before opening checkout; never manufacture a PASS.
export async function ensureOwnerDirectCheckoutEconomics(supabase, { estimate, offer, request, amount }) {
  const { data: rows, error } = await supabase.from('dd_owner_fulfillment_authorizations')
    .select('authorization_status,evidence_status,effective_from,effective_to')
    .eq('owner_user_id', DANI_OWNER_USER_ID)
    .eq('service_id', offer.runtimeServiceId);
  if (error) throw error;
  const ownerAuthorized = (rows || []).some(row =>
    ['ACTIVE','SCOPED'].includes(row.authorization_status)
    && verifiedEvidence.has(row.evidence_status)
    && effective(row, Date.now()));
  if (!ownerAuthorized) return { ownerAuthorized: false, ready: true };

  // Never replace a frozen snapshot prepared by the staffed quote flow.
  if (estimate.active_economics_snapshot_id) {
    return { ownerAuthorized: true, ready: estimate.economics_status === 'PASS'
      && ['PENDING_PAYMENT','READY'].includes(estimate.assignment_readiness_status) };
  }

  const calculation = { estimatedTotal: amount, residentDiscount: 0, tax: 0 };
  const resolvedLineItems = [{
    canonicalSku: offer.serviceId,
    serviceSku: offer.serviceId,
    serviceName: offer.name,
    runtimeServiceId: offer.runtimeServiceId,
    answers: estimate.intake_answers?.answers || request.property_details?.commercialIntent?.answers || {}
  }];
  const result = await createEstimateEconomicsSnapshot(supabase, {
    estimateId: estimate.id, resolvedLineItems, calculation, channelCode: 'CH01'
  });
  return {
    ownerAuthorized: true,
    ready: result.snapshot.economics_status === 'PASS' && result.assignmentReadiness === 'PENDING_PAYMENT',
    reason: result.unresolvedReasons?.join(', ') || result.snapshot.economics_status
  };
}
