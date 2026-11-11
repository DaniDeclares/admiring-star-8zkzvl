import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(__dirname, 'IntegrationsCenterPage.jsx'), 'utf8');

test('integration labels do not claim all recorded connections are healthy', () => {
  expect(source).toContain("connected ? 'CONNECTION RECORDED'");
  expect(source).not.toContain("'DANI CONNECTED'");
});

test('Notion validation is limited to the identity request on status refresh', () => {
  expect(source).toContain("notionInternalHealthy ? 'NOTION API CHECK PASSED'");
  expect(source).toContain('during the latest status refresh');
  expect(source).not.toContain('internal connection token is valid');
});

test('configured credentials are distinguished from authenticated integration', () => {
  expect(source).toContain("configured ? 'CONFIGURATION PRESENT'");
  expect(source).toContain('API authorization and business-action success have not been verified');
  expect(source).toContain("connectedBanner ? 'CHECK STATUS' : 'REVIEW'");
});
