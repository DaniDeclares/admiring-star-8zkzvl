import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import HolidayCommunityPage from './HolidayCommunityPage.jsx';

const renderAt = (route) => renderToStaticMarkup(
  <HelmetProvider>
    <MemoryRouter initialEntries={[route]}>
      <Routes><Route path="/holiday/community" element={<HolidayCommunityPage />} /></Routes>
    </MemoryRouter>
  </HelmetProvider>
);

test('contributor invitation uses owner-approved Holiday Mission artwork and contact', () => {
  const html = renderAt('/holiday/community?role=SPONSOR');
  expect(html).toContain('DANI_Holiday_Mission_Contributor_Flyer_2026_Approved.png');
  expect(html).toContain('Your Skills. Someone');
  expect(html).toContain('Home &amp; Property Support');
  expect(html).toContain('Business &amp; Creative Skills');
  expect(html).toContain('Moving, Transportation &amp; Supplies');
  expect(html).toContain('Volunteer &amp; Community Support');
  expect(html).toContain('vendors@danideclares.com');
  expect(html).toContain('Holiday Mission Contributor');
  expect(html).toContain('No purchase is required');
  expect(html).toContain('not confirmed assignments');
});

test('family support entry preserves private distinct form without business flyer', () => {
  const html = renderAt('/holiday/community?role=FAMILY_SUPPORT');
  expect(html).toContain('Community Support &amp; Opportunity');
  expect(html).not.toContain('DANI_Holiday_Mission_Contributor_Flyer_2026_Approved.png');
  expect(html).toContain('Register your interest');
  expect(html).toContain('type="email"');
});
