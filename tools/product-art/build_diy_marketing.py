"""DIY Marketing Starter Kit, edition 2 (draft): rebuilt from the owner's COMPLETE 17-page kit. Fillable, worked examples
labelled as examples, no bracket placeholders, no internal wording."""
import sys, os, json, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kit_lib import Kit
from kit_blocks import render
out = sys.argv[1]
k = Kit(out, 'DIY Marketing Starter Kit', 'A seven-day, consent-first marketing plan for a local service business', 'DIY Marketing Starter Kit')
k.edition = 'Edition 2 draft'
k.cover('DIY Marketing', 'Starter Kit', 'Seven days to one clear offer and real conversations', 'Fillable on screen. Print-ready. No spam, no invented proof.')

CAPS = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data_diy/diy_captions.json')))
def cap_blocks(c):
    brs = re.findall(r'\[([^\]]+)\]', c['copy'])
    n = [0]
    def mark(m):
        n[0] += 1; return f'({n[0]})'
    text = re.sub(r'\[([^\]]+)\]', mark, c['copy'])
    text = text.replace('fictional', 'invented')
    blocks = [('note', f"{c['n']}. {c['title']}  ({c['kind']}, {c['topic']})", text, 10.4, 13.6)]
    if brs:
        rows = [[f'({i + 1}) ' + (b[0].upper() + b[1:]).rstrip('.').replace('Insert your own', 'Add your own').replace('Insert a', 'Add a').replace('fictional', 'invented')] for i, b in enumerate(brs)]
        blocks.append(('table', ['What goes in the numbered gap', 'My answer'], [236, 268], rows, 0, 22, f'cap{c["n"]}', 9.2))
    else:
        blocks.append(('fields', ['Adapt this for my business (one change I will make)'], 1))
    return blocks
CAP_PAGES = []
SPANS = [(0, 3), (3, 5), (5, 7), (7, 9), (9, 11), (11, 13), (13, 15)]
for pi, (lo, hi) in enumerate(SPANS, 1):
    blocks = []
    for c in CAPS[lo:hi]: blocks += cap_blocks(c)
    kinds = ' and '.join(sorted({c['kind'].lower() for c in CAPS[lo:hi]}))
    CAP_PAGES.append(dict(title=f'Caption library {lo + 1}-{hi}', sub=f'Page {pi} of {len(SPANS)}. Fill every numbered gap with true facts ({kinds})', blocks=blocks))

