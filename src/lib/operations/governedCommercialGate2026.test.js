import { economicGateFromOffer } from './governedCommercialGate2026';

describe('economic checkout gate', () => {
  test('blocks missing economics', () => {
    expect(economicGateFromOffer({
      internalCost: 'PENDING_RECONCILIATION',
      marginEconomics: 'PENDING_RECONCILIATION',
    }).reason).toBe('ECONOMICS_NOT_RECONCILED');
  });

  test('blocks draft economics even when the draft margin exceeds 50%', () => {
    expect(economicGateFromOffer({
      internalCost: 'DRAFT: 3 hrs @ $30/hr = $90',
      marginEconomics: 'DRAFT: price $250 - draft cost $90 = $160 (64.0%)',
    }).reason).toBe('ECONOMICS_NOT_RECONCILED');
  });

  test('blocks a verified economics record below the 50% floor', () => {
    expect(economicGateFromOffer({
      internalCost: '1 hrs @ $75/hr = $75.00.',
      marginEconomics: 'AUDITED: price $149 - cost $75 = $74 (49.7%)',
    }).reason).toBe('ECONOMICS_BELOW_50_MARGIN_FLOOR');
  });

  test('clears verified economics at or above the 50% floor', () => {
    const result = economicGateFromOffer({
      internalCost: '1 hrs @ $75/hr = $75.00.',
      marginEconomics: 'AUDITED: price $150 - cost $75 = $75 (50.0%)',
    });
    expect(result.cleared).toBe(true);
    expect(result.marginPercent).toBe(50);
  });

  test('does not treat a price-only RESOLVED note as economically audited', () => {
    expect(economicGateFromOffer({
      internalCost: '1 hrs @ $75/hr = $75.00.',
      marginEconomics: 'RESOLVED 2026-09-18: price corrected. Still a draft hour estimate, not an audited figure. (49.7%)',
    }).reason).toBe('ECONOMICS_NOT_RECONCILED');
  });
});
