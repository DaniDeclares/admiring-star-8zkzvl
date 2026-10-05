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

const sku = process.env.DANI_RELEASE_GATE_SKU || 'DNI-01A-001';
const mode = (process.env.DANI_PROOF_MODE || 'BOTH').toUpperCase();
const out = process.env.DANI_PROOF_REPORT || 'artifacts/dni-01a-001-release-contract-proof.md';
const rawUrl = process.env.TESTER_SUPABASE_URL || '';
const key = process.env.TESTER_SUPABASE_SERVICE_ROLE_KEY || '';
const sourceSha = process.env.GITHUB_SHA || process.env.DANI_SOURCE_SHA || 'local-dev';
const workflowRunId = String(process.env.GITHUB_RUN_ID || process.env.DANI_WORKFLOW_RUN_ID || 'local');

if (!rawUrl || !key) throw new Error('Tester Supabase connection is required; fail closed.');
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

const [releaseRows, verificationRows, offerRows, serviceRows] = await Promise.all([
  read(
    `dd_service_release_contract_v1?canonical_sku=eq.${encodeURIComponent(sku)}&select=canonical_sku,release_state,blocking_gate,runtime_verified,production_smoke_verified,runtime_accuracy_ok,regression_verified,payment_ledger_ok,fulfillment_matrix_ok,quote_path_ok`,
  ),
  read(
    `dd_service_release_verifications?canonical_sku=eq.${encodeURIComponent(sku)}&select=canonical_sku,stripe_price_verified_at,payment_path_verified_at,runtime_verified_at,production_smoke_verified_at,regression_verified_at,verification_commit_sha,notes,updated_at`,
  ),
  read(
    `dd_governed_service_offers?canonical_sku=eq.${encodeURIComponent(sku)}&select=canonical_sku,commercial_offer_status,fulfillment_gate_status,runtime_service_id`,
  ),
  read(
    `services?sku=eq.${encodeURIComponent(sku)}&select=sku,base_price_cents,starting_price,is_active,price_note,description&limit=1`,
  ),
]);

const release = releaseRows[0] || null;
const verification = verificationRows[0] || null;
const offers = offerRows || [];
const service = serviceRows[0] || null;

// --- RUNTIME contract for Resident Refresh ---
if (mode === 'RUNTIME' || mode === 'BOTH') {
  if (!verification) failures.push('RUNTIME: verification row missing');
  if (!service) failures.push('RUNTIME: services row missing');
  if (service && Number(service.base_price_cents) !== 14000) {
    failures.push(`RUNTIME: base_price_cents expected 14000, got ${service.base_price_cents}`);
  }
  if (service && Number(service.starting_price) !== 140) {
    failures.push(`RUNTIME: starting_price expected 140, got ${service.starting_price}`);
  }
  if (service && service.is_active !== true) failures.push('RUNTIME: service is not active');
  if (!verification?.stripe_price_verified_at) {
    failures.push('RUNTIME: stripe_price_verified_at required before runtime clearance path');
  }
  if (!offers.length) failures.push('RUNTIME: governed offer row missing');
  if (!release) failures.push('RUNTIME: release contract row missing');
  // Fail-closed while incomplete is correct runtime behavior for this SKU.
  if (release && release.release_state === 'LIVE_READY') {
    const missingTs = [
      verification?.runtime_verified_at,
      verification?.production_smoke_verified_at,
      verification?.regression_verified_at,
    ].filter((x) => !x);
    if (missingTs.length) {
      failures.push('RUNTIME: LIVE_READY with missing verification timestamps (contract broken)');
    }
  } else if (release) {
    notes.push(`RUNTIME: release_state=${release.release_state} blocking_gate=${release.blocking_gate} (fail-closed OK)`);
  }
}

// --- REGRESSION: release contract still requires the three timestamps ---
if (mode === 'REGRESSION' || mode === 'BOTH') {
  if (!release) {
    failures.push('REGRESSION: release contract row missing');
  } else {
    // When any verification timestamp is null, LIVE_READY must not be claimed.
    const anyMissing =
      !verification?.runtime_verified_at ||
      !verification?.production_smoke_verified_at ||
      !verification?.regression_verified_at;
    if (anyMissing && release.release_state === 'LIVE_READY') {
      failures.push('REGRESSION: LIVE_READY while verification timestamps incomplete');
    }
    if (anyMissing && release.release_state !== 'HOLD' && release.release_state !== 'LIVE_READY') {
      notes.push(`REGRESSION: non-HOLD intermediate state ${release.release_state}`);
    }
    if (anyMissing && release.release_state === 'HOLD') {
      notes.push('REGRESSION: HOLD while timestamps incomplete (expected fail-closed)');
    }
  }
  if (service && Number(service.base_price_cents) !== 14000) {
    failures.push('REGRESSION: locked $140 price authority drifted');
  }
}

const runtimePass = (mode === 'RUNTIME' || mode === 'BOTH') && failures.every((f) => !f.startsWith('RUNTIME:'));
const regressionPass =
  (mode === 'REGRESSION' || mode === 'BOTH') && failures.every((f) => !f.startsWith('REGRESSION:'));

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
