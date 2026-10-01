import { reconcilePaidBookingWindow } from './bookingPaymentReconciliation2026.js';

function taggedMock(results=[]){
 const calls=[];
 const fn=jest.fn((strings,...values)=>{calls.push({sql:strings.join('?'),values});return Promise.resolve(results.shift()||[]);});
 fn.calls=calls;
 return fn;
}

function dbWith(queryResults){
 return {$queryRaw:taggedMock(queryResults),$executeRaw:taggedMock()};
}

describe('paid booking-window reconciliation',()=>{
 test('confirms an active hold and copies only the requested window to the job',async()=>{
  const start=new Date(Date.now()+86400000),end=new Date(start.getTime()+7200000);
  const db=dbWith([[{id:'job-1',scheduled_start:null,scheduled_end:null}],[{id:'booking-1',status:'HOLD',requested_start_at:start,requested_end_at:end,hold_expires_at:new Date(Date.now()+60000)}]]);
  const result=await reconcilePaidBookingWindow(db,{requestId:'request-1',jobId:'job-1',bookingRequested:true});
  expect(result).toMatchObject({status:'CONFIRMED',scheduled:true,bookingId:'booking-1'});
  expect(db.$executeRaw).toHaveBeenCalledTimes(2);
  expect(db.$executeRaw.calls[0].sql).toContain("status='CONFIRMED'");
  expect(db.$executeRaw.calls[1].values).toEqual(expect.arrayContaining([start,end]));
 });

 test('leaves an expired hold unscheduled and routes it to owner attention',async()=>{
  const start=new Date(Date.now()+86400000),end=new Date(start.getTime()+7200000);
  const db=dbWith([[{id:'job-1',scheduled_start:null,scheduled_end:null}],[{id:'booking-1',status:'HOLD',requested_start_at:start,requested_end_at:end,hold_expires_at:new Date(Date.now()-60000)}]]);
  const result=await reconcilePaidBookingWindow(db,{requestId:'request-1',jobId:'job-1',bookingRequested:true});
  expect(result).toMatchObject({status:'LEGITIMATELY_HELD_EXPIRED',scheduled:false});
  expect(db.$executeRaw).toHaveBeenCalledTimes(2);
  expect(db.$executeRaw.calls[0].sql).toContain("status='EXPIRED'");
  expect(db.$executeRaw.calls[1].sql).toContain('dd_owner_attention_queue');
 });

 test('does not invent a slot when none was requested',async()=>{
  const db=dbWith([[{id:'job-1',scheduled_start:null,scheduled_end:null}],[]]);
  await expect(reconcilePaidBookingWindow(db,{requestId:'request-1',jobId:'job-1',bookingRequested:false})).resolves.toEqual({status:'NOT_REQUESTED',scheduled:false});
  expect(db.$executeRaw).not.toHaveBeenCalled();
 });

 test('preserves an existing conflicting job schedule and raises attention',async()=>{
  const scheduledStart=new Date(Date.now()+86400000),scheduledEnd=new Date(scheduledStart.getTime()+3600000);
  const requestedStart=new Date(scheduledStart.getTime()+86400000),requestedEnd=new Date(requestedStart.getTime()+3600000);
  const db=dbWith([[{id:'job-1',scheduled_start:scheduledStart,scheduled_end:scheduledEnd}],[{id:'booking-1',status:'CONFIRMED',requested_start_at:requestedStart,requested_end_at:requestedEnd,hold_expires_at:null}]]);
  const result=await reconcilePaidBookingWindow(db,{requestId:'request-1',jobId:'job-1',bookingRequested:true});
  expect(result).toMatchObject({status:'BROKEN_SCHEDULE_CONFLICT',scheduled:false});
  expect(db.$executeRaw).toHaveBeenCalledTimes(1);
  expect(db.$executeRaw.calls[0].sql).toContain('dd_owner_attention_queue');
 });
});
