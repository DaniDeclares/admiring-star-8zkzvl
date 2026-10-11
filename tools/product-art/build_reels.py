"""No-Face Reels & Voiceover Kit, edition 2 (draft): preserves all 20 scripts, 15 shot sequences, 5 text-only templates and 30 hook
patterns of the owner's COMPLETE 24-page kit, rebuilt fillable on the canonical palette. Brackets are replaced by plain wording."""
import sys, os, json, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kit_lib import Kit
from kit_blocks import render
out = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, 'data_reels/reels_scripts.json')))
X = json.load(open(os.path.join(HERE, 'data_reels/reels_extra.json')))
MAP = {'service': 'your service', 'task': 'the task', 'industry': 'your field', 'area/task': 'the area', 'day/season': 'this season',
       'documents/supplies': 'your paperwork', 'supply zone': 'your supply area', 'buyer type': 'customers', 'area': 'the area',
       'link': 'your request link', 'one factual next step': 'one factual next step', 'included step one': 'first included step', 'included step two': 'second included step'}
def plain(t):
    t = re.sub(r'\[([^\]]+)\]', lambda m: MAP.get(m.group(1), m.group(1)), t)
    t = t.replace('.”.', '.”').replace('photo-number placeholder', 'photo-number card')
    return re.sub(r'[Ff]ictional', lambda m: 'Example' if m.group(0)[0] == 'F' else 'example', t)
k = Kit(out, 'No-Face Reels & Voiceover Kit', 'Scripts, shot lists and worksheets for short service videos without showing your face', 'No-Face Reels & Voiceover Kit')
k.edition = 'Edition 2 draft'
k.cover('No-Face Reels', '& Voiceover Kit', 'Shoot the work, not your face', 'Fillable on screen. Print-ready. 20 scripts, 15 shot sequences, 30 hooks.')
pages = [
 dict(title='Start here', sub='A simple shot-and-script system for service videos', blocks=[
  ('note', 'Core idea', 'Show the process, the tools, the setup or the result. Add a short voiceover, clear on-screen words, captions and one next step. Your face never has to appear.'),
  ('note', 'Works for', 'Cleaners, organizers, operators, field professionals and small service businesses that can document their actual work safely.'),
  ('note', 'What is included', 'Planning sheets, 20 ready-to-read scripts, 15 shot-by-shot sequences, 5 text-only templates and 30 hook patterns. Not included: footage, editing software, audio files, rights to third-party media, or automatic posting.'),
  ('note', 'Privacy first', 'Do not film clients, children, addresses, documents, lock codes or private workspaces without authorization. When in doubt, film your own tools on a neutral surface.'),
  ('steps', 'The loop', ['Pick one goal for one video', 'Choose a shot sequence and a script', 'Film only what you may show', 'Edit, caption, and check on your phone', 'Publish, then write down what real people did'])]),
 dict(title='Pick one video goal', sub='Give each short video one job', blocks=[
  ('fields', ['Who is watching (viewer or customer)', 'One real problem they face', 'What this video shows them', 'The one product or service I can deliver now', 'Call to action (ask, click, inquire)', 'Where it will post', 'I have permission for every shot and sound (date)'], 1)]),
 dict(title='12 safe B-roll shots', sub='Ordinary, authorized work without revealing anything sensitive', blocks=[
  ('table', ['#', 'Shot idea', 'What to avoid', 'Filmed?'], [28, 200, 200, 76],
   [['1', 'Tools laid out neatly', 'Private names and addresses'], ['2', 'A blank checklist with a pen', 'Client forms with details'], ['3', 'Preparing a supply bin', 'Hazardous handling'], ['4', 'Hands folding linens', 'Identifiable people'], ['5', 'Packing a welcome kit', 'Customer addresses'], ['6', 'Phone timer on a neutral screen', 'Personal notifications'], ['7', 'Desk before and after', 'Account details'], ['8', 'Organized shelving close-up', 'Restricted work sites'], ['9', 'Typing sample text', 'Real client records'], ['10', 'Cleaning a safe surface', 'Unsafe mixtures'], ['11', 'Checking task completion', 'False completion claims'], ['12', 'Packaging a PDF preview', 'Giving away the paid file']], 0, 32, 'br'),
  ]),
 dict(title='A 20-second video map', sub='One hook, three useful beats, one call to action', blocks=[
  ('table', ['Time', 'What the viewer sees', 'What the voiceover does', 'My version'], [60, 150, 150, 144],
   [['0-3 s', 'A quick visual of the problem', 'Name the problem (the hook)'], ['3-8 s', 'The preparation or first step', 'Explain the simplest action'], ['8-15 s', 'The method or a real example', 'Give one useful takeaway'], ['15-20 s', 'Result or next-step screen', 'Invite one specific next step']], 0, 52, 'vm'),
  ('note', 'Example (a home-cleaning business)', '0-3 s: close-up of a door handle. "A room can look clean and still miss this." 3-8 s: the light switch and sink rim. "Start with what hands touch." 8-15 s: wiping with the right cloth for the surface. "Follow the surface maker\'s directions." 15-20 s: a checklist on screen. "Save this for your next reset."'),
  ('area', 'My own 20-second plan', 70)]),
 dict(title='Four hook formulas', sub='Swap in accurate details. Do not overpromise', blocks=[
  ('note', 'Relief', 'You do not have to do the whole job at once. Start with one manageable action.'),
  ('note', 'Before you book', 'Before hiring someone for this service, ask about the scope and the safety details.'),
  ('note', 'Quick demonstration', 'Here is how we prepare for the visit so nothing important gets missed.'),
  ('note', 'Checklist', 'Three things to confirm before you start: the scope, the supplies, the finish line.'),
  ('fields', ['My hook, using the formula that fits best'], 1),
  ('note', 'Avoid', 'Fake scarcity, made-up guarantees, misleading before-and-after images, and income claims you cannot prove.')]),
 dict(title='Voiceover script worksheet', sub='Natural language, not a polished sales monologue', blocks=[
  ('fields', ['Hook (first 3 seconds)', 'Why this matters', 'Step 1: show or describe', 'Step 2: show or describe', 'Helpful result or correction', 'One simple invitation', 'On-screen text and captions', 'Fact check, source or permission'], 1)]),
 dict(title='Safety, permission and accuracy check', sub='Before you film and before you post', blocks=[
  ('check', 'Before filming', ['The space and every object in frame are mine or authorized', 'No faces, children, plates, addresses, documents or lock codes', 'No unsafe chemical mixing or hazardous handling on camera', 'Music and visuals are mine or properly licensed', 'Any example result is labeled as an example']),
  ('check', 'Before posting', ['Watched once muted: the video makes sense from text alone', 'Watched once with sound: words are clear', 'Captions are accurate; text contrast and size are readable', 'Claims match what my business actually delivers', 'The call to action and link work', 'Previewed on a phone', 'No flashing effects']),
  ('note', 'A note on "viral"', 'Do not chase reach with claims you cannot back. One specific, honest video that leads to a real inquiry is worth more than a vague one that gets views.')]),
]
# 20 scripts, 4 per page
def script_note(s):
    return ('note', f"{s['n']}. {s['title']} ({s['cat']}, {s['kind']}, about {s['secs']} s)",
            plain(f"{s['copy']}\nShoot: {s.get('SHOOT','')}   On screen: {s.get('ON-SCREEN','')}   Call to action: {s.get('CTA','')}"), 10.8, 14.4)
