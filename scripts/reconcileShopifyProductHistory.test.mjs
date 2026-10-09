import test from 'node:test';
import assert from 'node:assert/strict';
import {planRecovery} from './reconcileShopifyProductHistory.mjs';
const item={key:'cookout-small',title:'Small Cookout Crew event package',sku:'COOK-S',governedSku:'COOK-S',approval:{status:'APPROVED',evidenceId:'approval-1'},price:{amount:'100.00',currency:'USD',evidenceId:'price-1'},production:{assetId:'art-1',fulfillmentVerified:true}};
test('unverified history never creates products',()=>{
 const p=planRecovery({historical:[{...item,approval:{status:'UNVERIFIED'}}],shopify:[],governed:[{sku:'COOK-S'}]});
 assert.equal(p[0].action,'HOLD');
});
test('exact Shopify match is reconciled, not duplicated',()=>{
 const p=planRecovery({historical:[item],shopify:[{id:'gid://shopify/Product/1',title:item.title,variants:[{sku:'COOK-S'}]}],governed:[{sku:'COOK-S'}]});
 assert.equal(p[0].action,'EXISTING_RECONCILE');
});
test('unmatched verified product is only eligible for draft',()=>{
 const p=planRecovery({historical:[item],shopify:[],governed:[{sku:'COOK-S'}]});
 assert.equal(p[0].action,'CREATE_DRAFT');
});
test('possible duplicate is held',()=>{
 const p=planRecovery({historical:[item],shopify:[{id:'gid://shopify/Product/2',title:'Small Cookout Crew event package - 2025',variants:[]}],governed:[{sku:'COOK-S'}]});
 assert.equal(p[0].action,'HOLD');
});
test('missing live governed record blocks creation',()=>{
 const p=planRecovery({historical:[item],shopify:[],governed:[]});
 assert.equal(p[0].action,'HOLD');
});
