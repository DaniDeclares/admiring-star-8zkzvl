"""7-Day Home Reset Kit, edition 3 (draft): the owner's 14-page COMPLETE kit content, rebuilt fillable on the canonical palette."""
import sys
sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from kit_lib import *
out = sys.argv[1]
k = Kit(out, '7-Day Home Reset Kit', 'A seven-day household reset with timers, deep zones and sorting decisions', 'Home Reset Kit'); k.edition = 'Edition 3'
k.cover('7-Day', 'Home Reset Kit', 'A reset you can finish, even when time and energy are limited', 'Fillable on screen. Print-ready. Seven days, deep zones and a sorting page.')

k.header('Start here: a reset you can finish', 'A workable household reset, even when time and energy are limited')
y = k.numbered('Your 7-day plan', ['Day 1: See the whole picture and pick one safe, high-impact win', 'Day 2: Kitchen and groceries', 'Day 3: Laundry and linens', 'Day 4: Bathrooms and supplies',
                                     'Day 5: Bedrooms and shared spaces', 'Day 6: Paperwork and household maintenance', 'Day 7: Review the progress, not perfection'], 48, H - 118, W - 96)
y = k.checklist('How to work the plan', ['Choose a 15-, 30- or 60-minute window before starting', 'Name ONE zone; keep a basket for objects that belong elsewhere', 'Stop when the timer ends, or sooner if rest, children or safety require it',
                                         'Never mix chemicals; follow product-label and material instructions'], 48, y, W - 96)
y = k.callout('Safety first', ['Handle spills, sharp objects, unsafe paths and anything a child can reach before anything else.', 'Seek qualified help for mold, pests, electrical hazards or unknown substances.'], 48, y, W - 96)
k.field('My start date', 48, y - 40, 150); k.field('My usual window (15 / 30 / 60 min)', 215, y - 40, 190)
k.end_page()

def day(label, title, sub, build):
    k.header(f'{label}: {title}', sub); build(); k.end_page()

def d1():
    y = k.para('Pick ONE outcome. You are not committing to cleaning the entire house today.', 48, H - 118, W - 96)
    y = k.table_pre(['Zone', 'What is in the way?', '15-minute win'], [110, 190, 204], [['Kitchen', 'Dishes / counters', 'Clear sink and wipe prep space'], ['Laundry', 'No clean clothes ready', 'Start one essential load'], ['Bathroom', 'Sink / supplies', 'Clear and wipe sink'], ['Entry', 'Shoes / bags', 'Clear safe walking path']], 48, y - 6, 28, 'd1', 2)
    k.field('My focus zone and timer length', 48, y - 36, W - 96); k.field('What will be enough for today?', 48, y - 86, W - 96)
    k.callout('Hazards first', ['Address spills, sharp objects, unsafe paths and anything a child can reach.', 'Seek qualified help for mold, pests, electrical hazards or unknown substances.'], 48, y - 110, W - 96)
day('Day 1', 'See the whole picture', 'Choose one visible win', d1)

def d2():
    y = k.checklist('Kitchen reset order', ['Remove food scraps and trash; manage perishable foods safely', 'Clear and clean the sink; load or wash the essentials', 'Wipe food-prep counters with an appropriate product and label directions',
                                            'Put away groceries and identify items to use soon', 'Sweep a safe walking path; deep-clean only when time permits'], 48, H - 118, W - 96)
    y = k.table_pre(['Time', 'Stopping point'], [110, 394], [['15 min', 'Clear sink and one counter'], ['30 min', 'Above + dishes + trash'], ['60 min', 'Above + floors + one food-storage shelf']], 48, y, 26, 'd2')
    k.area('Grocery / meal / supply notes', 48, y - 80, W - 96, 60)
    k.callout('Reminder', ['Avoid mixing cleaning solutions. Use manufacturer-recommended products on stone, appliances and treated surfaces.'], 48, y - 110, W - 96)
day('Day 2', 'Kitchen and groceries', 'Choose the shortest safe path to food prep and a usable sink', d2)

def d3():
    y = k.checklist('Laundry that leads to usable clothes', ['Pick urgent items first: work uniforms, school clothes, towels or bedding', 'Gather and sort using garment-care labels; check pockets', 'Start ONE load that you can realistically finish',
                                                          'Set an alarm to move it along, then fold or stage it in one zone', 'Refresh linens only as time and energy allow'], 48, H - 118, W - 96)
    y = k.table_pre(['Load', 'Washed', 'Dried', 'Put away'], [220, 95, 95, 94], [['Essentials'], ['Towels / linens'], ['Optional']], 48, y, 28, 'd3')
    k.field('Laundry bottleneck + one fix', 48, y - 36, W - 96)
    k.callout('Reminder', ['Do not leave wet laundry forgotten in appliances; follow fabric and dryer safety labels.'], 48, y - 70, W - 96)
