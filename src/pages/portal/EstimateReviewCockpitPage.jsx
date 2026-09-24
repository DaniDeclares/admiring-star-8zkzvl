import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import RequireStaffAuth from '../../components/auth/RequireStaffAuth.jsx';
import { supabase } from '../../lib/supabaseClient.js';

const FLAG_LABELS={
  FULFILLMENT_OR_COMMERCIAL_GATE:'Commercial / fulfillment gate',
  SCOPE_REVIEW:'Scope confirmation',
  TRAVEL_CONFIRMATION:'Mileage / travel confirmation',
  MATERIALS_CONFIRMATION:'Materials cost confirmation',
  PASS_THROUGH_CONFIRMATION:'Pass-through cost confirmation',
  TAX_REVIEW:'Tax review',
  MANUAL_BASE_IGNORED_GOVERNED_PRICING:'Governed pricing acknowledgement',
  LAYOUT_REVIEW:'Bedroom / layout confirmation',
  SPECIALTY_CARPET_SCOPE:'Specialty carpet scope',
  DEBRIS_FURNITURE_SCOPE:'Debris / furniture scope'
};

function ReviewCockpit(){
  const {id}=useParams();
  const navigate=useNavigate();
  const [estimate,setEstimate]=useState(null);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [deliverySaving,setDeliverySaving]=useState(false);
  const [review,setReview]=useState({});
  const [answers,setAnswers]=useState({});

  const load=async()=>{
    setLoading(true);setError('');
    try{
      const {data:s}=await supabase.auth.getSession();
      if(!s.session) throw new Error('Staff session required.');
      const r=await fetch('/api/portal-operations',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${s.session.access_token}`},body:JSON.stringify({action:'get_estimate',estimateId:id})});
      const d=await r.json();
      if(!r.ok||!d.success) throw new Error(d.error||'Could not load estimate.');
      const e=d.estimate; setEstimate(e);
      setAnswers(e.intake_answers?.answers||{});
      setReview(e.intake_answers?.review||{});
    }catch(e){setError(e.message||'Could not load estimate.')}
    finally{setLoading(false);}
  };
  // load is intentionally recreated with the current auth/session context; id is the lifecycle key.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{load()},[id]);

  const flags=useMemo(()=>estimate?.intake_answers?.pricingSnapshot?.reviewFlags||[],[estimate]);
  const resolutions=review.resolutions||{};
  const packageItems=estimate?.intake_answers?.pricingSnapshot?.lineItems||estimate?.intake_answers?.lineItems||[];
  const unresolved=flags.filter(f=>resolutions[f]!==true);
  const setField=(key,value)=>setAnswers(a=>({...a,[key]:value}));
  const setResolution=(flag,value)=>setReview(r=>({...r,resolutions:{...(r.resolutions||{}),[flag]:Boolean(value)}}));

  const sendEstimate=async()=>{
    setDeliverySaving(true);setError('');setMessage('');
    try{
      const {data:s}=await supabase.auth.getSession(); if(!s.session) throw new Error('Staff session required.');
      const r=await fetch('/api/portal-operations',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${s.session.access_token}`},body:JSON.stringify({action:'send_estimate',estimateId:id})});
      const d=await r.json(); if(!r.ok||!d.success) throw new Error(d.error||'Could not deliver quote.');
      setEstimate(prev=>({...prev,estimate_status:d.estimate.estimate_status})); setMessage('Quote delivered to the customer portal. The customer must approve it before payment.');
    }catch(e){setError(e.message||'Could not deliver quote.')}finally{setDeliverySaving(false);}
  };

  const createStripeInvoice=async()=>{
    setSaving(true);setError('');setMessage('');
    try{
      const {data:s}=await supabase.auth.getSession();
      if(!s.session) throw new Error('Staff session required.');
      const r=await fetch('/api/portal-operations',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${s.session.access_token}`},body:JSON.stringify({action:'create_stripe_invoice',estimateId:id})});
      const d=await r.json(); if(!r.ok||!d.success) throw new Error(d.error||'Could not create Stripe invoice.');
      const url=d.invoice?.hosted_invoice_url;
      if(!url) throw new Error('Stripe invoice was created without a hosted payment URL.');
      setMessage(d.invoice.alreadyExists?'Existing Stripe invoice recovered.':'Stripe invoice created and finalized. The customer has not been marked as sent.');
      window.open(url,'_blank','noopener,noreferrer');
    }catch(e){setError(e.message||'Could not create Stripe invoice.')}
    finally{setSaving(false);}
  };

  const save=async()=>{
    setSaving(true);setError('');setMessage('');
    try{
      const {data:s}=await supabase.auth.getSession();
      if(!s.session) throw new Error('Staff session required.');
      const r=await fetch('/api/portal-operations',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${s.session.access_token}`},body:JSON.stringify({
        action:'review_estimate',estimateId:id,
        review:{
          materialsCost:answers.materials_cost,
          passThroughCost:answers.pass_through_cost,
          taxRatePercent:answers.tax_rate_percent,
          milesOneWay:answers.miles_one_way,
          scopeConfirmed:resolutions.SCOPE_REVIEW===true,
          materialsConfirmed:resolutions.MATERIALS_CONFIRMATION===true,
          passThroughConfirmed:resolutions.PASS_THROUGH_CONFIRMATION===true,
          travelConfirmed:resolutions.TRAVEL_CONFIRMATION===true,
          taxReviewed:resolutions.TAX_REVIEW===true,
          fulfillmentConfirmed:resolutions.FULFILLMENT_OR_COMMERCIAL_GATE===true,
          manualPricingAcknowledged:resolutions.MANUAL_BASE_IGNORED_GOVERNED_PRICING===true
        }
      })});
      const d=await r.json(); if(!r.ok||!d.success) throw new Error(d.error||'Could not save review.');
      setEstimate(d.estimate); setAnswers(d.estimate.intake_answers?.answers||{}); setReview(d.estimate.intake_answers?.review||{});
      setMessage(d.readyToSend?'Review complete. Estimate is READY TO SEND.':'Review saved. Resolve the remaining gates before delivery.');
    }catch(e){setError(e.message||'Could not save review.')}
    finally{setSaving(false);}
  };

  if(loading) return <RequireStaffAuth><main style={page}><div style={wrap}><strong>Loading review cockpit…</strong></div></main></RequireStaffAuth>;

  return <RequireStaffAuth><main style={page}><div style={wrap}>
    <header style={header}>
      <div><div style={eyebrow}>DANI DECLARES · COMMERCIAL CONTROL</div><h1 style={h1}>Estimate Review Cockpit</h1><p style={sub}>Resolve the evidence and commercial gates on this saved estimate before anything is sent to the customer.</p></div>
      <div style={{display:'flex',gap:9,flexWrap:'wrap'}}><Link to="/portal/saved-quotes" style={btn('#fff','#5a1624')}>← Saved Quotes</Link><Link to="/portal" style={btn('#fff','#5a1624')}>My Portal</Link></div>
    </header>
    {error&&<div style={alert('#fff0f0','#8a1d2d')}>{error}</div>}
    {message&&<div style={alert('#edf8ef','#245b34')}>{message}</div>}

    <section style={grid2}>
      <Card title="Estimate">
        <div style={ref}>{estimate.public_reference}</div><h2 style={title}>{estimate.client_name||'Unnamed customer'}</h2>
        <div style={muted}>{estimate.client_phone||'No phone'} · {estimate.client_email||'No email'}</div>
        <div style={muted}>{estimate.location_address||'No location captured'}</div><div style={muted}>Timeline: {estimate.timeline||'No timeline captured'}</div>
        <div style={total}>${Number(estimate.estimated_total||0).toFixed(2)}</div>
        <div style={status(estimate.estimate_status)}>{String(estimate.estimate_status||'').replaceAll('_',' ').toUpperCase()}</div>
      </Card>
      <Card title="Pricing scratchpad">
        <Line label="Base" value={estimate.base_subtotal}/><Line label="Add-ons" value={estimate.addon_subtotal}/><Line label="Travel" value={estimate.travel_fee}/><Line label="Rush" value={estimate.rush_fee}/><Line label="Materials + sourcing" value={estimate.supplies_fee}/><Line label="Pass-through" value={estimate.pass_through_fee}/><Line label="Tax" value={estimate.tax_amount}/>
        <div style={{borderTop:'1px solid #eadfc9',marginTop:10,paddingTop:10,fontWeight:900}}>Total <span style={{float:'right'}}>${Number(estimate.estimated_total||0).toFixed(2)}</span></div>
      </Card>
    </section>

    {packageItems.length>0&&<Card title="Package components">
      <p style={muted}>Each component was priced from its own service contract and input snapshot. The package total below is the sum of those governed component calculations.</p>
      <div style={{display:'grid',gap:10}}>
        {packageItems.map((item,index)=><div key={item.serviceSku||index} style={{padding:13,border:'1px solid #eadfc9',borderRadius:11,background:'#fffaf0'}}>
          <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start'}}><div><strong>{item.serviceName||item.serviceSku}</strong><div style={muted}>{item.serviceSku} · {item.componentRole||'PRIMARY'}{item.parentServiceSku?` · add-on to ${item.parentServiceSku}`:''} · {item.sourceType||'GOVERNED'}</div></div><strong style={{color:'#5a1624'}}>${Number(item.calculation?.estimatedTotal||0).toFixed(2)}</strong></div>
          {item.answers&&<div style={{marginTop:8,fontSize:12,color:'#6d5b60',display:'grid',gap:3}}>{Object.entries(item.answers).filter(([k,v])=>v!==''&&v!==null&&v!==false&&['materials_cost','pass_through_cost','tax_rate_percent','deposit_percent','quantity','hours','miles_one_way'].indexOf(k)<0).map(([k,v])=><div key={k}><strong>{k.replaceAll('_',' ')}:</strong> {String(v)}</div>)}</div>}
        </div>)}
      </div>
    </Card>}

    <Card title="BILL-TO CUSTOMER IDENTITY VERIFICATION">
      <div style={{padding:14,border:'2px solid #8b6b1f',borderRadius:10,background:'#fffaf0'}}>
        <div style={{fontWeight:900,color:'#5a1624',marginBottom:8}}>Confirm this is the person or organization who will receive and pay the invoice.</div>
        <div style={formGrid}>
          <div><strong>Bill-to name</strong><div style={{marginTop:6,padding:11,border:'1px solid #decfae',borderRadius:10,background:'#fff'}}>{estimate.client_name||'NOT PROVIDED'}</div></div>
          <div><strong>Bill-to email</strong><div style={{marginTop:6,padding:11,border:'1px solid #decfae',borderRadius:10,background:'#fff'}}>{estimate.client_email||'NOT PROVIDED'}</div></div>
          <div><strong>Bill-to phone</strong><div style={{marginTop:6,padding:11,border:'1px solid #decfae',borderRadius:10,background:'#fff'}}>{estimate.client_phone||'NOT PROVIDED'}</div></div>
        </div>
        <div style={{marginTop:10,fontSize:13,color:'#6d5b60'}}>Staff/operator contact information is never the bill-to identity. Stripe invoice creation is server-blocked if these fields are blank, suspicious, or resolve back to DANI DECLARES operating contact information.</div>
      </div>
    </Card>

    <Card title="Evidence adjudication">
      <p style={muted}>Enter the confirmed field facts. These values are fed back through the existing governed quote engine; this cockpit does not create a second pricing formula.</p>
      <div style={formGrid}>
        {flags.includes('TRAVEL_CONFIRMATION')&&<Field label="Confirmed one-way mileage" value={answers.miles_one_way} onChange={v=>setField('miles_one_way',v)} suffix="mi"/>}
        {flags.includes('MATERIALS_CONFIRMATION')&&<Field label="Confirmed actual materials cost" value={answers.materials_cost} onChange={v=>setField('materials_cost',v)} prefix="$"/>}
        {flags.includes('PASS_THROUGH_CONFIRMATION')&&<Field label="Confirmed pass-through cost" value={answers.pass_through_cost} onChange={v=>setField('pass_through_cost',v)} prefix="$"/>}
        {flags.includes('TAX_REVIEW')&&<Field label="Tax rate to apply" value={answers.tax_rate_percent} onChange={v=>setField('tax_rate_percent',v)} suffix="%"/>}
      </div>
    </Card>

    <Card title="Active review gates">
      {flags.length===0?<div style={good}>No review flags were generated.</div>:<div style={{display:'grid',gap:10}}>
        {flags.map(flag=><div key={flag} style={gate}>
          <div><strong>{FLAG_LABELS[flag]||flag}</strong><div style={muted}>{flag==='FULFILLMENT_OR_COMMERCIAL_GATE'?'This is controlled by catalog/commercial authorization and cannot be manually overridden here.':flag==='SCOPE_REVIEW'?'Confirm the actual scope before delivery.':flag==='TAX_REVIEW'?'Confirm the applicable tax treatment, including an intentional 0% result.':'Confirm the field fact above before delivery.'}</div></div>
          {flag==='FULFILLMENT_OR_COMMERCIAL_GATE'?<span style={pill(false)}>BLOCKED BY CATALOG</span>:<label style={{display:'flex',alignItems:'center',gap:8,fontWeight:800}}><input type="checkbox" checked={resolutions[flag]===true} onChange={e=>setResolution(flag,e.target.checked)}/> Confirmed</label>}
        </div>)}
      </div>}
      {unresolved.length>0&&<div style={{marginTop:14,color:'#8a1d2d',fontWeight:800}}>{unresolved.length} gate{unresolved.length===1?'':'s'} still unresolved.</div>}
    </Card>

    <Card title="Scope confirmation">
      <label style={{display:'flex',gap:10,alignItems:'flex-start',fontWeight:800}}><input type="checkbox" checked={resolutions.SCOPE_REVIEW===true} onChange={e=>setResolution('SCOPE_REVIEW',e.target.checked)}/><span>I have reviewed the customer/request details and confirm the scope represented by this estimate is accurate enough for customer delivery.</span></label>
    </Card>

    <div style={{display:'flex',gap:10,flexWrap:'wrap',justifyContent:'flex-end',marginTop:16}}>
      <button onClick={()=>navigate(`/portal/quotes?estimateId=${id}`)} style={btn('#fff','#5a1624')}>Edit Quote Inputs</button>
      <button disabled={saving} onClick={save} style={btn('#5a1624','#fff')}>{saving?'Saving review…':estimate.estimate_status==='ready_to_send'?'Save Review':'Save & Reconcile Review'}</button>
    </div>

    {['ready_to_send','approved'].includes(estimate.estimate_status)&&<section style={{...CardStyle,marginTop:18,border:'2px solid #8b6b1f'}}>
      <div style={eyebrow}>QUOTE DELIVERY / PAYMENT</div><h2 style={{margin:'5px 0',color:'#5a1624'}}>{estimate.estimate_status==='approved'?'CUSTOMER APPROVED':'READY TO SEND'}</h2>
      <p style={muted}>The estimate has passed its configured review gates. Deliver the quote to the customer portal; after customer approval, payment is opened from the customer workspace.</p><div style={{marginBottom:10,fontWeight:800,color:'#8a1d2d'}}>Stripe is connected in live mode. Creating the invoice below creates a real customer-facing Stripe invoice; it does not send SMS or email.</div>
      <div style={{display:'flex',gap:9,flexWrap:'wrap'}}>
        {estimate.estimate_status==='ready_to_send'&&<button disabled={deliverySaving} onClick={sendEstimate} style={btn('#5a1624','#fff')}>{deliverySaving?'Delivering quote…':'Send Quote to Customer Portal'}</button>}
        {estimate.estimate_status==='approved'&&<button disabled={saving} onClick={createStripeInvoice} style={btn('#5a1624','#fff')}>{saving?'Creating Stripe invoice…':'Create / Open Live Stripe Invoice'}</button>}
      </div>
    </section>}
  </div></main></RequireStaffAuth>;
}

