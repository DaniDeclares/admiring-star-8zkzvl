"""Builds the improved Cleaning Operator Job Kit (printable fillable PDF + editable XLSX). Draft: not approved/published.
Brand colours mirror docs/design/DANI_CANONICAL_BRAND_PALETTE.md (burgundy #800020, ivory #F7F1E6, cream #FFFDF6, gold #B38A2D, soft gold #E8D5B0).
Gold is used only for rules/decoration, never for body text."""
import os, sys
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
pdfmetrics.registerFont(TTFont('Head', os.path.join(HERE, 'fonts/PlayfairDisplay-var.ttf')))
pdfmetrics.registerFont(TTFont('Body', '/usr/share/fonts/truetype/crosextra/Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('BodyB', '/usr/share/fonts/truetype/crosextra/Carlito-Bold.ttf'))
BURG, IVORY, CREAM, GOLD, SOFT, INK = HexColor('#800020'), HexColor('#F7F1E6'), HexColor('#FFFDF6'), HexColor('#B38A2D'), HexColor('#E8D5B0'), HexColor('#2B2320')
W, H = letter
c = canvas.Canvas(OUT, pagesize=letter)
c.setTitle('Cleaning Operator Job Kit'); c.setAuthor('DANI DECLARES LLC'); c.setSubject('Printable and fillable job worksheets for cleaning operators')
page = [0]; fcount = [0]
def bg():
    c.setFillColor(CREAM); c.rect(0, 0, W, H, stroke=0, fill=1)
def footer():
    c.setStrokeColor(SOFT); c.setLineWidth(1); c.line(48, 44, W - 48, 44)
    c.setFillColor(INK); c.setFont('Body', 9)
    c.drawString(48, 30, 'DANI DECLARES LLC  |  Cleaning Operator Job Kit  |  Original planning templates. Not legal, safety, tax or professional advice.')
    c.drawRightString(W - 48, 30, str(page[0]))
def header(title, sub):
    bg(); page[0] += 1
    c.setFillColor(BURG); c.rect(0, H - 86, W, 86, stroke=0, fill=1)
    c.setFillColor(GOLD); c.rect(0, H - 90, W, 4, stroke=0, fill=1)
    c.setFillColor(CREAM); c.setFont('Head', 22); c.drawString(48, H - 48, title)
    c.setFont('Body', 11.5); c.drawString(48, H - 68, sub)
    footer()
def field(label, x, y, w, name, h=17):
    c.setFillColor(INK); c.setFont('BodyB', 10); c.drawString(x, y + h + 3, label)
    fcount[0] += 1
    c.acroForm.textfield(name=name, x=x, y=y, width=w, height=h, borderStyle='underlined', borderColor=SOFT, fillColor=IVORY, textColor=INK, fontName='Helvetica', fontSize=10, borderWidth=1, forceBorder=True)
def area(label, x, y, w, h, name):
    c.setFillColor(INK); c.setFont('BodyB', 10); c.drawString(x, y + h + 3, label)
    fcount[0] += 1
    c.acroForm.textfield(name=name, x=x, y=y, width=w, height=h, borderStyle='solid', borderColor=SOFT, fillColor=IVORY, textColor=INK, fontName='Helvetica', fontSize=10, borderWidth=1, fieldFlags='multiline', forceBorder=True)
def check(label, x, y, name):
    fcount[0] += 1
    c.acroForm.checkbox(name=name, x=x, y=y - 2, size=13, borderColor=BURG, fillColor=IVORY, borderWidth=1.2, forceBorder=True)
    c.setFillColor(INK); c.setFont('Body', 11); c.drawString(x + 21, y + 1, label)
def para(lines, x, y, size=11.5, lead=15.5, font='Body'):
    c.setFillColor(INK); c.setFont(font, size)
    for l in lines:
        c.drawString(x, y, l); y -= lead
    return y
def box(title, items, x, y, w, name):
    c.setFillColor(IVORY); c.setStrokeColor(SOFT); c.roundRect(x, y - 24 - 22 * len(items), w, 24 + 22 * len(items), 8, stroke=1, fill=1)
    c.setFillColor(BURG); c.setFont('BodyB', 11); c.drawString(x + 14, y - 17, title)
    for i, it in enumerate(items): check(it, x + 14, y - 40 - 22 * i, f'{name}_{i}')
    return y - 24 - 22 * len(items)
def sheet(title, sub, n, fields, checks, note, key):
    header(f'{n}. {title}', sub)
    c.setFillColor(INK); c.setFont('Body', 11.5); c.drawString(48, H - 116, note)
    y = H - 168
    for i, f in enumerate(fields):
        if isinstance(f, tuple) and f[0] == 'area':
            area(f[1], 48, y - f[2], W - 96, f[2], f'{key}_{i}'); y -= f[2] + 30
        else:
            field(f, 48, y, W - 96, f'{key}_{i}'); y -= 42
    box('Checkpoints', checks, 48, y - 6, W - 96, f'{key}_chk')
    c.showPage()
# ---- Cover ----
page[0] += 1; bg()
c.setFillColor(BURG); c.rect(0, 0, W, H, stroke=0, fill=1)
c.setFillColor(GOLD); c.rect(60, H - 180, W - 120, 3, stroke=0, fill=1); c.rect(60, 150, W - 120, 3, stroke=0, fill=1)
c.setFillColor(CREAM); c.setFont('BodyB', 13); c.drawCentredString(W / 2, H - 150, 'D A N I   D E C L A R E S')
c.setFont('Head', 44); c.drawCentredString(W / 2, H / 2 + 70, 'Cleaning'); c.drawCentredString(W / 2, H / 2 + 14, 'Operator Job Kit')
c.setFont('Body', 16); c.drawCentredString(W / 2, H / 2 - 36, 'Residential, turnover and office cleaning operations')
c.setFont('Body', 13); c.drawCentredString(W / 2, H / 2 - 80, 'Fillable on screen. Print-ready. Seven worksheets and a worked example.')
c.setFillColor(SOFT); c.setFont('Body', 11); c.drawCentredString(W / 2, 112, 'Edition 2  |  We handle the execution.')
c.showPage()
# ---- How to use + worked example ----
header('How to use this kit', 'From first inquiry to a closed-out job')
y = para(['Work the sheets in order for every job. You can type into the fields on screen and save a copy per job,',
          'or print the pages and fill them by hand. The companion spreadsheet does the pricing arithmetic for you.'], 48, H - 120)
y = para(['THE JOB FLOW'], 48, y - 12, 12, 16, 'BodyB')
steps = ['1  Inquiry and service fit: collect only what you need to estimate safely.',
         '2  Pricing and profit check: confirm the job pays after labor, supplies and travel.',
         '3  Walkthrough and agreed scope: write down rooms in, rooms out, and what is not included.',
         '4  Arrival and supply loadout: bring what the scope needs, confirm authorized access.',
         '5  Room-by-room QA: check only the tasks in the agreed scope; note exceptions.',
         '6  Issue and change record: document anything new; no extra work until it is approved.',
         '7  Completion and follow-up: confirm, close out, and ask for feedback.']
y = para(steps, 60, y - 4)
c.setFillColor(IVORY); c.setStrokeColor(SOFT); c.roundRect(48, y - 190, W - 96, 180, 8, stroke=1, fill=1)
c.setFillColor(BURG); c.setFont('BodyB', 12); c.drawString(62, y - 28, 'Worked example (illustration only: not a price list or an earnings claim)')
para(['Two-bedroom apartment turnover, estimated 3.5 labor hours for one cleaner.',
      'Labor at the rate you choose to pay yourself or a helper: 3.5 h x $22.00 = $77.00.',
      'Supplies used on this job: $9.00.  Travel: 14 miles x $0.67 = $9.38 (use your own mileage rate).',
      'Total cost: $77.00 + $9.00 + $9.38 = $95.38.  Quoted price: $140.00.',
      'Profit: $140.00 - $95.38 = $44.62.  Margin: 44.62 / 140.00 = 31.9 percent.',
      'With a 30 percent margin target this job clears it. If the walkthrough adds a room, re-run the check.'],
     62, y - 50, 11, 15.5)
c.showPage()
# ---- Worksheets ----
sheet('Customer inquiry and service fit', 'Collect only what is needed to estimate safely.', 1,
      ['Lead / reference ID', 'Service requested', 'Location / service area (general area only)', 'Decision-maker', 'Property type and approximate size', 'Preferred date and time window', 'Special surfaces or hazards (pets, fragile items, mold, biohazard)', 'Next action and date'],
      ['Contact consent obtained before any follow-up', 'Do not record permanent entry codes here', 'Decline or refer work outside your skills, insurance or local rules'], 'Complete before quoting.', 's1')
# ---- Pricing sheet (page 4) ----
header('2. Pricing and profit check', 'Make sure the job pays before you agree to it.')
c.setFillColor(INK); c.setFont('Body', 11.5); c.drawString(48, H - 112, 'Type your numbers here, or use the Pricing tab in the companion spreadsheet to calculate automatically.')
rows = [('Estimated labor hours', 'hours'), ('Hourly labor cost (what you pay yourself or a helper)', 'rate'), ('Supplies and consumables for this job', 'supplies'), ('Travel miles (round trip)', 'miles'), ('Mileage rate you use', 'mrate'), ('Other costs (parking, disposal fees)', 'other'), ('Quoted price to customer', 'price')]
y = H - 160
for lab, k in rows:
    field(lab, 48, y, 200, f'p_{k}'); y -= 40
fy = H - 160
c.setFillColor(IVORY); c.setStrokeColor(SOFT); c.roundRect(290, y + 40, W - 338, (H - 160) - y - 10, 8, stroke=1, fill=1)
c.setFillColor(BURG); c.setFont('BodyB', 11); c.drawString(304, H - 138, 'Calculate by hand')
para(['Labor = hours x hourly cost', 'Travel = miles x mileage rate', 'Total cost = labor + supplies + travel + other', 'Profit = price - total cost', 'Margin % = profit / price x 100', 'Your margin target: ________ %'], 304, H - 160, 11, 18)
y -= 14
field('Total cost', 48, y, 130, 'p_total'); field('Profit', 200, y, 130, 'p_profit'); field('Margin %', 352, y, 130, 'p_margin'); y -= 54
box('Decision', ['Margin meets my target: go ahead', 'Below target: re-scope or re-price before agreeing', 'Not worth taking: decline politely'], 48, y, W - 96, 's2d')
c.showPage()
sheet('Walkthrough and agreed scope', 'Confirm rooms, exclusions, supplies and change control.', 3,
      ['Job ID', 'Areas included', 'Areas excluded', 'Top three priorities', 'Products permitted (customer preferences or allergies)', 'Estimated labor', 'Quote reference', 'Customer scope approval (name, date, how confirmed)'],
      ['No additions without approval', 'Price still covers costs and margin', 'Photos only with client permission'], 'Complete at the walkthrough, before work starts.', 's3')
header('4. Arrival and supply loadout', 'Prepare for the scheduled job.')
y = H - 140
for i, f in enumerate(['Job ID', 'Cleaner(s) assigned', 'Arrival window', 'Site contact method', 'PPE and safety considerations']):
    field(f, 48, y, W - 96, f's4_{i}'); y -= 42
items = ['All-purpose cleaner', 'Disinfectant (surfaces)', 'Glass cleaner', 'Microfiber cloths (color-coded)', 'Mop and bucket / flat mop', 'Vacuum and attachments', 'Gloves and PPE', 'Trash bags', 'Scrub brushes and sponges', 'Step stool', 'Spare supplies for restock gaps', 'Photo device charged']
c.setFillColor(IVORY); c.setStrokeColor(SOFT); c.roundRect(48, y - 8 - 22 * 6 - 6, W - 96, 22 * 6 + 28, 8, stroke=1, fill=1)
c.setFillColor(BURG); c.setFont('BodyB', 11); c.drawString(62, y + 6, 'Supply and equipment loadout')
for i, it in enumerate(items): check(it, 62 + (i % 2) * 250, y - 16 - 22 * (i // 2), f's4_l{i}')
y -= 22 * 6 + 24
box('Checkpoints', ['Verify authorized access', 'Escalate unsafe conditions', 'Equipment checked before leaving'], 48, y, W - 96, 's4c')
c.showPage()
sheet('Room-by-room cleaning QA', 'Check only tasks included in the agreed scope.', 5,
      ['Kitchen', 'Bathrooms', 'Bedrooms / offices', 'Common areas', 'Floors', 'Touchpoints (handles, switches, rails)', 'Exceptions / incomplete items', 'Photo evidence reference'],
      ['Photos only with client permission', 'QA before marking complete', 'Exceptions reported to the customer'], 'Record the result for each area as you finish it.', 's5')
sheet('Issue and change record', 'Document issues; promise no extra work until it is approved.', 6,
      ['Issue ID', 'Observed condition', 'Time observed', 'Customer notified via', 'Requested change', 'Approval reference', 'Cost impact', 'Resolution'],
      ['No automatic additional charge', 'Preserve original scope', 'Re-run the Pricing and profit check if scope grows'], 'Use one sheet per issue.', 's6')
sheet('Completion and follow-up', 'Close out the job and keep the relationship.', 7,
      ['Job ID', 'Completed date and time', 'Final walkthrough with (name)', 'Customer-reported concerns', 'Actual labor hours', 'Actual supplies cost', 'Follow-up date', ('area', 'Notes for the next visit (preferences, access method, no codes)', 60)],
      ['Final QA complete and exceptions disclosed', 'Payment confirmed through the agreed method', 'Feedback requested only if the customer agreed to be contacted', 'Estimate compared with actual time for next quote'], 'Complete within a day of finishing.', 's7')
header('Usage and safety', 'Please read before you use the kit.')
para(['Original planning templates. Customize for your business. Not legal, safety, tax or professional advice.', '',
      'These worksheets do not replace your contracts, insurance, licenses or official records.',
      'Follow product labels and safety data sheets. Never mix cleaning chemicals. Use PPE that fits the task.',
      'Photograph a customer\'s property only with permission. Do not record permanent access codes in this kit.',
      'The worked example is an illustration. It is not a recommended price, rate or earnings claim.', '',
      'License: one purchasing business or household may print and adapt for its own use.',
      'Redistribution or resale of template files is not permitted.',
      'The DANI DECLARES name and brand may not be used to represent your business.'], 48, H - 130)
c.showPage()
c.save()
print('pages', page[0], 'fields', fcount[0])
