import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RequireStaffAuth from '../../components/auth/RequireStaffAuth.jsx';
import { supabase } from '../../lib/supabaseClient.js';

const STATUS_LABELS={needs_review:'Needs review',estimated:'Reviewable',ready_to_send:'Ready to send',sent:'Sent',approved:'Customer approved',declined:'Declined',converted:'Converted',closed:'Closed',new:'New'};

function QuoteDesk(){
  const navigate=useNavigate();
  const [quotes,setQuotes]=useState([]);
  const [status,setStatus]=useState('ALL');
  const [search,setSearch]=useState('');
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState('');
  const [message,setMessage]=useState('');

  const load=async()=>{
    setLoading(true);setError('');
    try{
      const {data:s}=await supabase.auth.getSession();
      if(!s.session) throw new Error('Staff session required.');
      const r=await fetch('/api/portal-operations?estimates=1',{headers:{Authorization:`Bearer ${s.session.access_token}`}});
      const d=await r.json();
      if(!r.ok||!d.success) throw new Error(d.error||'Could not load saved quotes.');
      setQuotes(d.estimates||[]);
    }catch(e){setError(e.message||'Could not load saved quotes.');}
    finally{setLoading(false);}
  };
  useEffect(()=>{load()},[]);

  const filtered=useMemo(()=>{
    const q=search.trim().toLowerCase();
    return quotes.filter(x=>(status==='ALL'||x.estimate_status===status)&&(!q||[`${x.public_reference}`,`${x.client_name||''}`,`${x.client_phone||''}`,`${x.client_email||''}`].join(' ').toLowerCase().includes(q)));
  },[quotes,status,search]);

  const review=async(id)=>{
    setBusy(id);setError('');setMessage('');
    try{
      const {data:s}=await supabase.auth.getSession();
      const r=await fetch('/api/portal-operations',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${s.session.access_token}`},body:JSON.stringify({action:'review_estimate',estimateId:id})});
      const d=await r.json();if(!r.ok||!d.success)throw new Error(d.error||'Could not mark quote reviewed.');
      setMessage('Quote reviewed and moved to Ready / estimated.');await load();
    }catch(e){setError(e.message||'Could not review quote.')}finally{setBusy('')}
  };

  return <RequireStaffAuth><main style={{minHeight:'100vh',background:'#fffaf1',color:'#302226',padding:'28px 18px 60px'}}>
    <div style={{maxWidth:1220,margin:'0 auto'}}>
      <header style={{display:'flex',justifyContent:'space-between',gap:18,alignItems:'flex-start',flexWrap:'wrap',marginBottom:22}}>
        <div><div style={{fontSize:12,letterSpacing:2,fontWeight:900,color:'#8b6b1f'}}>DANI DECLARES OPERATING SYSTEM</div><h1 style={{margin:'5px 0',fontSize:'clamp(30px,5vw,48px)',color:'#5a1624'}}>Saved Quotes</h1><p style={{margin:0,maxWidth:760,color:'#6d5b60'}}>Your quote desk. Every estimate saved by the Quote Builder is retrieved here so you can reopen it, review it, and continue the commercial workflow.</p></div>
        <div style={{display:'flex',gap:9,flexWrap:'wrap'}}><Link to="/portal" style={buttonStyle('#fff','#5a1624')}>← My Portal</Link><Link to="/portal/quotes" style={buttonStyle('#efce72','#35161d')}>+ New Quote</Link></div>
      </header>
      {error&&<div style={alertStyle('#fff0f0','#8a1d2d')}>{error}</div>}
      {message&&<div style={alertStyle('#edf8ef','#245b34')}>{message}</div>}
      <section style={{background:'#fff',border:'1px solid #e2d6bf',borderRadius:16,padding:16,marginBottom:16}}>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, phone, email, or estimate number…" style={{flex:'1 1 320px',padding:'11px 12px',borderRadius:10,border:'1px solid #decfae'}}/>
          <select value={status} onChange={e=>setStatus(e.target.value)} style={{padding:'11px 12px',borderRadius:10,border:'1px solid #decfae'}}><option value="ALL">All statuses</option>{Object.entries(STATUS_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
          <button onClick={load} style={buttonStyle('#f7edd4','#5a1624')}>Refresh</button>
        </div>
      </section>
      <section style={{display:'grid',gap:12}}>
        {loading?<div style={cardStyle}><strong>Loading saved quotes…</strong></div>:filtered.length===0?<div style={cardStyle}><strong>No saved quotes match this view.</strong><p style={{color:'#6d5b60'}}>Quotes do not disappear when you leave the builder. If you just saved one, refresh this list and it will be here.</p></div>:filtered.map(q=><article key={q.id} style={cardStyle}>
          <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) auto',gap:16,alignItems:'start'}}>
            <div><div style={{fontSize:12,fontWeight:900,letterSpacing:1,color:'#8b6b1f'}}>{q.public_reference}</div><h2 style={{margin:'5px 0',color:'#5a1624',fontSize:21}}>{q.client_name||'Unnamed customer'}</h2><div style={{display:'flex',gap:14,flexWrap:'wrap',fontSize:13,color:'#6d5b60'}}><span>{q.client_phone||'No phone'}</span><span>{q.client_email||'No email'}</span><span>{q.source_slug||'Quote Builder'}</span></div><div style={{marginTop:9,fontSize:13,color:'#6d5b60'}}>Created {new Date(q.created_at).toLocaleString()} {q.service_request_id?'· linked to website request':'· standalone quote'}</div></div>
            <div style={{textAlign:'right'}}><div style={{fontSize:24,fontWeight:900,color:'#5a1624'}}>$${Number(q.estimated_total||0).toFixed(2)}</div><span style={{display:'inline-block',marginTop:6,padding:'6px 9px',borderRadius:999,background:q.estimate_status==='needs_review'?'#f7edd4':'#edf8ef',color:q.estimate_status==='needs_review'?'#6f4d18':'#245b34',fontSize:12,fontWeight:900}}>{STATUS_LABELS[q.estimate_status]||q.estimate_status}</span></div>
          </div>
          <div style={{display:'flex',gap:9,flexWrap:'wrap',marginTop:15,paddingTop:14,borderTop:'1px solid #eee3d0'}}>
            <button onClick={()=>navigate(`/portal/estimates/${q.id}/review`)} style={buttonStyle('#5a1624','#fff')}>Open Review Cockpit</button>
            <button onClick={()=>navigate(`/portal/quotes?estimateId=${q.id}`)} style={buttonStyle('#fff','#5a1624')}>Edit Inputs</button>
          </div>
        </article>)}
      </section>
    </div>
  </main></RequireStaffAuth>;
}
const buttonStyle=(bg,color)=>({display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'11px 14px',borderRadius:10,border:'1px solid #decfae',background:bg,color,textDecoration:'none',fontWeight:900,cursor:'pointer'});
const cardStyle={background:'#fff',border:'1px solid #e2d6bf',borderRadius:16,padding:18};
const alertStyle=(background,color)=>({marginBottom:14,padding:13,borderRadius:11,background,border:'1px solid #dfcfaa',color,fontWeight:700});
export default QuoteDesk;
