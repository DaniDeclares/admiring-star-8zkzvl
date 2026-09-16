import React from 'react';
import ProviderNav from './ProviderNav.jsx';
import { Card, Empty, LockedCard, formatDate, useProviderWorkspace } from './providerWorkspaceShared.jsx';
import './PortalWorkspacePage.css';

export default function ProviderPayoutsPage() {
  const { snapshot, loading, error, message, load } = useProviderWorkspace();
  if (loading) return <main className="portal-shell"><p>Loading your DANI DECLARES workspace…</p></main>;
  if (error && !snapshot) return <main className="portal-shell"><div className="portal-alert">{error}</div></main>;
  if (snapshot?.role !== 'provider') return <main className="portal-shell"><div className="portal-alert">This page is only available to provider accounts.</div></main>;
  const isApproved = snapshot.application?.application_status === 'APPROVED';
  return <main className="portal-shell">
    <header className="portal-hero"><div><p className="portal-eyebrow">DANI DECLARES PROVIDER</p><h1>Payouts</h1><p>Payment records for completed, approved work.</p></div><button className="portal-refresh" onClick={load}>Refresh</button></header>
    <ProviderNav isApprovedProvider={isApproved} />
    {error && <div className="portal-alert" role="alert">{error}</div>}{message && <div className="portal-success" role="status">{message}</div>}
    {!isApproved ? <LockedCard title="Payouts">Payout history unlocks once your application is approved.</LockedCard> :
      <Card title="Payout History">{snapshot.payouts?.length ? snapshot.payouts.map(item => <div className="portal-row" key={item.id}><div><strong>${Number(item.amount || 0).toFixed(2)} {item.currency || 'USD'}</strong><small>{item.payout_status} · {item.completed_at ? `Paid ${formatDate(item.completed_at)}` : `Created ${formatDate(item.created_at)}`}</small></div></div>) : <Empty>No payout records are currently attached to this account.</Empty>}</Card>}
  </main>;
}
