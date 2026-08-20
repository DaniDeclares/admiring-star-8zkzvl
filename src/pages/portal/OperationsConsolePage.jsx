import React, { useEffect, useMemo, useState } from 'react';
import RequireStaffAuth from '../../components/auth/RequireStaffAuth.jsx';
import { supabase } from '../../lib/supabaseClient.js';
import './OperationsConsolePage.css';

const QUEUES = [
  { key: 'requests', label: 'Intake & CRM', description: 'Route new B2C, B2B and B2G requests.' },
  { key: 'jobs', label: 'Jobs & Dispatch', description: 'Run priced work through dispatch and field execution.' },
  { key: 'schedule', label: 'Schedule', description: 'Appointments, provider availability and territory.' },
  { key: 'providers', label: 'Provider Network', description: 'Capabilities, coverage and assignment readiness.' },
  { key: 'changes', label: 'Change Orders', description: 'Approve isolated commercial deltas without touching the base estimate.' },
  { key: 'evidence', label: 'Evidence & QA', description: 'Review field evidence and completion gates.' },
  { key: 'payments', label: 'Payments & Accounting', description: 'Reconcile payment events against frozen commercial records.' },
];
const CHANNELS = ['B2C', 'B2B-APT', 'B2B-RE', 'B2B', 'B2B2C', 'B2G'];
function Stat({ label, value, detail }) { return <div className="ops-stat"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>; }

