/**
 * SKU-specific release-contract proof for DNI-01A-001 Resident Refresh.
 *
 * RUNTIME: governed row shape, locked economics/scope authority, verification row present.
 * REGRESSION: fail-closed release contract still requires the three verification timestamps
 *             for LIVE_READY; does not treat generic suite green as release proof.
 *
 * On PASS of the selected mode, records evidence via dd_record_release_gate_evidence.
 * Never stamps PRODUCTION_SMOKE. Never weakens gates. Never mutates price/offer/status.
 */
import fs from 'node:fs';
import { DNI_01A_001, evaluateRuntime, evaluateRegression, WRITER_NEGATIVE_PROBES } from '../src/lib/operations/dni01a001ReleaseContractProof2026.js';

const sku = process.env.DANI_RELEASE_GATE_SKU || DNI_01A_001;
const mode = (process.env.DANI_PROOF_MODE || 'BOTH').toUpperCase();
const out = process.env.DANI_PROOF_REPORT || 'artifacts/dni-01a-001-release-contract-proof.md';
const rawUrl = process.env.TESTER_SUPABASE_URL || '';
const key = process.env.TESTER_SUPABASE_SERVICE_ROLE_KEY || '';
const sourceSha = process.env.GITHUB_SHA || process.env.DANI_SOURCE_SHA || '';
const workflowRunId = String(process.env.GITHUB_RUN_ID || process.env.DANI_WORKFLOW_RUN_ID || '');

if (sku !== DNI_01A_001) throw new Error(`This proof is bound to ${DNI_01A_001}; got ${sku}. Fail closed.`);
if (!['RUNTIME','REGRESSION','BOTH'].includes(mode)) throw new Error(`unsupported DANI_PROOF_MODE: ${mode}`);
if (!rawUrl || !key) throw new Error('Tester Supabase connection is required; fail closed.');
if (!sourceSha || sourceSha.length < 7) throw new Error('GITHUB_SHA / DANI_SOURCE_SHA required; fail closed.');
if (!workflowRunId) throw new Error('GITHUB_RUN_ID / DANI_WORKFLOW_RUN_ID required; fail closed.');
const base = /^https?:\/\//.test(rawUrl) ? rawUrl.replace(/\/$/, '') : `https://${rawUrl}.supabase.co`;
const headers = { apikey: key, Authorization: `Bearer ${key}` };

async function read(path) {
  const r = await fetch(`${base}/rest/v1/${path}`, { headers });
  if (!r.ok) throw new Error(`${path}: ${r.status} ${await r.text()}`);
  return r.json();
}

async function record(proofKind, receiptUri) {
  const r = await fetch(`${base}/rest/v1/rpc/dd_record_release_gate_evidence`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      p_canonical_sku: sku,
      p_proof_kind: proofKind,
      p_proof_environment: 'TESTER',
      p_source_sha: sourceSha,
      p_workflow_run_id: workflowRunId,
      p_receipt_uri: receiptUri,
      p_proof_result: 'PASS',
    }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`record ${proofKind} failed: ${r.status} ${text}`);
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

const failures = [];
const notes = [];

