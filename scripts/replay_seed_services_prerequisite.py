#!/usr/bin/env python3
"""Replay-workspace-only prerequisite: the Production `services` rows referenced by archived Production SQL.

Archived Production SQL from 20261006233600 onward (the DNI-07A and DNI-08A Stripe catalog reconciliations) upserts
dd_stripe_catalog_sync rows whose source_service_id values are Production `services` UUIDs. Those rows are runtime data
in Production (no migration source creates them), so a from-scratch replay cannot satisfy
dd_stripe_catalog_sync_source_service_id_fkey.

This script writes ONE extra migration file into the disposable replay workspace, versioned immediately before
20261006233600, that inserts only the identifying columns (id, sku, slug, name) of those rows. No price, status,
Stripe identifier or other business data is seeded; the foreign key is satisfied, never disabled. It fails closed:
  * the first target archived migration must be present in the workspace;
  * every service UUID literal in the workspace's migrations at or after the first target (files that mention
    service_id) must be covered by the seed, with the SKU that immediately precedes it, and every seeded UUID must be used;
  * the seed slot version must not already exist.
Identifiers were verified read-only against Production on 2026-10-12 (id <-> sku <-> slug <-> name), 29 rows.
Usage: replay_seed_services_prerequisite.py <replay-migrations-dir>
"""
import glob
import os
import re
import sys

TARGET_VERSION = "20261006233600"
SEED_VERSION = "20261006233599"
SEED_NAME = "replay_prerequisite_services_07a_08a"

# (id, sku, slug, name): verified against Production public.services
SEED = [
    ("4dd9d3a6-5e1c-4e89-8c4e-ab740c45c4fc", "DNI-07A-001", "d07-001", "Marketing Audit"),
    ("1e285297-4955-4736-bf99-2d3acd3408f6", "DNI-07A-002", "d07-002", "Marketing Strategy"),
    ("1b7b67cb-b0d0-4985-8f34-8379b375c160", "DNI-07A-003", "d07-003", "Campaign Planning"),
    ("6fec8d1b-1d5c-4a0a-916c-7cfdaaeef1de", "DNI-07A-004", "d07-004", "Content Calendar"),
    ("beff1846-df32-4ade-950e-022fd60f8e7b", "DNI-07A-005", "d07-005", "Social Media Management"),
    ("a7e373d4-f652-455c-9a96-1287e0c1d497", "DNI-07A-006", "d07-006", "Social Post Creation"),
    ("56987a25-c84f-4222-ab67-710ef6cf44a5", "DNI-07A-007", "d07-007", "Short-Form Content"),
    ("0921bbfe-c419-4806-aec8-00b3b834a148", "DNI-07A-008", "d07-008", "Email Marketing Setup"),
    ("845a7cd1-d0f8-4545-819a-ec67ba019a16", "DNI-07A-009", "d07-009", "Newsletter Production"),
    ("f2e7aa74-ae93-4b84-b6ce-dea4036cd993", "DNI-07A-010", "d07-010", "Local SEO Setup"),
    ("fea90016-c754-4266-baaa-f6654284a731", "DNI-08A-001", "d08-001", "Business Development Audit"),
    ("a52511d4-5ebb-44c5-9b0e-65ded96c6466", "DNI-08A-002", "d08-002", "Sales Pipeline Setup"),
    ("969f23fe-e35d-4398-a08b-49a8582b5af0", "DNI-08A-003", "d08-003", "Lead List Building"),
    ("bb7c7d95-056b-430b-8a48-1db0c9ba3ca4", "DNI-08A-004", "d08-004", "Lead Research"),
    ("84014b45-99c9-4dda-92af-fc5e1f5e4834", "DNI-08A-005", "d08-005", "Lead Qualification"),
    ("68ad5154-9645-4661-97ff-ac3382e14512", "DNI-08A-006", "d08-006", "CRM Pipeline Setup"),
    ("50397caa-0c9e-4965-9f9a-9abaacec939e", "DNI-08A-007", "d08-007", "Sales Process Design"),
    ("0e625937-2660-4ec7-ade1-93664be85a3d", "DNI-08A-008", "d08-008", "Outreach Campaign Setup"),
    ("62f48eae-1836-4efa-ad67-7e2f0b4d0c67", "DNI-08A-009", "d08-009", "Follow-Up System"),
    ("63b48054-a9e1-4bd3-8be4-c8cfa9b88c8c", "DNI-08A-010", "d08-010", "Referral Program Design"),
    ("434ab904-3c9c-475b-8804-52e01e222542", "DNI-08A-011", "d08-011", "Partnership Outreach Support"),
    ("c29259f9-3a7a-4465-bec7-8bf1ea161efc", "DNI-08A-012", "d08-012", "Vendor Network Development"),
    ("50b124e6-e251-43ce-b7c9-1aada308f46c", "DNI-08A-013", "d08-013", "Strategic Partnership Research"),
    ("83bbbc38-9034-451b-9f20-8e1faa592a8e", "DNI-08A-014", "d08-014", "Growth Strategy Session"),
    ("1dbf85df-ba95-4085-b8ba-68a00c690c9f", "DNI-08A-015", "d08-015", "Market Research"),
    ("5e50eec8-6130-4601-b18d-85ab089246c3", "DNI-08A-016", "d08-016", "Competitive Research"),
    ("08956d8d-ee95-4736-b291-5204d8f8cc15", "DNI-08A-017", "d08-017", "Offer/Productization Strategy"),
    ("30f0d490-e6c8-4948-bb5e-f198b719456c", "DNI-08A-018", "d08-018", "Pricing Strategy"),
    ("a466d8dd-598d-47c0-877c-790784bc5fcf", "DNI-08A-019", "d08-019", "Business Expansion Plan"),
]
LIT_RE = re.compile(
    r"'(DNI-[0-9A-Z]+-\d+)'|'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'")


