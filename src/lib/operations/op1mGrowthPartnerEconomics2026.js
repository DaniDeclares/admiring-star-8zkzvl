// OP1M Growth Partner: candidate economics, NOT public price authority.
// Human minutes and rates are explicit assumptions until measured from paid work.
export const GROWTH_COST_POLICY = Object.freeze({
  providerHourly: 60, ownerHourly: 75, processingPct: 0.03,
  overheadPct: 0.12, maximumLaborShare: 0.40, targetLaborShare: 0.30,
  status: 'CANDIDATE_UNDERWRITING_NOT_SELL_NOW',
});
export const GROWTH_OPTIONS = Object.freeze({
  VISIBILITY_PARTNER: {
    monthly: { contentPieces: 4, researchedProspects: 0, outreachTouches: 0, followupTouches: 0, visibilityActions: 2, reports: 1 },
    minutes: { provider: 240, owner: 100 },
    activationMinutes: { provider: 120, owner: 120 },
    exclusions: ['lead outreach', 'inbox management', 'filming', 'paid advertising', 'unlimited revisions'],
  },
  GROWTH_PARTNER: {
    monthly: { contentPieces: 4, researchedProspects: 20, outreachTouches: 20, followupTouches: 20, visibilityActions: 2, reports: 1 },
    minutes: { provider: 510, owner: 165 },
    activationMinutes: { provider: 240, owner: 180 },
    exclusions: ['closing sales', 'cold calling', 'paid advertising', 'unlimited DMs', 'guaranteed leads or revenue'],
  },
  GROWTH_OPERATIONS_PARTNER: {
    monthly: { contentPieces: 4, researchedProspects: 20, outreachTouches: 20, followupTouches: 20, visibilityActions: 2, reports: 1, adminHours: 4 },
    minutes: { provider: 750, owner: 225 },
    activationMinutes: { provider: 300, owner: 240 },
    exclusions: ['unlimited customer service', 'financial authority', 'unapproved customer contact', 'staffing/dispatch', 'guaranteed sales'],
  },
});
export function growthEconomics({ providerMinutes, ownerMinutes, price, providerHourly = GROWTH_COST_POLICY.providerHourly, ownerHourly = GROWTH_COST_POLICY.ownerHourly }) {
  if (![providerMinutes, ownerMinutes, providerHourly, ownerHourly].every(v => Number.isFinite(v) && v >= 0)) throw new Error('Invalid nonnegative labor input');
  const labor = providerMinutes / 60 * providerHourly + ownerMinutes / 60 * ownerHourly;
  const minPrice40 = Math.ceil(labor / GROWTH_COST_POLICY.maximumLaborShare);
  const targetPrice30 = Math.ceil(labor / GROWTH_COST_POLICY.targetLaborShare);
  if (price !== undefined && (!Number.isFinite(price) || price <= 0)) throw new Error('Invalid price');
  return {
    labor: Math.round(labor * 100) / 100,
    minimumPrice40: minPrice40,
    targetPrice30: targetPrice30,
    ...(price === undefined ? {} : {
      price, laborShare: Math.round(labor / price * 10000) / 100,
      contributionAfterModeledCosts: Math.round((price * (1 - GROWTH_COST_POLICY.processingPct - GROWTH_COST_POLICY.overheadPct) - labor) * 100) / 100,
      clears40: labor <= price * GROWTH_COST_POLICY.maximumLaborShare,
      clears30: labor <= price * GROWTH_COST_POLICY.targetLaborShare,
    }),
  };
}
export function growthOptionUnderwriting(tier) {
  const candidate = GROWTH_OPTIONS[tier];
  if (!candidate) throw new Error('Unknown tier');
  return {
    tier, status: GROWTH_COST_POLICY.status, allowances: candidate.monthly,
    activation: growthEconomics({ providerMinutes: candidate.activationMinutes.provider, ownerMinutes: candidate.activationMinutes.owner }),
    monthly: growthEconomics({ providerMinutes: candidate.minutes.provider, ownerMinutes: candidate.minutes.owner }),
    exclusions: candidate.exclusions,
    // Approval still requires measured labor, service price reconciliation, capacity and explicit owner price authorization.
    priceApproved: false, sellNow: false,
  };
}
export const GROWTH_RELEASE_GATES = Object.freeze([
  'Reconcile DNI-07A-005 $400 vs $650 source authority',
  'Confirm deliverable allowances, channel permissions, overages and service boundaries',
  'Validate provider and owner hours with real delivery receipts; include revisions and customer communication',
  'Underwrite one-time activation separately from recurring monthly service',
  'Check tool/software costs, payment fees, acquisition costs, refunds and provider availability',
  'Obtain explicit OWNER approval of activation price, monthly price and contract before SELL_NOW',
]);
