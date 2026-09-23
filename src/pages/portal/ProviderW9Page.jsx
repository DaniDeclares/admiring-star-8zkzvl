import React, { useState } from 'react';
import ProviderNav from './ProviderNav.jsx';
import { Card, statusLabel, formatDate, useProviderWorkspace, AccountBadge } from './providerWorkspaceShared.jsx';
import './PortalWorkspacePage.css';

// Electronic W-9 collection, built to the IRS's own spec (Instructions for the
// Requester of Form W-9, Rev. March 2024, "Electronic Submission of Forms
// W-9") rather than a generic contact form. Field layout mirrors the official
// form's line numbers so the mapping stays checkable against the real form.
const W9_CERTIFICATION_TEXT = `Under penalties of perjury, I certify that:
1. The number shown on this form is my correct taxpayer identification number (or I am waiting for a number to be issued to me); and
2. I am not subject to backup withholding because (a) I am exempt from backup withholding, or (b) I have not been notified by the Internal Revenue Service (IRS) that I am subject to backup withholding as a result of a failure to report all interest or dividends, or (c) the IRS has notified me that I am no longer subject to backup withholding; and
3. I am a U.S. citizen or other U.S. person (defined below); and
4. The FATCA code(s) entered on this form (if any) indicating that I am exempt from FATCA reporting is correct.`;

const CLASSIFICATIONS = [
  ['INDIVIDUAL_SOLE_PROP', 'Individual/sole proprietor'],
  ['C_CORPORATION', 'C corporation'],
  ['S_CORPORATION', 'S corporation'],
  ['PARTNERSHIP', 'Partnership'],
  ['TRUST_ESTATE', 'Trust/estate'],
  ['LLC', 'Limited liability company'],
  ['OTHER', 'Other'],
];

