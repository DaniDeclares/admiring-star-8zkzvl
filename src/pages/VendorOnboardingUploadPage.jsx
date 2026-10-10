import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';
import ProviderNav from './portal/ProviderNav.jsx';
import './portal/PortalWorkspacePage.css';
import { captureServiceLifecycle } from '../lib/posthogAnalytics.js';

const ACCEPT = '.pdf,.doc,.docx,.png,.jpg,.jpeg';
const MAX = 10 * 1024 * 1024;
const PROVIDER_DOCS = [
  { key: 'W9', label: 'W-9 / tax document', help: 'Used to document tax-form receipt.' },
  { key: 'GOVERNMENT_ID', label: 'Government-issued ID', help: 'Upload the identity document requested for qualification.', hasNumber: true },
  { key: 'COI', label: 'Certificate of Insurance (COI)', help: 'Upload your current certificate of insurance.', hasNumber: true },
  { key: 'AUTO_INSURANCE', label: 'Auto insurance', help: 'Required when the capability/work requires vehicle coverage.', hasNumber: true },
  { key: 'AGREEMENT', label: 'Additional signed agreement (optional)', help: 'Your Provider Agreement is signed electronically in the portal, not uploaded here. Only use this if DANI DECLARES asked for an additional, separately negotiated written agreement.' },
  { key: 'BUSINESS_REGISTRATION', label: 'Business registration', help: 'Optional supporting business document.', hasNumber: true },
  { key: 'PROFESSIONAL_LICENSE', label: 'Professional license', help: 'Upload only if applicable to your claimed capability.', hasNumber: true },
  { key: 'CERTIFICATION', label: 'Certification', help: 'Upload supporting certification evidence when applicable.', hasNumber: true },
  { key: 'MOTOR_CARRIER_AUTHORITY', label: 'Motor carrier / DOT authority', help: 'Upload your DOT/MC operating authority documentation if your capability involves commercial vehicle transport.', hasNumber: true },
  { key: 'BACKGROUND_CONSENT', label: 'Background-check consent', help: 'Upload the requested signed consent form when applicable.' },
  { key: 'PORTFOLIO', label: 'Portfolio', help: 'Supporting work examples.' },
  { key: 'PROVIDER_PRICE_SHEET', label: 'Your price sheet (optional for individuals; required for business providers)', help: 'Upload the prices/rates your business charges for the services you want DANI DECLARES to consider. DANI DECLARES retains customer pricing authority; this is provider commercial input, not customer-facing pricing.' },
  { key: 'WORK_SAMPLE', label: 'Work sample', help: 'Supporting evidence of capability.' },
  { key: 'PRICING_SHEET', label: 'Your pricing sheet or rate card', help: 'Upload your own price list or rate card if you have one — DANI DECLARES staff will review it when deciding what to offer and at what price, rather than asking you to re-key it by phone.' },
  { key: 'OTHER', label: 'Other supporting document', help: 'Use for evidence that does not fit another category.' },
];

const COMPANY_ACCEPT = '.pdf,.doc,.docx,.png,.jpg,.jpeg';

