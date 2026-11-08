import { destinationFor } from './ConnectPage.jsx';
test('Facebook group attribution survives all website door transitions',()=>{
 const qs='?utm_source=facebook&utm_medium=group&utm_campaign=holiday-2026&utm_content=we-support-small-business-atlanta&ref=DJ-ATL';
 const result=destinationFor('/partner-network',qs,{participation:'BUSINESS_PARTNER',focus:'referrals'});
 const parsed=new URLSearchParams(result.split('?')[1]);
 expect(parsed.get('utm_source')).toBe('facebook');
 expect(parsed.get('utm_content')).toBe('we-support-small-business-atlanta');
 expect(parsed.get('ref')).toBe('DJ-ATL');
 expect(parsed.get('participation')).toBe('BUSINESS_PARTNER');
 expect(parsed.get('focus')).toBe('referrals');
});
test('family and supplier paths are distinct and not anonymous unclassified leads',()=>{
 const holiday=destinationFor('/holiday/community','?utm_source=facebook',{role:'FAMILY_SUPPORT'});
 const vendor=destinationFor('/partner-network','?utm_source=facebook',{participation:'MAKER_CREATOR'});
 expect(holiday).toMatch(/role=FAMILY_SUPPORT/);
 expect(vendor).toMatch(/participation=MAKER_CREATOR/);
 expect(vendor).not.toMatch(/FAMILY_SUPPORT/);
});
