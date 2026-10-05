/**
 * SKU-specific release-contract proof for DNI-01A-001 Resident Refresh.
 * RUNTIME and REGRESSION are independent semantic proofs. Generic workflow green is not evidence.
 * Negative writer probes must be rejected. PASS recording is idempotent per proof kind + source SHA.
 */
import fs from 'node:fs';
import {
  DNI_01A_001,
  evaluateRuntime,
  evaluateRegression,
  WRITER_NEGATIVE_PROBES,
  classifyWriterProbeResponse,
} from '../src/lib/operations/dni01a001ReleaseContractProof2026.js';

const sku = process.env.DANI_RELEASE_GATE_SKU || DNI_01A_001;
const mode = (process.env.DANI_PROOF_MODE || 'BOTH').toUpperCase();
const out = process.env.DANI_PROOF_REPORT || 'artifacts/dni-01a-001-release-contract-proof.md';
const rawUrl = process.env.TESTER_SUPABASE_URL || '';
const key = process.env.TESTER_SUPABASE_SERVICE_ROLE_KEY || '';
const sourceSha = process.env.GITHUB_SHA || process.env.DANI_SOURCE_SHA || '';
const workflowRunId = String(process.env.GITHUB_RUN_ID || process.env.DANI_WORKFLOW_RUN_ID || '');

if (sku !== DNI_01A_001) throw new Error(`This proof is bound to ${DNI_01A_001}; got ${sku}. Fail closed.`);
if (!['RUNTIME', 'REGRESSION', 'BOTH'].includes(mode)) throw new Error(`unsupported DANI_PROOF_MODE: ${mode}`);
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

async function rpc(args) {
  return fetch(`${base}/rest/v1/rpc/dd_record_release_gate_evidence`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(args),
  });
}

async function assertWriterRejectsBadEvidence() {
  for (const probe of WRITER_NEGATIVE_PROBES) {
    const r = await rpc({
      p_canonical_sku: sku,
      p_proof_kind: probe.args.p_proof_kind,
      p_proof_environment: probe.args.p_proof_environment,
      p_source_sha: sourceSha,
      p_workflow_run_id: `${workflowRunId}-negative-probe`,
      p_receipt_uri: `github-run://${workflowRunId}/dni-01a-001-release-contract-proof#negative-${encodeURIComponent(probe.label)}`,
      p_proof_result: probe.args.p_proof_result,
    });
    const verdict = classifyWriterProbeResponse(probe, r.status, await r.text());
    if (!verdict.rejected) {
      throw new Error(`REGRESSION: governed writer ACCEPTED invalid evidence: ${probe.label}`);
    }
    if (!verdict.governed) {
      throw new Error(`REGRESSION: writer negative probe not rejected by the governed guard (${probe.label}): ${verdict.reason}`);
    }
  }
}

