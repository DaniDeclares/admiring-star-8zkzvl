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
const queries=[
 ['SOLUTION','is:issue is:open (idempotency OR deduplication OR reconciliation OR "collision detection" OR "sales queue" OR "payment webhook" OR "double booking")'],
 ['SOLUTION','is:issue is:open (Netlify OR Supabase OR Stripe OR GitHub Actions OR Vercel) (deploy OR deployment OR webhook OR auth OR credential OR runtime)'],
 ['SOLUTION','is:issue is:open (lead scoring OR lead promotion OR CRM OR "duplicate leads" OR "sales automation")'],
 ['OPPORTUNITY','is:issue is:open ("paid bounty" OR bounty OR reward OR payment OR funded) -label:security'],
 ['OPPORTUNITY','is:issue is:open ("contractor" OR freelance OR "paid task") (documentation OR research OR data OR testing OR audit OR automation)']
];
const out=[]; const seen=new Set();
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
out.sort((a,b)=>(b.explicit_usd_amount||0)-(a.explicit_usd_amount||0)||b.updated_at.localeCompare(a.updated_at));
process.stdout.write(JSON.stringify({worker:'DANI_GITHUB_RESEARCH_RADAR',generated_at:new Date().toISOString(),candidate_count:out.length,candidates:out.slice(0,150)}));
