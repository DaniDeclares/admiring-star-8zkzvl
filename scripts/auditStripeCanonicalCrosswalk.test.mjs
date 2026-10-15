import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { auditLive } from './auditStripeCanonicalCrosswalk.mjs';

const scriptPath = fileURLToPath(new URL('./auditStripeCanonicalCrosswalk.mjs', import.meta.url));

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
    const run = spawnSync(process.execPath, [scriptPath], {
      encoding: 'utf8',
      env: { ...process.env, STRIPE_SECRET_KEY: '', PAYMENT_LINKS_CSV: csv, CROSSWALK_OUTPUT: output },
    });
    assert.equal(run.status, 0, run.stderr);
    const report = JSON.parse(await readFile(output, 'utf8'));
    assert.equal(report.safety.mutationsPerformed, false);
    assert.deepEqual(report.rows.map((row) => row.disposition), [
      'UNMAPPED',
      'PROCUREMENT_PUBLIC_CHECKOUT_FORBIDDEN',
      'MATCHED_REVIEW',
    ]);
    assert.equal(report.rows[1].requiredNextStep, 'REVIEW_CHANNEL_POLICY_AND_INVOICE_PATH');
    assert.equal(report.rows[2].amountVerification, 'NOT_AVAILABLE_IN_CSV');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('live Stripe read path applies the same governed procurement boundary without writes', async () => {
  const calls = [];
  const stripe = {
    paymentLinks: {
      async list(params) {
        calls.push(['list', params]);
        return {
          data: [{ id: 'plink_live', url: 'https://example.invalid/live', active: true, livemode: true, currency: 'usd' }],
          has_more: false,
        };
      },
      async listLineItems(id, params) {
        calls.push(['listLineItems', id, params]);
        return {
          data: [
            { description: 'Marketing Agency Strategy', amount_total: 5500, currency: 'usd', quantity: 1, price: { id: 'price_1', product: 'prod_1' } },
            { description: 'Public Sector Purchase Order Support', amount_total: 6500, currency: 'usd', quantity: 1, price: { id: 'price_2', product: 'prod_2' } },
            { description: 'Administrative Support Session', amount_total: 4500, currency: 'usd', quantity: 1, price: { id: 'price_3', product: 'prod_3' } },
          ],
        };
      },
    },
  };

  const report = await auditLive({ stripe });
  assert.equal(report.mode, 'STRIPE_LIVE_API');
  assert.deepEqual(report.rows.map((row) => row.disposition), [
    'UNMAPPED',
    'PROCUREMENT_PUBLIC_CHECKOUT_FORBIDDEN',
    'MATCHED_REVIEW',
  ]);
  assert.equal(report.rows[1].requiredNextStep, 'REVIEW_CHANNEL_POLICY_AND_INVOICE_PATH');
  assert.equal(report.rows[2].requiredNextStep, 'COMPARE_AMOUNT_TO_CANONICAL_REGISTRY');
  assert.deepEqual(calls, [
    ['list', { limit: 100 }],
    ['listLineItems', 'plink_live', { limit: 100 }],
  ]);
});
