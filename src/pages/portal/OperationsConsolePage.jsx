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

const TABLES = {
  requests: 'service_requests',
  jobs: 'dd_jobs',
  schedule: 'dd_job_appointments',
  providers: 'dd_providers',
  changes: 'dd_change_orders',
  evidence: 'dd_job_evidence',
  payments: 'dd_payment_events',
};

const CHANNELS = ['B2C', 'B2B-APT', 'B2B-RE', 'B2B', 'B2B2C', 'B2G'];

function Stat({ label, value, detail }) {
  return <div className="ops-stat"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function OperationsConsole() {
  const [active, setActive] = useState('requests');
  const [counts, setCounts] = useState({});
  const [channelCounts, setChannelCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      const entries = await Promise.all(Object.entries(TABLES).map(async ([key, table]) => {
        const { count, error: tableError } = await supabase.from(table).select('*', { count: 'exact', head: true });
        return [key, tableError ? null : (count || 0)];
      }));
      if (!mounted) return;
      const next = Object.fromEntries(entries);
      setCounts(next);
      if (entries.some(([, value]) => value === null)) setError('Some operational tables are not readable by this staff session. The dashboard is showing available data only.');

      const { data, error: channelError } = await supabase
        .from('service_requests')
        .select('channel_type')
        .not('channel_type', 'is', null)
        .limit(1000);
      if (!mounted) return;
      if (!channelError) {
        const grouped = CHANNELS.reduce((acc, channel) => ({ ...acc, [channel]: 0 }), {});
        (data || []).forEach(row => { if (grouped[row.channel_type] !== undefined) grouped[row.channel_type] += 1; });
        setChannelCounts(grouped);
      }
      setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, []);

  const activeQueue = useMemo(() => QUEUES.find(item => item.key === active), [active]);

  return (
    <main className="ops-shell">
      <header className="ops-hero">
        <div>
          <p className="ops-eyebrow">DANI DECLARES OPERATING SYSTEM</p>
          <h1>Operations Control Center</h1>
          <p>One command layer for intake, pricing handoff, dispatch, scheduling, field execution, evidence, change orders and accounting.</p>
        </div>
        <div className="ops-boundary">
          <strong>COMMERCIAL AUTHORITY</strong>
          <span>Canonical pricing → frozen estimate → operations</span>
          <small>Field, scheduling and accounting modules do not recalculate catalog pricing.</small>
        </div>
      </header>

      {error && <div className="ops-alert">{error}</div>}

      <section className="ops-stats">
        <Stat label="Requests" value={loading ? '…' : counts.requests ?? '—'} detail="Intake / CRM" />
        <Stat label="Jobs" value={loading ? '…' : counts.jobs ?? '—'} detail="Execution ledger" />
        <Stat label="Appointments" value={loading ? '…' : counts.schedule ?? '—'} detail="Scheduling ledger" />
        <Stat label="Providers" value={loading ? '…' : counts.providers ?? '—'} detail="Field network" />
        <Stat label="Change Orders" value={loading ? '…' : counts.changes ?? '—'} detail="Commercial deltas" />
        <Stat label="Evidence" value={loading ? '…' : counts.evidence ?? '—'} detail="Field proof" />
        <Stat label="Payment Events" value={loading ? '…' : counts.payments ?? '—'} detail="Accounting events" />
      </section>

      <section className="ops-grid">
        <aside className="ops-nav">
          <div className="ops-nav-title">WORKFLOWS</div>
          {QUEUES.map(item => (
            <button key={item.key} className={active === item.key ? 'active' : ''} onClick={() => setActive(item.key)}>
              <span>{item.label}</span><small>{counts[item.key] ?? '—'}</small>
            </button>
          ))}
        </aside>

        <section className="ops-workspace">
          <div className="ops-section-head">
            <div><p className="ops-eyebrow">LIVE OPERATIONAL LAYER</p><h2>{activeQueue.label}</h2><p>{activeQueue.description}</p></div>
            <span className="ops-live">● STAFF ACCESS</span>
          </div>

          {active === 'requests' && <>
            <div className="ops-card"><h3>Channel routing</h3><p>Every request must carry an explicit commercial channel before it can enter downstream workflows.</p><div className="channel-grid">{CHANNELS.map(channel => <div key={channel}><strong>{channel}</strong><span>{channelCounts[channel] ?? 0}</span></div>)}</div></div>
            <div className="ops-card"><h3>Workflow contract</h3><div className="flow"><span>Intake</span><b>→</b><span>Channel</span><b>→</b><span>Pricing Resolver</span><b>→</b><span>Frozen Estimate</span><b>→</b><span>Workflow</span></div></div>
          </>}

          {active === 'jobs' && <div className="ops-card"><h3>Field-service lifecycle</h3><div className="flow vertical"><span>CREATED</span><b>↓</b><span>DISPATCH REVIEW</span><b>↓</b><span>ASSIGNMENT OFFERED</span><b>↓</b><span>ACCEPTED → SCHEDULED</span><b>↓</b><span>IN PROGRESS → TASKS → EVIDENCE</span><b>↓</b><span>VERIFIED → COMPLETED</span></div><p className="ops-note">Job execution consumes the frozen commercial baseline. Scope changes become separate change orders.</p></div>}

          {active === 'schedule' && <div className="ops-card"><h3>Scheduling controls</h3><div className="cap-grid"><span>Provider availability</span><span>Time-conflict checks</span><span>Territory coverage</span><span>Appointment states</span><span>Dispatch audit events</span><span>Cancellation tracking</span></div></div>}

          {active === 'providers' && <div className="ops-card"><h3>Provider network</h3><div className="cap-grid"><span>Organization</span><span>Authorized capabilities</span><span>Territory coverage</span><span>Active/inactive status</span><span>Assignment offers</span><span>Accept / reject handshake</span></div></div>}

          {active === 'changes' && <div className="ops-card"><h3>Scope-change firewall</h3><p>Providers cannot mutate the original commercial contract. A field issue becomes a separate priced delta, then waits for the correct approval gate.</p><div className="flow"><span>FIELD ISSUE</span><b>→</b><span>DRAFT DELTA</span><b>→</b><span>RESOLVER</span><b>→</b><span>APPROVAL</span><b>→</b><span>ADD TASKS</span></div></div>}

          {active === 'evidence' && <div className="ops-card"><h3>Completion verification</h3><div className="cap-grid"><span>Before / after photos</span><span>Compliance documents</span><span>Task-level evidence</span><span>Provider notes</span><span>B2C auto verification</span><span>B2B / B2G supervisor gate</span></div></div>}

          {active === 'payments' && <div className="ops-card"><h3>Financial handshake</h3><p>Stripe events confirm payment reality; they do not become a second pricing engine.</p><div className="flow vertical"><span>FROZEN ESTIMATE</span><b>+</b><span>APPROVED CHANGE ORDERS</span><b>−</b><span>CAPTURED DEPOSITS</span><b>→</b><span>ACCOUNTING BALANCE</span></div></div>}
        </section>
      </section>

      <footer className="ops-footer"><strong>Built for DANI DECLARES.</strong> Jobber-style client operations + Housecall Pro-style field service + Thumbtack-style intake/lead routing + Jibble-style workforce accountability — under one DANI DECLARES commercial authority.</footer>
    </main>
  );
}

export default function OperationsConsolePage() { return <RequireStaffAuth><OperationsConsole /></RequireStaffAuth>; }
