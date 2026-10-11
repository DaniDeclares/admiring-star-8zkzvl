"""Shared layout toolkit for DANI printable + fillable PDF kits (reportlab). Brand tokens mirror
docs/design/DANI_CANONICAL_BRAND_PALETTE.md (burgundy #800020, ivory #F7F1E6, cream #FFFDF6, gold #B38A2D, soft gold #E8D5B0).
Gold is used only for rules and decoration, never for body text."""
import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
BURG, IVORY, CREAM, GOLD, SOFT, INK = (HexColor(x) for x in ('#800020', '#F7F1E6', '#FFFDF6', '#B38A2D', '#E8D5B0', '#2B2320'))
W, H = letter
_reg = False
def _fonts():
    global _reg
    if _reg: return
    pdfmetrics.registerFont(TTFont('Head', os.path.join(HERE, 'fonts/PlayfairDisplay-var.ttf')))
    pdfmetrics.registerFont(TTFont('Body', '/usr/share/fonts/truetype/crosextra/Carlito-Regular.ttf'))
    pdfmetrics.registerFont(TTFont('BodyB', '/usr/share/fonts/truetype/crosextra/Carlito-Bold.ttf'))
    _reg = True

class Kit:
    def __init__(self, path, title, subject, footer_label):
        _fonts()
        self.c = canvas.Canvas(path, pagesize=letter)
        self.c.setTitle(title); self.c.setAuthor('DANI DECLARES LLC'); self.c.setSubject(subject)
        self.c.setViewerPreference('DisplayDocTitle', 'true'); self.c.showOutline()
        self.ink = os.environ.get('DANI_INK_SAVER') == '1'; self.page = 0; self.fields = 0; self.footer_label = footer_label; self.n = 0; self.edition = 'Edition 2'

    # ---- page frame ----
    def _footer(self):
        c = self.c
        c.setStrokeColor(SOFT); c.setLineWidth(1); c.line(48, 44, W - 48, 44)
        c.setFillColor(INK); c.setFont('Body', 9)
        c.drawString(48, 30, f'DANI DECLARES LLC  |  {self.footer_label}  |  Original planning templates. Not legal, safety, tax or professional advice.')
        c.drawRightString(W - 48, 30, str(self.page))
    def header(self, title, sub):
        c = self.c; self.page += 1
        key = f'pg{self.page}'; c.bookmarkPage(key); c.addOutlineEntry(title, key, level=0)
        if self.ink:
            # ink-saver: white page, no filled band; same layout, burgundy type and a gold rule
            c.setFillColor(BURG); c.setFont('Head', 22); c.drawString(48, H - 48, title)
            c.setFillColor(INK); c.setFont('Body', 11.5); c.drawString(48, H - 68, sub)
            c.setFillColor(GOLD); c.rect(48, H - 78, W - 96, 2, stroke=0, fill=1)
        else:
            c.setFillColor(CREAM); c.rect(0, 0, W, H, stroke=0, fill=1)
            c.setFillColor(BURG); c.rect(0, H - 86, W, 86, stroke=0, fill=1)
            c.setFillColor(GOLD); c.rect(0, H - 90, W, 4, stroke=0, fill=1)
            c.setFillColor(CREAM); c.setFont('Head', 22); c.drawString(48, H - 48, title)
            c.setFont('Body', 11.5); c.drawString(48, H - 68, sub)
        self._footer()
    def cover(self, line1, line2, tagline, note):
        c = self.c; self.page += 1
        fg = BURG if self.ink else CREAM
        if not self.ink: c.setFillColor(BURG); c.rect(0, 0, W, H, stroke=0, fill=1)
        c.setFillColor(GOLD); c.rect(60, H - 180, W - 120, 3, stroke=0, fill=1); c.rect(60, 150, W - 120, 3, stroke=0, fill=1)
        c.setFillColor(fg); c.setFont('BodyB', 13); c.drawCentredString(W / 2, H - 150, 'D A N I   D E C L A R E S')
        c.setFont('Head', 42); c.drawCentredString(W / 2, H / 2 + 70, line1); c.drawCentredString(W / 2, H / 2 + 14, line2)
        c.setFont('Body', 16); c.drawCentredString(W / 2, H / 2 - 36, tagline)
        c.setFont('Body', 13); c.drawCentredString(W / 2, H / 2 - 80, note)
        c.setFillColor(INK if self.ink else SOFT); c.setFont('Body', 11); c.drawCentredString(W / 2, 112, self.edition + '  |  We handle the execution.')
        c.showPage()
    def end_page(self): self.c.showPage()
    def save(self):
        self.c.save()
        _finalize(self.c._filename)
        return self.page, self.fields

    # ---- primitives ----
    def text(self, lines, x, y, size=11.5, lead=15.5, font='Body', color=None):
        c = self.c; c.setFillColor(color or INK); c.setFont(font, size)
        for l in lines:
            c.drawString(x, y, l); y -= lead
        return y
    def para(self, text, x, y, width=None, size=11.5, lead=15.5, font='Body'):
        from reportlab.pdfbase.pdfmetrics import stringWidth
        width = width or (W - 2 * x)
        words, line, lines = text.split(), '', []
        for wd in words:
            t = (line + ' ' + wd).strip()
            if stringWidth(t, font, size) <= width: line = t
            else: lines.append(line); line = wd
        if line: lines.append(line)
        return self.text(lines, x, y, size, lead, font)
    def field(self, label, x, y, w, h=17):
        c = self.c; self.n += 1; self.fields += 1
        c.setFillColor(INK); c.setFont('BodyB', 10); c.drawString(x, y + h + 3, label)
        c.acroForm.textfield(name=f'f{self.n}', tooltip=label, x=x, y=y, width=w, height=h, borderStyle='underlined', borderColor=SOFT, fillColor=IVORY, textColor=INK, fontName='Helvetica', fontSize=10, borderWidth=1, forceBorder=True)
    def area(self, label, x, y, w, h):
        c = self.c; self.n += 1; self.fields += 1
        c.setFillColor(INK); c.setFont('BodyB', 10); c.drawString(x, y + h + 3, label)
        c.acroForm.textfield(name=f'f{self.n}', tooltip=label, x=x, y=y, width=w, height=h, borderStyle='solid', borderColor=SOFT, fillColor=IVORY, textColor=INK, fontName='Helvetica', fontSize=10, borderWidth=1, fieldFlags='multiline', forceBorder=True)
    def check(self, label, x, y, size=11):
        c = self.c; self.n += 1; self.fields += 1
        c.acroForm.checkbox(name=f'c{self.n}', tooltip=label, x=x, y=y - 2, size=13, borderColor=BURG, fillColor=IVORY, borderWidth=1.2, forceBorder=True)
        c.setFillColor(INK); c.setFont('Body', size); c.drawString(x + 21, y + 1, label)
    def panel(self, x, y_top, w, h, title=None):
        c = self.c
        c.setFillColor(IVORY); c.setStrokeColor(SOFT); c.roundRect(x, y_top - h, w, h, 8, stroke=1, fill=1)
        if title:
            c.setFillColor(BURG); c.setFont('BodyB', 11.5); c.drawString(x + 14, y_top - 19, title)
    def checklist(self, title, items, x, y_top, w, cols=1):
        rows = (len(items) + cols - 1) // cols
        h = 30 + 21 * rows
        self.panel(x, y_top, w, h, title)
        cw = (w - 28) / cols
        for i, it in enumerate(items):
            self.check(it, x + 14 + (i // rows) * cw, y_top - 44 - 21 * (i % rows))
        return y_top - h - 12
    def table(self, headers, widths, rows, x, y_top, row_h=22, name='t'):
        """Header band plus fillable cells. Returns y below the table."""
        c = self.c
        tw = sum(widths)
        c.setFillColor(BURG); c.rect(x, y_top - 20, tw, 20, stroke=0, fill=1)
        c.setFillColor(CREAM); c.setFont('BodyB', 10)
        cx = x
        for h_, w_ in zip(headers, widths):
            c.drawString(cx + 5, y_top - 14, h_); cx += w_
        y = y_top - 20
        for r in range(rows):
            y -= row_h; cx = x
            for ci, w_ in enumerate(widths):
                self.n += 1; self.fields += 1
                c.acroForm.textfield(name=f'{name}{self.n}', tooltip=f'{headers[ci]}, row {r + 1}', x=cx, y=y, width=w_, height=row_h, borderStyle='solid', borderColor=SOFT, fillColor=CREAM if r % 2 else IVORY, textColor=INK, fontName='Helvetica', fontSize=9.5, borderWidth=.6, forceBorder=True)
                cx += w_
        return y - 10
    def table_pre(self, headers, widths, data, x, y_top, row_h=26, name='tp', blank_rows=0, size=9.5):
        """Header band plus rows whose non-empty cells are printed text and whose empty cells are fillable."""
        from reportlab.pdfbase.pdfmetrics import stringWidth
        c = self.c; tw = sum(widths)
        c.setFillColor(BURG); c.rect(x, y_top - 20, tw, 20, stroke=0, fill=1)
        c.setFillColor(CREAM); c.setFont('BodyB', 10); cx = x
        for h_, w_ in zip(headers, widths):
            c.drawString(cx + 5, y_top - 14, h_); cx += w_
        y = y_top - 20
        for r, row in enumerate(list(data) + [[''] * len(widths)] * blank_rows):
            y -= row_h; cx = x
            for ci, w_ in enumerate(widths):
                txt = row[ci] if ci < len(row) else ''
                c.setFillColor(CREAM if r % 2 else IVORY); c.setStrokeColor(SOFT); c.rect(cx, y, w_, row_h, stroke=1, fill=1)
                if txt:
                    c.setFillColor(INK); c.setFont('Body', size)
                    words, line, lines = txt.split(), '', []
                    for wd in words:
                        t = (line + ' ' + wd).strip()
                        if stringWidth(t, 'Body', size) <= w_ - 10: line = t
                        else: lines.append(line); line = wd
                    if line: lines.append(line)
                    ty = y + row_h - 11 - (0 if len(lines) > 1 else (row_h - 22) / 2 - 1)
                    for l in lines[:3]:
                        c.drawString(cx + 5, ty, l); ty -= size + 1.5
                else:
                    self.n += 1; self.fields += 1
                    c.acroForm.textfield(name=f'{name}{self.n}', tooltip=f'{headers[ci]}, row {r + 1}', x=cx, y=y, width=w_, height=row_h, borderStyle='solid', borderColor=SOFT, fillColor=CREAM if r % 2 else IVORY, textColor=INK, fontName='Helvetica', fontSize=9.5, borderWidth=.6, forceBorder=True)
                cx += w_
        return y - 10
    def numbered(self, title, steps, x, y_top, w):
        h = 30 + 21 * len(steps); self.panel(x, y_top, w, h, title)
        c = self.c
        for i, st in enumerate(steps):
            yy = y_top - 44 - 21 * i
            c.setFillColor(BURG); c.circle(x + 22, yy + 4, 8, stroke=0, fill=1)
            c.setFillColor(CREAM); c.setFont('BodyB', 9.5); c.drawCentredString(x + 22, yy + 1, str(i + 1))
            c.setFillColor(INK); c.setFont('Body', 11); c.drawString(x + 38, yy, st)
        return y_top - h - 12
    def callout(self, title, lines, x, y_top, w):
        h = 30 + 15.5 * len(lines)
        self.panel(x, y_top, w, h, title)
        self.text(lines, x + 14, y_top - 40, 11, 15.5)
        return y_top - h - 12


def _finalize(path):
    """Declare the document language (accessibility) without altering pages or form fields."""
    from pypdf import PdfReader, PdfWriter
    from pypdf.generic import NameObject, TextStringObject
    w = PdfWriter(clone_from=PdfReader(path))
    w._root_object[NameObject('/Lang')] = TextStringObject('en-US')
    with open(path, 'wb') as f: w.write(f)
