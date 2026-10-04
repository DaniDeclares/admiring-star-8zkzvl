#!/usr/bin/env node

/**
 * OWNER PERSONAL CANDIDATE MINER
 * Public-source discovery only. No login, DM, comment, follow, contact, or outreach.
 * Writes only evidence-backed candidate records to the existing owner-personal table.
 */

const DRY_RUN=process.argv.includes('--dry-run')||process.env.DANI_MINER_DRY_RUN==='1';
const SUPABASE_URL=(process.env.PRODUCTION_SUPABASE_URL||'').replace(/\/+$/,'');
const SUPABASE_KEY=process.env.PRODUCTION_SUPABASE_SERVICE_ROLE_KEY||'';
if(!DRY_RUN&&(!SUPABASE_URL||!SUPABASE_KEY)) throw new Error('Production Supabase credentials are required');

const UA='DANI-Owner-Personal-Candidate-Miner/1.0 (+public research; no contact)';
const SOURCES=[
  {
    name:'LavenderMarriageWorld:new',
    rss:'https://www.reddit.com/r/LavenderMarriageWorld/new/.rss',
    json:'https://www.reddit.com/r/LavenderMarriageWorld/new.json?limit=100&raw_json=1'
  },
  {
    name:'LavenderMarriageWorld:search',
    rss:'https://www.reddit.com/r/LavenderMarriageWorld/search.rss?q=lavender%20marriage&restrict_sr=on&sort=new&t=year',
    json:'https://www.reddit.com/r/LavenderMarriageWorld/search.json?q=lavender%20marriage&restrict_sr=on&sort=new&t=year&limit=100&raw_json=1'
  },
  {
    name:'LavenderMarriageWorld:platonic-search',
    rss:'https://www.reddit.com/r/LavenderMarriageWorld/search.rss?q=platonic%20marriage&restrict_sr=on&sort=new&t=year',
    json:'https://www.reddit.com/r/LavenderMarriageWorld/search.json?q=platonic%20marriage&restrict_sr=on&sort=new&t=year&limit=100&raw_json=1'
  },
  {
    name:'queerplatonic:new',
    rss:'https://www.reddit.com/r/queerplatonic/new/.rss',
    json:'https://www.reddit.com/r/queerplatonic/new.json?limit=100&raw_json=1'
  }
];

const male=/\b(?:m4f|male|man|guy|husband|\d{2}m|m\d{2})\b/i;
const explicitArrangement=/\b(?:lavender marriage|marriage of convenience|platonic marriage|platonic life partner|queerplatonic|qpp|co[- ]?parent(?:ing)? arrangement)\b/i;
const family=/\b(?:children|kids|child|family|father|dad|co[- ]?parent(?:ing)?)\b/i;
const financial=/\b(?:financial(?:ly)? stable|provider|career|accountant|engineer|doctor|lawyer|business owner|entrepreneur|professional|home owner|homeowner|stable income|steady job|employed)\b/i;
const bad=/\b(?:visa|green card|citizenship only|sugar daddy|allowance|pay me|send money|crypto|investment opportunity)\b/i;
const ageRe=/\b([2-6]\d)\s*(?:m|male|yo|years? old)\b/i;