function formatTin(type, digits) {
  if (type === 'SSN') return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 9)}`;
}

export default function ProviderW9Page() {
  const { session, snapshot, loading, error, message, load, act } = useProviderWorkspace();
  const [form, setForm] = useState({
    line1Name: '', line2BusinessName: '', classification: 'INDIVIDUAL_SOLE_PROP', llcTaxClassification: '',
    otherClassificationDescription: '', hasForeignPartners: false, exemptPayeeCode: '', fatcaExemptionCode: '',
    address: '', city: '', stateCode: '', zipCode: '', tinType: 'SSN', tin: '', signatureFullName: '', certificationAgreed: false,
  });
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState('');

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setLocalError('');
    const digits = form.tin.replace(/[^0-9]/g, '');
    if (digits.length !== 9) return setLocalError(`Enter a valid 9-digit ${form.tinType}.`);
    if (!form.certificationAgreed) return setLocalError('You must agree to the certification above to submit.');
    setBusy(true);
    await act('submit_provider_w9', { ...form, tin: digits });
    setBusy(false);
  };

  if (loading) return <main className="portal-shell"><p>Loading your DANI DECLARES workspace…</p></main>;
  if (error && !snapshot) return <main className="portal-shell"><div className="portal-alert">{error}</div></main>;
  if (snapshot?.role !== 'provider') return <main className="portal-shell"><div className="portal-alert">This page is only available to provider accounts.</div></main>;

  const application = snapshot.application || null;
  const isApprovedProvider = application?.application_status === 'APPROVED';
  const isSignedProvider = application?.agreement_status === 'EXECUTED';
  const w9 = snapshot.w9 || null;

  return <main className="portal-shell">
    <header className="portal-hero"><div><p className="portal-eyebrow">DANI DECLARES PROVIDER</p><h1>Tax Form (W-9)</h1><p>Complete your W-9 electronically — no need to already have your own PDF on file.</p></div><div className="portal-hero-actions"><AccountBadge session={session} /><button className="portal-refresh" onClick={load}>Refresh</button></div></header>
    <ProviderNav isApprovedProvider={isApprovedProvider} agreementSigned={isSignedProvider} />
    {(error || localError) && <div className="portal-alert" role="alert">{error || localError}</div>}
    {message && <div className="portal-success" role="status">{message}</div>}

    {w9 ? <Card title="W-9 on File">
      <div className="portal-row"><div><strong>{w9.tin_type} ending in {w9.tin_last_four}</strong><small>{statusLabel(w9.status)} · Submitted {formatDate(w9.created_at)}{w9.verified_at ? ` · Reviewed ${formatDate(w9.verified_at)}` : ''}</small></div></div>
      {w9.status === 'REJECTED' && <p className="portal-note" style={{ marginTop: 10 }}>DANI DECLARES could not verify this submission. Contact us, or submit a corrected W-9 below.</p>}
    </Card> : null}

    {(!w9 || w9.status === 'REJECTED') && <Card title="Submit Your W-9">
      <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'grid', gap: 10 }}>
          <label style={{ display: 'grid', gap: 5, fontWeight: 700 }}>Line 1 — Name (as shown on your tax return)
            <input required value={form.line1Name} onChange={e => update('line1Name', e.target.value)} />
          </label>
          <label style={{ display: 'grid', gap: 5, fontWeight: 700 }}>Line 2 — Business name (if different, optional)
            <input value={form.line2BusinessName} onChange={e => update('line2BusinessName', e.target.value)} />
          </label>
        </div>

        <div>
          <p style={{ fontWeight: 700, marginBottom: 8 }}>Line 3a — Federal tax classification</p>
          <div style={{ display: 'grid', gap: 8 }}>
            {CLASSIFICATIONS.map(([key, label]) => <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="radio" name="classification" checked={form.classification === key} onChange={() => update('classification', key)} />{label}
            </label>)}
          </div>
          {form.classification === 'LLC' && <label style={{ display: 'block', marginTop: 8 }}>Tax classification of the LLC
            <select required value={form.llcTaxClassification} onChange={e => update('llcTaxClassification', e.target.value)} style={{ marginLeft: 8 }}>
              <option value="">Select…</option>
              <option value="C">C corporation</option>
              <option value="S">S corporation</option>
              <option value="P">Partnership</option>
            </select>
          </label>}
          {form.classification === 'OTHER' && <label style={{ display: 'block', marginTop: 8 }}>Describe
            <input required value={form.otherClassificationDescription} onChange={e => update('otherClassificationDescription', e.target.value)} style={{ marginLeft: 8 }} />
          </label>}
        </div>

        {['PARTNERSHIP', 'TRUST_ESTATE'].includes(form.classification) || (form.classification === 'LLC' && form.llcTaxClassification === 'P') ? <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <input type="checkbox" checked={form.hasForeignPartners} onChange={e => update('hasForeignPartners', e.target.checked)} />
          <span>Line 3b — I have foreign partners, owners, or beneficiaries (only applies if you're providing this form to a partnership, trust, or estate in which you have an ownership interest)</span>
        </label> : null}

        <details>
          <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Line 4 — Exemptions (most people leave this blank)</summary>
          <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
            <label style={{ display: 'grid', gap: 5 }}>Exempt payee code (if any)<input value={form.exemptPayeeCode} onChange={e => update('exemptPayeeCode', e.target.value)} /></label>
            <label style={{ display: 'grid', gap: 5 }}>FATCA exemption code (if any)<input value={form.fatcaExemptionCode} onChange={e => update('fatcaExemptionCode', e.target.value)} /></label>
          </div>
        </details>

        <div style={{ display: 'grid', gap: 10 }}>
          <label style={{ display: 'grid', gap: 5, fontWeight: 700 }}>Line 5 — Address<input required value={form.address} onChange={e => update('address', e.target.value)} /></label>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
            <label style={{ display: 'grid', gap: 5, fontWeight: 700 }}>City<input required value={form.city} onChange={e => update('city', e.target.value)} /></label>
            <label style={{ display: 'grid', gap: 5, fontWeight: 700 }}>State<input required maxLength={2} value={form.stateCode} onChange={e => update('stateCode', e.target.value.toUpperCase())} /></label>
            <label style={{ display: 'grid', gap: 5, fontWeight: 700 }}>ZIP<input required value={form.zipCode} onChange={e => update('zipCode', e.target.value)} /></label>
          </div>
        </div>

        <div>
          <p style={{ fontWeight: 700, marginBottom: 8 }}>Part I — Taxpayer Identification Number</p>
          <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="radio" name="tinType" checked={form.tinType === 'SSN'} onChange={() => update('tinType', 'SSN')} />Social Security Number</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="radio" name="tinType" checked={form.tinType === 'EIN'} onChange={() => update('tinType', 'EIN')} />Employer Identification Number</label>
          </div>
          <input required type="text" inputMode="numeric" placeholder={form.tinType === 'SSN' ? 'XXX-XX-XXXX' : 'XX-XXXXXXX'} value={form.tin} onChange={e => { const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 9); update('tin', digits ? formatTin(form.tinType, digits) : ''); }} style={{ maxWidth: 220 }} />
        </div>

        <div style={{ padding: 16, border: '1px solid #e4e4e4', borderRadius: 12, background: '#faf9f7' }}>
          <p style={{ fontWeight: 700, marginTop: 0 }}>Part II — Certification</p>
          <p style={{ whiteSpace: 'pre-wrap', fontSize: 14, color: '#444' }}>{W9_CERTIFICATION_TEXT}</p>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 10, fontWeight: 700 }}>
            <input type="checkbox" checked={form.certificationAgreed} onChange={e => update('certificationAgreed', e.target.checked)} />
            I have read and agree to the certification above.
          </label>
          <label style={{ display: 'grid', gap: 5, fontWeight: 700, marginTop: 14 }}>Signature — type your full legal name
            <input required value={form.signatureFullName} onChange={e => update('signatureFullName', e.target.value)} />
          </label>
        </div>

        <button className="portal-primary" disabled={busy} type="submit">{busy ? 'Submitting…' : 'Submit W-9'}</button>
      </form>
    </Card>}
  </main>;
}
