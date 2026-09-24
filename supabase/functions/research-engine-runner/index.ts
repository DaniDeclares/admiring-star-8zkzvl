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

Deno.serve(async (req:Request)=>{
  if(req.method!=="POST") return json({error:"Method not allowed"},405);

  const url=Deno.env.get("SUPABASE_URL");
  const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url||!serviceKey) return json({error:"Supabase environment unavailable"},503);
  const db=createClient(url,serviceKey,{auth:{persistSession:false}});

  const {data:sources,error:sourceError}=await db
    .from("dd_research_sources")
    .select("id,program_key,work_key,source_key,source_title,source_url,authority_level,temporal_class,expected_signals,check_interval_minutes,last_content_hash,next_check_at,status")
    .eq("status","ACTIVE")
    .lte("next_check_at",new Date().toISOString())
    .order("next_check_at",{ascending:true})
    .limit(4);
  if(sourceError) return json({error:sourceError.message},500);

  const out:any[]=[];
  for(const source of sources||[]){
    const next=new Date(Date.now()+Number(source.check_interval_minutes||360)*60000).toISOString();
    await db.from("dd_research_sources").update({next_check_at:next,updated_at:new Date().toISOString()}).eq("id",source.id);
    try{
      const ctl=new AbortController();
      const timer=setTimeout(()=>ctl.abort(),15000);
      const response=await fetch(source.source_url,{
        redirect:"follow",
        signal:ctl.signal,
        headers:{
          "User-Agent":"DANI-Research-Watcher/1.0 (+https://danideclares.com)",
          "Accept":"text/html,text/plain,application/json,application/pdf;q=0.8,*/*;q=0.5"
        }
      });
      clearTimeout(timer);
      const bytes=new Uint8Array(await response.arrayBuffer());
      const hash=await sha256(bytes);
      const contentType=(response.headers.get("content-type")||"").toLowerCase();
      const isText=contentType.includes("text/")||contentType.includes("json")||contentType.includes("xml");
      const text=isText?clean(new TextDecoder().decode(bytes)):"";
      const matched=signals(text,source.expected_signals||[]);
      const changed=Boolean(source.last_content_hash && source.last_content_hash!==hash);
      const excerpt=text?text.slice(0,6000):`[${contentType||"binary"} source; ${bytes.length} bytes; content hash recorded]`;
      const now=new Date().toISOString();

      await db.from("dd_research_source_snapshots").insert({
        source_id:source.id,http_status:response.status,content_hash:hash,content_length:bytes.length,
        changed,matched_signals:matched,excerpt,
        metadata:{finalUrl:response.url,contentType}
      });
      await db.from("dd_research_sources").update({
        last_checked_at:now,last_http_status:response.status,last_content_hash:hash,
        last_changed_at:changed?now:undefined,consecutive_failures:0,last_error:null,updated_at:now
      }).eq("id",source.id);

      if(source.work_key){
        const {data:work}=await db.from("dd_research_work_queue").select("attempts,next_action").eq("work_key",source.work_key).maybeSingle();
        await db.from("dd_research_work_queue").update({
          attempts:Number(work?.attempts||0)+1,last_researched_at:now,updated_at:now,
          next_action:changed?"Source changed; review latest snapshot before advancing this gate.":work?.next_action
        }).eq("work_key",source.work_key);
      }

      for(const hit of matched.filter((x:any)=>x.matched)){
        const claimKey=(`WATCH_${source.source_key}_${hit.signal}`).slice(0,250);
        const evidenceStatus=source.temporal_class==="HISTORICAL"?"HISTORICAL":"CONFIRMED";
        await db.from("dd_research_evidence").upsert({
          program_key:source.program_key,
          claim_key:claimKey,
          claim_text:`Automated source check matched the configured "${hit.signal}" evidence signal on ${source.source_title}.`,
          evidence_status:evidenceStatus,
          source_title:source.source_title,
          source_url:source.source_url,
          authority_level:source.authority_level,
          effective_as_of:new Date().toISOString().slice(0,10),
          notes:"Deterministic source watcher signal; parent work gate still requires its full evidence contract.",
          metadata:{sourceKey:source.source_key,signal:hit.signal,automated:true},
          updated_at:now
        },{onConflict:"program_key,claim_key,source_title"});
      }
      out.push({sourceKey:source.source_key,status:response.ok?"CHECKED":`HTTP_${response.status}`,changed,matchedSignals:matched.filter((x:any)=>x.matched).map((x:any)=>x.signal)});
    }catch(error){
      const message=error instanceof Error?(error.name==="AbortError"?"FETCH_TIMEOUT":error.message):String(error);
      const {data:row}=await db.from("dd_research_sources").select("consecutive_failures").eq("id",source.id).maybeSingle();
      await db.from("dd_research_sources").update({
        last_checked_at:new Date().toISOString(),
        consecutive_failures:Number(row?.consecutive_failures||0)+1,
        last_error:message,
        next_check_at:new Date(Date.now()+3600000).toISOString(),
        updated_at:new Date().toISOString()
      }).eq("id",source.id);
      out.push({sourceKey:source.source_key,status:"FAILED",error:message});
    }
  }
  return json({success:true,checked:out.length,results:out});
});