function decodeXml(value=''){
  return value
    .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"')
    .replace(/&#39;/g,"'").replace(/&amp;/g,'&');
}
function stripHtml(value=''){ return decodeXml(value).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); }
function textOf(post){ return [post.title||'',post.selftext||''].join('\n').trim(); }
function rssPosts(xml,sourceName){
  const out=[];
  for(const match of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)){
    const entry=match[1];
    const title=decodeXml(entry.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]||'');
    const content=stripHtml(entry.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1]||'');
    const href=decodeXml(entry.match(/<link[^>]+href="([^"]+)"/)?.[1]||'');
    const id=(href.match(/\/comments\/([^/]+)/)||[])[1];
    if(!id||!href) continue;
    out.push({id,title,selftext:content,permalink:new URL(href).pathname,subreddit:sourceName,over_18:false,removed_by_category:null,author:'public-rss'});
  }
  return out;
}
function ageOf(text){ const m=text.match(ageRe); return m?m[1]:null; }
function locationOf(text){
  const m=text.match(/\b(?:based in|living in|live in|from)\s+([A-Z][A-Za-z .,'-]{2,60})(?:[.\n,]|$)/);
  return m?m[1].trim():null;
}
function candidate(post){
  const body=textOf(post);
  if(!male.test(body)||!explicitArrangement.test(body)||bad.test(body)) return null;
  const hasFamily=family.test(body), hasFinancial=financial.test(body);
  if(!hasFamily||!hasFinancial) return null;
  const url='https://www.reddit.com'+post.permalink;
  const age=ageOf(body);
  const loc=locationOf(body);
  const facts={
    public_post:true,
    explicit_arrangement:true,
    family_signal:hasFamily,
    financial_or_career_signal:hasFinancial,
    reddit_post_id:post.id,
    subreddit:post.subreddit,
    observed_utc:new Date().toISOString()
  };
  return {
    candidate_key:'HUSBAND:REDDIT:'+post.id,
    display_name:[age?age+'M':null,loc].filter(Boolean).join(' — ')||'Public Reddit candidate',
    source_url:url,
    source_system:'REDDIT_PUBLIC',
    public_age:age,
    public_location:loc,
    relationship_sought:body.slice(0,1800),
    career_financial_signals:(body.match(financial)?.[0]||'Public career/financial signal observed'),
    family_fit_status:'UNKNOWN_ASK',
    platonic_practical_fit:'EXPLICIT',
    red_flags:[],
    verified_facts:facts,
    owner_questions:[
      'Are six children and a blended household compatible with what you want?',
      'What does financial/provider stability mean in practice for you?',
      'What household, co-parenting and private-life boundaries would you expect?'
    ],
    why_interesting:'Public post explicitly combines a practical/platonic marriage model, family interest, and a career/financial stability signal.',
    confidence:0.70,
    verification_status:'PARTIAL',
    card_status:'REVIEW_READY',
    outreach_authorized:false,
    last_verified_at:new Date().toISOString(),
    updated_at:new Date().toISOString()
  };
}

async function supabase(path,opts={}){
  const r=await fetch(SUPABASE_URL+'/rest/v1/'+path,{
    ...opts,
    headers:{
      apikey:SUPABASE_KEY,
      Authorization:'Bearer '+SUPABASE_KEY,
      'Content-Type':'application/json',
      Prefer:opts.prefer||'',
      ...(opts.headers||{})
    }
  });
  const text=await r.text();
  if(!r.ok) throw new Error('Supabase '+r.status+': '+text.slice(0,500));
  return text?JSON.parse(text):null;
}

async function main(){
  const found=new Map();
  let successfulSources=0;
  for(const source of SOURCES){
    let posts=[];
    let sourceWorked=false;
    try{
      const rss=await fetch(source.rss,{headers:{'User-Agent':UA,'Accept':'application/atom+xml,application/rss+xml,text/xml'}});
      if(rss.ok){
        posts=rssPosts(await rss.text(),source.name);
        sourceWorked=true;
      } else {
        console.warn('rss source unavailable',source.name,rss.status);
      }
    }catch(e){ console.warn('rss source failure',source.name,String(e.message).slice(0,300)); }

    if(!sourceWorked){
      try{
        const r=await fetch(source.json,{headers:{'User-Agent':UA,'Accept':'application/json'}});
        if(r.ok){
          const j=await r.json();
          posts=(j?.data?.children||[]).map(child=>child?.data).filter(Boolean);
          sourceWorked=true;
        } else {
          console.warn('json source unavailable',source.name,r.status);
        }
      }catch(e){ console.warn('json source failure',source.name,String(e.message).slice(0,300)); }
    }

    if(!sourceWorked) continue;
    successfulSources++;
    for(const post of posts){
      if(!post||post.over_18||post.removed_by_category||post.author==='[deleted]') continue;
      const c=candidate(post);
      if(c) found.set(c.candidate_key,c);
    }
  }
  if(successfulSources===0) throw new Error('NO_PUBLIC_CANDIDATE_SOURCE_REACHABLE');

  if(DRY_RUN){
    console.log(JSON.stringify({
      status:'DRY_RUN_COMPLETED',
      public_sources:SOURCES.length,
      reachable_sources:successfulSources,
      qualified_candidates:found.size,
      candidates:[...found.values()].map(c=>({candidate_key:c.candidate_key,source_url:c.source_url,display_name:c.display_name})),
      production_write:false,
      outreach_authorized:false
    }));
    return;
  }

  let upserted=0;
  for(const c of found.values()){
    await supabase('dd_owner_personal_candidates?on_conflict=candidate_key',{
      method:'POST',
      prefer:'resolution=merge-duplicates,return=minimal',
      body:JSON.stringify(c)
    });
    upserted++;
  }

  const refreshed=await supabase('rpc/dd_refresh_owner_personal_candidate_cards',{
    method:'POST',
    body:JSON.stringify({p_limit:25})
  });

  console.log(JSON.stringify({
    status:'COMPLETED',
    public_sources:SOURCES.length,
    reachable_sources:successfulSources,
    qualified_candidates:found.size,
    upserted,
    hq_refresh:refreshed,
    outreach_authorized:false
  }));
}

main().catch(e=>{ console.error(e); process.exit(1); });
