/* Contained browser acceptance of the actual component. All business data is synthetic. */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const webpack = require('webpack');
const { chromium } = require('@playwright/test');

async function main() {
  process.env.NODE_ENV = 'test';
  const root = path.resolve(__dirname, '..');
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'dani-assistant-'));
  const entry = path.join(temp, 'entry.jsx');
  fs.writeFileSync(entry, `import React from 'react';
import {createRoot} from 'react-dom/client';
import WorkClock from ${JSON.stringify(path.join(root,'src/pages/portal/WorkClock.jsx'))};
import ${JSON.stringify(path.join(root,'src/index.css'))};
import ${JSON.stringify(path.join(root,'src/pages/portal/PortalWorkspacePage.css'))};
createRoot(document.getElementById('root')).render(<main className="portal-shell"><WorkClock session={{access_token:'fixture-only',user:{id:'fixture-owner'}}}/></main>);`);
  await new Promise((resolve,reject)=>{
    const compiler = webpack({mode:'development',entry,output:{path:temp,filename:'app.js'},
      resolve:{modules:[path.join(root,'node_modules'),'node_modules']},
      module:{rules:[{test:/\.[cm]?jsx?$/,exclude:/node_modules/,use:{loader:require.resolve('babel-loader'),options:{presets:[require.resolve('babel-preset-react-app')],babelrc:false,configFile:false}}},
        {test:/\.css$/,use:[require.resolve('style-loader'),require.resolve('css-loader')]}]},
      plugins:[new webpack.DefinePlugin({'process.env.NODE_ENV':JSON.stringify('test')})]});
    compiler.run((error,stats)=>compiler.close(()=>error||stats.hasErrors()?reject(error||new Error(stats.toString({all:false,errors:true}))):resolve()));
  });
  const server=http.createServer((req,res)=>{
    res.setHeader('Content-Type',req.url==='/app.js'?'application/javascript; charset=utf-8':'text/html; charset=utf-8');
    res.end(req.url==='/app.js'?fs.readFileSync(path.join(temp,'app.js')):'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script src="/app.js"></script></body></html>');
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    const launch={headless:true};
    if(process.env.DANI_TEST_CHROMIUM_PATH) launch.executablePath=process.env.DANI_TEST_CHROMIUM_PATH;
    if(process.env.DANI_TEST_CHROMIUM_NO_SANDBOX==='1') launch.args=['--no-sandbox'];
    browser=await chromium.launch(launch);
    const context=await browser.newContext({viewport:{width:1280,height:950},timezoneId:'America/New_York'});
    const page=await context.newPage(); const mutations=[];const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    let running=null;let entries=[];
    await page.route('**/*',async route=>{
      const req=route.request();const url=new URL(req.url());
      if(url.origin!==origin) return route.abort();
      if(url.pathname!=='/api/portal-operations') return route.continue();
      if(req.headers().authorization!=='Bearer fixture-only') throw new Error('Missing fixture authentication');
      if(req.method()==='POST') {
        const payload=req.postDataJSON();mutations.push(payload);
        assert.equal(payload.action,'work_clock');
        if(payload.event==='START'||payload.event==='RESUME') {running={id:'clock-fixture',entry_status:'RUNNING',started_at:new Date().toISOString(),metadata:{study_code:'MONDAY_SALES',task_code:'FOLLOW_UP'}};entries=[running];}
        if(payload.event==='PAUSE') {entries=[{...running,entry_status:'PAUSED',ended_at:new Date().toISOString()}];running=null;}
        return route.fulfill({json:{success:true}});
      }
      if(url.searchParams.has('workClock')) return route.fulfill({json:{success:true,clock:{entries,running}}});
      return route.fulfill({json:{success:true,ownerAttention:[{id:'fixture-task',reason:'Review the event preparation decision',recommended_action:'Check the organizer instructions before choosing a role.'}],appointments:[{id:'fixture-appointment',starts_at:'2026-11-07T16:00:00Z',appointment_status:'PENDING'}]}});
    });
    await page.clock.install({time:new Date('2026-11-02T15:00:00Z')});
    await page.goto(origin);
    await page.getByRole('heading',{name:'Review the event preparation decision'}).waitFor();
    await page.getByRole('button',{name:'Clock in',exact:true}).click();
    await page.getByRole('button',{name:'Focus for 10 minutes'}).click();
    await page.clock.runFor(60000);
    await page.getByText('9:00 remaining',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Take a break'}).click();
    await page.locator('.pa-timer').filter({hasText:'· paused'}).waitFor();
    const pausedTimer=await page.locator('.pa-timer').textContent();
    await page.clock.runFor(60000);
    assert.equal(await page.locator('.pa-timer').textContent(),pausedTimer,'break must not consume focus time');
    await page.getByRole('button',{name:'I’m back'}).click();
    await page.getByRole('button',{name:'I’m stuck'}).click();
    await page.getByText('Let’s make it smaller.',{exact:true}).waitFor();
    await page.locator('summary').filter({hasText:'Upcoming commitments & preparation'}).click();
    await page.getByText('Outside your usual hours — attendance decision needed.').waitFor();
    await page.screenshot({path:path.join(temp,'desktop.png'),fullPage:true});
    await page.setViewportSize({width:390,height:844});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'mobile overflow');
    await page.screenshot({path:path.join(temp,'mobile.png'),fullPage:true});
    assert.deepEqual(mutations.map(x=>x.event),['START','PAUSE','RESUME']);
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({result:'PASS',browser:'Chromium',checks:['authenticated snapshot','existing clock START/PAUSE/RESUME','focus pause','stuck guidance','after-hours visibility','mobile overflow','no other mutations','no browser errors'],screenshots:temp}));
  } finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
