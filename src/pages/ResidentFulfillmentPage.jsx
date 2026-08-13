import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { listResidentDispatches, updateResidentDispatch } from '../services/residentDispatchService';

const STATUS = ['all', 'new', 'confirmed', 'scheduled', 'in_progress', 'ready', 'completed', 'cancelled'];
const STATUS_LABELS = { all: 'All', new: 'New', confirmed: 'Confirmed', scheduled: 'Scheduled', in_progress: 'In Progress', ready: 'Ready', completed: 'Completed', cancelled: 'Cancelled' };
const money = n => `$${Number(n || 0).toFixed(2)}`;

const css = `
.rf-page{min-height:100vh;background:#f7f1e8;color:#291a16;font-family:Inter,system-ui,sans-serif}.rf-page *{box-sizing:border-box}.rf-top{background:linear-gradient(135deg,#4c0e1c,#70182e);color:#fff;padding:22px 18px;position:sticky;top:0;z-index:10}.rf-top-inner{max-width:1180px;margin:auto;display:flex;gap:14px;align-items:center;justify-content:space-between}.rf-brand small{letter-spacing:2px;color:#e8d08d;font-weight:800}.rf-brand h1{font-family:Georgia,serif;margin:4px 0 0;font-size:25px}.rf-user{font-size:12px;text-align:right}.rf-user button,.rf-btn{border:0;border-radius:8px;padding:9px 12px;font-weight:800;cursor:pointer}.rf-user button{margin-top:6px;background:#fff;color:#5b1223}.rf-main{max-width:1180px;margin:auto;padding:18px}.rf-login{max-width:420px;margin:12vh auto;background:#fffdf8;border:1px solid #d7c49a;border-radius:16px;padding:24px;box-shadow:0 8px 30px rgba(76,14,28,.08)}.rf-login h2{font-family:Georgia,serif;color:#4c0e1c}.rf-label{display:block;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:800;color:#6d1b2c;margin:12px 0 5px}.rf-input{width:100%;padding:11px;border:1px solid #d7c49a;border-radius:8px;background:#fff}.rf-error{margin:10px 0;padding:10px;border-radius:8px;background:#fbe8e6;color:#8e2d26;font-size:12px}.rf-dashboard{display:grid;gap:16px}.rf-toolbar{background:#fffdf8;border:1px solid #d7c49a;border-radius:14px;padding:14px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}.rf-tab{background:#f1e8d8;border:1px solid #d7c49a;color:#5b4037;border-radius:999px;padding:8px 12px;font-weight:800;cursor:pointer}.rf-tab.active{background:#6d172c;color:#fff;border-color:#6d172c}.rf-refresh{margin-left:auto;background:#c69a2e;color:#32170f}.rf-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px}.rf-card{background:#fffdf8;border:1px solid #d7c49a;border-radius:14px;padding:15px;box-shadow:0 4px 15px rgba(76,14,28,.05)}.rf-card.selected{outline:2px solid #c69a2e}.rf-card-head{display:flex;justify-content:space-between;gap:12px}.rf-code{font-weight:900;color:#6d172c}.rf-time{font-size:11px;color:#806f67}.rf-resident{font-family:Georgia,serif;font-size:19px;color:#4c0e1c;margin:8px 0 2px}.rf-meta{font-size:12px;color:#624f47}.rf-pill{font-size:10px;text-transform:uppercase;letter-spacing:.7px;padding:5px 8px;border-radius:999px;background:#eee2cb;color:#5c4338;font-weight:900;white-space:nowrap}.rf-items{margin:12px 0;border-top:1px dotted #d7c49a}.rf-item{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px dotted #d7c49a;font-size:12px}.rf-note{font-size:11px;color:#6d5b53;background:#f5edde;padding:9px;border-radius:8px;margin-top:10px}.rf-total{display:flex;justify-content:space-between;font-weight:900;color:#4c0e1c;margin-top:10px}.rf-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:13px}.rf-actions button{border:0;border-radius:8px;padding:9px 11px;font-size:11px;font-weight:900;cursor:pointer}.rf-primary{background:#6d172c;color:#fff}.rf-gold{background:#c69a2e;color:#32170f}.rf-muted{background:#eee2cb;color:#5b4037}.rf-empty{padding:35px;text-align:center;color:#75635b;background:#fffdf8;border:1px dashed #d7c49a;border-radius:14px}.rf-select{padding:9px;border:1px solid #d7c49a;border-radius:8px;background:#fff}.rf-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.rf-stat{background:#fffdf8;border:1px solid #d7c49a;border-radius:12px;padding:13px}.rf-stat b{display:block;font-size:22px;color:#4c0e1c}.rf-stat span{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#75635b;font-weight:800}@media(max-width:650px){.rf-stats{grid-template-columns:repeat(2,1fr)}.rf-top-inner{align-items:flex-start}.rf-user{font-size:10px}}
`;

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async e => {
    e.preventDefault(); setBusy(true); setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) setError(authError.message);
    else onLogin();
    setBusy(false);
  };
  return <div className="rf-login"><small style={{letterSpacing:2,color:'#c69a2e',fontWeight:800}}>DANI DECLARES LLC</small><h2>Resident Fulfillment</h2><p style={{fontSize:12,color:'#6c5b54'}}>Staff access only. Sign in with the Supabase team account authorized for fulfillment operations.</p><form onSubmit={submit}><label className="rf-label">Email</label><input className="rf-input" type="email" required value={email} onChange={e=>setEmail(e.target.value)} /><label className="rf-label">Password</label><input className="rf-input" type="password" required value={password} onChange={e=>setPassword(e.target.value)} />{error&&<div className="rf-error">{error}</div>}<button className="rf-btn rf-primary" style={{width:'100%',marginTop:14}} disabled={busy}>{busy?'Signing in…':'Sign in'}</button></form></div>;
}

