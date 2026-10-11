"""Render a PDF to a contact sheet PNG: contact_sheet.py in.pdf out.png [cols] [dpi]"""
import sys, subprocess, tempfile, glob, os
from PIL import Image
pdf, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 5
dpi = sys.argv[4] if len(sys.argv) > 4 else '28'
d = tempfile.mkdtemp()
subprocess.run(['pdftoppm', '-r', dpi, '-png', pdf, os.path.join(d, 'p')], check=True)
ims = [Image.open(f).convert('RGB') for f in sorted(glob.glob(os.path.join(d, 'p-*.png')))]
w, h = ims[0].size; rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (w * cols, h * rows), 'white')
for i, im in enumerate(ims): S.paste(im, ((i % cols) * w, (i // cols) * h))
S.save(out); print(len(ims), 'pages', S.size)
