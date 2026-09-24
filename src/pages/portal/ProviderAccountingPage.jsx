import React, { useEffect, useState } from 'react';
import ProviderNav from './ProviderNav.jsx';
import { Card, Empty, AccountBadge, formatDate, useProviderWorkspace } from './providerWorkspaceShared.jsx';
import './PortalWorkspacePage.css';

const money = value => '$' + Number(value || 0).toFixed(2);

export default function ProviderAccountingPage() {
  const { session, snapshot, loading: portalLoading } = useProviderWorkspace();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noteById, setNoteById] = useState({});

  const load = async () => {
    if (!session?.access_token) return;
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/provider-accounting', { headers: { Authorization: `Bearer ${session.access_token}` } });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.error || 'Could not load Financial Operations.');
      setWorkspace(body.workspace);
    } catch (e) { setError(e.message || 'Could not load Financial Operations.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [session?.access_token]); // eslint-disable-line react-hooks/exhaustive-deps

  const review = async (item, reviewStatus) => {
    setError('');
    try {
      const response = await fetch('/api/provider-accounting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          sourceType: 'ACCOUNTING_EXCEPTION',
          sourceId: item.id,
          reviewStatus,
          reviewerNote: noteById[item.id] || null
        })
      });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.error || 'Could not record review.');
      await load();
    } catch (e) { setError(e.message || 'Could not record review.'); }
  };

  if (portalLoading || loading) return <main className="portal-shell"><p>Loading Financial Operations…</p></main>;
  if (snapshot?.role !== 'provider') return <main className="portal-shell"><div className="portal-alert">Provider account required.</div></main>;
  if (error && !workspace) return <main className="portal-shell"><div className="portal-alert">{error}</div></main>;

  const lanes = workspace?.lanes || [];
  const exceptions = workspace?.exceptions || [];
  const sources = workspace?.sources || [];
  const payables = workspace?.payables || [];
  const boundaries = workspace?.boundaries || {};

  return <main className="portal-shell">
    <header className="portal-hero">
      <div><p className="portal-eyebrow">DANI DECLARES · FINANCIAL OPERATIONS</p><h1>Accounting Workspace</h1><p>Review reconciled company evidence, work exceptions, prepare bookkeeping and schedules, and route decisions that require owner authority. The Accounting Agent prepares and flags work; it does not replace your review or owner approval.</p></div>
      <div className="portal-hero-actions"><AccountBadge session={session} /><button className="portal-refresh" onClick={load}>Refresh</button></div>
    </header>
    <ProviderNav isApprovedProvider={snapshot?.application?.application_status === 'APPROVED'} agreementSigned={snapshot?.application?.agreement_status === 'EXECUTED'} showAccounting />
    {error && <div className="portal-alert" role="alert">{error}</div>}

    <div className="portal-summary-grid">
      <div className="portal-summary-tile"><strong>{exceptions.length}</strong><span>Open accounting exceptions</span></div>
      <div className="portal-summary-tile"><strong>{sources.length}</strong><span>Governed evidence sources</span></div>
      <div className="portal-summary-tile"><strong>{payables.filter(x => !x.settled_at).length}</strong><span>Open payable records</span></div>
      <div className="portal-summary-tile"><strong>{lanes.length}</strong><span>Authorized accounting lanes</span></div>
    </div>

    <Card title="Your governed lanes">{lanes.length ? lanes.map(lane => <div className="portal-row" key={lane.capabilityKey}><div><strong>{lane.lane.replaceAll('_',' ').replaceAll('.',' · ')}</strong><small>{lane.ownerEscalationRule}</small></div></div>) : <Empty>No accounting lanes are authorized for this provider account.</Empty>}</Card>

    <Card title="Exception review queue">{exceptions.length ? exceptions.map(item => <div className="portal-row" key={item.id}>
      <div style={{ flex: 1 }}><strong>{item.exception_type.replaceAll('_',' ')}</strong><small>{item.description}</small><small>{item.source_system || 'DANI'} · {item.assigned_lane || 'Accounting'} · {item.requires_owner_decision ? 'Owner decision required' : 'Accounting review permitted'}</small>
        <textarea rows="2" value={noteById[item.id] || ''} onChange={e => setNoteById(prev => ({ ...prev, [item.id]: e.target.value }))} placeholder="Review note / evidence basis…" style={{ width: '100%', marginTop: 8 }} />
      </div>
      <div className="portal-actions">
        <button onClick={() => review(item, 'REVIEWED')}>Record review</button>
        <button onClick={() => review(item, 'NEEDS_OWNER')}>Route to owner</button>
        {!item.requires_owner_decision && <button onClick={() => review(item, 'RESOLVED_NON_OWNER')}>Resolve non-owner exception</button>}
      </div>
    </div>) : <Empty>No unresolved accounting exceptions.</Empty>}</Card>

    <Card title="Accounting source register">{sources.length ? sources.map(item => <div className="portal-row" key={item.id}><div><strong>{item.source_name}</strong><small>{item.system_name} · {item.classification || 'Unclassified'} · {item.coverage_period || 'Coverage not stated'}</small><small>Extracted: {item.extracted_status || '—'} · Reconciled: {item.reconciled_status || '—'} · QBO: {item.qbo_posted_status || '—'}</small>{item.notes && <small>{item.notes}</small>}</div></div>) : <Empty>No accounting sources registered.</Empty>}</Card>

    <Card title="Accounts payable">{payables.length ? payables.map(item => <div className="portal-row" key={item.id}><div><strong>{money(item.total_final_payable)}</strong><small>Work order {item.work_order_id || '—'} · {item.is_cleared_for_payout ? 'Cleared for payout' : 'Not cleared'} · {item.settled_at ? `Settled ${formatDate(item.settled_at)}` : 'Open'}</small></div></div>) : <Empty>No payable records.</Empty>}</Card>

    <Card title="Authority & compliance boundary">
      <p className="portal-note"><strong>You may:</strong> {(boundaries.may || []).join(' · ')}</p>
      <p className="portal-note"><strong>Escalate:</strong> {(boundaries.mustEscalate || []).join(' · ')}</p>
      <p className="portal-note"><strong>Not authorized here:</strong> {(boundaries.prohibited || []).join(' · ')}</p>
      <p className="portal-note">This workspace governs outputs and acceptance criteria. It does not prescribe unnecessary methods, sequence, or training for an independent provider.</p>
    </Card>
  </main>;
}
