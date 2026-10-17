import test from 'node:test';
import assert from 'node:assert/strict';
import {assessExpansion,createApprovedExpansionDraft} from '../scripts/printifyMerchExpansion.mjs';
const shops=[{id:'1',title:'Source',sales_channel:'disconnected'},{id:'2',title:'My Store 2',sales_channel:'shopify'}];
const original={id:'old',title:'Original Art',print_areas:[{placeholders:[{images:[{id:'approved'}]}]}]};
const spec={shopId:'2',sourceShopId:'1',expectedShopTitle:'My Store 2',originalId:'old',originalTitle:'Original Art',candidateKey:'new-art',sku:'MERCH-NEW-001',audience:'CUSTOMER_RETAIL',title:'Original Art Notebook',description:'Approved merchandise design',blueprintId:1,providerId:2,imageId:'approved',position:{name:'front',x:.5,y:.5,scale:1,angle:0},placementProofApproved:true,variants:[{id:20,verifiedShippingCents:450,shippingEvidenceId:'evidence',printAreaCompatible:true}]};
const candidate={id:'approved-id',candidate_key:'new-art',canonical_sku:'MERCH-NEW-001',verification_state:'VERIFIED',approval_state:'APPROVED',publication_state:'READY',approved_by:'owner',approved_at:'2026-10-16T00:00:00Z',asset_refs:['original-source'],provenance:{original_artwork_rights_verified:true,product_specific_print_proof_approved:true,fulfillment_verified:true},economics_snapshot:{approved_price_cents:2499,currency:'USD',approval_evidence_id:'approved-cost',fee_reserve_pct:5,min_net_margin_pct:30,demand_validation_passed:true}};
const catalog={variants:[{id:20,price:800,is_available:true}],shipping:{profiles:[]}};
const args={spec,candidate,shops,original,existing:[],catalog};
test('approved merchandising can produce a safe draft plan',()=>assert.equal(assessExpansion(args).status,'READY_TO_CREATE_DRAFT'));
test('no private provider uniform in retail',()=>assert.ok(assessExpansion({...args,spec:{...spec,issuedUniform:true}}).reasons.includes('REQUIRED_PROVIDER_GEAR_NOT_FOR_SALE')));
test('do not duplicate published or draft Printify titles',()=>assert.ok(assessExpansion({...args,existing:[{title:spec.title}]}).reasons.includes('ALREADY_EXISTS_DO_NOT_DUPLICATE')));
test('block unapproved merch',()=>assert.ok(assessExpansion({...args,candidate:{...candidate,approval_state:'NOT_REQUESTED'}}).reasons.includes('OWNER_RELEASE_APPROVAL_MISSING')));
test('block missing original image',()=>assert.ok(assessExpansion({...args,spec:{...spec,imageId:'not-in-original'}}).reasons.includes('EXISTING_PRINTIFY_ARTWORK_ID_UNVERIFIED')));
test('block shipping missing or inadequate margin',()=>{assert.ok(assessExpansion({...args,spec:{...spec,variants:[{id:20,verifiedShippingCents:null} ]}}).reasons.includes('UNIT_COST_SHIPPING_OR_PRINT_AREA_UNVERIFIED'));assert.ok(assessExpansion({...args,candidate:{...candidate,economics_snapshot:{...candidate.economics_snapshot,approved_price_cents:1499}}}).reasons.includes('MARGIN_BELOW_APPROVED_MINIMUM'))});
test('block disconnected shop',()=>assert.ok(assessExpansion({...args,shops:[shops[0]]}).reasons.includes('SHOPIFY_CONNECTED_SHOP_UNVERIFIED')));
test('without execute, only GET requests happen',async()=>{
 const calls=[];
 const fetcher=async(url,options)=>{calls.push({url,method:options?.method});let data;
 if(url.endsWith('/shops.json')) data=shops;
 else if(url.endsWith('/shops/1/products/old.json')) data=original;
 else if(url.includes('/shops/2/products.json?')) data={data:[],last_page:1};
 else if(url.endsWith('/variants.json')) data={variants:catalog.variants};
 else if(url.endsWith('/shipping.json')) data={profiles:[]};
 else throw Error('UNEXPECTED_URL: '+url);
 return {ok:true,status:200,json:async()=>data};};
 const result=await createApprovedExpansionDraft({token:'test',spec,candidate,fetcher});
 assert.equal(result.status,'READY_TO_CREATE_DRAFT');
 assert.ok(calls.every(x=>x.method==='GET'));
});


test('user-provided approved art expansion manifest never implies live Printify products', async () => {
  const { readFileSync } = await import('node:fs');
  const m=JSON.parse(readFileSync(new URL('../data/product-production/original-art-merch-expansion-20261016.json', import.meta.url), 'utf8'));
  assert.equal(Object.keys(m.art).length,3);
  assert.equal(m.products.length,6);
  assert.equal(m.originalElevenProductsExisting,true);
  assert.equal(m.policy.noAIReplacementArt,true);
  assert.equal(m.policy.minimumApprovedNetMarginPct,30);
  const skus=m.products.map(p=>p.sku);
  assert.equal(new Set(skus).size,skus.length);
  for(const [family,art] of Object.entries(m.art)) {
    assert.match(art.originalSha256,/^[0-9a-f]{64}$/);
    assert.ok(art.shopifyFilesUrl.startsWith('https://cdn.shopify.com/'));
    assert.ok(art.sourceFile.endsWith('.png'),family);
  }
  for(const p of m.products){
    assert.equal(p.status,'CANDIDATE_NOT_CREATED');
    assert.equal(p.shopifyProductId,null);
    assert.equal(p.printifyProductId,null);
    assert.equal(p.ownerReleaseApproval,false);
    assert.equal(p.itemPrintProofApproved,false);
    assert.equal(p.actualCostVerified,false);
    assert.equal(p.priceApprovedForThisProduct,false);
    assert.equal(p.sourceOriginalArtSha256,m.art[p.artFamily].originalSha256);
    if(p.audience==='PROVIDER_OPTIONAL_RETAIL')assert.equal(m.policy.issuedUniformsCompanyPaid,true);
  }
  assert.equal(m.holdForEmbroidery.length,2);
});
