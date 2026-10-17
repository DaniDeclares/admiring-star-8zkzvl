import test from 'node:test';
import assert from 'node:assert/strict';
import { assessApprovedClone, assessApprovedExistingPublication, publishApprovedExisting, releaseApprovedBatch, releaseApprovedClone } from '../scripts/printifyApprovedRelease.mjs';
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
test('successful create with failed readback returns reconcilable product ID', async () => {
  const prior=process.env.DANI_PRINTIFY_SINGLE_WRITER;
  process.env.DANI_PRINTIFY_SINGLE_WRITER='true';
  const fakeFetch=async(url,options={})=>{
    if(url.endsWith('/shops.json')) return {ok:true,status:200,json:async()=>shops};
    if(url.endsWith('/shops/11/products/s1.json')) return {ok:true,status:200,json:async()=>source};
    if(url.includes('/shops/22/products.json?')) return {ok:true,status:200,json:async()=>({data:[],last_page:1})};
    if(url.endsWith('/shops/22/products.json') && options.method==='POST') return {ok:true,status:200,json:async()=>({id:'created1'})};
    if(url.endsWith('/shops/22/products/created1.json')) return {ok:false,status:503,json:async()=>({})};
    throw Error('UNEXPECTED_URL '+url);
  };
  try {
    const result=await releaseApprovedClone({token:'fake',sourceShopId:'11',targetShopId:'22',productId:'s1',approval,execute:true,fetcher:fakeFetch,reserve:async()=>({reserved:true,claimId:'claim-test'}),receipt:async()=>{}});
    assert.equal(result.status,'PRINTIFY_CREATE_UNCONFIRMED');
    assert.equal(result.productId,'created1');
    assert.deepEqual(result.reasons,['PRINTIFY_HTTP_503']);
  } finally {
    if(prior===undefined) delete process.env.DANI_PRINTIFY_SINGLE_WRITER; else process.env.DANI_PRINTIFY_SINGLE_WRITER=prior;
  }
});
test('successful create with null readback preserves reconcilable product ID', async () => {
  const prior=process.env.DANI_PRINTIFY_SINGLE_WRITER;
  process.env.DANI_PRINTIFY_SINGLE_WRITER='true';
  const fakeFetch=async(url,options={})=>{
    if(url.endsWith('/shops.json')) return {ok:true,status:200,json:async()=>shops};
    if(url.endsWith('/shops/11/products/s1.json')) return {ok:true,status:200,json:async()=>source};
    if(url.includes('/shops/22/products.json?')) return {ok:true,status:200,json:async()=>({data:[],last_page:1})};
    if(url.endsWith('/shops/22/products.json') && options.method==='POST') return {ok:true,status:200,json:async()=>({id:'creatednull'})};
    if(url.endsWith('/shops/22/products/creatednull.json')) return {ok:true,status:200,json:async()=>null};
    throw Error('UNEXPECTED_URL '+url);
  };
  try {
    const result=await releaseApprovedClone({token:'fake',sourceShopId:'11',targetShopId:'22',productId:'s1',approval,execute:true,fetcher:fakeFetch,reserve:async()=>({reserved:true,claimId:'claim-test'}),receipt:async()=>{}});
    assert.equal(result.status,'PRINTIFY_CREATE_UNCONFIRMED');
    assert.equal(result.productId,'creatednull');
    assert.deepEqual(result.reasons,['PRINTIFY_CREATE_READBACK_MISMATCH']);
  } finally {
    if(prior===undefined) delete process.env.DANI_PRINTIFY_SINGLE_WRITER; else process.env.DANI_PRINTIFY_SINGLE_WRITER=prior;
  }
});
test('same-shop execute without publish fails loudly before any API call', async () => {
  await assert.rejects(
    releaseApprovedBatch({token:'fake',sourceShopId:'22',targetShopId:'22',products:[{expectedSourceTitle:'x',approval:{}}],execute:true,publish:false,fetcher:async()=>{throw Error('API_SHOULD_NOT_RUN')}}),
    /EXECUTE_REQUIRES_PUBLISH_FOR_EXISTING/
  );
});