async function recordOnce(proofKind, receiptUri) {
  const prior = await read(
    `dd_service_release_evidence_receipts?canonical_sku=eq.${encodeURIComponent(sku)}` +
    `&proof_kind=eq.${encodeURIComponent(proofKind)}` +
    `&proof_environment=eq.TESTER&source_sha=eq.${encodeURIComponent(sourceSha)}` +
    '&proof_result=eq.PASS&select=id,workflow_run_id,verified_at&limit=1',
  );
  if (prior.length) return { status: 'ALREADY_RECORDED_FOR_SHA', prior: prior[0] };

  const r = await rpc({
    p_canonical_sku: sku,
    p_proof_kind: proofKind,
    p_proof_environment: 'TESTER',
    p_source_sha: sourceSha,
    p_workflow_run_id: workflowRunId,
    p_receipt_uri: receiptUri,
    p_proof_result: 'PASS',
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`record ${proofKind} failed: ${r.status} ${text}`);
  try { return text ? JSON.parse(text) : null; } catch { return text; }
}

const [releaseRows, verificationRows, offerRows, serviceRows, receipts] = await Promise.all([
  read(`dd_service_release_contract_v1?canonical_sku=eq.${encodeURIComponent(sku)}&select=canonical_sku,release_state,blocking_gate,runtime_verified,production_smoke_verified,regression_verified,runtime_accuracy_ok`),
  read(`dd_service_release_verifications?canonical_sku=eq.${encodeURIComponent(sku)}&select=canonical_sku,stripe_price_verified_at,runtime_verified_at,production_smoke_verified_at,regression_verified_at,verification_commit_sha,updated_at`),
  read(`dd_governed_service_offers?canonical_sku=eq.${encodeURIComponent(sku)}&select=canonical_sku,commercial_offer_status,fulfillment_gate_status,runtime_service_id`),
  read(`services?sku=eq.${encodeURIComponent(sku)}&select=id,sku,name,pricing_type,billing_cycle,base_price_cents,starting_price,is_active,quote_input_schema,resident_discount_eligible`),
  read(`dd_service_release_evidence_receipts?canonical_sku=eq.${encodeURIComponent(sku)}&select=id,canonical_sku,proof_kind,proof_environment,source_sha,workflow_run_id,receipt_uri,proof_result,verified_at&order=verified_at.asc`),
]);
if (serviceRows.length !== 1) throw new Error(`expected exactly one services row for ${sku}, got ${serviceRows.length}; fail closed.`);

const service = serviceRows[0];
const rules = await read(`dd_service_pricing_rules?service_id=eq.${encodeURIComponent(service.id)}&select=id,service_id,channel_code,status,lock_status,pricing_type,billing_cycle,base_price_cents,currency,resident_discount_eligible`);
const release = releaseRows[0] || null;
const verification = verificationRows[0] || null;
const offers = offerRows || [];
const state = { sku, release, verification, offers, service, rules, receipts };
const failures = [];
const notes = [];

if (mode === 'RUNTIME' || mode === 'BOTH') {
  const r = evaluateRuntime(state);
  failures.push(...r.failures);
  notes.push(...r.notes);
}
if (mode === 'REGRESSION' || mode === 'BOTH') {
  const r = evaluateRegression(state);
  failures.push(...r.failures);
  notes.push(...r.notes);
  try {
    await assertWriterRejectsBadEvidence();
    notes.push('REGRESSION: governed writer rejected all invalid evidence probes');
  } catch (e) {
    failures.push(e.message.startsWith('REGRESSION:') ? e.message : `REGRESSION: ${e.message}`);
  }
}

const runtimePass = (mode === 'RUNTIME' || mode === 'BOTH') && !failures.some((f) => f.startsWith('RUNTIME:'));
const regressionPass = (mode === 'REGRESSION' || mode === 'BOTH') && !failures.some((f) => f.startsWith('REGRESSION:'));

if (failures.length) {
  const report = [
    '# DNI-01A-001 release contract proof — FAIL', '', ...failures.map((f) => `- ${f}`), '',
    '```json', JSON.stringify({ release, verification, offers, service, notes }, null, 2), '```',
  ].join('\n');
  fs.mkdirSync(out.split('/').slice(0, -1).join('/') || '.', { recursive: true });
  fs.writeFileSync(out, `${report}\n`);
  console.error(JSON.stringify({ status: 'FAIL', failures, report: out }));
  process.exit(1);
}

const recorded = {};
const receiptBase = `github-run://${workflowRunId}/dni-01a-001-release-contract-proof`;
if (runtimePass) recorded.RUNTIME = await recordOnce('RUNTIME', `${receiptBase}#runtime`);
if (regressionPass) recorded.REGRESSION = await recordOnce('REGRESSION', `${receiptBase}#regression`);

const lines = [
  '# DNI-01A-001 release contract proof — PASS', '',
  `- Mode: ${mode}`, `- Source SHA: \`${sourceSha}\``, `- Run ID: \`${workflowRunId}\``,
  `- RUNTIME recorded: ${Boolean(recorded.RUNTIME)}`, `- REGRESSION recorded: ${Boolean(recorded.REGRESSION)}`,
  ...notes.map((n) => `- ${n}`), '', '## Safety',
  '- production_mutation=false', '- money_action=false', '- external_contact=false',
  '- PRODUCTION_SMOKE not stamped by this script', '', '```json',
  JSON.stringify({ release, verification, offers, service, recorded }, null, 2), '```',
];
fs.mkdirSync(out.split('/').slice(0, -1).join('/') || '.', { recursive: true });
fs.writeFileSync(out, `${lines.join('\n')}\n`);
console.log(JSON.stringify({ status: 'PASS', sku, mode, recorded_kinds: Object.keys(recorded), report: out }));
