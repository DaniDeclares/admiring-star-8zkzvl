"""E1 evidence: does the repo's canonical path (source 20261003163000 + repo 20261003182500 guard patch) produce the same
function as Production's ledger path (20261003184925)? Compares pg_get_functiondef with SQL comments and whitespace removed.
Needs a scratch PostgreSQL (see run.py) and the Production md5/length read with:
  select md5(regexp_replace(pg_get_functiondef(p.oid),'\\s+','','g')), length(regexp_replace(pg_get_functiondef(p.oid),'\\s+','','g'))
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='private' and p.proname='dd_consume_provider_intake_staging_impl';
Usage: e1_provider_guard_equivalence.py <repoRoot> <socketDir> <port> <productionMd5> <productionLen>"""
import sys, re, subprocess, hashlib, os
root, sock, port, pmd5, plen = sys.argv[1:6]
def psql(db, *a, inp=None): return subprocess.run(['psql', '-X', '-At', '-h', sock, '-p', port, '-U', 'postgres', '-d', db, *a], capture_output=True, text=True, input=inp)
src = open(os.path.join(root, 'supabase/migrations/20261003163000_staged_intake_incomplete_does_not_block_login.sql')).read()
i = src.index('create or replace function private.dd_consume_provider_intake_staging_impl')
m = re.search(r'\$([a-z_]*)\$', src[i:]); tag = m.group(0)
j = src.index(tag, i + m.end()) + len(tag)
fn = src[i:j] + ';'
psql('postgres', '-c', 'drop database if exists e1test'); psql('postgres', '-c', 'create database e1test')
r = psql('e1test', '-v', 'ON_ERROR_STOP=1', inp='set check_function_bodies=off; create schema if not exists private; create table public.dd_provider_intake_staging(id uuid);\n' + fn)
assert r.returncode == 0, r.stderr
d = psql('e1test', '-c', "select pg_get_functiondef('private.dd_consume_provider_intake_staging_impl(uuid)'::regprocedure)").stdout
nws = lambda s: re.sub(r'\s+', '', s); nocom = lambda s: re.sub(r'--[^\n]*', '', s)
patch = open(os.path.join(root, 'supabase/migrations/20261003182500_provider_staging_missing_payload_guard.sql')).read()
old = re.search(r"v_old text := \$\$(.*?)\$\$;", patch, re.S).group(1); new = re.search(r"v_new text := \$\$(.*?)\$\$;", patch, re.S).group(1)
assert nws(old) in nws(nocom(d)), 'canonical guard text not found in the source function'
final = nws(nocom(d)).replace(nws(old), nws(new))
h = hashlib.md5(final.encode()).hexdigest()
print('replay-path md5', h, 'len', len(final)); print('production   md5', pmd5, 'len', plen); print('EQUIVALENT' if (h == pmd5 and str(len(final)) == plen) else 'DIFFERENT')
