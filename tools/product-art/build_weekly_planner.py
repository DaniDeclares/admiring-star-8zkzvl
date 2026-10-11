"""Small Business Weekly Operations Planner, edition 2 (draft). Sales-to-cash tracker for service businesses."""
import sys
sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from kit_lib import *
out = sys.argv[1]
k = Kit(out, 'Small Business Weekly Operations Planner', 'Printable and fillable sales-to-cash planner for service businesses', 'Weekly Operations Planner')
c = k.c
k.cover('Weekly', 'Operations Planner', 'A practical sales-to-cash tracker for service businesses', 'Fillable on screen. Print-ready. Nine worksheets, a worked week and a monthly roll-up.')

# 2 How to use
k.header('How to use this planner', 'A 15-minute daily rhythm and one weekly review')
y = k.text(['Print a set of pages for each week, or type into the fields on screen and save a copy per week. The companion',
            'spreadsheet totals your numbers and shows your rates automatically.'], 48, H - 120)
y = k.text(['THE WEEKLY RHYTHM'], 48, y - 10, 12, 16, 'BodyB')
y = k.para('Monday (30 min): set the cash focus, list the jobs booked, pick your three priorities.', 60, y - 2, W - 120)
y = k.para('Every working day (15 min): log new inquiries, send quotes, follow up where you have permission, record payments received.', 60, y, W - 120)
y = k.para('Friday (30 min): complete the weekly performance review and plan next week.', 60, y, W - 120)
y = k.callout('Worked example (illustration only: not a target, price list or earnings claim)', [
    '12 inquiries came in; 8 were a fit for your services; 5 quotes went out; 3 were accepted.',
    'Quote win rate: 3 / 5 = 60 percent.   Invoiced this week: $950.   Collected this week: $780.',
    'Collection rate: 780 / 950 = 82 percent. $170 is outstanding and goes on the follow-up list.',
    'Average accepted job: $950 / 3 = $316.67. Count money received, not promises or leads.'], 48, y - 8, W - 96)
y = k.checklist('Ground rules', ['Count cash actually received, never leads or verbal yeses', 'Contact people only where you have their permission', 'Write the agreed scope down before work starts',
                                  'No extra work or charges until the customer approves in writing', 'Record who did the work and what proof you have'], 48, y, W - 96)
k.end_page()

# 3 Cash scoreboard
k.header('1. Weekly cash scoreboard', 'Track money actually received, not just leads or promises')
k.field('Week of', 48, H - 135, 150); k.field('Collection target for the week ($)', 215, H - 135, 170); k.field('Collected so far ($)', 400, H - 135, 150)
k.field('Invoiced this week ($)', 48, H - 185, 150); k.field('Invoices awaiting payment ($)', 215, H - 185, 170); k.field('Cash needed for costs this week ($)', 400, H - 185, 150)
y = k.table(['Day', 'Received from', 'Amount ($)', 'Method', 'Invoice / job #'], [70, 190, 80, 80, 100], 9, 48, H - 215, 24, 'cash')
y = k.callout('By hand', ['Collection rate = collected / invoiced x 100.   Gap to target = target - collected.', 'If the gap is positive on Wednesday, review the Invoices & collections sheet first.'], 48, y, W - 96)
k.area('Cash focus for the week (one sentence)', 48, y - 80, W - 96, 60)
k.end_page()

# 4 Leads
k.header('2. Lead and follow-up tracker', 'Record only contacts with appropriate outreach permission')
k.field('Highest-priority buyer this week', 48, H - 135, 250); k.field('Next follow-up step and date', 315, H - 135, 235)
y = k.table(['Name / business', 'Source', 'OK to contact?', 'Last touch', 'Next step', 'Date'], [130, 80, 70, 70, 120, 62], 11, 48, H - 165, 24, 'lead')
y = k.callout('Permission first', ['Follow up only with people who asked for contact or agreed to it. Note do-not-contact requests here and honor them.', 'A comment, like or follow is interest in your page, not a request to be sold to.'], 48, y, W - 96)
k.end_page()

# 5 Quotes
k.header('3. Quote tracker', 'Every quote gets a number, a scope and a follow-up date')
y = k.table(['Quote #', 'Customer', 'Service / package', 'Price ($)', 'Sent', 'Status', 'Decide by'], [50, 100, 120, 60, 55, 65, 50], 11, 48, H - 120, 24, 'quote')
y = k.checklist('Before you send a quote', ['Scope written: what is included and what is not', 'Price covers labor, supplies, travel and your margin target', 'Deposit and payment terms stated', 'Date, time window and who will do the work confirmed',
                                              'Change process stated: extras need written approval and are priced separately'], 48, y, W - 96)
k.end_page()

