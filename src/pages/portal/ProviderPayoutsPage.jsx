import React from 'react';
import ProviderNav from './ProviderNav.jsx';
import { Card, Empty, LockedCard, formatDate, statusLabel, useProviderWorkspace, AccountBadge } from './providerWorkspaceShared.jsx';
import './PortalWorkspacePage.css';

const money = value => '$' + Number(value || 0).toFixed(2);

export default function ProviderPayoutsPage() {
  const { session, snapshot, loading, error, message, load } = useProviderWorkspace();
  if (loading) return <main className="portal-shell"><p>Loading your earnings…</p></main>;
  if (error && !snapshot) return <main className="portal-shell"><div className="portal-alert">{error}</div></main>;
  if (snapshot?.role !== 'provider') return <main className="portal-shell"><div className="portal-alert">This page is only available to provider accounts.</div></main>;
  const isApproved = snapshot.application?.application_status === 'APPROVED';
  const isSigned = snapshot.application?.agreement_status === 'EXECUTED';
  const financials = snapshot.financials || { earnings: [], payables: [], payouts: [] };
  const approved = financials.earnings.filter(x => ['APPROVED','SCHEDULED','PAID'].includes(String(x.status || '').toUpperCase())).reduce((sum,x)=>sum+Number(x.totalApprovedAmount || 0),0);
  const pending = financials.payables.filter(x => !['PAID','CANCELLED','VOID'].includes(String(x.status || '').toUpperCase())).reduce((sum,x)=>sum+Number(x.total || 0),0);
  return <main className="portal-shell">
    <header className="portal-hero"><div><p className="portal-eyebrow">DANI DECLARES PROVIDER</p><h1>Earnings</h1><p>Track approved earnings, payables, and payout status. DANI accounting controls approval and reconciliation.</p></div><div className="portal-hero-actions"><AccountBadge session={session} /><button className="portal-refresh" onClick={load}>Refresh</button></div></header>
    <ProviderNav isApprovedProvider={isApproved} agreementSigned={isSigned} />
    {error && <div className="portal-alert" role="alert">{error}</div>}{message && <div className="portal-success" role="status">{message}</div>}
    {!isApproved ? <LockedCard title="Earnings">Earnings unlock once your application is approved.</LockedCard> : <>
      <div className="portal-summary-grid">
        <div className="portal-summary-tile"><strong>{money(approved)}</strong><span>Approved earnings</span></div>
        <div className="portal-summary-tile"><strong>{money(pending)}</strong><span>Open payables</span></div>
        <div className="portal-summary-tile"><strong>{financials.payouts.length}</strong><span>Payout records</span></div>
      </div>
      <Card title="Earnings ledger">{financials.earnings.length ? financials.earnings.map(item => <div className="portal-row" key={item.id}><div><strong>{money(item.totalApprovedAmount)} {item.currency || 'USD'}</strong><small>{statusLabel(item.status)}{item.workOrderId ? ` · Work order ${item.workOrderId}` : ''}{item.approvedAt ? ` · Approved ${formatDate(item.approvedAt)}` : ''}</small>{item.holdReason && <small>Review note: {item.holdReason}</small>}</div></div>) : <Empty>No earnings have been approved yet.</Empty>}</Card>
      <Card title="Payables">{financials.payables.length ? financials.payables.map(item => <div className="portal-row" key={item.id}><div><strong>{money(item.total)} {item.currency || 'USD'}</strong><small>{statusLabel(item.status)}{item.approvedAt ? ` · Approved ${formatDate(item.approvedAt)}` : ''}{item.paidAt ? ` · Paid ${formatDate(item.paidAt)}` : ''}</small></div></div>) : <Empty>No payable records yet.</Empty>}</Card>
      <Card title="Payout status">{financials.payouts.length ? financials.payouts.map(item => <div className="portal-row" key={item.id}><div><strong>{money(item.amount)} {item.currency || 'USD'}</strong><small>{statusLabel(item.status)}{item.initiatedAt ? ` · Initiated ${formatDate(item.initiatedAt)}` : ''}{item.completedAt ? ` · Completed ${formatDate(item.completedAt)}` : ''}</small>{item.failureReason && <small>Needs attention: {item.failureReason}</small>}</div></div>) : <Empty>No payout records yet.</Empty>}</Card>
      <p className="portal-footer"><strong>Display only:</strong> providers cannot approve earnings, initiate payouts, change payout records, or reconcile accounting from this app.</p>
    </>}
  </main>;
}
