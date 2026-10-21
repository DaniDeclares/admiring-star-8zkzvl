import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const load = async relative => {
  const source = await readFile(new URL(relative, root), 'utf8');
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
};
const { submitProviderCapabilityRequests: submit } = await load('src/pages/portal/providerServiceRequests.js');
const { capabilityRequestFailure } = await load('src/lib/operations/capabilityRequestFailure.js');
const source = await readFile(new URL('api-handlers/portal-operations.js', root), 'utf8');
const start = source.indexOf("    if (action === 'request_provider_capabilities')");
const end = source.indexOf('    // Self-service removal', start);
assert.ok(start >= 0 && end > start, 'Current capability request block must be located');
const block = source.slice(start, end);

const categories = [{ category_key: 'A', capability_key: 'clean' }, { category_key: 'B', capability_key: 'other' }];
const servicesForCategory = c => c.category_key === 'A' ? [{ id: 'a1' }, { id: 'a2' }] : [{ id: 'b1' }];
const success = () => ({ ok: true, json: async () => ({ success: true }) });
const options = fetchImpl => ({ categories, servicesForCategory, accessToken: 'synthetic', selectedServiceIdsByCategory: { A: ['a2'], B: ['b1'] }, fetchImpl });

for (const selection of [undefined, null, [], 'all']) {
  test(`absent/malformed selection (${String(selection)}) never requests an entire category`, async () => {
    let calls = 0;
    await assert.rejects(submit({ ...options(async () => { calls++; return success(); }), selectedServiceIdsByCategory: selection }), /Select individual services/);
    assert.equal(calls, 0);
  });
}
test('explicit subset remains an exact subset', async () => {
  const requests = [];
  await submit(options(async (_url, init) => { requests.push(JSON.parse(init.body)); return success(); }));
  assert.deepEqual(requests.map(r => r.serviceIds), [['a2'], ['b1']]);
});
test('unselected category is skipped rather than expanded', async () => {
  const requests = [];
  await submit({ ...options(async (_url, init) => { requests.push(JSON.parse(init.body)); return success(); }), selectedServiceIdsByCategory: { A: ['a1'] } });
  assert.deepEqual(requests.map(r => r.serviceIds), [['a1']]);
});
test('empty selection produces zero requests', async () => {
  let calls = 0;
  await assert.rejects(submit({ ...options(async () => { calls++; return success(); }), selectedServiceIdsByCategory: {} }), /No matching services/);
  assert.equal(calls, 0);
});
test('invalid later category fails preflight before any earlier request', async () => {
  let calls = 0;
  await assert.rejects(submit({ ...options(async () => { calls++; return success(); }), selectedServiceIdsByCategory: { A: ['a1'], B: ['a2'] } }), /Invalid selected service/);
  assert.equal(calls, 0);
});
test('malformed category service list fails before external writes', async () => {
  let calls = 0;
  await assert.rejects(submit({ ...options(async () => { calls++; return success(); }), selectedServiceIdsByCategory: { A: 'a1' } }), /Invalid selected service list/);
  assert.equal(calls, 0);
});
test('duplicate explicitly selected IDs are deduplicated', async () => {
  let body;
  await submit({ ...options(async (_url, init) => { body = JSON.parse(init.body); return success(); }), selectedServiceIdsByCategory: { A: ['a1', 'a1'] } });
  assert.deepEqual(body.serviceIds, ['a1']);
});
test('category request limit is checked before network calls', async () => {
  let calls = 0;
  const ids = Array.from({ length: 101 }, (_, i) => String(i));
  await assert.rejects(submit({ ...options(async () => { calls++; return success(); }), categories: [categories[0]], servicesForCategory: () => ids.map(id => ({ id })), selectedServiceIdsByCategory: { A: ids } }), /no more than 100/);
  assert.equal(calls, 0);
});
test('missing capability key prevents external requests', async () => {
  let calls = 0;
  await assert.rejects(submit({ ...options(async () => { calls++; return success(); }), categories: [{ category_key: 'A' }], selectedServiceIdsByCategory: { A: ['a1'] } }), /category is unavailable/);
  assert.equal(calls, 0);
});
test('missing session fails without sending selected services', async () => {
  let calls = 0;
  await assert.rejects(submit({ ...options(async () => { calls++; return success(); }), accessToken: '' }), /session is unavailable/);
  assert.equal(calls, 0);
});
test('later server failure reports partial progress and never auto-retries', async () => {
  let calls = 0;
  await assert.rejects(submit(options(async () => ++calls === 1 ? success() : ({ ok: false, json: async () => ({ success: false, error: 'synthetic unavailable' }) }))), e => e.submittedCount === 1 && e.message === 'synthetic unavailable');
  assert.equal(calls, 2);
});
test('invalid JSON success response is not treated as saved', async () => {
  let calls = 0;
  await assert.rejects(submit(options(async () => { calls++; return { ok: true, json: async () => { throw Error('invalid JSON'); } }; })), e => e.submittedCount === 0);
  assert.equal(calls, 1);
});

async function requestFailure(error) {
  const db = { from(table) { return {
    select() { return this; }, eq() { return this; }, or() { return this; }, in() { return this; },
    single: async () => ({ data: { id: 'p1', org_id: 'o1' } }),
    insert() { return { select: async () => ({ error }) }; },
    then(resolve, reject) { return Promise.resolve({ data: table === 'dd_provider_capability_categories' ? [{ canonical_skus: ['SKU1'] }] : table === 'services' ? [{ id: 's1', sku: 'SKU1' }] : [] }).then(resolve, reject); },
  }; } };
  const fn = vm.runInNewContext(`(async function(){const action='request_provider_capabilities';const payload={serviceIds:['s1'],capabilityKey:'clean'};${block}})`, {
    context: { isStaff: false, identity: { entity_id: 'p1' }, user: { id: 'u1' }, supabase: db },
    requireRole: () => null, res: {}, fail: (_r, error, status) => ({ error, status }), ok: (_r, data) => data,
    capabilityRequestFailure,
  });
  return fn();
}
for (const [code, status] of [['23505', 409], ['42501', 403], ['42P01', 500], ['42703', 500], ['23503', 500], ['23514', 500], ['08006', 503], ['40001', 503], ['40P01', 503], ['57P01', 503], ['UNKNOWN', 500]]) {
  test(`actual request block maps ${code} to ${status}, omitting private error details`, async () => {
    const result = await requestFailure({ code, message: 'private-sensitive-value', details: 'private-sensitive-value' });
    assert.equal(result.status, status);
    assert.doesNotMatch(result.error, /private-sensitive-value/);
  });
}
test('unknown error code is not reported as an idempotency conflict', async () => {
  assert.equal((await requestFailure({ message: 'unknown commit outcome' })).status, 500);
});
