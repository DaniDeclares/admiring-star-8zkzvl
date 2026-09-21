import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import RequireStaffAuth from '../../components/auth/RequireStaffAuth.jsx';
import { supabase } from '../../lib/supabaseClient.js';

const P={ink:'#2b2022',muted:'#74676a',border:'#e5d9d2',surface:'#fffdfb',soft:'#f7f0eb',accent:'#6b1f2b',gold:'#8b6b1f',danger:'#9a2636',success:'#276b35',warning:'#9a6514'};
const blankUnit=()=>({unit_number:'',unit_type:'',bedrooms:'',bathrooms:'',square_footage:'',condition:'',pet_damage:false,deep_carpet:false,eviction:false,trashout:false,maintenance_issues:'',unit_notes:''});
const blankScope={property_name:'',property_address:'',requested_window:'',completion_deadline:'',access_notes:'',occupancy:'vacant',unit_count:0,units:[],components:[],source_scope_facts:[],provider_capacity_review_required:true,assumptions:'',exclusions:'',customer_decisions_needed:'',quote_inputs:{},readiness:{property_identified:false,unit_count_confirmed:false,unit_scope_reviewed:false,service_components_selected:false,deadline_confirmed:false,access_confirmed:false,assumptions_reviewed:false,quote_inputs_ready:false,fulfillment_feasibility_review_required:true}};

const numberWord={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10};
const parseCount=(value)=>{const n=Number(value);if(Number.isFinite(n)&&n>0)return n;return numberWord[String(value||'').toLowerCase()]||0;};
const extractSourceFacts=(text='')=>{
 const apartmentMatch=text.match(/\b(\d+)\s+apartments?\b/i);
 const deadlineMatch=text.match(/within\s+(\d+)\s+days?/i);
 const petMatch=text.match(/(\w+)\s+of the apartments have heavy pet damage/i);
 const deepMatch=text.match(/only\s+(\d+)\s+need deep carpet cleaning/i);
 const evictionMatch=text.match(/eviction.*?(\d+)-bedroom\/(\d+)-bath/i);
 return [
  apartmentMatch&&`Request states ${apartmentMatch[1]} apartments require turnover.` ,
  petMatch&&`Request states ${parseCount(petMatch[1])} apartments have heavy pet damage.` ,
  deepMatch&&`Request states ${deepMatch[1]} apartments need deep carpet cleaning; the other apartments receive normal turnover carpet treatment.` ,
  text.match(/All\s+\d+\s+apartments? have carpet/i)&&'Request states all apartments have carpet.',
  evictionMatch&&`Request identifies one eviction/cleanout as a ${evictionMatch[1]}-bedroom/${evictionMatch[2]}-bath family unit; the unit identifier was not provided.`,
  text.match(/checked for obvious damage or maintenance issues and documented/i)&&'Request requires obvious damage/maintenance issues to be checked and documented before release.',
  deadlineMatch&&`Requested turnaround: within ${deadlineMatch[1]} days of the request.`,
  text.match(/pressure washing/i)&&'Customer asked whether exterior pressure washing is available if needed; this remains an open scope decision rather than an assumed service.'
 ].filter(Boolean);
};

