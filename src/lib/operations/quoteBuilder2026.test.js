import { calculate, resolveCanonicalOffers } from './quoteBuilder2026.js';

const governed = [
  { sku:'DNI-01F-001', name:'Holiday & Seasonal Home Decorating', base_price_cents:10000, sourceType:'GOVERNED' },
  { sku:'DNI-88A-002', name:'Standalone Special', base_price_cents:15000, sourceType:'GOVERNED' },
  { sku:'DNI-99A-001', name:'Locked Service', base_price_cents:5000, sourceType:'GOVERNED' }
];

test('collapses exact canonical special overlap without exposing a second selection', () => {
  const result = resolveCanonicalOffers(
    governed,
    [{ sku:'DSS-CAN-DNI01F001', canonicalSku:'DNI-01F-001', name:'Holiday & Seasonal Home Decorating', base_price_cents:10000, specialPrice:100 }],
    new Map([['DNI-01F-001',[{commercial_offer_status:'SELL_NOW'}]]])
  );
  expect(result).toHaveLength(3);
  expect(result.find(x=>x.sku==='DNI-01F-001').aliasSources).toEqual(['DSS-CAN-DNI01F001']);
});

test('keeps an unresolved price conflict as a nested DANI SPECIAL variant', () => {
  const result = resolveCanonicalOffers(
    governed,
    [{ sku:'DSS-CAN-DNI01F001', canonicalSku:'DNI-01F-001', name:'Holiday & Seasonal Home Decorating', base_price_cents:30000, specialPrice:300 }],
    new Map([['DNI-01F-001',[{commercial_offer_status:'SELL_NOW'}]]])
  );
  const base=result.find(x=>x.sku==='DNI-01F-001');
  expect(base.hasCommercialConflict).toBe(true);
  expect(base.offerVariants).toHaveLength(1);
  expect(base.offerVariants[0].commercialResolution).toBe('UNRESOLVED_PRICE_CONFLICT');
});

test('preserves a special-only canonical offer', () => {
  const result = resolveCanonicalOffers(
    governed,
    [{ sku:'DSS-CAN-DNI88A002', canonicalSku:'DNI-88A-002', name:'Standalone Special', base_price_cents:15000, specialPrice:150 }],
    new Map()
  );
  expect(result.find(x=>x.sku==='DNI-88A-002').canonicalOnlySpecial).toBe(true);
});

test('does not let a special bypass a DO_NOT_SELL governance lock', () => {
  const result = resolveCanonicalOffers(
    governed,
    [{ sku:'DSS-CAN-DNI99A001', canonicalSku:'DNI-99A-001', name:'Locked Service', base_price_cents:5000, specialPrice:50 }],
    new Map([['DNI-99A-001',[{commercial_offer_status:'DO_NOT_SELL'}]]])
  );
  expect(result.find(x=>x.sku==='DSS-CAN-DNI99A001')).toBeUndefined();
});


test('drops canonical specials when every governed counterpart is DO_NOT_SELL', () => {
  const result = resolveCanonicalOffers(
    [{ sku:'DNI-02A-002', name:'Apartment Turn', base_price_cents:15000, sourceType:'GOVERNED' }],
    [{ sku:'DSS-CAN-DNI02A002', canonicalSku:'DNI-02A-002', name:'Apartment Turn', base_price_cents:15000, specialPrice:150 }],
    new Map([['DNI-02A-002',[{commercial_offer_status:'DO_NOT_SELL'}]]])
  );
  expect(result.find(x=>x.sku==='DSS-CAN-DNI02A002')).toBeUndefined();
});


test('prices D11 apparel from the governed production ladder instead of the $25 setup amount', () => {
  const service = {
    sku:'DNI-11A-017',
    pricing_type:'VARIABLE_QUOTE',
    starting_price:25,
    commercial_intent_status:'SELL_NOW',
    quote_input_schema:{ ui_mode:'APPAREL_PRODUCTION' }
  };
  const rule = { pricing_type:'VARIABLE_QUOTE', base_price_cents:2500, resident_discount_eligible:false };

  expect(calculate(service, rule, { quantity:1 }).baseSubtotal).toBe(43);
  expect(calculate(service, rule, { quantity:12 }).baseSubtotal).toBe(300);
  expect(calculate(service, rule, { quantity:13 }).baseSubtotal).toBe(318);
  expect(calculate(service, rule, { quantity:24 }).baseSubtotal).toBe(540);
  expect(calculate(service, rule, { quantity:50 }).baseSubtotal).toBe(1050);
});
