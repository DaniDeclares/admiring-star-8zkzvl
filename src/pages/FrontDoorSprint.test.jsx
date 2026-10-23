import React from 'react';
import {createRoot} from 'react-dom/client';
import {act} from 'react-dom/test-utils';
import {BrowserRouter, Link, Routes, Route} from 'react-router-dom';
import PortalAccessRoute from './PortalAccessRoute.jsx';
import CommercialCatalogPage from './CommercialCatalogPage.jsx';
import ShopPage from './ShopPage.jsx';
import RequestServicePage from './RequestServicePage.jsx';

jest.mock('../lib/supabaseClient.js',()=>({supabase:{auth:{getSession:async()=>({data:{session:null}})},from:()=>{const q={};for(const name of ['select','neq','order','lt','in','eq','or'])q[name]=()=>q;q.then=resolve=>Promise.resolve({data:[],error:null}).then(resolve);return q;}}}));
jest.mock('../lib/posthogAnalytics.js',()=>({capture:jest.fn(),captureServiceLifecycle:jest.fn()}));
jest.mock('../lib/sentry.js',()=>({captureSentryEvent:jest.fn(),captureSentryException:jest.fn()}));

let host,root;
const render=async element=>{await act(async()=>{root.render(element);});};
const click=async element=>{expect(element).toBeTruthy();await act(async()=>{element.dispatchEvent(new MouseEvent('click',{bubbles:true}));});};
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;host=document.createElement('div');document.body.appendChild(host);root=createRoot(host);window.history.replaceState({},'', '/');global.fetch=jest.fn();});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();jest.restoreAllMocks();delete global.fetch;});
const response=services=>({ok:true,json:async()=>({success:true,services})});

test('property signup navigation to providers resets the actual form without refresh',async()=>{
 window.history.replaceState({},'', '/portal/access');
 await render(<BrowserRouter><Link to="/providers">Provider route</Link><Link to="/portal/access?role=business">Business route</Link><Routes><Route path="/portal/access" element={<PortalAccessRoute/>}/><Route path="/providers" element={<PortalAccessRoute/>}/></Routes></BrowserRouter>);
 await click([...host.querySelectorAll('button')].find(b=>b.textContent.includes('Property Manager / Apartment')));
 expect(host.textContent).toContain('Property Manager / Apartment');
 await click([...host.querySelectorAll('a')].find(a=>a.textContent==='Provider route'));
 expect(window.location.pathname).toBe('/providers');
 expect(host.textContent).toContain('Business Details');
 expect(host.textContent).not.toContain('Property Manager / Apartment');
 await click([...host.querySelectorAll('a')].find(a=>a.textContent==='Business route'));
 expect(host.textContent).not.toContain('Business Details');
 expect(host.textContent).toContain('Business');
 await act(async()=>{await new Promise(resolve=>{window.addEventListener('popstate',resolve,{once:true});window.history.back();});});
 expect(window.location.pathname).toBe('/providers');
 expect(host.textContent).toContain('Business Details');
 await act(async()=>{await new Promise(resolve=>{window.addEventListener('popstate',resolve,{once:true});window.history.forward();});});
 expect(window.location.search).toBe('?role=business');
 expect(host.textContent).not.toContain('Business Details');
});

test('direct provider navigation renders provider form',async()=>{
 window.history.replaceState({},'', '/providers');
 await render(<BrowserRouter><PortalAccessRoute/></BrowserRouter>);
 expect(host.textContent).toContain('Business Details');
 expect(host.textContent).not.toContain('Property Manager / Apartment');
});

