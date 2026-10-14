import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SHIM = os.path.join(ROOT, "scripts", "replay_shim_provider_guard_format.py")
SRC = os.path.join(ROOT, "supabase", "migrations", "20261003163000_staged_intake_incomplete_does_not_block_login.sql")
RECON = os.path.join(ROOT, "supabase", "production-ledger", "20261003184925_provider_staging_missing_payload_guard_reconciled.sql")
CANON = os.path.join(ROOT, "supabase", "migrations", "20261003182500_provider_staging_missing_payload_guard.sql")
NAME = "20261003173410_staged_intake_incomplete_does_not_block_login.sql"


def read(p):
    return open(p, encoding="utf8").read()


def lit(text, name):
    return re.search(name + r" text := \$\$(.*?)\$\$;", text, re.S).group(1)


def squash(t):
    return re.sub(r"\s", "", t)


def run(directory):
    return subprocess.run([sys.executable, "-I", SHIM, directory], capture_output=True, text=True)


class ProviderGuardShim(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp()
        shutil.copy(SRC, os.path.join(self.dir, NAME))
        self.addCleanup(shutil.rmtree, self.dir, True)

    def test_unshimmed_replay_source_lacks_production_old_guard(self):
        self.assertNotIn(lit(read(RECON), "v_old"), read(os.path.join(self.dir, NAME)))

    def test_shim_makes_archived_production_guard_match_without_logic_change(self):
        before = read(os.path.join(self.dir, NAME))
        r = run(self.dir)
        self.assertEqual(r.returncode, 0, r.stderr)
        after = read(os.path.join(self.dir, NAME))
        self.assertIn(lit(read(RECON), "v_old"), after)
        self.assertEqual(squash(before), squash(after))

    def test_archived_and_canonical_guards_are_token_identical(self):
        for name in ("v_old", "v_new"):
            self.assertEqual(squash(lit(read(RECON), name)), squash(lit(read(CANON), name)))

    def test_shim_is_idempotent(self):
        self.assertEqual(run(self.dir).returncode, 0)
        first = read(os.path.join(self.dir, NAME))
        self.assertEqual(run(self.dir).returncode, 0)
        self.assertEqual(first, read(os.path.join(self.dir, NAME)))

    def test_fails_closed_when_guard_changed(self):
        p = os.path.join(self.dir, NAME)
        open(p, "w", encoding="utf8").write(read(p).replace("v_existing_application IS NULL", "v_existing_application IS NOT NULL", 1))
        r = run(self.dir)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("refusing to guess", r.stderr)

    def test_fails_closed_when_file_missing(self):
        os.remove(os.path.join(self.dir, NAME))
        self.assertNotEqual(run(self.dir).returncode, 0)


if __name__ == "__main__":
    unittest.main()
