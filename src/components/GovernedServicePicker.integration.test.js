import {requestCatalogServices,selectRequestCatalogService} from '../lib/operations/requestServiceCatalog2026';

describe('#548 governed service discovery acceptance',()=>{
 const productionShapedCatalog=[
  {serviceId:'DNI-01A-BATHROOM',name:'Bathroom Detail & Sanitization',division:'01',family:'Cleaning',commercialOfferStatus:'SELL_NOW',releaseState:'LIVE_READY',ch01FrontDoorCode:'CH01-F01',publicPriceDisplay:'$65'},
  {serviceId:'DNI-01A-GENERIC',name:'Resident Refresh',division:'01',family:'Cleaning',commercialOfferStatus:'SELL_NOW',releaseState:'LIVE_READY',ch01FrontDoorCode:'CH01-F01',publicPriceDisplay:'Starting at $100'},
  {serviceId:'DNI-01A-HELD',name:'Internal Held Service',division:'01',family:'Cleaning',commercialOfferStatus:'SELL_NOW',releaseState:'HELD',ch01FrontDoorCode:'CH01-F01'},
 ];
 test('Bathroom Detail is discoverable and selectable when the governed catalog releases it',()=>{
  const visible=requestCatalogServices(productionShapedCatalog,'B2C','CH01-F01');
  expect(visible.map(x=>x.name)).toContain('Bathroom Detail & Sanitization');
  expect(selectRequestCatalogService(visible,'DNI-01A-BATHROOM')?.ch01FrontDoorCode).toBe('CH01-F01');
 });
 test('a generic governed service remains selectable',()=>{
  expect(requestCatalogServices(productionShapedCatalog,'B2C','CH01-F01').map(x=>x.serviceId)).toContain('DNI-01A-GENERIC');
 });
 test('a held service is never exposed',()=>{
  expect(requestCatalogServices(productionShapedCatalog,'B2C','CH01-F01').map(x=>x.serviceId)).not.toContain('DNI-01A-HELD');
 });
});
