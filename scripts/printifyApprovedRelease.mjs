// Printify merchandise source-to-connected-shop release. Uses existing Printify API
// credentials and approved DANI commercial evidence; NEVER generates replacement art.
// Default is inspection/dry-run. Create and publish are separate explicit actions.
import { readFile } from 'node:fs/promises';

const BASE = 'https://api.printify.com/v1';
const tagFor = sku => 'DANI-SKU-' + sku.toUpperCase();

export async function printifyRequest(token, path, { method = 'GET', body, fetcher = fetch } = {}) {
  if (!token) throw Error('PRINTIFY_TOKEN_MISSING');
  if (!/^\\/(shops\\.json|shops\\/\\d+\\/products(?:\\.json|\\/[^/]+(?:\\.json|\\/publish\\.json)))$/.test(path)) {
    throw Error('PRINTIFY_PATH_NOT_ALLOWED');
  }
  const response = await fetcher(BASE + path, {
    method,
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) throw Error('PRINTIFY_HTTP_' + response.status);
  if (response.status === 204) return {};
  return response.json();
}

export async function listPrintifyShops({ token, fetcher = fetch }) {
  const shops = await printifyRequest(token, '/shops.json', { fetcher });
  if (!Array.isArray(shops)) throw Error('PRINTIFY_SHOPS_RESPONSE_INVALID');
  // No secrets returned, only shop identities and connection state.
  return shops.map(shop => ({ id: String(shop.id), title: String(shop.title || ''), sales_channel: String(shop.sales_channel || '') }));
}

export async function listAllPrintifyProducts({ token, shopId, fetcher = fetch }) {
  if (!/^\\d+$/.test(String(shopId))) throw Error('PRINTIFY_SHOP_ID_INVALID');
  const all = [];
  for (let page = 1; page <= 100; page++) {
    const result = await printifyRequest(token, '/shops/' + shopId + '/products.json', {
      fetcher: (url, options) => fetcher(url + '?limit=50&page=' + page, options)
    });
    if (!Array.isArray(result?.data) || !Number.isInteger(result.last_page)) throw Error('PRINTIFY_PRODUCTS_RESPONSE_INVALID');
    all.push(...result.data);
    if (page >= result.last_page) return all;
  }
  throw Error('PRINTIFY_PRODUCTS_PAGINATION_LIMIT');
}

const nameKey = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
export function assessApprovedClone({ shops, source, targetProducts, approval, sourceShopId, targetShopId }) {
  const reasons = [];
  const target = shops.find(s => s.id === String(targetShopId));
  const original = shops.find(s => s.id === String(sourceShopId));
  if (!original) reasons.push('SOURCE_SHOP_NOT_ACCESSIBLE');
  if (!target) reasons.push('TARGET_SHOP_NOT_ACCESSIBLE');
  if (String(sourceShopId) === String(targetShopId)) reasons.push('SOURCE_AND_TARGET_IDENTICAL');
  if (target && !/shopify/i.test(target.sales_channel)) reasons.push('TARGET_NOT_SHOPIFY_CONNECTED');
  if (target && target.title !== approval?.expectedTargetShopTitle) reasons.push('TARGET_SHOP_TITLE_UNVERIFIED');
  if (!source?.id || source?.title !== approval?.expectedSourceTitle) reasons.push('SOURCE_PRODUCT_UNVERIFIED');
  if (!approval?.canonicalSku || !/^[a-z0-9-]{4,80}$/i.test(approval.canonicalSku)) reasons.push('CANONICAL_SKU_INVALID');
  if (!(approval?.approved === true && approval?.approvedBy && approval?.approvedAt)) reasons.push('OWNER_APPROVAL_MISSING');
  for (const field of ['artworkRightsVerified', 'printQualityApproved', 'fulfillmentReviewed', 'shippingCostApproved', 'shopifyReleaseApproved']) {
    if (approval?.[field] !== true) reasons.push(field.toUpperCase() + '_MISSING');
  }
  if (!Number.isSafeInteger(approval?.approvedRetailCents) || approval.approvedRetailCents <= 0 ||
      !Number.isSafeInteger(approval?.shippingCostCents) || approval.shippingCostCents < 0 ||
      !Number.isSafeInteger(approval?.minimumPreFeeMarginCents) || approval.minimumPreFeeMarginCents < 1) {
    reasons.push('COMMERCIAL_ECONOMICS_MISSING');
  }
  const allowedIds = approval?.approvedVariantIds;
  if (!Array.isArray(allowedIds) || !allowedIds.length ||
      allowedIds.some(id => !Number.isInteger(id) || id <= 0) ||
      new Set(allowedIds || []).size !== (allowedIds || []).length) reasons.push('APPROVED_VARIANTS_INVALID');
  const available = (source?.variants || []).filter(v => allowedIds?.includes(v.id) && v.is_enabled && v.is_available);
  if (!allowedIds?.every(id => available.some(v => v.id === id))) reasons.push('UNAVAILABLE_OR_UNAPPROVED_VARIANTS');
  if (!Number.isInteger(source?.blueprint_id) || !Number.isInteger(source?.print_provider_id)) reasons.push('PROVIDER_ID_UNVERIFIED');
  for (const variant of available) {
    if (!Number.isSafeInteger(variant.cost) || variant.cost < 0 ||
        approval.approvedRetailCents - variant.cost - approval.shippingCostCents < approval.minimumPreFeeMarginCents) {
      reasons.push('INSUFFICIENT_VARIANT_MARGIN');
      break;
    }
  }
  const areas = (source?.print_areas || []).filter(area => area.variant_ids?.some(id => allowedIds?.includes(id)));
  if (!areas.length || areas.some(area => !area.placeholders?.length ||
      area.placeholders.some(p => !p.position || !p.images?.length ||
        p.images.some(image => !image.id || !Number.isFinite(image.x) || !Number.isFinite(image.y) || !Number.isFinite(image.scale))))) {
    reasons.push('PRINT_AREAS_UNVERIFIED');
  }
  const tag = approval?.canonicalSku ? tagFor(approval.canonicalSku) : null;
  const matching = (targetProducts || []).filter(product =>
    (tag && product.tags?.includes(tag)) ||
    (nameKey(product.title) && nameKey(product.title) === nameKey(approval?.destinationTitle || approval?.expectedSourceTitle))
  );
  if (matching.length) reasons.push('PRODUCT_ALREADY_EXISTS_RECONCILE_INSTEAD');
  return {
    status: reasons.length ? 'HOLD' : 'READY_TO_CREATE',
    reasons: [...new Set(reasons)],
    sourceProductId: source?.id || null,
    targetShopId: String(targetShopId || ''),
    targetSalesChannel: target?.sales_channel || null,
    existingProductIds: matching.map(p => p.id),
    approvedVariantCount: available.length
  };
}

function clonePayload(source, approval) {
  const ids = new Set(approval.approvedVariantIds);
  return {
    title: approval.destinationTitle || source.title,
    description: approval.approvedDescription || source.description,
    tags: [...new Set([...(source.tags || []), tagFor(approval.canonicalSku)])],
    blueprint_id: source.blueprint_id,
    print_provider_id: source.print_provider_id,
    variants: source.variants.filter(v => ids.has(v.id)).map(v => ({ id: v.id, price: approval.approvedRetailCents, is_enabled: true })),
    print_areas: source.print_areas.filter(a => a.variant_ids?.some(id => ids.has(id))).map(a => ({
      variant_ids: a.variant_ids.filter(id => ids.has(id)),
      placeholders: a.placeholders.map(p => ({
        position: p.position,
        ...(p.decoration_method ? { decoration_method: p.decoration_method } : {}),
        images: p.images.map(i => ({ id: i.id, x: i.x, y: i.y, scale: i.scale, angle: i.angle || 0 }))
      }))
    }))
  };
}

// The caller is single-writer; concurrent unattended execution is deliberately
// disabled until DANI's existing release ledger provides a durable reservation.
export async function releaseApprovedClone({ token, sourceShopId, targetShopId, productId, approval, execute = false, publish = false, fetcher = fetch }) {
  if (publish && !execute) throw Error('PUBLISH_REQUIRES_EXECUTE');
  const shops = await listPrintifyShops({ token, fetcher });
  const source = await printifyRequest(token, '/shops/' + sourceShopId + '/products/' + productId + '.json', { fetcher });
  const targetProducts = await listAllPrintifyProducts({ token, shopId: targetShopId, fetcher });
  const plan = assessApprovedClone({ shops, source, targetProducts, approval, sourceShopId, targetShopId });
  if (plan.status === 'HOLD' || !execute) return plan;
  if (process.env.DANI_PRINTIFY_SINGLE_WRITER !== 'true') return { ...plan, status: 'HOLD', reasons: ['SINGLE_WRITER_LOCK_NOT_CONFIRMED'] };
  const created = await printifyRequest(token, '/shops/' + targetShopId + '/products.json', {
    method: 'POST', body: clonePayload(source, approval), fetcher
  });
  if (!created?.id) throw Error('PRINTIFY_CREATE_READBACK_MISSING');
  const verified = await printifyRequest(token, '/shops/' + targetShopId + '/products/' + created.id + '.json', { fetcher });
  if (verified.id !== created.id || verified.title !== (approval.destinationTitle || source.title) ||
      !(verified.tags || []).includes(tagFor(approval.canonicalSku))) throw Error('PRINTIFY_CREATE_READBACK_MISMATCH');
  if (!publish) return { status: 'PRINTIFY_DRAFT_CREATED', productId: created.id, shopId: String(targetShopId), shopifyPublished: false };
  await printifyRequest(token, '/shops/' + targetShopId + '/products/' + created.id + '/publish.json', {
    method: 'POST', body: { title: true, description: true, images: true, variants: true, tags: true }, fetcher
  });
  return { status: 'PRINTIFY_PUBLISH_REQUESTED', productId: created.id, shopId: String(targetShopId), shopifyPublished: 'UNVERIFIED_CHECK_SHOPIFY' };
}

async function main() {
  const token = process.env.PRINTIFY_API_TOKEN;
  const shops = await listPrintifyShops({ token });
  if (process.argv.includes('--shops')) { console.log(JSON.stringify({ shops }, null, 2)); return; }
  const manifestPath = process.argv[process.argv.indexOf('--manifest') + 1];
  if (!process.argv.includes('--manifest') || !manifestPath || manifestPath.startsWith('--')) throw Error('MANIFEST_REQUIRED');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const result = await releaseApprovedClone({
    token, sourceShopId: manifest.sourceShopId,
    targetShopId: manifest.targetShopId,
    productId: manifest.sourceProductId, approval: manifest.approval,
    execute: process.argv.includes('--execute'), publish: process.argv.includes('--publish')
  });
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