function Field({label,value,onChange,type='text',placeholder=''}){return <label style={{display:'grid',gap:6,fontSize:12,fontWeight:800}}><span>{label}</span><input type={type} value={value||''} placeholder={placeholder} onChange={e=>onChange(e.target.value)} style={{width:'100%',boxSizing:'border-box',border:'1px solid '+P.border,borderRadius:10,padding:'10px 11px',background:'#fff',fontSize:14}}/></label>}
function Area({label,value,onChange,placeholder=''}){return <label style={{display:'grid',gap:6,fontSize:12,fontWeight:800}}><span>{label}</span><textarea value={value||''} placeholder={placeholder} onChange={e=>onChange(e.target.value)} rows={4} style={{width:'100%',boxSizing:'border-box',border:'1px solid '+P.border,borderRadius:10,padding:'10px 11px',background:'#fff',fontSize:14,resize:'vertical'}}/></label>}
function Check({label,checked,onChange}){return <label style={{display:'flex',gap:9,alignItems:'flex-start',padding:11,border:'1px solid '+P.border,borderRadius:10,background:'#fff',fontSize:13}}><input type="checkbox" checked={!!checked} onChange={e=>onChange(e.target.checked)} style={{marginTop:2}}/><span>{label}</span></label>}
function Card({title,eyebrow,children}){return <section style={{background:P.surface,border:'1px solid '+P.border,borderRadius:16,padding:18,boxShadow:'0 8px 26px rgba(43,32,34,.05)'}}>{eyebrow&&<div style={{fontSize:10,fontWeight:900,letterSpacing:'.14em',textTransform:'uppercase',color:P.gold}}>{eyebrow}</div>}<h2 style={{margin:eyebrow?'5px 0 14px':'0 0 14px',fontSize:20,color:P.accent}}>{title}</h2>{children}</section>}

