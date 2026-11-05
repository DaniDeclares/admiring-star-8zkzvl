const asNonEmptyString = value => {
  const normalized = String(value ?? '').trim();
  return normalized || null;
};

const asFiniteNumber = value => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export function customerQuoteScopeFromEstimate(estimate) {
  const frozenLines = estimate?.intake_answers?.pricingSnapshot?.lineItems;
  const savedLines = estimate?.intake_answers?.lineItems;
  const source = Array.isArray(frozenLines) && frozenLines.length
    ? frozenLines
    : (Array.isArray(savedLines) ? savedLines : []);

  return source.map((line, index) => {
    const quantity = asFiniteNumber(line?.answers?.quantity);
    return {
      id: asNonEmptyString(line?.id) || `quote-line-${index + 1}`,
      canonical_sku: asNonEmptyString(line?.canonicalSku),
      service_name: asNonEmptyString(line?.serviceName),
      description: asNonEmptyString(line?.answers?.scope_summary)
        || asNonEmptyString(line?.answers?.description),
      quantity: quantity !== null && quantity > 0 ? quantity : 1,
      component_role: asNonEmptyString(line?.componentRole) || 'PRIMARY',
      line_total: asFiniteNumber(line?.calculation?.estimatedTotal),
    };
  });
}

export function isCustomerQuoteScopeComplete(scope) {
  return Array.isArray(scope)
    && scope.length > 0
    && scope.every(line => (
      Boolean(asNonEmptyString(line?.canonical_sku))
      && Boolean(asNonEmptyString(line?.service_name))
      && asFiniteNumber(line?.line_total) !== null
      && Number(line.line_total) >= 0
    ));
}


export function canApproveCustomerQuote(estimate) {
  return isCustomerQuoteScopeComplete(customerQuoteScopeFromEstimate(estimate));
}
