#!/usr/bin/env python3
"""Replay-workspace-only: skip the trailing Production-data proof execution of an exact, hash-pinned allowlist.

Some archived migrations create a proof function (DDL + grants) and then immediately EXECUTE it in one trailing DO block.
That execution asserts live Production state (locked pricing rules, release contract views, ...) and writes PASS evidence
receipts. A schema-only replay has no Production business data, so it can never pass. Option A (owner decision
2026-10-12): keep the DDL, skip only that trailing execution, in the disposable workspace, and record the skipped proof as
NOT_PROVEN. This does NOT prove the payment path and must never be read as commercial readiness: every skipped proof
stays an explicit Production runtime verification obligation.

Two modes, both exact-file allowlisted:
  * "trailing"    : DDL + grants first, then ONE trailing DO block that executes the proof (the default);
  * "whole_block" : a file that is nothing but ONE DO block with NO DDL at all (a Production data-release/proof action).
                    Skipping it removes no schema lineage. Used only where owner rule 3 applies; reported as such.
Fail closed:
  * the file for each allowlisted ledger version must be present and its sha256 must equal the pinned value;
  * the block to remove must start with the pinned text, be the ONLY top-level DO block, and run to end of file;
  * the function definition and grants listed in `keeps` must still be present after removal;
  * nothing outside the allowlist is touched; any divergence raises instead of guessing.
Usage: replay_skip_production_proofs.py <replay-migrations-dir> [report.json]
"""
import glob
import hashlib
import json
import os
import re
import sys

ALLOWLIST = [
    {
        "version": "20261007011038",
        "source_file": "20261007021000_prove_recurring_dynamic_payment_path.sql",
        "sha256": "a6c24f3d467fbcbc9dd91b6e986112cd643b6ce6e2d8d12ddb3c2b1c0121e207",
        "block_start": "DO $$\nDECLARE sku text; result jsonb;\nBEGIN\n",
        "proof_function": "public.dd_prove_recurring_payment_path(text)",
        "keeps": [
            "CREATE OR REPLACE FUNCTION public.dd_prove_recurring_payment_path(p_sku text)",
            "GRANT EXECUTE ON FUNCTION public.dd_prove_recurring_payment_path(text)",
        ],
        "obligation": "Production runtime verification of the recurring dynamic payment path (locked pricing rules across "
                      "channels, release contract, subscription lifecycle tables, accepted-terms checkout binding, live Billing "
                      "Portal configuration). The replay does not prove it.",
    },
    {
        "version": "20261007011218",
        "source_file": "20261007022000_prove_recurring_runtime_and_regression.sql",
        "sha256": "fe05a9cffe7165418f1be3594cc1d58366f779da2e824ca5455a1e47ea201fe7",
        "block_start": "DO $$\nDECLARE\n  sku text;\n  result jsonb;\n  before_live text[];",
        "proof_function": "public.dd_prove_recurring_runtime_release(text)",
        "keeps": [
            "CREATE OR REPLACE FUNCTION public.dd_prove_recurring_runtime_release(p_sku text)",
            "GRANT EXECUTE ON FUNCTION public.dd_prove_recurring_runtime_release(text)",
        ],
        "obligation": "Production runtime and release-train regression verification for the recurring SKUs (no LIVE_READY "
                      "service dropped; each target at the regression gate). The replay does not prove it.",
    },
]
ALLOWLIST.append({
    "version": "20261007014029",
    "source_file": "20261007014029_ch01_holiday_commercial_release_governed.sql (supabase/production-ledger)",
    "sha256": "20598ca4572b8d6b290741a6039600b42de6e391fd2a4231f4565f454ffdaa94",
    "mode": "whole_block",
    "block_start": "do $$\ndeclare\n  v_sha text := '5e3c5d840aeac362609b8ea49ac6b856c29dbce1';",
    "proof_function": "(none: the file contains no DDL)",
    "keeps": [],
    "obligation": "Production runtime verification of the CH01 holiday commercial release: governed gates for the seven candidate "
                  "SKUs, the PASS evidence receipts, the SELL_NOW offer status and the DNI-01F-002 lighting fail-close. The "
                  "replay neither performs nor proves any of it; no release state was changed.",
})
SKU_RE = re.compile(r"'(DNI-[0-9A-Z]+-\d+)'")


