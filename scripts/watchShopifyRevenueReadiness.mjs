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
  orders(first: 1, sortKey: CREATED_AT, reverse: true) { edges { node { id } } }
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
const result = { checkedAt: new Date().toISOString(), scanned: products.length,
  incompleteScan: body.data.products.pageInfo.hasNextPage,
  activeDigital: activeDigital.length, missingImages,
  hasOrders: body.data.orders.edges.length > 0,
  findings: [] };
if (result.incompleteScan) result.findings.push('CATALOG_SCAN_INCOMPLETE');
if (missingImages.length) result.findings.push('ACTIVE_DIGITAL_MISSING_COVER');
if (activeDigital.length === 0) result.findings.push('NO_ACTIVE_DIGITAL_PRODUCTS');
console.log(JSON.stringify(result));
if (result.incompleteScan) process.exitCode = 1;
