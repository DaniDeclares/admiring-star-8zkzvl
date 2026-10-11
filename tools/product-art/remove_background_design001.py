"""Background removal for owner-approved Design 001 (opaque pure-black background -> transparent), without altering the art.
Only near-black pixels connected to the image border or sitting between the lettering are removed; dark art inside the figures is kept.
Edge pixels get a soft alpha and un-premultiplied colour so there is no dark fringe on light garments.
Usage: remove_background_design001.py <in.png> <out.png> [--thr 6] [--text-rows 0.34]"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
src, dst = sys.argv[1], sys.argv[2]
thr = int(sys.argv[sys.argv.index('--thr') + 1]) if '--thr' in sys.argv else 6
text_frac = float(sys.argv[sys.argv.index('--text-rows') + 1]) if '--text-rows' in sys.argv else 0.46
im = np.array(Image.open(src).convert('RGB')); H, W = im.shape[:2]
V = im.max(axis=2).astype(int)
cand = V <= thr
# protect the notary's hair: seal narrow gaps between curls (closing) so the flood fill cannot leak into the black hair mass
P = np.zeros((H, W), bool); P[int(H * 0.268):int(H * 0.54), int(W * 0.39):int(W * 0.645)] = True
r = max(2, int(round(W / 250)))
yy, xx = np.ogrid[-r:r + 1, -r:r + 1]; disk = (xx * xx + yy * yy) <= r * r
closed = ndi.binary_closing(~cand, structure=disk)
cand2 = cand.copy(); cand2[P] = (cand & ~closed)[P]
lab, n = ndi.label(cand2)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(border))
# between/inside the lettering (counters of A, O, R, D, pockets between drips) is background: the upper zone holds no black art outside the hair box
tz = np.zeros_like(bg); tz[: int(H * text_frac)] = True
bg |= cand2 & tz & ~P
# small enclosed pockets that sit entirely in the top band of the hair box (between the lettering drips and the bun) are background too
labP, nP = ndi.label(cand2 & P)
for i, sl in enumerate(ndi.find_objects(labP), 1):
    comp = labP[sl] == i
    if sl[0].stop < int(H * 0.31) and comp.sum() > 200: bg[sl] |= comp
# soft edge: pixels that touch the removed area and are only slightly lit get partial alpha
near = ndi.binary_dilation(bg, iterations=3) & ~bg
alpha = np.where(bg, 0.0, 1.0)
ramp = np.clip((V - thr) / 40.0, 0, 1)
alpha = np.where(near, np.minimum(1.0, ramp + 0.15), alpha)
a = np.clip(alpha, 1e-3, 1.0)[:, :, None]
rgb = np.where(near[:, :, None], np.clip(im / a, 0, 255), im).astype(np.uint8)
out = np.dstack([rgb, (alpha * 255).astype(np.uint8)])
Image.fromarray(out, 'RGBA').save(dst, dpi=(300, 300)); print('removed %.1f%% of pixels' % (100 * bg.mean()))
