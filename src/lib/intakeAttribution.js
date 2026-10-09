// Campaign attribution carried from the public request form into the saved service request
// (service_requests.property_details.marketingAttribution). Only a fixed set of short tag
// fields is kept; anything else is dropped. Attribution is evidence of where a request came
// from, never of a sale.
const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'campaign_audience', 'referral_code'];

export function sanitizeMarketingAttribution(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const out = {};
  for (const key of KEYS) {
    const value = input[key];
    if (typeof value !== 'string') continue;
    const clean = value.trim().slice(0, 120).replace(/[^A-Za-z0-9 ._+@:/-]/g, '');
    if (clean) out[key] = clean;
  }
  return Object.keys(out).length ? out : null;
}
