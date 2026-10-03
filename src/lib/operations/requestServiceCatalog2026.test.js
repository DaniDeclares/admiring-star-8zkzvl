import {requestCatalogServices,selectRequestCatalogService} from './requestServiceCatalog2026';

describe('requestCatalogServices',()=>{
 const rows=[
  {serviceId:'bath',name:'Bathroom Detail & Sanitization',division:'01',family:'Home',commercialOfferStatus:'SELL_NOW',releaseState:'LIVE_READY',ch01FrontDoorCode:'CH01-F01'},
  {serviceId:'held',name:'Held internal service',division:'01',family:'Home',commercialOfferStatus:'SELL_NOW',releaseState:'HELD',ch01FrontDoorCode:'CH01-F01'},
  {serviceId:'pm',name:'Unit Turn',division:'02',family:'Property',commercialOfferStatus:'SELL_NOW',releaseState:'LIVE_READY'},
  {serviceId:'intake',name:'Resident Intake Service',division:'05',family:'Resident',commercialOfferStatus:'INTAKE_ONLY',releaseState:'LIVE_READY',ch01FrontDoorCode:'CH01-F02'},
 ];
 test('shows governed live resident services and excludes held services',()=>{
  const result=requestCatalogServices(rows,'B2C','');
  expect(result.map(x=>x.serviceId)).toEqual(expect.arrayContaining(['bath','intake']));
  expect(result.map(x=>x.serviceId)).not.toContain('held');
  expect(result.map(x=>x.serviceId)).not.toContain('pm');
 });
 test('front-door choice narrows only services with a governed CH01 door',()=>{
  expect(requestCatalogServices(rows,'B2C','CH01-F01').map(x=>x.serviceId)).toContain('bath');
  expect(requestCatalogServices(rows,'B2C','CH01-F01').map(x=>x.serviceId)).not.toContain('intake');
 });
 test('selects by governed service id without inventing a service',()=>{
  expect(selectRequestCatalogService(rows,'bath')?.name).toBe('Bathroom Detail & Sanitization');
  expect(selectRequestCatalogService(rows,'missing')).toBeNull();
 });
});
