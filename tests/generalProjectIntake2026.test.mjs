import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateGeneralProjectIntake} from '../src/lib/operations/generalProjectIntake2026.js';

const project={requestMode:'GENERAL_PROJECT',details:'Matching holiday shirts, gift bags, documentation and event support for our team.',channelType:'B2B',locationState:'GA'};
test('combined project can be requested without street, exact date or service SKU',()=>{
 const v=validateGeneralProjectIntake(project);
 assert.equal(v.allowed,true); assert.equal(v.isGeneral,true); assert.equal(v.locationAddress,null);
});
test('specific service requests are not downgraded to general requests',()=>{
 const v=validateGeneralProjectIntake({...project,requestMode:'SPECIFIC_SERVICE',pricingServiceId:'DNI-01F-001'});
 assert.deepEqual(v,{allowed:true,isGeneral:false});
});
test('unpriced general path rejects selected service and price/booking bypass attempts',()=>{
 for(const bad of [{serviceId:'sku'},{pricingServiceId:'sku'},{commercialIntent:{frozenPriceSnapshot:100}},{requestedStartAt:'2026-11-10T14:00:00-05:00'},{frontDoorCode:'CH01-F05'}]){
  const v=validateGeneralProjectIntake({...project,...bad});
  assert.equal(v.allowed,false);
  assert.equal(v.reason,'GENERAL_PROJECT_CANNOT_BYPASS_SERVICE_OR_BOOKING_GATES');
 }
});
test('requires useful project description',()=>{
 assert.equal(validateGeneralProjectIntake({...project,details:'help'}).allowed,false);
});
test('optional street address is accepted only with complete site details',()=>{
 assert.equal(validateGeneralProjectIntake({...project,locationAddress:'100 Test Street'}).allowed,false);
 const v=validateGeneralProjectIntake({...project,locationAddress:'100 Test Street',locationCity:'Atlanta',locationZip:'30301'});
 assert.equal(v.allowed,true); assert.equal(v.locationAddress,'100 Test Street, Atlanta, GA, 30301');
});
test('malformed ZIP and out-of-area state fail closed rather than silently qualifying service',()=>{
 assert.equal(validateGeneralProjectIntake({...project,locationZip:'nope'}).allowed,false);
 assert.equal(validateGeneralProjectIntake({...project,locationState:'AL'}).allowed,false);
});
test('source routes unpriced general project through existing intake, preserves campaign/referral and no auto booking',()=>{
 const url=new URL('../',import.meta.url);
 const handler=readFileSync(new URL('api-handlers/intake-webhook.js',url),'utf8');
 const page=readFileSync(new URL('src/pages/RequestServicePage.jsx',url),'utf8');
 assert.match(handler,/validateGeneralProjectIntake\(req\.body/);
 assert.match(handler,/paymentEligible=!generalProject\.isGeneral/);
 assert.match(handler,/requestMode:generalProject\.isGeneral/);
 assert.match(handler,/if\(requestedStartAt\)\{/); // source scheduling remains conditional
 assert.match(handler,/sanitizeMarketingAttribution/);
 assert.match(page,/requestMode,marketingAttribution/);
 assert.match(page,/referralCode:referralCode\|\|null/);
 assert.match(page,/Request Project Review/);
});