export default function VendorOnboardingUploadPage() {
  const [providerMode, setProviderMode] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [application, setApplication] = useState(null);
  const [applicantType, setApplicantType] = useState(null);
  const [capabilities, setCapabilities] = useState([]);
  const [selectedCapabilities, setSelectedCapabilities] = useState({});
  const [providerFiles, setProviderFiles] = useState({});
  const [activeDocType, setActiveDocType] = useState('');
  const [documentNumbers, setDocumentNumbers] = useState({});
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
        if (!cancelled) setUserEmail(user.email || '');
        const { data: identity } = await supabase
          .from('dd_portal_identities')
          .select('portal_role')
          .eq('auth_user_id', user.id)
          .maybeSingle();
        if (identity?.portal_role !== 'provider') return;
        const { data: apps, error: appError } = await supabase
          .from('dd_provider_applications')
          .select('id,application_status,applicant_type,legal_name,tax_form_status,insurance_status,identity_status,agreement_status,compliance_status')
          .eq('applicant_user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        if (appError) throw appError;
        if (!cancelled) {
          setProviderMode(true);
          const currentApplication = apps?.[0] || null;
          setApplication(currentApplication);
          setApplicantType(currentApplication?.applicant_type || null);
          if (currentApplication?.id) {
            const { data: capabilityRows, error: capabilityError } = await supabase
              .from('dd_provider_application_capabilities')
              .select('id, canonical_sku, capability_description, capability_key, authorization_status, evidence_status, requirement_status')
              .eq('application_id', currentApplication.id)
              .order('canonical_sku');
            if (capabilityError) throw capabilityError;
            if (!cancelled) setCapabilities(capabilityRows || []);
          }
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

  const signOut = async () => { await supabase.auth.signOut(); window.location.href = '/portal/login'; };

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
      if (applicantType === 'BUSINESS' && !providerFiles.PROVIDER_PRICE_SHEET) throw new Error('Business providers must upload their own price sheet before submitting provider documents.');

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
          p_document_number: documentNumbers[documentType]?.trim() || null,
          p_capability_id: selectedCapabilities[documentType] || null,
        });
        if (recordError) throw recordError;
        captureServiceLifecycle('provider_document_uploaded',{capability_key:selectedCapabilities[documentType] ? 'linked_capability' : undefined,route:'/portal/vendor-onboarding'});
      }

      setProviderFiles({});
      setDocumentNumbers({});
      setSelectedCapabilities({});
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

  const extraDocs = PROVIDER_DOCS.filter(doc => !['PROVIDER_PRICE_SHEET', 'W9'].includes(doc.key));
  const priceSheetDoc = PROVIDER_DOCS.find(doc => doc.key === 'PROVIDER_PRICE_SHEET');
  const selectedCount = Object.values(providerFiles).filter(Boolean).length;
  const renderProviderDoc = doc => <div className="provider-document-upload" key={doc.key}>
    <label htmlFor={`provider-document-${doc.key}`}><strong>{doc.label}</strong><span>{doc.help}</span></label>
    <input id={`provider-document-${doc.key}`} type="file" accept={ACCEPT} onChange={e => setProviderFile(doc.key, e.target.files?.[0] || null)} />
    {providerFiles[doc.key] && <p className="provider-file-confirmation">Selected: {providerFiles[doc.key].name}</p>}
    {providerFiles[doc.key] && capabilities.length > 0 && <label className="provider-document-detail">Service this document supports (optional)
      <select value={selectedCapabilities[doc.key] || ''} onChange={e => setSelectedCapabilities(prev => ({...prev,[doc.key]:e.target.value || null}))}>
        <option value="">General application document</option>
        {capabilities.map(cap => <option key={cap.id} value={cap.id}>{cap.canonical_sku} — {cap.capability_description}</option>)}
      </select>
    </label>}
    {providerFiles[doc.key] && doc.hasNumber && <label className="provider-document-detail">Reference number (optional)
      <input type="text" value={documentNumbers[doc.key] || ''} onChange={e => setDocumentNumbers(prev => ({...prev,[doc.key]:e.target.value}))} />
    </label>}
  </div>;

  if (loading) return <main className="portal-shell"><p>Loading onboarding…</p></main>;

  if (providerMode) {
    return <main className="portal-shell provider-documents-shell">
      <header className="portal-hero"><div><p className="portal-eyebrow">DANI DECLARES PROVIDER</p><h1>Documents & verification</h1><p>Send the documents your application needs. Each submission is private and must be reviewed before any service can be authorized.</p></div>
        {userEmail && <p className="portal-account-badge">Signed in as <strong>{userEmail}</strong><button type="button" onClick={signOut}>Sign out</button></p>}
      </header>
      <ProviderNav isApprovedProvider={application?.application_status === 'APPROVED'} agreementSigned={application?.agreement_status === 'EXECUTED'} />
      {application && <section className="provider-document-overview">
        <div><small>APPLICATION</small><strong>{application.legal_name || 'Provider application'}</strong><span>{application.application_status}</span></div>
        <div><small>ELECTRONIC W-9</small><strong>{application.tax_form_status === 'RECEIVED' || application.tax_form_status === 'VERIFIED' ? 'On file' : 'Needs attention'}</strong><span>{application.tax_form_status}</span></div>
        <div><small>IDENTITY</small><strong>{application.identity_status === 'VERIFIED' ? 'Verified' : 'Pending review'}</strong><span>{application.identity_status}</span></div>
        <div><small>BUSINESS RATE CARD</small><strong>{applicantType === 'BUSINESS' ? 'Required for business providers' : 'Optional'}</strong><span>For commercial review</span></div>
      </section>}
      {application?.agreement_status !== 'EXECUTED' ? <section className="portal-card">
        <h2>First, review your Provider Agreement</h2><p>Your agreement must be on file before submitting documents.</p>
        <Link className="portal-primary" to="/portal/provider-agreement">Open agreement →</Link>
      </section> : <form className="provider-documents-form" onSubmit={submitProvider}>
        <section className="portal-card">
          <p className="portal-eyebrow">STEP 1 · REQUIRED DOCUMENTS</p>
          <h2>Complete the essentials</h2>
          <p className="portal-note">Only upload documents that match their type. A marketing PDF cannot replace an ID, insurance certificate, or tax form.</p>
          {applicantType === 'BUSINESS' && renderProviderDoc(priceSheetDoc)}
          {applicantType !== 'BUSINESS' && <p className="portal-note">An individual provider may submit supporting documents without a business rate card.</p>}
          {application?.tax_form_status === 'RECEIVED' || application?.tax_form_status === 'VERIFIED'
            ? <div className="provider-document-done"><strong>Electronic W-9 received</strong><span>Your W-9 is already on file. You do not need to upload a duplicate here.</span></div>
            : <div className="provider-document-done"><strong>Electronic W-9 available</strong><span>Use the secure <Link to="/portal/w9">W-9 form</Link> rather than sending your tax number in an ordinary document.</span></div>}
          <p className="provider-document-footnote">Identity and insurance evidence will be reviewed according to the services you request. Choose the appropriate document type below when DANI requests it.</p>
        </section>
        <section className="portal-card">
          <p className="portal-eyebrow">STEP 2 · SUPPORTING EVIDENCE</p>
          <h2>Add a document if needed</h2>
          <p className="portal-note">Instead of filling out every document field, select the type of evidence you want to upload. You can add more than one type before submitting.</p>
          <label className="provider-search-label" htmlFor="provider-document-type">Document category</label>
          <select id="provider-document-type" value={activeDocType} onChange={e => setActiveDocType(e.target.value)}>
            <option value="">Choose the document you are uploading…</option>
            {extraDocs.map(doc => <option key={doc.key} value={doc.key}>{doc.label}</option>)}
            {applicantType !== 'BUSINESS' && <option value="PROVIDER_PRICE_SHEET">My optional rate card</option>}
          </select>
          {activeDocType && renderProviderDoc(PROVIDER_DOCS.find(doc => doc.key === activeDocType))}
          {selectedCount > 0 && <div className="provider-upload-queue"><strong>{selectedCount} document type{selectedCount === 1 ? '' : 's'} selected</strong>
            <ul>{Object.entries(providerFiles).filter(([,file]) => Boolean(file)).map(([type,file]) => <li key={type}>{PROVIDER_DOCS.find(doc => doc.key === type)?.label}: {file.name} <button type="button" onClick={() => setProviderFile(type,null)}>Remove</button></li>)}</ul>
          </div>}
          <details className="provider-optional-upload"><summary>Need to submit a paper W-9 instead?</summary><p>Use this only if DANI requested a document. The electronic W-9 above is preferred.</p>{renderProviderDoc(PROVIDER_DOCS.find(doc => doc.key === 'W9'))}</details>
        </section>
        {error && <div className="portal-alert" role="alert">{error}</div>}
        {message && <div className="portal-success" role="status">{message}</div>}
        <button type="submit" className="portal-primary provider-submit-documents" disabled={busy || selectedCount === 0}>{busy ? 'Submitting…' : `Submit ${selectedCount} document type${selectedCount === 1 ? '' : 's'} for review`}</button>
        <p className="portal-note">Uploading is not verification, provider approval, or permission to accept work. Never upload passwords or banking credentials.</p>
      </form>}
      <p className="provider-documents-back"><Link to="/portal">← Back to onboarding overview</Link></p>
    </main>;
  }

  return <main style={{maxWidth:820,margin:'0 auto',padding:'64px 24px'}}>
    <p style={{letterSpacing:'.12em',fontSize:12,fontWeight:700}}>VENDOR ONBOARDING</p>
    <h1>Send us your company’s vendor packet.</h1>
    <p style={{fontSize:18,lineHeight:1.6}}>If your apartment company, property manager, brokerage, or organization gave you a vendor application, supplier agreement, COI requirements, W-9/ACH instructions, supplier-portal instructions, or an extra company-specific page, upload it here. DANI DECLARES will work from your actual requirements instead of making you explain them by phone.</p>
    {userEmail && <p className="portal-account-badge">Signed in as <strong>{userEmail}</strong><button type="button" onClick={signOut}>Sign out</button></p>}
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