day('Day 3', 'Laundry and linens', 'Start a load you can finish; a mountain of started work is not the goal', d3)

def d4():
    y = k.checklist('Bathroom order of operations', ['Ventilate appropriately and keep supplies away from children and pets', 'Remove clutter, used towels and trash', 'Clean sink, taps and high-touch surfaces using material-safe products',
                                                     'Clean toilet using separate cloths or tools; follow disinfectant contact time', 'Finish with mirror and visible floor path, if time remains'], 48, H - 118, W - 96)
    y = k.table_pre(['Time', 'Goal'], [110, 394], [['15 min', 'Sink and toilet touch points'], ['30 min', 'Above + mirror + trash'], ['60 min', 'Above + tub/shower + floor if safe']], 48, y, 26, 'd4')
    k.area('Missing supplies / next purchase', 48, y - 80, W - 96, 60)
    k.callout('Never mix', ['Never mix bleach with acids, ammonia, vinegar or other cleaners. Use label instructions for every product.'], 48, y - 110, W - 96)
day('Day 4', 'Bathrooms and supplies', 'Target touch points before cosmetic details. Work safely, then stop', d4)

def d5():
    y = k.checklist('A calm sleeping zone', ['Make one bed or clear a safe sleeping surface', 'Put clothes into laundry / keep / elsewhere baskets', 'Clear floor access, exits and tripping hazards',
                                             'Remove dishes or trash; use a carry basket rather than leaving your zone', 'Dust and vacuum only if time allows, following surface-care instructions'], 48, H - 118, W - 96)
    y = k.table_pre(['Zone', 'Small finish line'], [150, 354], [['Main bedroom', 'Bed usable + walking path'], ['Child / guest room', 'Sleeping surface + safe floor'], ['Living area', 'Seating available + trash removed']], 48, y, 26, 'd5')
    k.area('Who can help, and what can wait?', 48, y - 80, W - 96, 60)
    k.callout('Reminder', ['Keep emergency exits clear. Do not handle needles, chemical spills or heavy furniture without proper help.'], 48, y - 110, W - 96)
day('Day 5', 'Bedrooms and routines', 'Make the most important space usable, then pause', d5)

def d6():
    y = k.table_pre(['Handle now', 'File securely', 'Shred / recycle'], [168, 168, 168], [['Time-sensitive forms', 'Receipts / records', 'Unneeded duplicates'], ['Urgent reminders', 'Maintenance documents', 'Non-sensitive waste']], 48, H - 118, 28, 'd6', 1)
    y = k.checklist('Maintenance scan', ['Check for obvious leaks, loose obstacles, broken lights or safety concerns', 'Log issues and contact an appropriate qualified provider if needed', 'Record due dates; do not improvise electrical, plumbing or structural repairs'], 48, y - 6, W - 96)
    k.area('Important date / contact / next action', 48, y - 80, W - 96, 60)
    k.callout('Privacy', ['Store personal records securely. This planner is not a safe place for passwords, access codes or financial account numbers.'], 48, y - 110, W - 96)
day('Day 6', 'Paperwork and maintenance', 'Contain the paper pile without turning it into a full filing-system project', d6)

def d7():
    y = k.table_pre(['Day', 'Visible win', 'Time spent', 'Next step'], [50, 200, 90, 164], [[str(i)] for i in range(1, 8)], 48, H - 118, 26, 'd7')
    k.area('What worked well?', 48, y - 70, W - 96, 50); k.area('One routine worth repeating next week', 48, y - 140, W - 96, 50)
    k.callout('Reminder', ['A realistic success is a safer, more usable home, not a picture-perfect room. Repeat difficult zones later.'], 48, y - 170, W - 96)
day('Day 7', 'Review and repeat', 'Mark what became easier and design a repeatable routine', d7)

k.header('Deep zones and priorities', 'Two tools that slot into your seven-day reset')
y = k.numbered('How to use them', ['Short on time? Start with the priority grid (next page)', 'Give each day one deep zone, and stay inside its borders until it is done', 'Write the zone on your reset day using the map below'], 48, H - 118, W - 96)
y = k.table_pre(['Reset day', 'Deep zone', 'Who', 'Done'], [90, 244, 100, 70], [['Day %d' % i] for i in range(1, 8)], 48, y, 26, 'dz')
k.checklist('Remember', ['One zone per day, no border crossing', 'Skip any task outside your home\'s needs'], 48, y, W - 96)
k.end_page()

