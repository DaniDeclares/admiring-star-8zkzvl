/**
 * Existing DANI External Action Executor: manually invoked SOP REVIEW ONLY.
 * Reads scoped job events, produces a redacted draft; never writes Production,
 * publishes registry content, contacts customers or claims operator recording.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const UUID=/^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i;
const SOURCES=new Set(['OWNER','EMAIL','PHONE_CALL','PAYMENT_PROVIDER','MIGRATION','PROVIDER','SYSTEM','WEBHOOK']);
const ACTIONS=Object.freeze({
 ARRIVAL_WINDOW_OPEN:'Arrival window opened — verify scheduled attendance',
 ARRIVAL_WINDOW_CLOSE:'Arrival window closed — verify arrival and attendance separately',
 PROVIDER_REPORTED_COMPLETE:'Provider reports completion — independent acceptance required',
 COMPLETION_EVIDENCE_RECEIVED:'Evidence receipt recorded — inspect source and acceptance',
 CUSTOMER_CONFIRMED_COMPLETE:'Customer confirmation event — verify underlying message',
 QA_APPROVED:'QA approval recorded — verify review scope and authority',
 CUSTOMER_PAYMENT_RECEIVED:'Payment receipt recorded — reconcile actual provider receipt',
 PROVIDER_PAYABLE_CLEARED:'Payable clearance recorded — reconcile finance record',
 OWNER_VISIBILITY_LOST:'Owner visibility interrupted — record exception and follow-up'
});
const MAX_EVENTS=25;
const digest=x=>crypto.createHash('sha256').update(String(x)).digest('hex').slice(0,16);
function dateString(value){
 const n=Date.parse(value||'');
 if(!Number.isFinite(n))throw Error('INVALID_EVENT_TIME');
 return new Date(n).toISOString();
}
export function compileReview(jobId,events){
 if(!UUID.test(jobId))throw Error('INVALID_JOB_ID');
 if(!Array.isArray(events)||events.length===0)throw Error('NO_JOB_EXECUTION_EVENTS');
 if(events.length>MAX_EVENTS)throw Error('EVENT_LIMIT_EXCEEDED');
 const seen=new Set();
 const ordered=events.map(e=>{
  if(!UUID.test(e.id)||!UUID.test(e.job_id)||e.job_id.toLowerCase()!==jobId.toLowerCase())throw Error('CROSS_JOB_EVENT');
  if(seen.has(e.id))throw Error('DUPLICATE_EVENT_ID');
  seen.add(e.id);
  if(typeof e.event_type!=='string'||e.event_type.length>64||!/^[A-Z_]+$/.test(e.event_type))throw Error('INVALID_EVENT_TYPE');
  const source=SOURCES.has(e.source_type)?e.source_type:'UNKNOWN_SOURCE';
  const known=Object.hasOwn(ACTIONS,e.event_type);
  return {id:e.id,at:dateString(e.event_at),type:known?e.event_type:'UNCLASSIFIED_EVENT',source,description:known?ACTIONS[e.event_type]:'Unknown event — review original source before using',exception:!known||source==='UNKNOWN_SOURCE'||source==='MIGRATION'};
 }).sort((a,b)=>a.at.localeCompare(b.at)||a.id.localeCompare(b.id));
 const lines=[
 '# DANI SOP evidence review — DRAFT / NOT APPROVED','','**Job:** pseudonymous reference '+digest(jobId),
 '**Source:** Existing Production job event ledger (read-only)',
 '**Output:** Evidence review, NOT a reconstructed step-by-step operator recording',
 '**Publication:** NOT approved; no Airtable or customer writes',
 '',
 '| # | UTC | Event | Interpretation (not proof of completion) | Source type |',
 '|---:|---|---|---|---|'
 ];
 ordered.forEach((e,i)=>lines.push('| '+(i+1)+' | '+e.at+' | '+e.type+' | '+e.description+' | '+e.source+' |'));
 lines.push('','## Review required',
 '- Independently verify each event against the authorized source record.',
 '- Determine which actual operator steps occurred; do not invent clicks or physical actions.',
 '- Distinguish customer statement, provider report, finance receipt, and acceptance.',
 '- Redact client details, verify safety, consent, exact scope and approvals.',
 '- Obtain reviewer approval, link to existing Asana assignment and Airtable 06 Fulfillment SOPs after authorization.',
 '- Have a second operator follow the approved procedure and report exceptions.',
 '','## Exceptions',
 '- '+ordered.filter(e=>e.exception).length+' event(s) had an unknown, migrated, or unverified source classification.',
 '- This run does not prove printer output, rehearsal, employee acceptance or end-to-end SOP publication.',
 '','## Provenance',
 '- Event count: '+ordered.length,
 '- Event-set fingerprint: '+digest(ordered.map(e=>e.id+':'+e.at+':'+e.type).join('|')),
 '- Raw event facts, source references, internal job ID, personal data and credentials were not exported.','');
 const manifest={status:'DRAFT_REVIEW_ONLY',jobRef:digest(jobId),eventCount:ordered.length,exceptions:ordered.filter(x=>x.exception).length,
  source:'public.dd_job_execution_events',isActionRecording:false,registryWritten:false,assignmentAccepted:false,physicalCompletionVerified:false};
 return {markdown:lines.join('\n'),manifest};
}
export function validBase(value){
 const raw=/^https?:\/\//i.test(value||'')?value:'https://'+value+'.supabase.co';
 const url=new URL(raw);
 if(url.protocol!=='https:'||!(/^[a-z0-9-]+\.supabase\.co$/i.test(url.hostname))||url.username||url.password||url.search||url.hash)throw Error('DATABASE_ORIGIN_REJECTED');
 return url.origin;
}
export function requireScopedKey(key){
 if(typeof key!=='string'||!key)throw Error('MISSING_SCOPED_READER_CREDENTIAL');
 const parts=key.split('.');
 if(parts.length!==3)throw Error('UNRECOGNIZED_READER_CREDENTIAL');
 let role;
 try{role=JSON.parse(Buffer.from(parts[1],'base64url').toString('utf8')).role}catch{throw Error('READER_ROLE_UNVERIFIED')}
 if(role!=='dani_sop_reader')throw Error('READER_ROLE_NOT_LEAST_PRIVILEGED');
 // This early check is NOT an authorization decision: Supabase must verify
 // the JWT signature, role GRANT, RLS policy and per-job claims on every GET.
 return key;
}
export async function readEvents({jobId,base,key,apiKey,fetcher=fetch}){
 if(!UUID.test(jobId))throw Error('INVALID_JOB_ID');
 requireScopedKey(key);
 if(typeof apiKey!=='string'||!apiKey.startsWith('sb_publishable_'))throw Error('MISSING_PUBLISHABLE_API_KEY');
 const url=new URL(validBase(base)+'/rest/v1/dd_job_execution_events');
 url.searchParams.set('job_id','eq.'+jobId);
 url.searchParams.set('select','id,job_id,event_at,event_type,source_type');
 url.searchParams.set('order','event_at.asc,id.asc');
 url.searchParams.set('limit',String(MAX_EVENTS+1));
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),10000);
 try{
  const result=await fetcher(url,{method:'GET',headers:{apikey:apiKey,Authorization:'Bearer '+key,Accept:'application/json'},redirect:'error',signal:controller.signal});
  if(!result.ok)throw Error('SOURCE_HTTP_'+result.status);
  const rows=await result.json();
  if(!Array.isArray(rows))throw Error('SOURCE_RESPONSE_INVALID');
  if(rows.length>MAX_EVENTS)throw Error('EVENT_LIMIT_EXCEEDED');
  return rows;
 }finally{clearTimeout(timer)}
}
export async function createDraft({jobId,outDir,base,key,apiKey,fetcher=fetch}){
 const observed=await readEvents({jobId,base,key,apiKey,fetcher});
 const output=compileReview(jobId,observed);
 await fs.mkdir(outDir,{recursive:true});
 await fs.writeFile(path.join(outDir,'SOP_REVIEW_DRAFT.md'),output.markdown,'utf8');
 await fs.writeFile(path.join(outDir,'SOP_REVIEW_MANIFEST.json'),JSON.stringify(output.manifest,null,2)+'\n','utf8');
 return output.manifest;
}
async function main(){
 const args=process.argv.slice(2);
 const get=flag=>{const n=args.indexOf(flag);return n<0?undefined:args[n+1]};
 const jobId=get('--job-id'),outDir=get('--out-dir');
 if(!jobId||!outDir||!path.isAbsolute(outDir))throw Error('REQUIRED_EXACT_JOB_ID_AND_ABSOLUTE_OUTPUT_DIR');
 const approvedJobId=process.env.SOP_REVIEW_APPROVED_JOB_ID;
 if(!UUID.test(approvedJobId||'')||jobId.toLowerCase()!==approvedJobId.toLowerCase())throw Error('JOB_NOT_EXACTLY_APPROVED');
 const result=await createDraft({jobId,outDir,base:process.env.PRODUCTION_SUPABASE_URL,key:process.env.SOP_REVIEW_READ_ONLY_KEY,apiKey:process.env.SOP_REVIEW_PUBLISHABLE_API_KEY});
 console.log('SOP_REVIEW_GENERATED '+JSON.stringify(result));
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])){
 main().catch(e=>{const code=typeof e?.message==='string'&&/^[A-Z0-9_]+$/.test(e.message)?e.message:'REVIEW_FAILED_SAFELY';console.error('SOP_REVIEW_HELD '+code);process.exitCode=1});
}
