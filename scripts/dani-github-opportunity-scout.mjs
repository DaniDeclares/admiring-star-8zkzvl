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
const sourceUrl=/\bsource\s*url\s*[:=-]\s*(https?:\/\/[^\s)>\]]+)/i;
const mirror=/\b(mirror(?:ed)?|cross[- ]?post(?:ed)?|copied from|original issue|source url)\b/i;
const payoutRisk=/\b(payment not guaranteed|payout not guaranteed|creator pays|maintainer pays|sponsor pays|payment arranged|payment outside|subject to approval|discretionary payout)\b/i;
const opire=/\bopire\b/i;
const issuehunt=/\bissuehunt\b/i;
const algora=/\balgora\b/i;
const nonOpportunity=/\b(no bounty|not a bounty|not accepting submissions|not accepting prs|not accepting pull requests|informational only|discussion only)\b/i;
const explicitlyUnfunded=/\b(unfunded|not funded|funding pending|seeking sponsor|waiting sponsor|proposed bounty|proposal only)\b/i;
const asyncFriendly=/\b(async(?:hronous)?|remote|work from home|documentation|docs|research|data|spreadsheet|directory|admin|operations|qa|testing|audit|content|article|marketing|outreach)\b/i;
const synchronousRequired=/\b(phone calls?|cold calls?|call clients?|appointment setting|live calls?|zoom|required meetings?|on[- ]?site|onsite|in[- ]person|driv(?:e|ing)|travel required)\b/i;
async function gh(path){const r=await fetch(api+path,{headers});if(!r.ok)throw new Error(`GitHub ${r.status}: ${(await r.text()).slice(0,500)}`);return r.json();}
const seen=new Map();
for(const q of queries){
 const data=await gh('/search/issues?per_page=50&sort=updated&order=desc&q='+encodeURIComponent(q));
 for(const i of data.items||[]){
   const t=`${i.title}\n${i.body||''}`;
   const canonical=(t.match(sourceUrl)||[])[1]||i.html_url;
   const existing=seen.get(canonical);
   // Prefer the canonical/original issue over a mirror when both are present.
   if(!existing || (existing.html_url!==canonical && i.html_url===canonical)) seen.set(canonical,i);
 }
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
 const comments=Number(i.comments||0);
 if(comments>=1000) score-=60;
 else if(comments>=250) score-=45;
 else if(comments>=75) score-=30;
 else if(comments>=25) score-=15;
 else if(comments>=10) score-=5;
 if((i.assignees||[]).length>0) score-=20;
 if(mirror.test(text)) score-=25;
 if(payoutRisk.test(text)) score-=25;
 if(nonOpportunity.test(text)) score-=50;
 if(explicitlyUnfunded.test(text)) score-=60;
 if(asyncFriendly.test(text) && !synchronousRequired.test(text)) score+=10;
 if(synchronousRequired.test(text)) score-=35;
 if(opire.test(text)) score-=10; // Opire docs: creator reviews/arranges payment; platform does not guarantee payer performance.
 if(issuehunt.test(text) && /submitted pull requests?/i.test(text)) score-=20;
 if(agent.test(text)) score+=10;
 if(admin.test(text)) score+=12;
 if(code.test(text)) score+=5;
 const lane=admin.test(text)?'DANI_SERVICE_OR_PROVIDER_FIT':code.test(text)?'TECH_PROVIDER_OR_AUTOMATION_FIT':'MANUAL_REVIEW';
 out.push({
  source:'GITHUB',source_url:i.html_url,canonical_source_url:(text.match(sourceUrl)||[])[1]||i.html_url,
  is_mirror:mirror.test(text),repo:i.repository_url?.split('/repos/')[1]||null,issue_number:i.number,
  title:i.title,updated_at:i.updated_at,labels:(i.labels||[]).map(x=>typeof x==='string'?x:x.name),
  assignee_count:(i.assignees||[]).length,comment_count:Number(i.comments||0),explicit_usd_amount:usd||null,score,lane,
  competition_state:Number(i.comments||0)>=75?'EXTREME':Number(i.comments||0)>=25?'HIGH':Number(i.comments||0)>=10?'MEDIUM':'LOW',
  payment_signal:strong.test(text),agent_signal:agent.test(text),
  platform_hint:opire.test(text)?'OPIRE':issuehunt.test(text)?'ISSUEHUNT':algora.test(text)?'ALGORA':'DIRECT_OR_OTHER',
  payer_risk_state:payoutRisk.test(text)||opire.test(text)?'REQUIRES_PAYER_HISTORY_VERIFICATION':'UNKNOWN_OR_PLATFORM_DEPENDENT',
  funding_state:explicitlyUnfunded.test(text)?'NOT_FUNDED':/\b(escrowed|fully funded|funds secured)\b/i.test(text)?'ESCROW_OR_FUNDED_SIGNAL':'UNVERIFIED',
  work_mode_state:synchronousRequired.test(text)?'SYNCHRONOUS_OR_LOCATION_DEPENDENCY':asyncFriendly.test(text)?'REMOTE_ASYNC_SIGNAL':'UNVERIFIED',
  qualification_state:score>=55?'QUALIFIED_REVIEW':score>=35?'NEEDS_ENRICHMENT':'LOW_PRIORITY',
  pursuit_disposition:(nonOpportunity.test(text)||explicitlyUnfunded.test(text))?'REJECT_NOT_CURRENTLY_PAYABLE':synchronousRequired.test(text)?'REJECT_CURRENT_WORK_MODE_CONSTRAINT':(Number(i.comments||0)>=75||mirror.test(text))?'DO_NOT_ALLOCATE_BUILD_YET':(payoutRisk.test(text)||opire.test(text))?'VERIFY_PAYER_HISTORY_BEFORE_BUILD':score>=55?'VERIFY_FOR_PURSUIT':'RESEARCH_ONLY',
  required_next_action:'VERIFY_FUNDING_CLAIM_STATE_ACCEPTANCE_PAYOUT_AND_DANI_CAPABILITY_BEFORE_PURSUIT',
  auto_claim_allowed:false,auto_contact_allowed:false,auto_crm_create_allowed:false
 });
}
out.sort((a,b)=>b.score-a.score || (b.explicit_usd_amount||0)-(a.explicit_usd_amount||0));
process.stdout.write(JSON.stringify({worker:'DANI_GITHUB_OPPORTUNITY_SCOUT',generated_at:new Date().toISOString(),candidate_count:out.length,candidates:out.slice(0,100)}));
