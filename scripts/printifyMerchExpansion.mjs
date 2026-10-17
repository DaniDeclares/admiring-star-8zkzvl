// Existing DANI merchandise authority -> Printify draft creation.
// No AI artwork generation. No blind provider/variant IDs. No unattended publishing.
import { listPrintifyShops, listAllPrintifyProducts, printifyRequest } from './printifyApprovedRelease.mjs';

const clean = x => String(x ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
const finiteInt = n => Number.isSafeInteger(n) && n >= 0;
const tag = sku => 'DANI-SKU-' + String(sku).toUpperCase();
const API = 'https://api.printify.com/v1';

export async function inspectBlueprint({token, blueprintId, providerId, fetcher=fetch}) {
  if (!Number.isInteger(blueprintId) || blueprintId <= 0 || !Number.isInteger(providerId) || providerId <= 0) throw Error('BLUEPRINT_OR_PROVIDER_INVALID');
  const root = API + '/catalog/blueprints/' + blueprintId + '/print_providers/' + providerId;
  const headers = {Authorization:'Bearer '+token, Accept:'application/json'};
  async function get(suffix) {
    const r=await fetcher(root+suffix,{headers,method:'GET',signal:AbortSignal.timeout(20000)});
    if(!r.ok) throw Error('PRINTIFY_CATALOG_HTTP_'+r.status);
    return r.json();
  }
  const [v,s]=await Promise.all([get('/variants.json'),get('/shipping.json')]);
  const variants=Array.isArray(v)?v:v?.variants;
  if(!Array.isArray(variants) || !s) throw Error('PRINTIFY_CATALOG_RESPONSE_UNVERIFIED');
  return {variants,shipping:s};
}

export function assessExpansion({spec,candidate,shops,original,existing,catalog}) {
  const hold=[];
  if(!spec || !candidate || !original || !catalog) return {status:'HOLD',reasons:['MISSING_AUTHORITY_OR_SOURCE']};
  const connected=(shops||[]).find(s=>s.id===String(spec.shopId));
  const sourceShop=(shops||[]).find(s=>s.id===String(spec.sourceShopId));
  if(!connected || !/shopify/i.test(connected.sales_channel) || connected.title!==spec.expectedShopTitle) hold.push('SHOPIFY_CONNECTED_SHOP_UNVERIFIED');
  if(!sourceShop || original.id!==spec.originalId || original.title!==spec.originalTitle || original.is_locked) hold.push('ORIGINAL_PRODUCT_UNVERIFIED');
  if(!spec.candidateKey || candidate.candidate_key!==spec.candidateKey || candidate.canonical_sku!==spec.sku) hold.push('CANONICAL_SKU_MISMATCH');
  if(candidate.verification_state!=='VERIFIED' || candidate.approval_state!=='APPROVED' || candidate.publication_state!=='READY' || !candidate.approved_by || !candidate.approved_at) hold.push('OWNER_RELEASE_APPROVAL_MISSING');
  if(candidate.provenance?.original_artwork_rights_verified!==true || candidate.provenance?.product_specific_print_proof_approved!==true || candidate.provenance?.fulfillment_verified!==true || !(candidate.asset_refs||[]).length) hold.push('ARTWORK_AND_FULFILLMENT_PROOF_MISSING');
  if(spec.audience!=='CUSTOMER_RETAIL' && spec.audience!=='PROVIDER_OPTIONAL_RETAIL') hold.push('AUDIENCE_INVALID');
  if(spec.issuedUniform===true || candidate.design_brief?.provider_gear_policy==='ISSUED_BY_DANI_NOT_PROVIDER_PURCHASE' || candidate.design_brief?.provider_issued_uniform===true) hold.push('REQUIRED_PROVIDER_GEAR_NOT_FOR_SALE');
  if(!spec.title || !spec.description || !spec.sku || !/^[a-z0-9-]{5,80}$/i.test(spec.sku)) hold.push('PRODUCT_IDENTITY_INVALID');
  if((existing||[]).some(p=>p.tags?.includes(tag(spec.sku)) || (clean(p.title) && clean(p.title)===clean(spec.title)))) hold.push('ALREADY_EXISTS_DO_NOT_DUPLICATE');
  if(!Number.isInteger(spec.blueprintId) || !Number.isInteger(spec.providerId)) hold.push('BLUEPRINT_PROVIDER_MISSING');
  if(!spec.imageId || !(original.print_areas||[]).some(a=>(a.placeholders||[]).some(p=>(p.images||[]).some(i=>String(i.id)===String(spec.imageId))))) hold.push('EXISTING_PRINTIFY_ARTWORK_ID_UNVERIFIED');
  const pos=spec.position;
  if(!pos || !pos.name || ![pos.x,pos.y,pos.scale,pos.angle].every(Number.isFinite) || pos.scale<=0 || pos.scale>3 || pos.x<0 || pos.x>1 || pos.y<0 || pos.y>1 || !spec.placementProofApproved) hold.push('NEW_PRODUCT_ARTWORK_PLACEMENT_UNVERIFIED');
  const econ=candidate.economics_snapshot||{};
  if(!finiteInt(econ.approved_price_cents) || econ.approved_price_cents<100 || econ.currency!=='USD' || !econ.approval_evidence_id || !finiteInt(econ.fee_reserve_pct) || !finiteInt(econ.min_net_margin_pct) || econ.min_net_margin_pct<30 || econ.min_net_margin_pct>=100 || econ.demand_validation_passed!==true) hold.push('ECONOMICS_OR_DEMAND_APPROVAL_MISSING');
  if(!Array.isArray(spec.variants) || !spec.variants.length || spec.variants.length>100 || new Set(spec.variants.map(x=>x.id)).size!==spec.variants.length) hold.push('APPROVED_VARIANTS_INVALID');
  const projected=[];
  for(const selected of spec.variants||[]) {
    const v=catalog.variants.find(x=>x.id===selected.id);
    if(!v || v.is_available===false || !Number.isInteger(selected.id)) {hold.push('CATALOG_VARIANT_UNAVAILABLE');continue;}
    // Printify's catalog may describe cost as price (cents); never infer missing fields.
    const cost=finiteInt(v.cost)?v.cost:v.price;
    const shipping=selected.verifiedShippingCents;
    if(!finiteInt(cost) || !finiteInt(shipping) || !selected.shippingEvidenceId || !selected.printAreaCompatible) {hold.push('UNIT_COST_SHIPPING_OR_PRINT_AREA_UNVERIFIED');continue;}
    if(finiteInt(econ.approved_price_cents) && finiteInt(econ.fee_reserve_pct) && finiteInt(econ.min_net_margin_pct)) {
      const fees=Math.ceil(econ.approved_price_cents*econ.fee_reserve_pct/100);
      const net=econ.approved_price_cents-cost-shipping-fees;
      const pct=net/econ.approved_price_cents*100;
      if(pct<econ.min_net_margin_pct) hold.push('MARGIN_BELOW_APPROVED_MINIMUM');
      projected.push({id:selected.id,costCents:cost,shippingCents:shipping,feeReserveCents:fees,projectedContributionCents:net,contributionPct:Number(pct.toFixed(1))});
    }
  }
  return {status:hold.length?'HOLD':'READY_TO_CREATE_DRAFT',reasons:[...new Set(hold)],sku:spec.sku,shopId:String(spec.shopId),projected,shopifyPublished:false};
}

function draftPayload(spec,price) {
  return {title:spec.title,description:spec.description,tags:[tag(spec.sku),spec.audience==='PROVIDER_OPTIONAL_RETAIL'?'optional-provider-retail':'customer-retail'],
    blueprint_id:spec.blueprintId,print_provider_id:spec.providerId,
    variants:spec.variants.map((v,i)=>({id:v.id,price,is_enabled:true,is_default:i===0})),
    print_areas:[{variant_ids:spec.variants.map(v=>v.id),placeholders:[{position:spec.position.name,images:[{id:spec.imageId,x:spec.position.x,y:spec.position.y,scale:spec.position.scale,angle:spec.position.angle}]}]}]};
}

export async function createApprovedExpansionDraft({token,spec,candidate,execute=false,fetcher=fetch,reserve,receipt}) {
  if(!token) throw Error('PRINTIFY_TOKEN_MISSING');
  const shops=await listPrintifyShops({token,fetcher});
  const original=await printifyRequest(token,'/shops/'+spec.sourceShopId+'/products/'+spec.originalId+'.json',{fetcher});
  const existing=await listAllPrintifyProducts({token,shopId:spec.shopId,fetcher});
  const catalog=await inspectBlueprint({token,blueprintId:spec.blueprintId,providerId:spec.providerId,fetcher});
  const plan=assessExpansion({spec,candidate,shops,original,existing,catalog});
  if(!execute || plan.status!=='READY_TO_CREATE_DRAFT') return plan;
  if(process.env.DANI_PRINTIFY_SINGLE_WRITER!=='true' || typeof reserve!=='function' || typeof receipt!=='function') return {...plan,status:'HOLD',reasons:['DURABLE_RESERVATION_AND_WRITEBACK_REQUIRED']};
  // Reserve unique SKU in DANI's existing ledger before any external mutation.
  const claimed=await reserve({candidateId:candidate.id,sku:spec.sku,expectedPublicationState:'READY'});
  if(!claimed?.reserved || !claimed.claimId) return {...plan,status:'HOLD',reasons:['IDEMPOTENCY_RESERVATION_DENIED']};
  const created=await printifyRequest(token,'/shops/'+spec.shopId+'/products.json',{method:'POST',body:draftPayload(spec,candidate.economics_snapshot.approved_price_cents),fetcher});
  if(!created?.id) throw Error('PRINTIFY_CREATE_UNCERTAIN_RECONCILE_BEFORE_RETRY');
  const check=await printifyRequest(token,'/shops/'+spec.shopId+'/products/'+created.id+'.json',{fetcher});
  if(check.id!==created.id || !check.tags?.includes(tag(spec.sku)) || check.visible===true) throw Error('PRINTIFY_DRAFT_READBACK_MISMATCH_RECONCILE_BEFORE_RETRY');
  await receipt({claimId:claimed.claimId,sku:spec.sku,printifyProductId:created.id,state:'PRINTIFY_DRAFT_CREATED_NOT_PUBLISHED'});
  return {status:'PRINTIFY_DRAFT_CREATED_NOT_PUBLISHED',sku:spec.sku,printifyProductId:created.id,shopifyPublished:false};
}
