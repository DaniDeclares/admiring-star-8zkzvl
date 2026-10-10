#!/usr/bin/env node
// Read-only Shopify revenue readiness check. Never log tokens, customers, or order details.
const domain = process.env.SHOPIFY_SHOP_DOMAIN;
const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
if (!domain || !token || !/^[a-z0-9-]+\.myshopify\.com$/.test(domain)) {
  console.error('CONFIGURATION_REQUIRED: Shopify Admin shop domain/token not configured');
  process.exit(2);
}
const query = `query RevenueReadiness {
  products(first: 100) {
    edges { node { id title status productType featuredMedia { ... on MediaImage { id } } } }
    pageInfo { hasNextPage }
  }
  orders(first: 50, sortKey: CREATED_AT, reverse: true) { edges { node { id test tags displayFinancialStatus currentTotalPriceSet { shopMoney { amount currencyCode } } } } pageInfo { hasNextPage } }
}`;
const response = await fetch('https://' + domain + '/admin/api/2025-10/graphql.json', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
  body: JSON.stringify({ query }),
  signal: AbortSignal.timeout(20000)
});
if (!response.ok) { console.error('SHOPIFY_READ_FAILED status=' + response.status); process.exit(2); }
const body = await response.json();
if (body.errors?.length || !body.data?.products) { console.error('SHOPIFY_QUERY_FAILED'); process.exit(2); }
const products = body.data.products.edges.map(x => x.node);
const activeDigital = products.filter(p => p.status === 'ACTIVE' && (/kit|planner/i.test(p.title)));
const missingImages = activeDigital.filter(p => !p.featuredMedia).map(p => ({ id: p.id, title: p.title }));
// An order existing is not proof of collected revenue, much less a customer download.
// Inspect only the most recent 50: do not claim lifetime absence when pagination remains.
const orders = body.data.orders?.edges?.map(x => x.node) || [];
const paidNonTestOrders = orders.filter(order =>
  order.test === false
  && !(order.tags || []).some(tag => String(tag).toUpperCase() === 'TEST')
  && order.displayFinancialStatus === 'PAID'
  && Number(order.currentTotalPriceSet?.shopMoney?.amount || 0) > 0);
const pricedDraftDigital = products.filter(p => p.status === 'DRAFT' && /kit|planner|binder/i.test(p.title));
const result = { checkedAt: new Date().toISOString(), scanned: products.length,
  incompleteScan: body.data.products.pageInfo.hasNextPage,
  activeDigital: activeDigital.length, missingImages,
  hasOrders: orders.length > 0,
  inspectedOrders: orders.length,
  ordersScanIncomplete: Boolean(body.data.orders?.pageInfo?.hasNextPage),
  paidNonTestOrdersObserved: paidNonTestOrders.length,
  draftDigitalCount: pricedDraftDigital.length,
  deliveryVerified: false, // Requires Digital Products buyer-file proof; Admin order status cannot establish it.

  findings: [] };
if (result.incompleteScan) result.findings.push('CATALOG_SCAN_INCOMPLETE');
if (missingImages.length) result.findings.push('ACTIVE_DIGITAL_MISSING_COVER');
if (activeDigital.length === 0) result.findings.push('NO_ACTIVE_DIGITAL_PRODUCTS');
if (orders.length > 0 && paidNonTestOrders.length === 0) result.findings.push('NO_PAID_NON_TEST_ORDER_IN_RECENT_SAMPLE');
if (result.ordersScanIncomplete) result.findings.push('ORDER_SAMPLE_NOT_EXHAUSTIVE');
if (pricedDraftDigital.length) result.findings.push('DIGITAL_DRAFTS_REQUIRE_RELEASE_GATES');
result.findings.push('BUYER_DIGITAL_DELIVERY_NOT_VERIFIED_BY_THIS_WATCH');
console.log(JSON.stringify(result));
if (result.incompleteScan) process.exitCode = 1;