# 6 Quote to delivery
k.header('4. Quote-to-delivery checklist', 'Confirm scope, price, labor time and who will do the work before you start')
k.field('Service or package', 48, H - 135, 250); k.field('Scope confirmed by (name, date)', 315, H - 135, 235)
k.field('Deposit / payment status', 48, H - 185, 250); k.field('Job identifier', 315, H - 185, 235)
y = k.checklist('Booking', ['Customer approved scope and price in writing', 'Deposit or payment arrangement confirmed', 'Date and time window on the calendar', 'Access method agreed (no permanent codes written here)'], 48, H - 215, W - 96)
y = k.checklist('Preparation', ['Supplies and equipment listed and packed', 'Helper or provider assigned and briefed', 'Photo permission asked and recorded', 'Reminder sent where the customer agreed to messages'], 48, y, W - 96)
y = k.checklist('Day of service', ['Arrival confirmed', 'Work matches the written scope', 'Anything new documented and approved before doing it', 'Final walkthrough offered'], 48, y, W - 96)
k.end_page()

# 7 Job board
k.header('5. Weekly job board', 'See the whole week at a glance')
y = k.table(['Day', 'Job / customer', 'Time', 'Assigned to', 'Status'], [60, 190, 70, 110, 80], 14, 48, H - 120, 28, 'job')
k.text(['Status ideas: booked, confirmed, in progress, done, QA passed, invoiced, paid.'], 48, y - 6, 10.5)
k.end_page()

# 8 Fulfillment & QA
k.header('6. Fulfillment and quality review', 'Confirm who did the work, record proof and follow up')
k.field('Job identifier', 48, H - 135, 150); k.field('Completed by', 215, H - 135, 170); k.field('Date completed', 400, H - 135, 150)
k.field('QA result and by whom', 48, H - 185, 250); k.field('Customer follow-up permission (yes / no)', 315, H - 185, 235)
y = k.checklist('Quality check', ['Every item in the written scope done', 'Photos or other proof saved, with permission', 'Exceptions and incomplete items disclosed', 'Customer walkthrough or confirmation received'], 48, H - 215, W - 96)
k.area('Issues found and how they were fixed', 48, y - 90, W - 96, 70)
k.area('Customer feedback (their words, only if they agreed to share)', 48, y - 185, W - 96, 70)
k.end_page()

# 9 Invoices
k.header('7. Invoices and collections', 'Get paid for finished work, and see cash at risk')
y = k.table(['Invoice #', 'Customer', 'Amount ($)', 'Sent', 'Due', 'Paid on', 'Notes'], [55, 110, 65, 55, 55, 55, 98], 12, 48, H - 120, 24, 'inv')
y = k.callout('Collections routine', ['Day 0: send the invoice. Day before due: friendly reminder (if the customer agreed to messages).', 'Past due: call once, record what was said, and agree a date. Escalate only through your own written terms.'], 48, y, W - 96)
k.field('Total outstanding ($)', 48, y - 40, 150); k.field('Oldest unpaid (days)', 215, y - 40, 150)
k.end_page()

# 10 Weekly review
k.header('8. Weekly performance review', 'Count qualified inquiries, quotes, collections and completed jobs')
k.field('Week of', 48, H - 135, 150); k.field('Qualified inquiries', 215, H - 135, 120); k.field('Quotes sent', 350, H - 135, 90); k.field('Quotes accepted', 455, H - 135, 95)
k.field('Payments collected ($)', 48, H - 185, 150); k.field('Completed jobs that passed your quality check', 215, H - 185, 335)
k.field('Quote win rate % (accepted / sent x 100)', 48, H - 235, 250); k.field('Collection rate % (collected / invoiced x 100)', 315, H - 235, 235)
k.area('What worked this week', 48, H - 330, W - 96, 70); k.area('What to change', 48, H - 425, W - 96, 70)
k.area('Top three priorities for next week', 48, H - 520, W - 96, 70)
k.end_page()

# 11 Monthly
k.header('9. Monthly roll-up', 'Four weeks on one page')
y = k.table(['Measure', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Month'], [170, 70, 70, 70, 70, 70], 9, 48, H - 120, 26, 'mon')
k.para('Measures to enter: qualified inquiries, quotes sent, quotes accepted, invoiced ($), collected ($), jobs passing QA, hours worked, supplies cost ($), travel cost ($).', 48, y - 4, W - 96, 10.5)
y2 = k.callout('Read your month', ['Win rate low? Tighten who you quote and how clearly you state scope.', 'Collection rate low? Shorten invoice time and add a deposit.', 'Hours high for the money? Re-price the next quote using actual hours.'], 48, y - 40, W - 96)
k.end_page()

# 12 Usage
k.header('Usage and safety', 'Please read before you use the planner')
k.text(['Original planning templates. Customize for your business. Not legal, safety, tax or professional advice.', '',
        'These worksheets do not replace your contracts, insurance, licenses, accounting records or official records.',
        'Contact people only with their permission and follow the do-not-contact and privacy rules that apply to you.',
        'The worked example is an illustration. It is not a target, a recommended price or an earnings claim.', '',
        'License: one purchasing business or household may print and adapt for its own use.',
        'Redistribution or resale of template files is not permitted.',
        'The DANI DECLARES name and brand may not be used to represent your business.'], 48, H - 130)
k.end_page()
print('pages', k.page, 'fields', k.fields)
k.save()
