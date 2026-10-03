#!/usr/bin/env node
/**
 * DANI GitHub Research Radar V1
 * Three governed discovery lanes:
 * 1) SOLUTIONS: issues/repos that may contain fixes for current DANI problems.
 * 2) UPDATES: releases/maintenance signals for software and infrastructure DANI uses.
 * 3) OPPORTUNITIES: paid/funded GitHub work that can become revenue.
 * Discovery only: never auto-merges, deploys, contacts, spends, or creates CRM records.
 */
const token=process.env.GITHUB_TOKEN;
if(!token) throw new Error('GITHUB_TOKEN required');
const api='https://api.github.com';
const headers={accept:'application/vnd.github+json',authorization:`Bearer ${token}`,'x-github-api-version':'2022-11-28','user-agent':'DANI-GitHub-Research-Radar'};
async function gh(path){const r=await fetch(api+path,{headers});if(!r.ok)throw new Error(`GitHub ${r.status}: ${(await r.text()).slice(0,500)}`);return r.json();}
// GitHub issue search does not support parenthesized Boolean expressions. Keep
// each query valid and narrow; dedupe combines the results below.
const queries=[
 ['SOLUTION','is:issue is:open idempotency'],
 ['SOLUTION','is:issue is:open deduplication reconciliation'],
 ['SOLUTION','is:issue is:open "payment webhook"'],
 ['SOLUTION','is:issue is:open Supabase deployment auth'],
 ['SOLUTION','is:issue is:open Vercel deployment runtime'],
 ['SOLUTION','is:issue is:open "lead scoring" CRM'],
 ['OPPORTUNITY','is:issue is:open bounty -label:security'],
 ['OPPORTUNITY','is:issue is:open "paid task" automation'],
 ['OPPORTUNITY','is:issue is:open freelance documentation']
];
const out=[]; const seen=new Set();
const packageRepos={
  "@prisma/client":"prisma/prisma","prisma":"prisma/prisma",
  "@sentry/node":"getsentry/sentry-javascript","@stripe/stripe-js":"stripe/stripe-js",
  "@supabase/supabase-js":"supabase/supabase-js","react":"facebook/react",
  "react-dom":"facebook/react","react-router-dom":"remix-run/react-router",
  "react-scripts":"facebook/create-react-app","stripe":"stripe/stripe-node",
  "@playwright/test":"microsoft/playwright","checkly":"checkly/checkly-cli"
};
async function latestReleases(){
 const pkg=await gh('/repos/DaniDeclares/admiring-star-8zkzvl/contents/package.json');
 const raw=Buffer.from(pkg.content,'base64').toString('utf8'); const p=JSON.parse(raw);
 const deps={...(p.dependencies||{}),...(p.devDependencies||{})}; const updates=[];
 for(const [name,current] of Object.entries(deps)){
   const rr=packageRepos[name]; if(!rr) continue;
   try{
     const rel=await gh('/repos/'+rr+'/releases/latest');
     updates.push({lane:'UPDATE',package:name,current_version:current,repository:rr,
       latest_tag:rel.tag_name||null,released_at:rel.published_at||rel.created_at||null,
       release_url:rel.html_url||null,title:rel.name||null,
       next_action:'Review release notes for security, compatibility, performance, and useful capability changes before upgrading.'
     });
   }catch{}
 }
 return updates;
}

for(const [lane,q] of queries){
 const data=await gh('/search/issues?per_page=30&sort=updated&order=desc&q='+encodeURIComponent(q));
 for(const i of data.items||[]){
   if(seen.has(i.html_url)) continue; seen.add(i.html_url);
   const body=i.body||'';
   const text=`${i.title}\n${body}`;
   const amount=Math.max(0,...[...text.matchAll(/\$\s?([0-9][0-9,]*(?:\.\d{1,2})?)/g)].map(m=>Number(m[1].replaceAll(',',''))).filter(Number.isFinite));
   out.push({
     lane,source:'GITHUB',url:i.html_url,repo:i.repository_url?.split('/repos/')[1]||null,
     issue_number:i.number,title:i.title,updated_at:i.updated_at,
     labels:(i.labels||[]).map(x=>typeof x==='string'?x:x.name),
     comments:Number(i.comments||0),explicit_usd_amount:amount||null,
     evidence_signals:{
       idempotency:/\bidempotenc/i.test(text),dedupe:/\bduplicate|dedup/i.test(text),
       reconciliation:/reconcil/i.test(text),collision:/collision/i.test(text),
       deployment:/deploy|runtime|webhook|credential|auth/i.test(text),
       scoring:/score|qualification|promotion/i.test(text),
       payment:/payment|payout|bounty|reward|funded/i.test(text),
       async:/async|remote|documentation|research|data|testing|audit/i.test(text)
     },
     next_action:lane==='SOLUTION'
       ? 'Compare against existing DANI authority; reuse evidence before building.'
       : 'Verify current funding/release state, capability fit, and source freshness before pursuit.',
     auto_action_allowed:false
   });
 }
}
const updates=await latestReleases();
out.push(...updates);
out.sort((a,b)=>(b.explicit_usd_amount||0)-(a.explicit_usd_amount||0)||String(b.updated_at||b.released_at||'').localeCompare(String(a.updated_at||a.released_at||'')));
process.stdout.write(JSON.stringify({worker:'DANI_GITHUB_RESEARCH_RADAR',generated_at:new Date().toISOString(),candidate_count:out.length,candidates:out.slice(0,150)}));
