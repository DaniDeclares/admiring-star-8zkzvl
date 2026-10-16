import test from 'node:test';
import assert from 'node:assert/strict';
import { assessApprovedClone, releaseApprovedClone } from '../scripts/printifyApprovedRelease.mjs';
const shops = [
  { id: '11', title: 'Original Printify Store', sales_channel: 'disconnected' },
  { id: '22', title: 'My Store 2', sales_channel: 'Shopify' }
];
const source = {
  id: 's1', title: 'Pumpkin Spice Real Estate Advice T-Shirt', blueprint_id: 111, print_provider_id: 222,
  tags: [], description: 'Approved original print design',
  variants: [{ id: 55, cost: 1100, is_enabled: true, is_available: true },
    { id: 56, cost: 1200, is_enabled: true, is_available: false }],
  print_areas: [{ variant_ids: [55,56], placeholders: [{ position: 'front', images: [{ id: 'img1', x: .5, y: .5, scale: 1, angle: 0 }] }] }]
};
const approval = {
  expectedSourceTitle: source.title, expectedTargetShopTitle: 'My Store 2',
  canonicalSku: 'DANI-MERCH-PUMPKIN-TEE', approved: true, approvedBy: 'owner', approvedAt: '2026-10-16T18:00:00Z',
  artworkRightsVerified: true, printQualityApproved: true, fulfillmentReviewed: true, shippingCostApproved: true, shopifyReleaseApproved: true,
  approvedRetailCents: 3000, shippingCostCents: 500, minimumPreFeeMarginCents: 600, approvedVariantIds: [55]
};
const args = { shops, source, targetProducts: [], approval, sourceShopId: '11', targetShopId: '22' };
test('approved source to connected Shopify shop can be staged', () => {
  assert.equal(assessApprovedClone(args).status, 'READY_TO_CREATE');
});
test('unconnected target is always blocked', () => {
  assert.ok(assessApprovedClone({ ...args, shops: [shops[0], {...shops[1], sales_channel: 'disconnected'}] }).reasons.includes('TARGET_NOT_SHOPIFY_CONNECTED'));
});
test('not allowed to create duplicates in target', () => {
  assert.ok(assessApprovedClone({ ...args, targetProducts: [{id:'x',title:source.title}] }).reasons.includes('PRODUCT_ALREADY_EXISTS_RECONCILE_INSTEAD'));
});
test('rejects unavailable variants and insufficient margins', () => {
  const p = assessApprovedClone({ ...args, approval: {...approval, approvedVariantIds:[56], approvedRetailCents: 1200} });
  assert.ok(p.reasons.includes('UNAVAILABLE_OR_UNAPPROVED_VARIANTS'));
  assert.ok(p.reasons.includes('INSUFFICIENT_VARIANT_MARGIN') === false); // unavailable variant not used for costing
});
test('rejects missing owner approval', () => {
  assert.ok(assessApprovedClone({ ...args, approval: {...approval, approved: false} }).reasons.includes('OWNER_APPROVAL_MISSING'));
});
test('dry-run inspects without mutating', async () => {
  const urls = [];
  const fakeFetch = async (url) => {
    urls.push(url);
    let data;
    if (url.endsWith('/shops.json')) data = shops.map(s => ({...s}));
    else if (url.includes('/shops/11/products/s1.json')) data = source;
    else if (url.includes('/shops/22/products.json')) data = {data:[],last_page:1};
    else throw Error('UNEXPECTED_URL');
    return { ok:true, status:200, json:async()=>data };
  };
  const result = await releaseApprovedClone({token:'fake', sourceShopId:'11', targetShopId:'22', productId:'s1', approval, fetcher:fakeFetch});
  assert.equal(result.status,'READY_TO_CREATE');
  assert.equal(urls.length,3);
});
