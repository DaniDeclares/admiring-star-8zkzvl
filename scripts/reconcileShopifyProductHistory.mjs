#!/usr/bin/env node
// History-first Shopify recovery. Defaults to read-only dry-run. Fail closed on uncertainty.
import { readFileSync } from 'node:fs';
const catalog = JSON.parse(readFileSync(new URL('../data/shopify-recovery/cookout-history.json', import.meta.url)));
export function planRecovery({ historical, shopify, governed = [] }) {
  const norm = x => String(x ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const products = shopify.map(p => ({ ...p, keys: [p.id,p.handle,p.title,...(p.variants ?? []).map(v=>v.sku)].map(norm).filter(Boolean) }));
  const governedKeys = new Set(governed.flatMap(p=>[p.sku,p.canonical_sku,p.id].map(norm).filter(Boolean)));
  return historical.map(h => {
    const keys = [h.shopifyId,h.handle,h.sku,h.title].map(norm).filter(Boolean);
    const exact = products.filter(p=>keys.some(k=>p.keys.includes(k)));
    const fuzzy = products.filter(p=>norm(p.title).includes(norm(h.title)) || norm(h.title).includes(norm(p.title)));
    const governedMatch = (h.governedSku && governedKeys.has(norm(h.governedSku)));
    const problems = [];
    if (exact.length > 1 || (exact.length === 0 && fuzzy.length)) problems.push('AMBIGUOUS_OR_POSSIBLE_DUPLICATE');
    if (!h.approval?.evidenceId || h.approval?.status !== 'APPROVED') problems.push('APPROVAL_NOT_VERIFIED');
    if (!h.price?.amount || !h.price?.currency || !h.price?.evidenceId) problems.push('APPROVED_PRICE_MISSING');
    if (!h.production?.assetId || !h.production?.fulfillmentVerified) problems.push('PRODUCTION_ASSET_OR_FULFILLMENT_UNVERIFIED');
    if (!h.governedSku || !governedMatch) problems.push('GOVERNED_CATALOG_MATCH_UNVERIFIED');
    const action = exact.length === 1 ? 'EXISTING_RECONCILE' : problems.length ? 'HOLD' : 'CREATE_DRAFT';
    return { key:h.key, title:h.title, action, existingId:exact[0]?.id ?? null, problems };
  });
}
async function main() {
  const domain = process.env.SHOPIFY_SHOP_DOMAIN, token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (!domain || !token || !/^[a-z0-9-]+\.myshopify\.com$/.test(domain)) throw Error('SHOPIFY_READ_CREDENTIALS_REQUIRED');
  const products = [];
  let after = null;
  do {
    const q = `query ($after:String) { products(first:100,after:$after) { edges { cursor node { id title handle variants(first:100) { nodes { sku } pageInfo { hasNextPage } } } } pageInfo { hasNextPage endCursor } } }`;
    const res = await fetch('https://' + domain + '/admin/api/2025-10/graphql.json', {method:'POST',headers:{'Content-Type':'application/json','X-Shopify-Access-Token':token},body:JSON.stringify({query:q,variables:{after}}),signal:AbortSignal.timeout(20000)});
    if (!res.ok) throw Error('SHOPIFY_READ_FAILED_'+res.status);
    const body=await res.json();
    if (body.errors?.length || !body.data?.products) throw Error('SHOPIFY_QUERY_FAILED');
    for (const {node} of body.data.products.edges) {
      if (node.variants.pageInfo.hasNextPage) throw Error('VARIANT_SCAN_INCOMPLETE');
      products.push({...node,variants:node.variants.nodes});
    }
    after=body.data.products.pageInfo.hasNextPage ? body.data.products.pageInfo.endCursor : null;
  } while (after);
  // Catalog is a historical lead, not a substitute for the live governed authority.
  // Until a verified governed catalog adapter exists, all unmatched products remain held.
  const plan=planRecovery({historical:catalog.products,shopify:products,governed:[]});
  console.log(JSON.stringify({mode:'DRY_RUN',source:catalog.source,scanned:products.length,plan},null,2));
}
if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) main().catch(e=>{console.error(e.message);process.exitCode=2});
