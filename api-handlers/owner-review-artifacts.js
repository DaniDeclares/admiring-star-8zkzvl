import { authenticatePortalRequest } from './_portalAuth.js';
import { BUCKET, TABLE, OWNER_REVIEW, MAX_BODY_BYTES, isGovernedOwner, validateImport, validateKey, sameRecord, exactBytes } from './_ownerReviewCore.js';

function reply(res,status,payload) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  return res.status(status).json(payload);
}
function fail(status,code) { return {status,code}; }

export async function readImportBody(req) {
  const type=String(req.headers?.['content-type']||'').split(';')[0].trim().toLowerCase();
  if(type!=='application/json') throw new Error('JSON_REQUIRED');
  const declared=req.headers?.['content-length'];
  if(declared!==undefined&&(!/^\d+$/.test(String(declared))||Number(declared)>MAX_BODY_BYTES)) throw new Error('BODY_TOO_LARGE');
  if(req.body!==undefined&&req.body!==null) {
    const body=typeof req.body==='string'?req.body:Buffer.isBuffer(req.body)?req.body.toString('utf8'):JSON.stringify(req.body);
    if(Buffer.byteLength(body,'utf8')>MAX_BODY_BYTES) throw new Error('BODY_TOO_LARGE');
    const parsed=JSON.parse(body);
    if(!parsed||typeof parsed!=='object'||Array.isArray(parsed)) throw new Error('INVALID_REQUEST');
    return parsed;
  }
  let length=0;const chunks=[];
  for await(const chunk of req) {
    const buffer=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk);
    length+=buffer.length;
    if(length>MAX_BODY_BYTES) throw new Error('BODY_TOO_LARGE');
    chunks.push(buffer);
  }
  const parsed=JSON.parse(Buffer.concat(chunks).toString('utf8'));
  if(!parsed||typeof parsed!=='object'||Array.isArray(parsed)) throw new Error('INVALID_REQUEST');
  return parsed;
}
async function findRecord(db,key) {
  const {data,error}=await db.from(TABLE).select('*').eq('artifact_key',key).maybeSingle();
  if(error) throw new Error('METADATA_READ_FAILED');
  return data;
}
async function readObject(db,path) {
  const {data,error}=await db.storage.from(BUCKET).download(path);
  if(error||!data) return null;
  return Buffer.from(await data.arrayBuffer());
}
export async function importArtifact(db,body) {
  const {bytes,metadata}=validateImport(body);
  const existing=await findRecord(db,OWNER_REVIEW.artifactKey);
  if(existing) {
    if(!sameRecord(existing,metadata)) return fail(409,'ARTIFACT_CONFLICT');
    const stored=await readObject(db,OWNER_REVIEW.storagePath);
    if(!exactBytes(stored,existing)) return fail(503,'STORAGE_INTEGRITY_FAILURE');
    return {status:200,code:'ALREADY_IMPORTED',artifactId:existing.id,sha256:OWNER_REVIEW.sha256};
  }
  const before=await readObject(db,OWNER_REVIEW.storagePath);
  if(before&&!exactBytes(before,metadata)) return fail(409,'STORAGE_CONFLICT');
  if(!before) {
    const uploaded=await db.storage.from(BUCKET).upload(OWNER_REVIEW.storagePath,bytes,{contentType:'application/octet-stream',upsert:false});
    if(uploaded.error) {
      const concurrent=await readObject(db,OWNER_REVIEW.storagePath);
      if(!exactBytes(concurrent,metadata)) return fail(503,'STORAGE_UPLOAD_FAILED');
    }
  }
  const confirmed=await readObject(db,OWNER_REVIEW.storagePath);
  if(!exactBytes(confirmed,metadata)) return fail(503,'STORAGE_VERIFY_FAILED');
  const {data,error}=await db.from(TABLE).insert(metadata).select('id,sha256').single();
  if(error) {
    const after=await findRecord(db,OWNER_REVIEW.artifactKey);
    const stored=await readObject(db,OWNER_REVIEW.storagePath);
    if(sameRecord(after,metadata)&&exactBytes(stored,after)) return {status:200,code:'ALREADY_IMPORTED',artifactId:after.id,sha256:OWNER_REVIEW.sha256};
    return fail(503,'METADATA_COMMIT_FAILED');
  }
  return {status:201,code:'IMPORTED',artifactId:data.id,sha256:OWNER_REVIEW.sha256};
}
export async function retrieveArtifact(db,key) {
  if(!validateKey(key)) return fail(400,'INVALID_KEY');
  const record=await findRecord(db,key);
  if(!record) return fail(404,'NOT_FOUND');
  const expected={artifact_key:OWNER_REVIEW.artifactKey,assignment_system:'ASANA',assignment_id:OWNER_REVIEW.assignmentId,filename:OWNER_REVIEW.filename,storage_path:OWNER_REVIEW.storagePath,sha256:OWNER_REVIEW.sha256,byte_length:OWNER_REVIEW.length,source_environment:'DANI_WINDOWS_WORKER',review_status:'REVIEW_ONLY',recipient_eligibility:'NOT_CLEARED',outbound_status:'NOT_SENT'};
  if(!sameRecord(record,expected)) return fail(503,'METADATA_INTEGRITY_FAILURE');
  const bytes=await readObject(db,OWNER_REVIEW.storagePath);
  if(!exactBytes(bytes,record)) return fail(503,'CONTENT_INTEGRITY_FAILURE');
  return {status:200,code:'RETRIEVED',artifact:{assignmentId:OWNER_REVIEW.assignmentId,filename:OWNER_REVIEW.filename,sha256:OWNER_REVIEW.sha256,contentBase64:bytes.toString('base64'),reviewStatus:'REVIEW_ONLY',recipientEligibility:'NOT_CLEARED',outboundStatus:'NOT_SENT'}};
}
export default async function handler(req,res) {
  if(req.method!=='GET'&&req.method!=='POST') {
    res.setHeader('Allow','GET, POST');return reply(res,405,{code:'METHOD_NOT_ALLOWED'});
  }
  let auth;
  try { auth=await authenticatePortalRequest(req); }
  catch { return reply(res,503,{code:'AUTH_UNAVAILABLE'}); }
  if(!auth||auth.error) return reply(res,auth?.status===403?403:401,{code:'UNAUTHORIZED'});
  if(!isGovernedOwner(auth)) return reply(res,403,{code:'OWNER_ONLY'});
  if(!auth.supabase) return reply(res,503,{code:'STORAGE_UNAVAILABLE'});
  try {
    if(req.method==='GET') {
      const result=await retrieveArtifact(auth.supabase,req.query?.artifactKey);
      return reply(res,result.status,result);
    }
    const origin=req.headers?.origin;const host=req.headers?.host;
    if(origin) {
      let source;try {source=new URL(origin);}catch{return reply(res,403,{code:'ORIGIN_DENIED'});}
      if(!host||source.host!==host||source.protocol!=='https:') return reply(res,403,{code:'ORIGIN_DENIED'});
    }
    const body=await readImportBody(req);
    const result=await importArtifact(auth.supabase,body);
    return reply(res,result.status,result);
  } catch(error) {
    const code=error?.message;
    if(code==='JSON_REQUIRED') return reply(res,415,{code});
    if(code==='BODY_TOO_LARGE') return reply(res,413,{code});
    if(['INVALID_BASE64','INVALID_REQUEST','INVALID_IMPORT_METADATA','BYTE_LENGTH_MISMATCH','HASH_MISMATCH'].includes(code)) return reply(res,422,{code});
    if(error instanceof SyntaxError) return reply(res,400,{code:'INVALID_JSON'});
    return reply(res,503,{code:'ARTIFACT_OPERATION_FAILED'});
  }
}
