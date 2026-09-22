import { describe, it, expect } from 'vitest';
import { summarizeEconomics, evaluateCounteroffer, calculateCompensation } from './componentEconomics2026.js';

describe('component economics', () => {
  it('keeps owner labor separate from retained contribution', () => {
    const result = summarizeEconomics({ customerPrice: 500, ownerCompensation: 100, providerCompensation: 150, materialsCost: 50, overheadRecoveryRequirement: 25 });
    expect(result.minimumViablePrice).toBe(325);
    expect(result.expectedContribution).toBe(200);
    expect(result.economicsStatus).toBe('PASS');
  });
  it('flags a provider counteroffer that breaks the economic floor', () => {
    const result = evaluateCounteroffer({ customer_price: 500, minimum_viable_price: 480, provider_compensation: 150, expected_contribution: 120 }, 150, 200);
    expect(result.delta).toBe(50);
    expect(result.economicImpactStatus).toBe('REQUIRES_REPRICE');
    expect(result.requiresCustomerReapproval).toBe(true);
  });
  it('does not resolve invented provider pay', () => {
    expect(calculateCompensation({ status:'DRAFT', evidence_status:'UNRESOLVED', compensation_type:'FLAT', rate_amount:100 }, 1).resolved).toBe(false);
  });
});
