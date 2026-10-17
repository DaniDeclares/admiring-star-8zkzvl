// Printify merchandise source-to-connected-shop release. Uses existing Printify API
// credentials and approved DANI commercial evidence; NEVER generates replacement art.
// Default is inspection/dry-run. Create and publish are separate explicit actions.
import { readFile } from 'node:fs/promises';

const BASE = 'https://api.printify.com/v1';
const tagFor = sku => 'DANI-SKU-' + sku.toUpperCase();

export async function printifyRequest(token, path, { method = 'GET', body, fetcher = fetch } = {}) {
  if (!token) throw Error('PRINTIFY_TOKEN_MISSING');
  if (!(path === '/shops.json' || /^\/shops\/[0-9]+\/products(?:\.json|\/[a-zA-Z0-9]+(?:\.json|\/publish\.json))$/.test(path))) {
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
  if (!/^[0-9]+$/.test(String(shopId))) throw Error('PRINTIFY_SHOP_ID_INVALID');
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
  if (!created?.id) {
    return { status: 'PRINTIFY_CREATE_UNCONFIRMED', productId: null, shopId: String(targetShopId), reasons: ['PRINTIFY_CREATE_READBACK_MISSING'] };
  }
  let verified;
  try {
    verified = await printifyRequest(token, '/shops/' + targetShopId + '/products/' + created.id + '.json', { fetcher });
  } catch (error) {
    return { status: 'PRINTIFY_CREATE_UNCONFIRMED', productId: created.id, shopId: String(targetShopId), reasons: [error.message] };
  }
  if (verified.id !== created.id || verified.title !== (approval.destinationTitle || source.title) ||
      !(verified.tags || []).includes(tagFor(approval.canonicalSku))) {
    return { status: 'PRINTIFY_CREATE_UNCONFIRMED', productId: created.id, shopId: String(targetShopId), reasons: ['PRINTIFY_CREATE_READBACK_MISMATCH'] };
  }
  if (!publish) return { status: 'PRINTIFY_DRAFT_CREATED', productId: created.id, shopId: String(targetShopId), shopifyPublished: false };
  await printifyRequest(token, '/shops/' + targetShopId + '/products/' + created.id + '/publish.json', {
    method: 'POST', body: { title: true, description: true, images: true, variants: true, tags: true }, fetcher
  });
  return { status: 'PRINTIFY_PUBLISH_REQUESTED', productId: created.id, shopId: String(targetShopId), shopifyPublished: 'UNVERIFIED_CHECK_SHOPIFY' };
}


// Existing products in a Shopify-connected Printify shop must be published IN
// PLACE. Cloning would create duplicates and disconnect order reconciliation.
export function assessApprovedExistingPublication({ shops, shopId, product, siblings, approval }) {
  const reasons = [];
  const shop = shops.find(s => s.id === String(shopId));
  if (!shop) reasons.push('SHOP_NOT_ACCESSIBLE');
  if (shop && !/shopify/i.test(shop.sales_channel)) reasons.push('SHOP_NOT_CONNECTED_TO_SHOPIFY');
  if (!approval?.expectedTargetShopTitle || shop?.title !== approval.expectedTargetShopTitle) reasons.push('CONNECTED_SHOP_IDENTITY_MISMATCH');
  if (!product?.id || product?.title !== approval?.expectedSourceTitle) reasons.push('PRODUCT_IDENTITY_MISMATCH');
  if (!approval?.approved || !approval?.approvedBy || !approval?.approvedAt || !approval?.shopifyReleaseApproved) reasons.push('OWNER_RELEASE_NOT_APPROVED');
  if (!approval?.artworkRightsVerified || !approval?.printQualityApproved || !approval?.fulfillmentReviewed) reasons.push('ARTWORK_OR_FULFILLMENT_NOT_VERIFIED');
  if (!approval?.shippingCostApproved || !Number.isSafeInteger(approval?.shippingCostCents) || approval.shippingCostCents < 0 ||
      !Number.isSafeInteger(approval?.minimumPreFeeMarginCents) || approval.minimumPreFeeMarginCents < 1) reasons.push('ECONOMICS_UNVERIFIED');
  if (!approval?.canonicalSku || !/^[a-z0-9-]{4,80}$/i.test(approval.canonicalSku)) reasons.push('CANONICAL_SKU_INVALID');
  if (product?.is_locked) reasons.push('PRINTIFY_PRODUCT_LOCKED');
  const enabled = (product?.variants || []).filter(v => v.is_enabled);
  const ids = approval?.approvedVariantIds;
  if (!enabled.length || !Array.isArray(ids) || !ids.length || ids.length !== enabled.length ||
      new Set(ids).size !== ids.length || !ids.every(id => Number.isInteger(id) && enabled.some(v => v.id === id))) {
    reasons.push('ALL_ENABLED_VARIANTS_MUST_BE_APPROVED');
  }
  if (enabled.some(v => v.is_available !== true)) reasons.push('ENABLED_VARIANT_OUT_OF_STOCK');
  for (const v of enabled) {
    if (!Number.isSafeInteger(v.price) || !Number.isSafeInteger(v.cost) || v.cost < 0 || v.price <= 0 ||
        !Number.isSafeInteger(approval?.shippingCostCents) || !Number.isSafeInteger(approval?.minimumPreFeeMarginCents) ||
        v.price - v.cost - approval.shippingCostCents < approval.minimumPreFeeMarginCents) {
      reasons.push('UNVERIFIED_OR_INSUFFICIENT_VARIANT_MARGIN'); break;
    }
  }
  const areas = product?.print_areas || [];
  if (!areas.length || enabled.some(v => !areas.some(a => a.variant_ids?.includes(v.id))) ||
      areas.some(a => !a.placeholders?.length || a.placeholders.some(p => !p.position ||
        !p.images?.length || p.images.some(i => !i.id || !Number.isFinite(i.x) || !Number.isFinite(i.y) || !Number.isFinite(i.scale))))) {
    reasons.push('ORIGINAL_ARTWORK_PRINT_AREAS_UNVERIFIED');
  }
  if ((siblings || []).some(p => p.id !== product?.id && nameKey(p.title) === nameKey(product?.title))) reasons.push('DUPLICATE_PRODUCT_TITLE_IN_PRINTIFY');
  if (product?.visible === true) return { status: 'ALREADY_PUBLISHED', productId: product.id, shopId: String(shopId), reasons: [...new Set(reasons)], shopifyPublished: 'UNVERIFIED_CHECK_SHOPIFY' };
  return { status: reasons.length ? 'HOLD' : 'READY_TO_PUBLISH_EXISTING', reasons: [...new Set(reasons)], productId: product?.id || null, shopId: String(shopId), approvedVariantCount: enabled.length };
}

export async function publishApprovedExisting({ token, shopId, productId, approval, execute = false, fetcher = fetch }) {
  const shops = await listPrintifyShops({ token, fetcher });
  const product = await printifyRequest(token, '/shops/' + shopId + '/products/' + productId + '.json', { fetcher });
  const siblings = await listAllPrintifyProducts({ token, shopId, fetcher });
  const plan = assessApprovedExistingPublication({ shops, shopId, product, siblings, approval });
  if (plan.status !== 'READY_TO_PUBLISH_EXISTING' || !execute) return plan;
  if (process.env.DANI_PRINTIFY_SINGLE_WRITER !== 'true') return { ...plan, status: 'HOLD', reasons: ['SINGLE_WRITER_LOCK_NOT_CONFIRMED'] };
  // Re-read immediately before mutation: external action is irreversible enough
  // that stale publication, price or inventory must not silently slip through.
  const fresh = await printifyRequest(token, '/shops/' + shopId + '/products/' + productId + '.json', { fetcher });
  const freshPlan = assessApprovedExistingPublication({ shops, shopId, product: fresh, siblings, approval });
  if (freshPlan.status !== 'READY_TO_PUBLISH_EXISTING') return freshPlan;
  await printifyRequest(token, '/shops/' + shopId + '/products/' + productId + '/publish.json', {
    method: 'POST', body: { title: true, description: true, images: true, variants: true, tags: true, keyFeatures: true }, fetcher
  });
  return { status: 'PRINTIFY_PUBLISH_REQUESTED', productId, shopId: String(shopId), shopifyPublished: 'UNVERIFIED_CHECK_SHOPIFY' };
}

export async function releaseApprovedBatch({ token, sourceShopId, targetShopId, products, execute = false, publish = false, fetcher = fetch }) {
  if (!Array.isArray(products) || !products.length || products.length > 30) throw Error('APPROVED_BATCH_SIZE_INVALID');
  if (String(sourceShopId) === String(targetShopId) && execute && !publish) throw Error('EXECUTE_REQUIRES_PUBLISH_FOR_EXISTING');
  const seen = new Set();
  for (const product of products) {
    const name = nameKey(product.expectedSourceTitle);
    if (!name || seen.has(name)) throw Error('DUPLICATE_OR_EMPTY_SOURCE_TITLE');
    seen.add(name);
  }
  const origin = await listAllPrintifyProducts({ token, shopId: sourceShopId, fetcher });
  const results = [];
  // Sequential by design. No concurrent product creation or hidden retries.
  for (const item of products) {
    const matches = origin.filter(p => nameKey(p.title) === nameKey(item.expectedSourceTitle));
    if (matches.length !== 1) {
      results.push({ title: item.expectedSourceTitle, status: 'HOLD', reasons: [matches.length ? 'AMBIGUOUS_SOURCE_TITLE' : 'SOURCE_PRODUCT_NOT_FOUND'] });
      continue;
    }
    const approval = { ...item.approval, expectedSourceTitle: item.expectedSourceTitle };
    try {
      const result = String(sourceShopId) === String(targetShopId)
        ? await publishApprovedExisting({ token, shopId: targetShopId, productId: matches[0].id, approval, execute: execute && publish, fetcher })
        : await releaseApprovedClone({
          token, sourceShopId, targetShopId, productId: matches[0].id,
          approval, execute, publish, fetcher
        });
      results.push({ title: item.expectedSourceTitle, ...result });
    } catch (error) {
      // A failed create might have succeeded remotely; do not retry blindly.
      results.push({ title: item.expectedSourceTitle, status: 'HOLD_RECONCILE_BEFORE_RETRY', reasons: [error.message] });
    }
  }
  return { total: products.length, results, publishConfirmedInShopify: false };
}

async function main() {
  const token = process.env.PRINTIFY_API_TOKEN;
  const shops = await listPrintifyShops({ token });
  if (process.argv.includes('--shops')) { console.log(JSON.stringify({ shops }, null, 2)); return; }
  const manifestPath = process.argv[process.argv.indexOf('--manifest') + 1];
  if (!process.argv.includes('--manifest') || !manifestPath || manifestPath.startsWith('--')) throw Error('MANIFEST_REQUIRED');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const options = {
    token, sourceShopId: manifest.sourceShopId, targetShopId: manifest.targetShopId,
    execute: process.argv.includes('--execute'), publish: process.argv.includes('--publish')
  };
  if (!Array.isArray(manifest.products) && String(options.sourceShopId) === String(options.targetShopId) && options.execute && !options.publish) {
    throw Error('EXECUTE_REQUIRES_PUBLISH_FOR_EXISTING');
  }
  const result = Array.isArray(manifest.products)
    ? await releaseApprovedBatch({ ...options, products: manifest.products })
    : String(options.sourceShopId) === String(options.targetShopId)
      ? await publishApprovedExisting({ token, shopId: options.targetShopId, productId: manifest.sourceProductId, approval: manifest.approval, execute: options.execute && options.publish })
      : await releaseApprovedClone({ ...options, productId: manifest.sourceProductId, approval: manifest.approval });
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
