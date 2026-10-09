import { GROWTH_OPTIONS, GROWTH_RELEASE_GATES, growthEconomics, growthOptionUnderwriting } from './op1mGrowthPartnerEconomics2026';

describe('OP1M Growth Partner candidate underwriting', () => {
  it.each([
    ['VISIBILITY_PARTNER', 675, 900, 913, 1217],
    ['GROWTH_PARTNER', 1163, 1550, 1791, 2388],
    ['GROWTH_OPERATIONS_PARTNER', 1500, 2000, 2579, 3438],
  ])('%s separates activation from monthly labor floors', (tier, activation40, activation30, monthly40, monthly30) => {
    const e = growthOptionUnderwriting(tier);
    expect([e.activation.minimumPrice40, e.activation.targetPrice30, e.monthly.minimumPrice40, e.monthly.targetPrice30])
      .toEqual([activation40, activation30, monthly40, monthly30]);
    expect(e.priceApproved).toBe(false);
    expect(e.sellNow).toBe(false);
  });
  it('counts outreach and follow-up allowances for Growth tiers, but not Visibility', () => {
    expect(GROWTH_OPTIONS.VISIBILITY_PARTNER.monthly.outreachTouches).toBe(0);
    expect(GROWTH_OPTIONS.GROWTH_PARTNER.monthly.followupTouches).toBe(20);
    expect(GROWTH_OPTIONS.GROWTH_OPERATIONS_PARTNER.monthly.adminHours).toBe(4);
  });
  it('checks total human labor against 40% and 30% while reserving fees and overhead', () => {
    expect(growthEconomics({ providerMinutes: 510, ownerMinutes: 165, price: 1800 }).clears40).toBe(true);
    expect(growthEconomics({ providerMinutes: 510, ownerMinutes: 165, price: 1800 }).clears30).toBe(false);
    expect(growthEconomics({ providerMinutes: 510, ownerMinutes: 165, price: 1800 }).contributionAfterModeledCosts).toBe(813.75);
  });
  it('rejects missing economics and retains price authority hold', () => {
    expect(() => growthEconomics({ providerMinutes: -1, ownerMinutes: 1 })).toThrow();
    expect(() => growthOptionUnderwriting('OTHER')).toThrow();
    expect(GROWTH_RELEASE_GATES).toContain('Obtain explicit OWNER approval of activation price, monthly price and contract before SELL_NOW');
  });
});
