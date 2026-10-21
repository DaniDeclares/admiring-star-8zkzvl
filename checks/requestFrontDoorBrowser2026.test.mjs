// Built-artifact browser regression only. Every non-local request is intercepted;
// this is not backend integration, database isolation evidence, or production E2E.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from '@playwright/test';

const build=path.resolve('build');
const service={serviceId:'DNI-11A-017',name:'DTF Apparel',division:'11',family:'Apparel',model:'QUOTE',baseCustomerPrice:25,authorizedChannels:['CH04'],commercialOfferStatus:'INTAKE_ONLY',releaseState:'LIVE_READY'};
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json'};

test('isolated built pages: provider navigation, catalog retry, and quote wording',{timeout:90000},async()=>{
 const server=http.createServer(async(req,res)=>{
  try {
   const requested=path.resolve(build,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
   if(requested!==build&&!requested.startsWith(build+path.sep)){res.writeHead(403).end();return;}
   let file=requested;
   try{if(!(await fs.stat(file)).isFile())file=path.join(build,'index.html');}catch{file=path.join(build,'index.html');}
   res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));
  }catch{res.writeHead(500).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin=`http://127.0.0.1:${server.address().port}`;
 let browser;
 try{
  browser=await chromium.launch({headless:true,timeout:15000});
  const context=await browser.newContext({serviceWorkers:'block'});
  let catalogFailure=false,nonGetAttempts=0;
  await context.route('**/*',async route=>{
   const request=route.request(),url=new URL(request.url());
   if(request.method()!=='GET'){nonGetAttempts++;return route.abort();}
   if(url.origin===origin&&url.pathname==='/api/verify-commercial-intent')return route.fulfill({status:catalogFailure?503:200,json:catalogFailure?{success:false}:{success:true,services:[service],frontDoors:[]}});
   if(url.origin===origin&&!url.pathname.startsWith('/api/'))return route.continue();
   // Supabase and telemetry are blocked before they can leave this browser.
   return route.abort();
  });
  const page=await context.newPage();
  await page.goto(origin+'/portal/access');
  await page.getByRole('button',{name:/Property Manager \/ Apartment/}).click();
  await page.getByRole('link',{name:/Join.*Provider/i}).first().click();
  await page.getByRole('heading',{name:'Service Provider',exact:true}).waitFor();
  await page.locator('.portal-wizard-step').filter({hasText:'Business Details'}).waitFor();
  assert.equal(new URL(page.url()).pathname,'/providers');
  assert.equal(await page.getByRole('heading',{name:/Property Manager/}).count(),0);
  await page.goto(origin+'/shop');
  await page.getByText('Quote required',{exact:true}).first().waitFor();
  await page.getByRole('link',{name:'Order',exact:true}).first().click();
  await page.getByText('Quote required',{exact:true}).first().waitFor();
  assert.equal(await page.getByText(/Starting at/).count(),0);
  catalogFailure=true;
  await page.goto(origin+'/catalog');
  await page.getByRole('alert').waitFor();
  assert.equal(await page.getByText('No matching services',{exact:true}).count(),0);
  catalogFailure=false;
  await page.getByRole('button',{name:'Try again',exact:true}).click();
  await page.getByRole('alert').waitFor({state:'detached'});
  await page.getByText('Service areas',{exact:true}).waitFor();
  assert.equal(nonGetAttempts,0,'No submit/payment/notification mutation attempted');
  await context.close();
 }finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
});
