#!/usr/bin/env node
// History-first Shopify recovery. Defaults to read-only dry-run. Fail closed on uncertainty.
import { readFileSync } from 'node:fs';
import {readAllShopifyProducts,readAllGovernedCandidates,approvedCandidate} from './shopifyRecoveryAdapters.mjs';
const catalog = JSON.parse(readFileSync(new URL('../data/shopify-recovery/cookout-history.json', import.meta.url)));
export function planRecovery({ historical, shopify, governed = [] }) {
  const norm = x => String(x ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const products = shopify.map(p => ({ ...p, keys: [p.id,p.handle,p.title,...(p.variants ?? []).map(v=>v.sku)].map(norm).filter(Boolean) }));
  const governedKeys = new Set(governed.flatMap(p=>[p.sku,p.canonical_sku,p.id].map(norm).filter(Boolean)));
  return historical.map(h => {
    const keys = [h.shopifyId,h.handle,h.sku,h.title].map(norm).filter(Boolean);
    const exact = products.filter(p=>keys.some(k=>p.keys.includes(k)));
    const fuzzy = products.filter(p=>norm(h.title) && (norm(p.title).includes(norm(h.title)) || norm(h.title).includes(norm(p.title))));
    const governedMatch = (h.governedSku && governedKeys.has(norm(h.governedSku)));
    const problems = [];
    if (exact.length > 1 || (exact.length === 0 && fuzzy.length)) problems.push('AMBIGUOUS_OR_POSSIBLE_DUPLICATE');
    if (!h.title?.trim() || !h.key?.trim()) problems.push('HISTORICAL_IDENTITY_INCOMPLETE');
    if (!h.approval?.evidenceId || h.approval?.status !== 'APPROVED') problems.push('APPROVAL_NOT_VERIFIED');
    if (!h.price?.amount || !h.price?.currency || !h.price?.evidenceId) problems.push('APPROVED_PRICE_MISSING');
    if (!h.production?.assetId || !h.production?.fulfillmentVerified) problems.push('PRODUCTION_ASSET_OR_FULFILLMENT_UNVERIFIED');
    if (!h.governedSku || !governedMatch) problems.push('GOVERNED_CATALOG_MATCH_UNVERIFIED');
    const action = exact.length === 1 && !problems.includes('AMBIGUOUS_OR_POSSIBLE_DUPLICATE') ? 'EXISTING_RECONCILE' : problems.length ? 'HOLD' : 'CREATE_DRAFT';
    return { key:h.key, title:h.title, action, existingId:exact[0]?.id ?? null, problems };
  });
}
async function main() {
  const domain=process.env.SHOPIFY_SHOP_DOMAIN,token=process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const url=process.env.DANI_CATALOG_API_URL,key=process.env.DANI_CATALOG_API_KEY;
  if(!url || !key) throw Error('GOVERNED_CATALOG_CONFIGURATION_REQUIRED');
  const [shopify,rows]=await Promise.all([
    readAllShopifyProducts({domain,token}),
    readAllGovernedCandidates({url,key})
  ]);
  const governed=rows.filter(approvedCandidate).map(x=>({sku:x.canonical_sku,...x}));
  // Historical artifacts never supply authorization; approval must be from Production.
  const plan=planRecovery({historical:catalog.products,shopify,governed});
  console.log(JSON.stringify({mode:'DRY_RUN',source:catalog.source,scanned:shopify.length,
    governedScanned:rows.length,governedApproved:governed.length,plan},null,2));
}
if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) main().catch(e=>{console.error(e.message);process.exitCode=2});
