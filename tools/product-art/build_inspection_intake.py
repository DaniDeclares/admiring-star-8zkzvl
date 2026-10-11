"""Property Inspection & Photo Log and Client Intake & Scope Change guides, edition 2 (draft): preserve every section of the owner's
2-page PDFs, add fillable forms, room checklists, worked examples and closeout pages on the canonical palette.
Usage: build_inspection_intake.py inspection.pdf intake.pdf"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kit_lib import Kit
from kit_blocks import render

# ---------------- Inspection ----------------
k = Kit(sys.argv[1], 'Property Inspection and Photo Log Kit', 'Condition documentation: room sequence, photo protocol, ratings, issue log and closeout', 'Property Inspection and Photo Log')
k.edition = 'Edition 2 draft'
k.cover('Property Inspection', '& Photo Log Kit', 'Document condition clearly. Diagnose nothing', 'Fillable on screen. Print-ready. Works with the pocket app.')
rooms = ['Exterior and access (where permitted)', 'Entry', 'Kitchen', 'Bathrooms', 'Bedrooms', 'Living areas', 'Utility areas and visible fixtures', 'Final overview']
render(k, [
 dict(title='Purpose and scope', sub='A visual condition record, not a licensed home inspection', blocks=[
  ('note', '1. Purpose', 'Decide whether this is condition documentation, a move-in or move-out record, a maintenance follow-up, or turnover readiness. This kit is for visual condition records. It is not a licensed home inspection and does not find hidden or structural problems.'),
  ('fields', ['Property or unit', 'Date and time', 'Purpose of this inspection', 'Prepared by', 'Who authorized entry'], 1),
  ('note', '2. Room sequence', 'Exterior and access where permitted; entry; kitchen; baths; bedrooms; living areas; utility areas and visible fixtures; final overview. Record only areas you are authorized to enter.')]),
 dict(title='Room-by-room checklist', sub='Mark each room, then log anything that needs attention', blocks=[
  ('table', ['Room or area', 'Photographed', 'Condition (neutral words)', 'Issue logged?'], [190, 80, 154, 80], [[r] for r in rooms], 0, 34, 'rm'),
  ('note', '3. Photo protocol', 'Use consistent angles, good light, date and time, location labels and descriptive file names. Avoid people, access codes and private documents. Take a wide shot first, then the detail, with something for scale when helpful.')]),
 dict(title='Condition ratings and photo log', sub='Observable words only. Never guess at hidden conditions', blocks=[
  ('note', '4. Condition ratings', 'Use neutral, observable words: clean, minor wear, repair needed, inaccessible, not inspected. Never guess at hidden or structural conditions.'),
  ('table', ['Photo ID', 'Room', 'Location or fixture', 'What the photo shows'], [120, 80, 140, 164], [], 10, 30, 'pl')]),
 dict(title='Issue log', sub='Facts, urgency, referral and who was told', blocks=[
  ('note', '5. Issue log', 'For each issue capture location, observation, photo ID, urgency, recommended referral and who was notified. Do not diagnose repairs you are not qualified to diagnose. Report active hazards immediately.'),
  ('table', ['Issue ID / room', 'Observed condition', 'Photo ID', 'Urgency', 'Referral', 'Notified'], [70, 150, 80, 56, 68, 80], [], 8, 36, 'il', 9)]),
 dict(title='Worked example', sub='How one finding is recorded', blocks=[
  ('note', '7. Worked example', 'The kitchen sink cabinet shows visible water staining. Photograph and label it, log the observation, flag it for qualified maintenance review, and do not conclude a cause.'),
  ('table', ['Field', 'Example entry'], [170, 334],
   [['Inspection ID and room', 'INS-0312, Kitchen'], ['Surface or fixture', 'Sink base cabinet floor'], ['Observed condition', 'Visible water staining, about 6 in. area; surface dry at time of inspection'], ['Photo ID', 'INS-0312_kitchen_sink-cabinet_01.jpg'], ['Urgency and referral', 'Medium; yes, maintenance review'], ['Notified', 'Property manager, by email, with date and time'], ['Follow-up and closed', 'Re-check after the maintenance visit; not closed']], 0, 34, 'ex'),
  ('note', 'Example data', 'The entries above are an illustration. Replace them with your own.')]),
 dict(title='Closeout and privacy', sub='Build an index, confirm completeness, deliver securely', blocks=[
  ('note', '6. Closeout and privacy', 'Build an index, confirm completeness, deliver photos securely and follow your retention policy. Report active hazards immediately.'),
  ('check', 'Closeout checklist', ['Every room in the sequence is photographed or marked inaccessible', 'Every issue has a photo ID, urgency and referral', 'No people, codes, documents or private items appear in photos', 'Photos delivered through a secure channel', 'Retention date noted', 'Hazards were reported when found']),
  ('fields', ['Delivered to and date', 'Retention policy and delete-by date'], 1)]),
 dict(title='Using the tracker and pocket app', sub='Keep the record consistent across devices', blocks=[
  ('check', 'Implementation checklist', ['Duplicate the editable tracker and keep an untouched master copy', 'Replace the example row with your own information', 'Get the approvals your clients and jurisdiction require', 'Review the tracker weekly; archive old versions per your policy', 'The pocket app saves in this browser only: export CSV regularly']),
  ('note', 'Limits', 'Educational template for independent service operators and households. Adapt it to your own prices, policies, local rules and client requirements. Not legal, tax or financial advice, and not a professional inspection.'),
  ('note', 'Customization', 'DANI DECLARES LLC offers separately scoped business-setup help. This purchase does not include it.')]),
])
k.save()

# ---------------- Intake ----------------
k = Kit(sys.argv[2], 'Client Intake and Scope Change Kit', 'Intake, qualification, baseline scope, change approvals, communications and closeout', 'Client Intake and Scope Change')
k.edition = 'Edition 2 draft'
k.cover('Client Intake', '& Scope Change Kit', 'Agree the scope. Approve every change in writing', 'Fillable on screen. Print-ready. Works with the pocket app.')
render(k, [
 dict(title='First contact', sub='Ask what outcome the client needs', blocks=[
  ('note', '1. First contact', 'Ask what outcome the client needs, where, when, what has been tried and who can authorize the work. Do not collect sensitive data you do not need.'),
  ('fields', ['Client reference', 'Date of first contact', 'Outcome the client needs', 'Where (area or site type)', 'When (date and time window)', 'What has been tried', 'Who can authorize the work', 'Best way to reach them'], 2),
  ('area', 'Notes', 60)]),
 dict(title='Qualification', sub='Is this a fit? Decline politely when it is not', blocks=[
  ('note', '2. Qualification', 'Confirm the job is in your service area and among the services you offer, then check site access, hazards, budget fit and timeline.'),
  ('check', 'Qualification checklist', ['In my service area', 'A service I offer and am qualified to perform', 'Site access is clear and authorized', 'Hazards identified or ruled out', 'Budget fits the likely scope', 'Timeline is realistic', 'The person asking can authorize the work']),
  ('fields', ['Decision (accept, quote, refer or decline)', 'Reason, in neutral words'], 1)]),
 dict(title='Baseline scope', sub='Write down exactly what is and is not included', blocks=[
  ('note', '3. Baseline scope', 'Write the included tasks, excluded tasks, condition assumptions, what the client must prepare, estimated duration and what proof of completion you will provide.'),
  ('area', 'Included tasks', 70), ('area', 'Excluded tasks', 56),
  ('fields', ['Condition assumptions', 'What the client must prepare', 'Estimated duration', 'Proof of completion I will provide', 'Client acknowledged scope (name, date)'], 1)]),
 dict(title='Change request log', sub='Record before you act. Written acceptance before proceeding', blocks=[
  ('note', '4. Change request', 'Record a change ID, the reason, added or removed work, price impact, schedule impact and who decided. Stop work on the new request, assess it safely, quote it separately and wait for written approval.'),
  ('table', ['Change ID', 'Change detail', 'Price delta', 'Schedule impact', 'Approved by / how / when'], [56, 150, 62, 80, 156], [], 8, 40, 'ch')]),
 dict(title='Client communications', sub='Send the right message at the right stage', blocks=[
  ('note', '5. Client communications', 'Send the scope summary, arrival window, access instructions, change approvals, completion confirmation and a feedback request at the right stages.'),
  ('table', ['Stage', 'What I send', 'Sent (date)', 'Client reply'], [110, 200, 90, 104],
   [['Scope summary'], ['Arrival window'], ['Access instructions (secure channel)'], ['Change approval'], ['Completion confirmation'], ['Feedback request']], 2, 34, 'cm')]),
 dict(title='Closeout', sub='Match the finished work to the approved scope', blocks=[
  ('note', '6. Closeout', 'Match the finished work to the approved scope, photos or other evidence, your quality check, the invoice and the client\'s acknowledgment. Respect opt-outs and your retention policy.'),
  ('check', 'Closeout checklist', ['Finished work matches approved scope and every approved change', 'Evidence saved (photos or other proof)', 'Quality check complete', 'Invoice matches scope plus approved changes', 'Client acknowledged completion', 'Opt-outs and retention policy respected']),
  ('fields', ['Client acknowledgment (name, date)', 'Follow-up date'], 2)]),
 dict(title='Worked example', sub='How a change request is handled', blocks=[
  ('note', '7. Worked example', 'Original job: a standard two-bedroom turnover. On arrival the client asks for extensive debris removal. Stop, assess safely, quote the change separately and wait for written approval.'),
  ('table', ['Field', 'Example entry'], [170, 334],
   [['Client reference and date', 'C-2041, 2026-10-08'], ['Service and site type', 'Turnover clean, two-bedroom apartment'], ['Requested outcome', 'Move-in ready by Friday 5 pm'], ['Baseline scope', 'All rooms, inside kitchen appliances; excludes carpet shampoo and debris haul-off'], ['Change ID and detail', 'CH-1, remove 6 bags of tenant debris'], ['Price delta and approval', '+$85.00; client approved by text at 10:42 am'], ['Status', 'Approved, in progress']], 0, 34, 'ex'),
  ('note', 'Example data', 'The entries above are an illustration. Replace them with your own and use your own prices.')]),
 dict(title='Using the tracker and pocket app', sub='Keep the record consistent across devices', blocks=[
  ('check', 'Implementation checklist', ['Duplicate the editable tracker and keep an untouched master copy', 'Replace the example row with your own information', 'Get the approvals your clients and jurisdiction require', 'Review the tracker weekly; archive old versions per your policy', 'The pocket app saves in this browser only: export CSV regularly']),
  ('note', 'Limits', 'Educational template for independent service operators and households. Adapt it to your own prices, policies, local rules and client requirements. Not legal, tax or financial advice.'),
  ('note', 'Customization', 'DANI DECLARES LLC offers separately scoped business-setup help. This purchase does not include it.')]),
])
k.save()
print('built')
