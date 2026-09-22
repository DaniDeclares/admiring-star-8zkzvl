import { summarizeEconomics, evaluateCounteroffer, calculateCompensation, calculateProviderEconomicCeiling, evaluatePayoutBand } from './componentEconomics2026.js';

describe('component economics', () => {
  it('keeps owner labor separate from retained contribution', () => {
    const result = summarizeEconomics({ customerPrice: 500, ownerCompensation: 100, providerCompensation: 150, materialsCost: 50, overheadRecoveryRequirement: 25 });
    expect(result.minimumViablePrice).toBe(325);
    expect(result.expectedContribution).toBe(200);
    expect(result.economicsStatus).toBe('PASS');
  });
  it('enforces overhead plus required DANI contribution in the economic floor', () => {
    const result = summarizeEconomics({ customerPrice: 500, providerCompensation: 150, materialsCost: 50, overheadRecoveryRequirement: 50, minimumContributionAmount:100 });
    expect(result.minimumViablePrice).toBe(350);
    expect(result.economicHeadroom).toBe(150);
    expect(result.retainedAfterOverhead).toBe(250);
  });
  it('uses the stricter margin requirement when it exceeds the flat contribution floor', () => {
    const result = summarizeEconomics({ customerPrice: 500, providerCompensation: 250, overheadRecoveryRequirement:25, minimumContributionAmount:50, minimumMarginPercent:20 });
    expect(result.requiredDaniContribution).toBe(100);
    expect(result.minimumViablePrice).toBe(375);
  });
  it('flags a provider counteroffer that breaks the economic floor', () => {
    const result = evaluateCounteroffer({ customer_price: 500, minimum_viable_price: 480, provider_compensation: 150, expected_contribution: 120 }, 150, 200);
    expect(result.delta).toBe(50);
    expect(result.economicImpactStatus).toBe('REQUIRES_REPRICE');
    expect(result.requiresCustomerReapproval).toBe(true);
  });
  it('budgets provider fulfillment at the lower of commercial max and economic ceiling', () => {
    const ceiling=calculateProviderEconomicCeiling({customer_price:250,minimum_viable_price:220},75);
    expect(ceiling).toBe(105);
    const band=evaluatePayoutBand({status:'ACTIVE',evidence_status:'RESEARCH_BENCHMARK',initial_offer_amount:75,target_payout_amount:90,maximum_payout_amount:110,equipment_basis:'DANI_SUPPLIED',material_basis:'DANI_SUPPLIED'},ceiling);
    expect(band.resolved).toBe(true);
    expect(band.effectiveMaximum).toBe(105);
    expect(band.budgetedProviderCost).toBe(105);
  });
  it('does not resolve a band whose initial offer already breaks the job economics', () => {
    const band=evaluatePayoutBand({status:'ACTIVE',evidence_status:'RESEARCH_BENCHMARK',initial_offer_amount:80,target_payout_amount:90,maximum_payout_amount:100},70);
    expect(band.resolved).toBe(false);
    expect(band.reason).toBe('INITIAL_OFFER_EXCEEDS_ECONOMIC_CEILING');
  });
  it('allows sourced research benchmarks but not unresolved invented provider pay', () => {
    expect(calculateCompensation({ status:'ACTIVE', evidence_status:'RESEARCH_BENCHMARK', compensation_type:'FLAT', rate_amount:100 }, 1).resolved).toBe(true);
    expect(calculateCompensation({ status:'DRAFT', evidence_status:'UNRESOLVED', compensation_type:'FLAT', rate_amount:100 }, 1).resolved).toBe(false);
  });
});
