import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {DANI_CLOCK_TASKS,allowedStudyTask,clockAccess,minutesForEntry,summarizeEntries} from '../src/lib/operations/workClock2026.mjs';
test('owner cleaning and revenue timing categories remain separate',()=>{
  assert.equal(allowedStudyTask('MAINTENANCE_PREP','ACCESS_SAFETY'),true);
  assert.equal(allowedStudyTask('PRINTIFY_MERCH','PRICE_SHIPPING'),true);
  assert.equal(allowedStudyTask('MAINTENANCE_PREP','PRICE_SHIPPING'),false);
  assert.equal(Object.keys(DANI_CLOCK_TASKS).length,3);
});
test('time clock is role-bound to authenticated owner or provider',()=>{
  assert.deepEqual(clockAccess({role:'owner',isStaff:true,user:{id:'owner-1'}},null),{owner:true,actorId:'owner-1',providerId:null,jobId:null});
  assert.throws(()=>clockAccess({role:'staff_admin',isStaff:true,user:{id:'x'}},null),/unavailable/);
  assert.throws(()=>clockAccess({role:'owner',isStaff:true,user:{id:'x'}},'fake-customer-job'),/do not use customer jobs/);
  assert.throws(()=>clockAccess({role:'provider',isStaff:false,user:{id:'p'},identity:{entity_id:'real-provider'}},null),/job ID/);
  assert.deepEqual(clockAccess({role:'provider',isStaff:false,user:{id:'p'},identity:{entity_id:'real-provider'}},'job-1'),{owner:false,actorId:'p',providerId:'real-provider',jobId:'job-1'});
});
test('paused intervals exclude breaks and keep labor categories separated',()=>{
  const entries=[
    {started_at:'2026-10-17T10:00:00Z',ended_at:'2026-10-17T10:20:00Z',entry_status:'PAUSED',time_type:'ON_SITE',metadata:{study_code:'MAINTENANCE_PREP',task_code:'ACCESS_SAFETY'}},
    {started_at:'2026-10-17T10:45:00Z',ended_at:'2026-10-17T11:15:00Z',entry_status:'CLOSED',time_type:'ON_SITE',metadata:{study_code:'MAINTENANCE_PREP',task_code:'ACCESS_SAFETY'}},
    {started_at:'2026-10-17T11:20:00Z',entry_status:'OPEN',time_type:'ADMIN',metadata:{study_code:'PRINTIFY_MERCH',task_code:'PRODUCT_DRAFT'}},
    {started_at:'2026-10-17T11:00:00Z',ended_at:'2026-10-17T11:10:00Z',entry_status:'VOID',time_type:'ON_SITE'}
  ];
  const totals=summarizeEntries(entries,new Date('2026-10-17T11:35:00Z'));
  assert.deepEqual(totals,{minutes:65,byTask:{'MAINTENANCE_PREP:ACCESS_SAFETY':50,'PRINTIFY_MERCH:PRODUCT_DRAFT':15}});
});
test('closed interval missing end cannot accrue more time',()=>{
  assert.equal(minutesForEntry({started_at:'2026-10-17T10:00:00Z',entry_status:'CLOSED'},new Date('2026-10-17T18:00:00Z')),0);
  assert.equal(minutesForEntry({started_at:'not-a-date',entry_status:'OPEN'}),0);
});

test('owner clock endpoint denies provider access and avoids provider job mutation',()=>{
 const api=readFileSync(new URL('../api-handlers/portal-operations.js',import.meta.url),'utf8');
 const field=api.split("if (action === 'field_event') {")[1]?.split("if (action === 'assignment_response') {")[0];
 assert.ok(field && !field.includes('applyWorkClockAction'),'Field actions must stay unchanged until an atomic provider transition exists.');
 const get=api.split("req.query?.workClock === '1'")[1]?.split("if (req.method === 'GET')")[0];
 const post=api.split("action === 'work_clock'")[1]?.split("if (action === 'estimate_decision')")[0];
 assert.match(get||'',/context.role !== 'owner'/);
 assert.match(post||'',/context.role !== 'owner'/);
});
test('owner clock remains visible if HQ summary fails',()=>{
 const page=readFileSync(new URL('../src/pages/portal/OwnerHQPage.jsx',import.meta.url),'utf8');
 assert.match(page,/if \(error\) return <main[^\n]+<WorkClock mode="owner"/);
 assert.match(page,/if \(loading\) return <main[^\n]+<WorkClock mode="owner"/);
});

test('Vercel CommonJS can load the shared clock without ERR_REQUIRE_ESM',()=>{
 const require=createRequire(import.meta.url);
 const clock=require('../src/lib/operations/workClock2026.js');
 assert.equal(clock.allowedStudyTask('MAINTENANCE_PREP','ACCESS_SAFETY'),true);
 assert.equal(typeof clock.applyWorkClockAction,'function');
 const api=readFileSync(new URL('../api-handlers/portal-operations.js',import.meta.url),'utf8');
 assert.match(api,/from '\.\.\/src\/lib\/operations\/workClock2026\.js'/);
 assert.doesNotMatch(api,/workClock2026\.mjs/);
});

test('server and browser clock packages keep task catalogs and duration rules identical',()=>{
 const require=createRequire(import.meta.url);
 const server=require('../src/lib/operations/workClock2026.js');
 assert.deepEqual(server.DANI_CLOCK_TASKS,DANI_CLOCK_TASKS);
 const records=[
   {started_at:'2026-10-17T09:00:00Z',ended_at:'2026-10-17T09:22:30Z',entry_status:'CLOSED',metadata:{study_code:'MAINTENANCE_PREP',task_code:'ACCESS_SAFETY'}},
   {started_at:'2026-10-17T10:00:00Z',entry_status:'OPEN',metadata:{study_code:'PRINTIFY_MERCH',task_code:'PUBLISH_QA'}}
 ];
 const at=new Date('2026-10-17T10:11:00Z');
 assert.deepEqual(server.summarizeEntries(records,at),summarizeEntries(records,at));
});
