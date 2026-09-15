import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';

const ACCEPT = '.pdf,.doc,.docx,.png,.jpg,.jpeg';
const MAX = 10 * 1024 * 1024;
const PROVIDER_DOCS = [
  { key: 'W9', label: 'W-9 / tax document', help: 'Used to document tax-form receipt.' },
  { key: 'GOVERNMENT_ID', label: 'Government-issued ID', help: 'Upload the identity document requested for qualification.' },
  { key: 'COI', label: 'Certificate of Insurance (COI)', help: 'Upload your current certificate of insurance.' },
  { key: 'AUTO_INSURANCE', label: 'Auto insurance', help: 'Required when the capability/work requires vehicle coverage.' },
  { key: 'AGREEMENT', label: 'Master Provider Agreement', help: 'Upload the executed agreement, if already signed.' },
  { key: 'BUSINESS_REGISTRATION', label: 'Business registration', help: 'Optional supporting business document.' },
  { key: 'PROFESSIONAL_LICENSE', label: 'Professional license', help: 'Upload only if applicable to your claimed capability.' },
  { key: 'CERTIFICATION', label: 'Certification', help: 'Upload supporting certification evidence when applicable.' },
  { key: 'BACKGROUND_CONSENT', label: 'Background-check consent', help: 'Upload the requested signed consent form when applicable.' },
  { key: 'PORTFOLIO', label: 'Portfolio', help: 'Supporting work examples.' },
  { key: 'WORK_SAMPLE', label: 'Work sample', help: 'Supporting evidence of capability.' },
  { key: 'OTHER', label: 'Other supporting document', help: 'Use for evidence that does not fit another category.' },
];

const COMPANY_ACCEPT = '.pdf,.doc,.docx,.png,.jpg,.jpeg';

