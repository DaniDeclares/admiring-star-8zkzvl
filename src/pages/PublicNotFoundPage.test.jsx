import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import PublicNotFoundPage from './PublicNotFoundPage.jsx';

it('provides customer recovery instead of silently redirecting unknown URLs home', () => {
  const html = renderToStaticMarkup(
    <StaticRouter location="/old-or-mistyped-service">
      <PublicNotFoundPage />
    </StaticRouter>
  );
  expect(html).toContain('This page isn&#x27;t available.');
  expect(html).toContain('href="/request-service"');
  expect(html).toContain('href="/catalog"');
  expect(html).toContain('href="/packages"');
  expect(html).toContain('href="/connect"');
  expect(html).toContain('aria-labelledby="dd-route-recovery-heading"');
});
