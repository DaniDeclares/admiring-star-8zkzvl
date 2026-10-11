"""Home Command Center, edition 2 (draft): preserves every page of the owner's Enhanced PDF, makes it fillable, relabels the
example week as an example, and adds a hard-day plan and a household meeting page."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kit_lib import Kit
from kit_blocks import render
out = sys.argv[1]
k = Kit(out, 'Home Command Center', 'A household rhythm: weekly priorities, daily anchors, zones, care schedules and a weekly review', 'Home Command Center')
k.edition = 'Edition 2 draft'
k.cover('Home', 'Command Center', 'A household rhythm you can actually maintain', 'Fillable on screen. Print-ready. Weekly, monthly and seasonal.')
Z = [['Kitchen'], ['Bathrooms'], ['Bedrooms'], ['Living areas'], ['Laundry'], ['Trash and recycling'], ['Entry and mail'], ['Outdoor / yard'], ['Pets'], ['Groceries and meals']]
pages = [
 dict(title='Getting started', sub='Make household work easier to see, share and repeat', blocks=[
  ('steps', 'Five steps', ['Set your anchors: pick morning and evening anchors you can do on a hard day', 'Name the zones and owners: who looks after each area, so nobody carries it all silently', 'Plan the week: choose up to three priorities, then place appointments and anchors', 'Park the rest: anything not this week goes on the what-can-wait list', 'Review and repeat: ten minutes at the end of the week to keep, change, park or drop']),
  ('note', 'How to use it', 'Print the weekly pages each week and keep the reference pages (zones, monthly and seasonal care, supplies) in a folder or on the fridge. Slip the weekly rhythm into a sheet protector and use a dry-erase marker if you prefer to reuse it. An example week is on page 12.'),
  ('note', 'Keep it safe', 'Keep passwords, alarm codes and account numbers off these pages. Fewer priorities beat a long list.'),
  ('fields', ['Household name or nickname', 'Who will use this planner', 'Week I am starting'], 1)]),
 dict(title='Weekly household rhythm', sub='Choose three priorities and a few daily anchors', blocks=[
  ('fields', ['Week of', 'Priority 1', 'Priority 2', 'Priority 3'], 2),
  ('table', ['Day', 'Appointments and plans', "Who's doing what", 'Anchor done?'], [50, 200, 160, 94], [['Mon'], ['Tue'], ['Wed'], ['Thu'], ['Fri'], ['Sat'], ['Sun']], 0, 38, 'wk'),
  ('note', 'If the week falls apart', 'Do the one thing on the what-can-wait page. Unfinished is information, not failure.')]),
 dict(title='Daily anchors', sub='A short open-up and close-down that holds the house together', blocks=[
  ('check', 'Morning open-up (about 15 minutes)', ['Clear the dish rack or dishwasher', 'Wipe the main kitchen counter', 'Take out trash or recycling if full', 'Reset the entryway drop zone']),
  ('check', 'Evening close-down (about 20 minutes)', ['Sink to zero, or dishes soaking', 'Counters cleared and food put away', 'Five-minute pickup of common areas into one basket', "Tomorrow's keys, bags and shoes by the door"]),
  ('fields', ['Minimum version for a hard day', 'Who leads mornings', 'Who leads evenings'], 1),
  ('area', 'Notes. Cross out what does not fit your home', 50)]),
 dict(title='Zones and roles', sub='Make responsibilities visible', blocks=[
  ('table', ['Zone', 'Owner', 'Backup', 'How often', 'What "done" looks like'], [110, 90, 90, 70, 144], Z, 0, 31, 'zr'),
  ('note', 'Fair share', 'Match jobs to age and ability. Swap roles when someone is overloaded.')]),
 dict(title='Monthly care', sub='Small recurring jobs that stop weekend catch-up marathons', blocks=[
  ('fields', ['Month'], 1),
  ('table', ['Task', 'Owner', 'Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'], [214, 90, 50, 50, 50, 50],
   [['Clean out the fridge and check dates'], ['Wipe inside the microwave'], ['Run a washer or dishwasher cleaning cycle (per maker)'], ['Wash bath mats and shower curtain'], ['Dust ceiling fans, vents and blinds'], ['Vacuum under furniture and cushions'], ['Check smoke and CO alarms (test button)'], ['Restock first-aid basics']], 3, 32, 'mc'),
  ('note', 'Remember', 'Spread tasks across the month. Follow product and appliance instructions.')]),
 dict(title='Seasonal care', sub='Preventive upkeep outside your weekly rhythm', blocks=[
  ('check', 'Spring and summer', ['Replace HVAC filter (or on the filter\'s schedule)', 'Test smoke and CO alarms', 'Check fire extinguisher gauge', 'Check outdoor hoses and spigots for leaks', 'Clear gutters or schedule it', 'Wash windows and screens', 'Rotate seasonal clothes and bedding']),
  ('check', 'Fall and winter', ['Replace HVAC filter', 'Disconnect hoses and protect spigots before freezing weather', 'Check door and window weatherstripping', 'Book heating or chimney service with a qualified pro before first use', 'Replace batteries in alarms and thermostat as needed', 'Clear gutters or schedule it', 'Rotate seasonal clothes and bedding']),
  ('note', 'Remember', 'Hire licensed pros for gas, electrical and roof work. Note the date on the upkeep log when it is done.')]),
 dict(title='Household supplies', sub='Know when to reorder before you run out', blocks=[
  ('table', ['Item', 'Reorder when down to', 'Keep on hand', "Where it's stored"], [150, 120, 100, 134], [['Dish soap'], ['All-purpose cleaner'], ['Laundry detergent'], ['Toilet paper'], ['Paper towels'], ['Trash bags']], 4, 34, 'hs'),
  ('fields', ['Shopping day', 'Who reorders'], 2),
  ('note', 'Remember', 'Buy only what drops below the line. Store cleaning products away from food and kids.')]),
 dict(title='Appointments and upkeep log', sub='Who has to be where, and what was done to the house', blocks=[
  ('table', ['Date and time', 'Who', 'What and where', 'Bring or prep', 'Follow-up'], [80, 70, 150, 110, 94], [], 5, 30, 'ap'),
  ('table', ['Date', 'What was done', 'By', 'Cost', 'Next due'], [70, 190, 90, 60, 94], [], 6, 30, 'up'),
  ('note', 'Remember', 'Keep receipts and warranties together. Keep passwords, alarm codes and account numbers off these pages.')]),
 dict(title='What can wait', sub='Park it on purpose so it stops taking up space in your head', blocks=[
  ('note', 'Items here are safe', 'They are not on this week\'s plan, and that is a choice, not a failure. Review this list once a week and pull one item forward only when there is room.'),
  ('table', ['Parked item', 'Why it waits', 'Revisit on'], [230, 180, 94], [], 9, 30, 'cw'),
  ('fields', ['The one-thing rule: if the week falls apart, cross off everything else and do only this'], 1)]),
 dict(title='The hard-day plan', sub='For sick days, travel, deadlines and low-energy weeks', blocks=[
  ('note', 'Why this page exists', 'Systems fail on the days you need them most. Decide now what the house needs to stay safe and livable, so a hard day does not become a hard week.'),
  ('check', 'The floor (do only these)', ['Food: one simple meal and clean dishes for it', 'Safety: spills, sharp objects, unsafe paths cleared', 'Care: medications, pets and anyone who depends on you', 'Reset: ten-minute pickup into one basket', 'Everything else is parked']),
  ('fields', ['Who covers what on a hard day', 'Who I can ask for help', 'What I will skip without guilt'], 1)]),
 dict(title='Example: one household week', sub='An example showing modest priorities and an adjusted plan', blocks=[
  ('note', 'About this example', 'This is an illustration for teaching. Names and details are invented to show how one household might plan; they are not a real customer. Use it as a pattern, not a promise of results.'),
  ('table', ['Day', 'Appointments and plans', "Who's doing what", 'Anchor done?'], [50, 180, 190, 84],
   [['Mon', 'Work and soccer pickup 5:30', 'J: dinner. A: dishes', 'Yes'], ['Tue', 'Dentist 4:00 (Maya)', 'A: dentist. J: groceries', 'Yes'], ['Wed', 'Nothing scheduled', 'Kids: laundry fold', 'Yes'], ['Thu', 'Late meeting (J)', 'A: evening close-down', 'Partly'], ['Fri', 'Pizza night', 'Everyone: 5-minute pickup', 'Yes'], ['Sat', 'Bathrooms zone (A)', 'J: yard. Kids: rooms', 'Yes'], ['Sun', 'Plan next week, 15 minutes', 'J and A', 'Yes']], 0, 34, 'ex'),
  ('note', 'What they adjusted', 'Thursday ran late, so the evening close-down shrank to "sink to zero" and the rest moved to Friday. Washing the car went on the what-can-wait list instead of the weekend.')]),
 dict(title='Meal and grocery rhythm', sub='Plan a realistic week from what you already have', blocks=[
  ('table', ['Day', 'Meal idea', 'Prep or leftovers', 'Who'], [50, 200, 170, 84], [['Mon'], ['Tue'], ['Wed'], ['Thu'], ['Fri'], ['Sat'], ['Sun']], 0, 30, 'ml'),
  ('table', ['Item', 'Need / on hand', 'Estimated cost', 'Bought'], [200, 130, 100, 74], [], 5, 26, 'gl'),
  ('note', 'Weekly rule', 'Choose a few repeatable meals. Adjust for your household budget, allergies and preferences.')]),
 dict(title='Weekly household meeting', sub='Ten to fifteen minutes, once a week', blocks=[
  ('steps', 'Agenda', ['Appreciate: one thing each person got done', 'Calendar: look at the next seven days together', 'Load: who is carrying too much this week?', 'Decide: pick the three priorities and park the rest']),
  ('fields', ['Date', 'Who attended', 'What we decided', 'What we are parking', 'Who owns each next step'], 1)]),
 dict(title='Review and repeat', sub='Adjust next week without treating unfinished tasks as failure', blocks=[
  ('fields', ['Week of', 'What worked', "What didn't fit", 'Who carried too much', 'One change for next week'], 1),
  ('table', ['Unfinished item', 'Keep', 'Change', 'Park', 'Drop'], [214, 70, 70, 75, 75], [], 5, 28, 'rv')]),
 dict(title='Questions and usage', sub='Read before use', blocks=[
  ('note', 'Who is this for?', 'Households organizing their own home, not professionals managing client engagements or billing.'),
  ('note', 'Is this the 7-Day Home Reset Kit?', 'No. This kit builds repeatable household routines rather than a seven-day reset.'),
  ('note', 'Is this software?', 'No. It is a fillable, printable PDF. Automatic scheduling, syncing, reminders and software integrations are not included. No printed planner is shipped.'),
  ('note', 'Safety and license', 'These worksheets organize household routines; they do not provide professional household-management services. Follow product labels and manufacturer instructions, and use qualified professionals for gas, electrical, roofing and other specialized work. One purchasing household may print and adapt this file for its own use. Redistribution or resale is not permitted. The DANI DECLARES name may not be used to represent your business.')]),
]
render(k, pages)
p, f = k.save(); print(p, 'pages', f, 'fields')
