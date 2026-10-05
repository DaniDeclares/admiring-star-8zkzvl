import fs from 'node:fs';

const sku = process.env.DANI_RELEASE_GATE_SKU || 'DNI-01A-001';
const out = process.env.DANI_RELEASE_GATE_REPORT || 'artifacts/release-gate-investigation.md';
const rawUrl = process.env.TESTER_SUPABASE_URL || '';
const key = process.env.TESTER_SUPABASE_SERVICE_ROLE_KEY || '';
if (!rawUrl || !key) throw new Error('Tester Supabase connection is required; fail closed.');
const base = /^https?:\/\//.test(rawUrl) ? rawUrl.replace(/\/$/, '') : `https://${rawUrl}.supabase.co`;
const headers = { apikey: key, Authorization: `Bearer ${key}` };

async function read(path) {
  const r = await fetch(`${base}/rest/v1/${path}`, { headers });
  if (!r.ok) throw new Error(`${path}: ${r.status} ${await r.text()}`);
  return r.json();
}

const [releaseRows, verificationRows, offerRows] = await Promise.all([
  read(`dd_service_release_contract_v1?canonical_sku=eq.${encodeURIComponent(sku)}&select=canonical_sku,release_state,blocking_gate,runtime_verified,production_smoke_verified,runtime_accuracy_ok,regression_verified,payment_ledger_ok,fulfillment_matrix_ok,quote_path_ok`),
  read(`dd_service_release_verifications?canonical_sku=eq.${encodeURIComponent(sku)}&select=canonical_sku,stripe_price_verified_at,payment_path_verified_at,runtime_verified_at,production_smoke_verified_at,regression_verified_at,verification_commit_sha,notes,updated_at`),
  read(`dd_governed_service_offers?canonical_sku=eq.${encodeURIComponent(sku)}&select=canonical_sku,commercial_offer_status,fulfillment_gate_status,runtime_service_id`),
]);
const release = releaseRows[0] || null;
const verification = verificationRows[0] || null;
const offers = offerRows || [];
const missing = [];
if (!verification?.runtime_verified_at) missing.push('runtime_verified_at');
if (!verification?.production_smoke_verified_at) missing.push('production_smoke_verified_at');
if (!verification?.regression_verified_at) missing.push('regression_verified_at');

const state = release?.release_state === 'LIVE_READY' ? 'GREEN' : 'HELD';
const lines = [
  `# CH01 Release Gate Investigation — ${sku}`,
  '',
  `- State: **${state}**`,
  `- Release: \`${release?.release_state ?? 'UNKNOWN'}\``,
  `- Blocking gate: \`${release?.blocking_gate ?? 'UNKNOWN'}\``,
  `- Missing verification evidence: ${missing.length ? missing.map(x => `\`${x}\``).join(', ') : 'none'}`,
  `- Source SHA: \`${process.env.GITHUB_SHA || 'unknown'}\``,
  `- Run ID: \`${process.env.GITHUB_RUN_ID || 'local'}\``,
  '',
  '## Governed state',
  '```json', JSON.stringify({ release, verification, offers }, null, 2), '```',
  '',
  '## Safety assertions',
  '- production_mutation=false',
  '- money_action=false',
  '- external_contact=false',
  '- provider_authorization=false',
  '- gate_weakening=false',
  '- synthetic_verification=false',
  '- auto_merge=false',
  '',
  'This investigator records evidence only. It never writes verification timestamps or clears a release gate.',
];
fs.mkdirSync(out.split('/').slice(0, -1).join('/') || '.', { recursive: true });
fs.writeFileSync(out, `${lines.join('\n')}\n`);
console.log(JSON.stringify({ sku, state, blocking_gate: release?.blocking_gate ?? null, missing_verification: missing, report: out }));
