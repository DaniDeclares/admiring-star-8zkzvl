const money = value => Math.round(Number(value || 0) * 100) / 100;

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
  const variableCost = money(ownerCompensation + providerCompensation + materialsCost + procurementCost + subcontractCost + travelCost + paymentProcessingCost + otherVariableCost);
  const minimumViablePrice = money(variableCost + overheadRecoveryRequirement);
  const expectedContribution = money(customerPrice - variableCost);
  const expectedMarginPercent = customerPrice > 0 ? money((expectedContribution / customerPrice) * 100) : null;
  const economicsStatus = input.unresolved ? 'UNRESOLVED' : (customerPrice >= minimumViablePrice ? 'PASS' : 'FAIL');
  return { customerPrice, ownerCompensation, providerCompensation, materialsCost, procurementCost, subcontractCost, travelCost, paymentProcessingCost, otherVariableCost, overheadRecoveryRequirement, variableCost, minimumViablePrice, expectedContribution, expectedMarginPercent, economicsStatus };
}

export function evaluateCounteroffer(snapshot = {}, currentProposed = 0, counterAmount = 0) {
  const current = money(currentProposed);
  const counter = money(counterAmount);
  const delta = money(counter - current);
  const customerPrice = money(snapshot.customer_price ?? snapshot.customerPrice);
  const priorMinimum = money(snapshot.minimum_viable_price ?? snapshot.minimumViablePrice);
  const revisedMinimumViablePrice = money(priorMinimum + delta);
  const revisedProviderCompensation = money((snapshot.provider_compensation ?? snapshot.providerCompensation ?? 0) + delta);
  const revisedExpectedContribution = money((snapshot.expected_contribution ?? snapshot.expectedContribution ?? 0) - delta);
  const breaksFloor = customerPrice < revisedMinimumViablePrice;
  return {
    delta,
    revisedMinimumViablePrice,
    revisedProviderCompensation,
    revisedExpectedContribution,
    economicImpactStatus: breaksFloor ? 'REQUIRES_REPRICE' : 'WITHIN_FLOOR',
    requiresCustomerReapproval: breaksFloor
  };
}

export function calculateCompensation(rule = {}, quantity = 1, context = {}) {
  if (!rule || rule.status !== 'ACTIVE' || !['OWNER_CONFIRMED','DOCUMENT_EVIDENCE','SYSTEM_VERIFIED','EXTERNAL_VERIFIED'].includes(rule.evidence_status)) {
    return { amount: 0, resolved: false, basis: { reason: 'NO_ACTIVE_VERIFIED_COMPENSATION_RULE' } };
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
  return { amount: money(amount), resolved: true, basis: { ruleId: rule.id, compensationType: rule.compensation_type, rateAmount: rule.rate_amount ?? null, percentRate: rule.percent_rate ?? null, quantity: q, sourceReference: rule.source_reference || null } };
}
