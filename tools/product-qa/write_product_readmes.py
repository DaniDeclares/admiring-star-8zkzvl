"""Rewrite per-product README provenance and the evidence table from the PDFs on disk plus tools/product-qa/product_provenance.json
(original hashes were taken from the owner-supplied files on 2026-10-11)."""
import json, hashlib, os, sys
from pypdf import PdfReader
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = json.load(open(os.path.join(R, 'tools/product-qa/product_provenance.json')))
sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()
rows = []
for p in P:
    d = os.path.join(R, 'products/digital', p['folder'])
    std = os.path.join(d, p['stem'] + '_printable.pdf'); ink = os.path.join(d, p['stem'] + '_ink_saver.pdf')
    rs, ri = PdfReader(std), PdfReader(ink)
    fs = len(rs.get_fields() or {})
    open(os.path.join(d, 'README.md'), 'w').write(f"""# {p['name']} (edition 2 draft)

Status: **DRAFT, not approved, not published.** Do not replace the customer download until the owner approves. Price unchanged.

- Original (kept intact, supplied by the owner): `{p['orig_name']}` from `{p['orig_zip']}`, sha256 `{p['orig_sha']}`.
- Draft, standard: `{os.path.basename(std)}`, sha256 `{sha(std)}`, {len(rs.pages)} pages, {fs} real form fields (each with a screen-reader tooltip), bookmarks, document language en-US.
- Draft, ink-saver (white pages, no filled bands; same content and fields): `{os.path.basename(ink)}`, sha256 `{sha(ink)}`.
- Built by `tools/product-art/{p['builder']}` (set `DANI_INK_SAVER=1` for the ink-saver variant).
- What it keeps and adds: {p['summary']}

Review: side-by-side preview at `products/digital/_quality-review/side-by-side/`; evidence in `docs/operations/DIGITAL_PRODUCT_REBUILD_EVIDENCE_2026-10-11.md`.
""")
    rows.append(f"| {p['name']} | `{p['orig_name']}` {p['orig_sha'][:12]}… | `{os.path.basename(std)}` {sha(std)[:12]}… ({len(rs.pages)}p, {fs} fields) | `{os.path.basename(ink)}` ({len(ri.pages)}p) |")
open('/tmp/claude-0/rebuild_rows.txt', 'w').write('\n'.join(rows)); print('\n'.join(rows))
