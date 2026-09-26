import { createClient } from '@supabase/supabase-js';
import { decryptSecret, encryptSecret, ENVIRONMENT, logIntegrationEvent, requireStaff } from '../../_integrationOAuth.js';

const DRIVE_API='https://www.googleapis.com/drive/v3';
const GOOGLE_DOC='application/vnd.google-apps.document';
const GOOGLE_SHEET='application/vnd.google-apps.spreadsheet';
const GOOGLE_SLIDES='application/vnd.google-apps.presentation';
const MAX_TEXT=120000;

function adminClient(){
 const url=process.env.SUPABASE_URL||process.env.REACT_APP_SUPABASE_URL;
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key) throw new Error('Server Supabase configuration is missing.');
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
async function refreshAccessToken(supabase,connection){
 const refreshToken=decryptSecret(connection.refresh_token_ciphertext);
 if(!refreshToken) throw new Error('GOOGLE_DRIVE_REFRESH_TOKEN_MISSING');
 const clientId=process.env.GOOGLE_CLIENT_ID,clientSecret=process.env.GOOGLE_CLIENT_SECRET;
 if(!clientId||!clientSecret) throw new Error('GOOGLE_OAUTH_CONFIGURATION_MISSING');
 const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',client_id:clientId,client_secret:clientSecret,refresh_token:refreshToken})});
 const body=await response.json();
 if(!response.ok||!body.access_token) throw new Error(body.error_description||body.error||'GOOGLE_DRIVE_TOKEN_REFRESH_FAILED');
 const expiresAt=body.expires_in?new Date(Date.now()+Number(body.expires_in)*1000).toISOString():null;
 const {error}=await supabase.from('dd_integration_connections').update({access_token_ciphertext:encryptSecret(body.access_token),token_expires_at:expiresAt,last_error:null,updated_at:new Date().toISOString()}).eq('id',connection.id);
 if(error) throw error;
 return body.access_token;
}
async function tokenFor(supabase,connection){
 let token=connection.access_token_ciphertext?decryptSecret(connection.access_token_ciphertext):null;
 const expiring=!connection.token_expires_at||new Date(connection.token_expires_at).getTime()<Date.now()+60000;
 if(!token||expiring) token=await refreshAccessToken(supabase,connection);
 return token;
}
async function driveFetch(url,token,asText=false){
 const response=await fetch(url,{headers:{Authorization:'Bearer '+token}});
 if(response.status===401){const e=new Error('GOOGLE_DRIVE_TOKEN_EXPIRED');e.status=401;throw e;}
 if(!response.ok){const body=await response.text();throw new Error('GOOGLE_DRIVE_API_FAILED:'+response.status+':'+body.slice(0,500));}
 return asText?response.text():response.json();
}
function classify(name='',text=''){
 const hay=(name+' '+text.slice(0,20000)).toLowerCase();
 const rules=[
  ['ACCOUNTING_MONEY',/invoice|receipt|paypal|quickbooks|expense|bank|zelle|cash flow|profit|loss|tax/],
  ['PROVIDER',/provider|vendor|subcontract|w-9|w9|coi|background check|independent contractor/],
  ['SALES_CRM',/lead|prospect|sales|client|customer|proposal|quote|estimate/],
  ['SERVICE_CATALOG',/service|pricing|price list|rate card|scope of work|sku/],
  ['GOVERNMENT',/sam\.gov|procurement|rfp|solicitation|cage|uei|naics|government|certification/],
  ['LEGAL_COMPLIANCE',/contract|agreement|license|licensing|legal|compliance|insurance|policy/],
  ['PROPERTY_EXPANSION',/property|apartment|real estate|lease|piedmont|south carolina|flex space/],
  ['MARKETING_RESEARCH',/marketing|course|class|webinar|zoom|newsletter|seo|competitor|market research/],
  ['OPERATIONS',/sop|workflow|dispatch|job|work order|operations|checklist/],
 ];
 for(const [domain,re] of rules) if(re.test(hay)) return domain;
 return 'GENERAL_RESEARCH';
}
function routes(domain){
 const map={ACCOUNTING_MONEY:['ACCOUNTING_REVIEW'],PROVIDER:['PROVIDER_INTELLIGENCE'],SALES_CRM:['SALES_RESEARCH'],SERVICE_CATALOG:['RESEARCH_QUEUE'],GOVERNMENT:['RESEARCH_QUEUE'],LEGAL_COMPLIANCE:['RISK_REVIEW'],PROPERTY_EXPANSION:['PROPERTY_INTELLIGENCE'],MARKETING_RESEARCH:['MARKET_INTELLIGENCE'],OPERATIONS:['RESEARCH_QUEUE']};
 return map[domain]||['RESEARCH_QUEUE'];
}
function fingerprint(file,text=''){return [file.id,file.modifiedTime,file.md5Checksum||'',file.size||'',text.length].join(':');}
async function extractText(file,token){
 try{
  if(file.mimeType===GOOGLE_DOC) return (await driveFetch(DRIVE_API+'/files/'+encodeURIComponent(file.id)+'/export?mimeType=text%2Fplain',token,true)).slice(0,MAX_TEXT);
  if(file.mimeType===GOOGLE_SHEET) return (await driveFetch(DRIVE_API+'/files/'+encodeURIComponent(file.id)+'/export?mimeType=text%2Fcsv',token,true)).slice(0,MAX_TEXT);
  if(file.mimeType===GOOGLE_SLIDES) return (await driveFetch(DRIVE_API+'/files/'+encodeURIComponent(file.id)+'/export?mimeType=text%2Fplain',token,true)).slice(0,MAX_TEXT);
  if(/^text\//.test(file.mimeType||'')) return (await driveFetch(DRIVE_API+'/files/'+encodeURIComponent(file.id)+'?alt=media',token,true)).slice(0,MAX_TEXT);
 }catch(error){return '';}
 return '';
}
async function syncConnection(supabase,connection,runId){
 let token=await tokenFor(supabase,connection);
 const account=String(connection.token_metadata?.email||connection.external_account_id||'unknown');
 const previous=connection.last_sync_at?new Date(connection.last_sync_at):null;
 const since=previous&&Number.isFinite(previous.getTime())?previous.toISOString():new Date(Date.now()-365*86400000).toISOString();
 let pageToken=null,seen=0,triaged=0;
 do{
  const params=new URLSearchParams({pageSize:'100',spaces:'drive',q:"trashed = false and modifiedTime > '"+since+"'",orderBy:'modifiedTime asc',fields:'nextPageToken,files(id,name,mimeType,modifiedTime,createdTime,md5Checksum,size,parents,webViewLink,description,owners(displayName,emailAddress))'});
  if(pageToken) params.set('pageToken',pageToken);
  let page;
  try{page=await driveFetch(DRIVE_API+'/files?'+params.toString(),token);}
  catch(error){if(error.status!==401) throw error;token=await refreshAccessToken(supabase,connection);page=await driveFetch(DRIVE_API+'/files?'+params.toString(),token);}
  for(const file of page.files||[]){
   seen++;
   const text=await extractText(file,token);
   const domain=classify(file.name,text);
   const findingKey='DRIVE:'+account+':'+file.id;
   const summary=text?text.replace(/\s+/g,' ').trim().slice(0,1200):null;
   const row={finding_key:findingKey,source_file_id:file.id,source_name:file.name,drive_account:account,file_modified_at:file.modifiedTime||null,content_fingerprint:fingerprint(file,text),version_group_key:String(file.name||'').toLowerCase().replace(/\b(v\d+|final|copy|updated|new)\b/g,'').replace(/[^a-z0-9]+/g,' ').trim()||null,classification:'DRIVE_ARTIFACT',domain_hint:domain,authority_class:'EVIDENCE_ONLY',freshness_status:'CURRENT_AS_OF_FILE_MODIFIED_AT',conflict_status:'NONE',extraction_summary:summary,actionability:domain==='GENERAL_RESEARCH'?'REVIEW':'ROUTE',route_targets:routes(domain),processing_status:'TRIAGED',source_metadata:{mime_type:file.mimeType,parents:file.parents||[],web_view_link:file.webViewLink||null,description:file.description||null,owners:file.owners||[],created_time:file.createdTime||null,run_id:runId,source_mutation_allowed:false},last_seen_at:new Date().toISOString(),updated_at:new Date().toISOString()};
   const {error}=await supabase.from('dd_drive_intelligence_findings').upsert(row,{onConflict:'finding_key'});
   if(error) throw error;
   triaged++;
  }
  pageToken=page.nextPageToken||null;
 }while(pageToken);
 const now=new Date().toISOString();
 await supabase.from('dd_integration_connections').update({last_sync_at:now,last_error:null,updated_at:now}).eq('id',connection.id);
 return {seen,triaged};
}
export default async function handler(req,res){
 if(!['GET','POST'].includes(req.method)) return res.status(405).json({success:false,error:'Method not allowed'});
 const supabase=adminClient();
 try{
  const cronAuthorized=process.env.CRON_SECRET&&req.headers.authorization==='Bearer '+process.env.CRON_SECRET;
  if(!cronAuthorized) await requireStaff(req);
  const runKey='DRIVE-CODE-'+new Date().toISOString().slice(0,13).replace(/[-T:]/g,'');
  const {data:run,error:runError}=await supabase.from('dd_drive_intelligence_runs').upsert({run_key:runKey,status:'RUNNING',started_at:new Date().toISOString(),run_metadata:{runtime:'DANI_CODE',source_mutation_allowed:false}},{onConflict:'run_key'}).select('id').single();
  if(runError) throw runError;
  const {data:connections,error}=await supabase.from('dd_integration_connections').select('*').eq('adapter_code','GOOGLE_DRIVE').eq('environment',ENVIRONMENT).eq('connection_status','CONNECTED');
  if(error) throw error;
  let seen=0,triaged=0,failed=0;
  for(const connection of connections||[]){try{const x=await syncConnection(supabase,connection,run.id);seen+=x.seen;triaged+=x.triaged;}catch(e){failed++;await supabase.from('dd_integration_connections').update({last_error:e.message,updated_at:new Date().toISOString()}).eq('id',connection.id);}}
  const status=failed?'PARTIAL':'COMPLETED';
  await supabase.from('dd_drive_intelligence_runs').update({status,files_seen:seen,files_triaged:triaged,completed_at:new Date().toISOString(),run_metadata:{runtime:'DANI_CODE',source_mutation_allowed:false,connections:(connections||[]).length,failed_connections:failed},updated_at:new Date().toISOString()}).eq('id',run.id);
  await logIntegrationEvent({supabase,adapterCode:'GOOGLE_DRIVE',direction:'INBOUND',eventType:'DRIVE_INTELLIGENCE_SYNC',status:failed?'PARTIAL':'PROCESSED',payload:{run_id:run.id,files_seen:seen,files_triaged:triaged,failed_connections:failed}});
  return res.status(200).json({success:!failed,status,files_seen:seen,files_triaged:triaged,failed_connections:failed});
 }catch(error){return res.status(error.status||500).json({success:false,error:error.message||'DRIVE_INTELLIGENCE_SYNC_FAILED'});}
}
