import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {compileReview,validBase,readEvents,createDraft,requireScopedKey} from './dani-sop-review-draft.mjs';
const job='09c589e5-a7a2-416a-bfe0-46f1ad14818a';
const scopedTestJwt='test.'+Buffer.from(JSON.stringify({role:'dani_sop_reader'})).toString('base64url')+'.signature';
const event=(id,at,type='PROVIDER_REPORTED_COMPLETE',more={})=>({id,job_id:job,event_at:at,event_type:type,source_type:'PHONE_CALL',...more});
const sample=[
 event('de27f285-42fd-411b-a4e0-35c5389c3a5c','2026-09-25T15:33:00Z'),
 event('f93a83db-5e8e-4d1f-9374-58fd930ba299','2026-09-25T16:41:38Z','COMPLETION_EVIDENCE_RECEIVED',{source_type:'EMAIL'})
];
test('ordered, cautious review draft never claims physical completion',()=>{
 const r=compileReview(job,sample.reverse());
 assert.equal(r.manifest.status,'DRAFT_REVIEW_ONLY');
 assert.equal(r.manifest.registryWritten,false);
 assert.equal(r.manifest.isActionRecording,false);
 assert.equal(r.manifest.eventCount,2);
 assert.ok(r.markdown.indexOf('15:33:00')<r.markdown.indexOf('16:41:38'));
 assert.match(r.markdown,/independent acceptance required/i);
});
test('reject cross-job, duplicate, invalid time, and too many events',()=>{
 assert.throws(()=>compileReview(job,[event('5511920a-8145-4414-be26-79574ad8f584','2026-09-25T12:00:00Z','QA_APPROVED',{job_id:'00000000-0000-4000-8000-000000000000'})]),/CROSS_JOB_EVENT/);
 const e=sample[0];
 assert.throws(()=>compileReview(job,[e,e]),/DUPLICATE_EVENT_ID/);
 assert.throws(()=>compileReview(job,[{...e,event_at:'bad'}]),/INVALID_EVENT_TIME/);
 assert.throws(()=>compileReview(job,Array.from({length:26},(_,i)=>({...e,id:'00000000-0000-4000-8000-'+String(i).padStart(12,'0')}))),/EVENT_LIMIT_EXCEEDED/);
});
test('do not export raw facts, contact data, source_reference or direct internal job ID',()=>{
 const e=event('8b3cb879-7cfc-43d3-9020-6b4a2ccb30ad','2026-09-25T16:00:00Z','CUSTOMER_CONFIRMED_COMPLETE',{
  facts:{phone:'470-111-0000',customer:'A Customer',secret:'api_key=SECRET'},
  source_reference:'PHONE:470-111-0000'});
 const output=compileReview(job,[e]).markdown;
 assert.doesNotMatch(output,/470-111-0000|SECRET|A Customer|source_reference|09c589e5/);
});
test('unknown or migration event is marked for review',()=>{
 const e=event('5511920a-8145-4414-be26-79574ad8f584','2026-09-25T12:00:00Z','SOMETHING_NEW',{source_type:'MIGRATION'});
 const x=compileReview(job,[e]);
 assert.equal(x.manifest.exceptions,1);
 assert.match(x.markdown,/unknown event/i);
});
test('fail closed for insecure or unexpected backend origins',()=>{
 assert.equal(validBase('ajxezpczaemunlcmqlgl'),'https://ajxezpczaemunlcmqlgl.supabase.co');
 assert.throws(()=>validBase('http://ajxezpczaemunlcmqlgl.supabase.co'),/REJECTED/);
 assert.throws(()=>validBase('https://evil.example'),/REJECTED/);
 assert.throws(()=>validBase('https://user:pw@foo.supabase.co'),/REJECTED/);
});
test('runtime GET limited to exact job, read-only with existing credential',async()=>{
 let observed;
 const response=await readEvents({jobId:job,base:'ajxezpczaemunlcmqlgl',key:scopedTestJwt,
  fetcher:async(url,opts)=>{
   observed={url:url.toString(),method:opts.method,hasSecret:!!opts.headers.apikey};
   return {ok:true,json:async()=>sample};
  }});
 assert.equal(response.length,2);
 assert.equal(observed.method,'GET');
 assert.match(observed.url,/job_id=eq/);
 assert.match(observed.url,/limit=26/);
 assert.equal(observed.hasSecret,true);
});
test('end-to-end mocked read produces editable draft artifact and manifest only',async()=>{
 const dest=await fs.mkdtemp(path.join(os.tmpdir(),'dani-sop-review-'));
 try{
 const x=await createDraft({jobId:job,outDir:dest,base:'ajxezpczaemunlcmqlgl',key:scopedTestJwt,
 fetcher:async()=>({ok:true,json:async()=>sample})});
 assert.equal(x.registryWritten,false);
 assert.deepEqual((await fs.readdir(dest)).sort(),['SOP_REVIEW_DRAFT.md','SOP_REVIEW_MANIFEST.json']);
 const doc=await fs.readFile(path.join(dest,'SOP_REVIEW_DRAFT.md'),'utf8');
 assert.match(doc,/DRAFT/);
 }finally{await fs.rm(dest,{recursive:true,force:true})}
});
test('no events means no fabricated SOP',()=>{
 assert.throws(()=>compileReview(job,[]),/NO_JOB_EXECUTION_EVENTS/);
});

test('service-role and generic credentials are rejected before database fetch',()=>{
 const broad='test.'+Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')+'.signature';
 assert.throws(()=>requireScopedKey(broad),/NOT_LEAST_PRIVILEGED/);
 assert.throws(()=>requireScopedKey('FAKE_TEST_CREDENTIAL'),/UNRECOGNIZED/);
 assert.equal(requireScopedKey(scopedTestJwt),scopedTestJwt);
});
test('unexpected event type cannot be echoed into an artifact',()=>{
 const e=event('5511920a-8145-4414-be26-79574ad8f584','2026-09-25T12:00:00Z','SENSITIVE_INTERNAL_REFERENCE');
 const x=compileReview(job,[e]);
 assert.equal(x.manifest.exceptions,1);
 assert.doesNotMatch(x.markdown,/SENSITIVE_INTERNAL_REFERENCE/);
 assert.match(x.markdown,/UNCLASSIFIED_EVENT/);
});
