import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {requiredScopeComponents,inspectQuoteScope,assertOriginalScopeRetained} from '../src/lib/operations/quoteScopeIntegrity2026.js';

const scope={components:[
 {sku:'DNI-02A-009',name:'Make-Ready Cleaning'},
 {sku:'DNI-02A-016',name:'Punch List'},
 {sku:'DNI-02A-029',name:'Photo Report'}
]};
const catalog=new Map([['DNI-02A-009',{releaseState:'LIVE_READY',governedOfferStatus:'SELL_NOW',fulfillmentGateStatus:'READY'}]]);
test('three requested components stay visible; two unavailable components hold quote',()=>{
 const rows=requiredScopeComponents(scope);
 const r=inspectQuoteScope(rows,rows.map(x=>({serviceSku:x.sku})),catalog);
 assert.equal(r.requestedCount,3);
 assert.equal(r.visibleCount,3);
 assert.equal(r.rows.length,3);
 assert.equal(r.blocking.length,2);
 assert.deepEqual(r.rows.filter(x=>!x.canQuote).map(x=>x.sku),['DNI-02A-016','DNI-02A-029']);
 assert.equal(r.canCreate,false);
});
test('removed required row fails closed instead of silently reducing scope',()=>{
 const r=inspectQuoteScope(requiredScopeComponents(scope),[{serviceSku:'DNI-02A-009'}],catalog);
 assert.equal(r.blocking.length,2);
 assert.throws(()=>assertOriginalScopeRetained(scope,[{serviceSku:'DNI-02A-009'}]),/required components missing/);
});
test('unknown requested SKU is shown and cannot quote',()=>{
 const scope2={components:[{sku:'DNI-02A-009'},{sku:'DNI-FAKE-999'}]};
 const r=inspectQuoteScope(requiredScopeComponents(scope2),scope2.components.map(x=>({serviceSku:x.sku})),catalog);
 assert.equal(r.rows.length,2);assert.equal(r.canCreate,false);
 assert.match(r.rows[1].reason,/not in current authorized/i);
});
test('duplicate required SKU enforces quantity rather than a Set membership',()=>{
 const s={components:[{sku:'DNI-02A-009'},{sku:'DNI-02A-009'}]};
 assert.throws(()=>assertOriginalScopeRetained(s,[{serviceSku:'DNI-02A-009'}]),/missing/);
 assert.equal(inspectQuoteScope(requiredScopeComponents(s),[{serviceSku:'DNI-02A-009'}],catalog).blocking.length,1);
});
test('optional scope component omission does not block required scope',()=>{
 const s={components:[{sku:'DNI-02A-009'},{sku:'DNI-02A-016',is_required:false}]};
 assert.equal(inspectQuoteScope(requiredScopeComponents(s),[{serviceSku:'DNI-02A-009'}],catalog).canCreate,true);
 assert.equal(assertOriginalScopeRetained(s,[{serviceSku:'DNI-02A-009'}]),true);
});
test('non-live and non-ready offered services fail closed',()=>{
 const s={components:[{sku:'DNI-02A-016'}]};
 const rows=requiredScopeComponents(s);
 for(const status of [{releaseState:'HOLD',governedOfferStatus:'SELL_NOW',fulfillmentGateStatus:'READY'},{releaseState:'LIVE_READY',governedOfferStatus:'SELL_NOW',fulfillmentGateStatus:'PENDING'}]){
  assert.equal(inspectQuoteScope(rows,[{serviceSku:'DNI-02A-016'}],new Map([['DNI-02A-016',status]])).canCreate,false);
 }
});
test('all approved saved components pass with original quantities intact',()=>{
 const rows=requiredScopeComponents(scope);
 const approved=new Map(rows.map(x=>[x.sku,{releaseState:'LIVE_READY',governedOfferStatus:'SELL_NOW',fulfillmentGateStatus:'READY'}]));
 const lines=rows.map(x=>({serviceSku:x.sku}));
 assert.equal(inspectQuoteScope(rows,lines,approved).canCreate,true);
 assert.equal(assertOriginalScopeRetained(scope,lines),true);
});
test('staff UI and authoritative createEstimate both consume scope integrity guard',()=>{
 const root=new URL('../src/',import.meta.url);
 const ui=readFileSync(new URL('pages/portal/QuoteBuilderPage.jsx',root),'utf8');
 const api=readFileSync(new URL('lib/operations/quoteBuilder2026.js',root),'utf8');
 assert.match(ui,/scopeIntegrity\.canCreate/);
 assert.match(ui,/scopeIntegrity\.rows\.map/);
 assert.match(api,/assertOriginalScopeRetained\(sourceRequest\.scope_snapshot, requestedLineItems\)/);
});
