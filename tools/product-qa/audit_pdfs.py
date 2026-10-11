"""Objective checks for customer-facing PDF products. Reports facts only; a human still judges usefulness and design.
Usage: audit_pdfs.py <out.json> <pdf>...   (run with python -I; inputs are treated as untrusted files, never executed)"""
import sys, json, re, os, hashlib, subprocess, tempfile, collections
from pypdf import PdfReader
from PIL import Image
INTERNAL = re.compile(r'\b(claude|chatgpt|openai|codex|grok|tester|production|supabase|stripe|shopify|LIVE_READY|SKU|PR ?#\d+|TODO|lorem|placeholder|test data|fictional|\[\s*\]|TBD|XXX)\b', re.I)
def ink(img):
    g = img.convert('L'); px = g.load(); w, h = g.size; n = 0; tot = 0
    for y in range(0, h, 4):
        for x in range(0, w, 4):
            tot += 1
            if px[x, y] < 235: n += 1
    return n / tot
res = []
out = sys.argv[1]
for p in sys.argv[2:]:
    r = PdfReader(p); pages = len(r.pages); fields = len(r.get_fields() or {})
    texts = [(pg.extract_text() or '') for pg in r.pages]
    words = sum(len(t.split()) for t in texts)
    d = tempfile.mkdtemp()
    subprocess.run(['pdftoppm', '-r', '30', '-png', p, os.path.join(d, 'p')], check=True, capture_output=True)
    cov = [round(ink(Image.open(os.path.join(d, f))), 3) for f in sorted(os.listdir(d))]
    hits = collections.Counter(m.group(0).lower() for t in texts for m in INTERNAL.finditer(t))
    fonts = set()
    for pg in r.pages:
        try:
            for f in (pg['/Resources'].get('/Font') or {}).values(): fonts.add(str(f.get_object().get('/BaseFont', '')).split('+')[-1])
        except Exception: pass
    res.append({'file': os.path.basename(p), 'sha256': hashlib.sha256(open(p, 'rb').read()).hexdigest()[:16], 'pages': pages, 'form_fields': fields, 'words': words,
                'words_per_page': round(words / max(pages, 1)), 'sparse_pages(ink<4%)': [i + 1 for i, c in enumerate(cov) if c < .04], 'mean_ink': round(sum(cov) / len(cov), 3),
                'fonts': sorted(fonts)[:8], 'flagged_terms': dict(hits)})
json.dump(res, open(out, 'w'), indent=1)
for x in res: print(x['file'][:58].ljust(58), f"{x['pages']:>3}p {x['form_fields']:>4}f {x['words_per_page']:>4}w/p sparse={len(x['sparse_pages(ink<4%)'])} flags={x['flagged_terms']}")
