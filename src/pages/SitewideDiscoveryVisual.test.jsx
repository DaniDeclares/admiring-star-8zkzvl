import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import HomePage from './HomePage';
import CommercialCatalogPage from './CommercialCatalogPage';
import PackagesPage from './PackagesPage';

const htmlFor = (component) => renderToStaticMarkup(
  <HelmetProvider><MemoryRouter>{component}</MemoryRouter></HelmetProvider>
);

test('home preserves full audience coverage while introducing image-led discovery', () => {
  const html=htmlFor(<HomePage/>);
  ['Residents','Property Teams','Real Estate','Businesses','Government + Institutions'].forEach(x=>expect(html).toContain(x));
  ['Browse the full catalog','Define a package scope','Visit the DANI shop'].forEach(x=>expect(html).toContain(x));
  expect(html).toContain('href="/catalog"');
  expect(html).toContain('href="/packages"');
  expect(html).toContain('href="/shop"');
  expect(html).toContain('href="/request-service"');
  ['pexels-rdne-5591641.jpg','pexels-pavel-danilyuk-7937330.jpg','pexels-thirdman-8469939.jpg'].forEach(x=>expect(html).toContain(x));
  expect(html).toContain('not DANI staff or past client projects');
});

test('catalog is photo-led without changing service API, search, or main', () => {
  const html=htmlFor(<CommercialCatalogPage/>);
  expect(html).toContain('Find the work you need handled.');
  expect(html).toContain('pexels-pavel-danilyuk-7937330.jpg');
  expect(html).toContain('Search services');
  expect(html).toContain('id="service-discovery"');
  expect(html).toContain('href="/request-service"');
  expect((html.match(/<main\b/g)||[])).toHaveLength(1);
});

test('packages explains scope requirements without implying fixed packages', () => {
  const html=htmlFor(<PackagesPage/>);
  expect(html).toContain('Start with the scope.');
  expect(html).toContain('not a one-size-fits-all promise');
  expect(html).toContain('confirm an approved scope and quote before booking');
  expect(html).toContain('Search the full catalog to define your package scope');
  expect((html.match(/<main\b/g)||[])).toHaveLength(1);
});
