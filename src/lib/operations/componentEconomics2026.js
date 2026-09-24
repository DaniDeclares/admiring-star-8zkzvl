const money = value => Math.round(Number(value || 0) * 100) / 100;
const RESOLVED_EVIDENCE = ['RESEARCH_BENCHMARK','OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED'];

export function summarizeEconomics(input = {}) {
  const customerPrice = money(input.customerPrice);
  const ownerCompensation = money(input.ownerCompensation);
  const providerCompensation = money(input.providerCompensation);
  const materialsCost = money(input.materialsCost);
  const procurementCost = money(input.procurementCost);
  const subcontractCost = money(input.subcontractCost);
  const travelCost = money(input.travelCost);
  const paymentProcessingCost = money(input.paymentProcessingCost);
  const otherVariableCost = money(input.otherVariableCost);
  const overheadRecoveryRequirement = money(input.overheadRecoveryRequirement);
  const minimumContributionAmount = money(input.minimumContributionAmount);
  const minimumMarginPercent = Number(input.minimumMarginPercent || 0);
  const variableCost = money(ownerCompensation + providerCompensation + materialsCost + procurementCost + subcontractCost + travelCost + paymentProcessingCost + otherVariableCost);
  const expectedContribution = money(customerPrice - variableCost);
  const expectedMarginPercent = customerPrice > 0 ? money((expectedContribution / customerPrice) * 100) : null;
  const marginContributionRequirement = money(customerPrice * minimumMarginPercent / 100);
  const requiredDaniContribution = money(Math.max(minimumContributionAmount, marginContributionRequirement));
  const minimumViablePrice = money(variableCost + overheadRecoveryRequirement + requiredDaniContribution);
  const retainedAfterOverhead = money(expectedContribution - overheadRecoveryRequirement);
  const economicHeadroom = money(customerPrice - minimumViablePrice);
  const economicsStatus = input.unresolved ? 'UNRESOLVED' : (economicHeadroom >= 0 ? 'PASS' : 'FAIL');
  return {
    customerPrice, ownerCompensation, providerCompensation, materialsCost, procurementCost, subcontractCost, travelCost,
    paymentProcessingCost, otherVariableCost, overheadRecoveryRequirement, minimumContributionAmount, minimumMarginPercent,
    requiredDaniContribution, variableCost, minimumViablePrice, expectedContribution, expectedMarginPercent,
    retainedAfterOverhead, economicHeadroom, economicsStatus
  };
}

export function calculateProviderEconomicCeiling(snapshot = {}, currentProposed = 0) {
  const current = money(currentProposed);
  const headroom = money(snapshot.economic_headroom ?? snapshot.economicHeadroom ?? (
    Number(snapshot.customer_price ?? snapshot.customerPrice ?? 0) - Number(snapshot.minimum_viable_price ?? snapshot.minimumViablePrice ?? 0)
  ));
  return money(Math.max(0, current + headroom));
}

export function evaluatePayoutBand(band = {}, economicCeiling = 0) {
  if (!band || band.status !== 'ACTIVE' || !RESOLVED_EVIDENCE.includes(band.evidence_status)) {
    return { resolved:false, reason:'NO_ACTIVE_EVIDENCE_BACKED_PAYOUT_BAND' };
  }
  const initial = money(band.initial_offer_amount);
  const target = money(band.target_payout_amount);
  const commercialMaximum = money(band.maximum_payout_amount);
  const ceiling = money(economicCeiling);
  if (initial > target || target > commercialMaximum) return { resolved:false, reason:'INVALID_PAYOUT_BAND_ORDER' };
  if (initial > ceiling) return { resolved:false, reason:'INITIAL_OFFER_EXCEEDS_ECONOMIC_CEILING', initialOffer:initial, targetPayout:target, commercialMaximum, economicCeiling:ceiling };
  return {
    resolved:true,
    initialOffer:initial,
    targetPayout:target,
    commercialMaximum,
    economicCeiling:ceiling,
    effectiveMaximum:money(Math.min(commercialMaximum, ceiling)),
    targetWithinCeiling:target <= ceiling,
    budgetedProviderCost:money(Math.min(commercialMaximum, ceiling)),
    evidenceStatus:band.evidence_status,
    sourceReference:band.source_reference || null,
    equipmentBasis:band.equipment_basis,
    materialBasis:band.material_basis,
    escalationPolicy:band.escalation_policy || { mode:'MANUAL', auto_step_up:false }
  };
}

