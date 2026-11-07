import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const nav=readFileSync(new URL('../src/components/Navbar.jsx',import.meta.url),'utf8');
const shop=readFileSync(new URL('../src/pages/ShopPage.jsx',import.meta.url),'utf8');
test('existing merch shop linked in desktop and mobile nav',()=>{
 assert.match(nav,/<NavLink[^>]+to="\/shop">Shop & Merch<\/NavLink>/);
 assert.match(nav,/<Link[^>]+to="\/shop"[^>]*>Shop & Merch<\/Link>/);
});
test('shop has a real existing route and outage fallback',()=>{
 const app=readFileSync(new URL('../src/App.js',import.meta.url),'utf8');
 assert.match(app,/path="\/shop"/);
 assert.match(shop,/\{error && <div role="alert"[^>]*>The live product catalog could not be loaded\./);
 assert.match(shop,/<a[^>]*href=\{STORE\}[^>]*>Open our Shopify store<\/a>/);
});
