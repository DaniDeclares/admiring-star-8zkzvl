const fs = require('fs');

import {
  canApproveCustomerQuote,
  canSubmitCustomerQuoteDecision,
  customerQuoteScopeFromEstimate,
  isCustomerQuoteScopeComplete,
  toCustomerFacingEstimate,
} from './customerQuoteScope2026.js';

describe('customer quote scope authority', () => {
  const completeLine = {
    id: 'line-1',
    canonicalSku: 'DNI-01A-001',
    serviceName: 'Resident Refresh',
    componentRole: 'PRIMARY',
    answers: { quantity: 2, scope_summary: 'Kitchen and two bathrooms' },
    calculation: { estimatedTotal: 240 },
  };
  const estimateWith = lineItems => ({ intake_answers: { pricingSnapshot: { lineItems } } });

  test('prefers frozen pricing snapshot and returns only review-safe fields', () => {
    const estimate = { intake_answers: {
      lineItems: [{ ...completeLine, serviceName: 'Mutable copy' }],
      pricingSnapshot: { lineItems: [completeLine] },
    } };
    const scope = customerQuoteScopeFromEstimate(estimate);
    expect(scope).toEqual([{
      id: 'line-1', canonical_sku: 'DNI-01A-001', service_name: 'Resident Refresh',
      description: 'Kitchen and two bathrooms', quantity: 2, component_role: 'PRIMARY', line_total: 240,
    }]);
    expect(scope[0]).not.toHaveProperty('answers');
    expect(scope[0]).not.toHaveProperty('calculation');
    expect(isCustomerQuoteScopeComplete(scope)).toBe(true);
    expect(canApproveCustomerQuote(estimate)).toBe(true);
  });

  test.each([
    ['missing', undefined], ['null', null], ['empty', ''], ['whitespace', '   '],
    ['nonnumeric', 'two'], ['NaN', 'NaN'], ['infinity', 'Infinity'], ['zero', 0],
    ['negative', -1], ['boolean', true], ['array', [2]], ['object', { value: 2 }],
  ])('rejects %s quantity without coercing it into valid scope', (_label, quantity) => {
    const line = { ...completeLine, answers: { ...completeLine.answers, quantity } };
    const estimate = estimateWith([line]);
    const scope = customerQuoteScopeFromEstimate(estimate);
    expect(scope[0].quantity).toBeNull();
    expect(isCustomerQuoteScopeComplete(scope)).toBe(false);
    expect(canApproveCustomerQuote(estimate)).toBe(false);
  });

  test.each([
    ['positive integer number', 2, 2], ['positive decimal number', 1.5, 1.5],
    ['positive integer numeric string', '2', 2], ['positive decimal numeric string', '0.25', 0.25],
    ['numeric string with surrounding whitespace', ' 3.5 ', 3.5],
  ])('accepts supported %s quantity representation', (_label, quantity, expected) => {
    const line = { ...completeLine, answers: { ...completeLine.answers, quantity } };
    const estimate = estimateWith([line]);
    const scope = customerQuoteScopeFromEstimate(estimate);
    expect(scope[0].quantity).toBe(expected);
    expect(isCustomerQuoteScopeComplete(scope)).toBe(true);
    expect(canApproveCustomerQuote(estimate)).toBe(true);
  });

  test.each([
    ['missing scope_summary and description', {}],
    ['blank scope_summary and description', { scope_summary: '  ', description: '' }],
  ])('uses canonical service label as description equivalent when %s', (_label, answers) => {
    const line = { ...completeLine, answers: { quantity: 2, ...answers } };
    const scope = customerQuoteScopeFromEstimate(estimateWith([line]));
    expect(scope[0].description).toBe('Resident Refresh');
    expect(isCustomerQuoteScopeComplete(scope)).toBe(true);
  });

  test('rejects scope with no separate description or canonical service-name equivalent', () => {
    const line = { ...completeLine, serviceName: '  ', answers: { quantity: 2 } };
    const estimate = estimateWith([line]);
    const scope = customerQuoteScopeFromEstimate(estimate);
    expect(scope[0].description).toBeNull();
    expect(isCustomerQuoteScopeComplete(scope)).toBe(false);
    expect(canApproveCustomerQuote(estimate)).toBe(false);
  });

  test('uses canonical service name as the existing display-equivalent when no separate description is collected', () => {
    const line = { ...completeLine, answers: { quantity: 2, description: 'Customer-confirmed work details' } };
    const scope = customerQuoteScopeFromEstimate(estimateWith([line]));
    expect(scope[0].description).toBe('Customer-confirmed work details');
    expect(isCustomerQuoteScopeComplete(scope)).toBe(true);
  });

  test('preserves supported historical saved-line fallback', () => {
    const scope = customerQuoteScopeFromEstimate({ intake_answers: { lineItems: [completeLine] } });
    expect(scope).toHaveLength(1);
    expect(isCustomerQuoteScopeComplete(scope)).toBe(true);
  });

  test('fails closed when canonical identity or governed total is absent', () => {
    for (const line of [
      { ...completeLine, canonicalSku: '' },
      { ...completeLine, serviceName: null },
      { ...completeLine, calculation: {} },
    ]) {
      const estimate = estimateWith([line]);
      expect(canApproveCustomerQuote(estimate)).toBe(false);
      expect(canSubmitCustomerQuoteDecision('APPROVED', estimate)).toBe(false);
    }
  });

  test('server decision guard rejects incomplete approval but preserves decline', () => {
    const incomplete = estimateWith([{ ...completeLine, answers: { scope_summary: 'Defined scope' } }]);
    expect(canSubmitCustomerQuoteDecision('APPROVED', incomplete)).toBe(false);
    expect(canSubmitCustomerQuoteDecision('DECLINED', incomplete)).toBe(true);
  });

  test('customer-facing estimate omits raw intake_answers and returns sanitized scope', () => {
    const estimate = { id: 'estimate-1', intake_answers: {
      privateInternalAnswer: 'must not leave server',
      pricingSnapshot: { lineItems: [completeLine] },
    } };
    const response = toCustomerFacingEstimate(estimate);
    expect(response).not.toHaveProperty('intake_answers');
    expect(response.quote_scope[0]).toMatchObject({
      canonical_sku: 'DNI-01A-001', service_name: 'Resident Refresh', quantity: 2,
      description: 'Kitchen and two bathrooms',
    });
    expect(response.quote_scope[0]).not.toHaveProperty('answers');
    expect(response.scope_complete).toBe(true);
  });

  test('portal API uses the shared approval guard and strips raw intake from customer snapshots', () => {
    const handler = fs.readFileSync('api-handlers/portal-operations.js', 'utf8');
    expect(handler).toContain('canSubmitCustomerQuoteDecision(decision, estimate)');
    expect(handler).toContain('(estimates || []).map(toCustomerFacingEstimate)');
    expect(handler).not.toContain('canApproveCustomerQuote(estimate)');
  });

  test('fails closed when no reviewable scope exists', () => {
    const estimate = { intake_answers: {} };
    const scope = customerQuoteScopeFromEstimate(estimate);
    expect(scope).toEqual([]);
    expect(isCustomerQuoteScopeComplete(scope)).toBe(false);
    expect(canApproveCustomerQuote(estimate)).toBe(false);
  });
});
