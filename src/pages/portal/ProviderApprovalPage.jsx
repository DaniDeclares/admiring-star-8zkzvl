import React, { useEffect, useMemo, useState } from 'react';
import RequireStaffAuth from '../../components/auth/RequireStaffAuth.jsx';
import { supabase } from '../../lib/supabaseClient.js';

function Gate({ label, ok }) {
  return <span style={{display:'inline-flex',alignItems:'center',gap:6,padding:'5px 9px',borderRadius:999,background:ok?'#edf8ef':'#fff4e5',color:ok?'#276b35':'#8a4b00',fontSize:12,fontWeight:700}}>{ok?'✓':'•'} {label}</span>;
}

function ProviderApproval() {
  const [applications, setApplications] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    const { data: auth } = await supabase.auth.getSession();
    if (!auth.session) { setError('Staff session required.'); setLoading(false); return; }
    const { data: body, error: invokeError } = await supabase.functions.invoke('provider-application-review', { body: { action: 'list' } });
    if (invokeError || !body?.success) setError(body?.error || invokeError?.message || 'Provider applications could not be loaded.');
    else { setApplications(body.applications || []); if (!selectedId && body.applications?.[0]) setSelectedId(body.applications[0].id); }
    setLoading(false);
  };

  // load is intentionally a stable local loader; it is also reused after every staff action.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const selected = useMemo(() => applications.find(a => a.id === selectedId) || applications[0] || null, [applications, selectedId]);

  const act = async (action, payload = {}) => {
    if (!selected) return;
    setBusy(true); setError(''); setMessage('');
    const { data: auth } = await supabase.auth.getSession();
    if (!auth.session) { setBusy(false); setError('Staff session required.'); return; }
    const { data: body, error: invokeError } = await supabase.functions.invoke('provider-application-review', { body: { action, applicationId: selected.id, ...payload } });
    if (invokeError || !body?.success) setError(body?.error || invokeError?.message || 'Provider review action failed.');
    else { setMessage(action === 'approve_and_activate' ? 'Provider approved and activated.' : 'Review action completed.'); await load(); }
    setBusy(false);
  };

  if (loading) return <main style={{maxWidth:1200,margin:'0 auto',padding:'48px 24px'}}><h1>Provider Approval</h1><p>Loading applications…</p></main>;

  return <main style={{maxWidth:1400,margin:'0 auto',padding:'40px 24px',fontFamily:'inherit'}}>
    <header style={{display:'flex',justifyContent:'space-between',gap:24,alignItems:'flex-start',marginBottom:28}}>
      <div><p style={{letterSpacing:2,fontSize:12,fontWeight:800,margin:0}}>DANI DECLARES · STAFF CONTROL</p><h1 style={{fontSize:38,margin:'8px 0'}}>Provider Approval & Activation</h1><p style={{maxWidth:760,color:'#555'}}>Review the provider's identity, compliance, agreement and selected canonical services. Approval is fail-closed: only a fully reviewed application can become dispatch-eligible.</p></div>
      <a href="/portal/operations" style={{padding:'10px 14px',border:'1px solid #ddd',borderRadius:10,textDecoration:'none',color:'inherit'}}>← Operations</a>
    </header>
    {error && <div style={{padding:14,borderRadius:10,background:'#fff0f0',color:'#8b1e1e',marginBottom:16}}>{error}</div>}
    {message && <div style={{padding:14,borderRadius:10,background:'#edf8ef',color:'#276b35',marginBottom:16}}>✓ {message}</div>}
    <section style={{display:'grid',gridTemplateColumns:'360px 1fr',gap:20}}>
      <aside style={{border:'1px solid #e4e4e4',borderRadius:14,overflow:'hidden',background:'#fff'}}>
        <div style={{padding:16,borderBottom:'1px solid #eee',fontWeight:800}}>APPLICATIONS ({applications.length})</div>
        {applications.length===0 && <p style={{padding:16,color:'#666'}}>No provider applications yet.</p>}
        {applications.map(app => <button key={app.id} onClick={()=>setSelectedId(app.id)} style={{display:'block',width:'100%',textAlign:'left',padding:16,border:0,borderBottom:'1px solid #eee',background:selected?.id===app.id?'#f6f6f6':'#fff',cursor:'pointer'}}><strong>{app.dba_name || app.legal_name}</strong><div style={{fontSize:13,color:'#666',marginTop:4}}>{app.contact_first_name} {app.contact_last_name}</div><div style={{fontSize:12,marginTop:8}}>{app.application_status} · {app.capabilities?.length||0} services</div></button>)}
      </aside>
      {selected ? <article style={{border:'1px solid #e4e4e4',borderRadius:14,padding:24,background:'#fff'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'flex-start'}}><div><h2 style={{margin:'0 0 6px'}}>{selected.dba_name || selected.legal_name}</h2><p style={{margin:0,color:'#666'}}>{selected.contact_first_name} {selected.contact_last_name} · {selected.contact_email}</p></div><strong style={{padding:'7px 10px',borderRadius:8,background:'#f3f3f3'}}>{selected.application_status}</strong></div>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,margin:'20px 0'}}>
          <Gate label="Tax" ok={['VERIFIED','NOT_REQUIRED'].includes(selected.tax_form_status)} />
          <Gate label="Insurance" ok={['VERIFIED','NOT_REQUIRED'].includes(selected.insurance_status)} />
          <Gate label="Identity" ok={selected.identity_status==='VERIFIED'} />
          <Gate label="Agreement" ok={selected.agreement_status==='EXECUTED'} />
          <Gate label="Background" ok={['CLEARED','NOT_REQUIRED'].includes(selected.background_check_status)} />
          <Gate label="Compliance" ok={selected.compliance_status==='VERIFIED'} />
          <Gate label="Capabilities" ok={(selected.capabilities||[]).length>0 && selected.capabilities.every(c=>c.authorization_status==='AUTHORIZED'&&c.evidence_status==='VERIFIED'&&['VERIFIED','NOT_REQUIRED'].includes(c.requirement_status))} />
          <Gate label="Documents" ok={(selected.documents||[]).every(d=>!['PENDING','REJECTED','EXPIRED'].includes(d.verification_status))} />
        </div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:24}}>
          <button disabled={busy} onClick={()=>act('set_review_status',{status:'UNDER_REVIEW'})}>Mark under review</button>
          <button disabled={busy} onClick={()=>act('set_review_status',{status:'NEEDS_INFO',notes:'Additional information required.'})}>Request info</button>
          <button disabled={busy} onClick={()=>act('set_review_status',{status:'REJECTED',notes:'Rejected during staff review.'})}>Reject</button>
        </div>

        <section style={{marginBottom:28}}><h3>Application details</h3><div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10,color:'#444'}}><div><strong>Type:</strong> {selected.applicant_type}</div><div><strong>Phone:</strong> {selected.contact_phone || '—'}</div><div><strong>Service area:</strong> {selected.service_area || '—'}</div><div><strong>Website:</strong> {selected.website || '—'}</div><div><strong>Experience:</strong> {selected.years_experience || '—'}</div><div><strong>Availability:</strong> {selected.availability || '—'}</div></div><p style={{whiteSpace:'pre-wrap'}}><strong>Service notes:</strong><br/>{selected.service_notes || '—'}</p></section>

        <section style={{marginBottom:28}}><h3>Canonical service capabilities</h3>{!(selected.capabilities||[]).length && <p>No canonical services selected.</p>}{(selected.capabilities||[]).map(cap=><div key={cap.id} style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'center',padding:14,border:'1px solid #eee',borderRadius:10,marginBottom:8}}><div><strong>{cap.canonical_sku || 'Unmapped'} · {cap.capability_description || cap.capability_key}</strong><div style={{fontSize:12,color:'#666',marginTop:5}}>Authorization: {cap.authorization_status} · Evidence: {cap.evidence_status} · Requirement: {cap.requirement_status}</div></div><div>{cap.authorization_status!=='AUTHORIZED' ? <button disabled={busy} onClick={()=>act('verify_capability',{capabilityId:cap.id,decision:'AUTHORIZED'})}>Authorize</button> : <button disabled={busy} onClick={()=>act('verify_capability',{capabilityId:cap.id,decision:'REJECTED'})}>Revoke</button>}</div></div>)}</section>

        <section style={{marginBottom:28}}><h3>Application documents</h3>{!(selected.documents||[]).length && <p>No application documents submitted.</p>}{(selected.documents||[]).map(doc=><div key={doc.id} style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'center',padding:14,border:'1px solid #eee',borderRadius:10,marginBottom:8}}><div><strong>{doc.document_type}</strong><div style={{fontSize:12,color:'#666',marginTop:5}}>{doc.verification_status}{doc.expiration_date ? ` · expires ${doc.expiration_date}` : ''}</div></div><div>{doc.verification_status==='VERIFIED' ? <button disabled={busy} onClick={()=>act('verify_document',{documentId:doc.id,decision:'REJECTED',notes:'Rejected during staff review.'})}>Reject</button> : <button disabled={busy} onClick={()=>act('verify_document',{documentId:doc.id,decision:'VERIFIED'})}>Verify</button>}</div></div>)}</section>

        <section style={{padding:18,borderRadius:12,background:'#f7f7f7'}}><h3 style={{marginTop:0}}>Activation rule</h3><p style={{marginBottom:0}}>Approval creates/activates the provider organization and provider identity, authorizes only the reviewed canonical services, activates an initial capacity profile, and records DANI DECLARES commercial authority. It does <strong>not</strong> give the provider customer-pricing or marketing authority.</p><button disabled={busy || selected.application_status==='APPROVED' || !(selected.tax_form_status==='VERIFIED'||selected.tax_form_status==='NOT_REQUIRED') || !(selected.insurance_status==='VERIFIED'||selected.insurance_status==='NOT_REQUIRED') || selected.identity_status!=='VERIFIED' || selected.agreement_status!=='EXECUTED' || !['CLEARED','NOT_REQUIRED'].includes(selected.background_check_status) || selected.compliance_status!=='VERIFIED' || !(selected.capabilities||[]).length || !(selected.capabilities||[]).every(c=>c.authorization_status==='AUTHORIZED'&&c.evidence_status==='VERIFIED'&&['VERIFIED','NOT_REQUIRED'].includes(c.requirement_status)) || !(selected.documents||[]).every(d=>!['PENDING','REJECTED','EXPIRED'].includes(d.verification_status))} onClick={()=>act('approve_and_activate')} style={{marginTop:14,padding:'12px 18px',fontWeight:800}}>Approve & Activate Provider</button></section>
      </article> : <div style={{padding:24,border:'1px solid #e4e4e4',borderRadius:14}}>No application selected.</div>}
    </section>
  </main>;
}

export default function ProviderApprovalPage() { return <RequireStaffAuth><ProviderApproval /></RequireStaffAuth>; }
