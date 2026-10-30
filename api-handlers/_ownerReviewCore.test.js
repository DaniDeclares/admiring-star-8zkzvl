import { OWNER_REVIEW, isGovernedOwner, decodeBase64, validateImport, sha256, sameRecord, exactBytes } from './_ownerReviewCore.js';
const validMetadata = { assignmentId:OWNER_REVIEW.assignmentId, artifactKey:OWNER_REVIEW.artifactKey, filename:OWNER_REVIEW.filename,
 sourceEnvironment:'DANI_WINDOWS_WORKER', reviewStatus:'REVIEW_ONLY', recipientEligibility:'NOT_CLEARED',
 outboundStatus:'NOT_SENT', sha256:OWNER_REVIEW.sha256 };
test('governed owner is distinct from ordinary staff',()=>{
 expect(isGovernedOwner({user:{id:'owner-id'},role:'owner',governedRole:'OWNER_OPERATOR'})).toBe(true);
 for(const role of ['admin','staff','staff_admin','provider','customer','owner']) {
  expect(isGovernedOwner({user:{id:'another-id'},role,governedRole:undefined})).toBe(false);
 }
 expect(isGovernedOwner(null)).toBe(false);
});
test('Base64 encoding preserves binary bytes',()=>{
 const original=Buffer.from([0,1,2,128,255,10,13]);
 const decoded=decodeBase64(original.toString('base64'));
 expect(decoded.equals(original)).toBe(true);
 expect(sha256(decoded)).toBe(sha256(original));
});
test('invalid Base64 fails closed',()=>{
 expect(()=>decodeBase64('not-base64!')).toThrow();
 expect(()=>decodeBase64('')).toThrow();
 expect(()=>decodeBase64('A')).toThrow();
});
test('altered OWNER_REVIEW contents fail even with matching caller hash',()=>{
 const altered=Buffer.alloc(OWNER_REVIEW.length,65),alteredHash=sha256(altered);
 expect(alteredHash).not.toBe(OWNER_REVIEW.sha256);
 const request={...validMetadata,contentBase64:altered.toString('base64'),sha256:alteredHash};
 expect(()=>validateImport(request)).toThrow('INVALID_IMPORT_METADATA');
 expect(()=>validateImport({...request,sha256:OWNER_REVIEW.sha256})).toThrow('HASH_MISMATCH');
});
test('wrong byte length is rejected',()=>{
 expect(()=>validateImport({...validMetadata,contentBase64:Buffer.from('short').toString('base64')})).toThrow('BYTE_LENGTH_MISMATCH');
});
test('recipient clearance cannot be changed by caller',()=>{
 expect(()=>validateImport({...validMetadata,contentBase64:Buffer.alloc(OWNER_REVIEW.length).toString('base64'),recipientEligibility:'CLEARED'})).toThrow('INVALID_IMPORT_METADATA');
});
test('exact-record checks reject mismatched identity',()=>{
 const expected={artifact_key:OWNER_REVIEW.artifactKey,assignment_system:'ASANA',assignment_id:OWNER_REVIEW.assignmentId,filename:OWNER_REVIEW.filename,
 storage_path:OWNER_REVIEW.storagePath,sha256:OWNER_REVIEW.sha256,byte_length:OWNER_REVIEW.length,source_environment:'DANI_WINDOWS_WORKER',
 review_status:'REVIEW_ONLY',recipient_eligibility:'NOT_CLEARED',outbound_status:'NOT_SENT'};
 expect(sameRecord(expected,expected)).toBe(true);
 expect(sameRecord({...expected,outbound_status:'SENT'},expected)).toBe(false);
 expect(exactBytes(Buffer.alloc(OWNER_REVIEW.length,65),expected)).toBe(false);
});
