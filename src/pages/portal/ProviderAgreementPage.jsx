import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProviderNav from './ProviderNav.jsx';
import { Card, formatDate, useProviderWorkspace, AccountBadge } from './providerWorkspaceShared.jsx';
import { PROVIDER_AGREEMENT_SECTIONS, PROVIDER_AGREEMENT_VERSION } from '../../data/providerAgreement.js';
import './PortalWorkspacePage.css';

export default function ProviderAgreementPage() {
  const { session, snapshot, loading, error, message, load, act } = useProviderWorkspace();
  const [fullLegalName, setFullLegalName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  if (loading) return <main className="portal-shell"><p>Loading your DANI DECLARES workspace…</p></main>;
  if (error && !snapshot) return <main className="portal-shell"><div className="portal-alert">{error}</div></main>;
  if (snapshot?.role !== 'provider') return <main className="portal-shell"><div className="portal-alert">This page is only available to provider accounts.</div></main>;

  const application = snapshot.application || null;
  const isApproved = application?.application_status === 'APPROVED';
  const isSigned = application?.agreement_status === 'EXECUTED';

  const submit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!fullLegalName.trim()) { setLocalError('Type your full legal name to sign.'); return; }
    if (!agreed) { setLocalError('Check the box confirming you have read and agree to the terms.'); return; }
    setSubmitting(true);
    await act('sign_provider_agreement', { fullLegalName: fullLegalName.trim(), agreed: true, agreementVersion: PROVIDER_AGREEMENT_VERSION });
    setSubmitting(false);
  };

  return <main className="portal-shell">
    <header className="portal-hero"><div><p className="portal-eyebrow">DANI DECLARES PROVIDER</p><h1>Provider Agreement</h1><p>This agreement must be signed before you can upload compliance documents or view your provider profile. It does not by itself authorize you to perform any service — DANI DECLARES still reviews and authorizes each service separately.</p></div><div className="portal-hero-actions"><AccountBadge session={session} /><button className="portal-refresh" onClick={load}>Refresh</button></div></header>
    <ProviderNav isApprovedProvider={isApproved} agreementSigned={isSigned} />
    {error && <div className="portal-alert" role="alert">{error}</div>}{message && <div className="portal-success" role="status">{message}</div>}
    {isSigned ? (
      <Card title="Agreement Signed">
        <p><strong>Signed by:</strong> {application?.agreement_signer_name || 'the account holder'} on {formatDate(application?.agreement_signed_at || application?.reviewed_at || application?.submitted_at)}.</p>
        <p className="portal-note">Your signed agreement is on file with DANI DECLARES. Continue to <Link to="/portal/vendor-onboarding">upload your documents</Link> or view your <Link to="/portal/profile">profile</Link>.</p>
      </Card>
    ) : (
      <>
        <Card title="DANI DECLARES LLC — Provider Agreement">
          <p className="portal-note" style={{ marginBottom: 16 }}><strong>Draft terms — under attorney review.</strong> Version {PROVIDER_AGREEMENT_VERSION}.</p>
          {PROVIDER_AGREEMENT_SECTIONS.map(section => <div key={section.heading} style={{ marginBottom: 14 }}>
            <strong>{section.heading}</strong>
            <p style={{ margin: '4px 0 0' }}>{section.body}</p>
          </div>)}
        </Card>
        <Card title="Sign this agreement">
          <form onSubmit={submit}>
            <label className="portal-wide">Type your full legal name to sign<input type="text" value={fullLegalName} onChange={e => setFullLegalName(e.target.value)} placeholder="Full legal name" required /></label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 12 }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 4 }} />
              <span>I have read this Provider Agreement and agree to be bound by its terms as of the date I sign.</span>
            </label>
            {localError && <div className="portal-alert" role="alert" style={{ marginTop: 12 }}>{localError}</div>}
            <button className="portal-primary portal-submit" style={{ marginTop: 16 }} disabled={submitting}>{submitting ? 'Signing…' : 'Sign Provider Agreement'}</button>
          </form>
        </Card>
      </>
    )}
  </main>;
}
