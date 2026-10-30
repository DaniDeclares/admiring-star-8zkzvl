import { createHash } from 'node:crypto';

export const BUCKET = 'dd-owner-review-artifacts';
export const TABLE = 'dd_owner_review_artifacts';

export const OWNER_REVIEW = Object.freeze({
  assignmentId: '1219397649342143',
  artifactKey: 'ASANA:1219397649342143:CH02-owner-review-20261028',
  filename: 'CH02-owner-review-20261028.md',
  storagePath: '1219397649342143/CH02-owner-review-20261028.md',
  length: 2899,
  sha256: '5c818ed49d8314402146a4b7f23691803a72bffe85947c9bb58ae9013dc9873b'
});

export const MAX_BODY_BYTES = 8192;

export function isGovernedOwner(auth) {
  return Boolean(auth?.user?.id && auth.role === 'owner' && auth.governedRole === 'OWNER_OPERATOR');
}
export function sha256(bytes) { return createHash('sha256').update(bytes).digest('hex'); }
export function decodeBase64(value) {
  if (typeof value !== 'string' || !value.length || value.length > 4096 ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) throw new Error('INVALID_BASE64');
  const bytes = Buffer.from(value, 'base64');
  if (bytes.toString('base64') !== value) throw new Error('INVALID_BASE64');
  return bytes;
}
export function validateImport(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('INVALID_REQUEST');
  if (body.assignmentId !== OWNER_REVIEW.assignmentId || body.artifactKey !== OWNER_REVIEW.artifactKey ||
      body.filename !== OWNER_REVIEW.filename || body.sourceEnvironment !== 'DANI_WINDOWS_WORKER' ||
      body.reviewStatus !== 'REVIEW_ONLY' || body.recipientEligibility !== 'NOT_CLEARED' ||
      body.outboundStatus !== 'NOT_SENT' || body.sha256 !== OWNER_REVIEW.sha256) throw new Error('INVALID_IMPORT_METADATA');
  const bytes = decodeBase64(body.contentBase64);
  if (bytes.length !== OWNER_REVIEW.length) throw new Error('BYTE_LENGTH_MISMATCH');
  if (sha256(bytes) !== OWNER_REVIEW.sha256) throw new Error('HASH_MISMATCH');
  return {bytes, metadata:{
    artifact_key: OWNER_REVIEW.artifactKey, assignment_system:'ASANA', assignment_id:OWNER_REVIEW.assignmentId,
    filename:OWNER_REVIEW.filename, storage_path:OWNER_REVIEW.storagePath, sha256:OWNER_REVIEW.sha256, byte_length:OWNER_REVIEW.length,
    source_environment:'DANI_WINDOWS_WORKER',review_status:'REVIEW_ONLY',
    recipient_eligibility:'NOT_CLEARED',outbound_status:'NOT_SENT'
  }};
}
export function sameRecord(record, expected) {
  return Boolean(record) && ['artifact_key','assignment_system','assignment_id','filename',
    'storage_path','sha256','byte_length','source_environment','review_status',
    'recipient_eligibility','outbound_status'].every(field => record[field] === expected[field]);
}
export function exactBytes(bytes,record) {
  return Boolean(bytes) && bytes.length === OWNER_REVIEW.length && bytes.length === record.byte_length &&
    sha256(bytes) === OWNER_REVIEW.sha256 && sha256(bytes) === record.sha256;
}
export function validateKey(key) { return typeof key === 'string' && key === OWNER_REVIEW.artifactKey; }