def sha256_bytes(data):
    return hashlib.sha256(data).hexdigest()


def skip(directory):
    report = []
    for entry in ALLOWLIST:
        files = glob.glob(os.path.join(directory, entry["version"] + "_*.sql"))
        if len(files) != 1:
            raise SystemExit("EXPECTED exactly one %s migration in the workspace, found %d" % (entry["version"], len(files)))
        path = files[0]
        raw = open(path, "rb").read()
        digest = sha256_bytes(raw)
        if digest != entry["sha256"]:
            raise SystemExit("sha256 mismatch for %s (%s): got %s, pinned %s; refusing to modify" % (
                entry["version"], entry["source_file"], digest, entry["sha256"]))
        text = raw.decode("utf8")
        mode = entry.get("mode", "trailing")
        matches = list(re.finditer(r"(?im)^do \$\$", text))
        if len(matches) != 1:
            raise SystemExit("EXPECTED exactly one top-level DO block in %s, found %d" % (entry["version"], len(matches)))
        start = matches[0].start()
        block = text[start:]
        if not block.startswith(entry["block_start"]):
            raise SystemExit("DO block in %s does not start with the pinned text; refusing" % entry["version"])
        if not re.search(r"(?i)END \$\$;\s*$", block):
            raise SystemExit("DO block in %s is not the trailing statement; refusing" % entry["version"])
        head = text[:start]
        if mode == "whole_block":
            if head.strip() != "":
                raise SystemExit("%s: whole_block mode requires the file to contain nothing before the DO block; refusing" % entry["version"])
            if re.search(r"(?im)^\s*(create|alter|drop|grant|revoke|comment\s+on)\b", text):
                raise SystemExit("%s: whole_block mode requires a file with no DDL; refusing" % entry["version"])
        for keep in entry["keeps"]:
            if keep not in head:
                raise SystemExit("%s: required DDL/grant missing after removal: %s" % (entry["version"], keep))
        skus = sorted(set(SKU_RE.findall(block)))
        stub = (
            "-- REPLAY-ONLY: trailing Production-data proof execution removed from this disposable workspace.\n"
            "-- Status: NOT_PROVEN (never PASS). Obligation: %s\n" % entry["obligation"]
        )
        open(path, "w", encoding="utf8").write(head + stub)
        report.append({
            "ledger_version": entry["version"],
            "source_file": entry["source_file"],
            "file_sha256": digest,
            "proof_function_kept": entry["proof_function"],
            "mode": mode,
            "skipped": ("trailing proof execution (DO block)" if mode == "trailing"
                        else "entire file: one DDL-free Production data-release/proof DO block"),
            "reason": "The block asserts live Production business data (and writes PASS evidence receipts) that a schema-only "
                      "replay cannot have; the source assertions are left unchanged in the repo.",
            "removed_statement_sha256": sha256_bytes(block.encode("utf8")),
            "removed_statement_bytes": len(block.encode("utf8")),
            "removed_statement_first_line": block.splitlines()[0],
            "removed_statement_last_line": block.rstrip().splitlines()[-1],
            "target_skus": skus,
            "status": "NOT_PROVEN",
            "obligation": entry["obligation"],
        })
    return report


def main(argv):
    if len(argv) not in (2, 3):
        raise SystemExit(__doc__)
    report = skip(argv[1])
    if len(argv) == 3:
        with open(argv[2], "w", encoding="utf8") as fh:
            json.dump(report, fh, indent=1)
    lines = ["### Replay: Production runtime proofs skipped (status NOT_PROVEN, never PASS)", "",
             "Schema replay success is not commercial readiness. Each item below remains a Production runtime verification obligation.", ""]
    for r in report:
        lines.append("- `%s` (%s): %s SKUs: %s." % (r["ledger_version"], r["source_file"], r["obligation"], ", ".join(r["target_skus"])))
    summary = "\n".join(lines) + "\n"
    print(summary)
    target = os.environ.get("GITHUB_STEP_SUMMARY")
    if target:
        with open(target, "a", encoding="utf8") as fh:
            fh.write(summary)


if __name__ == "__main__":
    main(sys.argv)