const existingSource = {...source, visible: false, variants: source.variants.map(v=>v.id===56 ? {...v,is_enabled:false,price:3000} : {...v,price:3000})};
const existingApproval = {...approval, approvedRetailCents: 3000};
const existingArgs = {shops, shopId: '22', product: existingSource, siblings:[existingSource], approval: existingApproval};
test('publish existing Printify product, not a duplicate clone', () => {
  assert.equal(assessApprovedExistingPublication(existingArgs).status,'READY_TO_PUBLISH_EXISTING');
});
test('already published Printify product is never republished', () => {
  assert.equal(assessApprovedExistingPublication({...existingArgs,product:{...existingSource,visible:true}}).status,'ALREADY_PUBLISHED');
});
test('existing publication requires the owner-approved retail price', () => {
  const changed={...existingSource,variants:existingSource.variants.map(v=>v.is_enabled?{...v,price:2999}:v)};
  assert.ok(assessApprovedExistingPublication({...existingArgs,product:changed,siblings:[changed]}).reasons.includes('UNVERIFIED_OR_INSUFFICIENT_VARIANT_MARGIN'));
});
test('non-Shopify target and missing commercial proof must hold', () => {
  assert.ok(assessApprovedExistingPublication({...existingArgs,shops:[shops[0]]}).reasons.includes('SHOP_NOT_ACCESSIBLE'));
  assert.ok(assessApprovedExistingPublication({...existingArgs,approval:{...approval,approved:false}}).reasons.includes('OWNER_RELEASE_NOT_APPROVED'));
});
test('do not publish unapproved or unavailable variants', () => {
  assert.ok(assessApprovedExistingPublication({...existingArgs,product:{...existingSource,variants:[{...existingSource.variants[0],is_enabled:true,is_available:false}]}}).reasons.includes('ENABLED_VARIANT_OUT_OF_STOCK'));
  assert.ok(assessApprovedExistingPublication({...existingArgs,product:{...existingSource,variants:[...existingSource.variants.map(v=>({...v,is_enabled:true,is_available:true}))]}}).reasons.includes('ALL_ENABLED_VARIANTS_MUST_BE_APPROVED'));
});
test('existing publication inspection is read-only until authorized',async()=>{
  const accesses = [];
  const fakeFetch=async(url,options)=>{
    accesses.push({url,method:options?.method||'GET'});
    let data;
    if(url.endsWith('/shops.json')) data=shops;
    else if(url.includes('/shops/22/products/s1.json')) data=existingSource;
    else if(url.includes('/shops/22/products.json')) data={data:[existingSource],last_page:1};
    else throw Error('UNEXPECTED_API_CALL');
    return {ok:true,status:200,json:async()=>data};
  };
  const result=await publishApprovedExisting({token:'test',shopId:'22',productId:'s1',approval:existingApproval,fetcher:fakeFetch});
  assert.equal(result.status,'READY_TO_PUBLISH_EXISTING');
  assert.ok(accesses.every(x=>x.method==='GET'));
});

test('execute is held without a durable reservation and writeback contract', async () => {
  const prior=process.env.DANI_PRINTIFY_SINGLE_WRITER;
  process.env.DANI_PRINTIFY_SINGLE_WRITER='true';
  const fakeFetch=async(url,options={})=>{
    if(url.endsWith('/shops.json')) return {ok:true,status:200,json:async()=>shops};
    if(url.endsWith('/shops/11/products/s1.json')) return {ok:true,status:200,json:async()=>source};
    if(url.includes('/shops/22/products.json?')) return {ok:true,status:200,json:async()=>({data:[],last_page:1})};
    throw Error('MUTATION_MUST_NOT_RUN');
  };
  try {
    const result=await releaseApprovedClone({token:'fake',sourceShopId:'11',targetShopId:'22',productId:'s1',approval,execute:true,fetcher:fakeFetch});
    assert.equal(result.status,'HOLD');
    assert.deepEqual(result.reasons,['DURABLE_RESERVATION_AND_WRITEBACK_REQUIRED']);
  } finally {
    if(prior===undefined) delete process.env.DANI_PRINTIFY_SINGLE_WRITER; else process.env.DANI_PRINTIFY_SINGLE_WRITER=prior;
  }
});
test('publish failure preserves created product ID and durable receipt', async () => {
  const prior=process.env.DANI_PRINTIFY_SINGLE_WRITER;
  process.env.DANI_PRINTIFY_SINGLE_WRITER='true';
  const receipts=[];
  const fakeFetch=async(url,options={})=>{
    if(url.endsWith('/shops.json')) return {ok:true,status:200,json:async()=>shops};
    if(url.endsWith('/shops/11/products/s1.json')) return {ok:true,status:200,json:async()=>source};
    if(url.includes('/shops/22/products.json?')) return {ok:true,status:200,json:async()=>({data:[],last_page:1})};
    if(url.endsWith('/shops/22/products.json') && options.method==='POST') return {ok:true,status:200,json:async()=>({id:'created-publish'})};
    if(url.endsWith('/shops/22/products/created-publish.json')) return {ok:true,status:200,json:async()=>({...source,id:'created-publish',title:source.title,tags:['DANI-SKU-'+approval.canonicalSku],variants:[{...source.variants[0],price:3000}]})};
    if(url.endsWith('/shops/22/products/created-publish/publish.json')) return {ok:false,status:503,json:async()=>({})};
    throw Error('UNEXPECTED_URL '+url);
  };
  try {
    const result=await releaseApprovedClone({token:'fake',sourceShopId:'11',targetShopId:'22',productId:'s1',approval,execute:true,publish:true,fetcher:fakeFetch,reserve:async()=>({reserved:true,claimId:'claim-publish'}),receipt:async x=>receipts.push(x)});
    assert.equal(result.status,'PRINTIFY_PUBLISH_UNCONFIRMED');
    assert.equal(result.productId,'created-publish');
    assert.equal(receipts[0].state,'PRINTIFY_PUBLISH_UNCONFIRMED');
  } finally {
    if(prior===undefined) delete process.env.DANI_PRINTIFY_SINGLE_WRITER; else process.env.DANI_PRINTIFY_SINGLE_WRITER=prior;
  }
});
