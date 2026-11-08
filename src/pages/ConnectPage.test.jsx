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
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ConnectPage from './ConnectPage.jsx';

test('Connect & Join visual hierarchy keeps three accessible, distinct sections and ten links', () => {
  const html = renderToStaticMarkup(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/connect']}>
        <ConnectPage />
      </MemoryRouter>
    </HelmetProvider>
  );
  expect(html).toContain('Get Work Handled');
  expect(html).toContain('Join the Holiday Mission');
  expect(html).toContain('Work With DANI');
  expect(html).toContain('aria-labelledby="get-work-title"');
  expect(html).toContain('aria-labelledby="holiday-title"');
  expect(html).toContain('aria-labelledby="work-title"');
  expect(html).toContain('DANI_Holiday_Mission_Contributor_Flyer_2026_Approved.png');
  expect(html).toContain('subject=Holiday%20Mission%20Contributor');
  expect((html.match(/<article\b/g) || [])).toHaveLength(9); // Nine cards plus featured service doorway
  expect((html.match(/href="\/request-service"/g) || [])).toHaveLength(1);
  expect((html.match(/href="\/holiday\/community\?role=/g) || [])).toHaveLength(4);
  expect((html.match(/href="\/partner-network\?participation=/g) || [])).toHaveLength(4);
  expect(html).toContain('href="/providers?audience=provider"');
  expect(html).not.toContain('utm_campaign=holiday-2026');
});

test('Connect & Join keeps genuine source context in the visual paths', () => {
  const html = renderToStaticMarkup(
    <HelmetProvider><MemoryRouter initialEntries={['/connect?utm_source=linkedin&utm_campaign=fall-services&ref=verified']}>
      <ConnectPage />
    </MemoryRouter></HelmetProvider>
  );
  expect(html).toContain('href="/request-service?utm_source=linkedin&amp;utm_campaign=fall-services&amp;ref=verified"');
  expect(html).toContain('role=SPONSOR');
  expect(html).toContain('audience=provider');
  expect(html).not.toContain('utm_campaign=holiday-2026');
});

test('Connect & Join reuses existing service photography and keeps Holiday artwork unchanged', () => {
  const html = renderToStaticMarkup(
    <HelmetProvider><MemoryRouter initialEntries={['/connect']}>
      <ConnectPage />
    </MemoryRouter></HelmetProvider>
  );
  const expectedPhotos = [
    'pexels-pavel-danilyuk-7937330.jpg',
    'pexels-rdne-8293769.jpg',
    'pexels-pavel-danilyuk-7937734.jpg',
  ];
  expectedPhotos.forEach(photo => expect(html).toContain(photo));
  expect((html.match(/DANI_Holiday_Mission_Contributor_Flyer_2026_Approved.png/g) || [])).toHaveLength(1);
  expect(html).toContain('Holiday 2026');
  expect(html).not.toContain('Supporting transitions into a home');
  expect(html).not.toContain('pexels-rdne-8581413.jpg');
  expect(html).toContain('Ways you could contribute');
  expect(html).toContain('Local businesses &amp; community partners wanted');
  expect(html).toContain('aria-labelledby="get-work-title"');
  expect(html).toContain('aria-labelledby="holiday-title"');
  expect(html).toContain('aria-labelledby="work-title"');
  expect(html).toContain('href="/providers?audience=provider"');
});
