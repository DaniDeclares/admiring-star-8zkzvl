import React from 'react';
import { Link } from 'react-router-dom';
import ProviderNav from './ProviderNav.jsx';
import { Card, Empty, LockedCard, statusLabel, formatDate, useProviderWorkspace, AccountBadge } from './providerWorkspaceShared.jsx';
import './PortalWorkspacePage.css';

export default function ProviderProfilePage() {
  const { session, snapshot, loading, error, message, load } = useProviderWorkspace();
  if (loading) return <main className="portal-shell"><p>Loading your DANI DECLARES workspace…</p></main>;
  if (error && !snapshot) return <main className="portal-shell"><div className="portal-alert">{error}</div></main>;
  if (snapshot?.role !== 'provider') return <main className="portal-shell"><div className="portal-alert">This page is only available to provider accounts.</div></main>;
  const application = snapshot.application || null;
  const documents = snapshot.documents || [];
  const isApproved = application?.application_status === 'APPROVED';
  const isSigned = application?.agreement_status === 'EXECUTED';
  return <main className="portal-shell">
    <header className="portal-hero"><div><p className="portal-eyebrow">DANI DECLARES PROVIDER</p><h1>Profile</h1><p>Your application and contact details on file with DANI DECLARES.</p></div><div className="portal-hero-actions"><AccountBadge session={session} /><button className="portal-refresh" onClick={load}>Refresh</button></div></header>
    <ProviderNav isApprovedProvider={isApproved} agreementSigned={isSigned} />
    {error && <div className="portal-alert" role="alert">{error}</div>}{message && <div className="portal-success" role="status">{message}</div>}
    {!isSigned ? <LockedCard title="Profile">Your profile unlocks once you <Link to="/portal/provider-agreement">sign the Provider Agreement</Link>.</LockedCard> : <>
    <Card title="Contact & Business Details">
      <div className="portal-row"><div><strong>{application?.legal_name || 'Not provided'}</strong><small>{statusLabel(application?.applicant_type)}</small></div></div>
      <div className="portal-row"><div><strong>{[application?.contact_first_name, application?.contact_last_name].filter(Boolean).join(' ') || 'Not provided'}</strong><small>{application?.contact_email || 'No email on file'} · {application?.contact_phone || 'No phone on file'}</small></div></div>
      <div className="portal-row"><div><strong>{application?.service_area || 'Service area not provided'}</strong><small>{application?.physical_address || 'No address on file'}</small></div></div>
      {application?.service_notes && <div className="portal-row"><div><strong>Notes</strong><small>{application.service_notes}</small></div></div>}
      <p className="portal-note" style={{ marginTop: 14 }}>To correct any of this information, contact DANI DECLARES — the portal does not yet support self-service profile edits.</p>
    </Card>
    <Card title="Application Status"><div className="portal-row"><div><strong>{statusLabel(application?.application_status)}</strong><small>Submitted {formatDate(application?.submitted_at)}{application?.reviewed_at ? ` · Reviewed ${formatDate(application.reviewed_at)}` : ''}</small></div></div></Card>
    <Card title="Documents on File">{documents.length ? documents.map(item => <div className="portal-row" key={item.id}><div><strong>{item.document_type.replaceAll('_', ' ')}</strong><small>{statusLabel(item.verification_status)} · Uploaded {formatDate(item.uploaded_at)}{item.expires_at ? ` · Expires ${formatDate(item.expires_at)}` : ''}</small>{item.signed_url && <div><a href={item.signed_url} target="_blank" rel="noreferrer">View file →</a></div>}</div></div>) : <Empty>No documents uploaded yet.</Empty>}<div className="portal-actions" style={{ marginTop: 14 }}><Link className="portal-primary" to="/portal/vendor-onboarding">Manage documents</Link></div></Card>
    </>}
  </main>;
}
