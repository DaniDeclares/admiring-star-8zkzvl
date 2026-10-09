// Pure release-planning logic for the DANI -> Shopify product media rail.
// No network or database access lives here so the rules can be unit tested.
//
// A release manifest is the owner-approved definition of which prepared images
// belong on which EXISTING Shopify products, in which order. The rail never
// creates products, changes prices/SKUs/inventory/fulfillment, or publishes.

export const RELEASE_BUCKET = 'dd-product-release-assets';
export const ALLOWED_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];

const RELEASE_KEY_RE = /^[a-z0-9][a-z0-9-]{2,63}$/;
const SHA256_RE = /^[0-9a-f]{64}$/;
const PRODUCT_GID_RE = /^gid:\/\/shopify\/Product\/\d+$/;

export function toProductGid(id) {
  const value = String(id || '').trim();
  if (PRODUCT_GID_RE.test(value)) return value;
  if (/^\d+$/.test(value)) return `gid://shopify/Product/${value}`;
  return null;
}

export function validateManifest(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object') return { ok: false, errors: ['MANIFEST_NOT_OBJECT'] };
  const releaseKey = String(manifest.release_key || '');
  if (!RELEASE_KEY_RE.test(releaseKey)) errors.push('RELEASE_KEY_INVALID');
  if (!manifest.shop || !/^[a-z0-9-]+$/.test(String(manifest.shop))) errors.push('SHOP_INVALID');
  if (!['DRAFT', 'READY', 'COMPLETE', 'HOLD'].includes(manifest.status)) errors.push('STATUS_INVALID');
  if (!Array.isArray(manifest.products) || manifest.products.length === 0) errors.push('PRODUCTS_EMPTY');

  const seenProducts = new Set();
  const seenPaths = new Set();
  for (const [index, product] of (manifest.products || []).entries()) {
    const label = `products[${index}]`;
    const gid = toProductGid(product?.shopify_product_id);
    if (!gid) errors.push(`${label}.shopify_product_id_INVALID`);
    else if (seenProducts.has(gid)) errors.push(`${label}.DUPLICATE_PRODUCT`);
    else seenProducts.add(gid);
    if (!product?.expected_title) errors.push(`${label}.expected_title_MISSING`);
    const assets = Array.isArray(product?.assets) ? product.assets : [];
    if (assets.length === 0) errors.push(`${label}.assets_EMPTY`);
    const positions = assets.map(asset => Number(asset?.position));
    const expectedPositions = assets.map((_, i) => i + 1);
    if ([...positions].sort((a, b) => a - b).join(',') !== expectedPositions.join(',')) errors.push(`${label}.positions_NOT_1_TO_N`);
    for (const [assetIndex, asset] of assets.entries()) {
      const assetLabel = `${label}.assets[${assetIndex}]`;
      const assetPath = String(asset?.path || '');
      const ext = assetPath.split('.').pop().toLowerCase();
      if (!assetPath.startsWith(`${releaseKey}/`) || assetPath.includes('..')) errors.push(`${assetLabel}.path_OUTSIDE_RELEASE`);
      if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) errors.push(`${assetLabel}.extension_NOT_IMAGE`);
      if (seenPaths.has(assetPath)) errors.push(`${assetLabel}.DUPLICATE_PATH`);
      seenPaths.add(assetPath);
      if (!SHA256_RE.test(String(asset?.sha256 || ''))) errors.push(`${assetLabel}.sha256_INVALID`);
      if (!asset?.alt || String(asset.alt).length > 512) errors.push(`${assetLabel}.alt_INVALID`);
    }
  }
  return { ok: errors.length === 0, errors };
}

// Stable idempotency key for one asset on one product. Re-running a release
// must never attach the same file twice.
export function assetAttachKey(productGid, asset) {
  return `${productGid}:${asset.sha256}`;
}

// currentMedia: [{ id, status, alt }] as returned by Shopify for the product.
// attachedByKey: Map(assetAttachKey -> mediaId) recovered from DANI's
// integration event log for this release.
export function planProductMedia({ productGid, assets, currentMedia, attachedByKey }) {
  const currentIds = new Set((currentMedia || []).map(media => media.id));
  const ordered = [...assets].sort((a, b) => Number(a.position) - Number(b.position));
  const toAttach = [];
  const attached = [];
  for (const asset of ordered) {
    const mediaId = attachedByKey.get(assetAttachKey(productGid, asset));
    if (mediaId && currentIds.has(mediaId)) attached.push({ asset, mediaId });
    else toAttach.push(asset);
  }
  const releaseMediaIds = new Set(attached.map(item => item.mediaId));
  const otherMedia = (currentMedia || []).filter(media => !releaseMediaIds.has(media.id));
  const releaseReady = toAttach.length === 0
    && attached.every(item => (currentMedia || []).find(media => media.id === item.mediaId)?.status === 'READY');
  return { toAttach, attached, otherMedia, releaseReady };
}

// Moves for productReorderMedia: release images first, in manifest order,
// followed by any other media in their existing relative order.
export function reorderMoves({ attached, currentMedia }) {
  const releaseIds = attached
    .slice()
    .sort((a, b) => Number(a.asset.position) - Number(b.asset.position))
    .map(item => item.mediaId);
  const rest = (currentMedia || []).map(media => media.id).filter(id => !releaseIds.includes(id));
  const desired = [...releaseIds, ...rest];
  const current = (currentMedia || []).map(media => media.id);
  if (desired.join('|') === current.join('|')) return [];
  return desired.map((id, index) => ({ id, newPosition: String(index) }));
}

// Old media may be retired only when every release image for the product is
// attached and READY. Anything else keeps the existing images in place.
export function retireCandidates(plan) {
  if (!plan.releaseReady) return [];
  return plan.otherMedia.map(media => media.id);
}
