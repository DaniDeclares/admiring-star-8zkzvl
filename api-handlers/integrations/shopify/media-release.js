// DANI product-media release rail for Shopify.
//
// A release is a folder in the private Supabase bucket dd-product-release-assets:
//   <release_key>/manifest.json   (owner-approved mapping, see src/lib/shopifyMediaRelease.js)
//   <release_key>/<images>
// Modes:
//   upload_url   - (staff) one-time signed upload URL for one image in a release folder; never overwrites
//   put_manifest - (staff) store a validated manifest after checking every image's SHA-256 in the bucket;
//                  only an owner session with approve=true marks it READY and records the approval
//   plan   - read-only diff of what would change (default)
//   attach - add missing release images to EXISTING products, then put them first
//   retire - detach the old images, only for products whose release images are
//            all attached and READY, and only with confirm=true (or a manifest
//            that sets retire_replaced_media=true when run by the daily cron).
// Retiring detaches media from the product (fileUpdate referencesToRemove); the
// file stays in Shopify Files, so the step is reversible.
// The rail never creates products, publishes, or touches price, SKU, inventory,
// fulfillment, channels, or digital-download attachments.

import { createHash } from 'node:crypto';
import { requireStaff, logIntegrationEvent } from '../../_integrationOAuth.js';
import { SHOPIFY_ADAPTER, adminSupabase, ensureShopifyConnection, isCronRequest, readJsonBody, shopifyGraphQL, userErrorsOf } from '../../_shopifyAdmin.js';
import { RELEASE_BUCKET, applyOwnerApproval, assetAttachKey, releaseUploadPath, planProductMedia, reorderMoves, retireCandidates, toProductGid, validateManifest } from '../../../src/lib/shopifyMediaRelease.js';

const TIME_BUDGET_MS = 45_000;
const SIGNED_URL_SECONDS = 60 * 60;

const PRODUCT_QUERY = `query DaniReleaseProduct($id: ID!) {
  product(id: $id) {
    id title status
    media(first: 50) { nodes { id status alt mediaContentType } }
  }
}`;

const ATTACH_MUTATION = `mutation DaniReleaseAttach($product: ProductUpdateInput!, $media: [CreateMediaInput!]) {
  productUpdate(product: $product, media: $media) {
    product { id media(first: 50) { nodes { id status alt } } }
    userErrors { field message }
  }
}`;

const REORDER_MUTATION = `mutation DaniReleaseReorder($id: ID!, $moves: [MoveInput!]!) {
  productReorderMedia(id: $id, moves: $moves) { job { id } mediaUserErrors { field message } }
}`;

const DETACH_MUTATION = `mutation DaniReleaseDetach($files: [FileUpdateInput!]!) {
  fileUpdate(files: $files) { files { id } userErrors { field message } }
}`;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function loadManifest(supabase, releaseKey) {
  const { data, error } = await supabase.storage.from(RELEASE_BUCKET).download(`${releaseKey}/manifest.json`);
  if (error) throw Object.assign(new Error(`MANIFEST_NOT_FOUND:${releaseKey}`), { status: 404 });
  const manifest = JSON.parse(await data.text());
  const validation = validateManifest(manifest);
  if (!validation.ok) throw Object.assign(new Error(`MANIFEST_INVALID:${validation.errors.join(',')}`), { status: 422 });
  if (manifest.release_key !== releaseKey) throw Object.assign(new Error('MANIFEST_RELEASE_KEY_MISMATCH'), { status: 422 });
  return manifest;
}

async function listReadyReleases(supabase) {
  const { data, error } = await supabase.storage.from(RELEASE_BUCKET).list('', { limit: 100 });
  if (error) throw error;
  const keys = (data || []).filter(item => !item.id).map(item => item.name); // folders have no id
  const releases = [];
  for (const key of keys) {
    try {
      const manifest = await loadManifest(supabase, key);
      if (manifest.status === 'READY') releases.push(manifest);
    } catch (error) {
      await logIntegrationEvent({ supabase, adapterCode: SHOPIFY_ADAPTER, direction: 'OUTBOUND', eventType: 'MEDIA_RELEASE_SKIPPED', status: 'IGNORED', payload: { release_key: key }, errorMessage: error.message });
    }
  }
  return releases;
}

