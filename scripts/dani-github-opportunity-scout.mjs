#!/usr/bin/env node
/**
 * DANI GitHub Opportunity Scout V1
 * Discovery/qualification only. Never claims issues, comments, opens PRs, spends funds, or creates CRM records.
 * Output is a canonical candidate envelope for the existing sales intake path.
 */
const token=process.env.GITHUB_TOKEN;
if(!token) throw new Error('GITHUB_TOKEN required');
const api='https://api.github.com';
const headers={accept:'application/vnd.github+json',authorization:`Bearer ${token}`,'x-github-api-version':'2022-11-28','user-agent':'DANI-GitHub-Opportunity-Scout'};
const queries=[
 'is:issue is:open ("paid bounty" OR bounty OR reward) -label:security',
 'is:issue is:open label:"help wanted" (paid OR contract OR freelance OR bounty)',
 'is:issue is:open ("contractor" OR "freelance" OR "paid task")'
];
const money=/\$\s?([0-9][0-9,]*(?:\.\d{1,2})?)/g;
const bad=/\b(proposed bounty|proposal only|waiting sponsor|unfunded|expired|closed bounty|already claimed|assigned)\b/i;
const strong=/\b(paid|funded|bounty|reward|payment|payout|usd|usdc)\b/i;
const agent=/\b(agent[- ]?ready|agents? welcome|ai[- ]?agent|automation)\b/i;
const admin=/\b(documentation|docs|research|data|spreadsheet|directory|submission|listing|admin|operations|qa|testing|audit|content|article|marketing|outreach)\b/i;
const code=/\b(typescript|javascript|python|react|node|api|bug|code|implementation|refactor|test|ci|cli)\b/i;
async function gh(path){const r=await fetch(api+path,{headers});if(!r.ok)throw new Error(`GitHub ${r.status}: ${(await r.text()).slice(0,500)}`);return r.json();}
const seen=new Map();
for(const q of queries){
 const data=await gh('/search/issues?per_page=50&sort=updated&order=desc&q='+encodeURIComponent(q));
 for(const i of data.items||[]) seen.set(i.html_url,i);
}
const now=Date.now();
const out=[];
for(const i of seen.values()){
 const text=`${i.title}\n${i.body||''}`;
 if(bad.test(text)) continue;
 const amounts=[...text.matchAll(money)].map(m=>Number(m[1].replaceAll(',',''))).filter(Number.isFinite);
 const usd=Math.max(0,...amounts);
 const ageDays=Math.max(0,(now-Date.parse(i.updated_at))/86400000);
 let score=0;
 if(strong.test(text)) score+=25;
 if(usd>=100) score+=25; else if(usd>=50) score+=15; else if(usd>0) score+=5;
 score+=Math.max(0,15-Math.floor(ageDays));
 if((i.assignees||[]).length===0) score+=10;
 if(agent.test(text)) score+=10;
 if(admin.test(text)) score+=12;
 if(code.test(text)) score+=5;
 const lane=admin.test(text)?'DANI_SERVICE_OR_PROVIDER_FIT':code.test(text)?'TECH_PROVIDER_OR_AUTOMATION_FIT':'MANUAL_REVIEW';
 out.push({
  source:'GITHUB',source_url:i.html_url,repo:i.repository_url?.split('/repos/')[1]||null,issue_number:i.number,
  title:i.title,updated_at:i.updated_at,labels:(i.labels||[]).map(x=>typeof x==='string'?x:x.name),
  assignee_count:(i.assignees||[]).length,explicit_usd_amount:usd||null,score,lane,
  payment_signal:strong.test(text),agent_signal:agent.test(text),
  qualification_state:score>=55?'QUALIFIED_REVIEW':score>=35?'NEEDS_ENRICHMENT':'LOW_PRIORITY',
  required_next_action:'VERIFY_FUNDING_CLAIM_STATE_ACCEPTANCE_PAYOUT_AND_DANI_CAPABILITY_BEFORE_PURSUIT',
  auto_claim_allowed:false,auto_contact_allowed:false,auto_crm_create_allowed:false
 });
}
out.sort((a,b)=>b.score-a.score || (b.explicit_usd_amount||0)-(a.explicit_usd_amount||0));
process.stdout.write(JSON.stringify({worker:'DANI_GITHUB_OPPORTUNITY_SCOUT',generated_at:new Date().toISOString(),candidate_count:out.length,candidates:out.slice(0,100)}));
