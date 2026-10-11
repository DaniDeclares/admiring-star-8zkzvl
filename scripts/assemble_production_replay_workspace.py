#!/usr/bin/env python3
"""Assemble the Production-lineage migration set for a clean replay.
For every row in supabase/production-ledger/manifest.json, in ledger order, choose the SQL that Production actually applied:
  * archived exact ledger SQL (supabase/production-ledger/<file>) when the repo source is missing or differs, else
  * the repo source file with identical SQL (renamed to the ledger version when its filename drifted).
Allowlisted prerequisite files keep their own source version. Tester-only/source-only migrations are NOT included.
Fails closed: any ledger row without a verified SQL source is an error, never silently skipped.
Usage: assemble_production_replay_workspace.py <repoRoot> <outMigrationsDir> [--report report.json]"""
import sys, os, json, re, hashlib, shutil
root, out = sys.argv[1], sys.argv[2]
report_path = sys.argv[sys.argv.index('--report') + 1] if '--report' in sys.argv else None
led = os.path.join(root, 'supabase/production-ledger'); mig = os.path.join(root, 'supabase/migrations')
manifest = json.load(open(os.path.join(led, 'manifest.json')))
def nws(sql):
    sql = re.sub(r'/\*.*?\*/', '', sql, flags=re.S); sql = re.sub(r'--[^\n]*', '', sql)
    return hashlib.md5(re.sub(r';+', '', re.sub(r'\s', '', sql)).encode()).hexdigest()
src = {}
for f in os.listdir(mig):
    if f.endswith('.sql'):
        v = f.split('_', 1)[0]; src.setdefault(v, []).append(f)
os.makedirs(out, exist_ok=True)
for f in os.listdir(out):
    if f.endswith('.sql'): os.remove(os.path.join(out, f))
errors, used = [], {'archived': 0, 'source_same_version': 0, 'source_renamed': 0, 'prerequisites': 0}
chosen_src = set()
for r in manifest['rows']:
    v, n, want = r['version'], r['name'], r['sql_nws_md5']
    dest = f'{v}_{n}.sql'
    if r['class'] == 'LEDGER_ROW_WITHOUT_STATEMENTS':
        f = next((x for x in src.get(v, []) if x.endswith(f'{n}.sql')), None)
        if f is None: errors.append(f'{v}_{n}: ledger row has no SQL and no source file'); continue
        shutil.copy(os.path.join(mig, f), os.path.join(out, f'{v}_{n}.sql')); chosen_src.add(f); used['unverified_no_ledger_sql'] = used.get('unverified_no_ledger_sql', 0) + 1
        continue
    if r['archived_file']:
        text = open(os.path.join(led, r['archived_file']), encoding='utf8').read(); used['archived'] += 1
    else:
        cands = [v] if r['class'] == 'IDENTICAL_SAME_VERSION' else (r['source_versions_with_identical_sql'] or [])
        text = None
        for sv in cands:
            for f in src.get(sv, []):
                t = open(os.path.join(mig, f), encoding='utf8').read()
                if nws(t) == want:
                    text = t; chosen_src.add(f); used['source_same_version' if sv == v else 'source_renamed'] += 1; break
            if text: break
    if text is None or nws(text) != want:
        errors.append(f'{v}_{n}: no SQL source matching ledger hash'); continue
    open(os.path.join(out, dest), 'w', encoding='utf8').write(text)
prereq = [l.strip() for l in open(os.path.join(led, 'replay-prerequisites.txt')) if l.strip() and not l.startswith('#')]
for f in prereq:
    p = os.path.join(mig, f)
    if not os.path.exists(p): errors.append(f'prerequisite missing from source: {f}'); continue
    shutil.copy(p, os.path.join(out, f)); used['prerequisites'] += 1
excluded = sorted(f for fs in src.values() for f in fs if f not in chosen_src and f not in prereq and not any(os.path.exists(os.path.join(out, f)) for _ in [0]))
rep = {'ledger_rows': len(manifest['rows']), 'files_written': len([f for f in os.listdir(out) if f.endswith('.sql')]), 'used': used, 'errors': errors, 'excluded_source_only_or_superseded_count': len(excluded), 'excluded': excluded}
if report_path: json.dump(rep, open(report_path, 'w'), indent=1)
print({k: v for k, v in rep.items() if k != 'excluded'})
sys.exit(1 if errors else 0)
