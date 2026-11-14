import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import BusinessSolutionsPage from './BusinessSolutionsPage.jsx';
import PropertyPage from './services/PropertyPage.jsx';
import PrintStudioPage from './services/PrintStudioPage.jsx';
import EventsPage from './services/EventsPage.jsx';

const render = component => renderToStaticMarkup(<MemoryRouter><main>{component}</main></MemoryRouter>);

test.each([
  ['Business', <BusinessSolutionsPage />, 'Business Work, Handled.', 'channelType=B2B', 4],
  ['Property', <PropertyPage />, 'Property work, handled', 'channelType=B2B_APT', 4],
  ['Print', <PrintStudioPage />, 'Print, merchandise', '/shop', 6],
  ['Events', <EventsPage />, 'Make the experience happen', '/weddings', 6],
])('%s service area reuses approved brand, unique service content and the guarded next step', (_, component, title, route, count) => {
  const html = render(component);
  expect(html).toContain(title);
  expect(html).toContain('dd-service-landing__hero');
  expect(html).toContain('dd-service-landing__cards');
  expect(html).toContain('dd-service-landing__button--gold');
  expect(html).toContain(route);
  expect(html).toContain('href="/catalog"');
  expect((html.match(/dd-service-landing__card"/g) || [])).toHaveLength(count);
  expect((html.match(/class="dd-service-landing__card-link"/g) || [])).toHaveLength(count);
  expect((html.match(/<main\b/g) || [])).toHaveLength(1);
  expect(html).toContain('<img');
  expect(html).not.toMatch(/50% Pre-Order Production System|Order \/ Pre-Order|Historical package prices|canonical catalog/);
});

test('custom print requests do not promise 50% deposits or send customer to generic checkout as a quote', () => {
  const html = render(<PrintStudioPage />);
  expect(html).toContain('Request custom print or merchandise');
  expect(html).toContain('Shop published products');
  expect(html).toContain('payment terms are confirmed for the specific request');
  expect(html).not.toContain('50% deposit');
});

test('four distinct service families remain findable through different imagery', () => {
  const pages = [<BusinessSolutionsPage />, <PropertyPage />, <PrintStudioPage />, <EventsPage />];
  const urls = pages.map(page => render(page).match(/<img[^>]+src="([^"]+)"/)?.[1]);
  expect(urls.every(Boolean)).toBe(true);
  expect(new Set(urls).size).toBe(4);
});
