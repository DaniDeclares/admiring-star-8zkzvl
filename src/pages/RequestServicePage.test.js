import fs from 'fs';
import path from 'path';
describe('public request front door regressions',()=>{
 const source=fs.readFileSync(path.join(__dirname,'RequestServicePage.jsx'),'utf8');
 test('routing helper remains optional and never disables submit',()=>{expect(source).toContain('(optional)');expect(source).toContain('disabled={loading}');expect(source).not.toContain('activeFrontDoors.length>0&&!form.frontDoorCode');});
 test('household mode does not render an organization field',()=>{expect(source).toContain('form.channelType!==OPERATIONS_CHANNELS.B2C');expect(source).toContain("organizationName:value===OPERATIONS_CHANNELS.B2C?'':f.organizationName");});
 test('needs-based intake does not require a preselected service',()=>{expect(source).toContain("pricingServiceId:authoritativeServiceId");expect(source).toContain("'General service request'");expect(source).toContain('if(form.serviceId&&form.frontDoorCode)');});
 test('customer UI does not expose internal routing language',()=>{expect(source).not.toContain('Starting point: {form.frontDoorCode}');expect(source).not.toContain('solution starting point, not a product or package');});
});
