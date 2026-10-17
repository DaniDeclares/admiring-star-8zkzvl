import test from 'node:test';
import assert from 'node:assert/strict';
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