export default function ResidentFulfillmentPage() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState('all');
  const [dispatches, setDispatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true); setError('');
    const result = await listResidentDispatches({ status });
    if (!result.success) setError(result.error || 'Unable to load dispatches.');
    setDispatches(result.data || []); setBusy(false);
  };

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setReady(true); } });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => { if (session) load(); }, [session, status]);

  const stats = useMemo(() => {
    const count = s => dispatches.filter(x => x.status === s).length;
    return { total: dispatches.length, new: count('new'), active: count('confirmed') + count('scheduled') + count('in_progress'), ready: count('ready') };
  }, [dispatches]);

  const setDispatch = async (id, patch) => {
    const result = await updateResidentDispatch(id, patch);
    if (!result.success) { setError(result.error || 'Update failed.'); return; }
    setDispatches(current => current.map(item => item.id === id ? result.data : item));
    setSelected(result.data);
  };

  if (!ready) return <div className="rf-page" />;
  if (!session) return <div className="rf-page"><style>{css}</style><Login onLogin={()=>{}} /></div>;

  return <div className="rf-page"><style>{css}</style>
    <header className="rf-top"><div className="rf-top-inner"><div className="rf-brand"><small>OPERATIONS TERMINAL</small><h1>Resident Fulfillment</h1></div><div className="rf-user">{session.user.email}<br/><button onClick={()=>supabase.auth.signOut()}>Sign out</button></div></div></header>
    <main className="rf-main"><div className="rf-dashboard">
      <section className="rf-stats"><div className="rf-stat"><b>{stats.total}</b><span>Queue</span></div><div className="rf-stat"><b>{stats.new}</b><span>New</span></div><div className="rf-stat"><b>{stats.active}</b><span>Active</span></div><div className="rf-stat"><b>{stats.ready}</b><span>Ready</span></div></section>
      <section className="rf-toolbar">{STATUS.map(s=><button key={s} className={`rf-tab ${status===s?'active':''}`} onClick={()=>setStatus(s)}>{STATUS_LABELS[s]}</button>)}<button className="rf-btn rf-refresh" onClick={load}>{busy?'Refreshing…':'Refresh Queue'}</button></section>
      {error&&<div className="rf-error">{error}</div>}
      <section className="rf-grid">{dispatches.length===0?<div className="rf-empty">No resident dispatches in this view.</div>:dispatches.map(item=><article key={item.id} className={`rf-card ${selected?.id===item.id?'selected':''}`}>
        <div className="rf-card-head"><div><div className="rf-code">{item.ticket_code}</div><div className="rf-time">{new Date(item.created_at).toLocaleString()}</div></div><span className="rf-pill">{STATUS_LABELS[item.status] || item.status}</span></div>
        <div className="rf-resident">{item.resident_name}</div><div className="rf-meta">{item.unit ? `Unit ${item.unit}` : 'Unit not supplied'}{item.community?` · ${item.community}`:''}{item.phone?` · ${item.phone}`:''}</div>
        <div className="rf-items">{(item.items||[]).map((line,index)=><div className="rf-item" key={`${item.id}-${index}`}><span>{line.qty}× {line.name}{line.variant?` · ${line.variant}`:''}</span><b>{money(line.lineTotal ?? Number(line.price||0)*Number(line.qty||0))}</b></div>)}</div>
        {(item.modifiers||[]).map((m,index)=><div className="rf-meta" key={`${item.id}-m-${index}`}>• {m.label}: {money(m.amount)}</div>)}
        <div className="rf-total"><span>Estimated Total</span><span>{money(item.totals?.grandTotal)}</span></div>
        {item.resident_note&&<div className="rf-note"><b>Resident note:</b> {item.resident_note}</div>}
        <div className="rf-actions"><button className="rf-primary" onClick={()=>setDispatch(item.id,{status:'confirmed'})}>Confirm</button><button className="rf-gold" onClick={()=>setDispatch(item.id,{status:'in_progress'})}>Start</button><button className="rf-muted" onClick={()=>setDispatch(item.id,{status:'ready'})}>Ready</button><button className="rf-muted" onClick={()=>setDispatch(item.id,{status:'completed'})}>Complete</button></div>
        <div style={{display:'flex',gap:7,marginTop:8}}><select className="rf-select" value={item.priority||'normal'} onChange={e=>setDispatch(item.id,{priority:e.target.value})}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select><input className="rf-input" style={{padding:'8px'}} placeholder="Assign to" value={item.assigned_to||''} onChange={e=>setDispatch(item.id,{assigned_to:e.target.value})} /></div>
      </article>)}</section>
    </div></main>
  </div>;
}
