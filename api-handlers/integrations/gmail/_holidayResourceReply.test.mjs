import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyHolidayResourceReply,matchRespondentIntake,reconcileHolidayResourceReplies,HOLIDAY_ORGANIZATION_FORM,assertHolidayGmailPreviewIsolation} from './_holidayResourceReply.mjs';
test('Vercel Preview Gmail route refuses Production/default integration and wrong database before connection',()=>{
 for(const config of [{VERCEL_ENV:'preview'}, {VERCEL_ENV:'preview',INTEGRATION_ENVIRONMENT:'PRODUCTION',SUPABASE_URL:'https://okvepooyxurujcwgfoju.supabase.co'},{VERCEL_ENV:'preview',INTEGRATION_ENVIRONMENT:'TESTER',SUPABASE_URL:'https://ajxezpczaemunlcmqlgl.supabase.co'}]){
  assert.throws(()=>assertHolidayGmailPreviewIsolation(config),/GMAIL_PREVIEW_ISOLATION_UNPROVEN/);
 }
 assert.equal(assertHolidayGmailPreviewIsolation({VERCEL_ENV:'preview',INTEGRATION_ENVIRONMENT:'TESTER',SUPABASE_URL:'https://okvepooyxurujcwgfoju.supabase.co'}),true);
});

const email={id:'evt-1',direction:'INBOUND',external_message_id:'gmail-message-1',
 external_thread_id:'gmail-thread-77',sender_address:'resources@example.org',
 subject:'Re: [EXTERNAL] Follow-up: DANI Holiday Mission — business-contributor flyer',
 body_excerpt:'Our department offers Adult Education and Workforce Development resources. How can we share with your organization?',
 received_at:'2026-11-08T16:46:01Z',classification:{classifier:'deterministic_v1'}};
const form=(id='intake-1')=>({id,email:'resources@example.org',role:'COMMUNITY_ORG',
 source:'WEBSITE_HOLIDAY_2026',contact_consent:true,created_at:'2026-11-08T19:00:00Z'});
test('organization resources are classified, with original Gmail thread and exact existing form',()=>{
 const c=classifyHolidayResourceReply(email);
 assert.equal(c.intent,'ORGANIZATION_RESOURCE_OFFER');
 assert.equal(c.role,'COMMUNITY_ORG');assert.equal(c.area,'REFERRALS');
 assert.equal(c.gmail_thread_id,'gmail-thread-77');
 assert.equal(c.gmail_message_id,'gmail-message-1');
 assert.equal(c.form_url,HOLIDAY_ORGANIZATION_FORM);
 assert.equal(new URL(c.form_url).searchParams.get('role'),'COMMUNITY_ORG');
 assert.equal(c.respondent_form_consent,false);
 assert.equal(c.approved_partner,false);
});
test('non-holiday unrelated and outbound threads are not labeled',()=>{
 for(const e of [{...email,direction:'OUTBOUND'},{...email,subject:'Your subscription'},{...email,body_excerpt:'Thanks for your email.'}]){
  assert.equal(classifyHolidayResourceReply(e),null);
 }
});
test('ordinary email never creates consent; no form yet remains awaiting respondent',()=>{
 const c=classifyHolidayResourceReply(email);
 assert.equal(c.respondent_form_consent,false);
 assert.deepEqual(matchRespondentIntake(email,[]),{status:'AWAITING_RESPONDENT_INTAKE'});
});
test('later self-submitted intake is review candidate, not silently verified identity or partner',()=>{
 const r=matchRespondentIntake(email,[form()]);
 assert.equal(r.status,'EXACT_EMAIL_CANDIDATE_REVIEW');
 assert.equal(r.candidate_intake_id,'intake-1');
 assert.equal(r.identity_verified,false);
 assert.equal(r.association_confirmed,false);
});
test('false and mismatched consent, older form, other role and source never match',()=>{
 const mismatch=[{...form(),email:'other@example.org'},{...form(),contact_consent:false},
 {...form(),role:'SPONSOR'},{...form(),source:'STAFF_EMAIL'},
 {...form(),created_at:'2026-11-07T16:00:00Z'}];
 for(const candidate of mismatch)assert.equal(matchRespondentIntake(email,[candidate]).status,'AWAITING_RESPONDENT_INTAKE');
});
test('multiple matching submissions require review instead of automatic merge',()=>{
 const r=matchRespondentIntake(email,[form('one'),form('two')]);
 assert.equal(r.status,'REVIEW_AMBIGUOUS');
 assert.equal(r.candidate_intake_id,undefined);
});
test('missing sender or received timestamp does not establish identity',()=>{
 assert.equal(matchRespondentIntake({...email,sender_address:''},[form()]).status,'REVIEW_IDENTITY');
 assert.equal(matchRespondentIntake({...email,received_at:null},[form()]).status,'REVIEW_IDENTITY');
});
function fakeDb(interest=[]){
 const event={...email,classification:{classifier:'deterministic_v1'}};
 const attention={id:'owner-attn-1',reason:'Inbound business email requires triage.',
  recommended_action:'Triage.',metadata:{external_thread_id:email.external_thread_id}};
 const writes=[];
 const db={from(table){
  const query={filters:[],select(){return this;},eq(k,v){this.filters.push([k,v]);return this;},
   ilike(){return this;},gte(){return this;},order(){return this;},
   limit(){const result= table==='dd_communication_events'?[event]:
       table==='dd_holiday_community_interests'?interest:
       table==='dd_owner_attention_queue'?[attention]:[];
    return Promise.resolve({data:result,error:null});},
   update(p){writes.push({table,p});if(table==='dd_communication_events')event.classification=p.classification;
      if(table==='dd_owner_attention_queue')Object.assign(attention,p);
      return {eq:async()=>({error:null})};}};
  return query;
 }};
 return {db,writes,event,attention};
}
test('existing rails are reused; duplicate processing does not create contact, intake, or attention',async()=>{
 const f=fakeDb();
 const a=await reconcileHolidayResourceReplies(f.db);
 assert.equal(a.classified,1);
 assert.deepEqual(f.writes.map(w=>w.table),['dd_communication_events','dd_owner_attention_queue']);
 assert.equal(f.event.classification.holiday_mission.gmail_thread_id,email.external_thread_id);
 assert.equal(f.attention.metadata.external_thread_id,email.external_thread_id);
 assert.equal(f.attention.metadata.holiday_mission.intake_match.status,'AWAITING_RESPONDENT_INTAKE');
 await reconcileHolidayResourceReplies(f.db);
 assert.equal(f.writes.length,2);
});
test('later site submission updates existing communication and attention only',async()=>{
 const f=fakeDb([form()]);
 await reconcileHolidayResourceReplies(f.db);
 assert.equal(f.event.classification.holiday_mission.intake_match.candidate_intake_id,'intake-1');
 assert.deepEqual(f.writes.map(w=>w.table),['dd_communication_events','dd_owner_attention_queue']);
});
test('ambiguous submission leaves no chosen record ID',async()=>{
 const f=fakeDb([form('one'),form('two')]);
 await reconcileHolidayResourceReplies(f.db);
 assert.equal(f.event.classification.holiday_mission.intake_match.status,'REVIEW_AMBIGUOUS');
 assert.equal(f.event.classification.holiday_mission.intake_match.candidate_intake_id,undefined);
});