const [releaseRows, verificationRows, offerRows, serviceRows, receipts] = await Promise.all([
  read(`dd_service_release_contract_v1?canonical_sku=eq.${encodeURIComponent(sku)}&select=canonical_sku,release_state,blocking_gate,runtime_verified,production_smoke_verified,regression_verified,runtime_accuracy_ok`),
  read(`dd_service_release_verifications?canonical_sku=eq.${encodeURIComponent(sku)}&select=canonical_sku,stripe_price_verified_at,runtime_verified_at,production_smoke_verified_at,regression_verified_at,verification_commit_sha,updated_at`),
  read(`dd_governed_service_offers?canonical_sku=eq.${encodeURIComponent(sku)}&select=canonical_sku,commercial_offer_status,fulfillment_gate_status,runtime_service_id`),
  read(`services?sku=eq.${encodeURIComponent(sku)}&select=id,sku,name,pricing_type,billing_cycle,base_price_cents,starting_price,is_active,quote_input_schema,resident_discount_eligible`),
  read(`dd_service_release_evidence_receipts?canonical_sku=eq.${encodeURIComponent(sku)}&select=id,canonical_sku,proof_kind,proof_environment,source_sha,workflow_run_id,receipt_uri,proof_result,verified_at&order=verified_at.asc`),
]);
if (serviceRows.length !== 1) throw new Error(`expected exactly one services row for ${sku}, got ${serviceRows.length}; fail closed.`);
const service=serviceRows[0];
const rules=await read(`dd_service_pricing_rules?service_id=eq.${encodeURIComponent(service.id)}&select=id,service_id,channel_code,status,lock_status,pricing_type,billing_cycle,base_price_cents,currency,resident_discount_eligible`);
const release=releaseRows[0]||null, verification=verificationRows[0]||null, offers=offerRows||[];
const state={sku,release,verification,offers,service,rules,receipts};
const failures=[],notes=[];

if (mode === 'RUNTIME' || mode === 'BOTH') { const r=evaluateRuntime(state); failures.push(...r.failures); notes.push(...r.notes); }
if (mode === 'REGRESSION' || mode === 'BOTH') {
  const r=evaluateRegression(state); failures.push(...r.failures); notes.push(...r.notes);
}
const runtimePass=(mode==='RUNTIME'||mode==='BOTH')&&!failures.some(f=>f.startsWith('RUNTIME:'));
const regressionPass=(mode==='REGRESSION'||mode==='BOTH')&&!failures.some(f=>f.startsWith('REGRESSION:'));

if (failures.length) {
  const report = [
    `# DNI-01A-001 release contract proof — FAIL`,
    '',
    ...failures.map((f) => `- ${f}`),
    '',
    '```json',
    JSON.stringify({ release, verification, offers, service, notes }, null, 2),
    '```',
  ].join('\n');
  fs.mkdirSync(out.split('/').slice(0, -1).join('/') || '.', { recursive: true });
  fs.writeFileSync(out, `${report}\n`);
  console.error(JSON.stringify({ status: 'FAIL', failures, report: out }));
  process.exit(1);
}

const recorded = {};
const receiptBase = `github-run://${workflowRunId}/dni-01a-001-release-contract-proof`;

if (runtimePass && (mode === 'RUNTIME' || mode === 'BOTH')) {
  recorded.RUNTIME = await record('RUNTIME', `${receiptBase}#runtime`);
}
if (regressionPass && (mode === 'REGRESSION' || mode === 'BOTH')) {
  recorded.REGRESSION = await record('REGRESSION', `${receiptBase}#regression`);
}

const lines = [
  `# DNI-01A-001 release contract proof — PASS`,
  '',
  `- Mode: ${mode}`,
  `- Source SHA: \`${sourceSha}\``,
  `- Run ID: \`${workflowRunId}\``,
  `- RUNTIME recorded: ${Boolean(recorded.RUNTIME)}`,
  `- REGRESSION recorded: ${Boolean(recorded.REGRESSION)}`,
  ...notes.map((n) => `- ${n}`),
  '',
  '## Safety',
  '- production_mutation=false',
  '- money_action=false',
  '- external_contact=false',
  '- PRODUCTION_SMOKE not stamped by this script',
  '',
  '```json',
  JSON.stringify({ release, verification, offers, service, recorded }, null, 2),
  '```',
];
fs.mkdirSync(out.split('/').slice(0, -1).join('/') || '.', { recursive: true });
fs.writeFileSync(out, `${lines.join('\n')}\n`);
console.log(
  JSON.stringify({
    status: 'PASS',
    sku,
    mode,
    recorded_kinds: Object.keys(recorded),
    report: out,
  }),
);
