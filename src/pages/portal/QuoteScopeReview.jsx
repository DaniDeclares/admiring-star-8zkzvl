import React from 'react';

// Staff/owner-only presentation: this component is rendered under RequireStaffAuth.
// It never computes or authorizes a price, booking, payment or fulfillment transition.
export default function QuoteScopeReview({scope,captureStatus,sourceRequestId,packageRecord,linkedPackage,unmetRequired,lineItems,releaseBySku,serviceBySku,statusVerified}){
 if(!scope&&!packageRecord)return null;
 const fields=[
  ['Property',scope?.property_name],['Service address',scope?.property_address],
  ['Unit count',scope?.unit_count],['Occupancy',scope?.occupancy],
  ['Requested window',scope?.requested_window],['Completion deadline',scope?.completion_deadline],
  ['Access requirements',scope?.access_notes],['Assumptions',scope?.assumptions],
  ['Exclusions',scope?.exclusions],['Open decisions',scope?.customer_decisions_needed]
 ];
 return <section data-testid="owner-scope-review" style={{background:'#fff8ed',border:'2px solid #c29a50',borderRadius:16,padding:22,marginBottom:18,color:'#3b2930'}}>
   <p style={{fontSize:11,fontWeight:900,letterSpacing:2,color:'#a2752e'}}>INQUIRY → DEVELOP SCOPE → ITEMIZED OWNER REVIEW</p>
   <h2 style={{fontSize:26,color:'#561628',margin:'5px 0 8px'}}>Complete captured scope</h2>
   <p style={{fontSize:13,fontWeight:800,color:'#724b26'}}>Scope capture: {captureStatus||'NOT RECORDED'} — capture completeness is not permission to sell, book, or fulfill.</p>
   {scope&&<>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:10,marginTop:16}}>
      {fields.map(([label,value])=><div key={label} style={{border:'1px solid #e5d4b3',borderRadius:10,background:'#fff',padding:12}}>
       <strong style={{display:'block',fontSize:12,color:'#806025'}}>{label}</strong>
       <span style={{fontSize:13,whiteSpace:'pre-wrap'}}>{value===null||value===undefined||value===''?'Not supplied':String(value)}</span>
      </div>)}
    </div>
    {(scope.units||[]).length>0&&<div style={{marginTop:17}}><h3 style={{fontSize:18,color:'#561628'}}>Units and requested work</h3><div style={{display:'grid',gap:9}}>{scope.units.map((unit,index)=><div key={index} style={{padding:12,background:'#fff',border:'1px solid #e5d4b3',borderRadius:10}}>
      <strong>{unit.unit_number||'Unit '+(index+1)} — {unit.unit_type||'Unit type pending'}</strong>
      <p style={{marginTop:7,whiteSpace:'pre-wrap',fontSize:13}}>{[unit.maintenance_issues,unit.unit_notes,Array.isArray(unit.condition_flags)?unit.condition_flags.join(', '):''].filter(Boolean).join(' • ')||'No separate tasks listed.'}</p>
    </div>)}</div></div>}
    {Array.isArray(scope.source_scope_facts)&&scope.source_scope_facts.length>0&&<div style={{marginTop:14}}><strong>Recorded inquiry facts</strong><p style={{fontSize:13,whiteSpace:'pre-wrap'}}>{scope.source_scope_facts.join(' • ')}</p></div>}
    <p style={{marginTop:15,fontSize:12,color:'#755e62'}}>Source request: {sourceRequestId||scope.source_request?.id||'Unlinked'} · Captured SKUs: {(scope.components||[]).map(c=>c.sku).filter(Boolean).join(', ')||'Not supplied'}</p>
   </>}
   {packageRecord&&<div data-testid="governed-package-identity" style={{marginTop:18,padding:15,background:'#f4e5c1',border:'1px solid #ae843e',borderRadius:12}}>
    <strong style={{fontSize:12,color:'#704315'}}>{linkedPackage?'GOVERNED PACKAGE REFERENCED IN INQUIRY':'POSSIBLE PACKAGE PATTERN — COMPONENT MATCH ONLY'}</strong>
    <h3 style={{fontSize:20,margin:'7px 0',color:'#561628'}}>{packageRecord.package_name}</h3>
    <p style={{fontSize:12,fontWeight:800}}>{packageRecord.package_code} · {packageRecord.id} · {packageRecord.commercial_offer_status}</p>
    <p style={{fontSize:13}}>Required component SKUs: {(packageRecord.components||[]).filter(c=>c.is_required).map(c=>c.canonical_sku).join(', ')}. Package pricing is not established by simply totaling its components.</p>
    {unmetRequired.length>0&&<p data-testid="unmet-required-components" style={{color:'#8b2c2a',fontWeight:900,marginTop:9}}>Unmet required scope: {unmetRequired.join(', ')}</p>}
   </div>}
   {lineItems.length>0&&<div style={{marginTop:18}}><h3 style={{fontSize:19,color:'#561628'}}>Every requested service component</h3>
     <div style={{display:'grid',gap:9}}>{lineItems.map((line,index)=>{
      const status=releaseBySku.get(line.serviceSku);
      const quoteable=serviceBySku.has(line.serviceSku)&&(!status||status.release_state==='LIVE_READY');
      return <div key={line.id} data-testid={'scope-component-'+line.serviceSku} style={{padding:12,border:'1px solid '+(quoteable?'#bcba9a':'#b7674c'),background:quoteable?'#f4f9f2':'#fff0e7',borderRadius:9,display:'flex',gap:12,alignItems:'start',justifyContent:'space-between',flexWrap:'wrap'}}>
        <div><strong>{index+1}. {status?.service_name||serviceBySku.get(line.serviceSku)?.name||line.serviceSku}</strong><div style={{fontSize:12,color:'#79676b'}}>{line.serviceSku}</div></div>
        <div style={{fontSize:12,textAlign:'right',color:quoteable?'#2d624e':'#92322e',fontWeight:900}}>{quoteable?'RELEASED FOR QUOTE REVIEW':(status?.release_state||'UNVERIFIED')+' / '+(status?.blocking_gate||'RELEASE CHECK REQUIRED')}<div>{quoteable?'Pricing still subject to scope':'Unmet scope · not priced'}</div></div>
      </div>;
     })}</div>
   </div>}
   {!statusVerified&&scope&&<p style={{color:'#922f2d',fontWeight:900,marginTop:14}}>Verified release-status retrieval is unavailable. Commercial progression remains blocked.</p>}
 </section>;
}
