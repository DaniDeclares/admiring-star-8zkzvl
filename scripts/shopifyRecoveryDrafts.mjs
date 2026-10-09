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
  const title=norm(historical?.title),sku=norm(governed?.canonical_sku);
  if(shopify.some(p=>p.variants?.some(v=>sku && norm(v.sku)===sku) || (title && (norm(p.title)===title || norm(p.title).includes(title) || title.includes(norm(p.title)) && norm(p.title).length>5)))) reason.push('ALREADY_EXISTS');
  return {eligible:reason.length===0,reasons:reason};
}
export async function createApprovedDraft({historical,governed,credentials,execute=false,request=shopifyGraphQL}) {
  if(!execute) return {status:'DRY_RUN'};
  // Re-read immediately before mutation to avoid stale snapshot duplicates.
  const existing=await readAllShopifyProducts(credentials,request);
  const gate=draftEligibility({historical,governed,shopify:existing});
  if(!gate.eligible) return {status:'HOLD',reasons:gate.reasons};
  // productSet creates the draft and its approved-priced variant atomically.
  const price=(governed.economics_snapshot.approved_price_cents/100).toFixed(2);
  // A duplicate created concurrently is still possible; unattended writes stay disabled until
  // a durable idempotency reservation and catalog writeback are implemented.
  return {status:'HOLD',reasons:['DURABLE_IDEMPOTENCY_NOT_IMPLEMENTED']};
  /* Disabled pending durable reservation + catalog writeback.
  if(process.env.DANI_SHOPIFY_DRAFT_WRITE_ENABLED !== 'true') return {status:'HOLD',reasons:['DURABLE_IDEMPOTENCY_NOT_CONFIGURED']};
  const data=await request({...credentials,query:`mutation($input:ProductSetInput!){productSet(synchronous:true,input:$input){product{id title status variants(first:10){nodes{sku price}}}userErrors{field message}}}`,
    variables:{input:{title:historical.title,status:'DRAFT',vendor:'DANI DECLARES LLC',productType:'Governed Recovery',tags:['dani-recovery',historical.key],variants:[{sku:governed.canonical_sku,price}]}}});
  const result=data.productSet;
  if(result?.userErrors?.length || !result?.product?.id) throw Error('SHOPIFY_DRAFT_CREATE_FAILED');
  const actual=result.product;
  if(actual.status!=='DRAFT' || !actual.variants?.nodes?.some(v=>v.sku===governed.canonical_sku && Number(v.price)===Number(price))) throw Error('SHOPIFY_DRAFT_READBACK_MISMATCH');
  return {status:'DRAFT_CREATED',id:actual.id,price}; */
}
