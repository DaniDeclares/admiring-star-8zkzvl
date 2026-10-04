import RecurringOwnerActions from './RecurringOwnerActions.jsx';
import React, { useCallback, useEffect, useState } from 'react';
import { Card, Empty, formatDate, statusLabel } from './providerWorkspaceShared.jsx';
export default function RecurringServicesCard({session,ownerMode=false}){
 const [data,setData]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const call=useCallback(async(payload)=>{
  const response=await fetch('/api/service-subscriptions',{method:payload?'POST':'GET',headers:{Authorization:`Bearer ${session.access_token}`,...(payload?{'Content-Type':'application/json'}:{})},...(payload?{body:JSON.stringify(payload)}:{})});
  const result=await response.json();if(!response.ok||!result.success)throw new Error(result.error||'Recurring services are unavailable');return result;
 },[session.access_token]);
 useEffect(()=>{let active=true;call().then(result=>{if(active)setData(result)}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[call]);
 const act=async payload=>{setBusy(true);setError('');try{const result=await call(payload);if(result.url){window.location.assign(result.url);return;}setData(await call());}catch(e){setError(e.message)}finally{setBusy(false)}};
 return <Card title="Recurring services">
  {error&&<p role="alert">{error}</p>}
  {!data&&!error&&<p>Loading recurring services…</p>}
  {data&&!data.subscriptions.length&&!data.terms.length&&<Empty>No recurring agreements are on file.</Empty>}
  {ownerMode&&data&&<RecurringOwnerActions data={data} busy={busy} act={act} />}
  {!ownerMode&&data?.terms.filter(t=>!data.subscriptions.some(sub=>sub.estimate_id===t.estimate_id&&sub.first_payment_verified_at)).map(t=><article className="portal-row" key={t.id}><div><strong>{t.canonical_sku} — monthly agreement</strong><p>${(t.monthly_amount_cents/100).toFixed(2)} per month</p><p>{t.terms.scope}</p><p>Excluded: {t.terms.exclusions}</p><ul>{t.terms.allowances.map(a=><li key={a.key}>{a.quantity} {a.unit} of {a.key} per billing period</li>)}</ul><p>Unused allowances expire each period. Extra work requires a separate quote. Renews monthly at your approved estimate amount until canceled; cancellation takes effect at the end of the paid period.</p>{t.accepted_at?<button disabled={busy} onClick={()=>act({action:'start_checkout',termsId:t.id})}>Continue to subscription payment</button>:<button disabled={busy} onClick={()=>act({action:'accept_terms',termsId:t.id})}>Accept recurring scope and terms</button>}</div></article>)}
  {data?.subscriptions.map(s=><article key={s.id}><strong>{s.canonical_sku}</strong><p>{statusLabel(s.subscription_status)} · {s.cancel_at_period_end?'Ends':'Current paid period ends'} {formatDate(s.current_period_end)}</p>{!ownerMode&&<button disabled={busy} onClick={()=>act({action:'manage_billing',subscriptionId:s.id})}>Manage billing or cancel</button>}{s.cycles.map(c=><div className="portal-row" key={c.id}><div><p>{formatDate(c.period_start)} – {formatDate(c.period_end)} · {statusLabel(c.fulfillment_status)}</p>{c.allowances.map(a=><p key={a.key}>{a.key}: {a.consumed} of {a.quantity} {a.unit} used; {a.remaining} remaining{a.excess>0?` · ${a.excess} extra requires a separate quote`:''}</p>)}</div></div>)}</article>)}
 </Card>;
}
