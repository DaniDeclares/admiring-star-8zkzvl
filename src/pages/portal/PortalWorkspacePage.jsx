import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import './PortalWorkspacePage.css';

const ROLE_LABELS = {
  provider: 'Provider Field Portal',
  resident: 'Resident Portal',
  customer: 'Customer Portal',
  property_manager: 'Property Manager Portal',
  procurement: 'Procurement Portal',
};

function Card({ title, children }) {
  return <section className="portal-card"><h2>{title}</h2>{children}</section>;
}

function Empty({ children = 'Nothing is waiting here.' }) {
  return <p className="portal-empty">{children}</p>;
}

export default function PortalWorkspacePage() {
  const [session, setSession] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setError('Please sign in to access this portal.');
      setLoading(false);
      return;
    }
    setSession(data.session);
    const response = await fetch('/api/portal-operations', { headers: { Authorization: `Bearer ${data.session.access_token}` } });
    const body = await response.json();
    if (!response.ok || !body.success) setError(body.error || 'Portal data could not be loaded.');
    else setSnapshot(body);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (action, payload) => {
    setMessage('');
    setError('');
    if (!session) return;
    const response = await fetch('/api/portal-operations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ action, ...payload }),
    });
    const body = await response.json();
    if (!response.ok || !body.success) setError(body.error || 'Action failed.');
    else { setMessage('Updated successfully.'); await load(); }
  };

  if (loading) return <main className="portal-shell"><p>Loading your Dani Declares workspace…</p></main>;
  if (error && !snapshot) return <main className="portal-shell"><div className="portal-alert">{error}</div></main>;

  const role = snapshot?.role || 'customer';
  const isProvider = role === 'provider';
  const isCommercial = ['property_manager', 'procurement'].includes(role);

  return (
    <main className="portal-shell">
      <header className="portal-hero">
        <div><p className="portal-eyebrow">DANI DECLARES</p><h1>{ROLE_LABELS[role] || 'Client Portal'}</h1><p>Requests, jobs, scheduling, field execution, approvals and documents — connected to the same operating system.</p></div>
        <button className="portal-refresh" onClick={load}>Refresh</button>
      </header>
      {error && <div className="portal-alert">{error}</div>}
      {message && <div className="portal-success">{message}</div>}

      {isProvider ? (
        <>
          <Card title="Assignment Queue">
            {snapshot.assignments?.length ? snapshot.assignments.map(item => (
              <div className="portal-row" key={item.id}>
                <div><strong>{item.dd_jobs?.job_title || 'Assigned Job'}</strong><small>{item.assignment_status} · {item.dd_jobs?.location_address || 'Location on file'}</small></div>
                {item.assignment_status === 'OFFERED' && <div className="portal-actions"><button onClick={() => act('assignment_response', { assignmentId: item.id, decision: 'ACCEPT' })}>Accept</button><button className="secondary" onClick={() => act('assignment_response', { assignmentId: item.id, decision: 'REJECT', reason: 'Provider declined assignment.' })}>Reject</button></div>}
              </div>
            )) : <Empty />}
          </Card>
          <Card title="Field Checklist">
            {snapshot.tasks?.length ? snapshot.tasks.map(task => (
              <div className="portal-row" key={task.id}>
                <div><strong>{task.task_name}</strong><small>{task.status} · {task.task_type || 'Operational task'}</small></div>
                <div className="portal-actions"><button onClick={() => act('task_update', { taskId: task.id, status: 'IN_PROGRESS' })}>Start</button><button onClick={() => act('task_update', { taskId: task.id, status: 'COMPLETED', evidenceRef: task.evidence_ref || null })}>Complete</button></div>
              </div>
            )) : <Empty>Assigned jobs will populate your required checklist here.</Empty>}
          </Card>
          <Card title="Evidence & Completion">
            <p className="portal-note">Evidence is stored in the private Dani Declares job-evidence bucket. Required evidence blocks task completion until attached.</p>
            {snapshot.evidence?.length ? snapshot.evidence.map(item => <div className="portal-row" key={item.id}><div><strong>{item.evidence_type}</strong><small>{item.verification_status}</small></div></div>) : <Empty>No evidence uploaded yet.</Empty>}
          </Card>
        </>
      ) : (
        <>
          <Card title={isCommercial ? 'Commercial Requests & Jobs' : 'My Requests & Jobs'}>
            {snapshot.requests?.length ? snapshot.requests.map(item => <div className="portal-row" key={item.id}><div><strong>{item.service_needed || item.service_category || 'Service request'}</strong><small>{item.status} · {item.location_address || 'Location on file'}</small></div></div>) : <Empty>No requests are currently attached to this account.</Empty>}
            {snapshot.jobs?.length ? snapshot.jobs.map(item => <div className="portal-row" key={item.id}><div><strong>{item.job_title}</strong><small>{item.job_status} · {item.location_address || 'Location on file'}</small></div></div>) : null}
          </Card>
          <Card title="Change Orders & Approvals">
            {snapshot.changes?.length ? snapshot.changes.map(item => <div className="portal-row" key={item.id}><div><strong>{item.reason}</strong><small>{item.status} · {item.resolved_channel || 'Channel controlled'}</small></div>{item.status === 'PENDING_APPROVAL' && <div className="portal-actions"><button onClick={() => act('change_order_decision', { changeOrderId: item.id, decision: 'APPROVED' })}>Approve</button><button className="secondary" onClick={() => act('change_order_decision', { changeOrderId: item.id, decision: 'REJECTED', reason: 'Declined in portal.' })}>Reject</button></div>}</div>) : <Empty>No pending change orders.</Empty>}
          </Card>
          <Card title="Invoices & Financial Records">
            <p className="portal-note">Invoices display finalized financial records. This portal never recalculates catalog pricing.</p>
            {snapshot.invoices?.length ? snapshot.invoices.map(item => <div className="portal-row" key={item.id}><div><strong>{item.public_reference}</strong><small>{item.invoice_status} · Balance: ${Number(item.balance_due || 0).toFixed(2)}</small></div></div>) : <Empty>No invoices are currently attached to this workspace.</Empty>}
          </Card>
        </>
      )}
      <footer className="portal-footer"><strong>Commercial boundary:</strong> DANI DECLARES pricing is resolved upstream and frozen before operational execution. Portals coordinate work; they do not invent or rewrite rates.</footer>
    </main>
  );
}
