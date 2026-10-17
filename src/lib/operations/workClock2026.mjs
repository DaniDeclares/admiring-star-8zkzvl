// DANI existing dd_provider_time_entries ledger: owner-only nonbillable time study
// and provider-bound job punches. No separate queue, payroll or invoice objects.
export const DANI_CLOCK_TASKS = Object.freeze({
  MAINTENANCE_PREP: Object.freeze([
    ['ACCESS_SAFETY','Breaker panel, water heater, access paths'],
    ['TRASH_PATIO','Trash and patio'],
    ['KITCHEN_APPLIANCES','Oven, stove, refrigerator, countertops'],
    ['KITCHEN_STORAGE','Cabinets and drawers'],
    ['FLOORS_BASEBOARDS','Floors and baseboards'],
    ['WINDOWS_LIGHTS','Windows, sills and reachable lights'],
    ['CARPETS_RUGS','Vacuum carpets and rugs'],
    ['ROOMS_CLOSETS','Rooms and closets'],
    ['PHOTO_REPORT','Photos, QA and maintenance notes']
  ]),
  MONDAY_SALES: Object.freeze([
    ['QUOTE_PAYMENT','Service inquiry, quote and payment path'],
    ['SALES_FOLLOWUP','Sales calls and follow-up preparation'],
    ['CAMPAIGN_POST','Campaign assets and publishing'],
    ['BUYER_OUTREACH','Property-manager and realtor sales']
  ]),
  PRINTIFY_MERCH: Object.freeze([
    ['ARTWORK_PREP','Approved original artwork prep'],
    ['PRODUCT_DRAFT','Product creation and variants'],
    ['PRICE_SHIPPING','Prices, shipping and economics'],
    ['PUBLISH_QA','Product publication and QA']
  ])
});
export function allowedStudyTask(study, task) {
  return Boolean(DANI_CLOCK_TASKS[study]?.some(([key]) => key === task));
}
export function minutesForEntry(entry, now = new Date()) {
  const start=Date.parse(entry?.started_at || '');
  if(!Number.isFinite(start)) return 0;
  const end=entry?.ended_at?Date.parse(entry.ended_at):entry?.entry_status==='OPEN'?+new Date(now):start;
  if(!Number.isFinite(end)) return 0;
  return Math.max(0, Math.round((end-start)/1000))/60;
}
export function summarizeEntries(entries=[], now=new Date()) {
  const grouped={};let minutes=0;
  for(const entry of entries) {
    if(entry.entry_status==='VOID' || entry.time_type==='BREAK') continue;
    const n=minutesForEntry(entry,now);
    const name=[entry.metadata?.study_code||'PROVIDER_JOB',entry.metadata?.task_code||'FIELD_WORK'].join(':');
    grouped[name]=(grouped[name]||0)+n;
    minutes+=n;
  }
  return {minutes:Number(minutes.toFixed(2)),byTask:Object.fromEntries(Object.entries(grouped).map(([k,v])=>[k,Number(v.toFixed(2))]))};
}
function clockError(message,status=400) {const e=new Error(message);e.status=status;return e;}
export function clockAccess(context, jobId) {
  if(context?.role==='owner' && context?.isStaff) {
    if(jobId) throw clockError('Owner time studies do not use customer jobs.',400);
    return {owner:true,actorId:context.user.id,providerId:null,jobId:null};
  }
  if(context?.role==='provider' && !context?.isStaff && context?.identity?.entity_id) {
    if(!jobId) throw clockError('Provider job ID is required.',400);
    return {owner:false,actorId:context.user.id,providerId:context.identity.entity_id,jobId};
  }
  throw clockError('Time clock unavailable for this portal role.',403);
}
const FIELDS='id,provider_id,job_id,assignment_id,time_type,entry_status,started_at,ended_at,source,metadata';
async function getEntries(context, access) {
  let q=context.supabase.from('dd_provider_time_entries')
    .select(FIELDS).eq('actor_auth_user_id',access.actorId)
    .order('started_at',{ascending:false}).limit(500);
  if(access.owner) q=q.eq('source','DANI_OWNER_TIME_STUDY');
  else q=q.eq('provider_id',access.providerId).eq('job_id',access.jobId);
  const {data,error}=await q;
  if(error) throw error;
  return data||[];
}
async function findRunning(context, actorId) {
  const {data,error}=await context.supabase.from('dd_provider_time_entries')
    .select(FIELDS).eq('actor_auth_user_id',actorId).eq('entry_status','OPEN')
    .is('ended_at',null).order('started_at',{ascending:false}).limit(1).maybeSingle();
  if(error) throw error;
  return data;
}
async function assertAcceptedAssignment(context,access,assignmentId) {
  if(access.owner) return null;
  if(!assignmentId) throw clockError('An accepted assignment is required for provider time.',403);
  const {data,error}=await context.supabase.from('dd_job_assignments')
    .select('id,job_id,provider_id,assignment_status')
    .eq('id',assignmentId).eq('job_id',access.jobId)
    .eq('provider_id',access.providerId).eq('assignment_status','ACCEPTED').maybeSingle();
  if(error) throw error;
  if(!data) throw clockError('This is not your accepted job assignment.',403);
  return data;
}
export async function getWorkClockSnapshot(context,jobId) {
  const access=clockAccess(context,jobId);
  const [entries, running]=await Promise.all([getEntries(context,access),findRunning(context,access.actorId)]);
  return {clock:{mode:access.owner?'OWNER_STUDY':'PROVIDER_JOB',entries,
    running:running && (access.owner?running.source==='DANI_OWNER_TIME_STUDY':running.job_id===access.jobId)?running:null,
    activeElsewhere:Boolean(running && (access.owner?running.source!=='DANI_OWNER_TIME_STUDY':running.job_id!==access.jobId)),
    totals:summarizeEntries(entries),truncated:entries.length===500}};
}
export async function applyWorkClockAction(context,payload={}) {
  const access=clockAccess(context,payload.jobId||null);
  const event=String(payload.event||'').toUpperCase();
  if(!['START','PAUSE','RESUME','CLOCK_OUT'].includes(event)) throw clockError('Unsupported clock action.');
  const current=await findRunning(context,access.actorId);
  const entries=await getEntries(context,access);
  const latest=entries[0];
  if(event==='START'||event==='RESUME'){
    if(current) throw clockError('Clock out or pause your current task before starting another.',409);
    let study,task;
    if(event==='RESUME') {
      if(!latest||latest.entry_status!=='PAUSED') throw clockError('No paused task to resume.',409);
      study=latest.metadata?.study_code;
      task=latest.metadata?.task_code;
    } else {
      study=access.owner?String(payload.studyCode||''): 'PROVIDER_JOB';
      task=access.owner?String(payload.taskCode||''):'FIELD_WORK';
    }
    if(access.owner && !allowedStudyTask(study,task)) throw clockError('Choose an approved work block.');
    const assignment=await assertAcceptedAssignment(context,access,payload.assignmentId || latest?.assignment_id);
    if(!access.owner){
      const {data:job,error:jobError}=await context.supabase.from('dd_jobs').select('id,job_status').eq('id',access.jobId).maybeSingle();
      if(jobError) throw jobError;
      if(!job||['cancelled','completed','CANCELLED','COMPLETED'].includes(job.job_status)) throw clockError('Job cannot accept a new punch in its current state.',409);
    }
    const record={actor_auth_user_id:access.actorId,provider_id:access.providerId,
      job_id:access.jobId,assignment_id:assignment?.id||null,
      time_type:access.owner?(study==='MAINTENANCE_PREP'?'ON_SITE':'ADMIN'):'ON_SITE',
      entry_status:'OPEN',started_at:new Date().toISOString(),
      source:access.owner?'DANI_OWNER_TIME_STUDY':'DANI_FIELD',
      metadata:{study_code:study,task_code:task,nonbillable:access.owner,record_class:access.owner?'OWNER_INTERNAL_STUDY':'PROVIDER_WORK',from_pause:event==='RESUME'}};
    const {data,error}=await context.supabase.from('dd_provider_time_entries').insert(record).select(FIELDS).single();
    if(error?.code==='23505') throw clockError('Another clock punch is already running.',409);
    if(error) throw error;
    return {entry:data};
  }
  if(event==='CLOCK_OUT' && !current && latest?.entry_status==='PAUSED'){
    const {data,error}=await context.supabase.from('dd_provider_time_entries')
      .update({entry_status:'CLOSED',metadata:{...latest.metadata,close_reason:'CLOCK_OUT_WHILE_PAUSED'},updated_at:new Date().toISOString()})
      .eq('id',latest.id).eq('actor_auth_user_id',access.actorId).eq('entry_status','PAUSED').select(FIELDS).maybeSingle();
    if(error) throw error;
    if(!data) throw clockError('Clock entry changed, refresh and retry.',409);
    return {entry:data};
  }
  if(!current) throw clockError('No running clock for this account.',409);
  if(access.owner && current.source!=='DANI_OWNER_TIME_STUDY') throw clockError('Another kind of work is running.',409);
  if(!access.owner && (current.provider_id!==access.providerId || current.job_id!==access.jobId)) throw clockError('A different job is running.',409);
  const now=new Date().toISOString();
  const {data,error}=await context.supabase.from('dd_provider_time_entries')
    .update({entry_status:event==='PAUSE'?'PAUSED':'CLOSED',ended_at:now,updated_at:now,
      metadata:{...current.metadata,close_reason:event}})
    .eq('id',current.id).eq('actor_auth_user_id',access.actorId)
    .eq('entry_status','OPEN').is('ended_at',null).select(FIELDS).maybeSingle();
  if(error) throw error;
  if(!data) throw clockError('Clock entry was already changed.',409);
  return {entry:data};
}
