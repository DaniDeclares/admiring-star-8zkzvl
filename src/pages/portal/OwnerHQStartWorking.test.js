import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { OwnerStartWorking } from './OwnerHQPage.jsx';
import { resolveOperationsQueue } from './OperationsConsolePage.jsx';

function render(salesDue) {
  return renderToStaticMarkup(<StaticRouter><OwnerStartWorking salesDue={salesDue} /></StaticRouter>);
}

test('routes owner work through existing sales, operations, and attention surfaces', () => {
  const html = render(7);
  expect(html).toContain('Start here');
  expect(html).toContain('Move today&#x27;s work forward');
  expect(html).toContain('href="/portal/operations?queue=sales"');
  expect(html).toContain('Review sales actions (7 due)');
  expect(html).toContain('href="/portal/operations"');
  expect(html).toContain('Jobs &amp; operations');
  expect(html).toContain('href="#attention"');
  expect(html).toContain('Owner decisions');
});

test('does not mislabel dated sales actions as buyers or contact authorization', () => {
  const html = render(0);
  expect(html).toContain('not confirmed buyers or permission to contact');
  expect(html).toContain('Review sales actions (0 due)');
});


test('sales shortcuts open the sales workbench while ordinary operations defaults to intake', () => {
  expect(resolveOperationsQueue('?queue=sales')).toBe('sales');
  expect(resolveOperationsQueue('')).toBe('requests');
  expect(resolveOperationsQueue('?queue=unknown')).toBe('requests');
  expect(resolveOperationsQueue('?queue=sales&other=1')).toBe('sales');
});