async function attachedMap(supabase, releaseKey) {
  const { data, error } = await supabase.from('dd_integration_event_log')
    .select('external_event_id,payload')
    .eq('adapter_code', SHOPIFY_ADAPTER).eq('event_type', 'MEDIA_ATTACHED').eq('status', 'PROCESSED')
    .contains('payload', { release_key: releaseKey });
  if (error) throw error;
  const map = new Map();
  for (const row of data || []) if (row.external_event_id && row.payload?.media_id) map.set(row.external_event_id, row.payload.media_id);
  return map;
}

async function readProduct(supabase, productGid) {
  const { data } = await shopifyGraphQL({ supabase, query: PRODUCT_QUERY, variables: { id: productGid } });
  if (!data?.product) throw Object.assign(new Error(`PRODUCT_NOT_FOUND:${productGid}`), { status: 404 });
  return data.product;
}

async function signedUrl(supabase, path) {
  const { data, error } = await supabase.storage.from(RELEASE_BUCKET).createSignedUrl(path, SIGNED_URL_SECONDS);
  if (error || !data?.signedUrl) throw new Error(`ASSET_MISSING:${path}`);
  return data.signedUrl;
}

async function processProduct({ supabase, manifest, entry, mode, allowRetire }) {
  const productGid = toProductGid(entry.shopify_product_id);
  const product = await readProduct(supabase, productGid);
  const result = { product: productGid, title: product.title, status: product.status, actions: [] };
  if (product.title !== entry.expected_title) {
    result.blocked = `TITLE_MISMATCH: Shopify has "${product.title}"`;
    return result;
  }
  const attachedByKey = await attachedMap(supabase, manifest.release_key);
  let plan = planProductMedia({ productGid, assets: entry.assets, currentMedia: product.media.nodes, attachedByKey });
  result.plan = { to_attach: plan.toAttach.map(a => a.path), attached: plan.attached.map(a => a.asset.path), other_media: plan.otherMedia.length, release_ready: plan.releaseReady };
  if (mode === 'plan') return result;

  if (plan.toAttach.length) {
    const before = new Set(product.media.nodes.map(m => m.id));
    const media = [];
    for (const asset of plan.toAttach) media.push({ originalSource: await signedUrl(supabase, asset.path), alt: asset.alt, mediaContentType: 'IMAGE' });
    const { data } = await shopifyGraphQL({ supabase, query: ATTACH_MUTATION, variables: { product: { id: productGid }, media } });
    const errors = userErrorsOf(data?.productUpdate);
    if (errors) throw new Error(`ATTACH_FAILED:${errors}`);
    const created = (data.productUpdate.product.media.nodes || []).filter(m => !before.has(m.id));
    // Shopify returns new media in input order.
    for (const [index, asset] of plan.toAttach.entries()) {
      const mediaId = created[index]?.id;
      if (!mediaId) throw new Error(`ATTACH_UNCONFIRMED:${asset.path}`);
      await logIntegrationEvent({ supabase, adapterCode: SHOPIFY_ADAPTER, direction: 'OUTBOUND', eventType: 'MEDIA_ATTACHED', externalEventId: assetAttachKey(productGid, asset), status: 'PROCESSED', payload: { release_key: manifest.release_key, product: productGid, path: asset.path, sha256: asset.sha256, media_id: mediaId } });
      result.actions.push({ attached: asset.path, media_id: mediaId });
    }
  }

  // Wait for Shopify to finish processing, then put release images first.
  let current = product.media.nodes;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    current = (await readProduct(supabase, productGid)).media.nodes;
    plan = planProductMedia({ productGid, assets: entry.assets, currentMedia: current, attachedByKey: await attachedMap(supabase, manifest.release_key) });
    if (plan.releaseReady || plan.attached.some(item => current.find(m => m.id === item.mediaId)?.status === 'FAILED')) break;
    await sleep(2500);
  }
  const failed = plan.attached.filter(item => current.find(m => m.id === item.mediaId)?.status === 'FAILED');
  if (failed.length) {
    result.blocked = `MEDIA_PROCESSING_FAILED:${failed.map(f => f.asset.path).join(',')}`;
    return result;
  }
  const moves = reorderMoves({ attached: plan.attached, currentMedia: current });
  if (moves.length) {
    const { data } = await shopifyGraphQL({ supabase, query: REORDER_MUTATION, variables: { id: productGid, moves } });
    const errors = userErrorsOf(data?.productReorderMedia);
    if (errors) throw new Error(`REORDER_FAILED:${errors}`);
    result.actions.push({ reordered: moves.length });
  }
  result.release_ready = plan.releaseReady;

  if (mode === 'retire') {
    const retire = retireCandidates(plan);
    if (!plan.releaseReady) result.retire_skipped = 'RELEASE_IMAGES_NOT_ALL_READY';
    else if (!allowRetire) result.retire_skipped = 'CONFIRM_REQUIRED';
    else if (retire.length) {
      const { data } = await shopifyGraphQL({ supabase, query: DETACH_MUTATION, variables: { files: retire.map(id => ({ id, referencesToRemove: [productGid] })) } });
      const errors = userErrorsOf(data?.fileUpdate);
      if (errors) throw new Error(`RETIRE_FAILED:${errors}`);
      await logIntegrationEvent({ supabase, adapterCode: SHOPIFY_ADAPTER, direction: 'OUTBOUND', eventType: 'MEDIA_RETIRED', status: 'PROCESSED', payload: { release_key: manifest.release_key, product: productGid, detached_media_ids: retire } });
      result.actions.push({ retired: retire });
    }
  }
  return result;
}