function OperationsConsole() {
  const [active, setActive] = useState('requests');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    const { data: auth } = await supabase.auth.getSession();
    if (!auth.session) { setError('Staff session required.'); setLoading(false); return; }
    const response = await fetch('/api/portal-operations', { headers: { Authorization: `Bearer ${auth.session.access_token}` } });
    const body = await response.json();
    if (!response.ok || !body.success) setError(body.error || 'Operations data could not be loaded.'); else setData(body);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const act = async (action, payload) => {
    setMessage(''); setError('');
    const { data: auth } = await supabase.auth.getSession();
    if (!auth.session) return setError('Staff session required.');
    const response = await fetch('/api/portal-operations', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.session.access_token}` }, body: JSON.stringify({ action, ...payload }) });
    const body = await response.json();
    if (!response.ok || !body.success) setError(body.error || 'Operation failed.'); else { setMessage('Operation completed.'); await load(); }
  };

  const counts = { requests: data?.requests?.length || 0, jobs: data?.jobs?.length || 0, schedule: data?.appointments?.length || 0, providers: data?.providers?.length || 0, changes: data?.changes?.length || 0, evidence: data?.evidence?.length || 0, payments: data?.payments?.length || 0 };
  const channelCounts = CHANNELS.reduce((acc, channel) => ({ ...acc, [channel]: (data?.requests || []).filter(row => row.channel_type === channel || row.property_details?.operationsRouting?.channelType === channel).length }), {});
  const activeQueue = useMemo(() => QUEUES.find(item => item.key === active) || QUEUES[0], [active]);

  return <main className="ops-shell">
    <header className="ops-hero"><div><p className="ops-eyebrow">DANI DECLARES OPERATING SYSTEM</p><h1>Operations Control Center</h1><p>One command layer for intake, dispatch, scheduling, field execution, evidence, approvals and accounting.</p></div><div className="ops-boundary"><strong>COMMERCIAL AUTHORITY</strong><span>Canonical pricing → frozen estimate → operations</span><small>Operational modules never recalculate catalog pricing.</small></div></header>
    {error && <div className="ops-alert">{error}</div>}{message && <div className="ops-alert" style={{background:'#edf8ef',color:'#276b35'}}>✓ {message}</div>}
    <section className="ops-stats"><Stat label="Requests" value={loading ? '…' : counts.requests} detail="Intake / CRM" /><Stat label="Jobs" value={loading ? '…' : counts.jobs} detail="Execution ledger" /><Stat label="Appointments" value={loading ? '…' : counts.schedule} detail="Scheduling" /><Stat label="Providers" value={loading ? '…' : counts.providers} detail="Field network" /><Stat label="Change Orders" value={loading ? '…' : counts.changes} detail="Commercial deltas" /><Stat label="Evidence" value={loading ? '…' : counts.evidence} detail="Field proof" /><Stat label="Payments" value={loading ? '…' : counts.payments} detail="Accounting events" /></section>
    <section className="ops-grid"><aside className="ops-nav"><div className="ops-nav-title">WORKFLOWS</div>{QUEUES.map(item => <button key={item.key} className={active === item.key ? 'active' : ''} onClick={() => setActive(item.key)}><span>{item.label}</span><small>{counts[item.key]}</small></button>)}</aside>
      <section className="ops-workspace"><div className="ops-section-head"><div><p className="ops-eyebrow">LIVE OPERATIONAL LAYER</p><h2>{activeQueue.label}</h2><p>{activeQueue.description}</p></div><span className="ops-live">● STAFF ACCESS</span></div>
        {active === 'requests' && <><div className="ops-card"><h3>Channel routing</h3><div className="channel-grid">{CHANNELS.map(channel => <div key={channel}><strong>{channel}</strong><span>{channelCounts[channel]}</span></div>)}</div></div><div className="ops-card"><h3>Recent intake</h3>{(data?.requests || []).slice(0,8).map(row => <div className="ops-row" key={row.id}><div><strong>{row.service_needed || row.service_category || 'Service request'}</strong><small>{row.status} · {row.location_address || 'Location on file'}</small></div></div>)}</div></>}
        {active === 'jobs' && <div className="ops-card"><h3>Dispatch queue</h3>{(data?.jobs || []).slice(0,12).map(job => <div className="ops-row" key={job.id}><div><strong>{job.job_title}</strong><small>{job.job_status} · {job.location_address || 'Location on file'}</small></div><div className="ops-actions">{job.job_status === 'DISPATCH_REVIEW' && data.providers?.length > 0 && <button onClick={() => act('dispatch_offer', { jobId: job.id, providerId: data.providers[0].id, adminNotes: 'Initial admin dispatch offer.' })}>Offer to {data.providers[0].first_name}</button>}</div></div>)}</div>}
        {active === 'schedule' && <div className="ops-card"><h3>Appointment ledger</h3>{(data?.appointments || []).slice(0,15).map(item => <div className="ops-row" key={item.id}><div><strong>{new Date(item.starts_at).toLocaleString()}</strong><small>{item.appointment_status} · Provider {item.provider_id}</small></div></div>)}</div>}
        {active === 'providers' && <div className="ops-card"><h3>Provider network</h3>{(data?.providers || []).map(provider => <div className="ops-row" key={provider.id}><div><strong>{provider.first_name} {provider.last_name}</strong><small>{provider.dd_provider_organizations?.name || 'Provider organization'} · {provider.is_active ? 'ACTIVE' : 'INACTIVE'}</small></div></div>)}</div>}
        {active === 'changes' && <div className="ops-card"><h3>Change-order approval queue</h3>{(data?.changes || []).filter(item => item.status === 'PENDING_APPROVAL').map(item => <div className="ops-row" key={item.id}><div><strong>{item.reason}</strong><small>{item.resolved_channel || 'Channel-controlled'} · Delta snapshot ready</small></div><div className="ops-actions"><button onClick={() => act('change_order_decision', { changeOrderId: item.id, decision: 'APPROVED' })}>Approve</button><button className="secondary" onClick={() => act('change_order_decision', { changeOrderId: item.id, decision: 'REJECTED', reason: 'Rejected by staff review.' })}>Reject</button></div></div>)}{!(data?.changes || []).some(item => item.status === 'PENDING_APPROVAL') && <p className="ops-note">No pending change orders.</p>}</div>}
        {active === 'evidence' && <div className="ops-card"><h3>Evidence & QA</h3>{(data?.evidence || []).slice(0,15).map(item => <div className="ops-row" key={item.id}><div><strong>{item.evidence_type}</strong><small>{item.verification_status} · Job {item.job_id}</small></div><div className="ops-actions">{item.verification_status === 'PENDING' && <><button onClick={() => act('evidence_verify', { evidenceId: item.id, decision: 'VERIFIED' })}>Verify</button><button className="secondary" onClick={() => act('evidence_verify', { evidenceId: item.id, decision: 'REJECTED' })}>Reject</button></>}</div></div>)}{!data?.evidence?.length && <p className="ops-note">No evidence waiting for review.</p>}</div>}
        {active === 'payments' && <div className="ops-card"><h3>Payment reconciliation ledger</h3><p className="ops-note">Stripe webhooks reconcile payment reality against frozen commercial records. This console displays the ledger; it does not calculate prices.</p>{(data?.payments || []).slice(0,15).map(item => <div className="ops-row" key={item.id}><div><strong>{item.event_type}</strong><small>{item.payment_status} · ${Number(item.amount_received || 0).toFixed(2)} {item.currency}</small></div></div>)}</div>}
      </section>
    </section>
    <footer className="ops-footer"><strong>Built for DANI DECLARES.</strong> Jobber-style CRM + Housecall Pro-style field operations + Thumbtack-style intake + Jibble-style workforce accountability, all governed by the DANI DECLARES commercial authority.</footer>
  </main>;
}
export default function OperationsConsolePage() { return <RequireStaffAuth><OperationsConsole /></RequireStaffAuth>; }
