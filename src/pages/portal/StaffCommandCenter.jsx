import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const COLORS = {
  ink: '#21191a',
  muted: '#75696a',
  border: '#e8dfe0',
  surface: '#fffdfc',
  soft: '#faf6f0',
  accent: '#7a263a',
  danger: '#9b3346',
  warning: '#9a6514',
  success: '#2d6a4f',
  info: '#355c7d',
};

function money(value) {
  return `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function date(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function dateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
function titleCase(value) {
  return String(value || '').replaceAll('_', ' ').replace(/\\b\\w/g, c => c.toUpperCase());
}
function statusTone(value) {
  const v = String(value || '').toLowerCase();
  if (['paid', 'completed', 'approved', 'verified', 'accepted', 'scheduled'].includes(v)) return COLORS.success;
  if (['needs_review', 'pending', 'pending_approval', 'dispatch_review', 'rework_requested'].includes(v)) return COLORS.warning;
  if (['blocked', 'rejected', 'declined', 'failed', 'cancelled'].includes(v)) return COLORS.danger;
  return COLORS.info;
}
function Card({ title, eyebrow, children, action }) {
  return <section style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 20, boxShadow: '0 10px 30px rgba(33,25,26,.05)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 14 }}>
      <div>
        {eyebrow && <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.13em', color: COLORS.accent, textTransform: 'uppercase' }}>{eyebrow}</div>}
        <h2 style={{ margin: eyebrow ? '5px 0 0' : 0, fontSize: 20, color: COLORS.ink }}>{title}</h2>
      </div>
      {action}
    </div>
    {children}
  </section>;
}
function Metric({ label, value, detail, tone = COLORS.ink }) {
  return <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 16, minHeight: 104 }}>
    <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 700 }}>{label}</div>
    <div style={{ marginTop: 7, fontSize: 28, lineHeight: 1, fontWeight: 900, color: tone }}>{value}</div>
    {detail && <div style={{ marginTop: 8, fontSize: 12, color: COLORS.muted }}>{detail}</div>}
  </div>;
}
function Pill({ children, tone = COLORS.info }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 999, padding: '5px 9px', background: `${tone}14`, color: tone, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em' }}>{children}</span>;
}
function Row({ title, meta, right, tone }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, padding: '13px 0', borderBottom: `1px solid ${COLORS.border}` }}>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontWeight: 800, color: COLORS.ink }}>{title}</div>
      <div style={{ marginTop: 4, color: COLORS.muted, fontSize: 12 }}>{meta}</div>
    </div>
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>{tone && <Pill tone={tone}>{titleCase(tone === COLORS.warning ? 'attention' : 'active')}</Pill>}{right}</div>
  </div>;
}

export default function StaffCommandCenter({ session }) {
  const [data, setData] = useState(null);
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const headers = { Authorization: `Bearer ${session.access_token}` };
      const [snapshotResponse, estimateResponse] = await Promise.all([
        fetch('/api/portal-operations', { headers }),
        fetch('/api/portal-operations?estimates=1', { headers }),
      ]);
      const snapshot = await snapshotResponse.json();
      const estimateData = await estimateResponse.json();
      if (!snapshotResponse.ok || !snapshot.success) throw new Error(snapshot.error || 'Could not load the operations command center.');
      if (!estimateResponse.ok || !estimateData.success) throw new Error(estimateData.error || 'Could not load the quote pipeline.');
      setData(snapshot);
      setEstimates(estimateData.estimates || []);
    } catch (e) {
      setError(e.message || 'Could not load the operations command center.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const metrics = useMemo(() => {
    const requests = data?.requests || [];
    const jobs = data?.jobs || [];
    const appointments = data?.appointments || [];
    const providers = data?.providers || [];
    const changes = data?.changes || [];
    const evidence = data?.evidence || [];
    const payments = data?.payments || [];
    const openRequests=requests.filter(r => !['completed','cancelled','closed','job_created'].includes(String(r.status || '').toLowerCase()) && !estimates.some(e => e.service_request_id === r.id)); const scopeRequired=openRequests.filter(r => String(r.scope_status||'NOT_STARTED').toUpperCase() !== 'COMPLETE').length; const scopeComplete=openRequests.filter(r => String(r.scope_status||'NOT_STARTED').toUpperCase() === 'COMPLETE').length;
    const activeJobs = jobs.filter(j => !['COMPLETED','CANCELLED'].includes(String(j.job_status || '').toUpperCase())).length;
    const dispatchReview = jobs.filter(j => ['DISPATCH_REVIEW','ASSIGNMENT_OFFERED'].includes(String(j.job_status || '').toUpperCase())).length;
    const pendingEvidence = evidence.filter(e => String(e.verification_status || '').toUpperCase() === 'PENDING').length;
    const pendingChanges = changes.filter(c => String(c.status || '').toUpperCase() === 'PENDING_APPROVAL').length;
    const failedPayments = payments.filter(p => ['failed','rejected'].includes(String(p.payment_status || p.status || '').toLowerCase())).length;
    const today = new Date(); today.setHours(0,0,0,0);
    const todayAppointments = appointments.filter(a => { const d = new Date(a.starts_at); return !Number.isNaN(d.getTime()) && d >= today && d < new Date(today.getTime()+86400000); });
    return { requests, jobs, appointments, providers, changes, evidence, payments, scopeRequired, scopeComplete, activeJobs, dispatchReview, pendingEvidence, pendingChanges, failedPayments, todayAppointments };
  }, [data, estimates]);

  if (loading) return <div style={{ padding: 8 }}><p style={{ color: COLORS.muted }}>Loading command center…</p></div>;
  if (error) return <div className="portal-alert" role="alert">{error}</div>;

  const requests = metrics.requests;
  const newScopeRequest = requests.find(r => !['completed','cancelled','closed','job_created'].includes(String(r.status || '').toLowerCase()) && String(r.scope_status||'NOT_STARTED').toUpperCase() !== 'COMPLETE' && !estimates.some(e => e.service_request_id === r.id)); const scopeReadyRequest = requests.find(r => !['completed','cancelled','closed','job_created'].includes(String(r.status || '').toLowerCase()) && String(r.scope_status||'NOT_STARTED').toUpperCase() === 'COMPLETE' && !estimates.some(e => e.service_request_id === r.id));
  const recentRequests = requests.filter(r => r.id !== newScopeRequest?.id).slice(0, 5);
  const readyToSend = estimates.filter(e => e.estimate_status === 'ready_to_send');
  const needsReview = estimates.filter(e => e.estimate_status === 'needs_review');
  const awaitingCustomer = estimates.filter(e => ['sent','approved'].includes(e.estimate_status));
  const paid = estimates.filter(e => e.estimate_status === 'paid');
  const activeJobs = metrics.jobs.filter(j => !['COMPLETED','CANCELLED'].includes(String(j.job_status || '').toUpperCase())).slice(0, 6);
  const riskJobs = metrics.jobs.filter(j => ['DISPATCH_REVIEW','ASSIGNMENT_OFFERED','REWORK_REQUESTED','BLOCKED'].includes(String(j.job_status || '').toUpperCase())).slice(0, 5);

  return <div className="command-center-shell" style={{ color: COLORS.ink, background: '#f7f4ee', borderRadius: 24, padding: 6 }}>
    <header className="command-hero" style={{ borderRadius: 22, padding: '26px 28px', background: '#fffdfc', color: COLORS.ink, marginBottom: 18, border: '1px solid #e4dbd2', boxShadow: '0 12px 30px rgba(33,25,26,.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.16em', color: COLORS.accent }}>DANI DECLARES</div>
          <h1 style={{ margin: '7px 0 8px', fontSize: 34, letterSpacing: '-.03em' }}>Operations Command Center</h1>
          <p style={{ margin: 0, maxWidth: 720, color: COLORS.muted }}>One operating view for requests, scope, quotes, payments, jobs, providers, evidence and exceptions.</p>
        </div>
        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
          <Link className="portal-primary" to="/portal/operations" style={{ background: '#fff', color: COLORS.ink }}>Open Operations</Link>
          <Link className="portal-primary" to="/portal/quotes" style={{ background: COLORS.accent, color: '#fff', borderColor: COLORS.accent }}>Build Quote</Link>
          <button className="portal-refresh" onClick={load} style={{ color: COLORS.accent, borderColor: '#d9c7c9', background: '#fff' }}>Refresh</button>
        </div>
      </div>
    </header>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: 10, marginBottom: 18 }}>
      <Metric label="New / Scope" value={metrics.scopeRequired} detail="Requests without a quote" tone={metrics.scopeRequired ? COLORS.danger : COLORS.success} />
      <Metric label="Scope Complete" value={metrics.scopeComplete} detail="Ready for quote" tone={metrics.scopeComplete ? COLORS.info : COLORS.success} />
      <Metric label="Quotes to Review" value={needsReview.length} detail="Commercial review" tone={needsReview.length ? COLORS.warning : COLORS.success} />
      <Metric label="Ready to Send" value={readyToSend.length} detail="Customer delivery" />
      <Metric label="Awaiting Customer" value={awaitingCustomer.length} detail="Sent / approved" />
      <Metric label="Active Jobs" value={metrics.activeJobs} detail="Production in motion" />
      <Metric label="At Risk" value={riskJobs.length + metrics.failedPayments} detail="Exceptions needing action" tone={riskJobs.length || metrics.failedPayments ? COLORS.danger : COLORS.success} />
    </div>

    <div className="command-control-tracks" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 18, marginBottom: 18 }}>
      <Card eyebrow="Field operations" title="Live Production Control" action={<Link to="/portal/operations">Open Dispatch →</Link>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10 }}>
          <Metric label="Scheduled today" value={metrics.todayAppointments.length} detail="Appointments" tone={COLORS.info} />
          <Metric label="Active jobs" value={metrics.activeJobs} detail="Production in motion" tone={metrics.activeJobs ? COLORS.info : COLORS.success} />
          <Metric label="Routing review" value={metrics.dispatchReview} detail="Needs dispatch action" tone={metrics.dispatchReview ? COLORS.warning : COLORS.success} />
        </div>
        <div className="command-state-panel">
          <div className="command-state-label">Execution states</div>
          <div className="command-state-track">{['SCHEDULED','DISPATCHED','EN ROUTE','IN PROGRESS','BLOCKED','QA','COMPLETED'].map((state, index, arr) => <React.Fragment key={state}><span>{state}</span>{index < arr.length - 1 && <b>→</b>}</React.Fragment>)}</div>
        </div>
      </Card>
      <Card eyebrow="Commercial control" title="Financial Ledger" action={<Link to="/portal/saved-quotes">Open Commercial →</Link>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10 }}>
          <Metric label="Quote review" value={needsReview.length} detail="Commercial review" tone={needsReview.length ? COLORS.warning : COLORS.success} />
          <Metric label="Ready to send" value={readyToSend.length} detail="Customer delivery" tone={readyToSend.length ? COLORS.accent : COLORS.success} />
          <Metric label="Awaiting customer" value={awaitingCustomer.length} detail="Decision / payment path" tone={awaitingCustomer.length ? COLORS.warning : COLORS.success} />
        </div>
        <div className="command-state-panel">
          <div className="command-state-label">Commercial chain</div>
          <div className="command-state-track">{['QUOTE','REVIEW','SENT','APPROVED','PAYMENT','FULFILLMENT'].map((state, index, arr) => <React.Fragment key={state}><span>{state}</span>{index < arr.length - 1 && <b>→</b>}</React.Fragment>)}</div>
        </div>
      </Card>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.45fr) minmax(330px,.85fr)', gap: 18, marginBottom: 18 }}>
      <Card eyebrow="Priority queue" title="Needs Your Attention" action={<button className="portal-refresh" onClick={load}>Refresh data</button>}>
        {newScopeRequest ? <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 18, background: COLORS.soft }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 15, flexWrap: 'wrap' }}>
            <div>
              <Pill tone={COLORS.danger}>Scope required</Pill>
              <h3 style={{ margin: '10px 0 5px', fontSize: 22 }}>{newScopeRequest.service_needed || newScopeRequest.service_category || 'Property service request'}</h3>
              <div style={{ color: COLORS.muted }}>{newScopeRequest.organization_name || newScopeRequest.client_name || 'Customer'} · {newScopeRequest.location_address || 'Location on file'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: COLORS.muted }}>Requested</div>
              <strong>{dateTime(newScopeRequest.requested_start || newScopeRequest.preferred_start || newScopeRequest.created_at)}</strong>
            </div>
          </div>
          <p style={{ margin: '15px 0 8px', lineHeight: 1.55 }}>{newScopeRequest.description || newScopeRequest.notes || newScopeRequest.service_needed || 'Customer request received. Scope development is required before quoting.'}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <Pill tone={COLORS.info}>Request {String(newScopeRequest.id).slice(0, 8)}</Pill>
            <Pill tone={COLORS.warning}>{titleCase(newScopeRequest.status || 'new')}</Pill>
          </div>
          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
            <Link className="portal-primary" to={"/portal/scope?requestId="+encodeURIComponent(newScopeRequest.id)}>Develop Scope →</Link>
            <a className="portal-primary" href={`mailto:${newScopeRequest.client_email || ''}`}>Contact Customer</a>
          </div>
        </div> : scopeReadyRequest ? <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 18, background: '#edf5fa' }}><Pill tone={COLORS.info}>Scope complete</Pill><h3 style={{ margin: '10px 0 5px', fontSize: 22 }}>{scopeReadyRequest.service_needed || scopeReadyRequest.service_category || 'Property service request'}</h3><div style={{ color: COLORS.muted }}>{scopeReadyRequest.organization_name || scopeReadyRequest.client_name || 'Customer'} · Scope version {scopeReadyRequest.scope_version || 1}</div><p style={{ margin: '12px 0', lineHeight: 1.5 }}>The structured scope is complete. Continue to Quote Builder to create the governed commercial estimate.</p><Link className="portal-primary" to={"/portal/quotes?requestId="+encodeURIComponent(scopeReadyRequest.id)}>Continue to Quote →</Link></div> : <div style={{ padding: 18, borderRadius: 14, background: '#f2f8f4', color: COLORS.success }}>No unquoted requests are currently waiting for scope.</div>}
      </Card>

      <Card eyebrow="Pipeline" title="Commercial Flow">
        {[
          ['Requests', requests.length, COLORS.info],
          ['Scope required', metrics.scopeRequired, COLORS.danger],
          ['Scope complete', metrics.scopeComplete, COLORS.info],
          ['Quote review', needsReview.length, COLORS.warning],
          ['Ready to send', readyToSend.length, COLORS.info],
          ['Awaiting customer', awaitingCustomer.length, COLORS.warning],
          ['Paid / converted', paid.length, COLORS.success],
        ].map(([label, value, tone]) => <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: `1px solid ${COLORS.border}` }}><span>{label}</span><strong style={{ color: tone, fontSize: 18 }}>{value}</strong></div>)}
      </Card>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 18, marginBottom: 18 }}>
      <Card eyebrow="Dispatch" title="Today">
        {metrics.todayAppointments.length ? metrics.todayAppointments.slice(0, 6).map(a => <Row key={a.id} title={a.job_id ? `Job ${String(a.job_id).slice(0, 8)}` : 'Appointment'} meta={dateTime(a.starts_at)} right={<Pill tone={statusTone(a.appointment_status)}>{titleCase(a.appointment_status)}</Pill>} />) : <div style={{ color: COLORS.muted, padding: '12px 0' }}>No appointments scheduled today.</div>}
      </Card>
      <Card eyebrow="Production" title="Active Jobs" action={<Link to="/portal/operations" style={{ fontSize: 12 }}>Open all →</Link>}>
        {activeJobs.length ? activeJobs.map(j => <Row key={j.id} title={j.job_title || j.public_reference || 'Job'} meta={`${j.location_address || 'Location on file'} · ${date(j.scheduled_start)}`} right={<Pill tone={statusTone(j.job_status)}>{titleCase(j.job_status)}</Pill>} />) : <div style={{ color: COLORS.muted, padding: '12px 0' }}>No active jobs.</div>}
      </Card>
      <Card eyebrow="Exception center" title="At Risk">
        {riskJobs.length ? riskJobs.map(j => <Row key={j.id} title={j.job_title || j.public_reference || 'Job'} meta={`Operational status: ${titleCase(j.job_status)}`} right={<Pill tone={COLORS.danger}>Action</Pill>} />) : null}
        {metrics.pendingEvidence > 0 && <Row title="Evidence pending verification" meta={`${metrics.pendingEvidence} evidence record(s)`} right={<Pill tone={COLORS.warning}>QA</Pill>} />}
        {metrics.pendingChanges > 0 && <Row title="Change orders awaiting approval" meta={`${metrics.pendingChanges} pending approval(s)`} right={<Pill tone={COLORS.warning}>Approval</Pill>} />}
        {metrics.failedPayments > 0 && <Row title="Payment exceptions" meta={`${metrics.failedPayments} failed/rejected event(s)`} right={<Pill tone={COLORS.danger}>Finance</Pill>} />}
        {!riskJobs.length && !metrics.pendingEvidence && !metrics.pendingChanges && !metrics.failedPayments && <div style={{ padding: 12, borderRadius: 12, background: '#f2f8f4', color: COLORS.success }}>No current exceptions requiring escalation.</div>}
      </Card>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,.8fr)', gap: 18, marginBottom: 18 }}>
      <Card eyebrow="Requests" title="Recent Opportunities">
        {newScopeRequest && <Row title={newScopeRequest.service_needed || 'New request'} meta={`${newScopeRequest.organization_name || newScopeRequest.client_name || 'Customer'} · received ${date(newScopeRequest.created_at)}`} right={<Link className="portal-primary" to={"/portal/scope?requestId="+encodeURIComponent(newScopeRequest.id)}>Develop Scope</Link>} />}
        {recentRequests.map(r => <Row key={r.id} title={r.service_needed || r.service_category || 'Service request'} meta={`${r.organization_name || r.client_name || 'Customer'} · ${titleCase(r.status || 'new')}`} right={<span style={{ color: COLORS.muted, fontSize: 11 }}>Request</span>} />)}
        {!requests.length && <div style={{ color: COLORS.muted }}>No service requests found.</div>}
      </Card>
      <Card eyebrow="Network" title="Provider Operations">
        <Metric label="Provider records" value={metrics.providers.length} detail="Current network" />
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Metric label="Dispatch review" value={metrics.dispatchReview} detail="Jobs needing routing" tone={metrics.dispatchReview ? COLORS.warning : COLORS.success} />
          <Metric label="QA evidence" value={metrics.pendingEvidence} detail="Awaiting verification" tone={metrics.pendingEvidence ? COLORS.warning : COLORS.success} />
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link className="portal-primary" to="/portal/provider-approval">Provider applications</Link>
          <Link className="portal-primary" to="/portal/operations">Provider network</Link>
        </div>
      </Card>
    </div>

    <Card eyebrow="Commercial control" title="Quotes Requiring Action" action={<Link to="/portal/saved-quotes">Open saved quotes →</Link>}>
      {needsReview.slice(0, 5).map(e => <Row key={e.id} title={`${e.public_reference} · ${e.client_name || 'Customer'}`} meta={`${money(e.estimated_total)} · needs commercial review · ${date(e.created_at)}`} right={<Link className="portal-primary" to={`/portal/estimates/${e.id}/review`}>Review</Link>} />)}
      {readyToSend.slice(0, 5).map(e => <Row key={e.id} title={`${e.public_reference} · ${e.client_name || 'Customer'}`} meta={`${money(e.estimated_total)} · ready to send · ${date(e.created_at)}`} right={<Link className="portal-primary" to={`/portal/estimates/${e.id}/review`}>Send</Link>} />)}
      {!needsReview.length && !readyToSend.length && <div style={{ color: COLORS.muted }}>No quote actions are currently waiting.</div>}
    </Card>

    <div style={{ marginTop: 18, padding: '13px 16px', borderRadius: 14, background: COLORS.soft, color: COLORS.muted, fontSize: 12, lineHeight: 1.5 }}>
      <strong style={{ color: COLORS.ink }}>DANI control principle:</strong> the dashboard surfaces state and recommended action; it does not replace the authoritative service, pricing, commercial, operational, provider, payment or governance layers.
    </div>
  </div>;
}