for i in range(0, 20, 4):
    pages.append(dict(title=f'Voiceover scripts {i+1}-{i+4}', sub='Ready to read. Check every claim against your own business before posting', blocks=[script_note(s) for s in S[i:i+4]]))
# 15 shot sequences, 5 per page
for i in range(0, 15, 5):
    rows = [[f"{s['n']}  {s['title']}", plain(s['body'])] for s in X['seq'][i:i+5]]
    pages.append(dict(title=f'Shot-by-shot sequences {i+1}-{i+5}', sub='Film only authorized spaces. Never stage a hazardous chemical demonstration', blocks=[
        ('table', ['Sequence', 'Three shots, overlay and call to action', 'My version'], [110, 250, 144], rows, 0, 74, f'sq{i}')]))
pages.append(dict(title='Five text-only templates', sub='On-screen words only. No voice or voice generator needed', blocks=[
  ('note', f"{t['n']}. {t['title']}", plain(t['body']), 10.8, 14.4) for t in X['tp']]))
hooks = [plain(h) for h in X['hooks']]
for i in range(0, 30, 15):
    pages.append(dict(title=f'Hook patterns {i+1}-{i+15}', sub='Pair each with a real process clip, one sentence of answer, and one next step', blocks=[
        ('table', ['#', 'Hook pattern', 'My version'], [28, 270, 206], [[str(i + j + 1), hooks[i + j]] for j in range(15)], 0, 34, f'hk{i}')]))
pages += [
 dict(title='Editing and accessibility checklist', sub='Use what you already have. No paid software required', blocks=[
  ('table', ['Check', 'Ready?', 'Notes'], [250, 60, 194], [['Vertical video framed correctly'], ['Audio clear, or no voiceover needed'], ['Readable on-screen words'], ['Accurate captions'], ['No confidential details visible'], ['Only permitted music and visuals'], ['Realistic call to action and link'], ['No claim beyond my real scope'], ['Previewed on a phone']], 0, 36, 'ea')]),
 dict(title='Batch and track ideas', sub='Turn one work session into reusable, truthful content', blocks=[
  ('table', ['Idea', 'Footage to capture', 'Permission?', 'Status'], [160, 170, 80, 94], [], 12, 34, 'bt')]),
 dict(title='Publish and learn', sub='Make the next reel better from real feedback', blocks=[
  ('fields', ['Video title, date and channel', 'Meaningful replies or questions', 'Consent-based customer inquiries', 'Quotes or verified purchases', 'What was clear?', 'What was confusing?', 'One specific improvement for the next clip'], 1)]),
]
render(k, pages)
p, f = k.save(); print(p, 'pages', f, 'fields')