function Workspace(){
 const [params]=useSearchParams(),requestId=params.get('requestId')||'',navigate=useNavigate();
 const [request,setRequest]=useState(null),[lead,setLead]=useState(null),[services,setServices]=useState([]),[scope,setScope]=useState(blankScope),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[selectedService,setSelectedService]=useState(''),[unitCountInput,setUnitCountInput]=useState('');

 useEffect(()=>{(async()=>{setLoading(true);setError('');try{
   if(!requestId)throw new Error('A request reference is required.');
   const rr=await supabase.from('service_requests').select('*').eq('id',requestId).single();if(rr.error)throw rr.error;setRequest(rr.data);
   if(rr.data.lead_id){const lr=await supabase.from('leads').select('id,full_name,email,phone,organization_name').eq('id',rr.data.lead_id).single();if(!lr.error)setLead(lr.data);}
   const sr=await supabase.from('services').select('id,sku,name,pricing_type,starting_price,public_price_display,quote_input_schema,is_active').eq('division_id',2).eq('is_active',true).order('name');if(sr.error)throw sr.error;setServices(sr.data||[]);
   const saved=rr.data.scope_snapshot&&typeof rr.data.scope_snapshot==='object'?rr.data.scope_snapshot:{};
   const sourceFacts=extractSourceFacts(rr.data.request_details||'');
   const sourceUnitCount=parseCount((rr.data.request_details||'').match(/\b(\d+)\s+apartments?\b/i)?.[1]);
   const sourceDeadline=(rr.data.request_details||'').match(/within\s+(\d+)\s+days?/i)?.[1];
   const isFreshScope=!Object.keys(saved).length;
   const merged={...blankScope,...saved,source_scope_facts:Array.isArray(saved.source_scope_facts)?saved.source_scope_facts:sourceFacts,units:Array.isArray(saved.units)?saved.units:[],components:Array.isArray(saved.components)?saved.components:[],quote_inputs:saved.quote_inputs||{},readiness:{...blankScope.readiness,...(saved.readiness||{})}};
   if(isFreshScope){
    merged.property_address=merged.property_address||rr.data.location_address||'';
    merged.unit_count=merged.unit_count||sourceUnitCount;
    merged.requested_window=merged.requested_window|| (sourceDeadline?`Within ${sourceDeadline} days of request`:rr.data.timeline||'');
    merged.completion_deadline=merged.completion_deadline|| (sourceDeadline?`Within ${sourceDeadline} days of request`:'');
    merged.customer_decisions_needed=merged.customer_decisions_needed|| (sourceFacts.some(f=>/pressure washing/i.test(f))?'Confirm whether exterior pressure washing is actually required; no pressure-washing service should be assumed from the customer question alone.':'');
    merged.readiness.property_identified=!!merged.property_address;
    merged.readiness.unit_count_confirmed=!!merged.unit_count;
    merged.readiness.deadline_confirmed=!!merged.completion_deadline;
   }
   const count=Number(merged.unit_count||0);if(count&&!merged.units.length)merged.units=Array.from({length:count},()=>blankUnit());
   setScope(merged);setUnitCountInput(String(count||''));if(merged.components[0]?.sku)setSelectedService(merged.components[0].sku);
 }catch(e){setError(e.message||'Could not load request scope.')}finally{setLoading(false);}})()},[requestId]);

 const sourceText=request?.request_details||'';
 const update=(key,value)=>setScope(s=>({...s,[key]:value}));
 const updateReady=(key,value)=>setScope(s=>({...s,readiness:{...s.readiness,[key]:value}}));
 const setUnitCount=value=>{setUnitCountInput(value);const n=Math.max(0,Math.min(100,Number(value)||0));setScope(s=>({...s,unit_count:n,units:Array.from({length:n},(_,i)=>s.units[i]||blankUnit())}));};
 const updateUnit=(index,key,value)=>setScope(s=>({...s,units:s.units.map((u,i)=>i===index?{...u,[key]:value}:u)}));
 const addComponent=()=>{if(!selectedService)return;const service=services.find(s=>s.sku===selectedService);if(!service)return;const answers=(service.quote_input_schema?.fields||[]).reduce((a,f)=>{const v=derivedQuoteInputs[f.key];if(v!==undefined&&v!=='')a[f.key]=v;return a;},{});setScope(s=>s.components.some(c=>c.sku===service.sku)?s:{...s,components:[...s.components,{sku:service.sku,service_id:service.id,name:service.name,answers}]});setSelectedService('');};
 const removeComponent=sku=>setScope(s=>({...s,components:s.components.filter(c=>c.sku!==sku)}));
 const updateComponentAnswer=(sku,key,value)=>setScope(s=>({...s,components:s.components.map(c=>c.sku===sku?{...c,answers:{...c.answers,[key]:value}}:c)}));

 const derivedQuoteInputs=useMemo(()=>{const first=scope.units[0]||{};return{
   client_name:lead?.organization_name||request?.organization_name||'',
   property_name:scope.property_name,property_address:scope.property_address||request?.location_address||'',
   unit_count:scope.unit_count,unit_numbers:scope.units.map(u=>u.unit_number).filter(Boolean).join(', '),
   unit_type:first.unit_type||'',square_footage:first.square_footage||'',access_notes:scope.access_notes,
   requested_window:scope.requested_window,completion_deadline:scope.completion_deadline,
   current_condition:scope.units.map((u,i)=>'Unit '+(i+1)+': '+(u.condition||'not assessed')).join('; '),
   punch_list_items:scope.units.map((u,i)=>u.maintenance_issues?'Unit '+(i+1)+': '+u.maintenance_issues:'').filter(Boolean).join('; '),
   checklist_required:true,photo_documentation_required:true,report_format:'Unit-level completion / condition record',
   stop_count:scope.unit_count,after_hours:false,sla:scope.completion_deadline||scope.requested_window||''
 };},[scope,lead,request]);

 const readiness=useMemo(()=>{const r=scope.readiness;const keys=['property_identified','unit_count_confirmed','unit_scope_reviewed','service_components_selected','deadline_confirmed','access_confirmed','assumptions_reviewed','quote_inputs_ready'];const done=keys.filter(k=>r[k]).length;return{done,total:keys.length,complete:done===keys.length};},[scope.readiness]);

 const save=async(markComplete)=>{setSaving(true);setError('');setMessage('');try{
   if(!requestId)throw new Error('Request reference missing.');
   const finalReadiness={...scope.readiness,quote_inputs_ready:readiness.complete||scope.readiness.quote_inputs_ready};
   const snapshot={...scope,quote_inputs:derivedQuoteInputs,readiness:finalReadiness,source_request:{id:requestId,service_needed:request?.service_needed||null,request_details:sourceText,received_at:request?.created_at||null},saved_at:new Date().toISOString()};
   const user=(await supabase.auth.getUser()).data.user;
   const patch={scope_status:markComplete?'COMPLETE':'IN_PROGRESS',scope_version:Number(request?.scope_version||1),scope_snapshot:snapshot,scope_completed_at:markComplete?new Date().toISOString():null,scope_completed_by:markComplete?(user?.id||null):null,updated_at:new Date().toISOString()};
   const ur=await supabase.from('service_requests').update(patch).eq('id',requestId).select('id,scope_status,scope_version,scope_snapshot,scope_completed_at').single();if(ur.error)throw ur.error;
   setRequest(prev=>({...prev,...ur.data}));setScope(snapshot);setMessage(markComplete?'Scope locked. Opening Quote Builder…':'Scope saved.');
   if(markComplete)setTimeout(()=>navigate('/portal/quotes?requestId='+encodeURIComponent(requestId)),250);
 }catch(e){setError(e.message||'Scope could not be saved.')}finally{setSaving(false);}};

 if(loading)return <RequireStaffAuth><main style={{padding:30}}><strong>Loading scope workspace…</strong></main></RequireStaffAuth>;
 return <RequireStaffAuth><main style={{minHeight:'100vh',background:'#fbf6f2',color:P.ink,padding:'26px 16px 60px'}}><div style={{maxWidth:1360,margin:'0 auto'}}>
  <header style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'flex-start',flexWrap:'wrap',marginBottom:18}}>
   <div><div style={{fontSize:11,fontWeight:900,letterSpacing:'.14em',color:P.gold}}>DANI DECLARES · SCOPE DEVELOPMENT</div><h1 style={{margin:'5px 0',fontSize:'clamp(30px,5vw,44px)',color:P.accent}}>Develop Scope</h1><p style={{margin:0,maxWidth:860,color:P.muted,lineHeight:1.55}}>Turn the original customer request into a structured, reviewable scope contract before commercial quoting. This workspace does not calculate or override price.</p></div>
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><Link className="portal-primary" to="/portal">← Command Center</Link><Link className="portal-primary" to="/portal/operations">Operations</Link></div>
  </header>
  {error&&<div style={{marginBottom:12,padding:12,borderRadius:10,background:'#fff0f0',color:P.danger,border:'1px solid #f0c9ce'}}>{error}</div>}
  {message&&<div style={{marginBottom:12,padding:12,borderRadius:10,background:'#edf8ef',color:P.success,border:'1px solid #c9e4cf'}}>{message}</div>}

  <div style={{display:'grid',gridTemplateColumns:'minmax(0,1.55fr) minmax(310px,.75fr)',gap:16}}>
   <div style={{display:'grid',gap:16}}>
    <Card eyebrow="Source of truth" title="Original Request">
     <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:10,marginBottom:12}}>
      <div><small>Request</small><div style={{fontWeight:900,fontSize:13,wordBreak:'break-all'}}>{requestId}</div></div>
      <div><small>Customer</small><div style={{fontWeight:800}}>{lead?.organization_name||request?.organization_name||lead?.full_name||'Not recorded'}</div></div>
      <div><small>Received</small><div>{request?.created_at?new Date(request.created_at).toLocaleString():'—'}</div></div>
      <div><small>State</small><div><b>{request?.status||'—'}</b> · Scope {request?.scope_status||'NOT_STARTED'}</div></div>
     </div>
     <div style={{padding:14,borderRadius:12,background:P.soft,whiteSpace:'pre-wrap',lineHeight:1.65,fontSize:14}}>{sourceText||'No request narrative was recorded.'}</div>
     <div style={{marginTop:12,fontSize:12,color:P.muted}}>The source request is preserved exactly as submitted. Scope development adds structure; it does not replace the original narrative.</div>
    </Card>

    <Card eyebrow="Extracted from source request" title="Source-Derived Scope Facts">
     <div style={{display:'grid',gap:8}}>{scope.source_scope_facts.length?scope.source_scope_facts.map((fact,i)=><div key={i} style={{padding:'10px 12px',border:'1px solid '+P.border,borderRadius:10,background:'#fff',fontSize:13,lineHeight:1.5}}>{fact}</div>):<div style={{color:P.muted,fontSize:13}}>No structured facts were extracted from the request narrative.</div>}</div>
     <div style={{marginTop:10,fontSize:11,color:P.muted}}>These facts are extracted from the customer’s original narrative. They do not invent unit identifiers, square footage, access details, or other facts the customer did not provide.</div>
    </Card>

    <Card eyebrow="Property" title="Property & Service Window">
     <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
      <Field label="Property name" value={scope.property_name} onChange={v=>update('property_name',v)} placeholder="Not yet provided"/>
      <Field label="Property address" value={scope.property_address||request?.location_address||''} onChange={v=>update('property_address',v)}/>
      <Field label="Requested window" value={scope.requested_window||request?.timeline||''} onChange={v=>update('requested_window',v)} placeholder="e.g. Sept. 22–24"/>
      <Field label="Completion deadline" value={scope.completion_deadline} onChange={v=>update('completion_deadline',v)} placeholder="Required completion date/time"/>
      <Field label="Access / contact instructions" value={scope.access_notes} onChange={v=>update('access_notes',v)} placeholder="Keys, lockbox, office contact, access window"/>
      <Field label="Occupancy" value={scope.occupancy} onChange={v=>update('occupancy',v)} placeholder="Vacant / occupied / mixed"/>
     </div>
    </Card>

    <Card eyebrow="Unit-level scope" title="Units">
     <div style={{display:'grid',gridTemplateColumns:'minmax(160px,220px) 1fr',gap:10,alignItems:'end',marginBottom:14}}>
      <Field label="Number of units" value={unitCountInput} onChange={setUnitCount} type="number" placeholder="e.g. 5"/>
      <div style={{fontSize:12,color:P.muted}}>Working slots are created without inventing unit numbers. Enter actual identifiers when known.</div>
     </div>
     {!scope.units.length?<div style={{padding:18,borderRadius:12,background:P.soft,color:P.muted}}>Enter the unit count to create the unit-by-unit scope grid.</div>:
      <div style={{display:'grid',gap:12}}>{scope.units.map((u,i)=><div key={i} style={{border:'1px solid '+P.border,borderRadius:14,padding:14,background:'#fff'}}>
       <div style={{display:'flex',justifyContent:'space-between',gap:10,marginBottom:10}}><strong>Unit {i+1}</strong>{!u.unit_number&&<span style={{fontSize:11,color:P.warning}}>Identifier not provided</span>}</div>
       <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:9}}>
        <Field label="Unit number" value={u.unit_number} onChange={v=>updateUnit(i,'unit_number',v)} placeholder="e.g. 204"/>
        <Field label="Unit type" value={u.unit_type} onChange={v=>updateUnit(i,'unit_type',v)} placeholder="Studio / 1BR / 2BR"/>
        <Field label="Bedrooms" value={u.bedrooms} onChange={v=>updateUnit(i,'bedrooms',v)} type="number"/>
        <Field label="Bathrooms" value={u.bathrooms} onChange={v=>updateUnit(i,'bathrooms',v)} type="number"/>
        <Field label="Square footage" value={u.square_footage} onChange={v=>updateUnit(i,'square_footage',v)} type="number"/>
        <Field label="Condition" value={u.condition} onChange={v=>updateUnit(i,'condition',v)} placeholder="Standard / heavy / severe"/>
       </div>
       <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:8,marginTop:10}}>
        <Check label="Heavy pet damage" checked={u.pet_damage} onChange={v=>updateUnit(i,'pet_damage',v)}/>
        <Check label="Deep carpet cleaning" checked={u.deep_carpet} onChange={v=>updateUnit(i,'deep_carpet',v)}/>
        <Check label="Eviction / cleanout" checked={u.eviction} onChange={v=>updateUnit(i,'eviction',v)}/>
        <Check label="Trash / haul-away required" checked={u.trashout} onChange={v=>updateUnit(i,'trashout',v)}/>
       </div>
       <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginTop:10}}>
        <Area label="Maintenance / punch-list observations" value={u.maintenance_issues} onChange={v=>updateUnit(i,'maintenance_issues',v)}/>
        <Area label="Unit-specific notes" value={u.unit_notes} onChange={v=>updateUnit(i,'unit_notes',v)}/>
       </div>
      </div>)}</div>}
    </Card>

    <Card eyebrow="Commercial scope components" title="What are we actually quoting?">
     <div style={{padding:'11px 12px',marginBottom:12,borderRadius:10,background:P.soft,fontSize:12,lineHeight:1.5}}><strong>Scope cues from this request:</strong> apartment turnover, make-ready cleaning, property/condition review, photo documentation, punch-list follow-up, and coordination. These are suggestions only; select the governed services that belong in the quote. The pressure-washing question is not added automatically.</div>
     <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'end',marginBottom:12}}>
      <label style={{display:'grid',gap:6,fontSize:12,fontWeight:800,flex:1,minWidth:260}}><span>Division 02 service</span><select value={selectedService} onChange={e=>setSelectedService(e.target.value)} style={{border:'1px solid '+P.border,borderRadius:10,padding:'10px 11px',background:'#fff'}}><option value="">Select a governed service…</option>{services.map(s=><option key={s.sku} value={s.sku}>{s.name+' · '+s.sku}</option>)}</select></label>
      <button onClick={addComponent} disabled={!selectedService} style={{padding:'10px 14px',borderRadius:10,border:0,background:P.accent,color:'#fff',fontWeight:900}}>Add component</button>
     </div>
     {!scope.components.length?<div style={{padding:14,borderRadius:10,background:'#fff4e5',color:P.warning}}>No quote components selected yet. A scope can be saved, but it cannot be marked quote-ready until at least one governed service is selected.</div>:
      <div style={{display:'grid',gap:10}}>{scope.components.map(c=>{const service=services.find(s=>s.sku===c.sku);const fields=service?.quote_input_schema?.fields||[];return <div key={c.sku} style={{border:'1px solid '+P.border,borderRadius:12,padding:13}}>
       <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'flex-start'}}><div><strong>{c.name}</strong><div style={{fontSize:11,color:P.muted}}>{c.sku+' · '+(service?.public_price_display||service?.pricing_type||'Quote governed')}</div></div><button onClick={()=>removeComponent(c.sku)} style={{border:'1px solid #e0c5ca',background:'#fff',color:P.danger,borderRadius:8,padding:'6px 9px'}}>Remove</button></div>
       {fields.length>0&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:9,marginTop:10}}>{fields.filter(f=>f.classification==='SCOPE'||['unit_count','property_name','property_address','requested_window','completion_deadline','access_notes'].includes(f.key)).map(f=><Field key={f.key} label={f.label||f.key} value={c.answers?.[f.key]??derivedQuoteInputs[f.key]??''} onChange={v=>updateComponentAnswer(c.sku,f.key,v)}/>)}</div>}
      </div>})}</div>}
    </Card>

    <Card eyebrow="Commercial boundaries" title="Assumptions, Exclusions & Decisions">
     <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
      <Area label="Assumptions" value={scope.assumptions} onChange={v=>update('assumptions',v)} placeholder="What DANI is assuming to develop the quote"/>
      <Area label="Exclusions / boundaries" value={scope.exclusions} onChange={v=>update('exclusions',v)} placeholder="What is not included or requires separate authorization"/>
      <Area label="Customer decisions / missing information" value={scope.customer_decisions_needed} onChange={v=>update('customer_decisions_needed',v)} placeholder="Questions that materially affect scope or price"/>
      <div style={{display:'grid',gap:8}}><Check label="Provider capacity review required before commitment" checked={scope.provider_capacity_review_required} onChange={v=>update('provider_capacity_review_required',v)}/><Check label="Property/unit scope reviewed" checked={scope.readiness.unit_scope_reviewed} onChange={v=>updateReady('unit_scope_reviewed',v)}/><Check label="Access confirmed" checked={scope.readiness.access_confirmed} onChange={v=>updateReady('access_confirmed',v)}/><Check label="Assumptions/exclusions reviewed" checked={scope.readiness.assumptions_reviewed} onChange={v=>updateReady('assumptions_reviewed',v)}/></div>
     </div>
    </Card>
   </div>

   <aside style={{display:'grid',gap:16,alignSelf:'start'}}>
    <Card eyebrow="Gate" title="Scope Readiness">
     <div style={{fontSize:30,fontWeight:900,color:readiness.complete?P.success:P.accent}}>{readiness.done+'/'+readiness.total}</div><div style={{fontSize:12,color:P.muted,marginBottom:12}}>required scope checks complete</div>
     <div style={{display:'grid',gap:7}}>{[['property_identified','Property identified'],['unit_count_confirmed','Unit count confirmed'],['unit_scope_reviewed','Unit scope reviewed'],['service_components_selected','Service components selected'],['deadline_confirmed','Deadline confirmed'],['access_confirmed','Access confirmed'],['assumptions_reviewed','Assumptions/exclusions reviewed'],['quote_inputs_ready','Quote inputs ready']].map(x=><label key={x[0]} style={{display:'flex',gap:8,alignItems:'center',fontSize:12}}><input type="checkbox" checked={!!scope.readiness[x[0]]} onChange={e=>updateReady(x[0],e.target.checked)}/>{x[1]}</label>)}</div>
     <div style={{marginTop:13,padding:11,borderRadius:10,background:readiness.complete?'#edf8ef':'#fff4e5',color:readiness.complete?P.success:P.warning,fontSize:12,lineHeight:1.5}}>{readiness.complete?'Ready to hand off to Quote Builder.':'Do not treat this request as quote-ready until required scope facts are resolved or explicitly reviewed.'}</div>
    </Card>
    <Card eyebrow="Handoff" title="Quote Inputs">
     <div style={{display:'grid',gap:8,fontSize:12}}>{Object.entries(derivedQuoteInputs).slice(0,12).map(x=><div key={x[0]} style={{borderBottom:'1px solid '+P.border,paddingBottom:7}}><strong>{x[0].replaceAll('_',' ')}</strong><div style={{color:P.muted,marginTop:2,whiteSpace:'pre-wrap'}}>{String(x[1]||'—')}</div></div>)}</div>
     <div style={{marginTop:10,fontSize:11,color:P.muted}}>Scope-derived inputs feed the quote workspace. The quote engine remains responsible for governed pricing, review flags, discounts, travel, materials, tax and final totals.</div>
    </Card>
    <div style={{display:'grid',gap:8}}>
     <button disabled={saving} onClick={()=>save(false)} style={{padding:'13px 16px',borderRadius:11,border:'1px solid '+P.border,background:'#fff',fontWeight:900}}>{saving?'Saving…':'Save Scope'}</button>
     <button disabled={saving||!readiness.complete} onClick={()=>save(true)} style={{padding:'14px 16px',borderRadius:11,border:0,background:readiness.complete?P.accent:'#b7aeb0',color:'#fff',fontWeight:900}}>Complete Scope → Quote</button>
     <div style={{fontSize:11,color:P.muted,textAlign:'center'}}>Completion saves the scope snapshot to the request and opens Quote Builder with the request reference preserved.</div>
    </div>
   </aside>
  </div>
 </div></main></RequireStaffAuth>;
}

export default function ScopeDevelopmentPage(){return <Workspace/>;}