import React from 'react';
import ProviderNav from './ProviderNav.jsx';
import { Card, Empty, LockedCard, formatDate, useProviderWorkspace } from './providerWorkspaceShared.jsx';
import './PortalWorkspacePage.css';

export default function ProviderSchedulePage() {
  const { snapshot, loading, error, message, load } = useProviderWorkspace();
  if (loading) return <main className="portal-shell"><p>Loading your DANI DECLARES workspace…</p></main>;
  if (error && !snapshot) return <main className="portal-shell"><div className="portal-alert">{error}</div></main>;
  if (snapshot?.role !== 'provider') return <main className="portal-shell"><div className="portal-alert">This page is only available to provider accounts.</div></main>;
  const isApproved = snapshot.application?.application_status === 'APPROVED';
  return <main className="portal-shell">
    <header className="portal-hero"><div><p className="portal-eyebrow">DANI DECLARES PROVIDER</p><h1>Schedule</h1><p>Appointments tied to jobs you've accepted.</p></div><button className="portal-refresh" onClick={load}>Refresh</button></header>
    <ProviderNav isApprovedProvider={isApproved} />
    {error && <div className="portal-alert" role="alert">{error}</div>}{message && <div className="portal-success" role="status">{message}</div>}
    {!isApproved ? <LockedCard title="Schedule">Your schedule unlocks once your application is approved.</LockedCard> :
      <Card title="Upcoming Schedule">{snapshot.appointments?.length ? snapshot.appointments.filter(item => item.appointment_status !== 'CANCELLED').map(item => <div className="portal-row" key={item.id}><div><strong>{formatDate(item.starts_at)}</strong><small>{item.appointment_status} · Ends {formatDate(item.ends_at)} · Job {item.job_id}</small></div></div>) : <Empty>No scheduled appointments yet.</Empty>}</Card>}
  </main>;
}
