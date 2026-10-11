"""House Manager Operations Kit, edition 2 (draft): preserves every page of the owner's COMPLETE 22-page kit as fillable worksheets;
examples are labelled as examples; blank underscores become real fields; no access codes or passwords are ever requested."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kit_lib import Kit
from kit_blocks import render
out = sys.argv[1]
k = Kit(out, 'House Manager Operations Kit', 'Worksheets for managing household-support work for clients: scope, visits, changes, handoffs and closeout', 'House Manager Operations Kit')
k.edition = 'Edition 2 draft'
k.cover('House Manager', 'Operations Kit', 'A field kit for managing household-support work', 'Fillable on screen. Print-ready. One set per client or engagement.')
CP = lambda a, b: ('note', 'Checkpoints', a + '  |  ' + b)
pages = [
 dict(title='How to use this kit', sub='One set per client or engagement', blocks=[
  ('steps', 'The six pieces', ['Client household profile: record only what the job needs', 'Authorized recurring work: separate the agreed routine from unapproved requests', 'Visit plan and loadout: prepare before arriving, record what was actually completed', 'Changes and approvals: a request is not authorized just because it was mentioned', 'Handoff and next shift: make the next visit clear without sharing private details', 'Closeout and client confirmation: check that completion and decisions are recorded']),
  ('note', 'Working rule', 'Confirm scope and authorization before performing work. Record changes and communicate at handoff. Write the client or engagement name on every page and keep the set together. Page 8 shows an example of a new request moving from "mentioned" to "approved" before any work is done.'),
  ('fields', ['Client or engagement', 'Prepared by', 'Start date'], 1)]),
 dict(title='Client household profile', sub='Record only what the job needs; store sensitive details securely', blocks=[
  ('fields', ['Client or household', 'Engagement start date', 'Primary contact and preferred method', 'Who approves work and changes', 'Service address or area', 'Household members and pets relevant to the work', 'Access method (never codes or passwords)', 'Products and preferences to follow', 'Areas or items off limits', 'Emergency contact the client chose to share'], 2),
  CP('Do not write entry codes, passwords or account details here', 'Store this page securely, not in a vehicle or shared space')]),
 dict(title='Authorized recurring work', sub='Separate the agreed routine from unapproved requests', blocks=[
  ('table', ['Frequency', 'Task', 'Authorized by and date', 'Next due'], [80, 220, 124, 80], [], 12, 34, 'ar'),
  CP('Only list work the client has approved', 'Update the next-due date at every visit')]),
 dict(title='Visit plan and loadout', sub='Prepare before arriving; document what is actually completed', blocks=[
  ('fields', ['Client or household', 'Visit date and arrival window'], 2),
  ('table', ['Task or supply', 'Planned', 'Completed', 'Notes'], [200, 80, 80, 144], [], 11, 30, 'vp'),
  CP('Mark completed only what was actually done', 'Note supplies that need restocking')]),
 dict(title='Changes and approvals', sub='Do not treat a new request as authorized because it was mentioned', blocks=[
  ('note', 'Status key', 'NEEDS CLIENT DECISION  |  APPROVED  |  DECLINED  |  DONE'),
  ('table', ['Requested change', 'Status', 'Client approval and date', 'Action'], [190, 100, 120, 94], [], 10, 36, 'ca'),
  CP('No work on a change until it is approved', 'Added charges go through the agreed quoting process')]),
 dict(title='Handoff and next shift', sub='Make the next visit clear without sharing unnecessary private details', blocks=[
  ('fields', ['Visit date', 'Handed off by and to'], 2),
  ('table', ['Completed', 'Pending', 'Client decision needed', 'Next step'], [126, 126, 126, 126], [], 9, 42, 'hn'),
  CP('Leave out private details the next person does not need', 'Flag anything waiting on the client')]),
 dict(title='Example: a change trail', sub='An illustration. Not a real client', blocks=[
  ('steps', 'How one request moved', ['Original approved work: weekly pantry inventory and kitchen reset', 'New request: organize garage storage', 'Status: NEEDS CLIENT DECISION, because it is outside approved scope', 'Client response: approved for a separate visit; written approval recorded', 'Current visit: kitchen reset completed; garage work not performed', 'Handoff: confirm the next appointment and any added charges through the agreed quoting process']),
  ('note', 'Why it matters', 'The garage request was recorded the moment it came up, but no garage work happened until the client approved it in writing for a separate visit. The original scope stayed intact.')]),
 dict(title='Closeout and client confirmation', sub='Check that completion and decisions are recorded', blocks=[
  ('table', ['Deliverable', 'Evidence or note', 'Confirmed by', 'Date'], [170, 170, 100, 64], [], 7, 32, 'cc'),
  ('area', 'Open items carried forward', 50),
  ('fields', ['Client confirmation (name and date)'], 1),
  CP('Every change has a recorded decision', 'Return or account for keys and access items')]),
 dict(title='Shift readiness and privacy', sub='Handoffs should protect scope, safety and private information', blocks=[
  ('table', ['Checkpoint', 'Verified (initials, date)'], [300, 204],
   [['Approval on file for every task this shift'], ['Access permissions confirmed through a secure channel'], ['Who may receive records is clear'], ['Scheduled tasks match authorized work'], ['Escalation contact known']], 3, 34, 'sr'),
  ('note', 'Required before dispatch', 'Review approval, access permissions, who may receive records, scheduled tasks and escalations.'),
  ('note', 'Private records', 'Use approved secure systems for client contact details and documents. Never record entry codes or passwords.')]),
 dict(title='Vendor and contract ledger', sub='Contacts, scope and verified paperwork, without access codes', blocks=[
  ('table', ['Vendor or trade', 'Quote or approval', 'Insurance or due'], [170, 190, 144],
   [['HVAC (example)', 'Quote pending. No authorization yet', 'Certificate requested'], ['Plumber (example)', 'Client approval needed', 'Verify if required']], 6, 38, 'vc'),
  ('note', 'Note', 'Record insurer, coverage dates and proof reference only when contractually necessary. A listed certificate is not legal verification; confirm directly with the issuer when needed.')]),
 dict(title='Work order and access boundary', sub='A request is not permission to enter or perform added work', blocks=[
  ('fields', ['Job, property and date', 'Approved scope and spending cap', 'Authorized by, method and time', 'Insurance and licensing checks (as applicable)', 'Arrival and completion evidence', 'Key or access return log'], 1),
  ('note', 'Site access', 'Provided through a secure approved channel. Never place lockbox codes, alarm PINs or other access credentials in a shared or printed workbook.')]),
 dict(title='Shift SOP and role matrix', sub='Define completion, handoff and escalation before work begins', blocks=[
  ('table', ['Task', 'Owner and cadence', 'Definition of done'], [160, 140, 204],
   [['Kitchen reset', 'Staff A, daily', 'Approved checklist signed'], ['Laundry and linens', 'Staff B, weekly', 'Count and room placement verified'], ['Deliveries', 'Manager, as needed', 'Received and client notified']], 6, 36, 'so'),
  ('note', 'Limit', 'Workers may only perform duties within their agreements, training, legal eligibility and approved client scope.')]),
 dict(title='Asset and warranty registry', sub='Maintenance history should stay searchable when a vendor changes', blocks=[
  ('table', ['Asset and location', 'Model or ID reference', 'Last / next service'], [170, 170, 164],
   [['Air system', 'See secure asset register'], ['Water heater', 'See secure asset register'], ['Appliance', 'See secure asset register']], 6, 36, 'aw'),
  ('note', 'Note', 'Store complete serial numbers and warranty documents in a protected client file if needed. Follow manufacturers\' guidance; never assume identical service intervals.')]),
 dict(title='Preventive work schedule', sub='Make upcoming tasks visible; reminders are not authorization', blocks=[
  ('table', ['Task', 'Frequency / next', 'Client confirmed? (date)'], [180, 190, 134],
   [['HVAC filter check', 'Manufacturer-specific'], ['Leak and drainage visual check', 'Agreed property schedule'], ['Smoke and CO alarm checks', 'Manufacturer and local rules'], ['Pest assessment', 'As needed, qualified provider'], ['Seasonal exterior review', 'Approved schedule']], 3, 36, 'pw'),
  ('note', 'Limit', 'Do not perform licensed trade work or bypass manufacturer instructions. Escalate safety conditions promptly.')]),
 dict(title='Expense and purchase approvals', sub='Track what was proposed versus what was actually authorized', blocks=[
  ('table', ['Request or vendor', 'Estimate or cap', 'Approved / receipt'], [190, 130, 184],
   [['Replacement air filter (example)', 'Example $35 cap', 'Client approved in writing'], ['Plumbing repair (example)', 'Quote requested', 'PENDING. Do not order']], 7, 34, 'ex'),
  ('note', 'Note', 'Use secure systems for card or payment data. Reconcile receipts to invoices; do not promise legal or tax treatment.')]),
 dict(title='Incident escalation record', sub='For non-emergency documentation. Immediate threats need emergency services', blocks=[
  ('fields', ['Observed time and area', 'What was seen (facts, not guesses)', 'Immediate safe action', 'Who was notified and when', 'Client decision or authorization', 'Follow-up owner and deadline'], 1),
  ('note', 'Remember', 'Do not delay emergency response to complete a form. Record factual details and protect health, family and staff privacy.')]),
 dict(title='Approval and change log', sub='An estimate, a verbal comment or a text is not completed authorization', blocks=[
  ('table', ['Request', 'Status / decision', 'Evidence'], [190, 150, 164],
   [['Garage reorganization (example)', 'Needs decision', 'Quote sent, pending'], ['Replace faucet (example)', 'Approved, scope limited', 'Email reference and date']], 7, 34, 'cl'),
  ('note', 'Statuses', 'Requested, Quoted, Approved or Declined, Assigned, QA, Closed. Save approval references in an appropriately secure record.')]),
 dict(title='QA and handoff acceptance', sub='Close work with evidence, not an unchecked Done box', blocks=[
  ('table', ['Deliverable', 'Verify / proof', 'Accepted by'], [150, 210, 144],
   [['Routine reset', 'Checklist and condition note'], ['Vendor service', 'Invoice and completion photo if permitted'], ['Asset maintenance', 'Service receipt and next due']], 6, 36, 'qa'),
  ('note', 'Remember', 'Obtain permission for images and restrict access to household information. Do not represent a client approval that was never received.')]),
 dict(title='Example: a weekly workflow', sub='A completed example makes the blank tools easier to use', blocks=[
  ('table', ['Mon / Tue', 'Wed / Thu', 'Fri / close'], [168, 168, 168],
   [['Prioritize kitchen and laundry', 'Request HVAC quote', 'Client approves filter only'], ['Log leaking tap observation', 'Proposal remains pending', 'Vendor repair NOT sent'], ['Order supplies under cap', 'Check receipts', 'File proof and next steps']], 0, 40, 'we'),
  ('note', 'What it shows', 'Restraint. The leaking tap is reported, but no plumber is dispatched without approval. This is an illustration, not a real customer.'),
  ('area', 'My own week, using the same pattern', 90)]),
 dict(title='Implementation and scope limits', sub='Finish the handoff without overstating what a PDF can do', blocks=[
  ('check', 'Before using this toolkit', ['I confirmed the operator\'s actual authority: tasks, spending limits and vendors', 'I keep personnel, client and vendor records secure and collect only what the job needs', 'I checked local law, insurance and qualifications for any specialized work', 'I will record factual proof of completed work and keep unresolved items visible']),
  ('check', 'Quick closeout questions', ['What is done, and what evidence supports that?', 'What is still waiting on a client decision?', 'Who owns the next step?', 'Where are the secure records stored?']),
  ('note', 'Limits', 'This is an operational documentation toolkit, not an attorney-drafted contract, legal advice, a staffing agency, or a substitute for professional risk assessment.')]),
 dict(title='Usage and license', sub='Read before use', blocks=[
  ('note', 'What this is not', 'Not scheduling software, a client portal, an employment agreement, or a substitute for applicable legal requirements. A printable, fillable PDF with no automatic scheduling or syncing.'),
  ('note', 'Working rule', 'Confirm scope and authorization before performing work. Record only the information necessary for the job and store sensitive details securely.'),
  ('note', 'License', 'One purchasing business or household may print and adapt this file for its own use. Redistribution or resale of the template is not permitted. The DANI DECLARES name and brand may not be used to represent your business.')]),
]
render(k, pages)
p, f = k.save(); print(p, 'pages', f, 'fields')
