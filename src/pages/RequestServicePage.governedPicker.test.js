import fs from 'node:fs';
import path from 'node:path';

describe('#548 request page governed picker wiring',()=>{
 const source=fs.readFileSync(path.join(__dirname,'RequestServicePage.jsx'),'utf8');
 test('renders the governed picker from the live catalog without requiring a query string',()=>{
  expect(source).toContain("import GovernedServicePicker from '../components/GovernedServicePicker.jsx'");
  expect(source).toContain('<GovernedServicePicker services={services} channelType={form.channelType}');
  expect(source).toContain('onSelect={selectGovernedService}');
 });
 test('selection writes service authority and CH01 front door into request state',()=>{
  expect(source).toContain("serviceId:next?.serviceId||''");
  expect(source).toContain('next.ch01FrontDoorCode?next.ch01FrontDoorCode:f.frontDoorCode');
 });
 test('changing to a conflicting resident front door clears the selected service instead of submitting mismatched authority',()=>{
  expect(source).toContain("name==='frontDoorCode'");
  expect(source).toContain("frontDoorCode:value,serviceId:''");
 });
 test('general request path remains available',()=>{
  expect(source).toContain('Tell us the situation instead');
  expect(source).toContain("pricingServiceId:authoritativeServiceId");
 });
});
