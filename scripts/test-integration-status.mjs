import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';

const sourceUrl = new URL('../api/integrations/status.js', import.meta.url);
const source = await readFile(sourceUrl, 'utf8');

async function run({ denied = false, databaseError = null } = {}) {
  const calls = [];
  const query = {
    select(columns) { calls.push(['select', columns]); return this; },
    eq(...args) { calls.push(['eq', ...args]); return this; },
    in() { return this; },
    async order() { return { data: [], error: databaseError }; },
  };
  const context = vm.createContext({ process: { env: {} } });
  const module = new vm.SourceTextModule(source, { context });
  await module.link(async specifier => {
    // Check the real dependency path before substituting authentication.
    await access(new URL(specifier, sourceUrl));
    const dependency = new vm.SyntheticModule(['ENVIRONMENT', 'requireStaff'], function () {
      this.setExport('ENVIRONMENT', 'PRODUCTION');
      this.setExport('requireStaff', async () => {
        if (denied) throw Object.assign(new Error('Authentication required'), { status: 401 });
        return { supabase: { from(table) { calls.push(['from', table]); return query; } } };
      });
    }, { context });
    return dependency;
  });
  await module.evaluate();
  const response = {
    headers: {},
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
  };
  await module.namespace.default({ method: 'GET' }, response);
  return { response, calls };
}

test('status module resolves and restricts results to its environment', async () => {
  const { response, calls } = await run();
  assert.equal(response.code, 200);
  assert.equal(response.headers['Cache-Control'], 'no-store');
  assert.ok(calls.some(call => call.join(':') === 'eq:environment:PRODUCTION'));
  assert.ok(!calls.find(call => call[0] === 'select')[1].includes('ciphertext'));
});

test('unauthorized requests cannot query connection records', async () => {
  const { response, calls } = await run({ denied: true });
  assert.equal(response.code, 401);
  assert.equal(calls.length, 0);
});

test('database failure does not report successful empty connections', async () => {
  const { response } = await run({ databaseError: new Error('Database unavailable') });
  assert.equal(response.code, 500);
  assert.equal(response.body.success, false);
});

