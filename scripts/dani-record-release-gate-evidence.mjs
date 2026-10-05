/**
 * Governed caller for public.dd_record_release_gate_evidence.
 * Fail-closed: missing secrets, missing RPC, non-PASS, or incomplete metadata aborts.
 * Does not invent proof results — caller must only invoke after a real PASS.
 */
const sku = process.env.DANI_RELEASE_GATE_SKU || 'DNI-01A-001';
const proofKind = process.env.DANI_PROOF_KIND || '';
const proofEnvironment = process.env.DANI_PROOF_ENVIRONMENT || '';
const proofResult = process.env.DANI_PROOF_RESULT || 'PASS';
const sourceSha = process.env.GITHUB_SHA || process.env.DANI_SOURCE_SHA || '';
const workflowRunId = String(process.env.GITHUB_RUN_ID || process.env.DANI_WORKFLOW_RUN_ID || '');
const receiptUri = process.env.DANI_RECEIPT_URI || '';
const rawUrl = process.env.TESTER_SUPABASE_URL || '';
const key = process.env.TESTER_SUPABASE_SERVICE_ROLE_KEY || '';

if (!rawUrl || !key) {
  throw new Error('Tester Supabase connection is required; fail closed.');
}
if (!['RUNTIME', 'PRODUCTION_SMOKE', 'REGRESSION'].includes(proofKind)) {
  throw new Error(`unsupported DANI_PROOF_KIND: ${proofKind}`);
}
if (!['TESTER', 'PRODUCTION'].includes(proofEnvironment)) {
  throw new Error(`unsupported DANI_PROOF_ENVIRONMENT: ${proofEnvironment}`);
}
if (proofKind === 'PRODUCTION_SMOKE' && proofEnvironment !== 'PRODUCTION') {
  throw new Error('PRODUCTION_SMOKE requires DANI_PROOF_ENVIRONMENT=PRODUCTION');
}
if (proofResult !== 'PASS') {
  throw new Error('only PASS may be recorded');
}
if (!sourceSha || sourceSha.length < 7) {
  throw new Error('GITHUB_SHA / source SHA required');
}
if (!workflowRunId) {
  throw new Error('GITHUB_RUN_ID required');
}
if (!receiptUri || !String(receiptUri).trim()) {
  throw new Error('DANI_RECEIPT_URI required');
}

const base = /^https?:\/\//.test(rawUrl) ? rawUrl.replace(/\/$/, '') : `https://${rawUrl}.supabase.co`;

// Idempotent per source SHA: scheduled re-runs on unchanged code add no duplicate receipt/note.
const existing = await fetch(
  `${base}/rest/v1/dd_service_release_evidence_receipts?canonical_sku=eq.${encodeURIComponent(sku)}&proof_kind=eq.${proofKind}&proof_environment=eq.${proofEnvironment}&source_sha=eq.${encodeURIComponent(sourceSha)}&proof_result=eq.PASS&select=id,workflow_run_id,verified_at&limit=1`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } },
);
if (!existing.ok) throw new Error(`receipt lookup failed: ${existing.status} ${await existing.text()}`);
const prior = await existing.json();
if (prior.length) {
  console.log(JSON.stringify({ status: 'ALREADY_RECORDED_FOR_SHA', canonical_sku: sku, proof_kind: proofKind, source_sha: sourceSha, prior: prior[0] }));
  process.exit(0);
}

const response = await fetch(`${base}/rest/v1/rpc/dd_record_release_gate_evidence`, {
  method: 'POST',
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  },
  body: JSON.stringify({
    p_canonical_sku: sku,
    p_proof_kind: proofKind,
    p_proof_environment: proofEnvironment,
    p_source_sha: sourceSha,
    p_workflow_run_id: workflowRunId,
    p_receipt_uri: receiptUri,
    p_proof_result: proofResult,
  }),
});

const text = await response.text();
if (!response.ok) {
  throw new Error(`dd_record_release_gate_evidence failed: ${response.status} ${text}`);
}

let payload;
try {
  payload = text ? JSON.parse(text) : null;
} catch {
  payload = text;
}

console.log(
  JSON.stringify({
    status: 'RECORDED',
    canonical_sku: sku,
    proof_kind: proofKind,
    proof_environment: proofEnvironment,
    source_sha: sourceSha,
    workflow_run_id: workflowRunId,
    receipt_uri: receiptUri,
    rpc: payload,
  }),
);
