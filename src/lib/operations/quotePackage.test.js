import { calculate, aggregateQuoteCalculations } from './quoteBuilder2026.js';

describe('governed package quote composition', () => {
  const cleaning = {
    sku:'DNI-01A-001',
    name:'Resident Refresh — Standard Maintenance Clean',
    pricing_type:'FIXED',
    base_price_cents:10000,
    starting_price:100,
    sourceType:'GOVERNED',
    commercial_intent_status:'SELL_NOW',
    quote_input_schema:{
      pricing_model:'FIXED_SCOPE',
      fields:[
        {key:'bedroom_count',type:'select',label:'Bedrooms',options:['1','2','3','4+']},
        {key:'bathroom_count',type:'select',label:'Bathrooms',options:['1','2','3','4+']},
        {key:'mess_degree',type:'select',label:'Degree of mess',options:['standard','moderate','heavy','severe']},
        {key:'odor_level',type:'select',label:'Odor level',options:['none','light','heavy','severe']}
      ]
    }
  };
  const detail = {
    sku:'DNI-01A-020',
    name:'Kitchen Appliance Interior & Degrease Detail',
    pricing_type:'STARTING_AT',
    base_price_cents:1500,
    starting_price:15,
    sourceType:'GOVERNED',
    commercial_intent_status:'SELL_NOW',
    quote_input_schema:{fields:[{key:'quantity',type:'number',label:'Quantity / units'}]}
  };
  const rule={pricing_type:'FIXED',billing_cycle:'ONETIME',base_price_cents:10000,resident_discount_eligible:false};

  test('service-specific inputs do not need one universal form', () => {
    expect(cleaning.quote_input_schema.fields.map(f=>f.key)).toEqual(expect.arrayContaining(['bedroom_count','bathroom_count','mess_degree','odor_level']));
    expect(detail.quote_input_schema.fields.map(f=>f.key)).toEqual(['quantity']);
  });

  test('package totals sum governed component calculations', () => {
    const first=calculate(cleaning,rule,{quantity:1,tax_rate_percent:0});
    const second=calculate(detail,{pricing_type:'STARTING_AT',billing_cycle:'ONETIME',base_price_cents:1500},{quantity:2,tax_rate_percent:0});
    const total=aggregateQuoteCalculations([
      {sku:cleaning.sku,calculation:first},
      {sku:detail.sku,calculation:second}
    ]);
    expect(total.baseSubtotal).toBe(25);
    expect(total.estimatedTotal).toBe(25);
    expect(total.reviewFlags).toContain('SCOPE_REVIEW');
  });

  test('package aggregation retains component review gates', () => {
    const first=calculate(cleaning,rule,{tax_rate_percent:0});
    const second=calculate({...detail,pricing_type:'VARIABLE_QUOTE'},{pricing_type:'VARIABLE_QUOTE',billing_cycle:'ONETIME',base_price_cents:1500},{quantity:1,tax_rate_percent:0});
    const total=aggregateQuoteCalculations([
      {sku:cleaning.sku,calculation:first},
      {sku:detail.sku,calculation:second}
    ]);
    expect(total.needsReview).toBe(true);
    expect(total.reviewFlags).toContain('TAX_REVIEW');
    expect(total.reviewFlags).toContain('SCOPE_REVIEW');
  });
});
