import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const script = resolve('scripts/checkProductionMigrationLedger.mjs');
function run(ledger) {
  const root = mkdtempSync(join(tmpdir(), 'dani-migration-preflight-'));
  try {
    mkdirSync(join(root, 'supabase/migrations'), { recursive: true });
    writeFileSync(join(root, 'supabase/migrations/20261007223000_guard_sales_touch_evidence.sql'), '-- fixture');
    writeFileSync(join(root, 'supabase/migrations/20261008180000_extend_buyer_evidence_exact_inbound_source.sql'), '-- fixture');
    const input = join(root, 'ledger.json');
    writeFileSync(input, JSON.stringify(ledger));
    return spawnSync(process.execPath, [script, input], { cwd: root, encoding: 'utf8' });
  } finally { rmSync(root, { recursive: true, force: true }); }
}

test('matching migration versions pass without writes', () => {
  const result = run({ migrations: [
    { version: '20261007223000', name: 'guard_sales_touch_evidence' },
    { version: '20261008180000', name: 'extend_buyer_evidence_exact_inbound_source' }
  ] });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /"versionDrift":0/);
});
test('Production version aliases fail closed', () => {
  const result = run({ migrations: [
    { version: '20261009003359', name: 'guard_sales_touch_evidence' },
    { version: '20261009003404', name: 'extend_buyer_evidence_exact_inbound_source' }
  ] });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /VERSION_DRIFT/);
  assert.match(result.stdout, /"versionDrift":2/);
});
test('malformed ledger fails closed', () => {
  const result = run({ migrations: [{ version: 'not-a-version', name: 'guard_sales_touch_evidence' }] });
  assert.notEqual(result.status, 0);
});
