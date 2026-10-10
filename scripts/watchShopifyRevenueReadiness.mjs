#!/usr/bin/env node
// Read-only Shopify revenue readiness check. Never log tokens, customers, or order details.
// Reuse the canonical Shopify transport and fail closed on incomplete catalog evidence.
import { shopifyGraphQL } from './shopifyRecoveryAdapters.mjs';

export async function inspectShopifyReadiness(credentials, request = shopifyGraphQL) {
  const products = [];
  const ids = new Set();
  const cursors = new Set();
  let cursor = null;
  let hasOrders = false;
  do {
    const data = await request({
      ...credentials,
      query: `query RevenueReadiness($cursor:String) {
        products(first:100,after:$cursor) {
          nodes { id title status featuredMedia { ... on MediaImage { id } } }
          pageInfo { hasNextPage endCursor }
        }
        orders(first:1,sortKey:CREATED_AT,reverse:true) { nodes { id } }
      }`,
      variables: { cursor }
    });
    const page = data?.products;
    if (!page || !Array.isArray(page.nodes) || !page.pageInfo ||
        !data.orders || !Array.isArray(data.orders.nodes)) throw Error('SHOPIFY_READINESS_PAGE_INVALID');
    hasOrders ||= data.orders.nodes.length > 0;
    for (const product of page.nodes) {
      if (!product?.id || ids.has(product.id)) throw Error('SHOPIFY_READINESS_DUPLICATE_OR_MISSING_ID');
      ids.add(product.id);
      products.push(product);
    }
    if (!page.pageInfo.hasNextPage) break;
    const next = page.pageInfo.endCursor;
    if (!next || next === cursor || cursors.has(next)) throw Error('SHOPIFY_READINESS_CURSOR_STALLED');
    cursors.add(next);
    cursor = next;
  } while (true);
  const activeDigital = products.filter(p => p.status === 'ACTIVE' && /kit|planner/i.test(p.title ?? ''));
  // Titles are only a heuristic; delivery configuration still requires independent verification.
  const missingImages = activeDigital.filter(p => !p.featuredMedia).map(p => ({ id: p.id, title: p.title }));
  const findings = [];
  if (missingImages.length) findings.push('ACTIVE_DIGITAL_MISSING_COVER');
  if (!activeDigital.length) findings.push('NO_ACTIVE_DIGITAL_PRODUCTS');
  return {
    checkedAt: new Date().toISOString(), scanned: products.length,
    incompleteScan: false, activeDigital: activeDigital.length, missingImages,
    hasOrders, deliveryVerified: false, deliveryVerificationRequired: true, findings
  };
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  const domain = process.env.SHOPIFY_SHOP_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (!domain || !token) {
    console.error('CONFIGURATION_REQUIRED: Shopify Admin shop domain/token not configured');
    process.exitCode = 2;
  } else {
    try {
      const result = await inspectShopifyReadiness({ domain, token });
      console.log(JSON.stringify(result));
      if (result.findings.length) process.exitCode = 1;
    } catch (error) {
      // Avoid leaking upstream response content or credential-bearing URLs.
      console.error('SHOPIFY_READINESS_FAILED code=' + (/^SHOPIFY_[A-Z_0-9]+$/.test(error.message) ? error.message : 'UNEXPECTED'));
      process.exitCode = 2;
    }
  }
}
