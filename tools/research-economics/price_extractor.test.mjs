import test from 'node:test'; import assert from 'node:assert/strict';
import { extractPriceCandidates as ex, unitFor } from './price_extractor.mjs';
test('hourly and visit prices', () => {
  const r = ex('Standard cleaning is $120 per visit. Handyman: $75/hr.');
  assert.deepEqual(r.map(x => [x.low_cents, x.unit]), [[12000, 'VISIT'], [7500, 'LABOR_HOUR']]);
});
test('ranges keep both ends; starting-at has no high', () => {
  const r = ex('Deep clean $150 - $250 per job. Starting at $99 per month.');
  assert.deepEqual(r.map(x => [x.low_cents, x.high_cents, x.unit, x.starting_at]), [[15000, 25000, 'JOB', false], [9900, null, 'MONTH', true]]);
});
test('thousands separators, decimals, plus sign', () => {
  const r = ex('Packages from $1,200.50 per month, or $35+ per bag.');
  assert.deepEqual(r.map(x => [x.low_cents, x.unit]), [[120050, 'MONTH'], [3500, 'BAG']]);
});
test('no unit means no candidate', () => { assert.deepEqual(ex('Call us today! Only $99. Phone 404-555-0100.'), []); });
test('implausible values rejected', () => { assert.deepEqual(ex('Save $0.50 per bag; price $250,000,000 per job'), []); });
test('inverted range rejected', () => { assert.deepEqual(ex('$300 - $100 per visit'), []); });
test('duplicates collapse', () => { assert.equal(ex('$80 per visit ... $80 per visit').length, 1); });
test('unknown unit words are skipped', () => { assert.equal(unitFor('furlong'), null); assert.deepEqual(ex('$40 per furlong'), []); });
test('snippet is bounded and single-line', () => { const r = ex('x'.repeat(500) + ' $50 per hour ' + 'y'.repeat(500)); assert.ok(r[0].snippet.length <= 200 && !/\n/.test(r[0].snippet)); });
test('max cap', () => { const t = Array.from({ length: 20 }, (_, i) => `$${10 + i} per visit`).join('. '); assert.equal(ex(t, { max: 3 }).length, 3); });
