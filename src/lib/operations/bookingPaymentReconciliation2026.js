const BOOKING_ATTENTION_REASON='Paid request could not inherit its requested booking window';

function sameInstant(left,right){
 if(!left||!right)return false;
 return new Date(left).getTime()===new Date(right).getTime();
}

async function queueBookingAttention(db,{requestId,bookingId=null,jobId,status,metadata={}}){
 const sourceTable=bookingId?'dd_owner_booking_requests':'service_requests';
 const sourceRecordId=bookingId||requestId;
 await db.$executeRaw`
  insert into public.dd_owner_attention_queue
   (domain,source_table,source_record_id,reason,priority,status,recommended_action,metadata)
  values
   ('OPERATIONS',${sourceTable},${sourceRecordId},${BOOKING_ATTENTION_REASON},'P1','OPEN',
    'Review the paid request and agree a valid non-overlapping appointment before provider acceptance.',
    ${JSON.stringify({request_id:requestId,booking_id:bookingId,job_id:jobId,booking_transition:status,no_automatic_reschedule:true,...metadata})}::jsonb)
  on conflict do nothing
 `;
}

/**
 * Atomically consumes an intake booking hold after governed payment succeeds.
 * The requested service window becomes the canonical job schedule only while
 * the hold is active (or was already confirmed). Missing/expired/conflicting
 * windows stay unscheduled and are routed to the existing owner-attention lane;
 * payment truth is never rolled back or a replacement time invented.
 */
export async function reconcilePaidBookingWindow(db,{requestId,jobId,bookingRequested=false}){
 const jobs=await db.$queryRaw`
  select id,scheduled_start,scheduled_end
  from public.dd_jobs
  where id=${jobId}::uuid
  limit 1
  for update
 `;
 const job=jobs[0];
 if(!job)throw new Error(`Paid booking reconciliation cannot find job ${jobId}`);

 const bookings=await db.$queryRaw`
  select id,status,requested_start_at,requested_end_at,hold_expires_at
  from public.dd_owner_booking_requests
  where service_request_id=${requestId}::uuid
    and status in ('HOLD','CONFIRMED','EXPIRED')
  order by created_at desc
  limit 1
  for update
 `;
 const booking=bookings[0];
 if(!booking){
  if(!bookingRequested)return {status:'NOT_REQUESTED',scheduled:false};
  await queueBookingAttention(db,{requestId,jobId,status:'BROKEN_MISSING_BOOKING_RECORD'});
  return {status:'BROKEN_MISSING_BOOKING_RECORD',scheduled:false};
 }

 if(booking.status==='EXPIRED'||(booking.status==='HOLD'&&booking.hold_expires_at&&new Date(booking.hold_expires_at)<=new Date())){
  if(booking.status==='HOLD')await db.$executeRaw`update public.dd_owner_booking_requests set status='EXPIRED',updated_at=now() where id=${booking.id}::uuid and status='HOLD'`;
  await queueBookingAttention(db,{requestId,bookingId:booking.id,jobId,status:'LEGITIMATELY_HELD_EXPIRED'});
  return {status:'LEGITIMATELY_HELD_EXPIRED',scheduled:false,bookingId:booking.id};
 }

 if(booking.status==='HOLD'&&!booking.hold_expires_at){
  await queueBookingAttention(db,{requestId,bookingId:booking.id,jobId,status:'BROKEN_HOLD_WITHOUT_EXPIRY'});
  return {status:'BROKEN_HOLD_WITHOUT_EXPIRY',scheduled:false,bookingId:booking.id};
 }

 const start=booking.requested_start_at,end=booking.requested_end_at;
 if(!start||!end||new Date(end)<=new Date(start)){
  await queueBookingAttention(db,{requestId,bookingId:booking.id,jobId,status:'BROKEN_INVALID_BOOKING_WINDOW'});
  return {status:'BROKEN_INVALID_BOOKING_WINDOW',scheduled:false,bookingId:booking.id};
 }

 const jobHasSchedule=Boolean(job.scheduled_start||job.scheduled_end);
 if(jobHasSchedule&&(!sameInstant(job.scheduled_start,start)||!sameInstant(job.scheduled_end,end))){
  await queueBookingAttention(db,{requestId,bookingId:booking.id,jobId,status:'BROKEN_SCHEDULE_CONFLICT',metadata:{job_scheduled_start:job.scheduled_start,job_scheduled_end:job.scheduled_end,requested_start_at:start,requested_end_at:end}});
  return {status:'BROKEN_SCHEDULE_CONFLICT',scheduled:false,bookingId:booking.id};
 }

 if(booking.status==='HOLD'){
  await db.$executeRaw`
   update public.dd_owner_booking_requests
   set status='CONFIRMED',updated_at=now()
   where id=${booking.id}::uuid and status='HOLD'
  `;
 }
 if(!jobHasSchedule){
  await db.$executeRaw`
   update public.dd_jobs
   set scheduled_start=${new Date(start)},scheduled_end=${new Date(end)},updated_at=now()
   where id=${jobId}::uuid and scheduled_start is null and scheduled_end is null
  `;
 }
 return {status:'CONFIRMED',scheduled:true,bookingId:booking.id,scheduledStart:new Date(start),scheduledEnd:new Date(end)};
}
