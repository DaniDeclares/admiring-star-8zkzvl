import { calculate } from './quoteBuilder2026.js';

describe('DNI-01A-003 governed bedroom-tier pricing', () => {
  const service = {
    pricing_type: 'FIXED',
    starting_price: 330,
    sourceType: 'GOVERNED',
    commercial_intent_status: 'SELL_NOW',
    quote_input_schema: {
      pricing_model: 'BEDROOM_TIER',
      tiers: [
        { value: '1', price: 330 },
        { value: '2', price: 380 },
        { value: '3', price: 480 },
        { value: '4', price: 605 }
      ],
      modifiers: [
        { key: 'severe_pet_mess', amount: 150, apply_before_resident_discount: true }
      ]
    }
  };
  const rule = {
    pricing_type: 'FIXED',
    billing_cycle: 'ONETIME',
    base_price_cents: 33000,
    resident_discount_eligible: true,
    lock_status: 'LOCKED'
  };

  test.each([
    ['1', 330],
    ['2', 380],
    ['3', 480],
    ['4', 605]
  ])('%s bedroom selects the governed tier', (bedrooms, expected) => {
    const result = calculate(service, rule, { bedroom_count: bedrooms, tax_rate_percent: 0 });
    expect(result.baseSubtotal).toBe(expected);
    expect(result.reviewFlags).not.toContain('LAYOUT_REVIEW');
  });

  test('severe pet mess adds $150 before resident discount', () => {
    const result = calculate(service, rule, {
      bedroom_count: '2',
      severe_pet_mess: true,
      apply_resident_discount: true,
      tax_rate_percent: 0
    });
    expect(result.baseSubtotal).toBe(530);
    expect(result.residentDiscount).toBe(79.5);
    expect(result.estimatedTotal).toBe(450.5);
  });

  test('missing bedroom count cannot silently quote the fallback base', () => {
    const result = calculate(service, rule, { tax_rate_percent: 0 });
    expect(result.baseSubtotal).toBe(0);
    expect(result.reviewFlags).toContain('LAYOUT_REVIEW');
    expect(result.needsReview).toBe(true);
  });

  test('carpet and abandoned-property flags route to separate scope review', () => {
    const result = calculate(service, rule, {
      bedroom_count: '2',
      specialized_carpet_extraction: true,
      abandoned_property_or_furniture: true,
      tax_rate_percent: 0
    });
    expect(result.reviewFlags).toEqual(expect.arrayContaining([
      'SPECIALTY_CARPET_SCOPE',
      'DEBRIS_FURNITURE_SCOPE'
    ]));
  });
});
