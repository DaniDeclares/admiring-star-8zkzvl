"""Print-resolution upscale of owner-supplied artwork (EDSR x4, tiled; not generative, so lettering is never rewritten),
plus an optional conservative clean-up pass. Usage: upscale_owner_art.py <in.png> <outdir> [--straw]"""
import sys, os, numpy as np, cv2
from PIL import Image, ImageFilter
src, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
sr = cv2.dnn_superres.DnnSuperResImpl_create(); sr.readModel('/tmp/EDSR_x4.pb'); sr.setModel('edsr', 4)
im = Image.open(src).convert('RGBA'); a = np.array(im)
rgb = cv2.cvtColor(a[:, :, :3], cv2.COLOR_RGB2BGR); alpha = a[:, :, 3]
# composite onto cream so edge colours bleed correctly, upscale in tiles with overlap
bg = np.array([245, 235, 215], np.uint8)
m = (alpha[:, :, None] / 255.0)
flat = (rgb[:, :, ::-1] * m + bg * (1 - m)).astype(np.uint8)[:, :, ::-1]
H, W = flat.shape[:2]; T, O = 256, 24; big = np.zeros((H * 4, W * 4, 3), np.uint8)
for y in range(0, H, T):
    for x in range(0, W, T):
        y0, x0 = max(0, y - O), max(0, x - O); y1, x1 = min(H, y + T + O), min(W, x + T + O)
        tile = sr.upsample(flat[y0:y1, x0:x1])
        ty, tx = (y - y0) * 4, (x - x0) * 4; th, tw = min(T, H - y) * 4, min(T, W - x) * 4
        big[y * 4:y * 4 + th, x * 4:x * 4 + tw] = tile[ty:ty + th, tx:tx + tw]
alpha_big = cv2.resize(alpha, (W * 4, H * 4), interpolation=cv2.INTER_CUBIC)
res = np.dstack([cv2.cvtColor(big, cv2.COLOR_BGR2RGB), alpha_big])
if '--straw' in sys.argv:
    # the green straw on the iced cup reads as a well-known coffee chain's trade dress: recolour that one object to the design's orange
    hsv = cv2.cvtColor(res[:, :, :3], cv2.COLOR_RGB2HSV)
    S = 4; y0, y1, x0, x1 = 50 * S, 200 * S, 415 * S, 480 * S
    reg = hsv[y0:y1, x0:x1]; green = (reg[:, :, 0] > 35) & (reg[:, :, 0] < 90) & (reg[:, :, 1] > 60)
    reg[:, :, 0][green] = 12                      # orange hue; value/saturation kept so shading survives
    reg[:, :, 1][green] = np.clip(reg[:, :, 1][green].astype(int) + 40, 0, 255)
    res[:, :, :3] = cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)
img = Image.fromarray(res, 'RGBA'); img.save(f'{out}/master-5016.png', dpi=(300, 300))
cw = 4500; canvas = Image.new('RGBA', (4500, 5400), (0, 0, 0, 0)); bb = img.getbbox(); art = img.crop(bb)
sc = 3900 / art.width; art = art.resize((3900, int(art.height * sc)), Image.LANCZOS); canvas.paste(art, ((4500 - 3900) // 2, 450), art)
canvas.save(f'{out}/print-canvas-4500x5400.png', dpi=(300, 300)); print('done', img.size, art.size)
