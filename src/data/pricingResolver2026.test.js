import { resolvePricing, PRICING_CHANNELS } from './pricingResolver2026';
import { MODIFIERS, PRICING_STATUS } from './canonicalPricing2026';
import { bookingServices } from './services';

describe('canonical pricing spine', () => {
  test('resolves mobile notary from the canonical catalog for B2C', () => {
    const result = resolvePricing('mobile_notary', { channel: PRICING_CHANNELS.B2C });

    expect(result.status).toBe(PRICING_STATUS.LOCKED);
    expect(result.amount).toBe(50);
    expect(result.label).toBe('$50');
  });

  test('does not expose a B2C-only service through the B2B channel', () => {
    const result = resolvePricing('02-ELO', { channel: PRICING_CHANNELS.B2B });

    expect(result.amount).toBeNull();
    expect(result.reason).toBe('CHANNEL_NOT_AUTHORIZED');
  });

  test('blocks unresolved B2B turnover pricing instead of inventing a number', () => {
    const result = resolvePricing('02-TO1', { channel: PRICING_CHANNELS.B2B });

    expect(result.status).toBe(PRICING_STATUS.UNDEFINED);
    expect(result.amount).toBeNull();
    expect(result.reason).toBe('BUSINESS_PRICING_RECONCILIATION_REQUIRED');
  });

  test('keeps approved scope-shield modifiers explicit', () => {
    expect(MODIFIERS.B2B_SECOND_TRIP.amount).toBe(85);
    expect(MODIFIERS.B2B_SECOND_TRIP.status).toBe(PRICING_STATUS.LOCKED);
    expect(MODIFIERS.B2B_ACCESS_WAIT.amount).toBe(85);
    expect(MODIFIERS.B2B_ACCESS_WAIT.status).toBe(PRICING_STATUS.LOCKED);
    expect(MODIFIERS.B2B_EXCESS_DEBRIS.amount).toBeNull();
    expect(MODIFIERS.B2B_SPECIAL_HANDLING.amount).toBeNull();
  });

  test('booking labels come from canonical pricing rather than JSX literals', () => {
    const byId = Object.fromEntries(bookingServices.map((service) => [service.id, service]));

    expect(byId.notary.priceLabel).toBe('$50');
    expect(byId.loansigning.priceLabel).toBe('$150');
    expect(byId.apostille.priceLabel).toBe('$175');
    expect(byId.officiant.priceLabel).toBe('$199');
  });
});
