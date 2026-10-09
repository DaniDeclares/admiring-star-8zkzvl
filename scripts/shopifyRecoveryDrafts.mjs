import {shopifyGraphQL,readAllShopifyProducts,approvedCandidate} from './shopifyRecoveryAdapters.mjs';
// No publishing, no price changes, no unattended creation. Explicit opt-in and exact authority.
export function draftEligibility({historical,governed,shopify}) {
  const reason=[];
  if(!approvedCandidate(governed)) reason.push('GOVERNED_APPROVAL_MISSING');
  if(!historical?.key || !historical?.title || !historical?.governedSku || historical.governedSku!==governed?.canonical_sku) reason.push('IDENTITY_MISMATCH');
  const economics=governed?.economics_snapshot ?? {};
  if(!Number.isSafeInteger(economics.approved_price_cents) || economics.approved_price_cents<=0 || economics.currency!=='USD' || !economics.approval_evidence_id) reason.push('PRICE_AUTHORITY_MISSING');
  if(!Array.isArray(governed?.asset_refs) || !governed.asset_refs.length || !governed?.provenance?.fulfillment_verified) reason.push('FULFILLMENT_NOT_VERIFIED');
  const norm=x=>String(x??'').toLowerCase().replace(/[^a-z0-9]/g,'');
  if(shopify.some(p=>p.variants?.some(v=>norm(v.sku)===norm(governed?.canonical_sku)) || norm(p.title)===norm(historical?.title))) reason.push('ALREADY_EXISTS');
  return {eligible:reason.length===0,reasons:reason};
}
export async function createApprovedDraft({historical,governed,credentials,execute=false,request=shopifyGraphQL}) {
  if(!execute) return {status:'DRY_RUN'};
  // Re-read immediately before mutation to avoid stale snapshot duplicates.
  const existing=await readAllShopifyProducts(credentials,request);
  const gate=draftEligibility({historical,governed,shopify:existing});
  if(!gate.eligible) return {status:'HOLD',reasons:gate.reasons};
  // Product creation only: price/variant association requires a separate governed transaction.
  // A zero-priced product must never be created, even as a draft.
  const cents=governed.economics_snapshot.approved_price_cents;
  const price=(cents/100).toFixed(2);
  const data=await request({...credentials,query:`mutation($input:ProductCreateInput!){productCreate(product:$input){product{id title status variants(first:1){nodes{id price}}}userErrors{field message}}}`,
    variables:{input:{title:historical.title,status:'DRAFT',vendor:'DANI DECLARES LLC',productType:'Governed Recovery',tags:['dani-recovery',historical.key]}}});
  const result=data.productCreate;
  if(result?.userErrors?.length || !result?.product?.id) throw Error('SHOPIFY_DRAFT_CREATE_FAILED');
  // Do not publish or attach price until a separately verified variant pricing path is available.
  return {status:'DRAFT_CREATED_PRICE_NOT_SET',id:result.product.id,approvedPrice:price};
}
