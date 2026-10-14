import glob
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SCRIPT = os.path.join(ROOT, "scripts", "replay_seed_services_prerequisite.py")
LEDGER = os.path.join(ROOT, "supabase", "production-ledger")
# every archived Production migration at/after 20261006233600 that references Production services UUIDs
VERSIONS = ["20261006233600", "20261007003150", "20261007003355", "20261007003635", "20261007004019"]
UUID_RE = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")


def run(directory):
    return subprocess.run([sys.executable, "-I", SCRIPT, directory], capture_output=True, text=True)


def read(p):
    with open(p, encoding="utf8") as fh:
        return fh.read()


class SeedServicesPrerequisite(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.dir, True)
        for v in VERSIONS:
            files = glob.glob(os.path.join(LEDGER, v + "_*.sql"))
            self.assertEqual(len(files), 1, v)
            shutil.copy(files[0], self.dir)

    def seed_file(self):
        return glob.glob(os.path.join(self.dir, "20261006233599_*.sql"))[0]

    def test_seed_covers_exactly_the_uuids_the_archived_migrations_reference(self):
        r = run(self.dir)
        self.assertEqual(r.returncode, 0, r.stderr)
        seeded = set(UUID_RE.findall(read(self.seed_file())))
        referenced = set()
        for v in VERSIONS:
            referenced |= set(UUID_RE.findall(read(glob.glob(os.path.join(self.dir, v + "_*.sql"))[0])))
        self.assertEqual(len(seeded), 29)
        self.assertEqual(seeded, referenced)

    def test_seed_pairs_each_uuid_with_the_sku_the_migrations_use(self):
        run(self.dir)
        seed = read(self.seed_file())
        sku_re = re.compile(r"'(DNI-[0-9A-Z]+-\d+)'|'(" + UUID_RE.pattern + r")'")
        checked = 0
        for v in VERSIONS:
            last = None
            for m in sku_re.finditer(read(glob.glob(os.path.join(self.dir, v + "_*.sql"))[0])):
                if m.group(1):
                    last = m.group(1)
                else:
                    self.assertRegex(seed, r"\('%s','%s'," % (m.group(2), last))
                    checked += 1
        self.assertGreaterEqual(checked, 29)

    def test_seed_is_identifier_only_and_never_disables_the_foreign_key(self):
        run(self.dir)
        body = read(self.seed_file()).lower().split("insert into", 1)[1]
        self.assertTrue(body.startswith(" public.services(id, sku, slug, name)"))
        for forbidden in ("price", "stripe", "status", "disable trigger", "session_replication_role", "drop constraint", "not valid"):
            self.assertNotIn(forbidden, body)

    def test_seed_version_sorts_immediately_before_the_first_target(self):
        run(self.dir)
        names = sorted(os.listdir(self.dir))
        self.assertEqual(names[0].split("_")[0], "20261006233599")
        self.assertEqual(names[1].split("_")[0], "20261006233600")

    def test_fails_closed_when_first_target_missing(self):
        os.remove(glob.glob(os.path.join(self.dir, "20261006233600_*.sql"))[0])
        self.assertNotEqual(run(self.dir).returncode, 0)

    def test_fails_closed_when_a_migration_references_an_unseeded_service(self):
        p = glob.glob(os.path.join(self.dir, "20261007004019_*.sql"))[0]
        victim = UUID_RE.findall(read(p))[0]
        with open(p, "w", encoding="utf8") as fh:
            fh.write(read(p).replace(victim, "00000000-0000-0000-0000-000000000000"))
        r = run(self.dir)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("does not match", r.stderr)

    def test_fails_closed_when_a_seeded_service_is_no_longer_referenced(self):
        os.remove(glob.glob(os.path.join(self.dir, "20261007004019_*.sql"))[0])
        r = run(self.dir)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("unused", r.stderr)

    def test_fails_closed_when_the_sku_pairing_changes(self):
        p = glob.glob(os.path.join(self.dir, "20261007003150_*.sql"))[0]
        with open(p, "w", encoding="utf8") as fh:
            fh.write(read(p).replace("'DNI-08A-019'", "'DNI-08A-018'"))
        r = run(self.dir)
        self.assertNotEqual(r.returncode, 0)

    def test_refuses_to_overwrite_existing_slot(self):
        with open(os.path.join(self.dir, "20261006233599_existing.sql"), "w") as fh:
            fh.write("select 1;")
        self.assertNotEqual(run(self.dir).returncode, 0)


if __name__ == "__main__":
    unittest.main()
