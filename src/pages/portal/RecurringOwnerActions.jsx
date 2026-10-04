import React, {useState} from 'react';
import {Link} from 'react-router-dom';
export default function RecurringOwnerActions({data,busy,act}){
 const [estimateId,setEstimateId]=useState(''),[scope,setScope]=useState(''),[exclusions,setExclusions]=useState(''),[quantity,setQuantity]=useState(''),[unit,setUnit]=useState('hours'),[cycleEstimate,setCycleEstimate]=useState({}),[usage,setUsage]=useState({});
 const candidate=data.candidates.find(e=>e.id===estimateId);
 const choose=id=>{setEstimateId(id);const e=data.candidates.find(c=>c.id===id);setScope(e?.scope||'');setExclusions(e?.exclusions||'')};
 return <>
  <p>Recurring work uses approved quotes and paid periods. <Link to="/portal/quotes">Review quotes</Link>. Extra work needs a separate approved quote.</p>
  <form onSubmit={e=>{e.preventDefault();if(candidate)act({action:'approve_terms',estimateId,terms:{objectType:candidate.objectType,channel:candidate.channel,scope,exclusions,rollover:'NONE',overage:'QUOTE_REQUIRED',cancellation:'PERIOD_END',allowances:[{key:'included_work',quantity:Number(quantity),unit}]}})}}>
   <label>Approved monthly quote <select value={estimateId} onChange={e=>choose(e.target.value)}><option value="">Choose a quote</option>{data.candidates.filter(e=>!data.terms.some(t=>t.estimate_id===e.id)).map(e=><option key={e.id} value={e.id}>{e.clientName} · {e.sku} · ${(e.amountCents/100).toFixed(2)}/month</option>)}</select></label>
   {candidate&&<><label>Included scope <textarea required value={scope} onChange={e=>setScope(e.target.value)}/></label><label>Exclusions <textarea required value={exclusions} onChange={e=>setExclusions(e.target.value)}/></label><label>Included quantity each month <input required type="number" min="0.01" step="0.01" value={quantity} onChange={e=>setQuantity(e.target.value)}/></label><label>Unit <input required value={unit} onChange={e=>setUnit(e.target.value)}/></label><p>Unused capacity expires. Excess work requires a separate quote. Cancellation takes effect at the end of the paid period. Customer acceptance is required before checkout.</p><button disabled={busy}>Approve scope for customer review</button></>}
  </form>
  {data.subscriptions.flatMap(s=>s.cycles.map(c=><article className="portal-row" key={c.id}><div><strong>{s.canonical_sku} · {c.fulfillment_status.replaceAll('_',' ')}</strong>
   {!c.job_id&&<form onSubmit={e=>{e.preventDefault();act({action:'release_cycle',subscriptionId:s.id,cycleId:c.id,estimateId:cycleEstimate[c.id]})}}><label>Fresh approved renewal quote <select required value={cycleEstimate[c.id]||''} onChange={e=>setCycleEstimate({...cycleEstimate,[c.id]:e.target.value})}><option value="">Choose a quote</option>{data.candidates.filter(e=>e.requestId===s.service_request_id&&e.sku===s.canonical_sku&&e.economicsStatus==='PASS'&&!data.terms.some(t=>t.estimate_id===e.id)).map(e=><option key={e.id} value={e.id}>{e.clientName} · ${(e.amountCents/100).toFixed(2)}</option>)}</select></label><button disabled={busy}>Release paid cycle through dispatch</button></form>}
   {c.job_id&&c.allowances.map(a=><form key={a.key} onSubmit={e=>{e.preventDefault();act({action:'record_usage',subscriptionId:s.id,cycleId:c.id,allowanceKey:a.key,quantity:Number(usage[c.id+a.key])})}}><label>QA-approved completed {a.key} ({a.unit}) <input type="number" required min="0.01" step="0.01" value={usage[c.id+a.key]||''} onChange={e=>setUsage({...usage,[c.id+a.key]:e.target.value})}/></label><button disabled={busy||a.consumed>0}>Record completed usage</button></form>)}
  </div></article>))}
 </>;
}
