import { handleHolidayCommunityInterest } from '../../api-handlers/holiday-community-interest.js';

function fakeAdmin({ recent=false, failInsert=false, failAttention=false, attentionExists=true, failAttentionLookup=false } = {}) {
 const writes = [];
 const admin = { from(table) {
  const q = {
   select() { return q; }, eq() { return q; }, gte() { return q; }, order() { return q; },
   limit() { if(table === 'dd_owner_attention_queue') return Promise.resolve(failAttentionLookup ? {data:null,error:{code:'ATTENTION_LOOKUP_FAILED'}} : {data:attentionExists?[{id:'earlier-attention-id'}]:[],error:null}); return Promise.resolve({data: recent ? [{id:'earlier-secret-id'}] : [], error:null}); },
   insert(row) {
    writes.push({table,row});
    if(table === 'dd_holiday_community_interests') return {
      select() { return {single() {return Promise.resolve(failInsert
       ? {data:null,error:{code:'INSERT_FAILED'}} : {data:{id:'new-private-id'},error:null});}};}
    };
    return Promise.resolve({error:failAttention?{code:'ATTENTION_FAILED'}:null});
   },
  };
  return q;
 }};
 return {admin,writes};
}
function fakeRes() {
 const res={statusCode:200,body:null,headers:{}};
 res.setHeader=(k,v)=>{res.headers[k]=v;};
 res.status=code=>{res.statusCode=code;return res;};
 res.json=body=>{res.body=body;return res;};
 return res;
}
const valid = (extra={}) => ({
  name:'Sample Adult',email:'person@example.org',city:'Stone Mountain, GA',
  role:'FAMILY_SUPPORT',area:'HOUSING_TRANSITION',note:'General household essentials',
  contactConsent:true,attribution:{utm_source:'facebook',utm_medium:'group',utm_campaign:'holiday-2026',utm_content:'we-support-small-business-atlanta'},
  ...extra
});
async function run(body,opts={}) {
 const fake=fakeAdmin(opts),res=fakeRes();
 await handleHolidayCommunityInterest({method:'POST',body,headers:{}},res,{adminClient:async()=>fake.admin});
 return {res,writes:fake.writes};
}
describe('Holiday 2026 community intake privacy and routing',()=>{
 test('persists in community table and queues existing owner attention, not sales or provider paths',async()=>{
  const {res,writes}=await run(valid());
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({success:true});
  expect(writes.map(w=>w.table)).toEqual(['dd_holiday_community_interests','dd_owner_attention_queue']);
  expect(writes[0].row).toEqual(expect.objectContaining({role:'FAMILY_SUPPORT',source:'WEBSITE_HOLIDAY_2026',contact_consent:true}));
  expect(writes[0].row).not.toHaveProperty('locationAddress');
  expect(writes[1].row).toEqual(expect.objectContaining({domain:'COMMUNICATIONS',source_table:'dd_holiday_community_interests'}));
 });
 test('invalid consent never writes',async()=>{
  const {res,writes}=await run(valid({contactConsent:false}));
  expect(res.statusCode).toBe(400);
  expect(writes).toEqual([]);
 });
 test('bots trigger no writes',async()=>{
  const {res,writes}=await run(valid({website:'https://spam.test'}));
  expect(res.statusCode).toBe(200);
  expect(writes).toEqual([]);
 });
 test('repeat submission yields no secret identifier, and writes nothing',async()=>{
  const {res,writes}=await run(valid(),{recent:true});
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({success:true});
  expect(writes).toEqual([]);
 });
 test('storage failure is not represented as success',async()=>{
  const {res,writes}=await run(valid(),{failInsert:true});
  expect(res.statusCode).toBe(503);
  expect(writes.map(x=>x.table)).toEqual(['dd_holiday_community_interests']);
 });
 test('owner alert failure keeps interest but does not report success',async()=>{
  const {res,writes}=await run(valid(),{failAttention:true});
  expect(res.statusCode).toBe(503);
  expect(writes.map(x=>x.table)).toEqual(['dd_holiday_community_interests','dd_owner_attention_queue']);
 });
 test('repeat with missing owner receipt repairs notification without new interest',async()=>{
  const {res,writes}=await run(valid(),{recent:true,attentionExists:false});
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({success:true});
  expect(writes.map(x=>x.table)).toEqual(['dd_owner_attention_queue']);
  expect(writes[0].row.source_record_id).toBe('earlier-secret-id');
 });
 test('failed repeat notification repair does not claim success',async()=>{
  const {res,writes}=await run(valid(),{recent:true,attentionExists:false,failAttention:true});
  expect(res.statusCode).toBe(503);
  expect(writes.map(x=>x.table)).toEqual(['dd_owner_attention_queue']);
 });
 test('failed owner receipt lookup prevents redundant notification',async()=>{
  const {res,writes}=await run(valid(),{recent:true,failAttentionLookup:true});
  expect(res.statusCode).toBe(503);
  expect(writes).toEqual([]);
 });
 test('GET does not accept community submissions',async()=>{
  const res=fakeRes();
  await handleHolidayCommunityInterest({method:'GET',headers:{}},res,{adminClient:async()=>null});
  expect(res.statusCode).toBe(405);
 });
 test('oversized request rejected before storage',async()=>{
  const res=fakeRes();
  await handleHolidayCommunityInterest({method:'POST',headers:{'content-length':'20000'},body:valid()},res,{adminClient:async()=>null});
  expect(res.statusCode).toBe(413);
 });
});
