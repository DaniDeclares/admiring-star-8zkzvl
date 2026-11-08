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

test('ordinary Connect & Join navigation does not fabricate Holiday campaign attribution',()=>{
  expect(destinationFor('/request-service','')).toBe('/request-service');
  expect(destinationFor('/partner-network','',{participation:'BUSINESS_PARTNER',focus:'vendor'}))
    .toBe('/partner-network?participation=BUSINESS_PARTNER&focus=vendor');
  expect(destinationFor('/providers','',{audience:'provider'}))
    .toBe('/providers?audience=provider');
});

test('genuine inbound campaign and referral remain separate from visitor intent',()=>{
  const result=destinationFor('/request-service','?utm_source=facebook&utm_campaign=fall-operations&ref=known-person',{channelType:'B2B'});
  const params=new URLSearchParams(result.split('?')[1]);
  expect(params.get('utm_campaign')).toBe('fall-operations');
  expect(params.get('utm_source')).toBe('facebook');
  expect(params.get('ref')).toBe('known-person');
  expect(params.get('channelType')).toBe('B2B');
});

test('Holiday Mission pathways preserve their role without manufacturing a campaign',()=>{
  const result=destinationFor('/holiday/community','',{role:'SPONSOR'});
  expect(result).toBe('/holiday/community?role=SPONSOR');
  const real=destinationFor('/holiday/community','?utm_campaign=holiday-mission-2026',{role:'VOLUNTEER'});
  expect(new URLSearchParams(real.split('?')[1]).get('utm_campaign')).toBe('holiday-mission-2026');
});