import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const worker = readFileSync(new URL('../api-handlers/process-outbox.js', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/20261016201500_dd_event_outbox_delivery_reconciliation.sql', import.meta.url), 'utf8');

test('outbox migration retains existing rows and adds durable evidence', () => {
  for (const col of ['frozen_request','request_fingerprint','first_attempt_at','provider_email_id','claim_token','delivery_outcome']) {
    assert.match(migration, new RegExp('\\b'+col+'\\b'));
  }
  assert.doesNotMatch(migration, /truncate|drop table|delete from/i);
});
test('claim is atomic and in-flight records are not eligible for replay', () => {
  assert.match(worker, /for update skip locked/);
  assert.match(worker, /update public\.dd_event_outbox o/);
  assert.match(worker, /status in \('PENDING','FAILED'\)/);
  assert.match(worker, /claim_token=\$\{item\.claim_token\}/);
});
test('email evidence is saved before provider send', () => {
  const frozen = worker.indexOf('first_attempt_at=coalesce(first_attempt_at,now())');
  const send = worker.indexOf('const delivery = await deliver(');
  assert.ok(frozen > 0 && send > frozen);
  assert.match(worker, /RECONCILIATION_REQUIRED/);
  assert.match(worker, /FROZEN_REQUEST_MISMATCH/);
});
test('failed historical events cannot be silently reset', () => {
  assert.match(worker, /attempts=\$\{MAX_RETRIES\}/);
  assert.match(worker, /delivery_outcome=\$\{outcome\}/);
});

test('expired claims require ownership and uncertain outcomes do not dispatch', () => {
  assert.match(worker, /claimed_at < now\(\) - interval '10 minutes'/);
  assert.match(worker, /if \(item\.first_attempt_at\)/);
  assert.match(worker, /delivery_outcome='UNCERTAIN'/);
  assert.match(worker, /if \(rows\.length !== 1\)/);
  assert.match(worker, /first_attempt_at is null/);
});
