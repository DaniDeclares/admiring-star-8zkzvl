import handler from '../../../api-handlers/intake-webhook.js';
import prisma from '../../../lib/prisma.js';

jest.mock('../../../lib/prisma.js',()=>({__esModule:true,default:{$transaction:jest.fn()}}));
jest.mock('../serverSentry.js',()=>({captureServerException:jest.fn(),flushServerSentry:jest.fn(async()=>{})}));
jest.mock('./eventBroker2026.js',()=>({publishOperationalEvent:jest.fn(async()=>{})}));

function response(){
 return {statusCode:200,body:null,status(n){this.statusCode=n;return this;},json(v){this.body=v;return this;}};
}
const base={
 requestMode:'GENERAL_PROJECT',name:'Synthetic Customer',email:'synthetic@example.invalid',
 details:'Please coordinate matching apparel, gift bags, end-of-year documents and event logistics.',
 channelType:'B2B',locationState:'GA',locationCity:'',locationZip:'',
 serviceType:'General or combined project inquiry',
 requestedStartAt:null,commercialIntent:null,pricingServiceId:null,frontDoorCode:null
};
describe('existing intake-webhook general outcome request',()=>{
 beforeEach(()=>jest.clearAllMocks());
 it('saves one unpriced, unscheduled request through the existing transaction',async()=>{
  const lead={id:'lead-fixture'}, request={id:'req-fixture'};
  const tx={
   lead:{create:jest.fn(async()=>lead)},
   serviceRequest:{create:jest.fn(async()=>request)},
   dd_estimates:{create:jest.fn(async()=>{throw Error('must not create an estimate')})}
  };
  prisma.$transaction.mockImplementation(async cb=>cb(tx));
  const res=response();
  await handler({method:'POST',headers:{},body:{...base},__daniTesterProof:true},res);
  expect(res.statusCode).toBe(200);
  expect(res.body).toMatchObject({success:true,requestId:'req-fixture',paymentPending:false,booking:null});
  const saved=tx.serviceRequest.create.mock.calls[0][0].data;
  expect(saved.location_address).toBe(null);
  expect(saved.property_details.requestMode).toBe('GENERAL_PROJECT');
  expect(saved.property_details.pricingServiceId).toBe(null);
  expect(saved.property_details.requestedStartAt).toBe(null);
  expect(tx.dd_estimates.create).not.toHaveBeenCalled();
 });
 it('rejects disguised priced service on general path before any write',async()=>{
  const res=response();
  await handler({method:'POST',headers:{},body:{...base,commercialIntent:{frozenPriceSnapshot:90}},__daniTesterProof:true},res);
  expect(res.statusCode).toBe(400);
  expect(prisma.$transaction).not.toHaveBeenCalled();
 });
 it('keeps original street address requirement for specific service requests',async()=>{
  const res=response();
  await handler({method:'POST',headers:{},body:{...base,requestMode:'SPECIFIC_SERVICE'},__daniTesterProof:true},res);
  expect(res.statusCode).toBe(400);
  expect(prisma.$transaction).not.toHaveBeenCalled();
 });
});
