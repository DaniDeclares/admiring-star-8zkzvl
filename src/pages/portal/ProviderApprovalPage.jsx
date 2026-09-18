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
  const [requirementsBySku, setRequirementsBySku] = useState(new Map());
  const [requirementDefs, setRequirementDefs] = useState(new Map());
  const [editingContact, setEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({});


  const load = async () => {
    setLoading(true); setError('');
    const { data: auth } = await supabase.auth.getSession();
    if (!auth.session) { setError('Staff session required.'); setLoading(false); return; }
    const { data: body, error: invokeError } = await supabase.functions.invoke('provider-application-review', { body: { action: 'list' } });
    if (invokeError || !body?.success) setError(body?.error || invokeError?.message || 'Provider applications could not be loaded.');
    else { setApplications(body.applications || []); if (!selectedId && body.applications?.[0]) setSelectedId(body.applications[0].id); }
    // Requirement tables are descriptive reference data, not read by the approval
    // gate itself -- surfacing them here is what makes them an actual hint to
    // staff instead of inert rows nobody ever sees.
    const [{ data: perSku }, { data: defs }] = await Promise.all([
      supabase.from('dd_service_capability_requirements').select('canonical_sku, requirement_code, required'),
      supabase.from('dd_provider_capability_requirements').select('requirement_code, requirement_name'),
    ]);
    const bySku = new Map();
    (perSku || []).forEach(r => { if (!bySku.has(r.canonical_sku)) bySku.set(r.canonical_sku, []); bySku.get(r.canonical_sku).push(r); });
    setRequirementsBySku(bySku);
    setRequirementDefs(new Map((defs || []).map(d => [d.requirement_code, d.requirement_name])));
    setLoading(false);
  };

  // load is intentionally a stable local loader; it is also reused after every staff action.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const selected = useMemo(() => applications.find(a => a.id === selectedId) || applications[0] || null, [applications, selectedId]);

  const beginContactEdit = () => {
    if (!selected) return;
    setContactForm({
      legal_name: selected.legal_name || '',
      contact_first_name: selected.contact_first_name || '',
      contact_last_name: selected.contact_last_name || '',
      contact_email: selected.contact_email || '',
      contact_phone: selected.contact_phone || '',
      physical_address: selected.physical_address || '',
      service_area: selected.service_area || '',
    });
    setEditingContact(true); setError(''); setMessage('');
  };

  const saveContactEdit = async () => {
    if (!selected) return;
    setBusy(true); setError(''); setMessage('');
    const { data: auth } = await supabase.auth.getSession();
    if (!auth.session) { setBusy(false); setError('Staff session required.'); return; }
    const { data: body, error: invokeError } = await supabase.functions.invoke('provider-application-review', { body: { action: 'update_application_contact', applicationId: selected.id, ...contactForm } });
    if (invokeError || !body?.success) {
      setError(body?.error || invokeError?.message || 'Provider contact details could not be updated.');
      setBusy(false); return;
    }
    setEditingContact(false);
    setMessage('Provider application contact details updated.');
    await load();
    setBusy(false);
  };

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

  // A category picked at sign-up (e.g. Notary & Document Services) can expand to
  // 20 individual capability rows -- clicking "Authorize" 20 times for one real
  // credential is exactly the one-at-a-time tedium the category picker was built
  // to get away from. This authorizes every currently-pending capability on the
  // application in one pass, using the same verify_capability action staff would
  // otherwise click per row -- for a genuinely mixed application (say, half
  // authorized already, half still missing a document), staff should still
  // authorize the ready ones individually and leave the rest, but for the common
  // "one credential covers a whole category" case this replaces 20 clicks with 1.
  const bulkAuthorizePending = async () => {
    if (!selected) return;
    const pending = (selected.capabilities || []).filter(c => c.authorization_status !== 'AUTHORIZED');
    if (!pending.length) return;
    setBusy(true); setError(''); setMessage('');
    const { data: auth } = await supabase.auth.getSession();
    if (!auth.session) { setBusy(false); setError('Staff session required.'); return; }
    let failures = 0;
    for (const cap of pending) {
      const { data: body, error: invokeError } = await supabase.functions.invoke('provider-application-review', { body: { action: 'verify_capability', applicationId: selected.id, capabilityId: cap.id, decision: 'AUTHORIZED' } });
      if (invokeError || !body?.success) failures += 1;
    }
    setMessage(failures ? `Authorized ${pending.length - failures} of ${pending.length} capabilities (${failures} failed).` : `Authorized all ${pending.length} pending capabilities.`);
    if (failures) setError('Some capabilities could not be authorized -- check them individually below.');
    await load();
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

        <section style={{marginBottom:28,padding:18,borderRadius:12,border:'1px solid #eee'}}>
          <h3 style={{marginTop:0}}>Background check</h3>
          <p style={{color:'#666',marginTop:0}}>Current: <strong>{selected.background_check_status}</strong></p>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            <button disabled={busy} onClick={()=>act('set_background_check_status',{status:'CLEARED'})}>Mark cleared</button>
            <button disabled={busy} onClick={()=>act('set_background_check_status',{status:'NOT_REQUIRED'})}>Not required for these services</button>
            <button disabled={busy} onClick={()=>act('set_background_check_status',{status:'FAILED',notes:'Background check did not clear.'})}>Mark failed</button>
          </div>
        </section>

        <section style={{marginBottom:28,padding:18,borderRadius:12,border:'1px solid #eee'}}>
          <h3 style={{marginTop:0}}>Compliance sign-off</h3>
          <p style={{color:'#666',marginTop:0}}>Current: <strong>{selected.compliance_status}</strong>. Check the "Suggested requirement" hints on each selected service below, then confirm the provider has sent in everything legally required for those services, or that nothing extra is needed.</p>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            <button disabled={busy} onClick={()=>act('set_compliance_status',{decision:'VERIFIED'})}>Verified — compliant for selected services</button>
            <button disabled={busy} onClick={()=>{const notes=window.prompt('What is missing or non-compliant? (required)'); if(notes&&notes.trim())act('set_compliance_status',{decision:'REJECTED',notes:notes.trim()});}}>Not compliant — needs something</button>
          </div>
        </section>

        <section style={{marginBottom:28}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
            <h3 style={{margin:0}}>Application details</h3>
            {!editingContact && <button disabled={busy} onClick={beginContactEdit}>Edit contact & address</button>}
          </div>
          {editingContact ? <div style={{marginTop:14,padding:16,border:'1px solid #e4e4e4',borderRadius:12,display:'grid',gap:12}}>
            <p style={{margin:'0 0 4px',color:'#666',fontSize:13}}>Staff correction only. Changes are recorded in the application event history. This does not alter provider authorization, pricing, or approval gates.</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10}}>
              {[
                ['legal_name','Legal name'],['contact_first_name','First name'],['contact_last_name','Last name'],
                ['contact_email','Email'],['contact_phone','Phone'],['physical_address','Address'],
                ['service_area','Service area'],
              ].map(([key,label])=><label key={key} style={{display:'grid',gap:5,fontWeight:700}}>{label}<input value={contactForm[key] || ''} onChange={e=>setContactForm(f=>({...f,[key]:e.target.value}))}/></label>)}
            </div>
            <div style={{display:'flex',gap:10}}>
              <button disabled={busy} onClick={saveContactEdit}>Save correction</button>
              <button disabled={busy} onClick={()=>setEditingContact(false)}>Cancel</button>
            </div>
          </div> : <div style={{marginTop:14,display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10,color:'#444'}}>
            <div><strong>Legal name:</strong> {selected.legal_name || '—'}</div>
            <div><strong>Type:</strong> {selected.applicant_type}</div>
            <div><strong>First name:</strong> {selected.contact_first_name || '—'}</div>
            <div><strong>Last name:</strong> {selected.contact_last_name || '—'}</div>
            <div><strong>Email:</strong> {selected.contact_email || '—'}</div>
            <div><strong>Phone:</strong> {selected.contact_phone || '—'}</div>
            <div><strong>Address:</strong> {selected.physical_address || '—'}</div>
            <div><strong>Service area:</strong> {selected.service_area || '—'}</div>
            <div><strong>Website:</strong> {selected.website || '—'}</div>
            <div><strong>Experience:</strong> {selected.years_experience || '—'}</div>
            <div><strong>Availability:</strong> {selected.availability || '—'}</div>
          </div>}
          <p style={{whiteSpace:'pre-wrap'}}><strong>Service notes:</strong><br/>{selected.service_notes || '—'}</p>
        </section><div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10,color:'#444'}}><div><strong>Type:</strong> {selected.applicant_type}</div><div><strong>Phone:</strong> {selected.contact_phone || '—'}</div><div><strong>Service area:</strong> {selected.service_area || '—'}</div><div><strong>Website:</strong> {selected.website || '—'}</div><div><strong>Experience:</strong> {selected.years_experience || '—'}</div><div><strong>Availability:</strong> {selected.availability || '—'}</div></div><p style={{whiteSpace:'pre-wrap'}}><strong>Service notes:</strong><br/>{selected.service_notes || '—'}</p></section>

        <section style={{marginBottom:28}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}><h3 style={{margin:0}}>Canonical service capabilities</h3>{(selected.capabilities||[]).some(c=>c.authorization_status!=='AUTHORIZED') && <button disabled={busy} onClick={bulkAuthorizePending}>Authorize all pending ({(selected.capabilities||[]).filter(c=>c.authorization_status!=='AUTHORIZED').length})</button>}</div>{!(selected.capabilities||[]).length && <p>No canonical services selected.</p>}{(selected.capabilities||[]).map(cap=>{const reqs=requirementsBySku.get(cap.canonical_sku)||[];return <div key={cap.id} style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'center',padding:14,border:'1px solid #eee',borderRadius:10,marginBottom:8}}><div><strong>{cap.canonical_sku || 'Unmapped'} · {cap.capability_description || cap.capability_key}</strong><div style={{fontSize:12,color:'#666',marginTop:5}}>Authorization: {cap.authorization_status} · Evidence: {cap.evidence_status} · Requirement: {cap.requirement_status}</div>{reqs.length>0 && <div style={{fontSize:12,color:'#8a4b00',marginTop:5}}>Suggested requirement{reqs.length>1?'s':''}: {reqs.map(r=>requirementDefs.get(r.requirement_code)||r.requirement_code).join(', ')}</div>}</div><div>{cap.authorization_status!=='AUTHORIZED' ? <button disabled={busy} onClick={()=>act('verify_capability',{capabilityId:cap.id,decision:'AUTHORIZED'})}>Authorize</button> : <button disabled={busy} onClick={()=>act('verify_capability',{capabilityId:cap.id,decision:'REJECTED'})}>Revoke</button>}</div></div>;})}</section>

        <section style={{marginBottom:28}}><h3>Application documents</h3>{!(selected.documents||[]).length && <p>No application documents submitted.</p>}{(selected.documents||[]).map(doc=><div key={doc.id} style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'center',padding:14,border:doc.document_type==='PRICING_SHEET'?'1px solid #d9a441':'1px solid #eee',borderRadius:10,marginBottom:8,background:doc.document_type==='PRICING_SHEET'?'#fffaf0':undefined}}><div><strong>{doc.document_type}{doc.document_number ? ` — ${doc.document_number}` : ''}</strong>{doc.document_type==='PRICING_SHEET' && <div style={{fontSize:12,color:'#8a4b00',marginTop:5}}>Review for possible new/updated services — this is a catalog input, not a compliance document. Add anything real and priced to the canonical catalog the same way other pricing sheets have been reconciled.</div>}<div style={{fontSize:12,color:'#666',marginTop:5}}>{doc.verification_status}{doc.issuing_authority ? ` · issued by ${doc.issuing_authority}` : ''}{doc.expiration_date ? ` · expires ${doc.expiration_date}` : ''}</div>{doc.signed_url ? <a href={doc.signed_url} target="_blank" rel="noreferrer" style={{fontSize:12,fontWeight:700}}>View uploaded file →</a> : <span style={{fontSize:12,color:'#a00'}}>No file on record</span>}</div><div>{doc.verification_status==='VERIFIED' ? <button disabled={busy} onClick={()=>act('verify_document',{documentId:doc.id,decision:'REJECTED',notes:'Rejected during staff review.'})}>Reject</button> : <button disabled={busy} onClick={()=>act('verify_document',{documentId:doc.id,decision:'VERIFIED'})}>{doc.document_type==='PRICING_SHEET'?'Mark reviewed':'Verify'}</button>}</div></div>)}</section>

        <section style={{padding:18,borderRadius:12,background:'#f7f7f7'}}><h3 style={{marginTop:0}}>Activation rule</h3><p style={{marginBottom:0}}>Approval creates/activates the provider organization and provider identity, authorizes only the reviewed canonical services, activates an initial capacity profile, and records DANI DECLARES commercial authority. It does <strong>not</strong> give the provider customer-pricing or marketing authority.</p><button disabled={busy || selected.application_status==='APPROVED' || !(selected.tax_form_status==='VERIFIED'||selected.tax_form_status==='NOT_REQUIRED') || !(selected.insurance_status==='VERIFIED'||selected.insurance_status==='NOT_REQUIRED') || selected.identity_status!=='VERIFIED' || selected.agreement_status!=='EXECUTED' || !['CLEARED','NOT_REQUIRED'].includes(selected.background_check_status) || selected.compliance_status!=='VERIFIED' || !(selected.capabilities||[]).length || !(selected.capabilities||[]).every(c=>c.authorization_status==='AUTHORIZED'&&c.evidence_status==='VERIFIED'&&['VERIFIED','NOT_REQUIRED'].includes(c.requirement_status)) || !(selected.documents||[]).every(d=>!['PENDING','REJECTED','EXPIRED'].includes(d.verification_status))} onClick={()=>act('approve_and_activate')} style={{marginTop:14,padding:'12px 18px',fontWeight:800}}>Approve & Activate Provider</button></section>
      </article> : <div style={{padding:24,border:'1px solid #e4e4e4',borderRadius:14}}>No application selected.</div>}
    </section>
  </main>;
}

export default function ProviderApprovalPage() { return <RequireStaffAuth><ProviderApproval /></RequireStaffAuth>; }
