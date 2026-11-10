import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import HomePage from './HomePage';
import CommercialCatalogPage from './CommercialCatalogPage';
import PackagesPage from './PackagesPage';
import AboutPage from './AboutPage';
import ContactPage from './ContactPage';

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
  const html=htmlFor(<main><CommercialCatalogPage/></main>);
  expect(html).toContain('Find the work you need handled.');
  expect(html).toContain('pexels-pavel-danilyuk-7937330.jpg');
  expect(html).toContain('Search services');
  expect(html).toContain('id="service-discovery"');
  expect(html).toContain('href="/request-service"');
  expect((html.match(/<main\b/g)||[])).toHaveLength(1);
});

test('packages explains scope requirements without implying fixed packages', () => {
  const html=htmlFor(<main><PackagesPage/></main>);
  expect(html).toContain('Start with the scope.');
  expect(html).toContain('not a one-size-fits-all promise');
  expect(html).toContain('confirm an approved scope and quote before booking');
  expect(html).toContain('Search the full catalog to define your package scope');
  expect((html.match(/<main\b/g)||[])).toHaveLength(1);
});

test('about presents the full business and separates customers from partnerships', () => {
  const html=htmlFor(<AboutPage/>);
  expect(html).toContain('We Handle The Execution');
  ['People &amp; households','Properties &amp; real estate','Businesses &amp; institutions'].forEach(label=>expect(html).toContain(label));
  expect(html).toContain('href="/request-service"');
  expect(html).toContain('href="/connect"');
  expect(html).toContain('Illustrative service photography');
  expect(html).not.toContain('Full-scale vendor coordination');
});

test('contact stays an intake form while using approved visual style and no 24-hour promise', () => {
  const html=htmlFor(<ContactPage/>);
  expect(html).toContain('Tell us what you need handled.');
  expect(html).toContain('Share the details');
  expect(html).toContain('Send your request');
  expect(html).toContain('Metro Atlanta, Georgia');
  expect(html).not.toContain('within 24 hours');
  expect(html).toContain('<form');
  ['business','property','notary','creative','events'].forEach(label=>expect(html).toContain('value="'+label+'"'));
});

test('small labels use approved contrasting burgundy rather than low-contrast gold on pale backgrounds', () => {
  for (const page of [<HomePage/>,<AboutPage/>,<ContactPage/>]) {
    const markup = htmlFor(page);
    expect(markup).not.toContain('text-[#986d20]');
    expect(markup).not.toContain('text-[#967022]');
  }
});

test('packages expose existing intake-only scope families without invented published price or booking', () => {
 const html=htmlFor(<main><PackagesPage/></main>);
 ['People &amp; households','Property teams','Real estate','Businesses','Institutions &amp; government'].forEach(x=>expect(html).toContain(x));
 ['Turnover &amp; Make-Ready Execution','Home Reset Execution','Contract &amp; Task Order Execution'].forEach(x=>expect(html).toContain(x));
 expect(html).toContain('32 existing scope definitions');
 expect(html).toContain('not published, fixed-price packages');
 expect(html).toContain('Scope inquiry only');
 expect(html).toContain('href="/request-service"');
});
