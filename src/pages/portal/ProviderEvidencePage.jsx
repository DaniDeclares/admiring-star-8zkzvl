import React from 'react';
import ProviderNav from './ProviderNav.jsx';
import { Card, Empty, LockedCard, useProviderWorkspace, AccountBadge } from './providerWorkspaceShared.jsx';
import './PortalWorkspacePage.css';

export default function ProviderEvidencePage() {
  const { session, snapshot, loading, error, message, load } = useProviderWorkspace();
  if (loading) return <main className="portal-shell"><p>Loading your DANI DECLARES workspace…</p></main>;
  if (error && !snapshot) return <main className="portal-shell"><div className="portal-alert">{error}</div></main>;
  if (snapshot?.role !== 'provider') return <main className="portal-shell"><div className="portal-alert">This page is only available to provider accounts.</div></main>;
  const isApproved = snapshot.application?.application_status === 'APPROVED';
  const isSigned = snapshot.application?.agreement_status === 'EXECUTED';
  return <main className="portal-shell">
    <header className="portal-hero"><div><p className="portal-eyebrow">DANI DECLARES PROVIDER</p><h1>Evidence & Completion</h1><p>Evidence is private and tied to the job/task ledger. Required evidence blocks completion until attached.</p></div><div className="portal-hero-actions"><AccountBadge session={session} /><button className="portal-refresh" onClick={load}>Refresh</button></div></header>
    <ProviderNav isApprovedProvider={isApproved} agreementSigned={isSigned} />
    {error && <div className="portal-alert" role="alert">{error}</div>}{message && <div className="portal-success" role="status">{message}</div>}
    {!isApproved ? <LockedCard title="Evidence & Completion">Evidence records unlock once your application is approved.</LockedCard> :
      <Card title="Evidence & Completion">{snapshot.evidence?.length ? snapshot.evidence.map(item => <div className="portal-row" key={item.id}><div><strong>{item.evidence_type}</strong><small>{item.verification_status} · Job {item.job_id}</small></div></div>) : <Empty>No evidence uploaded yet.</Empty>}</Card>}
  </main>;
}
