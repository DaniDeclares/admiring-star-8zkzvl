import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('offline Stripe crosswalk distinguishes commercial agency from procurement', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'dani-crosswalk-'));
  try {
    const csv = path.join(dir, 'links.csv');
    const output = path.join(dir, 'report.json');
    await writeFile(csv, [
      'id,Name,Active,Currency,Url',
      'plink_1,Marketing Agency Strategy,True,usd,https://example.invalid/1',
      'plink_2,Government Procurement Support,True,usd,https://example.invalid/2',
      'plink_3,Administrative Support Session,True,usd,https://example.invalid/3',
    ].join('\n'));
    const run = spawnSync(process.execPath, ['scripts/auditStripeCanonicalCrosswalk.mjs'], {
      encoding: 'utf8',
      env: { ...process.env, STRIPE_SECRET_KEY: '', PAYMENT_LINKS_CSV: csv, CROSSWALK_OUTPUT: output },
    });
    assert.equal(run.status, 0, run.stderr);
    const report = JSON.parse(await readFile(output, 'utf8'));
    assert.equal(report.safety.mutationsPerformed, false);
    assert.deepEqual(report.rows.map(row => row.disposition), [
      'UNMAPPED', 'PROCUREMENT_PUBLIC_CHECKOUT_FORBIDDEN', 'MATCHED_REVIEW',
    ]);
    assert.equal(report.rows[1].requiredNextStep, 'REVIEW_CHANNEL_POLICY_AND_INVOICE_PATH');
    assert.equal(report.rows[2].amountVerification, 'NOT_AVAILABLE_IN_CSV');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