function Card({title:cardTitle,children}){return <section style={CardStyle}><h2 style={cardTitleStyle}>{cardTitle}</h2>{children}</section>}
function Line({label,value}){return <div style={{display:'flex',justifyContent:'space-between',padding:'5px 0',fontSize:14}}><span>{label}</span><strong>${Number(value||0).toFixed(2)}</strong></div>}
function Field({label,value,onChange,prefix,suffix}){return <label style={{display:'grid',gap:6,fontWeight:800}}><span>{label}</span><div style={{display:'flex',alignItems:'center',border:'1px solid #decfae',borderRadius:10,background:'#fff'}}>{prefix&&<span style={{paddingLeft:11}}>{prefix}</span>}<input type="number" min="0" step="0.01" value={value??''} onChange={e=>onChange(e.target.value)} style={{width:'100%',padding:'11px',border:0,outline:0,borderRadius:10}}/>{suffix&&<span style={{paddingRight:11}}>{suffix}</span>}</div></label>}
const page={minHeight:'100vh',background:'#fffaf1',color:'#302226',padding:'28px 18px 60px'};
const wrap={maxWidth:1100,margin:'0 auto'};
const header={display:'flex',justifyContent:'space-between',gap:18,alignItems:'flex-start',flexWrap:'wrap',marginBottom:22};
const eyebrow={fontSize:12,letterSpacing:2,fontWeight:900,color:'#8b6b1f'};
const h1={margin:'5px 0',fontSize:'clamp(30px,5vw,48px)',color:'#5a1624'};
const sub={margin:0,maxWidth:760,color:'#6d5b60'};
const grid2={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:14};
const CardStyle={background:'#fff',border:'1px solid #e2d6bf',borderRadius:16,padding:18,marginBottom:14};
const cardTitleStyle={margin:'0 0 14px',fontSize:18,color:'#5a1624'};
const ref={fontSize:12,fontWeight:900,letterSpacing:1,color:'#8b6b1f'};
const title={margin:'5px 0',color:'#5a1624',fontSize:22};
const muted={color:'#6d5b60',fontSize:13,lineHeight:1.5};
const total={fontSize:34,fontWeight:900,color:'#5a1624',marginTop:14};
const status=s=>({display:'inline-block',marginTop:7,padding:'6px 9px',borderRadius:999,background:s==='ready_to_send'||s==='estimated'?'#edf8ef':'#f7edd4',color:s==='ready_to_send'||s==='estimated'?'#245b34':'#6f4d18',fontSize:12,fontWeight:900});
const gate={display:'flex',justifyContent:'space-between',gap:16,alignItems:'center',padding:13,border:'1px solid #eadfc9',borderRadius:11};
const pill=ok=>({display:'inline-block',padding:'6px 9px',borderRadius:999,background:ok?'#edf8ef':'#fff0f0',color:ok?'#245b34':'#8a1d2d',fontSize:11,fontWeight:900,whiteSpace:'nowrap'});
const good={padding:13,borderRadius:11,background:'#edf8ef',color:'#245b34',fontWeight:800};
const formGrid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14};
const btn=(background,color)=>({display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'11px 14px',borderRadius:10,border:'1px solid #decfae',background,color,textDecoration:'none',fontWeight:900,cursor:'pointer'});
const alert=(background,color)=>({marginBottom:14,padding:13,borderRadius:11,background,border:'1px solid #dfcfaa',color,fontWeight:700});
export default ReviewCockpit;
