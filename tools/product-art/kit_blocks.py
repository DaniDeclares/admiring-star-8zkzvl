"""Declarative page layout on top of kit_lib.Kit: a page is a header plus a list of blocks laid out top to bottom.
Raises if a page overflows so layout defects are caught at build time (still check contact sheets)."""
from reportlab.pdfbase.pdfmetrics import stringWidth
from kit_lib import Kit, W, H, INK, BURG, SOFT

LEFT = 48
BOTTOM = 62

def _wrap(text, width, size, font='Body'):
    out = []
    for para in text.split('\n'):
        line = ''
        for wd in para.split():
            t = (line + ' ' + wd).strip()
            if stringWidth(t, font, size) <= width: line = t
            else: out.append(line); line = wd
        out.append(line)
    return out

def note(k, y, title, text, size=10.5, lead=14):
    w = W - 2 * LEFT
    lines = _wrap(text, w - 28, size)
    h = 32 + lead * len(lines) + 6
    k.panel(LEFT, y, w, h, title)
    k.text(lines, LEFT + 14, y - 40, size, lead)
    return y - h - 10

def steps(k, y, title, items, size=10.5, lead=14):
    w = W - 2 * LEFT
    wrapped = [_wrap(s, w - 60, size) for s in items]
    h = 32 + sum(max(1, len(l)) * lead + 5 for l in wrapped) + 4
    k.panel(LEFT, y, w, h, title)
    yy = y - 42
    for i, ls in enumerate(wrapped):
        k.c.setFillColor(BURG); k.c.circle(LEFT + 22, yy + 4, 8, stroke=0, fill=1)
        k.c.setFillColor(__import__('kit_lib').CREAM); k.c.setFont('BodyB', 9.5); k.c.drawCentredString(LEFT + 22, yy + 1, str(i + 1))
        k.text(ls, LEFT + 38, yy, size, lead)
        yy -= len(ls) * lead + 5
    return y - h - 10

def fields(k, y, labels, cols=1, h=17, x=0):
    w = W - 2 * LEFT
    cw = (w - 16 * (cols - 1)) / cols
    rows = (len(labels) + cols - 1) // cols
    pitch = h + 24 + x
    for i, lab in enumerate(labels):
        r, c = divmod(i, cols)
        k.field(lab, LEFT + c * (cw + 16), y - 28 - r * pitch, cw, h)
    return y - 28 - rows * pitch + 14

def area(k, y, label, h=60, x=0):
    h = h + x * 2
    k.area(label, LEFT, y - 16 - h, W - 2 * LEFT, h)
    return y - 16 - h - 20

def check(k, y, title, items, cols=1):
    for it in items:
        if stringWidth(it, 'Body', 11) > ((W - 2 * LEFT - 28) / cols) - 26:
            raise SystemExit(f'CHECK ITEM TOO LONG: {it}')
    return k.checklist(title, items, LEFT, y, W - 2 * LEFT, cols)

def table(k, y, headers, widths, data=(), blank=0, row_h=26, name='t', size=9.5, x=0):
    return k.table_pre(headers, widths, list(data), LEFT, y, row_h + x, name, blank, size)

def _slots(b):
    if b[0] == 'area': return 2
    if b[0] == 'fields': return -(-len(b[1]) // (b[2] if len(b) > 2 else 1))
    if b[0] == 'table': return len(b[3]) + b[4] if len(b) > 4 else 0
    return 0

def _layout(k, pg, extra):
    y = H - 112
    for b in pg['blocks']:
        kind, args = b[0], list(b[1:])
        fn = {'note': note, 'steps': steps, 'fields': fields, 'area': area, 'check': check, 'table': table}[kind]
        if kind == 'fields':
            while len(args) < 2: args.append(1)
            y = fn(k, y, *args, x=extra)
        elif kind == 'area':
            while len(args) < 2: args.append(60)
            y = fn(k, y, *args, x=extra)
        elif kind == 'table':
            while len(args) < 6: args.append({3: (), 4: 0, 5: 26}[len(args) + 1] if len(args) + 1 in (3, 4, 5) else 26)
            y = fn(k, y, *args, x=extra)
        else:
            y = fn(k, y, *args)
    return y

def render(k, pages):
    import tempfile, os
    for pg in pages:
        # dry run on a scratch kit to measure free space, then stretch growable blocks to fill the page
        tmp = Kit(os.path.join(tempfile.gettempdir(), '_kit_dry.pdf'), 't', 't', 't')
        tmp.header(pg['title'], pg.get('sub', ''))
        y0 = _layout(tmp, pg, 0)
        slots = sum(_slots(b) for b in pg['blocks']) or 1
        free = y0 - (BOTTOM + 6)
        extra = max(0, min(free / slots, 26)) if free > 0 else 0
        k.header(pg['title'], pg.get('sub', ''))
        y = _layout(k, pg, extra)
        if y < BOTTOM - 10:
            raise SystemExit(f"OVERFLOW on page '{pg['title']}': y={y:.0f}")
        k.end_page()