export default function VendorOnboardingUploadPage() {
  const [providerMode, setProviderMode] = useState(false);
  const [application, setApplication] = useState(null);
  const [providerFiles, setProviderFiles] = useState({});
  const [companyFiles, setCompanyFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: identity } = await supabase
          .from('dd_portal_identities')
          .select('portal_role')
          .eq('auth_user_id', user.id)
          .maybeSingle();
        if (identity?.portal_role !== 'provider') return;
        const { data: apps, error: appError } = await supabase
          .from('dd_provider_applications')
          .select('id,application_status,legal_name,tax_form_status,insurance_status,identity_status,agreement_status,compliance_status')
          .eq('applicant_user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        if (appError) throw appError;
        if (!cancelled) {
          setProviderMode(true);
          setApplication(apps?.[0] || null);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || 'We could not load your onboarding application.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const validateFile = (file) => {
    if (!file) return '';
    if (file.size > MAX) return `${file.name} is larger than 10 MB.`;
    return '';
  };

  const setProviderFile = (type, file) => {
    setError('');
    const validation = validateFile(file);
    if (validation) return setError(validation);
    setProviderFiles(prev => ({ ...prev, [type]: file || null }));
  };

  const submitProvider = async (e) => {
    e.preventDefault();
    setBusy(true); setError(''); setMessage('');
    try {
      if (!application?.id) throw new Error('No provider application is attached to this account yet. Please start provider onboarding first.');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in before uploading provider documents.');
      const selected = Object.entries(providerFiles).filter(([, file]) => file);
      if (!selected.length) throw new Error('Choose at least one provider document.');

      for (const [documentType, file] of selected) {
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `${user.id}/${application.id}/${Date.now()}-${crypto.randomUUID()}-${documentType}-${safe}`;
        const { error: uploadError } = await supabase.storage
          .from('dd-vendor-onboarding')
          .upload(path, file, { upsert: false, contentType: file.type || 'application/octet-stream' });
        if (uploadError) throw uploadError;

        const { error: recordError } = await supabase.rpc('dd_record_provider_application_document', {
          p_application_id: application.id,
          p_document_type: documentType,
          p_storage_path: path,
        });
        if (recordError) throw recordError;
      }

      setProviderFiles({});
      setMessage('Your provider documents were submitted. They remain pending verification; uploading documents does not authorize dispatch or work.');
      const { data: refreshed } = await supabase
        .from('dd_provider_applications')
        .select('id,application_status,legal_name,tax_form_status,insurance_status,identity_status,agreement_status,compliance_status')
        .eq('id', application.id)
        .maybeSingle();
      if (refreshed) setApplication(refreshed);
    } catch (err) {
      setError(err?.message || 'The provider documents could not be submitted.');
    } finally { setBusy(false); }
  };

  const addCompanyFiles = (e) => {
    const incoming = Array.from(e.target.files || []);
    setError('');
    const bad = incoming.find(f => f.size > MAX);
    if (bad) return setError(`${bad.name} is larger than 10 MB.`);
    setCompanyFiles(incoming);
  };

  const submitCompany = async (e) => {
    e.preventDefault();
    setBusy(true); setError(''); setMessage('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in before uploading company vendor paperwork.');
      if (!companyFiles.length) throw new Error('Choose at least one vendor document.');
      for (const file of companyFiles) {
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}-${safe}`;
        const { error: uploadError } = await supabase.storage.from('dd-vendor-onboarding').upload(path, file, { upsert: false, contentType: file.type || 'application/octet-stream' });
        if (uploadError) throw uploadError;
        const { error: rowError } = await supabase.from('dd_vendor_onboarding_documents').insert({
          auth_user_id: user.id,
          document_type: 'COMPANY_VENDOR_PACKET',
          original_filename: file.name,
          storage_path: path,
          mime_type: file.type || null,
          file_size_bytes: file.size,
          status: 'SUBMITTED'
        });
        if (rowError) throw rowError;
      }
      setCompanyFiles([]);
      setMessage('Your company vendor paperwork has been submitted to DANI DECLARES for onboarding review.');
    } catch (err) {
      setError(err?.message || 'The vendor paperwork could not be submitted.');
    } finally { setBusy(false); }
  };

  if (loading) return <main style={{maxWidth:820,margin:'0 auto',padding:'64px 24px'}}><p>Loading onboarding…</p></main>;

  if (providerMode) {
    return <main style={{maxWidth:900,margin:'0 auto',padding:'64px 24px'}}>
      <p style={{letterSpacing:'.12em',fontSize:12,fontWeight:700}}>DANI DECLARES PROVIDER</p>
      <h1>Complete your provider onboarding.</h1>
      <p style={{fontSize:18,lineHeight:1.6}}>Upload the evidence requested for your provider application. DANI DECLARES reviews these documents before any qualification or authorization decision.</p>
      {application && <div style={{padding:20,border:'1px solid #ddd',borderRadius:12,margin:'24px 0'}}>
        <strong>{application.legal_name || 'Provider application'}</strong>
        <p style={{margin:'8px 0 0'}}>Application status: <strong>{application.application_status}</strong></p>
        <p style={{margin:'8px 0 0'}}>Compliance: <strong>{application.compliance_status}</strong></p>
        <p style={{margin:'8px 0 0'}}>Document statuses — W-9: {application.tax_form_status} · Insurance: {application.insurance_status} · ID: {application.identity_status} · Agreement: {application.agreement_status}</p>
      </div>}
      <form onSubmit={submitProvider}>
        <div style={{display:'grid',gap:16}}>
          {PROVIDER_DOCS.map(doc => <label key={doc.key} style={{display:'grid',gap:6,padding:16,border:'1px solid #ddd',borderRadius:10}}>
            <strong>{doc.label}</strong><span style={{fontSize:14}}>{doc.help}</span>
            <input type="file" accept={ACCEPT} onChange={e=>setProviderFile(doc.key,e.target.files?.[0] || null)} />
            {providerFiles[doc.key] && <span style={{fontSize:14}}>Selected: {providerFiles[doc.key].name}</span>}
          </label>)}
        </div>
        {error && <div role="alert" style={{padding:12,marginTop:16,border:'1px solid #b91c1c',borderRadius:8}}>{error}</div>}
        {message && <div role="status" style={{padding:12,marginTop:16,border:'1px solid #15803d',borderRadius:8}}>{message}</div>}
        <button type="submit" disabled={busy} style={{marginTop:20,padding:'12px 18px',fontWeight:700}}>{busy ? 'Submitting…' : 'Submit provider documents'}</button>
      </form>
      <div style={{padding:20,border:'1px solid #ddd',borderRadius:12,marginTop:24}}>
        <strong>Important</strong>
        <p style={{marginBottom:0}}>Document receipt is not approval. Provider qualification, verification, authorization, and dispatch eligibility remain separate decisions. Do not upload passwords, banking credentials, or unnecessary sensitive information.</p>
      </div>
      <p style={{marginTop:32}}><Link to="/portal">Return to portal</Link> · <Link to="/portal/login">Sign in</Link></p>
    </main>;
  }

  return <main style={{maxWidth:820,margin:'0 auto',padding:'64px 24px'}}>
    <p style={{letterSpacing:'.12em',fontSize:12,fontWeight:700}}>VENDOR ONBOARDING</p>
    <h1>Send us your company’s vendor packet.</h1>
    <p style={{fontSize:18,lineHeight:1.6}}>If your apartment company, property manager, brokerage, or organization gave you a vendor application, supplier agreement, COI requirements, W-9/ACH instructions, supplier-portal instructions, or an extra company-specific page, upload it here. DANI DECLARES will work from your actual requirements instead of making you explain them by phone.</p>
    <div style={{padding:20,border:'1px solid #ddd',borderRadius:12,margin:'24px 0'}}>
      <strong>Accepted:</strong> PDF, Word documents, JPG/PNG • <strong>10 MB maximum per file</strong>
      <p style={{marginBottom:0}}>Do not upload passwords, banking credentials, Social Security numbers, or other information that is not required for vendor onboarding.</p>
    </div>
    <form onSubmit={submitCompany}>
      <label style={{display:'block',fontWeight:700}}>Company vendor paperwork
        <input style={{display:'block',marginTop:10}} type="file" multiple accept={COMPANY_ACCEPT} onChange={addCompanyFiles}/>
      </label>
      {companyFiles.length > 0 && <ul>{companyFiles.map(f=><li key={f.name}>{f.name}</li>)}</ul>}
      {error && <div role="alert" style={{padding:12,marginTop:16,border:'1px solid #b91c1c',borderRadius:8}}>{error}</div>}
      {message && <div role="status" style={{padding:12,marginTop:16,border:'1px solid #15803d',borderRadius:8}}>{message}</div>}
      <button type="submit" disabled={busy} style={{marginTop:20,padding:'12px 18px',fontWeight:700}}>{busy ? 'Submitting…' : 'Submit vendor paperwork'}</button>
    </form>
    <p style={{marginTop:32}}><Link to="/portal">Return to portal</Link> · <Link to="/portal/login">Sign in</Link></p>
  </main>;
}