test.each(['network','http','malformed'])('catalog %s failure is recoverable and does not claim no matches',async kind=>{
 if(kind==='network')fetch.mockRejectedValueOnce(new Error('Failed to fetch'));
 if(kind==='http')fetch.mockResolvedValueOnce({ok:false,json:async()=>({success:false})});
 if(kind==='malformed')fetch.mockResolvedValueOnce({ok:true,json:async()=>({success:true,services:{}})});
 await render(<BrowserRouter><CommercialCatalogPage/></BrowserRouter>);
 expect(host.querySelector('[role="alert"]').textContent).toContain('Please try again');
 expect(host.textContent).not.toContain('No matching services');
 fetch.mockResolvedValueOnce(response([]));
 await click([...host.querySelectorAll('button')].find(b=>b.textContent==='Try again'));
 expect(fetch).toHaveBeenCalledTimes(2);
 expect(host.querySelector('[role="alert"]')).toBeNull();
 expect(host.textContent).toContain('No matching services');
});

test.each([undefined,'From $40 per approved scope'])('service request uses approved public wording (%s)',async publicPriceDisplay=>{
 const service={serviceId:'DNI-11A-017',name:'DTF Apparel',division:'11',family:'Apparel',model:'QUOTE',baseCustomerPrice:25,publicPriceDisplay,authorizedChannels:['CH04'],commercialOfferStatus:'INTAKE_ONLY',releaseState:'LIVE_READY'};
 fetch.mockImplementation(async()=>response([service]));
 window.history.replaceState({},'', '/request-service?service=DNI-11A-017');
 await render(<BrowserRouter><RequestServicePage/></BrowserRouter>);
 expect(host.textContent).toContain(publicPriceDisplay||'Quote required');
 expect(host.textContent).not.toContain('Starting at');
 expect(fetch.mock.calls.every(([,options])=>!options?.method||options.method==='GET')).toBe(true);
});

test('shop displays only published Shopify products with photos and correct store destinations',async()=>{
 fetch.mockResolvedValueOnce({ok:true,json:async()=>({products:[
 {id:11,title:'Live Mug',handle:'live-mug',published_at:'2026-10-21',product_type:'Mugs',image:{src:'https://cdn.shopify.com/live.jpg'},variants:[{price:'17.99',available:true}]},
 {id:12,title:'Draft Mug',handle:'draft-mug',published_at:null,variants:[{price:'1',available:true}]}
 ]})});
 await render(<BrowserRouter><ShopPage/></BrowserRouter>);
 expect(fetch).toHaveBeenCalledWith('https://danideclares.myshopify.com/products.json?limit=250',expect.any(Object));
 expect(host.textContent).toContain('Live Mug');
 expect(host.textContent).toContain('$17.99');
 expect(host.textContent).not.toContain('Draft Mug');
 expect(host.querySelector('img').src).toBe('https://cdn.shopify.com/live.jpg');
 expect([...host.querySelectorAll('a')].some(a=>a.href==='https://danideclares.myshopify.com/products/live-mug')).toBe(true);
 expect(host.textContent).toContain('Request a custom quote');
});

test('shop catalog fetch error offers direct Shopify fallback',async()=>{
 fetch.mockRejectedValueOnce(new Error('network error'));
 await render(<BrowserRouter><ShopPage/></BrowserRouter>);
 expect(host.querySelector('[role="alert"]').textContent).toContain('could not be loaded');
 expect(host.querySelector('[role="alert"] a').href).toBe('https://danideclares.myshopify.com/');
});

test('sold-out Shopify items retain their detail link but do not claim direct purchase',async()=>{
 fetch.mockResolvedValueOnce({ok:true,json:async()=>({products:[{
  id:13,title:'Sold Out Tote',handle:'sold-out-tote',published_at:'2026-10-21',product_type:'Bags',images:[{src:'https://cdn.shopify.com/tote.jpg'}],variants:[{price:'25.00',available:false}]
 }]})});
 await render(<BrowserRouter><ShopPage/></BrowserRouter>);
 expect(host.textContent).toContain('Sold Out Tote');
 expect(host.textContent).toContain('View product in store');
 expect(host.textContent).not.toContain('View options & buy');
});
