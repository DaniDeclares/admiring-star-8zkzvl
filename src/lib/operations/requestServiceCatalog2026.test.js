import {channelTypeForLinkedService,requestCatalogServices,selectRequestCatalogService} from './requestServiceCatalog2026';

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

describe('channelTypeForLinkedService',()=>{
 const business={serviceId:'DNI-04A-009',authorizedChannels:['CH02','CH03','CH04','CH05']};
 const resident={serviceId:'DNI-01D-011',authorizedChannels:['CH01']};
 test('a business-only SKU link without channelType opens on the Business channel, not Resident',()=>{
  expect(channelTypeForLinkedService(business,'')).toBe('B2B');
 });
 test('an explicit authorized channel in the link wins',()=>{
  expect(channelTypeForLinkedService(business,'B2B_RE')).toBe('B2B_RE');
 });
 test('an explicit channel the SKU is not authorized for falls back to an authorized one',()=>{
  expect(channelTypeForLinkedService(business,'B2C')).toBe('B2B');
  expect(channelTypeForLinkedService(resident,'B2B')).toBe('B2C');
 });
 test('resident SKUs stay on Resident; unknown services keep the request untouched',()=>{
  expect(channelTypeForLinkedService(resident,'')).toBe('B2C');
  expect(channelTypeForLinkedService(null,'B2G')).toBe('B2G');
  expect(channelTypeForLinkedService({authorizedChannels:[]},'')).toBe('B2C');
 });
 test('the result is always one of the SKU authorized channels when it has any',()=>{
  const map={B2C:'CH01',B2B_APT:'CH02',B2B_RE:'CH03',B2B:'CH04',B2G:'CH05'};
  for(const req of ['','B2C','B2B','B2B_APT','B2B_RE','B2G','bogus'])expect(business.authorizedChannels).toContain(map[channelTypeForLinkedService(business,req)]);
 });
});
