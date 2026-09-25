import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json"}});
const clean=(value:string)=>value
  .replace(/<script[\s\S]*?<\/script>/gi," ")
  .replace(/<style[\s\S]*?<\/style>/gi," ")
  .replace(/<[^>]+>/g," ")
  .replace(/&nbsp;/gi," ")
  .replace(/&amp;/gi,"&")
  .replace(/&#39;/g,"'")
  .replace(/&quot;/gi,'"')
  .replace(/\s+/g," ")
  .trim();

async function sha256(bytes:Uint8Array){
  const digest=await crypto.subtle.digest("SHA-256",bytes);
  return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
function safeKey(v:string){return v.toUpperCase().replace(/[^A-Z0-9]+/g,"_").replace(/^_+|_+$/g,"").slice(0,180);}
function signals(text:string,configured:any[]){
  const hay=text.toLowerCase();
  return (Array.isArray(configured)?configured:[]).map((s:any)=>{
    const all=Array.isArray(s?.all)?s.all:[];
    const any=Array.isArray(s?.any)?s.any:[];
    const matched=all.every((v:any)=>hay.includes(String(v).toLowerCase())) &&
      (any.length===0 || any.some((v:any)=>hay.includes(String(v).toLowerCase())));
    return {signal:s?.signal||"unnamed",matched,all,any};
  });
}
function hrefs(html:string,base:string){
  const out=new Set<string>();
  const re=/\b(?:href|src)=["']([^"'#]+)["']/gi;
  let m;
  while((m=re.exec(html))){
    try{const u=new URL(m[1],base); if(["http:","https:"].includes(u.protocol)) out.add(u.toString());}catch{}
  }
  return [...out];
}
function publicTechSignals(html:string,headers:Headers){
  const h=html.toLowerCase();
  const sig:string[]=[];
  const add=(name:string,match:boolean)=>{if(match&&!sig.includes(name))sig.push(name);};
  add("NEXT_JS",h.includes("/_next/")||h.includes("__next_data__"));
  add("VERCEL",h.includes("vercel")||headers.get("x-vercel-id")!==null);
  add("REACT",h.includes("react")||h.includes("react-dom"));
  add("SHOPIFY",h.includes("cdn.shopify.com")||h.includes("shopify"));
  add("WORDPRESS",h.includes("wp-content")||h.includes("wp-json"));
  add("WEBFLOW",h.includes("webflow"));
  add("SUPABASE",h.includes("supabase.co")||h.includes("supabase"));
  add("FIREBASE",h.includes("firebase"));
  add("STRIPE",h.includes("js.stripe.com")||h.includes("stripe"));
  add("TWILIO",h.includes("twilio"));
  add("SEGMENT",h.includes("segment.com")||h.includes("analytics.js"));
  add("HUBSPOT",h.includes("hubspot"));
  add("INTERCOM",h.includes("intercom"));
  return sig;
}
function operatingSignals(text:string){
  const h=text.toLowerCase();
  const keys=["book","schedule","quote","estimate","provider","pro network","dispatch","payment","invoice","photo","checklist","review","marketplace","client portal","customer portal","worker app","contractor"];
  return keys.filter(k=>h.includes(k));
}
function githubParts(raw:string){
  try{
    const u=new URL(raw);
    if(u.hostname!=="github.com") return null;
    const p=u.pathname.split("/").filter(Boolean);
    if(!p.length) return null;
    return {owner:p[0],repo:p[1]||null};
  }catch{return null;}
}
async function fetchText(url:string,timeout=12000){
  const ctl=new AbortController(); const t=setTimeout(()=>ctl.abort(),timeout);
  try{
    const r=await fetch(url,{redirect:"follow",signal:ctl.signal,headers:{
      "User-Agent":"DANI-Public-Research/2.0 (+https://danideclares.com)",
      "Accept":"text/html,text/plain,application/json,application/xml;q=0.9,*/*;q=0.5"
    }});
    const bytes=new Uint8Array(await r.arrayBuffer());
    const ct=(r.headers.get("content-type")||"").toLowerCase();
    const txt=(ct.includes("text")||ct.includes("json")||ct.includes("xml")||url.endsWith(".md"))?new TextDecoder().decode(bytes):"";
    return {r,bytes,txt,ct,hash:await sha256(bytes)};
  } finally {clearTimeout(t);}
}

Deno.serve(async (req:Request)=>{
  if(req.method!=="POST") return json({error:"Method not allowed"},405);
  const url=Deno.env.get("SUPABASE_URL");
  const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!serviceKey) return json({error:"Supabase environment unavailable"},503);
  const db=createClient(url,serviceKey,{auth:{persistSession:false}});

  const officialRoots:Record<string,{home:string;github?:string;type:string;interval:number}> = {
    PAYPAL_BUSINESS:{home:"https://developer.paypal.com/",github:"https://github.com/paypal-examples",type:"PAYMENT_PLATFORM",interval:360},
    STRIPE:{home:"https://docs.stripe.com/",github:"https://github.com/stripe",type:"PAYMENT_PLATFORM",interval:720},
    SUPABASE:{home:"https://supabase.com/docs",github:"https://github.com/supabase",type:"RUNTIME_PLATFORM",interval:720},
    VERCEL:{home:"https://vercel.com/docs",github:"https://github.com/vercel",type:"DEPLOYMENT_PLATFORM",interval:720},
    HUBSPOT:{home:"https://developers.hubspot.com/",github:"https://github.com/HubSpot",type:"CRM_PLATFORM",interval:1440},
    POSTHOG:{home:"https://posthog.com/docs",github:"https://github.com/PostHog",type:"ANALYTICS_PLATFORM",interval:1440}
  };
  const coverage:any[]=[];
  const {data:adapters}=await db.from("dd_integration_adapters").select("adapter_code,provider_name,access_state");
  const {data:activeTargets}=await db.from("dd_research_discovery_targets").select("target_key").eq("status","ACTIVE");
  const existing=new Set((activeTargets||[]).map((x:any)=>String(x.target_key)));
  for(const adapter of adapters||[]){
    const code=String(adapter.adapter_code||"").toUpperCase();
    const cfg=officialRoots[code];
    const targetKey=code+"_PLATFORM_WATCH";
    if(existing.has(targetKey)){coverage.push({adapterCode:code,status:"COVERED"});continue;}
    if(!cfg){coverage.push({adapterCode:code,status:"COVERAGE_GAP"});continue;}
    const {error}=await db.from("dd_research_discovery_targets").upsert({
      program_key:"OPERATING_MODEL_INTELLIGENCE",target_key:targetKey,
      company_name:adapter.provider_name||code,homepage_url:cfg.home,
      github_org_or_repo_url:cfg.github||null,target_type:cfg.type,status:"ACTIVE",
      discovery_interval_minutes:cfg.interval,next_discovery_at:new Date().toISOString(),
      metadata:{autoSeededFromIntegrationRegistry:true,officialSourcePreferred:true,releaseBlocked:true,
        researchQuestion:"Discover current official capabilities, security guidance, implementation changes and release-relevant evidence for this DANI dependency."},
      updated_at:new Date().toISOString()
    },{onConflict:"target_key"});
    coverage.push({adapterCode:code,status:error?"SEED_FAILED":"SEEDED",error:error?.message});
    if(!error) existing.add(targetKey);
  }

  const discoveryOut:any[]=[];
  const {data:targets}=await db.from("dd_research_discovery_targets")
    .select("*").eq("status","ACTIVE").lte("next_discovery_at",new Date().toISOString())
    .order("next_discovery_at",{ascending:true}).limit(2);

  for(const target of targets||[]){
    const foundAssets:any[]=[];
    try{
      const home=await fetchText(target.homepage_url);
      const homeText=clean(home.txt);
      const tech=publicTechSignals(home.txt,home.r.headers);
      const ops=operatingSignals(homeText);

      foundAssets.push({
        asset_key:"HOMEPAGE",asset_type:"PUBLIC_WEBSITE",asset_url:home.r.url,
        title:target.company_name+" homepage",authority_level:"PUBLIC_PRIMARY",discovery_method:"TARGET_SEED",
        content_hash:home.hash,tech_signals:tech,metadata:{contentType:home.ct,httpStatus:home.r.status,operatingSignals:ops}
      });

      const links=hrefs(home.txt,home.r.url);
      for(const path of ["/robots.txt","/sitemap.xml"]){
        try{
          const u=new URL(path,home.r.url).toString();
          const x=await fetchText(u,7000);
          if(x.r.ok) foundAssets.push({
            asset_key:path==="/robots.txt"?"ROBOTS":"SITEMAP",asset_type:path==="/robots.txt"?"ROBOTS_TXT":"SITEMAP",
            asset_url:x.r.url,title:target.company_name+" "+path.slice(1),authority_level:"PUBLIC_PRIMARY",
            discovery_method:"STANDARD_PUBLIC_ENDPOINT",content_hash:x.hash,tech_signals:[],
            metadata:{contentType:x.ct,httpStatus:x.r.status}
          });
        }catch{}
      }

      const interesting=links.filter((l:string)=>{
        const s=l.toLowerCase();
        return s.includes("github.com/")||s.includes("/docs")||s.includes("/developers")||s.includes("/api")||
          s.includes("/help")||s.includes("/support")||s.includes("/providers")||s.includes("/pros");
      }).slice(0,25);

      if(target.github_org_or_repo_url) interesting.unshift(target.github_org_or_repo_url);

      const githubUrls=[...new Set(interesting.filter((x:string)=>x.includes("github.com/")))].slice(0,5);
      for(const gh of githubUrls){
        const parts=githubParts(gh); if(!parts) continue;
        foundAssets.push({
          asset_key:"GITHUB_"+safeKey(parts.owner+(parts.repo?"_"+parts.repo:"")),
          asset_type:parts.repo?"GITHUB_REPOSITORY":"GITHUB_ORGANIZATION",
          asset_url:gh,title:parts.repo?`${parts.owner}/${parts.repo}`:parts.owner,
          authority_level:"PUBLIC_PRIMARY",discovery_method:"PUBLIC_LINK_DISCOVERY",tech_signals:[],metadata:{}
        });

        let repos:any[]=[];
        if(parts.repo){
          try{
            const rr=await fetch(`https://api.github.com/repos/${parts.owner}/${parts.repo}`,{headers:{"User-Agent":"DANI-Public-Research/2.0","Accept":"application/vnd.github+json"}});
            if(rr.ok) repos=[await rr.json()];
          }catch{}
        }else{
          try{
            const rr=await fetch(`https://api.github.com/orgs/${parts.owner}/repos?per_page=8&sort=updated`,{headers:{"User-Agent":"DANI-Public-Research/2.0","Accept":"application/vnd.github+json"}});
            if(rr.ok) repos=await rr.json();
          }catch{}
        }

        for(const repo of repos.slice(0,8)){
          const branch=repo.default_branch||"main";
          for(const spec of [
            {path:"README.md",type:"GITHUB_README"},
            {path:"package.json",type:"PACKAGE_MANIFEST"},
            {path:"pyproject.toml",type:"PACKAGE_MANIFEST"},
            {path:"requirements.txt",type:"PACKAGE_MANIFEST"},
            {path:"Dockerfile",type:"DEPLOYMENT_CONFIG"}
          ]){
            const raw=`https://raw.githubusercontent.com/${repo.owner.login}/${repo.name}/${branch}/${spec.path}`;
            try{
              const x=await fetchText(raw,7000);
              if(!x.r.ok) continue;
              const txt=clean(x.txt).slice(0,12000);
              foundAssets.push({
                asset_key:safeKey(`GH_${repo.full_name}_${spec.path}`),asset_type:spec.type,asset_url:raw,
                title:`${repo.full_name} ${spec.path}`,authority_level:"PUBLIC_PRIMARY",discovery_method:"GITHUB_PUBLIC_REPO_INSPECTION",
                content_hash:x.hash,tech_signals:publicTechSignals(x.txt,x.r.headers),
                metadata:{repo:repo.full_name,defaultBranch:branch,excerpt:txt.slice(0,3000),operatingSignals:operatingSignals(txt)}
              });
            }catch{}
          }
        }
      }

      for(const link of interesting.filter((x:string)=>!x.includes("github.com/")).slice(0,12)){
        foundAssets.push({
          asset_key:"LINK_"+safeKey(link),asset_type:"PUBLIC_DOC_OR_HELP",asset_url:link,title:link,
          authority_level:"PUBLIC_PRIMARY",discovery_method:"PUBLIC_LINK_DISCOVERY",tech_signals:[],metadata:{}
        });
      }

      for(const asset of foundAssets){
        await db.from("dd_research_discovered_assets").upsert({
          target_id:target.id,...asset,last_seen_at:new Date().toISOString()
        },{onConflict:"target_id,asset_key"});

        if(["GITHUB_README","PACKAGE_MANIFEST","DEPLOYMENT_CONFIG","PUBLIC_DOC_OR_HELP"].includes(asset.asset_type)){
          const sourceKey=safeKey(`${target.target_key}_${asset.asset_key}`).slice(0,220);
          await db.from("dd_research_sources").upsert({
            program_key:"OPERATING_MODEL_INTELLIGENCE",
            work_key:"peer-operating-model-discovery",
            source_key:sourceKey,
            source_title:asset.title||sourceKey,
            source_url:asset.asset_url,
            authority_level:"PRIMARY",
            temporal_class:"CURRENT",
            status:"ACTIVE",
            check_interval_minutes:1440,
            expected_signals:[
              {signal:"OPERATING_WORKFLOW",any:["schedule","quote","estimate","dispatch","provider","contractor","payment","invoice","photo","checklist"]},
              {signal:"TECH_STACK",any:["react","next","supabase","stripe","postgres","prisma","vercel","docker","workflow"]}
            ],
            metadata:{discovered:true,targetKey:target.target_key,assetType:asset.asset_type,publicOnly:true},
            updated_at:new Date().toISOString()
          },{onConflict:"source_key"});
        }
      }

      for(const s of tech){
        await db.from("dd_research_operating_model_findings").upsert({
          target_id:target.id,finding_key:"TECH_"+s,finding_type:"PUBLIC_TECH_STACK",
          finding_text:`${target.company_name} exposes public signals consistent with ${s}.`,
          confidence:"OBSERVED",evidence_urls:[home.r.url],metadata:{publicSignal:true},last_observed_at:new Date().toISOString()
        },{onConflict:"target_id,finding_key"});
      }
      for(const s of ops){
        await db.from("dd_research_operating_model_findings").upsert({
          target_id:target.id,finding_key:"OPS_"+safeKey(s),finding_type:"PUBLIC_OPERATING_PATTERN",
          finding_text:`${target.company_name} publicly references the operating concept \"${s}\".`,
          confidence:"OBSERVED",evidence_urls:[home.r.url],metadata:{publicSignal:true},last_observed_at:new Date().toISOString()
        },{onConflict:"target_id,finding_key"});
      }

      const now=new Date();
      await db.from("dd_research_discovery_targets").update({
        last_discovered_at:now.toISOString(),last_error:null,
        next_discovery_at:new Date(now.getTime()+Number(target.discovery_interval_minutes||1440)*60000).toISOString(),
        updated_at:now.toISOString()
      }).eq("id",target.id);

      discoveryOut.push({targetKey:target.target_key,status:"DISCOVERED",assets:foundAssets.length,techSignals:tech,operatingSignals:ops});
    }catch(error){
      const message=error instanceof Error?error.message:String(error);
      await db.from("dd_research_discovery_targets").update({
        last_discovered_at:new Date().toISOString(),last_error:message,
        next_discovery_at:new Date(Date.now()+3600000).toISOString(),updated_at:new Date().toISOString()
      }).eq("id",target.id);
      discoveryOut.push({targetKey:target.target_key,status:"FAILED",error:message});
    }
  }

  const {data:sources,error:sourceError}=await db
    .from("dd_research_sources")
    .select("id,program_key,work_key,source_key,source_title,source_url,authority_level,temporal_class,expected_signals,check_interval_minutes,last_content_hash,next_check_at,status")
    .eq("status","ACTIVE")
    .lte("next_check_at",new Date().toISOString())
    .order("next_check_at",{ascending:true})
    .limit(6);
  if(sourceError) return json({error:sourceError.message,discovery:discoveryOut},500);

  const out:any[]=[];
  for(const source of sources||[]){
    const next=new Date(Date.now()+Number(source.check_interval_minutes||360)*60000).toISOString();
    await db.from("dd_research_sources").update({next_check_at:next,updated_at:new Date().toISOString()}).eq("id",source.id);
    try{
      const x=await fetchText(source.source_url,15000);
      if(!x.r.ok){
        const now=new Date().toISOString();
        const {data:row}=await db.from("dd_research_sources").select("consecutive_failures").eq("id",source.id).maybeSingle();
        await db.from("dd_research_sources").update({
          last_checked_at:now,last_http_status:x.r.status,
          consecutive_failures:Number(row?.consecutive_failures||0)+1,
          last_error:`HTTP_${x.r.status}`,
          next_check_at:new Date(Date.now()+3600000).toISOString(),updated_at:now
        }).eq("id",source.id);
        out.push({sourceKey:source.source_key,status:`HTTP_${x.r.status}`,changed:false,matchedSignals:[]});
        continue;
      }
      const text=clean(x.txt);
      const matched=signals(text,source.expected_signals||[]);
      const changed=Boolean(source.last_content_hash && source.last_content_hash!==x.hash);
      const excerpt=text?text.slice(0,6000):`[${x.ct||"binary"} source; ${x.bytes.length} bytes; content hash recorded]`;
      const now=new Date().toISOString();

      await db.from("dd_research_source_snapshots").insert({
        source_id:source.id,http_status:x.r.status,content_hash:x.hash,content_length:x.bytes.length,
        changed,matched_signals:matched,excerpt,metadata:{finalUrl:x.r.url,contentType:x.ct}
      });
      await db.from("dd_research_sources").update({
        last_checked_at:now,last_http_status:x.r.status,last_content_hash:x.hash,
        last_changed_at:changed?now:undefined,consecutive_failures:0,last_error:null,updated_at:now
      }).eq("id",source.id);

      if(source.work_key){
        const {data:work}=await db.from("dd_research_work_queue").select("attempts,next_action").eq("work_key",source.work_key).maybeSingle();
        await db.from("dd_research_work_queue").update({
          attempts:Number(work?.attempts||0)+1,last_researched_at:now,updated_at:now,
          next_action:changed?"Source changed; review latest snapshot before advancing this gate.":work?.next_action,
          status:"RESEARCHING"
        }).eq("work_key",source.work_key);
      }

      for(const hit of matched.filter((z:any)=>z.matched)){
        const claimKey=(`WATCH_${source.source_key}_${hit.signal}`).slice(0,250);
        const evidenceStatus=source.temporal_class==="HISTORICAL"?"HISTORICAL":"PARTIAL";
        await db.from("dd_research_evidence").upsert({
          program_key:source.program_key,claim_key:claimKey,
          claim_text:`Automated source check matched the configured \"${hit.signal}\" evidence signal on ${source.source_title}.`,
          evidence_status:evidenceStatus,source_title:source.source_title,source_url:source.source_url,
          authority_level:source.authority_level,effective_as_of:new Date().toISOString().slice(0,10),
          notes:"Automated source watcher observation only; this does not confirm the claim. Human/governed reconciliation and the parent work evidence contract are still required.",
          metadata:{sourceKey:source.source_key,signal:hit.signal,automated:true,publicOnly:true,confirmationRequired:true,signalSemantics:"OBSERVATION_ONLY"},updated_at:now
        },{onConflict:"program_key,claim_key,source_title"});
      }

      out.push({sourceKey:source.source_key,status:x.r.ok?"CHECKED":`HTTP_${x.r.status}`,changed,matchedSignals:matched.filter((z:any)=>z.matched).map((z:any)=>z.signal)});
    }catch(error){
      const message=error instanceof Error?(error.name==="AbortError"?"FETCH_TIMEOUT":error.message):String(error);
      const {data:row}=await db.from("dd_research_sources").select("consecutive_failures").eq("id",source.id).maybeSingle();
      await db.from("dd_research_sources").update({
        last_checked_at:new Date().toISOString(),
        consecutive_failures:Number(row?.consecutive_failures||0)+1,last_error:message,
        next_check_at:new Date(Date.now()+3600000).toISOString(),updated_at:new Date().toISOString()
      }).eq("id",source.id);
      out.push({sourceKey:source.source_key,status:"FAILED",error:message});
    }
  }

  return json({success:true,coverage,discovery:discoveryOut,watcher:{checked:out.length,results:out}});
});