jest.mock('./_portalAuth.js',()=>({authenticatePortalRequest:jest.fn()}));
import { authenticatePortalRequest } from './_portalAuth.js';
import handler,{ readImportBody,retrieveArtifact,importArtifact } from './owner-review-artifacts.js';
import { OWNER_REVIEW } from './_ownerReviewCore.js';
function response(){return {headers:{},statusCode:null,payload:null,setHeader(name,value){this.headers[name]=value;return this;},status(code){this.statusCode=code;return this;},json(body){this.payload=body;return this;}};}
function request(method='GET',overrides={}){return {method,headers:{host:'danideclares.com',...overrides.headers},query:{artifactKey:OWNER_REVIEW.artifactKey},...overrides};}
function fakeDb(record=null,bytes=null){
 const state={record,bytes,reads:0,writes:0,tables:[],failUpload:false,failInsert:false};
 const db={state,from(name){state.reads++;state.tables.push(name);return {
   select(){return {eq(){return {async maybeSingle(){return {data:state.record,error:null};}};}};},
   insert(metadata){state.writes++;return {select(){return {async single(){
     if(state.failInsert){state.failInsert=false;return {data:null,error:{message:'failure'}};}
     state.record={...metadata,id:'test-artifact-id'};return {data:state.record,error:null};
   }};}};}
 };},storage:{from(){state.reads++;return {
   async upload(path,incoming,options){state.writes++;if(state.failUpload)return {error:{message:'upload failed'}};
    if(path!==OWNER_REVIEW.storagePath||options.upsert!==false||state.bytes)return {error:{message:'object exists'}};
    state.bytes=Buffer.from(incoming);return {error:null};},
   async download(){state.reads++;if(!state.bytes)return {data:null,error:{message:'missing'}};
    return {data:{async arrayBuffer(){return Uint8Array.from(state.bytes).buffer;}},error:null};}
 };}}};
 return db;
}
const owner=db=>({user:{id:'test-owner'},role:'owner',governedRole:'OWNER_OPERATOR',supabase:db});
beforeEach(()=>{jest.resetAllMocks();});
test.each([
 ['ordinary staff','staff',undefined],['admin','admin',undefined],['provider','provider',undefined],
 ['customer','customer',undefined],['owner without governed role','owner',undefined]
])('%s denied before persistence',async(_,role,governedRole)=>{
 const db=fakeDb();authenticatePortalRequest.mockResolvedValue({user:{id:'test-user'},role,governedRole,supabase:db});
 const res=response();await handler(request(),res);
 expect(res.statusCode).toBe(403);expect(db.state.reads).toBe(0);expect(db.state.writes).toBe(0);
});
test('missing session denied before persistence',async()=>{
 const db=fakeDb();authenticatePortalRequest.mockResolvedValue({error:'Authentication required',status:401,supabase:db});
 const res=response();await handler(request(),res);
 expect(res.statusCode).toBe(401);expect(db.state.reads).toBe(0);expect(db.state.writes).toBe(0);
});
test('invalid session denied before persistence',async()=>{
 const db=fakeDb();authenticatePortalRequest.mockResolvedValue({error:'Invalid session',status:401,supabase:db});
 const res=response();await handler(request(),res);
 expect(res.statusCode).toBe(401);expect(db.state.reads).toBe(0);expect(db.state.writes).toBe(0);
});
test('authentication outage denied before persistence',async()=>{
 authenticatePortalRequest.mockRejectedValue(new Error('auth unavailable'));
 const res=response();await handler(request(),res);
 expect(res.statusCode).toBe(503);expect(res.payload.code).toBe('AUTH_UNAVAILABLE');
});
test('owner can reach retrieval but missing artifact is 404',async()=>{
 const db=fakeDb();authenticatePortalRequest.mockResolvedValue(owner(db));
 const res=response();await handler(request(),res);
 expect(res.statusCode).toBe(404);expect(res.payload.code).toBe('NOT_FOUND');expect(db.state.writes).toBe(0);
});
test('owner cannot retrieve an arbitrary artifact key',async()=>{
 const db=fakeDb();authenticatePortalRequest.mockResolvedValue(owner(db));
 const res=response();await handler(request('GET',{query:{artifactKey:'another-key'}}),res);
 expect(res.statusCode).toBe(400);expect(db.state.reads).toBe(0);expect(db.state.writes).toBe(0);
});
test('parsed request body has a byte-size limit',async()=>{
 await expect(readImportBody({headers:{'content-type':'application/json'},body:{contentBase64:'A'.repeat(9000)}})).rejects.toThrow('BODY_TOO_LARGE');
});
test('malformed parsed JSON is rejected',async()=>{
 await expect(readImportBody({headers:{'content-type':'application/json'},body:'{bad-json'})).rejects.toThrow();
});
test('owner POST rejects altered OWNER_REVIEW bytes without storage access',async()=>{
 const db=fakeDb();authenticatePortalRequest.mockResolvedValue(owner(db));
 const res=response();await handler(request('POST',{headers:{host:'danideclares.com','content-type':'application/json'},
 body:{assignmentId:OWNER_REVIEW.assignmentId,artifactKey:OWNER_REVIEW.artifactKey,filename:OWNER_REVIEW.filename,
 sourceEnvironment:'DANI_WINDOWS_WORKER',reviewStatus:'REVIEW_ONLY',recipientEligibility:'NOT_CLEARED',
 outboundStatus:'NOT_SENT',sha256:OWNER_REVIEW.sha256,contentBase64:Buffer.alloc(OWNER_REVIEW.length,65).toString('base64')}}),res);
 expect(res.statusCode).toBe(422);expect(res.payload.code).toBe('HASH_MISMATCH');
 expect(db.state.reads).toBe(0);expect(db.state.writes).toBe(0);
});
test('invalid import is rejected before any storage or metadata operation',async()=>{
 const db=fakeDb();db.state.failUpload=true;
 await expect(importArtifact(db,{assignmentId:OWNER_REVIEW.assignmentId,contentBase64:'AAAA'})).rejects.toThrow('INVALID_IMPORT_METADATA');
 expect(db.state.reads).toBe(0);expect(db.state.writes).toBe(0);
});
test('missing object is not a successful retrieval',async()=>{
 const db=fakeDb({artifact_key:OWNER_REVIEW.artifactKey,assignment_system:'ASANA',assignment_id:OWNER_REVIEW.assignmentId,
 filename:OWNER_REVIEW.filename,storage_path:OWNER_REVIEW.storagePath,sha256:OWNER_REVIEW.sha256,byte_length:OWNER_REVIEW.length,
 source_environment:'DANI_WINDOWS_WORKER',review_status:'REVIEW_ONLY',recipient_eligibility:'NOT_CLEARED',
 outbound_status:'NOT_SENT'});
 const result=await retrieveArtifact(db,OWNER_REVIEW.artifactKey);
 expect(result.status).toBe(503);expect(result.code).toBe('CONTENT_INTEGRITY_FAILURE');
});
test('missing-artifact retrieval only queries owner-review metadata, never Sales tables',async()=>{
 const db=fakeDb();
 const result=await retrieveArtifact(db,OWNER_REVIEW.artifactKey);
 expect(result.status).toBe(404);
 expect(db.state.tables).toEqual(['dd_owner_review_artifacts']);
 expect(db.state.writes).toBe(0);
});
