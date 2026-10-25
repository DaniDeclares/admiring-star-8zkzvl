import { assistantDay, ownerDayParts } from './personalAssistant2026.js';

test('work boundaries use New York, including after daylight saving changes', () => {
  expect(ownerDayParts(new Date('2026-11-02T14:00:00Z')).minute).toBe(540);
  expect(assistantDay({},new Date('2026-10-23T12:59:00Z')).phase).toBe('before');
  expect(assistantDay({},new Date('2026-10-23T20:30:00Z')).phase).toBe('wrap');
  expect(assistantDay({},new Date('2026-10-23T21:00:00Z')).phase).toBe('closed');
  expect(assistantDay({},new Date('2026-11-02T22:00:00Z')).phase).toBe('closed');
});
test('weekend work is protected after the owner effective date', () => {
  expect(assistantDay({},new Date('2026-10-31T15:00:00Z')).phase).toBe('weekend');
});
test('keeps governor ordering and removes deferred or resolved owner work', () => {
  const row = (id, rank, needs=true, status='OPEN') => ({id,reason:id,status,metadata:{governor:{rank_score:rank,needs_owner_now:needs}}});
  const plan=assistantDay({ownerAttention:[row('low',1),row('deferred',999,false),row('resolved',200,true,'RESOLVED'),row('first',100)]});
  expect(plan.attention.map(x=>x.id)).toEqual(['first','low']);
});
test('canceled, expired and invalid appointments do not become next actions', () => {
  const now=new Date('2026-11-02T15:00:00Z');
  const plan=assistantDay({appointments:[{id:'bad',starts_at:'nonsense'},{id:'cancelled',starts_at:'2026-11-02T15:05:00Z',appointment_status:'CANCELLED'},{id:'past',starts_at:'2026-11-02T14:00:00Z',ends_at:'2026-11-02T14:30:00Z'},{id:'real',job_id:'job',starts_at:'2026-11-02T15:20:00Z',appointment_status:'PENDING'}],jobs:[{id:'job',job_title:'Appointment from source'}]},now);
  expect(plan.appointments.map(x=>x.id)).toEqual(['real']);
  expect(plan.dueSoon.title).toBe('Appointment from source');
  expect(plan.dueSoon.status).toBe('PENDING');
});
test('after-hours events remain visible without generating weekend work', () => {
  const plan=assistantDay({appointments:[{id:'event',starts_at:'2026-11-07T16:00:00Z',appointment_status:'PENDING'}]},new Date('2026-11-06T15:00:00Z'));
  expect(plan.appointments[0].outsideHours).toBe(true);
  expect(plan.dueSoon).toBeUndefined();
});
test('dated internal events retain preparation without inventing a program time', () => {
  const plan=assistantDay({ownerAttention:[{id:'pic',status:'OPEN',metadata:{name:'Community table',date:'2026-11-07'}}]},new Date('2026-11-02T15:00:00Z'));
  expect(plan.preparation[0]).toMatchObject({id:'pic',date:'2026-11-07',title:'Community table'});
  expect(plan.preparation[0].start).toBeUndefined();
});
