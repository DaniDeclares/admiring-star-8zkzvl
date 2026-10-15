import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SCRIPT = os.path.join(ROOT, "scripts", "replay_skip_production_proofs.py")
MIG = os.path.join(ROOT, "supabase", "migrations")
LEDGER = os.path.join(ROOT, "supabase", "production-ledger")
# ledger version -> (repo dir, repo source file); the assembler renames source files to ledger versions
FILES = {
    "20261007011038": (MIG, "20261007021000_prove_recurring_dynamic_payment_path.sql"),
    "20261007011218": (MIG, "20261007022000_prove_recurring_runtime_and_regression.sql"),
    "20261007014029": (LEDGER, "20261007014029_ch01_holiday_commercial_release_governed.sql"),
}
TRAILING = ("20261007011038", "20261007011218")
WHOLE = "20261007014029"


def read(p):
    with open(p, encoding="utf8") as fh:
        return fh.read()


class SkipProductionProofs(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.dir, True)
        for version, (src_dir, src) in FILES.items():
            shutil.copy(os.path.join(src_dir, src), os.path.join(self.dir, version + "_" + src.split("_", 1)[1]))
        self.report = os.path.join(self.dir, "report.json")

    def run_script(self, report=True):
        args = [sys.executable, "-I", SCRIPT, self.dir] + ([self.report] if report else [])
        env = dict(os.environ)
        env.pop("GITHUB_STEP_SUMMARY", None)
        return subprocess.run(args, capture_output=True, text=True, env=env)

    def path(self, version):
        return [os.path.join(self.dir, f) for f in os.listdir(self.dir) if f.startswith(version + "_")][0]

    def test_removes_only_the_trailing_proof_block_and_keeps_ddl_and_grants(self):
        before = {v: read(self.path(v)) for v in TRAILING}
        r = self.run_script()
        self.assertEqual(r.returncode, 0, r.stderr)
        for v, text in before.items():
            after = read(self.path(v))
            cut = text.index("\nDO $$") + 1
            self.assertTrue(after.startswith(text[:cut]))
            self.assertNotIn("\nDO $$", after)
            self.assertIn("CREATE OR REPLACE FUNCTION public.dd_prove_recurring", after)
            self.assertIn("GRANT EXECUTE ON FUNCTION public.dd_prove_recurring", after)
            self.assertIn("NOT_PROVEN", after)
            self.assertNotIn("RAISE EXCEPTION 'RECURRING_", after.split("END $fn$;", 1)[1])

    def test_report_marks_every_skipped_proof_not_proven_never_pass(self):
        self.run_script()
        report = json.load(open(self.report))
        self.assertEqual(len(report), 3)
        for item in report:
            self.assertEqual(item["status"], "NOT_PROVEN")
            self.assertNotIn("PASS", item["status"])
            self.assertTrue(item["obligation"])
            self.assertIn(item["mode"], ("trailing", "whole_block"))
        trailing = [i for i in report if i["mode"] == "trailing"]
        self.assertEqual(len(trailing), 2)
        for item in trailing:
            self.assertIn("DNI-08A-020", item["target_skus"])

    def test_report_fingerprints_the_exact_removed_statement_and_states_the_reason(self):
        import hashlib
        before = {v: read(self.path(v)) for v in FILES}
        self.run_script()
        for item in json.load(open(self.report)):
            text = before[item["ledger_version"]]
            import re
            block = text[re.search(r"(?im)^do \$\$", text).start():]
            self.assertEqual(item["removed_statement_sha256"], hashlib.sha256(block.encode("utf8")).hexdigest())
            self.assertEqual(item["removed_statement_bytes"], len(block.encode("utf8")))
            self.assertEqual(item["removed_statement_first_line"].lower(), "do $$")
            self.assertTrue(item["removed_statement_last_line"].lower().endswith("end $$;"))
            self.assertIn("source assertions are left unchanged", item["reason"])

    def test_pinned_hashes_match_the_repo_sources(self):
        r = self.run_script()
        self.assertEqual(r.returncode, 0, r.stderr)
        for item in json.load(open(self.report)):
            self.assertEqual(len(item["file_sha256"]), 64)

    def test_refuses_when_a_file_changes_even_by_one_byte(self):
        p = self.path("20261007011038")
        with open(p, "a", encoding="utf8") as fh:
            fh.write(" ")
        r = self.run_script()
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("sha256 mismatch", r.stderr)

    def test_refuses_when_a_file_is_missing(self):
        os.remove(self.path("20261007011218"))
        self.assertNotEqual(self.run_script().returncode, 0)

    def test_refuses_duplicate_workspace_slot(self):
        shutil.copy(self.path("20261007011038"), os.path.join(self.dir, "20261007011038_duplicate.sql"))
        self.assertNotEqual(self.run_script().returncode, 0)

    def test_does_not_touch_files_outside_the_allowlist(self):
        other = os.path.join(self.dir, "20261007011000_unrelated.sql")
        with open(other, "w", encoding="utf8") as fh:
            fh.write("DO $$ BEGIN PERFORM 1; END $$;\n")
        self.run_script()
        self.assertEqual(read(other), "DO $$ BEGIN PERFORM 1; END $$;\n")


class WholeBlockMode(SkipProductionProofs):
    """Extra guarantees for the DDL-free data-release file."""

    def test_whole_block_file_is_reduced_to_a_comment_stub_with_no_release_state_change(self):
        self.run_script()
        after = read(self.path(WHOLE))
        self.assertNotRegex(after.lower(), r"(?m)^\s*(insert|update|do|create|alter|drop|grant)\b")
        self.assertIn("NOT_PROVEN", after)
        self.assertNotIn("SELL_NOW", after.replace("SELL_NOW offer status", ""))
        for item in json.load(open(self.report)):
            if item["ledger_version"] == WHOLE:
                self.assertEqual(item["mode"], "whole_block")
                self.assertIn("DDL-free", item["skipped"])

    def test_whole_block_mode_refuses_a_file_that_gained_ddl(self):
        p = self.path(WHOLE)
        with open(p, "a", encoding="utf8") as fh:
            fh.write("\ncreate table public.zz(x int);\n")
        r = self.run_script()
        self.assertNotEqual(r.returncode, 0)

    def test_whole_block_mode_refuses_content_before_the_block(self):
        p = self.path(WHOLE)
        with open(p, "w", encoding="utf8") as fh:
            fh.write("select 1;\n" + read(p))
        r = self.run_script()
        self.assertNotEqual(r.returncode, 0)


if __name__ == "__main__":
    unittest.main()
