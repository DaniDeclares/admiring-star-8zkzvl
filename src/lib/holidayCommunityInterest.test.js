import { normalizeHolidayInterest } from './holidayCommunityInterest.js';
const valid = {
  name:'Sample Adult',email:'sample@example.org',city:'Decatur, GA',
  role:'FAMILY_SUPPORT',area:'HOUSEHOLD_ITEMS',contactConsent:true,
  attribution:{utm_source:'facebook',utm_campaign:'holiday-2026',ref:'DJ-Atlanta'},
};
test('family intake preserves source without requiring a street address or household details', () => {
 const result = normalizeHolidayInterest(valid,new Date('2026-11-07T18:00:00Z'));
 expect(result.ok).toBe(true);
 expect(result.record.status).toBe('NEW');
 expect(result.record.attribution.ref).toBe('DJ-Atlanta');
 expect(result.record).not.toHaveProperty('service_id');
 expect(result.record).not.toHaveProperty('locationAddress');
});
test('business sponsor can identify its organization without becoming a commercial lead',()=>{
 const result=normalizeHolidayInterest({...valid,role:'SPONSOR',organization:'Local Housing Partner LLC'});
 expect(result.ok).toBe(true);
 expect(result.record.organization).toBe('Local Housing Partner LLC');
 expect(result.record.source).toBe('WEBSITE_HOLIDAY_2026');
});
test('consent and valid declared role are mandatory',()=>{
 expect(normalizeHolidayInterest({...valid,contactConsent:false}).errors).toContain('CONSENT_REQUIRED');
 expect(normalizeHolidayInterest({...valid,role:'APPROVED_PROVIDER'}).errors).toContain('ROLE_INVALID');
});
test('input is bounded and does not accept unknown beneficiary status',()=>{
 const result=normalizeHolidayInterest({...valid,note:'x'.repeat(2000),attribution:{utm_content:'y'.repeat(1000)}});
 expect(result.record.note.length).toBe(600);
 expect(result.record.attribution.utm_content.length).toBe(120);
});
