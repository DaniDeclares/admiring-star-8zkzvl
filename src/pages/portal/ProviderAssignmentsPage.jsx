import React from 'react';
import ProviderNav from './ProviderNav.jsx';
import { Card, Empty, LockedCard, formatDate, useProviderWorkspace } from './providerWorkspaceShared.jsx';
import './PortalWorkspacePage.css';

export default function ProviderAssignmentsPage() {
  const { snapshot, loading, error, message, load, act } = useProviderWorkspace();
  if (loading) return <main className="portal-shell"><p>Loading your DANI DECLARES workspace…</p></main>;
  if (error && !snapshot) return <main className="portal-shell"><div className="portal-alert">{error}</div></main>;
  if (snapshot?.role !== 'provider') return <main className="portal-shell"><div className="portal-alert">This page is only available to provider accounts.</div></main>;
  const isApproved = snapshot.application?.application_status === 'APPROVED';
  return <main className="portal-shell">
    <header className="portal-hero"><div><p className="portal-eyebrow">DANI DECLARES PROVIDER</p><h1>Assignments</h1><p>Jobs DANI DECLARES dispatches directly to you. Accept or reject each offer — there is no open job board to browse.</p></div><button className="portal-refresh" onClick={load}>Refresh</button></header>
    <ProviderNav isApprovedProvider={isApproved} />
    {error && <div className="portal-alert" role="alert">{error}</div>}{message && <div className="portal-success" role="status">{message}</div>}
    {!isApproved ? <LockedCard title="Assignments">Assignments unlock once your application is approved.</LockedCard> :
      <Card title="Assignment Queue">{snapshot.assignments?.length ? snapshot.assignments.map(item => <div className="portal-row" key={item.id}><div><strong>{item.job?.job_title || 'Assigned Job'}</strong><small>{item.assignment_status} · {item.job?.location_address || 'Location on file'}{item.job?.sla_due_at ? ` · SLA due ${formatDate(item.job.sla_due_at)}` : ''}</small></div>{item.assignment_status === 'OFFERED' && <div className="portal-actions"><button onClick={() => act('assignment_response', { assignmentId: item.id, decision: 'ACCEPT' })}>Accept</button><button className="secondary" onClick={() => act('assignment_response', { assignmentId: item.id, decision: 'REJECT', reason: 'Provider declined assignment.' })}>Reject</button></div>}</div>) : <Empty />}</Card>}
  </main>;
}
