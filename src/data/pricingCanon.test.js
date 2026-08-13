import {
  getPriceLabel,
  getPriceValue,
  getPricingEntry,
} from './pricingCanon';

describe('pricingCanon', () => {
  test('resolves the mobile notary baseline from the master catalog', () => {
    expect(getPricingEntry('mobile_notary')?.offerId).toBe('01-NOT');
    expect(getPriceValue('mobile_notary')).toBe(50);
    expect(getPriceLabel('mobile_notary')).toBe('$50');
  });

  test('resolves the loan signing baseline from the master catalog', () => {
    expect(getPricingEntry('loan_signing')?.offerId).toBe('01-LON');
    expect(getPriceValue('loan_signing')).toBe(150);
    expect(getPriceLabel('loan_signing')).toBe('$150');
  });

  test('resolves the business startup kit and SOP catalog entries', () => {
    expect(getPricingEntry('startup_kit')?.offerId).toBe('05-STU');
    expect(getPriceLabel('startup_kit')).toBe('$199');

    expect(getPricingEntry('sop')?.offerId).toBe('05-SOP');
    expect(getPriceLabel('sop')).toBe('$500');
  });

  test('resolves verified creative and smart-product SKUs', () => {
    expect(getPriceLabel('apparel')).toBe('$98');
    expect(getPriceLabel('tumbler')).toBe('$48');
    expect(getPriceLabel('nfc')).toBe('$49');
    expect(getPriceLabel('review_stand')).toBe('$49');
  });

  test('returns a safe fallback for unknown identifiers', () => {
    expect(getPricingEntry('does-not-exist')).toBeNull();
    expect(getPriceValue('does-not-exist')).toBeNull();
    expect(getPriceLabel('does-not-exist')).toBe('Starting at / Quoted');
  });
});
