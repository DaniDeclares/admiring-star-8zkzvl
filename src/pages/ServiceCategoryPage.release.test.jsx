import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ServiceCard } from './ServiceCategoryPage.jsx';

const row=(sku,state,price)=>({serviceId:sku,name:sku,division:'02',releaseState:state,checkoutEligible:state==='LIVE_READY',baseCustomerPrice:price,publicPriceDisplay:'Starting at $'+price.toFixed(2),family:'Property, Facilities & Field Operations'});
test('a held service has no price or quote request button',()=>{
 const html=renderToStaticMarkup(<ServiceCard base="Punch List" variants={[row('DNI-02A-016','HOLD',125)]}/>);
 expect(html).toContain('Not available to quote');
 expect(html).not.toContain('Starting at $125');
 expect(html).not.toContain('request-service?service=');
});
test('a mixed grouping uses only released variant pricing and CTA',()=>{
 const html=renderToStaticMarkup(<ServiceCard base="Example grouped scope" variants={[row('DNI-02A-016','HOLD',125),row('DNI-02A-009','LIVE_READY',175)]}/>);
 expect(html).toContain('Some options are not currently available');
 expect(html).toContain('request-service?service=DNI-02A-009');
 expect(html).not.toContain('request-service?service=DNI-02A-016');
 expect(html).not.toContain('Starting at $125');
});
test('unverified release status fails closed',()=>{
 const html=renderToStaticMarkup(<ServiceCard base="Unverified" variants={[row('DNI-02A-029',null,150)]}/>);
 expect(html).toContain('Not available to quote');
 expect(html).not.toContain('request-service?service=');
});
