#!/usr/bin/env python3
"""Replay-workspace-only formatting shim for the provider staging guard.

Production applied 20261003173410_staged_intake_incomplete_does_not_block_login with a minified function body. The repo
source for the same ledger row (20261003163000, identical after whitespace/comment normalization) is formatted. Production's
archived reconciliation SQL (20261003184925) replaces the guard by exact text match against the minified form, so a clean
replay built from the formatted source cannot find it (EXPECTED_PROVIDER_STAGING_GUARD_NOT_FOUND).

This shim rewrites ONLY the whitespace of that one predicate, in the disposable replay workspace copy, to Production's
minified form. It never edits repo migrations or archived ledger SQL, and it fails closed:
  * the formatted predicate must appear exactly once (or the minified one exactly once, making this a no-op);
  * the file must be identical to the original after removing all whitespace (proves no token, literal or logic change).
Usage: replay_shim_provider_guard_format.py <replay-migrations-dir>
"""
import glob
import re
import sys

FORMATTED = (
    "OR (v_claim_kind = 'provider' AND v_claim_payload ? 'providerPayload' AND v_existing_application IS NULL\n"
    "           AND (nullif(v_claim_payload->'providerPayload'->>'applicant_type','') IS NULL"
)
MINIFIED = (
    "OR (v_claim_kind='provider' AND v_claim_payload ? 'providerPayload' AND v_existing_application IS NULL "
    "AND (nullif(v_claim_payload->'providerPayload'->>'applicant_type','') IS NULL"
)


def squash(text):
    return re.sub(r"\s", "", text)


def shim(directory):
    files = glob.glob(f"{directory}/20261003173410_staged_intake_incomplete_does_not_block_login.sql")
    if len(files) != 1:
        raise SystemExit(f"EXPECTED exactly one 20261003173410 staged_intake file, found {len(files)}")
    path = files[0]
    text = open(path, encoding="utf8").read()
    if text.count(MINIFIED) == 1 and text.count(FORMATTED) == 0:
        print("guard already in Production minified form; no change")
        return
    if text.count(FORMATTED) != 1:
        raise SystemExit(f"EXPECTED formatted guard exactly once, found {text.count(FORMATTED)}; refusing to guess")
    out = text.replace(FORMATTED, MINIFIED)
    if squash(out) != squash(text):
        raise SystemExit("shim changed more than whitespace; refusing")
    open(path, "w", encoding="utf8").write(out)
    print("normalized provider staging guard formatting to Production minified form")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    shim(sys.argv[1])