async function createUploadUrl(supabase, params) {
  const path = releaseUploadPath(params.release_key, params.file_name);
  if (!path) throw Object.assign(new Error('UPLOAD_PATH_INVALID'), { status: 400 });
  const { data, error } = await supabase.storage.from(RELEASE_BUCKET).createSignedUploadUrl(path, { upsert: false });
  if (error) throw Object.assign(new Error(`UPLOAD_URL_FAILED:${error.message}`), { status: /exist/i.test(error.message) ? 409 : 500 });
  return { path, signed_url: data.signedUrl, expires_in_seconds: 7200 };
}

async function putManifest(supabase, params, staff) {
  const incoming = typeof params.manifest === 'string' ? JSON.parse(params.manifest) : params.manifest;
  if (!incoming || typeof incoming !== 'object') throw Object.assign(new Error('MANIFEST_REQUIRED'), { status: 400 });
  const isOwner = staff?.role === 'owner' && staff?.governedRole === 'OWNER_OPERATOR';
  const approval = applyOwnerApproval(incoming, { approve: params.approve === true, isOwner, actor: staff?.user?.id || null });
  if (!approval.ok) throw Object.assign(new Error(approval.error), { status: 403 });
  const manifest = approval.manifest;
  const validation = validateManifest(manifest);
  if (!validation.ok) throw Object.assign(new Error(`MANIFEST_INVALID:${validation.errors.join(',')}`), { status: 422 });
  const mismatches = [];
  for (const entry of manifest.products) {
    for (const asset of entry.assets) {
      const { data, error } = await supabase.storage.from(RELEASE_BUCKET).download(asset.path);
      if (error || !data) { mismatches.push(`${asset.path}:MISSING`); continue; }
      const digest = createHash('sha256').update(Buffer.from(await data.arrayBuffer())).digest('hex');
      if (digest !== asset.sha256) mismatches.push(`${asset.path}:SHA256_MISMATCH`);
    }
  }
  if (mismatches.length) throw Object.assign(new Error(`ASSETS_NOT_VERIFIED:${mismatches.join(',')}`), { status: 422 });
  const body = Buffer.from(JSON.stringify(manifest, null, 2));
  const { error } = await supabase.storage.from(RELEASE_BUCKET).upload(`${manifest.release_key}/manifest.json`, body, { contentType: 'application/json', upsert: true });
  if (error) throw new Error(`MANIFEST_STORE_FAILED:${error.message}`);
  await logIntegrationEvent({ supabase, adapterCode: SHOPIFY_ADAPTER, direction: 'OUTBOUND', eventType: manifest.status === 'READY' ? 'RELEASE_APPROVED' : 'RELEASE_MANIFEST_STORED', status: 'PROCESSED', payload: { release_key: manifest.release_key, status: manifest.status, products: manifest.products.length, assets: manifest.products.reduce((n, p) => n + p.assets.length, 0), approval: manifest.approval || null } });
  return { release_key: manifest.release_key, status: manifest.status, approval: manifest.approval || null, assets_verified: manifest.products.reduce((n, p) => n + p.assets.length, 0) };
}

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ success: false, error: 'Method not allowed' });
  const supabase = adminSupabase();
  const startedAt = Date.now();
  try {
    const cron = isCronRequest(req);
    const staff = cron ? null : await requireStaff(req);
    const body = req.method === 'POST' ? await readJsonBody(req) : {};
    const params = { ...(req.query || {}), ...body };
    const mode = cron ? 'sync' : String(params.mode || 'plan');
    if (!['plan', 'attach', 'retire', 'sync', 'upload_url', 'put_manifest'].includes(mode)) return res.status(400).json({ success: false, error: 'MODE_INVALID' });
    if (mode === 'sync' && !cron) return res.status(400).json({ success: false, error: 'MODE_INVALID' });
    if (mode === 'upload_url') return res.status(200).json({ success: true, ...(await createUploadUrl(supabase, params)) });
    if (mode === 'put_manifest') return res.status(200).json({ success: true, ...(await putManifest(supabase, params, staff)) });

    // Scope and shop gate before anything else; also registers the connection.
    const connection = await ensureShopifyConnection({ supabase, authorizedBy: staff?.user?.id || null });
    const manifests = params.release_key ? [await loadManifest(supabase, String(params.release_key))] : await listReadyReleases(supabase);
    const results = [];
    for (const manifest of manifests) {
      if (manifest.status === 'HOLD') { results.push({ release_key: manifest.release_key, skipped: 'HOLD' }); continue; }
      const productFilter = params.product_id ? toProductGid(params.product_id) : null;
      // The daily cron attaches, and retires only when the owner pre-approved it in the manifest.
      const effectiveMode = mode === 'sync' ? (manifest.retire_replaced_media ? 'retire' : 'attach') : mode;
      const allowRetire = effectiveMode === 'retire' && (params.confirm === true || params.confirm === 'true' || (mode === 'sync' && manifest.retire_replaced_media === true));
      const products = [];
      for (const entry of manifest.products) {
        if (productFilter && toProductGid(entry.shopify_product_id) !== productFilter) continue;
        if (Date.now() - startedAt > TIME_BUDGET_MS) { products.push({ product: entry.shopify_product_id, deferred: 'TIME_BUDGET' }); continue; }
        try {
          products.push(await processProduct({ supabase, manifest, entry, mode: effectiveMode, allowRetire }));
        } catch (error) {
          await logIntegrationEvent({ supabase, adapterCode: SHOPIFY_ADAPTER, direction: 'OUTBOUND', eventType: 'MEDIA_RELEASE_PRODUCT_FAILED', status: 'FAILED', payload: { release_key: manifest.release_key, product: entry.shopify_product_id }, errorMessage: String(error.message).slice(0, 500) });
          products.push({ product: entry.shopify_product_id, error: error.message });
        }
      }
      results.push({ release_key: manifest.release_key, mode: effectiveMode, products });
    }
    const failed = results.some(r => (r.products || []).some(p => p.error));
    return res.status(failed ? 207 : 200).json({ success: !failed, grant: connection.grant, results });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, error: error.message || 'MEDIA_RELEASE_FAILED', code: error.code || null });
  }
}
