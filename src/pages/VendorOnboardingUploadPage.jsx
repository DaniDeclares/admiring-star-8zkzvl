import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';

const ACCEPT = '.pdf,.doc,.docx,.png,.jpg,.jpeg';
const MAX = 10 * 1024 * 1024;

export default function VendorOnboardingUploadPage() {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const addFiles = (e) => {
    const incoming = Array.from(e.target.files || []);
    setError('');
    const bad = incoming.find(f => f.size > MAX);
    if (bad) return setError(`${bad.name} is larger than 10 MB.`);
    setFiles(incoming);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(''); setMessage('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in before uploading company vendor paperwork.');
      if (!files.length) throw new Error('Choose at least one vendor document.');
      for (const file of files) {
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
      setFiles([]);
      setMessage('Your company vendor paperwork has been submitted to DANI DECLARES for onboarding review.');
    } catch (err) {
      setError(err?.message || 'The vendor paperwork could not be submitted.');
    } finally { setBusy(false); }
  };

  return <main style={{maxWidth:820,margin:'0 auto',padding:'64px 24px'}}>
    <p style={{letterSpacing:'.12em',fontSize:12,fontWeight:700}}>VENDOR ONBOARDING</p>
    <h1>Send us your company’s vendor packet.</h1>
    <p style={{fontSize:18,lineHeight:1.6}}>If your apartment company, property manager, brokerage, or organization gave you a vendor application, supplier agreement, COI requirements, W-9/ACH instructions, supplier-portal instructions, or an extra company-specific page, upload it here. DANI DECLARES will work from your actual requirements instead of making you explain them by phone.</p>
    <div style={{padding:20,border:'1px solid #ddd',borderRadius:12,margin:'24px 0'}}>
      <strong>Accepted:</strong> PDF, Word documents, JPG/PNG • <strong>10 MB maximum per file</strong>
      <p style={{marginBottom:0}}>Do not upload passwords, banking credentials, Social Security numbers, or other information that is not required for vendor onboarding.</p>
    </div>
    <form onSubmit={submit}>
      <label style={{display:'block',fontWeight:700}}>Company vendor paperwork
        <input style={{display:'block',marginTop:10}} type="file" multiple accept={ACCEPT} onChange={addFiles}/>
      </label>
      {files.length > 0 && <ul>{files.map(f=><li key={f.name}>{f.name}</li>)}</ul>}
      {error && <div role="alert" style={{padding:12,marginTop:16,border:'1px solid #b91c1c',borderRadius:8}}>{error}</div>}
      {message && <div role="status" style={{padding:12,marginTop:16,border:'1px solid #15803d',borderRadius:8}}>{message}</div>}
      <button type="submit" disabled={busy} style={{marginTop:20,padding:'12px 18px',fontWeight:700}}>{busy ? 'Submitting…' : 'Submit vendor paperwork'}</button>
    </form>
    <p style={{marginTop:32}}><Link to="/portal">Return to portal</Link> · <Link to="/portal/login">Sign in</Link></p>
  </main>;
}
