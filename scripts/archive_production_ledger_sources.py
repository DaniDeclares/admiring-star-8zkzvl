"""Writes exact Production-applied SQL (from supabase_migrations.schema_migrations statements) for ledger versions whose source is
missing or different in the repo, and a classification manifest for every ledger row.
Inputs are JSON files produced by read-only SQL against the Production ledger (see docs/governance/PRODUCTION_REPLAY_SCOPE_2026-10-11.md).
Usage: archive_production_ledger_sources.py <outDir> <classification.json> <statementsChunk.json>..."""
import sys, os, json, re, hashlib
out, cls_path, chunks = sys.argv[1], sys.argv[2], sys.argv[3:]
cls = json.load(open(cls_path))
def nws(sql):
    sql = re.sub(r'/\*.*?\*/', '', sql, flags=re.S); sql = re.sub(r'--[^\n]*', '', sql)
    return hashlib.md5(re.sub(r';+', '', re.sub(r'\s', '', sql)).encode()).hexdigest()
written = {}
for p in chunks:
    raw = json.load(open(p))['result']
    arr = json.loads(raw[raw.index('[{'):raw.rindex('}]') + 2])
    for row in json.loads(arr[0]['json_agg']) if isinstance(arr[0]['json_agg'], str) else arr[0]['json_agg']:
        v, n, stm = row['v'], row['n'], row['s']
        text = ';\n'.join(s.rstrip().rstrip(';') for s in stm) + ';\n'
        assert nws(text) == cls[v]['nws_md5'], f'hash mismatch for {v}_{n}'
        fn = f'{v}_{n}.sql'
        open(os.path.join(out, fn), 'w', encoding='utf8').write(text)
        written[v] = fn
need = [v for v, d in cls.items() if d['class'] in ('MISSING_IN_SOURCE', 'SAME_VERSION_CONTENT_DIFFERS', 'NAME_MATCH_CONTENT_DIFFERS')]
assert sorted(need) == sorted(written), (len(need), len(written))
manifest = {'generated': '2026-10-11', 'ledger_project': 'ajxezpczaemunlcmqlgl (Production)', 'compared_source': 'PR #591 head 3d13eb2 supabase/migrations',
            'hash': 'md5 of SQL with comments and whitespace and semicolons removed (comparison only, not a security hash)',
            'counts': {}, 'rows': []}
for v, d in sorted(cls.items()):
    manifest['counts'][d['class']] = manifest['counts'].get(d['class'], 0) + 1
    manifest['rows'].append({'version': v, 'name': d['name'], 'class': d['class'], 'sql_nws_md5': d['nws_md5'], 'source_versions_with_identical_sql': d['source_versions'], 'archived_file': written.get(v)})
json.dump(manifest, open(os.path.join(out, 'manifest.json'), 'w'), indent=0)
print(manifest['counts'], len(written), 'archived and hash-verified')
