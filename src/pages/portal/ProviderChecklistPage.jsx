import React from 'react';
import ProviderNav from './ProviderNav.jsx';
import { Card, Empty, LockedCard, useProviderWorkspace, AccountBadge } from './providerWorkspaceShared.jsx';
import './PortalWorkspacePage.css';

export default function ProviderChecklistPage() {
  const { session, snapshot, loading, error, message, load, act, uploadEvidence } = useProviderWorkspace();
  if (loading) return <main className="portal-shell"><p>Loading your DANI DECLARES workspace…</p></main>;
  if (error && !snapshot) return <main className="portal-shell"><div className="portal-alert">{error}</div></main>;
  if (snapshot?.role !== 'provider') return <main className="portal-shell"><div className="portal-alert">This page is only available to provider accounts.</div></main>;
  const isApproved = snapshot.application?.application_status === 'APPROVED';
  const isSigned = snapshot.application?.agreement_status === 'EXECUTED';
  return <main className="portal-shell">
    <header className="portal-hero"><div><p className="portal-eyebrow">DANI DECLARES PROVIDER</p><h1>Field Checklist</h1><p>Required steps for each assigned job.</p></div><div className="portal-hero-actions"><AccountBadge session={session} /><button className="portal-refresh" onClick={load}>Refresh</button></div></header>
    <ProviderNav isApprovedProvider={isApproved} agreementSigned={isSigned} />
    {error && <div className="portal-alert" role="alert">{error}</div>}{message && <div className="portal-success" role="status">{message}</div>}
    {!isApproved ? <LockedCard title="Field Checklist">Your checklist unlocks once your application is approved.</LockedCard> :
      <Card title="Field Checklist">{snapshot.tasks?.length ? snapshot.tasks.map(task => <div className="portal-row" key={task.id}><div><strong>{task.task_name}</strong><small>{task.status} · {task.task_type || 'Operational task'}</small></div><div className="portal-actions"><label className="portal-upload">Attach evidence<input type="file" accept="image/*,.pdf" onChange={event => uploadEvidence(task, event.target.files?.[0])} /></label><button onClick={() => act('task_update', { taskId: task.id, status: 'IN_PROGRESS' })}>Start</button><button onClick={() => act('task_update', { taskId: task.id, status: 'COMPLETED', evidenceRef: task.evidence_ref || null })}>Complete</button></div></div>) : <Empty>Assigned jobs will populate your required checklist here.</Empty>}</Card>}
  </main>;
}
