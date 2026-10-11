"""7-Day Home Reset Kit, edition 2 (draft)."""
import sys
sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from kit_lib import *
out = sys.argv[1]
k = Kit(out, '7-Day Home Reset Kit', 'Seven short daily resets with fillable checklists', 'Home Reset Kit')
k.cover('7-Day', 'Home Reset Kit', 'One focused area a day. Twenty to forty minutes.', 'Fillable on screen. Print-ready. A day-by-day plan, a weekly rhythm and a progress tracker.')

k.header('How the reset works', 'Seven days, one area a day, a calmer home at the end')
y = k.para('Each day has one focus area, a time target and three short steps: clear, clean, finish. You are not trying to deep clean the whole home. You are resetting what you use every day so it stays easy to keep up.', 48, H - 120, W - 96)
y = k.callout('Ground rules', ['Set a timer for the time target. When it rings, finish your current task and stop. A stopped reset still counts.',
                                 'Do the "clear" step first. Surfaces you can see clean faster and stay clean longer.',
                                 'Never mix cleaning products. Read the label, ventilate, and test a new product on a small hidden spot.',
                                 'Put things where they live. If something has no home, put it in the "decide" box and choose on Day 6.'], 48, y - 8, W - 96)
y = k.checklist('Choose your start', ['I picked my seven days (they can be any seven days in a row)', 'I set a daily time slot that I will protect', 'I put the supplies from the next page in one caddy', 'I told the people I live with which area is each day\'s focus'], 48, y, W - 96)
k.field('Start date', 48, y - 40, 130); k.field('Daily time slot', 195, y - 40, 150); k.field('Who is helping', 360, y - 40, 190)
k.end_page()

k.header('Before you start', 'A quick snapshot and a basic supply list')
y = k.table(['Area', 'Rating today (1 to 5)', 'What bothers me most'], [130, 130, 244], 7, 48, H - 120, 26, 'snap')
k.text(['1 = needs a lot, 5 = already good. You will rate again on the last page.'], 48, y - 4, 10.5)
y = k.checklist('Basic supplies (use what you already own)', ['Trash bags', 'Microfiber cloths or rags', 'All-purpose cleaner you already use safely', 'Glass cleaner or vinegar-water spray',
                                                              'Dish soap and a sponge or brush', 'Broom, dustpan, vacuum', 'Mop or floor cloth and bucket', 'Laundry basket and a "decide" box', 'Gloves'], 48, y - 30, W - 96, 2)
k.field('My reason for doing this reset', 48, y - 40, W - 96)
k.end_page()

