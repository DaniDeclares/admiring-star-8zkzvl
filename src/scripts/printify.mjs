/**
 * DANI Printify integration safety boundary.
 * Historical version contained unverified blueprint/variant IDs and automatically
 * POSTed dozens of products on execution. That behavior is intentionally disabled.
 * Product creation requires a reviewed catalog release and verified Printify data.
 */
import 'dotenv/config';

const API_BASE = 'https://api.printify.com/v1';

export async function inspectPrintifyShop({ shopId = process.env.PRINTIFY_STORE_ID, token = process.env.PRINTIFY_API_TOKEN } = {}) {
  if (!shopId || !token) throw new Error('Printify shop ID and token are required for read-only inspection.');
  if (!/^\\d+$/.test(String(shopId))) throw new Error('Invalid Printify shop ID.');
  const response = await fetch(`${API_BASE}/shops/${shopId}/products.json`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Printify read-only inspection failed (HTTP ${response.status})`);
  return response.json();
}

export function assessMerchCandidate(candidate) {
  const required = ['title', 'originalArtworkApproved', 'providerAndVariantVerified', 'printCostCents', 'shippingCostCents', 'retailPriceCents', 'fulfillmentReviewed', 'shopifyReleaseApproved'];
  const missing = required.filter(key => candidate?.[key] === undefined || candidate?.[key] === null || candidate?.[key] === '');
  if (missing.length) return { ready: false, reason: 'MISSING_EVIDENCE', missing };
  const cost = Number(candidate.printCostCents) + Number(candidate.shippingCostCents);
  const retail = Number(candidate.retailPriceCents);
  if (!Number.isSafeInteger(cost) || !Number.isSafeInteger(retail) || cost < 0 || retail <= 0) return { ready: false, reason: 'INVALID_ECONOMICS' };
  if (!candidate.originalArtworkApproved || !candidate.providerAndVariantVerified || !candidate.fulfillmentReviewed || !candidate.shopifyReleaseApproved) return { ready: false, reason: 'RELEASE_GATES_NOT_APPROVED' };
  if (retail <= cost) return { ready: false, reason: 'NON_POSITIVE_PRE_FEE_MARGIN' };
  return { ready: true, reason: 'CANDIDATE_EVIDENCE_PRESENT', preFeeMarginCents: retail - cost, note: 'Shopify fees, returns, taxes and channel policy still require governed release validation; this does not publish a product.' };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  console.log('Printify integration is read-only. No products created or published.');
}
