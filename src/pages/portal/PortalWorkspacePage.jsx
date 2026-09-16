import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';
import './PortalWorkspacePage.css';

const ROLE_LABELS = { provider: 'DANI DECLARES Provider', resident: 'DANI DECLARES', customer: 'DANI DECLARES', property_manager: 'DANI DECLARES', procurement: 'DANI DECLARES', staff_admin: 'My Portal' };
function Card({ title, children }) { return <section className="portal-card"><h2>{title}</h2>{children}</section>; }
function Empty({ children = 'Nothing is waiting here.' }) { return <p className="portal-empty">{children}</p>; }
function formatDate(value) { if (!value) return 'Not scheduled'; return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
function statusLabel(value) { return value ? value.replaceAll('_', ' ') : 'Not started'; }
function Requirement({ label, ok, detail }) { return <div className="portal-requirement"><span className={`portal-requirement-dot ${ok ? 'ok' : 'pending'}`} />{label}<small>{detail}</small></div>; }
// Mirrors the exact gates staff review at /portal/provider-approval (and that
// dd_approve_provider_application enforces server-side) so this never becomes
// a second, competing source of truth about what "approved" requires.
function buildProviderRequirements(application, capabilities) {
  const caps = capabilities || [];
  return [
    { label: 'Services selected', ok: caps.length > 0, detail: caps.length ? `${caps.length} selected` : 'None selected yet' },
    { label: 'Services authorized', ok: caps.length > 0 && caps.every(c => c.authorization_status === 'AUTHORIZED' && c.evidence_status === 'VERIFIED' && ['VERIFIED', 'NOT_REQUIRED'].includes(c.requirement_status)), detail: 'Reviewed by DANI DECLARES staff' },
    { label: 'Tax document', ok: ['VERIFIED', 'NOT_REQUIRED'].includes(application?.tax_form_status), detail: statusLabel(application?.tax_form_status) },
    { label: 'Insurance', ok: ['VERIFIED', 'NOT_REQUIRED'].includes(application?.insurance_status), detail: statusLabel(application?.insurance_status) },
    { label: 'Identity verification', ok: application?.identity_status === 'VERIFIED', detail: statusLabel(application?.identity_status) },
    { label: 'Signed agreement', ok: application?.agreement_status === 'EXECUTED', detail: statusLabel(application?.agreement_status) },
    { label: 'Background check', ok: ['CLEARED', 'NOT_REQUIRED'].includes(application?.background_check_status), detail: statusLabel(application?.background_check_status) },
    { label: 'Compliance review', ok: application?.compliance_status === 'VERIFIED', detail: statusLabel(application?.compliance_status) },
  ];
}

export default function PortalWorkspacePage() {
  const [session, setSession] = useState(null); const [snapshot, setSnapshot] = useState(null); const [loading, setLoading] = useState(true); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError(''); const { data } = await supabase.auth.getSession();
    if (!data.session) { setError('Please sign in to access your DANI DECLARES workspace.'); setLoading(false); return; }
    setSession(data.session); const response = await fetch('/api/portal-operations', { headers: { Authorization: `Bearer ${data.session.access_token}` } }); const body = await response.json();
    if (!response.ok || !body.success) setError(body.error || 'Portal data could not be loaded.'); else setSnapshot(body); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!session) return undefined; const timer = window.setInterval(load, 30000); const refreshOnFocus = () => { if (document.visibilityState === 'visible') load(); }; document.addEventListener('visibilitychange', refreshOnFocus); return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', refreshOnFocus); }; }, [session, load]);
  const act = async (action, payload) => {
    setMessage(''); setError(''); if (!session) return; const response = await fetch('/api/portal-operations', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ action, ...payload }) }); const body = await response.json();
    if (!response.ok || !body.success) setError(body.error || 'Action failed.'); else { setMessage('Updated successfully.'); await load(); }
  };
  const uploadEvidence = async (task, file) => {
    if (!file || !session) return; setError(''); setMessage('Preparing secure evidence upload…');
    const response = await fetch('/api/portal-operations', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ action: 'create_evidence_upload', jobId: task.job_id, taskId: task.id, fileName: file.name, contentType: file.type, evidenceType: 'FIELD_PHOTO', fileMetadata: { size: file.size, type: file.type } }) }); const body = await response.json();
    if (!response.ok || !body.success) return setError(body.error || 'Could not prepare evidence upload.');
    const { error: uploadError } = await supabase.storage.from('dd-job-evidence').uploadToSignedUrl(body.path, body.token, file); if (uploadError) return setError(uploadError.message || 'Evidence upload failed.');
    const finalize = await fetch('/api/portal-operations', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ action: 'finalize_evidence', ...body.finalizePayload }) }); const finalizeBody = await finalize.json();
    if (!finalize.ok || !finalizeBody.success) return setError(finalizeBody.error || 'Evidence record could not be finalized.'); setMessage('Evidence uploaded and attached to the task.'); await load();
  };
  if (loading) return <main className="portal-shell"><p>Loading your DANI DECLARES workspace…</p></main>;
  if (error && !snapshot) return <main className="portal-shell"><div className="portal-alert">{error}</div></main>;
  const role = snapshot?.role || 'customer';
  if (role === 'staff_admin') return <main className="portal-shell"><header className="portal-hero"><div><p className="portal-eyebrow">MY PORTAL</p><h1>My Portal</h1><p>Your authenticated owner and operations control center for sales, quoting, contract acquisition, fulfillment, dispatch, QA, customers, providers and business operations.</p></div><button className="portal-refresh" onClick={load}>Refresh</button></header><Card title="Contract Acquisition"><p>Move verified opportunities through qualification, pursuit, proposal, award and contract activation.</p><Link className="portal-primary" to="/portal/acquisition">Open Contract Acquisition</Link></Card><Card title="Operations Console"><p>Open the full operating console to manage work orders, quotes and fulfillment.</p><div className="portal-actions"><a className="portal-primary" href="/portal/operations">Open Operations Console</a><a className="portal-primary" href="/portal/provider-approval">Review Provider Applications</a></div></Card><Card title="Quote Desk"><p>Create and manage governed quotes without changing catalog authority.</p><a className="portal-primary" href="/portal/quotes">Open Quote Builder</a></Card><Card title="Business Control Principle"><p>My Portal is the daily owner/operator control layer. Customer and provider experiences feed work into it; approved commercial and pricing systems remain authoritative upstream.</p></Card></main>;
  const isProvider = role === 'provider'; const isCommercial = ['property_manager', 'procurement'].includes(role);
  const application = snapshot?.application || null;
  const capabilities = snapshot?.capabilities || [];
  const documents = snapshot?.documents || [];
  const isApprovedProvider = application?.application_status === 'APPROVED';
  const requirements = isProvider ? buildProviderRequirements(application, capabilities) : [];
  const completeCount = requirements.filter(r => r.ok).length;
  return <main className="portal-shell">
    <header className="portal-hero"><div><p className="portal-eyebrow">{isProvider ? 'DANI DECLARES PROVIDER' : 'DANI DECLARES'}</p><h1>{ROLE_LABELS[role] || 'DANI DECLARES'}</h1><p>{isProvider ? 'Assignments, dispatch instructions, field checklists, evidence and completion records — connected to the DANI DECLARES fulfillment system.' : 'Requests, services, projects, approvals, documents and financial records — connected to the same DANI DECLARES operating system.'}</p></div><button className="portal-refresh" onClick={load}>Refresh</button></header>
    {error && <div className="portal-alert" role="alert">{error}</div>}{message && <div className="portal-success" role="status">{message}</div>}
    {isProvider ? (isApprovedProvider ? <>
      <Card title="Assignment Queue">{snapshot.assignments?.length ? snapshot.assignments.map(item => <div className="portal-row" key={item.id}><div><strong>{item.job?.job_title || 'Assigned Job'}</strong><small>{item.assignment_status} · {item.job?.location_address || 'Location on file'}</small></div>{item.assignment_status === 'OFFERED' && <div className="portal-actions"><button onClick={() => act('assignment_response', { assignmentId: item.id, decision: 'ACCEPT' })}>Accept</button><button className="secondary" onClick={() => act('assignment_response', { assignmentId: item.id, decision: 'REJECT', reason: 'Provider declined assignment.' })}>Reject</button></div>}</div>) : <Empty />}</Card>
      <Card title="Upcoming Schedule">{snapshot.appointments?.length ? snapshot.appointments.filter(item => item.appointment_status !== 'CANCELLED').map(item => <div className="portal-row" key={item.id}><div><strong>{formatDate(item.starts_at)}</strong><small>{item.appointment_status} · Ends {formatDate(item.ends_at)} · Job {item.job_id}</small></div></div>) : <Empty>No scheduled appointments yet.</Empty>}</Card>
      <Card title="Payout History">{snapshot.payouts?.length ? snapshot.payouts.map(item => <div className="portal-row" key={item.id}><div><strong>${Number(item.amount || 0).toFixed(2)} {item.currency || 'USD'}</strong><small>{item.payout_status} · {item.completed_at ? `Paid ${formatDate(item.completed_at)}` : `Created ${formatDate(item.created_at)}`}</small></div></div>) : <Empty>No payout records are currently attached to this account.</Empty>}</Card>
      <Card title="Field Checklist">{snapshot.tasks?.length ? snapshot.tasks.map(task => <div className="portal-row" key={task.id}><div><strong>{task.task_name}</strong><small>{task.status} · {task.task_type || 'Operational task'}</small></div><div className="portal-actions"><label className="portal-upload">Attach evidence<input type="file" accept="image/*,.pdf" onChange={event => uploadEvidence(task, event.target.files?.[0])} /></label><button onClick={() => act('task_update', { taskId: task.id, status: 'IN_PROGRESS' })}>Start</button><button onClick={() => act('task_update', { taskId: task.id, status: 'COMPLETED', evidenceRef: task.evidence_ref || null })}>Complete</button></div></div>) : <Empty>Assigned jobs will populate your required checklist here.</Empty>}</Card>
      <Card title="Evidence & Completion"><p className="portal-note">Evidence is private and tied to the job/task ledger. Required evidence blocks completion until attached.</p>{snapshot.evidence?.length ? snapshot.evidence.map(item => <div className="portal-row" key={item.id}><div><strong>{item.evidence_type}</strong><small>{item.verification_status} · Job {item.job_id}</small></div></div>) : <Empty>No evidence uploaded yet.</Empty>}</Card>
      <Card title="Application & Documents"><p className="portal-note">Reference only — your approved application. Contact DANI DECLARES to update documents or add capabilities.</p>{documents.length ? documents.map(item => <div className="portal-row" key={item.id}><div><strong>{item.document_type.replaceAll('_', ' ')}</strong><small>{statusLabel(item.verification_status)} · Uploaded {formatDate(item.uploaded_at)}</small></div></div>) : <Empty>No documents on file.</Empty>}<div className="portal-actions" style={{ marginTop: 14 }}><Link className="portal-primary" to="/portal/vendor-onboarding">Manage documents</Link></div></Card>
    </> : <>
      <div className="portal-status-banner"><div><strong>Application status: {statusLabel(application?.application_status)}</strong><p style={{ margin: '6px 0 0', color: '#6d6263' }}>DANI DECLARES reviews every requirement below before your account becomes dispatch-eligible. This is not yet an active provider account — nothing here can be assigned work until it's approved.</p></div><span className="portal-pill">{completeCount}/{requirements.length} complete</span></div>
      <Card title="Requirements">{requirements.map(item => <Requirement key={item.label} {...item} />)}<div className="portal-actions" style={{ marginTop: 14 }}><Link className="portal-primary" to="/portal/vendor-onboarding">Upload documents</Link></div></Card>
      <Card title="Selected Services">{capabilities.length ? capabilities.map(item => <div className="portal-row" key={item.id}><div><strong>{item.capability_description || item.canonical_sku}</strong><small>{statusLabel(item.authorization_status)}</small></div></div>) : <Empty>No services selected.</Empty>}</Card>
      <Card title="Submitted Documents">{documents.length ? documents.map(item => <div className="portal-row" key={item.id}><div><strong>{item.document_type.replaceAll('_', ' ')}</strong><small>{statusLabel(item.verification_status)} · Uploaded {formatDate(item.uploaded_at)}</small></div></div>) : <Empty>No documents uploaded yet.</Empty>}<div className="portal-actions" style={{ marginTop: 14 }}><Link className="portal-primary" to="/portal/vendor-onboarding">Upload documents</Link></div></Card>
    </>) : <>
      <Card title={isCommercial ? 'Commercial Requests & Jobs' : 'My Requests & Jobs'}>{snapshot.requests?.length ? snapshot.requests.map(item => <div className="portal-row" key={item.id}><div><strong>{item.service_needed || item.service_category || 'Service request'}</strong><small>{item.status} · {item.location_address || 'Location on file'}</small></div></div>) : <Empty>No requests are currently attached to this account.</Empty>}{snapshot.jobs?.map(item => <div className="portal-row" key={item.id}><div><strong>{item.job_title}</strong><small>{item.job_status} · {item.location_address || 'Location on file'}</small></div></div>)}</Card>
      <Card title="Invoices & Financial Records"><p className="portal-note">Invoices display finalized financial records. Customer payment remains processed through the configured payment processor; the portal does not collect raw card data.</p>{snapshot.invoices?.length ? snapshot.invoices.map(item => <div className="portal-row" key={item.id}><div><strong>{item.public_reference}</strong><small>{item.invoice_status} · Balance: ${Number(item.balance_due || 0).toFixed(2)}</small></div>{item.stripe_payment_link && item.invoice_status !== 'paid' && <a className="portal-primary" href={item.stripe_payment_link} target="_blank" rel="noreferrer">Pay invoice</a>}</div>) : <Empty>No invoices are currently attached to this workspace.</Empty>}</Card>
      <Card title="Change Orders & Approvals">{snapshot.changes?.length ? snapshot.changes.map(item => <div className="portal-row" key={item.id}><div><strong>{item.reason}</strong><small>{item.status} · {item.resolved_channel || 'Channel controlled'}</small></div>{item.status === 'PENDING_APPROVAL' && <div className="portal-actions"><button onClick={() => act('change_order_decision', { changeOrderId: item.id, decision: 'APPROVED' })}>Approve</button><button className="secondary" onClick={() => act('change_order_decision', { changeOrderId: item.id, decision: 'REJECTED', reason: 'Declined in portal.' })}>Reject</button></div>}</div>) : <Empty>No pending change orders.</Empty>}</Card>
      <Card title="Self-Service & Support"><p>Start a new service request, request a quote, or contact DANI DECLARES support without leaving your account.</p><div className="portal-actions"><Link className="portal-primary" to="/request-service">Request service</Link><Link className="portal-primary" to="/contact">Contact support</Link></div></Card>
    </>}
    <footer className="portal-footer"><strong>Commercial boundary:</strong> DANI DECLARES pricing is resolved upstream and frozen before operational execution. Portals coordinate work; they do not invent or rewrite rates.</footer>
  </main>;
}
