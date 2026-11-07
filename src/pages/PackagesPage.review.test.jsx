import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import PackagesPage from './PackagesPage.jsx';

test('all 32 governed intake concepts are present without checkout or invented package prices',()=>{
 const html=renderToStaticMarkup(<HelmetProvider><MemoryRouter><PackagesPage/></MemoryRouter></HelmetProvider>);
 expect(html.match(/Scope inquiry only/g)).toHaveLength(32);
 expect(html).toContain('Turnover &amp; Make-Ready Execution');
 expect(html).toContain('Holiday &amp; Seasonal Home Execution');
 expect(html).toContain('Your Holiday Vision. Our Execution.');
 expect(html).toContain('13 divisions');
 expect(html).not.toContain('Add to cart');
 expect(html).not.toContain('Buy package');
});
