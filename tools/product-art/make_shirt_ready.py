"""Shirt-ready (no card, transparent) versions of the approved seasonal designs, light-ink and dark-shirt colorways.
Removes the cream label card, frame and 'EDITION' footer; keeps the illustration and slogan. Draft for review, not published."""
import sys, os, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
SRC = 'products/seasonal-art-2026'; OUT = f'{SRC}/shirt-ready'
JOBS = {
 'boo-its-notarized':        f'{SRC}/halloween/merch-halloween-notary-boo-it-s-notarized.png',
 'witch-please-i-clean':     f'{SRC}/halloween/merch-halloween-cleaning-witch-please-i-clean.png',
}
CREAM = np.array([245, 235, 210], float)
def build(path):
    im = Image.open(path).convert('RGBA'); a = np.array(im).astype(float)
    a = a[360:5080, 400:4100]                       # inside the frame
    a[4390:, :, 3] = 0                              # drop divider + 'EDITION' footer
    rgb, al = a[:, :, :3], a[:, :, 3]
    dist = np.sqrt(((rgb - CREAM) ** 2).sum(axis=2))
    near = (dist < 70) & (al > 0)
    lab, n = ndi.label(near)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge)) | (al == 0)
    soft = np.clip((dist - 25) / 90, 0, 1)
    alpha = np.where(bg, np.where(al == 0, 0, soft), 255 * np.ones_like(al) / 255)
    alpha = np.where(bg, alpha, 1.0)
    solid = alpha > 0.5
    lab2, n2 = ndi.label(solid)
    sizes = ndi.sum(solid, lab2, range(1, n2 + 1))
    for i, sz in enumerate(sizes, 1):
        if sz < 6000: alpha[lab2 == i] = 0       # leftover frame specks
    out = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    img = Image.fromarray(out, 'RGBA'); img = img.crop(img.getbbox()); return img
def to_dark_shirt(img):
    """Slogan ink flips to cream; the illustration keeps its own colors and gets a cream sticker outline so dark outlines/faces stay readable."""
    a = np.array(img).astype(float); al = a[:, :, 3] > 128
    rows = al.sum(axis=1); H = len(rows); gap = None; run = 0
    for y in range(int(H * 0.15), H):             # first empty band after the icon cluster = icon/text boundary
        run = run + 1 if rows[y] == 0 else 0
        if run >= 60: gap = y - 30; break
    gap = gap or int(H * 0.4)
    text = a.copy(); ink = (text[:, :, :3].mean(axis=2) < 95); ink[:gap] = False
    text[ink, :3] = CREAM
    icons = Image.fromarray(a.astype(np.uint8), 'RGBA'); icons_a = icons.getchannel('A')
    icon_mask = np.array(icons_a) > 128; icon_mask[gap:] = False
    m = Image.fromarray((icon_mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(41))
    out = Image.fromarray(text.astype(np.uint8), 'RGBA')
    halo = Image.new('RGBA', out.size, tuple(int(c) for c in CREAM) + (255,)); halo.putalpha(m)
    base = Image.new('RGBA', out.size, (0, 0, 0, 0)); base.alpha_composite(halo)
    keep = Image.fromarray(a.astype(np.uint8), 'RGBA'); keep_t = np.array(keep); keep_t[gap:] = 0
    base.alpha_composite(Image.fromarray(keep_t, 'RGBA'))
    t = np.array(out); t[:gap] = 0; base.alpha_composite(Image.fromarray(t, 'RGBA'))
    return base.crop(base.getbbox())
def place(img, width_px=3600, canvas=(4500, 5400)):
    s = width_px / img.width; im = img.resize((width_px, int(img.height * s)), Image.LANCZOS)
    c = Image.new('RGBA', canvas, (0, 0, 0, 0)); c.paste(im, ((canvas[0] - im.width) // 2, 300), im); return c
os.makedirs(OUT, exist_ok=True)
for slug, p in JOBS.items():
    base = build(p)
    place(base).save(f'{OUT}/{slug}-light-shirt.png', dpi=(300, 300))
    place(to_dark_shirt(base)).save(f'{OUT}/{slug}-dark-shirt.png', dpi=(300, 300))
    print(slug, base.size)
# review sheet (not a Printify mockup): both colorways on flat shirt-colored rectangles
sheet = Image.new('RGB', (1800, 1200), (255, 255, 255)); x = 0
for slug in JOBS:
    for kind, bgc in (('light', (222, 205, 176)), ('dark', (28, 28, 30))):
        t = Image.open(f'{OUT}/{slug}-{kind}-shirt.png'); t.thumbnail((290, 350))
        tile = Image.new('RGB', (300, 400), bgc); tile.paste(t, (5, 20), t); sheet.paste(tile, (x % 1800, (x // 1800) * 410)); x += 300
sheet = sheet.crop((0, 0, 1800, 410)); sheet.save(f'{OUT}/review-sheet.png')
