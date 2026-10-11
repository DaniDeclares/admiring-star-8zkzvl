"""Quantize rendered masters (128 colors, 300 dpi, transparent), write QA manifest, and record artwork in inventory.json.
Usage: python3 -I tools/product-art/package_art.py <renderDir> <repoRoot>"""
import sys, os, json, hashlib, glob
from PIL import Image
src, root = sys.argv[1], sys.argv[2]
inv_path = os.path.join(root, 'data/product-production/inventory.json')
inv = json.load(open(inv_path))
out_root = os.path.join(root, 'products/seasonal-art-2026')
rep = {r['key']: r for r in json.load(open(os.path.join(src, '_report.json')))}
qa = []
for m in inv['merch']:
    r = rep[m['key']]
    im = Image.open(os.path.join(src, r['file']))
    season = m['season'].lower()
    os.makedirs(os.path.join(out_root, season), exist_ok=True)
    rel = f"products/seasonal-art-2026/{season}/{m['key']}.png"
    q = im.quantize(colors=128, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
    q.save(os.path.join(root, rel), optimize=True, dpi=(300, 300))
    chk = Image.open(os.path.join(root, rel)).convert('RGBA')
    bb = chk.getchannel('A').getbbox()
    margin = min(bb[0], bb[1], chk.width - bb[2], chk.height - bb[3])
    sha = hashlib.sha256(open(os.path.join(root, rel), 'rb').read()).hexdigest()
    lines = r['lines']
    m['artwork'] = {'status': 'DRAFT_RENDERED_NOT_APPROVED', 'file': rel, 'sha256': sha, 'pixels': [chk.width, chk.height], 'dpi': 300,
                    'transparent_background': True, 'min_edge_margin_px': margin, 'font_size_px': r['size'], 'lines': lines,
                    'self_contained_badge': True, 'fonts': ['Shrikhand (OFL)', 'Alfa Slab One (OFL)', 'Oswald (OFL)'],
                    'checks_not_done': ['Printify blueprint print-area/size confirmation', 'physical or Printify mockup', 'owner visual approval', 'IP/trademark search']}
    m['release_state'] = 'ARTWORK_DRAFT_RENDERED'
    qa.append({'key': m['key'], 'bytes': os.path.getsize(os.path.join(root, rel)), 'min_margin_px': margin})
json.dump(inv, open(inv_path, 'w'), indent=1, ensure_ascii=False)
json.dump({'generated': '2026-10-11', 'files': len(qa), 'total_bytes': sum(x['bytes'] for x in qa), 'items': qa}, open(os.path.join(out_root, 'qa-manifest.json'), 'w'), indent=1)
print(len(qa), 'packaged', sum(x['bytes'] for x in qa) // 1024, 'KB')
