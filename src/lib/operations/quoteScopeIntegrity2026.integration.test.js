import {createEstimate} from './quoteBuilder2026.js';

describe('existing createEstimate server guard against truncated website scope',()=>{
 test('a real stored three-component request cannot be priced as one component',async()=>{
  const from=jest.fn(table=>{
   if(table==='service_requests')return {
    select:()=>({eq:()=>({maybeSingle:async()=>({
      error:null,data:{id:'req-safe-fixture',lead_id:null,
       scope_snapshot:{components:[{sku:'DNI-02A-009'},{sku:'DNI-02A-016'},{sku:'DNI-02A-029'}]}}
    })})})
   };
   if(table==='dd_service_markets')return {
    select:()=>({eq:async()=>({data:[],error:null})})
   };
   throw Error('Unexpected authority lookup: '+table);
  });
  await expect(createEstimate({from},{
   requestId:'req-safe-fixture',clientType:'property_manager',
   serviceSku:'DNI-02A-009',lineItems:[{serviceSku:'DNI-02A-009'}]
  })).rejects.toThrow(/required components missing.*DNI-02A-016.*DNI-02A-029/);
  expect(from.mock.calls.map(c=>c[0])).toEqual(['service_requests','dd_service_markets']);
 });
});