days = [
 ('Day 1', 'Entry and living areas', '30 minutes', ['Clear: return stray items to their homes; collect trash and recycling', 'Clear: stack mail, papers and small items in one box', 'Clean: dust surfaces top to bottom', 'Clean: wipe tables, remote controls and light switches', 'Finish: fluff pillows, fold throws, straighten the entry shoes'], 'Take a "before" photo of the room only if you want one, and only of your own space.'),
 ('Day 2', 'Kitchen', '40 minutes', ['Clear: put away dishes and empty the sink', 'Clear: check the fridge and toss what has expired', 'Clean: wipe counters, stovetop and the outside of appliances', 'Clean: scrub the sink and run the drain with hot water', 'Finish: take out the trash, set a clean towel out, plan tomorrow\'s meals'], 'Remove expired food only. Keep the rest where it is today.'),
 ('Day 3', 'Bathrooms', '30 minutes', ['Clear: put away products you do not use daily', 'Clean: spray surfaces and let the product sit as the label says', 'Clean: scrub sink, tub or shower and toilet with separate cloths', 'Clean: wipe the mirror and the faucet handles', 'Finish: fresh towels, empty trash, restock tissue and soap'], 'Use one product at a time. Do not mix cleaners, especially anything with bleach.'),
 ('Day 4', 'Bedrooms and laundry', '40 minutes', ['Clear: gather clothes from the floor and chairs into the basket', 'Clear: clear the nightstand and the top of the dresser', 'Clean: change the sheets and start a load of laundry', 'Clean: dust the headboard and the lamps', 'Finish: make the bed, put away what is clean, close the closet'], 'Start with the load that has been waiting longest.'),
 ('Day 5', 'Floors and surfaces', '40 minutes', ['Clear: pick up what is on the floor so you can reach the floor', 'Clean: vacuum or sweep from the far corner toward the door', 'Clean: damp-mop hard floors with a product safe for that floor', 'Clean: spot-clean the walls, door frames and baseboards you notice', 'Finish: shake out the entry mats and put the cleaning tools away'], 'Check the flooring manufacturer\'s cleaning guidance if you are unsure.'),
 ('Day 6', 'Paper, digital and errands', '30 minutes', ['Clear: sort the mail box into act, file and recycle', 'Clear: decide on the "decide" box items: keep, donate or toss', 'Clean: write down bills and due dates in one place', 'Clean: clear your phone photos or desktop for ten minutes', 'Finish: list errands and put the first one on tomorrow\'s calendar'], 'Shred papers with account numbers or personal details.'),
 ('Day 7', 'Reset and rhythm', '30 minutes', ['Clear: walk through every area and put away anything out of place', 'Clean: touch up the one area that needs it most', 'Clean: take out all the trash and recycling', 'Finish: fill out the weekly rhythm page', 'Finish: do the "after" ratings and write down your wins'], 'Celebrate the seven days. Keep the rhythm small enough to repeat.'),
]
for i, (d, area_, mins, steps, tip) in enumerate(days):
    k.header(f'{d}: {area_}', f'Time target: {mins}')
    y = k.checklist('Today\'s steps', steps, 48, H - 118, W - 96)
    y = k.callout('Tip', [tip], 48, y, W - 96)
    k.field('Start time', 48, y - 40, 110); k.field('Minutes spent', 175, y - 40, 110); k.field('Done today (1 to 5)', 300, y - 40, 120)
    k.area('Today\'s win', 48, y - 150, W - 96, 60)
    k.area('Notes for tomorrow', 48, y - 250, W - 96, 70)
    k.end_page()

k.header('Weekly rhythm', 'Keep it up with small repeating habits')
y = k.checklist('Ten-minute daily habits (choose three)', ['Dishes done and sink empty before bed', 'One surface cleared (counter or table)', 'One load of laundry started or finished', 'Trash out when full', 'Quick sweep of the busiest floor', 'Tomorrow\'s plan set out'], 48, H - 118, W - 96, 2)
y = k.table(['Day', 'My focus (15 to 30 min)', 'Done'], [90, 330, 84], 7, 48, y - 10, 26, 'rhy')
k.field('My weekly reset day and time', 48, y - 40, 250)
k.end_page()

k.header('Progress tracker', 'See what changed')
y = k.table(['Area', 'Before (1 to 5)', 'After (1 to 5)', 'What improved'], [130, 90, 90, 194], 7, 48, H - 120, 26, 'prog')
k.area('My three biggest wins', 48, y - 90, W - 96, 70)
k.area('What I will keep doing', 48, y - 185, W - 96, 70)
k.field('Next reset date', 48, y - 235, 150)
k.end_page()

k.header('Usage and safety', 'Please read before you use the kit')
k.text(['Original planning templates. Customize for your household. Not safety, health or professional advice.', '',
        'Follow product labels and safety data sheets. Never mix cleaning chemicals. Ventilate while you clean.',
        'Keep cleaners away from children and pets. Ask a professional about mold, pests, electrical or structural problems.',
        'Photograph only your own space. Do not post photos that show addresses, documents or other people.', '',
        'License: one purchasing household may print and adapt for its own use.',
        'Redistribution or resale of template files is not permitted.',
        'The DANI DECLARES name and brand may not be used to represent your business.'], 48, H - 130)
k.end_page()
print('pages', k.page, 'fields', k.fields)
k.save()