export function evaluateCounteroffer(snapshot = {}, currentProposed = 0, counterAmount = 0, payoutBand = null) {
  const current = money(currentProposed);
  const counter = money(counterAmount);
  const delta = money(counter - current);
  const economicCeiling = calculateProviderEconomicCeiling(snapshot, current);
  const commercialMaximum = payoutBand?.maximumPayout ?? payoutBand?.maximum_payout_amount ?? null;
  const target = payoutBand?.targetPayout ?? payoutBand?.target_payout_amount ?? null;
  const effectiveMaximum = commercialMaximum == null ? economicCeiling : money(Math.min(Number(commercialMaximum), economicCeiling));
  const revisedProviderCompensation = money((snapshot.provider_compensation ?? snapshot.providerCompensation ?? 0) + delta);
  const revisedExpectedContribution = money((snapshot.expected_contribution ?? snapshot.expectedContribution ?? 0) - delta);
  const revisedHeadroom = money((snapshot.economic_headroom ?? snapshot.economicHeadroom ?? (Number(snapshot.customer_price ?? 0) - Number(snapshot.minimum_viable_price ?? 0))) - delta);
  let counterBandStatus = 'WITHIN_TARGET';
  if (counter > effectiveMaximum) counterBandStatus = 'EXCEEDS_MAXIMUM';
  else if (target != null && counter > Number(target)) counterBandStatus = 'WITHIN_MAX_REVIEW';
  const breaksFloor = counter > economicCeiling;
  return {
    delta,
    economicCeiling,
    effectiveMaximum,
    targetPayout:target == null ? null : money(target),
    revisedProviderCompensation,
    revisedExpectedContribution,
    revisedEconomicHeadroom:revisedHeadroom,
    counterBandStatus,
    economicImpactStatus: breaksFloor || counter > effectiveMaximum ? 'REQUIRES_REPRICE' : 'WITHIN_FLOOR',
    requiresCustomerReapproval: breaksFloor,
    requiresOwnerReview: counterBandStatus !== 'WITHIN_TARGET'
  };
}

export function calculateCompensation(rule = {}, quantity = 1, context = {}) {
  if (!rule || rule.status !== 'ACTIVE' || !RESOLVED_EVIDENCE.includes(rule.evidence_status)) {
    return { amount: 0, resolved: false, basis: { reason: 'NO_ACTIVE_EVIDENCE_BACKED_COMPENSATION_RULE' } };
  }
  const q = Math.max(0, Number(quantity || 0));
  const rate = Number(rule.rate_amount || 0);
  let amount = 0;
  switch (rule.compensation_type) {
    case 'FLAT':
    case 'NEGOTIATED_PROJECT': amount = rate; break;
    case 'HOURLY':
    case 'PER_UNIT':
    case 'PER_SEAT':
    case 'PER_DEVICE':
    case 'PER_GARMENT':
    case 'MILEAGE': amount = rate * q; break;
    case 'PERCENTAGE': amount = Number(context.percentBasisAmount || 0) * Number(rule.percent_rate || 0) / 100; break;
    case 'COMBINATION': amount = Number(context.combinationAmount || 0); break;
    default: return { amount: 0, resolved: false, basis: { reason: 'UNSUPPORTED_COMPENSATION_TYPE' } };
  }
  if (rule.minimum_amount != null) amount = Math.max(amount, Number(rule.minimum_amount));
  if (rule.maximum_amount != null) amount = Math.min(amount, Number(rule.maximum_amount));
  return { amount: money(amount), resolved: true, basis: { ruleId: rule.id, compensationType: rule.compensation_type, rateAmount: rule.rate_amount ?? null, percentRate: rule.percent_rate ?? null, quantity: q, evidenceStatus:rule.evidence_status, sourceReference: rule.source_reference || null } };
}
