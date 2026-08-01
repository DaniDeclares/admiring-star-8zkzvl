const BUNDLE_RULES = {
  'PO-101': ['photo-documentation', 'key-delivery'],
  'PO-102': ['photo-documentation', 'welcome-basket'],
  'PO-108': ['photo-documentation', 'guest-ready-restock'],
  'ND-308': ['document-packaging', 'courier-delivery'],
  'BP-505': ['mailing-envelope', 'document-filing'],
  'EV-401': ['event-signage', 'refreshment-station']
};

export function getSuggestedAddOns(serviceCode, options = {}) {
  const normalizedCode = String(serviceCode || '').toUpperCase();
  const baseRules = BUNDLE_RULES[normalizedCode] || [];
  const unitCount = options.unitCount || 1;

  if (normalizedCode.startsWith('PO-') && unitCount > 1) {
    return [...new Set([...baseRules, 'bulk-discount-review'])];
  }

  return baseRules;
}
