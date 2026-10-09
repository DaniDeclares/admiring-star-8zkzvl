#!/usr/bin/env node
// Read-only release preflight: detect already-installed migrations with a different version.
// Usage: node scripts/checkProductionMigrationLedger.mjs path/to/supabase-migration-list.json
// Input: JSON array of {version,name} OR Supabase CLI's {migrations:[...]} response.
// No network calls, database writes, credentials, or automatic repair.
import { readFileSync, readdirSync } from 'node:fs';
import { basename } from 'node:path';

const input = process.argv[2];
if (!input) {
  console.error('Usage: node scripts/checkProductionMigrationLedger.mjs <migration-ledger.json>');
  process.exit(2);
}
const parsed = JSON.parse(readFileSync(input, 'utf8'));
const applied = Array.isArray(parsed) ? parsed : (parsed.migrations ?? parsed.result?.migrations);
if (!Array.isArray(applied)) throw Error('Expected migrations array');
const dir = 'supabase/migrations';
const local = readdirSync(dir).filter(x => /^\d+_[a-z0-9_]+\.sql$/.test(x));
const byName = new Map();
const byVersion = new Map();
const seen = new Set();
for (const row of applied) {
  if (!/^\d+$/.test(String(row.version)) || !/^[a-z0-9_]+$/.test(String(row.name))) {
    throw Error('Invalid migration ledger entry');
  }
  const key = String(row.version) + ':' + row.name;
  if (seen.has(key)) throw Error('Duplicate migration ledger entry: ' + key);
  seen.add(key);
  const priorName = byVersion.get(String(row.version));
  if (priorName && priorName !== row.name) throw Error('Migration version assigned to multiple names: ' + row.version);
  byVersion.set(String(row.version), row.name);
  const versions = byName.get(row.name) ?? new Set();
  versions.add(String(row.version));
  byName.set(row.name, versions);
}
let conflicts = 0;
const localVersions = new Map();
for (const file of local) {
  const match = /^(\d+)_(.+)\.sql$/.exec(basename(file));
  const [, version, name] = match;
  const priorLocal = localVersions.get(version);
  if (priorLocal && priorLocal !== name) throw Error('Duplicate local migration version: ' + version);
  localVersions.set(version, name);
  const installedName = byVersion.get(version);
  if (installedName && installedName !== name) {
    conflicts++;
    console.error('VERSION_COLLISION ' + file + ' recorded as ' + installedName);
  }
  const installed = byName.get(name);
  if (installed && !installed.has(version)) {
    conflicts++;
    console.error('VERSION_DRIFT ' + file + ' already recorded as ' + [...installed].join(','));
  }
}
console.log(JSON.stringify({checkedLocal:local.length,ledgerEntries:applied.length,versionDrift:conflicts,mode:'READ_ONLY'}));
if (conflicts) process.exitCode = 1;
