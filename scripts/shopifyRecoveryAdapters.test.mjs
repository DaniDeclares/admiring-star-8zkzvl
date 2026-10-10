import test from 'node:test';import assert from 'node:assert/strict';
import {readAllShopifyProducts,readAllGovernedCandidates} from './shopifyRecoveryAdapters.mjs';
test('product and variant cursors both fully scanned',async()=>{
 const calls=[];const request=async ({query,variables})=>{
  calls.push(variables);
  if(query.includes('product(id:')) return {product:{variants:{nodes:[{sku:'B'}],pageInfo:{hasNextPage:false,endCursor:'v2'}}}};
  if(!variables.cursor) return {products:{nodes:[{id:'p1',title:'A',variants:{nodes:[{sku:'A'}],pageInfo:{hasNextPage:true,endCursor:'v1'}}}],pageInfo:{hasNextPage:true,endCursor:'p1'}}};
  return {products:{nodes:[{id:'p2',title:'B',variants:{nodes:[{sku:'C'}],pageInfo:{hasNextPage:false}}}],pageInfo:{hasNextPage:false}}};
 };
 const result=await readAllShopifyProducts({domain:'example.myshopify.com',token:'secret'},request);
 assert.equal(result.length,2);assert.deepEqual(result[0].variants.map(x=>x.sku),['A','B']);assert.equal(calls.length,3);
});
test('stalled Shopify product cursor fails closed',async()=>{
 await assert.rejects(readAllShopifyProducts({},async()=>({products:{nodes:[],pageInfo:{hasNextPage:true,endCursor:null}}})),/CURSOR_STALLED/);
});
test('governed candidate pages continue until short page',async()=>{
 let n=0;const fetcher=async()=>({ok:true,json:async()=>Array.from({length:++n===1?250:3},(_,i)=>({candidate_key:String(i)}))});
 const result=await readAllGovernedCandidates({url:'https://example.supabase.co',key:'test',fetcher});
 assert.equal(result.length,253);assert.equal(n,2);
});
test('failed catalog page aborts without partial success',async()=>{
 await assert.rejects(readAllGovernedCandidates({url:'https://example.supabase.co',key:'test',fetcher:async()=>({ok:false,status:503})}),/GOVERNED_HTTP_503/);
});

import {inspectShopifyReadiness} from './watchShopifyRevenueReadiness.mjs';
test('readiness paginates and retains delivery verification hold', async () => {
 let n=0;
 const request=async () => {
  n++;
  return {products:{nodes:[{id:String(n),title:'Example Kit',status:'ACTIVE',featuredMedia:null}],pageInfo:{hasNextPage:n===1,endCursor:'page'+n}},orders:{nodes:[]}};
 };
 const result=await inspectShopifyReadiness({},request);
 assert.equal(n,2);
 assert.equal(result.scanned,2);
 assert.equal(result.deliveryVerified,false);
 assert.equal(result.deliveryVerificationRequired,true);
 assert.ok(result.findings.includes('ACTIVE_DIGITAL_MISSING_COVER'));
});
test('readiness fails on repeated products', async () => {
 let n=0;
 const request=async () => ({products:{nodes:[{id:'same',title:'Kit',status:'ACTIVE'}],pageInfo:{hasNextPage:++n===1,endCursor:'next'}},orders:{nodes:[]}});
 await assert.rejects(inspectShopifyReadiness({},request),/DUPLICATE_OR_MISSING_ID/);
});
test('readiness rejects missing page data', async () => {
 await assert.rejects(inspectShopifyReadiness({},async () => ({products:null,orders:{nodes:[]}})),/PAGE_INVALID/);
});