k.header('Priority grid', 'Sort tasks by how much they change the room and how much anyone will notice')
qw = (W - 96 - 14) / 2
for i, (t, d) in enumerate([('Do first', 'High impact, easy to see: dishes, counters, floors in main rooms, trash.'), ('Do next', 'High impact, out of sight: fridge clean-out, bathroom scrub, laundry backlog.'),
                            ('Quick wins', 'Low effort, easy to see: pillows, drop zone, one surface cleared.'), ('Can wait', 'Low impact, out of sight: closets, drawers, garage shelves.')]):
    x = 48 + (i % 2) * (qw + 14); yt = H - 118 - (i // 2) * 250
    k.panel(x, yt, qw, 236, t); k.para(d, x + 14, yt - 38, qw - 28, 10.5, 14)
    k.area('', x + 14, yt - 224, qw - 28, 110)
k.field('Time I have today', 48, H - 650, 200); k.field('My top three from "Do first"', 265, H - 650, W - 313)
k.callout('Reminder', ['Stop when the time is up. Move "Can wait" items to next week, guilt-free.'], 48, H - 690, W - 96)
k.end_page()

def deep(label, title, sub, items):
    k.header(f'{label}: {title}', sub)
    k.field('Reset day', 48, H - 135, 140); k.field('Time set aside', 205, H - 135, 140); k.field('Who', 362, H - 135, 188)
    y = k.checklist(f'{title.split(" deep")[0]} checklist', items, 48, H - 168, W - 96)
    k.checklist('Remember', ['Follow product labels and appliance instructions', 'Done is done, even if it isn\'t perfect'], 48, y, W - 96)
    k.area('Notes', 48, 80, W - 96, 90); k.end_page()
deep('Deep zone A', 'Kitchen deep clean', 'Work top to bottom, left to right, so crumbs only fall on surfaces you haven\'t cleaned yet',
     ['Empty the fridge one shelf at a time and toss expired food', 'Wipe fridge shelves and drawers', 'Wipe inside the microwave', 'Clean the oven door glass and seal area (per manufacturer)', 'Run a dishwasher cleaning cycle (per manufacturer)', 'Wipe cabinet fronts and handles',
      'Dust the top of the fridge and upper cabinets', 'Degrease the backsplash and stovetop', 'Scrub the sink and faucet', 'Wipe baseboards', 'Sweep and mop, including under the edges of appliances'])
deep('Deep zone B', 'Bathroom deep clean', 'Ventilate the room and never mix cleaning products',
     ['Clear every surface first', 'Scrub shower and tub walls and fixtures', 'Squeegee or dry glass doors', 'Clean the sink basin, faucet and handles', 'Clean the toilet bowl, seat, outside and base', 'Polish the mirror',
      'Wipe light switches, door handles and towel bars', 'Wash bath mats, shower curtain or liner and hand towels', 'Empty and wipe the trash can', 'Clean the floor, edges and behind the door'])
deep('Deep zone C', 'Living and sleeping spaces deep clean', 'Clear first, dust second, floors last',
     ['Clear nightstands and coffee tables of papers and clutter', 'Strip, wash and remake the bed', 'Rotate or flip the mattress if the maker allows', 'Dust ceiling fan blades and light fixtures', 'Dust blinds and window sills', 'Wipe screens with a dry microfiber cloth',
      'Wipe switches, remotes and door handles', 'Vacuum under the bed and couch and behind light furniture', 'Vacuum or mop all floors', 'Return out-of-place items to their rooms'])

k.header('Keep / donate / toss', 'A short sorting worksheet to use with the seven-day zone plan')
y = k.table(['Item / space', 'Keep', 'Donate', 'Toss', 'Next action'], [180, 50, 60, 50, 164], 11, 48, H - 118, 28, 'kdt')
k.callout('Safety', ['Handle medicines, chemicals, batteries and electronics under local disposal guidance. Do not donate unsafe items.'], 48, y, W - 96)
k.end_page()

k.header('Usage and safety', 'Please read before you use the kit')
k.text(['Practical tools, not guaranteed outcomes. Original planning templates. Not safety, health or professional advice.', '',
        'Follow product labels and safety data sheets. Never mix cleaning chemicals. Ventilate while you clean.',
        'Keep cleaners away from children and pets. Ask a professional about mold, pests, electrical or structural problems.',
        'Do not write passwords, access codes or financial account numbers in this kit.', '',
        'License: one purchasing household may print and adapt for its own use.',
        'Redistribution or resale of template files is not permitted.',
        'The DANI DECLARES name and brand may not be used to represent your business.'], 48, H - 130)
k.end_page()
print('pages', k.page, 'fields', k.fields)
k.save()
