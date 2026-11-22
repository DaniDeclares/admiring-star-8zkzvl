const asNonEmptyString = value => {
  const normalized = String(value ?? '').trim();
  return normalized || null;
};

const asFiniteNumber = value => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

// Quote Builder submits number-input values as strings; snapshots may store numbers.
// Reject coercible non-numeric types and blanks rather than inventing a quantity.
const asPositiveQuantity = value => {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  const quantity = Number(value);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : null;
};

export function customerQuoteScopeFromEstimate(estimate) {
  const frozenLines = estimate?.intake_answers?.pricingSnapshot?.lineItems;
  const savedLines = estimate?.intake_answers?.lineItems;
  const source = Array.isArray(frozenLines) && frozenLines.length
    ? frozenLines
    : (Array.isArray(savedLines) ? savedLines : []);

  return source.map((line, index) => ({
    id: asNonEmptyString(line?.id) || 'quote-line-' + (index + 1),
    canonical_sku: asNonEmptyString(line?.canonicalSku),
    service_name: asNonEmptyString(line?.serviceName),
    description: asNonEmptyString(line?.answers?.scope_summary)
      || asNonEmptyString(line?.answers?.description)
      || asNonEmptyString(line?.serviceName),
    quantity: asPositiveQuantity(line?.answers?.quantity),
    component_role: asNonEmptyString(line?.componentRole) || 'PRIMARY',
    line_total: asFiniteNumber(line?.calculation?.estimatedTotal),
  }));
}

export function isCustomerQuoteScopeComplete(scope) {
  return Array.isArray(scope)
    && scope.length > 0
    && scope.every(line => (
      Boolean(asNonEmptyString(line?.canonical_sku))
      && Boolean(asNonEmptyString(line?.service_name))
      && Boolean(asNonEmptyString(line?.description))
      && asPositiveQuantity(line?.quantity) !== null
      && asFiniteNumber(line?.line_total) !== null
      && Number(line.line_total) >= 0
    ));
}

export function canApproveCustomerQuote(estimate) {
  return isCustomerQuoteScopeComplete(customerQuoteScopeFromEstimate(estimate));
}

// Decline remains available even when itemized scope is incomplete.
export function canSubmitCustomerQuoteDecision(decision, estimate) {
  return String(decision || '').toUpperCase() !== 'APPROVED'
    || canApproveCustomerQuote(estimate);
}

// Keep the customer response free of raw private intake JSON.
export function toCustomerFacingEstimate(estimate) {
  const publicEstimate = { ...estimate };
  delete publicEstimate.intake_answers;
  const quote_scope = customerQuoteScopeFromEstimate(estimate);
  return {
    ...publicEstimate,
    quote_scope,
    scope_complete: isCustomerQuoteScopeComplete(quote_scope),
  };
}
