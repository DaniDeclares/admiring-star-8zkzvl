import glob
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SCRIPT = os.path.join(ROOT, "scripts", "replay_seed_services_07a.py")
ARCHIVED = glob.glob(os.path.join(ROOT, "supabase", "production-ledger", "20261006233600_*.sql"))


def run(directory):
    return subprocess.run([sys.executable, "-I", SCRIPT, directory], capture_output=True, text=True)


class SeedServices07a(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.dir, True)
        self.assertEqual(len(ARCHIVED), 1)
        shutil.copy(ARCHIVED[0], self.dir)

    def test_seed_covers_exactly_the_archived_migrations_service_ids(self):
        r = run(self.dir)
        self.assertEqual(r.returncode, 0, r.stderr)
        seed = open(glob.glob(os.path.join(self.dir, "20261006233599_*.sql"))[0], encoding="utf8").read()
        archived = open(ARCHIVED[0], encoding="utf8").read()
        m = re.search(r"insert into public\.dd_stripe_catalog_sync\(.*?\)\s*values(.*?)on conflict", archived, re.S | re.I)
        uuid_re = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")
        self.assertEqual(sorted(set(uuid_re.findall(m.group(1)))), sorted(set(uuid_re.findall(seed))))

    def test_seed_pairs_each_uuid_with_the_sku_the_migration_uses(self):
        run(self.dir)
        seed = open(glob.glob(os.path.join(self.dir, "20261006233599_*.sql"))[0], encoding="utf8").read()
        archived = open(ARCHIVED[0], encoding="utf8").read()
        pairs = re.findall(r"\('(DNI-07A-\d{3})','prod_[^']*','price_[^']*',true,'SYNCED_ACTIVE','([0-9a-f-]{36})'", archived)
        self.assertEqual(len(pairs), 10)
        for sku, uid in pairs:
            self.assertRegex(seed, r"\('%s','%s'," % (uid, sku))

    def test_seed_is_identifier_only_and_never_disables_the_foreign_key(self):
        run(self.dir)
        seed = open(glob.glob(os.path.join(self.dir, "20261006233599_*.sql"))[0], encoding="utf8").read().lower()
        self.assertIn("insert into public.services(id, sku, slug, name)", seed)
        for forbidden in ("price", "stripe", "status", "disable trigger", "session_replication_role", "drop constraint", "not valid"):
            self.assertNotIn(forbidden, seed.split("insert into", 1)[1])

    def test_seed_version_sorts_immediately_before_the_target(self):
        run(self.dir)
        names = sorted(os.listdir(self.dir))
        self.assertEqual([n.split("_")[0] for n in names], ["20261006233599", "20261006233600"])

    def test_fails_closed_when_target_missing(self):
        os.remove(glob.glob(os.path.join(self.dir, "20261006233600_*.sql"))[0])
        self.assertNotEqual(run(self.dir).returncode, 0)

    def test_fails_closed_when_migration_references_an_unseeded_service(self):
        p = glob.glob(os.path.join(self.dir, "20261006233600_*.sql"))[0]
        t = open(p, encoding="utf8").read().replace("4dd9d3a6-5e1c-4e89-8c4e-ab740c45c4fc", "00000000-0000-0000-0000-000000000000")
        open(p, "w", encoding="utf8").write(t)
        r = run(self.dir)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("does not match", r.stderr)

    def test_refuses_to_overwrite_existing_slot(self):
        open(os.path.join(self.dir, "20261006233599_existing.sql"), "w").write("select 1;")
        self.assertNotEqual(run(self.dir).returncode, 0)


if __name__ == "__main__":
    unittest.main()
