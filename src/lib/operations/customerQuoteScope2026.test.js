import {
  canApproveCustomerQuote,
  customerQuoteScopeFromEstimate,
  isCustomerQuoteScopeComplete,
} from './customerQuoteScope2026.js';

describe('customer quote scope authority', () => {
  const completeLine = {
    canonicalSku: 'DNI-01A-001',
    serviceName: 'Resident Refresh',
    componentRole: 'PRIMARY',
    answers: { quantity: 2, scope_summary: 'Kitchen and two bathrooms' },
    calculation: { estimatedTotal: 240 },
  };

  test('prefers the frozen pricing snapshot and returns only review-safe fields', () => {
    const estimate = {
      intake_answers: {
        lineItems: [{ ...completeLine, serviceName: 'Mutable copy' }],
        pricingSnapshot: { lineItems: [completeLine] },
      },
    };

    const scope = customerQuoteScopeFromEstimate(estimate);

    expect(scope).toEqual([{
      id: 'quote-line-1',
      canonical_sku: 'DNI-01A-001',
      service_name: 'Resident Refresh',
      description: 'Kitchen and two bathrooms',
      quantity: 2,
      component_role: 'PRIMARY',
      line_total: 240,
    }]);
    expect(scope[0]).not.toHaveProperty('answers');
    expect(scope[0]).not.toHaveProperty('calculation');
    expect(isCustomerQuoteScopeComplete(scope)).toBe(true);
    expect(canApproveCustomerQuote(estimate)).toBe(true);
  });

  test('falls back to the server-resolved saved lines for earlier quotes', () => {
    const scope = customerQuoteScopeFromEstimate({
      intake_answers: { lineItems: [completeLine] },
    });

    expect(scope).toHaveLength(1);
    expect(isCustomerQuoteScopeComplete(scope)).toBe(true);
  });

  test.each([
    [{ ...completeLine, canonicalSku: '' }],
    [{ ...completeLine, serviceName: null }],
    [{ ...completeLine, calculation: {} }],
  ])('fails closed when a required canonical field is absent', incompleteLine => {
    const scope = customerQuoteScopeFromEstimate({
      intake_answers: { pricingSnapshot: { lineItems: [incompleteLine] } },
    });

    expect(isCustomerQuoteScopeComplete(scope)).toBe(false);
    expect(canApproveCustomerQuote({
      intake_answers: { pricingSnapshot: { lineItems: [incompleteLine] } },
    })).toBe(false);
  });

  test('fails closed when no reviewable scope exists', () => {
    const scope = customerQuoteScopeFromEstimate({ intake_answers: {} });

    expect(scope).toEqual([]);
    expect(isCustomerQuoteScopeComplete(scope)).toBe(false);
    expect(canApproveCustomerQuote({ intake_answers: {} })).toBe(false);
  });
});