EX = 'Worked example: a home-cleaning business. Replace every example with your own facts.'
pages = [
 dict(title='Start here', sub='A seven-day plan for a local service business', blocks=[
  ('note', 'What you will do', 'Pick one service, describe the customer problem it solves, plan three posts, have a few permitted conversations, and record what actually happened. Seven short sessions of 20-40 minutes.'),
  ('steps', 'Your seven days', ['Day 1  One offer: say what you sell and to whom in one sentence', 'Day 2  Customer language: collect real questions and objections', 'Day 3  Proof you are allowed to use: photos, results, permissions', 'Day 4  Publish one post: teach, show or offer', 'Day 5  Conversations with people who asked or agreed to hear from you', 'Day 6  Follow up on requested estimates only', 'Day 7  Count real results and choose one change']),
  ('note', 'What this kit does not do', 'It does not promise leads, rankings, sales, or income. Results depend on your service, area, price, timing and effort. Never invent reviews, expose a client or their home without permission, send bulk unsolicited messages, or advertise a service you cannot deliver right now.'),
  ('fields', ['My business', 'The one service I will promote', 'My start date'], 1)]),
 dict(title='Day 1: one offer, one customer', sub='Start narrow so a stranger understands you in one sentence', blocks=[
  ('note', EX, 'Service: standard home cleaning, up to 3 bedrooms.  Who: busy households and landlords prepping a move-out.  Area: the zip codes I can reach in under 30 minutes.  Price: from a stated starting price, final quote after a scope check.  Contact: the request form on my site.'),
  ('fields', ['Service or result I can actually deliver now', 'Who needs it and why', 'Service area and limits (zip codes or distance)', 'Starting price, or "quote after scope check"', 'Where a customer should contact me'], 1),
  ('area', 'Proof I may share (with permission only)', 52),
  ('area', 'One-sentence offer: "I help ___ with ___ by ___."', 52)]),
 dict(title='Day 2: customer-language research', sub='Write down what real people say. Do not guess demand', blocks=[
  ('note', 'How to use this page', 'Use comments, direct questions, past customer messages, and public local discussions you are allowed to read. Copy the words people use, not your own summary. Skip anything private or posted in a group whose rules forbid it.'),
  ('table', ['Where I heard it', 'What the customer said', 'Need or objection', 'Permitted next step'], [105, 170, 120, 109],
   [['Example: question on my page', 'Do you bring your own supplies?', 'Wants to know what is included', 'Answer in a post']], 7, 30, 'cl'),
  ('area', 'The three phrases I keep seeing', 56)]),
 dict(title='Day 3: proof you are allowed to use', sub='Honest, permitted, specific', blocks=[
  ('check', 'Before any photo, testimonial or result goes public', ['I took the photo myself or hold a license to use it', 'The customer agreed in writing (text or email counts) to this exact use', 'No faces, addresses, plates, documents or children appear', 'The caption describes only what the photo shows (one room is not "the whole house")', 'I removed or blurred anything private', 'I can show the date and scope if asked']),
  ('table', ['Proof item', 'Source', 'Permission on file? (Y/N)', 'Where I may use it'], [150, 110, 110, 134], [], 6, 28, 'pf'),
  ('note', 'If you have no proof yet', 'Use a clearly labeled example of your process, such as a checklist or a before-you-start list you made yourself. Do not stage a scene and present it as a customer result.')]),
 dict(title='Day 4: the three-post plan', sub='Rotate teaching, showing and offering', blocks=[
  ('table', ['Post', 'Opening line', 'Main point or proof', 'One call to action'], [60, 170, 160, 114],
   [['Teach', 'Example: The easiest first step before a deep clean...', '', 'Ask a question'], ['Show', 'Example: Here is what a finished kitchen visit includes...', '', 'Request a quote'], ['Offer', 'Example: I have openings for this service...', '', 'Contact me']], 3, 44, 'pl'),
  ('note', 'Post checklist', 'One idea per post. One action. The service and price match your offer on Day 1. The photo is yours or licensed. You can fulfill what the post invites people to ask for.'),
  ('area', 'My first post, written out', 120)]),
 dict(title='Caption starters you can finish', sub='Three structures. Fill the lines, then read it out loud', blocks=[
  ('note', 'Helpful tip', 'Hook: name the problem in the reader\'s words. Tip: one safe, practical step. Invitation: how to ask for help with the service you actually sell.'),
  ('fields', ['Hook (the problem)', 'The tip', 'Invitation (what to do next)'], 1),
  ('note', 'Behind the scenes', 'Show the process, not a promise. Name what the visit includes, what it does not, and how you check the result.'),
  ('fields', ['What a visit includes', 'What it does not include', 'How I check the work'], 1)]),
 dict(title='Example captions (adapt, do not copy blindly)', sub='Examples only. Every claim must be true for your business', blocks=[
  ('note', 'Teach', 'Three easy-to-miss spots in a quick clean: door handles, light switches and the area around the sink. Start with what your household touches most, and follow each surface maker\'s cleaning directions. What do you forget most often?'),
  ('note', 'Show (scope stated)', 'One space, one change. This is the hall closet after an organizing session: two shelves, one bin per category, labels the client chose. Every space is different; this shows a method, not a guaranteed result. Want help with a similar space? Ask about availability.'),
  ('note', 'Offer', 'I help busy households with standard home cleaning in my service area. Starting prices are on my request page, and I confirm scope before I quote. Message me for the next open dates.'),
  ('note', 'Check before posting', 'Replace every example detail with real ones. Remove any claim you cannot prove. Add the price or quote path. Read platform and group rules first.')]),
 *CAP_PAGES,
 dict(title='Day 5: conversations, not spam', sub='Message only people who asked, or who agreed to hear from you', blocks=[
  ('note', 'Reply to a question', 'Thanks for asking. Yes, I do this work in my service area, and I can send the list of what a visit includes. Would you like the details, or an estimate for your space? (Add your own service, area and inclusions below, in your own voice.)'),
  ('area', 'My version of this reply', 64),
  ('note', 'Safety rules', 'Honor opt-outs right away. Follow the rules of each platform and local communication laws. Do not scrape contacts, buy lists, or enroll anyone automatically.'),
  ('check', 'Before I send any message', ['The person asked, or agreed to hear from me', 'I used their name and their words, not a template blast', 'I gave one clear next step', 'They can say "no thanks" and I will stop'])]),
 dict(title='Day 6: follow-up scripts', sub='Only for estimates people requested', blocks=[
  ('note', 'Requested estimate follow-up', 'Following up on the estimate you asked for. Is there anything you would like clarified? No pressure. I can close this out if the timing is not right.'),
  ('note', 'Past customer (only with their permission to contact them)', 'Hope the last visit is still working well. If you would like to book again, the request link is on my page. Reply here if you have questions first.'),
  ('note', 'If they say no or stop', 'Thank you for letting me know. I will not message again. (Then mark them as opted out in your log.)'),
  ('area', 'My own follow-up wording', 100)]),
 dict(title='Weekly action tracker', sub='Count real inquiries, not views', blocks=[
  ('table', ['Day', 'What I posted or did', 'People who opted in', 'Reply or outcome'], [50, 190, 100, 164],
   [['Mon'], ['Tue'], ['Wed'], ['Thu'], ['Fri'], ['Sat'], ['Sun']], 0, 38, 'wt')]),
 dict(title='Inquiry log', sub='One line per real person who asked about the service', blocks=[
  ('table', ['Date', 'How they found me', 'What they need', 'Next step and date', 'Status'], [55, 105, 140, 130, 74], [], 11, 30, 'il'),
  ('note', 'Privacy', 'Keep this log in a private place. Record only what you need to follow up. Delete a person on request.')]),
 dict(title='Day 7: scorecard', sub='Use actual results to decide what to change', blocks=[
  ('fields', ['Posts published (count and where)', 'Consented inquiries received', 'Qualified conversations', 'Quotes sent or valid checkout attempts', 'Paid orders (not tests, not $0)', 'Money actually collected'], 2),
  ('note', 'Simple rates (do by hand)', 'Inquiries per post = inquiries / posts.   Quote rate = quotes / inquiries.   Close rate = paid orders / quotes.   Average order = money collected / paid orders.  A small number of results is a signal to test again, not proof.'),
  ('area', 'What real people responded to', 56),
  ('fields', ['One change I will make next week'], 1)]),
 dict(title='Next week and keeping it going', sub='Repeat the loop, improve one thing', blocks=[
  ('table', ['Week 2', 'Post idea', 'Who I will talk to', 'Result'], [60, 190, 150, 104], [['Mon'], ['Tue'], ['Wed'], ['Thu'], ['Fri']], 0, 34, 'w2'),
  ('check', 'Monthly habits', ['Update my price and area if either changed', 'Ask one happy customer for permission to share a result', 'Retire a post idea that got no response', 'Read each platform\'s current rules']),
  ('note', 'A reminder on honesty', 'Trust is your marketing. Keep claims specific, true and easy to verify.')]),
]
render(k, pages)
p, f = k.save(); print(p, 'pages', f, 'fields')
