"""Fast local dependency replay: applies a directory of migrations in order on a scratch PostgreSQL (after shim.sql),
continuing past failures and reporting each failing file with its first error. Finds missing-object/ordering defects in
seconds. NOT proof of Supabase replay success; CI remains the gate.
Usage: run.py <migrationsDir> <socketDir> <port> [--stop-after N]"""
import sys, os, re, subprocess, json
mig, sock, port = sys.argv[1:4]
stop_after = int(sys.argv[sys.argv.index('--stop-after') + 1]) if '--stop-after' in sys.argv else 10**9
def psql(*a, inp=None):
    return subprocess.run(['psql', '-X', '-q', '-h', sock, '-p', port, '-U', 'postgres', *a], capture_output=True, text=True, input=inp)
psql('-d', 'postgres', '-c', 'drop database if exists replay')
psql('-d', 'postgres', '-c', 'create database replay')
shim = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'shim.sql')
r = psql('-d', 'replay', '-f', shim)
print('shim:', (r.stderr.strip()[:300] or 'ok'))
fails = []
files = sorted(f for f in os.listdir(mig) if f.endswith('.sql'))
for i, f in enumerate(files):
    r = psql('-d', 'replay', '-1', '-v', 'ON_ERROR_STOP=1', '-f', os.path.join(mig, f))
    if r.returncode != 0:
        m = re.search(r'ERROR:\s+(.*)', r.stderr)
        fails.append({'file': f, 'error': (m.group(1) if m else r.stderr.strip()[:200])[:220]})
        if len(fails) >= stop_after: break
print(f'{len(files)} files, {len(fails)} failed')
for x in fails: print(' ', x['file'][:70], '|', x['error'])
json.dump(fails, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'last-run.json'), 'w'), indent=1)
