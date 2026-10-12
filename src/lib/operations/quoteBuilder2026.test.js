import { calculate, resolveCanonicalOffers, loadRules, selectBaseRule, missingLockedPriceFlag } from './quoteBuilder2026.js';

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


test('keeps D11 apparel under review until an authoritative total-price formula exists', () => {
  const service = {
    sku:'DNI-11A-017',
    pricing_type:'VARIABLE_QUOTE',
    starting_price:25,
    commercial_intent_status:'SELL_NOW',
    quote_input_schema:{ ui_mode:'APPAREL_PRODUCTION' }
  };
  const rule = { pricing_type:'VARIABLE_QUOTE', base_price_cents:2500, resident_discount_eligible:false };

  for (const quantity of [1,12,13,24,50]) {
    const result = calculate(service, rule, { quantity });
    expect(result.baseSubtotal).toBe(25);
    expect(result.reviewFlags).toContain('APPAREL_TOTAL_PRICE_REVIEW');
    expect(result.needsReview).toBe(true);
  }
});

describe('quote pricing authority', () => {
  test('loadRules reads only ACTIVE and LOCKED pricing rules', async () => {
    const filters = [];
    const chain = {
      select: () => chain,
      eq: (column, value) => { filters.push([column, value]); return chain; },
      order: () => Promise.resolve({ data: [{ id: 'r1', base_price_cents: 12900 }], error: null })
    };
    const rules = await loadRules({ from: () => chain }, 'svc-1', 'CH04');
    expect(rules).toEqual([{ id: 'r1', base_price_cents: 12900 }]);
    expect(filters).toEqual(expect.arrayContaining([['status', 'ACTIVE'], ['lock_status', 'LOCKED']]));
  });
});

describe('locked price authority in the quote calculation', () => {
  const service = { sourceType:'GOVERNED', pricing_type:'FIXED', starting_price: 99, quote_input_schema:{} };
  test('a valid locked rule prices the quote and raises no price flag', () => {
    const c = calculate(service, { base_price_cents: 20000, pricing_type:'FIXED' }, { tax_rate_percent: 6 });
    expect(c.baseSubtotal).toBe(200);
    expect(c.reviewFlags).not.toContain('NO_LOCKED_PRICE_RULE');
    expect(missingLockedPriceFlag(service, { base_price_cents: 20000 })).toBeNull();
  });
  test('client previews (no rule passed) are not flagged by calculate()', () => {
    expect(calculate(service, null, {}).reviewFlags).not.toContain('NO_LOCKED_PRICE_RULE');
  });
  test('missing locked rule fails closed on the server-resolved path', () => {
    expect(missingLockedPriceFlag(service, null)).toBe('NO_LOCKED_PRICE_RULE');
  });
  test('a rule row without a price does not count as locked pricing', () => {
    expect(missingLockedPriceFlag(service, { id: 'r-empty', base_price_cents: null })).toBe('NO_LOCKED_PRICE_RULE');
  });
  test('conflicting rules: the newest priced rule wins and unpriced rows are skipped', () => {
    expect(selectBaseRule([{ id:'new', base_price_cents: 15000 }, { id:'old', base_price_cents: 9000 }]).id).toBe('new');
    expect(selectBaseRule([{ id:'no-price', base_price_cents: null }, { id:'old', base_price_cents: 9000 }]).id).toBe('old');
    expect(selectBaseRule([])).toBeNull();
  });
  test('loadRules returns no rows when no locked rule exists', async () => {
    const chain = { select:()=>chain, eq:()=>chain, order:()=>Promise.resolve({ data: [], error: null }) };
    expect(await loadRules({ from: () => chain }, 'svc-2', 'CH02')).toEqual([]);
  });
  test('inactive or unlocked rules are excluded by query filters', async () => {
    const filters = [];
    const chain = { select:()=>chain, eq:(c,v)=>{ filters.push([c,v]); return chain; }, order:()=>Promise.resolve({ data: [], error: null }) };
    await loadRules({ from: () => chain }, 'svc-3', 'CH04');
    expect(filters).toEqual(expect.arrayContaining([['status','ACTIVE'],['lock_status','LOCKED']]));
  });
  test('apparel, bedroom-tier and DANI special models keep their own governed price source', () => {
    expect(missingLockedPriceFlag({ sourceType:'GOVERNED', quote_input_schema:{ ui_mode:'APPAREL_PRODUCTION' } }, null)).toBeNull();
    expect(missingLockedPriceFlag({ sourceType:'GOVERNED', quote_input_schema:{ pricing_model:'BEDROOM_TIER' } }, null)).toBeNull();
    expect(missingLockedPriceFlag({ sourceType:'DANI_SPECIALS', quote_input_schema:{} }, null)).toBeNull();
  });
});
