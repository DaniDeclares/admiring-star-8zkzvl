import fs from 'fs';
import path from 'path';

describe('GovernedServicePicker contract',()=>{
 const source=fs.readFileSync(path.join(__dirname,'GovernedServicePicker.jsx'),'utf8');
 test('keeps the generic request path available',()=>{
  expect(source).toContain('Tell us the situation instead');
  expect(source).toContain('(optional)');
 });
 test('uses the governed catalog selector instead of hard-coded services or prices',()=>{
  expect(source).toContain('requestCatalogServices');
  expect(source).toContain('selectRequestCatalogService');
  expect(source).not.toContain('Bathroom Detail & Sanitization');
  expect(source).not.toContain('$65');
 });
 test('returns a governed service object to the page',()=>{
  expect(source).toContain('onSelect?.(selectRequestCatalogService');
 });
});