def referenced_pairs(directory):
    """{uuid: sku} for every service UUID literal in migrations at/after TARGET_VERSION that mention service_id.
    The SKU is the nearest preceding DNI SKU literal, matching how the reconcile migrations list their rows."""
    pairs = {}
    for path in sorted(glob.glob(os.path.join(directory, "*.sql"))):
        name = os.path.basename(path)
        if name.split("_")[0] < TARGET_VERSION:
            continue
        text = open(path, encoding="utf8").read()
        if "service_id" not in text:
            continue
        last = None
        for m in LIT_RE.finditer(text):
            if m.group(1):
                last = m.group(1)
            else:
                pairs.setdefault(m.group(2), set()).add(last)
    return pairs


def seed_sql():
    rows = ",\n".join("  ('%s','%s','%s','%s')" % r for r in SEED)
    return (
        "-- REPLAY-WORKSPACE ONLY. Never committed to supabase/migrations; generated by scripts/replay_seed_services_prerequisite.py.\n"
        "-- Identifier-only prerequisite rows (Production services runtime data) for the Stripe catalog reconciliations' foreign key.\n"
        "insert into public.services(id, sku, slug, name) values\n%s\non conflict do nothing;\n" % rows
    )


def seed(directory):
    targets = glob.glob(os.path.join(directory, TARGET_VERSION + "_*.sql"))
    if len(targets) != 1:
        raise SystemExit("EXPECTED exactly one %s migration in the workspace, found %d" % (TARGET_VERSION, len(targets)))
    if glob.glob(os.path.join(directory, SEED_VERSION + "_*.sql")):
        raise SystemExit("seed slot %s already exists; refusing to overwrite" % SEED_VERSION)
    pairs = referenced_pairs(directory)
    seeded = {r[0]: r[1] for r in SEED}
    if set(pairs) != set(seeded):
        raise SystemExit("seed does not match the lineage's service UUIDs: missing=%s unused=%s" % (
            sorted(set(pairs) - set(seeded)), sorted(set(seeded) - set(pairs))))
    wrong = {u: (sorted(x for x in s if x), seeded[u]) for u, s in pairs.items() if seeded[u] not in s}
    if wrong:
        raise SystemExit("seed SKU does not match the SKU the migration pairs with the UUID: %s" % wrong)
    path = os.path.join(directory, "%s_%s.sql" % (SEED_VERSION, SEED_NAME))
    open(path, "w", encoding="utf8").write(seed_sql())
    print("wrote replay-only prerequisite %s (%d identifier-only services rows)" % (os.path.basename(path), len(SEED)))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    seed(sys.argv[1])
