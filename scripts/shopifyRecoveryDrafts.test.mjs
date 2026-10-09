import test from 'node:test';import assert from 'node:assert/strict';
import {draftEligibility,createApprovedDraft} from './shopifyRecoveryDrafts.mjs';
const row={canonical_sku:'SKU-1',verification_state:'VERIFIED',approval_state:'APPROVED',approved_by:'owner',approved_at:'2026-10-08',publication_state:'READY',economics_snapshot:{approved_price_cents:1900,currency:'USD',approval_evidence_id:'receipt'},asset_refs:['asset'],provenance:{fulfillment_verified:true}};
const historical={key:'kit',title:'Example Kit',governedSku:'SKU-1'};
test('approved missing item eligible',()=>assert.equal(draftEligibility({historical,governed:row,shopify:[]}).eligible,true));
test('existing SKU blocks draft',()=>assert.equal(draftEligibility({historical,governed:row,shopify:[{title:'Other',variants:[{sku:'SKU-1'}]}]}).eligible,false));
test('price evidence required',()=>assert.equal(draftEligibility({historical,governed:{...row,economics_snapshot:{}},shopify:[]}).eligible,false));
test('unapproved candidate held',()=>assert.equal(draftEligibility({historical,governed:{...row,approval_state:'PENDING'},shopify:[]}).eligible,false));
test('no write without execute flag',async()=>assert.deepEqual(await createApprovedDraft({historical,governed:row,execute:false}),{status:'DRY_RUN'}));
