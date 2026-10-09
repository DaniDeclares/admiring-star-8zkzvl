#!/usr/bin/env node
// Read-only: reject migration version collisions introduced by this change.
// Uses GitHub's before/base SHA; never connects to a database.
import { readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const base = process.env.MIGRATION_BASE_SHA;
if (!/^[0-9a-f]{40}$/.test(base ?? '')) {
  console.error('MISSING_VALID_BASE_SHA: cannot verify changed migrations');
  process.exit(2);
}
const files = readdirSync('supabase/migrations').filter(x => /^\d+_[a-z0-9_]+\.sql$/.test(x));
const versions = new Map();
for (const file of files) {
  const version = file.split('_')[0];
  const existing = versions.get(version) ?? [];
  existing.push(file);
  versions.set(version, existing);
}
const changed = execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMR', base, 'HEAD', '--', 'supabase/migrations'], { encoding: 'utf8' })
  .split('\n').filter(x => x.endsWith('.sql')).map(x => x.split('/').pop());
let collisions = 0;
for (const file of changed) {
  const version = file.split('_')[0];
  const duplicates = versions.get(version) ?? [];
  if (duplicates.length > 1) {
    console.error('LOCAL_VERSION_COLLISION ' + duplicates.join(' '));
    collisions++;
  }
}
console.log(JSON.stringify({ changedMigrations: changed.length, collisions, mode: 'READ_ONLY' }));
if (collisions) process.exitCode = 1;
