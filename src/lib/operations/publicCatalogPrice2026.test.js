import {publicCatalogPriceLabel} from './publicCatalogPrice2026.js';

test.each([null,{}, {baseCustomerPrice:25}, {publicPriceDisplay:''}, {publicPriceDisplay:'  '}, {publicPriceDisplay:25}])('numeric or missing public wording fails safely to quote: %p',service=>{
 expect(publicCatalogPriceLabel(service)).toBe('Quote required');
});
test('preserves authoritative public wording',()=>expect(publicCatalogPriceLabel({publicPriceDisplay:' $40 per visit '})).toBe('$40 per visit'));
test('government path hides public pricing',()=>expect(publicCatalogPriceLabel({publicPriceDisplay:'$40'},true)).toBe('Solicitation / quote'));
