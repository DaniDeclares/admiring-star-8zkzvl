import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import ServiceCategoryPage from './ServiceCategoryPage';

jest.mock('../components/Navbar', () => () => null);
jest.mock('../components/Footer', () => () => null);
jest.mock('../components/InAppBrowserBanner.jsx', () => () => null);

const renderCategory = (slug) => renderToStaticMarkup(
  <MemoryRouter initialEntries={[`/services/category/${slug}`]}>
    <Layout>
      <Routes>
        <Route path="/services/category/:slug" element={<ServiceCategoryPage />} />
      </Routes>
    </Layout>
  </MemoryRouter>
);

test.each(['home-resident-concierge', 'property-facilities'])(
  'category %s has exactly one page-level main landmark within the existing Layout',
  (slug) => {
    const html = renderCategory(slug);
    expect((html.match(/<main(?:\s|>)/g) || [])).toHaveLength(1);
    expect((html.match(/<\/main>/g) || [])).toHaveLength(1);
    expect(html).toContain('<section aria-label="Available services"');
    expect(html).toContain('All service areas');
    expect(html).toContain('Loading services');
  }
);
