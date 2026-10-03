import {requestCatalogServices,selectRequestCatalogService} from './requestServiceCatalog2026';

describe('requestCatalogServices',()=>{
 const rows=[
  {serviceId:'bath',name:'Bathroom Detail & Sanitization',division:'01',family:'Home',commercialOfferStatus:'SELL_NOW',releaseState:'LIVE_READY',authorizedChannels:['CH01'],ch01FrontDoorCode:'CH01-F01'},
  {serviceId:'held',name:'Held internal service',division:'01',family:'Home',commercialOfferStatus:'SELL_NOW',releaseState:'HELD',authorizedChannels:['CH01'],ch01FrontDoorCode:'CH01-F01'},
  {serviceId:'pm',name:'Unit Turn',division:'02',family:'Property',commercialOfferStatus:'SELL_NOW',releaseState:'LIVE_READY',authorizedChannels:['CH02']},
  {serviceId:'intake',name:'Resident Intake Service',division:'05',family:'Resident',commercialOfferStatus:'INTAKE_ONLY',releaseState:'LIVE_READY',authorizedChannels:['CH01'],ch01FrontDoorCode:'CH01-F02'},
  {serviceId:'pending-pm',name:'Pending Property Service',division:'02',family:'Property',commercialOfferStatus:'SELL_NOW',releaseState:'LIVE_READY',authorizedChannels:[]},
  {serviceId:'business-only',name:'Business Only Service',division:'04',family:'Business',commercialOfferStatus:'SELL_NOW',releaseState:'LIVE_READY',authorizedChannels:['CH04']},
 ];
 test('shows only explicitly authorized live resident services and excludes held services',()=>{
  const result=requestCatalogServices(rows,'B2C','');
  expect(result.map(x=>x.serviceId)).toEqual(expect.arrayContaining(['bath','intake']));
  expect(result.map(x=>x.serviceId)).not.toContain('held');
  expect(result.map(x=>x.serviceId)).not.toContain('pm');
 });
 test('front-door choice narrows resident services with a governed CH01 door',()=>{
  expect(requestCatalogServices(rows,'B2C','CH01-F01').map(x=>x.serviceId)).toContain('bath');
  expect(requestCatalogServices(rows,'B2C','CH01-F01').map(x=>x.serviceId)).not.toContain('intake');
 });
 test('division membership cannot expose a service whose selected channel is pending',()=>{
  expect(requestCatalogServices(rows,'B2B_APT','').map(x=>x.serviceId)).toContain('pm');
  expect(requestCatalogServices(rows,'B2B_APT','').map(x=>x.serviceId)).not.toContain('pending-pm');
  expect(requestCatalogServices(rows,'B2B_APT','').map(x=>x.serviceId)).not.toContain('business-only');
 });
 test('fails closed when exact channel authorization is absent from the catalog payload',()=>{
  const legacyShaped={serviceId:'legacy',name:'Legacy',division:'01',commercialOfferStatus:'SELL_NOW',releaseState:'LIVE_READY'};
  expect(requestCatalogServices([legacyShaped],'B2C','')).toEqual([]);
 });
 test('selects by governed service id without inventing a service',()=>{
  expect(selectRequestCatalogService(rows,'bath')?.name).toBe('Bathroom Detail & Sanitization');
  expect(selectRequestCatalogService(rows,'missing')).toBeNull();
 });
});
