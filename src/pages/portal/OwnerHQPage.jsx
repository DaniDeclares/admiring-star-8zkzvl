/* eslint-disable */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import RequireStaffAuth from '../../components/auth/RequireStaffAuth.jsx';
import { supabase } from '../../lib/supabaseClient.js';
import { capture } from '../../lib/posthogAnalytics.js';
import { OWNER_CONNECTED_SYSTEMS, OWNER_PRIORITY_LINKS } from '../../config/ownerConnectedSystems.js';
import './PortalWorkspacePage.css';

const STAFF_ROLES = new Set(['admin', 'owner', 'staff_admin', 'staff']);

function money(value) {
  return '$' + Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function SystemCard({ system }) {
  const body = (
    <div style={{
      height: '100%',
      border: '1px solid #e6d9c8',
      borderRadius: 16,
      background: '#fff',
      padding: 18,
      boxShadow: '0 8px 28px rgba(0,0,0,.04)',
      textDecoration: 'none',
      color: '#21191a',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.11em', color: '#9a6f36' }}>{system.type}</div>
          <h3 style={{ margin: '5px 0 0', color: '#6b1f2b', fontSize: 18 }}>{system.name}</h3>
        </div>
        <span style={{ borderRadius: 999, padding: '4px 8px', background: system.status === 'PRIMARY' ? '#edf8ef' : '#f5efe6', color: system.status === 'PRIMARY' ? '#2d6a4f' : '#6b5f60', fontSize: 9, fontWeight: 900, whiteSpace: 'nowrap' }}>
          {system.status}
        </span>
      </div>
      <p style={{ margin: '10px 0 15px', fontSize: 12, lineHeight: 1.5, color: '#75696a' }}>{system.description}</p>
      <span style={{ fontSize: 12, fontWeight: 900, color: '#7a263a' }}>{system.cta} {system.external ? '↗' : '→'}</span>
    </div>
  );
  return system.external
    ? <a href={system.href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>{body}</a>
    : <Link to={system.href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>{body}</Link>;
}

function OwnerHq({ session }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const didTrackLoad = useRef(false);

  const load = async ({ background = false } = {}) => {
    if (!background) setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/portal-operations?ownerDashboard=1', {
        headers: { Authorization: 'Bearer ' + session.access_token },
      });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.error || 'Could not load DANI HQ.');
      setData(body);
      if (!didTrackLoad.current) {
        didTrackLoad.current = true;
        capture('owner_hq_loaded', {
          sales_queue_count: (body.salesQueue || []).length,
          research_lead_count: (body.researchLeads || []).length,
          owner_accounting_decision_count: (body.accountingExceptions || []).filter(item => item.requires_owner_decision).length,
          communication_attention_count: (body.communicationAttention || []).length,
          owner_attention_count: (body.ownerAttention || []).length,
        });
      }
    } catch (e) {
      setError(e.message || 'Could not load DANI HQ.');
    } finally {
      if (!background) setLoading(false);
    }
  };

  useEffect(() => { load(); const timer = window.setInterval(() => load({ background: true }), 30000); return () => window.clearInterval(timer); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const metrics = useMemo(() => {
    const requests = data?.requests || [];
    const jobs = data?.jobs || [];
    const providers = data?.providers || [];
    const evidence = data?.evidence || [];
    const payments = data?.payments || [];
    const changes = data?.changes || [];
    const appointments = data?.appointments || [];
    const quotes = data?.estimates || [];
    const ownerAttention = data?.ownerAttention || [];
    const salesQueue = data?.salesQueue || [];
    const researchLeads = data?.researchLeads || [];
    const accountingExceptions = data?.accountingExceptions || [];
    const communicationAttention = data?.communicationAttention || [];
    const agentRuns = data?.agentRuns || [];
    const actionOutbox = data?.actionOutbox || [];
    const researchPrograms = data?.researchPrograms || [];
    const researchWork = data?.researchWork || [];
    const researchEvidence = data?.researchEvidence || [];
    const researchSources = data?.researchSources || [];
    const researchSnapshots = data?.researchSnapshots || [];

    const openRequests = requests.filter(r => !['completed','cancelled','closed','job_created'].includes(String(r.status || '').toLowerCase()));
    const activeJobs = jobs.filter(j => !['COMPLETED','CANCELLED'].includes(String(j.job_status || '').toUpperCase()));
    const atRisk = jobs.filter(j => ['DISPATCH_REVIEW','ASSIGNMENT_OFFERED','REWORK_REQUESTED','BLOCKED'].includes(String(j.job_status || '').toUpperCase()));
    const pendingEvidence = evidence.filter(e => String(e.verification_status || '').toUpperCase() === 'PENDING');
    const failedPayments = payments.filter(p => ['failed','rejected'].includes(String(p.payment_status || p.status || '').toLowerCase()));
    const pendingChanges = changes.filter(c => String(c.status || '').toUpperCase() === 'PENDING_APPROVAL');
    const today = new Date(); today.setHours(0,0,0,0);
    const todayAppointments = appointments.filter(a => {
      const d = new Date(a.starts_at);
      return !Number.isNaN(d.getTime()) && d >= today && d < new Date(today.getTime() + 86400000);
    });
    const quoteValue = quotes.filter(q => !['cancelled','declined','expired','superseded'].includes(String(q.estimate_status || '').toLowerCase())).reduce((sum, q) => sum + Number(q.estimated_total || 0), 0);
    const now = new Date(); now.setHours(23,59,59,999);
    const salesDueRows = salesQueue.filter(item => {
      if (String(item.disposition || '').toUpperCase() === 'PAYMENT_SUCCEEDED') return false;
      if (!item.next_action_date) return false;
      const due = new Date(item.next_action_date + 'T23:59:59');
      return !Number.isNaN(due.getTime()) && due <= now;
    }).sort((a,b) => Number(b.priority_score || 0) - Number(a.priority_score || 0));
    const paidServiceRows = salesQueue.filter(item => String(item.disposition || '').toUpperCase() === 'PAYMENT_SUCCEEDED');
    return {
      openRequests: openRequests.length,
      activeJobs: activeJobs.length,
      providers: providers.length,
      atRisk: atRisk.length + failedPayments.length,
      pendingEvidence: pendingEvidence.length,
      pendingChanges: pendingChanges.length,
      todayAppointments: todayAppointments.length,
      quoteValue,
      ownerAttention: ownerAttention.length,
      salesQueue: salesQueue.length,
      salesDue: salesDueRows.length,
      salesDueRows,
      paidServices: paidServiceRows.length,
      paidServiceRows,
      researchLeads: researchLeads.length,
      ownerAccounting: accountingExceptions.filter(item => item.requires_owner_decision).length,
      accountingExceptions: accountingExceptions.length,
      communicationAttention: communicationAttention.length,
      agentFailures: agentRuns.filter(run => ['FAILED','BLOCKED','PAUSED'].includes(String(run.status || '').toUpperCase())).length,
      outboxExceptions: actionOutbox.filter(item => !['SUCCEEDED','COMPLETED'].includes(String(item.status || '').toUpperCase())).length,
      researchPrograms: researchPrograms.length,
      researchOpen: researchWork.filter(item => !['GREEN'].includes(String(item.status || '').toUpperCase())).length,
      researchReady: researchWork.filter(item => ['EVIDENCE_READY','REVIEW_READY','GREEN'].includes(String(item.status || '').toUpperCase())).length,
      researchConfirmed: researchEvidence.filter(item => String(item.evidence_status || '').toUpperCase() === 'CONFIRMED').length,
      researchSources: researchSources.length,
      researchChanged: researchSnapshots.filter(item => item.changed).length,
      researchFailures: researchSources.filter(item => item.last_error || (item.last_http_status && Number(item.last_http_status) >= 400)).length,
    };
  }, [data]);

  if (loading) return <main className="portal-shell"><p>Loading DANI HQ…</p></main>;
  if (error) return <main className="portal-shell"><div className="portal-alert">{error}</div></main>;

  const role = session.user?.app_metadata?.portal_role || session.user?.app_metadata?.role || 'owner';

  return <main className="portal-shell">
    <header className="portal-hero">
      <div>
        <p className="portal-eyebrow">DANI DECLARES • OWNER HQ</p>
        <h1>DANI HQ</h1>
        <p>
          Your browser-based company control center. DANI-native operations live here; connected platforms remain
          available from the same screen when they are the authority for a specific job.
        </p>
      </div>
      <div className="portal-hero-actions">
        <div className="portal-account-badge">Signed in as <strong>{session.user?.email}</strong></div>
        <div className="portal-actions">
          <button className="portal-refresh" onClick={load}>Refresh</button>
          <Link className="portal-primary" to="/portal/operations">Open Operations</Link>
        </div>
      </div>
    </header>

    <section className="portal-status-banner">
      <div>
        <strong>{role === 'owner' ? 'Owner control' : 'Staff control'} — one DANI front door</strong>
        <p style={{ margin: '6px 0 0', color: '#6d6263' }}>
          You do not need a separate desktop application to reach the connected systems below. This portal is the DANI
          launchpad; the linked systems stay the authority where DANI has not replaced them.
        </p>
      </div>
      <span className="portal-pill">Live DANI data · refreshes quietly every 30s</span>
    </section>

    {data?.morningBrief && <section className="portal-card" id="morning-brief" style={{ border: data.morningBrief.company_status === 'RED' ? '2px solid #9b3346' : undefined }}>
      <div>
        <p className="portal-eyebrow">Morning Brief · verified state only</p>
        <h2 style={{ margin: '5px 0 0' }}>DANI worked while you were away</h2>
        <p className="portal-note" style={{ marginTop: 8 }}>{data.morningBrief.headline}</p>
      </div>
      <div className="portal-summary-grid" style={{ marginTop: 14 }}>
        <a className="portal-summary-tile" href="#company-health"><strong>{data.morningBrief.company_status}</strong><span>Company state</span></a>
        <a className="portal-summary-tile" href="#owner-attention"><strong>{data.morningBrief.owner_attention?.open_count ?? 0}</strong><span>Needs Danielle</span></a>
        <a className="portal-summary-tile" href="#company-health"><strong>{data.morningBrief.overnight_verified?.research_queued ?? 0}</strong><span>Research queued</span></a>
        <a className="portal-summary-tile" href="#company-health"><strong>{data.morningBrief.overnight_verified?.support_ready ?? 0}/{data.morningBrief.overnight_verified?.services_total ?? 0}</strong><span>Support-ready services</span></a>
        <a className="portal-summary-tile" href="#software-platform"><strong>{data.morningBrief.software_platform?.status || 'UNKNOWN'}</strong><span>Software & platform</span></a>
        <Link className="portal-summary-tile" to="/portal/acquisition"><strong>{data.morningBrief.revenue_sales?.sales_queue ?? metrics.salesQueue}</strong><span>Sales queue</span></Link>
      </div>
      <div style={{ marginTop: 14 }} className="portal-row">
        <div><strong>Baseline evidence</strong><small>Soak receipt {data.morningBrief.baseline_soak_receipt_id || data.morningBrief.overnight_verified?.latest_soak_receipt || 'not yet captured'}</small><small>Generated {data.morningBrief.generated_at ? new Date(data.morningBrief.generated_at).toLocaleString() : '—'} · Tester evidence does not imply production mutation.</small></div>
        <span className="portal-pill">AUDITABLE</span>
      </div>
    </section>}

    <section className="portal-card" id="company-health">
      <div>
        <p className="portal-eyebrow">Company controller</p>
        <h2 style={{ margin: '5px 0 0' }}>Business + software health</h2>
        <p className="portal-note" style={{ marginTop: 8 }}>GREEN is never inferred. RED, YELLOW and UNKNOWN stay visible until their evidence gates are actually satisfied.</p>
      </div>
      <div style={{ marginTop: 14 }}>
        {(data?.companyDomains || []).map(item => <div className="portal-row" key={item.domain} id={item.domain === 'SOFTWARE_PLATFORM' ? 'software-platform' : undefined}>
          <div><strong>{item.domain.replaceAll('_',' ')}</strong><small>{item.summary}</small><small>Next: {item.next_autonomous_action || 'Await verified evidence'}</small></div>
          <span className="portal-pill">{item.status}</span>
        </div>)}
      </div>
    </section>

    <div className="portal-summary-grid">
      <a className="portal-summary-tile" href="#owner-attention"><strong>{metrics.ownerAttention}</strong><span>Needs Danielle</span></a>
      <Link className="portal-summary-tile" to="/portal/acquisition"><strong>{metrics.salesDue}</strong><span>Sales due / overdue</span></Link>
      <Link className="portal-summary-tile" to="/portal/operations"><strong>{metrics.activeJobs}</strong><span>Active jobs</span></Link>
      <Link className="portal-summary-tile" to="/portal/operations"><strong>{metrics.paidServices}</strong><span>Paid services to fulfill</span></Link>
      <a className="portal-summary-tile" href="#owner-accounting"><strong>{metrics.ownerAccounting}</strong><span>Money decisions</span></a>
      <a className="portal-summary-tile" href="#owner-comms"><strong>{metrics.communicationAttention}</strong><span>Replies needing action</span></a>
      <Link className="portal-summary-tile" to="/portal/operations"><strong>{metrics.atRisk}</strong><span>Operational exceptions</span></Link>
      <Link className="portal-summary-tile" to="/portal/quotes"><strong>{money(metrics.quoteValue)}</strong><span>Open quote value</span></Link>
    </div>

    <section className="portal-card" id="owner-attention" style={{ border: (data?.ownerAttention || []).some(item => item.priority === 'URGENT') ? '2px solid #9b3346' : undefined }}>
      <div>
        <p className="portal-eyebrow">Needs your attention</p>
        <h2 style={{ margin: '5px 0 0' }}>Owner Attention Queue</h2>
        <p className="portal-note" style={{ marginTop: 8 }}>Urgent inbound communications and governed exceptions surface here instead of staying buried in external systems.</p>
      </div>
      <div style={{ marginTop: 14 }}>
        {(data?.ownerAttention || []).length ? (data.ownerAttention || []).map(item => <div className="portal-row" key={item.id}>
          <div>
            <strong>{item.priority === 'URGENT' ? '🚨 ' : ''}{item.reason}</strong>
            <small>{item.domain} · {item.priority} · {item.metadata?.subject || item.source_table} · {item.created_at ? new Date(item.created_at).toLocaleString() : ''}</small>
            {item.metadata?.sender_address && <small>From: {item.metadata.sender_address}</small>}
            {item.recommended_action && <small>Next: {item.recommended_action}</small>}
          </div>
          <span className="portal-pill">{item.priority}</span>
        </div>) : <div style={{ padding: 14, borderRadius: 12, background: '#f2f8f4', color: '#2d6a4f' }}>No open owner-attention items.</div>}
      </div>
    </section>

    <section className="portal-card" id="owner-revenue">
      <div>
        <p className="portal-eyebrow">Revenue control</p>
        <h2 style={{ margin: '5px 0 0' }}>Sales Due Now</h2>
        <p className="portal-note" style={{ marginTop: 8 }}>Only dated sales actions that are due or overdue appear here. The full CRM stays in the sales workspace.</p>
      </div>
      <div className="portal-summary-grid" style={{ marginTop: 14 }}>
        <Link className="portal-summary-tile" to="/portal/acquisition"><strong>{metrics.salesDue}</strong><span>Due / overdue actions</span></Link>
        <Link className="portal-summary-tile" to="/portal/acquisition"><strong>{metrics.salesQueue}</strong><span>Total CRM records</span></Link>
        <Link className="portal-summary-tile" to="/portal/acquisition"><strong>{metrics.researchLeads}</strong><span>Research-only leads</span></Link>
      </div>
      <div style={{ marginTop: 14 }}>
        {(metrics.salesDueRows || []).slice(0, 8).map(item => <div className="portal-row" key={item.id}>
          <div><strong>{item.company_name || item.contact_name || 'Sales lead'}</strong><small>{item.contact_name || 'Contact pending'} · Priority {item.priority_score ?? '—'} · {item.disposition || 'UNSET'}</small><small>Next: {item.next_action || 'Follow up'} · due {item.next_action_date}</small></div>
          <span className="portal-pill">DUE</span>
        </div>)}
        {!metrics.salesDue && <div style={{ padding: 14, borderRadius: 12, background: '#f2f8f4', color: '#2d6a4f' }}>No sales actions are due.</div>}
      </div>
    </section>

    <section className="portal-card" id="research-engine">
      <div>
        <p className="portal-eyebrow">Research → green engine</p>
        <h2 style={{ margin: '5px 0 0' }}>Protection & Benefits Research</h2>
        <p className="portal-note" style={{ marginTop: 8 }}>Evidence is persisted here before anything regulated can reach quoting, checkout or customer-facing sales. Historical contracts stay labeled historical until current terms are verified.</p>
      </div>
      <div className="portal-summary-grid" style={{ marginTop: 14 }}>
        <a className="portal-summary-tile" href="#research-engine"><strong>{metrics.researchOpen}</strong><span>Open research gates</span></a>
        <a className="portal-summary-tile" href="#research-engine"><strong>{metrics.researchReady}</strong><span>Evidence / review ready</span></a>
        <a className="portal-summary-tile" href="#research-engine"><strong>{metrics.researchConfirmed}</strong><span>Confirmed evidence claims</span></a>
        <a className="portal-summary-tile" href="#research-engine"><strong>{metrics.researchSources}</strong><span>Watched authority sources</span></a>
        <a className="portal-summary-tile" href="#research-engine"><strong>{metrics.researchChanged}</strong><span>Changed source snapshots</span></a>
        <a className="portal-summary-tile" href="#research-engine"><strong>{metrics.researchFailures}</strong><span>Source check failures</span></a>
      </div>
      <div style={{ marginTop: 14 }}>
        {(data?.researchPrograms || []).map(program => <div className="portal-row" key={program.program_key}>
          <div><strong>{program.program_name}</strong><small>{program.domain} · {program.objective}</small><small>Green rule: {program.green_rule}</small></div>
          <span className="portal-pill">{program.release_blocked ? 'RELEASE BLOCKED' : program.status}</span>
        </div>)}
        {(data?.researchWork || []).slice(0, 12).map(item => <div className="portal-row" key={item.id}>
          <div><strong>{item.question}</strong><small>{item.priority} · {item.status} · {item.metadata?.partner || item.metadata?.jurisdiction || item.metadata?.gate || 'DANI'}</small><small>Next: {item.next_action || 'Continue evidence collection'}</small></div>
          <span className="portal-pill">{item.status}</span>
        </div>)}
        <div style={{ marginTop: 14 }}>
          <p className="portal-eyebrow">Latest source checks</p>
          {(data?.researchSources || []).slice(0, 10).map(source => <div className="portal-row" key={source.id}>
            <div>
              <strong>{source.source_title}</strong>
              <small>{source.authority_level} · {source.temporal_class} · HTTP {source.last_http_status ?? '—'}</small>
              <small>{source.last_checked_at ? 'Checked ' + new Date(source.last_checked_at).toLocaleString() : 'Waiting for first scheduled check'}{source.last_error ? ' · ' + source.last_error : ''}</small>
            </div>
            <span className="portal-pill">{source.last_error ? 'ERROR' : (source.last_changed_at ? 'WATCHING' : 'ACTIVE')}</span>
          </div>)}
        </div>
      </div>
    </section>

    <section className="portal-card" id="owner-accounting" style={{ border: metrics.ownerAccounting ? '2px solid #9b3346' : undefined }}>
      <div>
        <p className="portal-eyebrow">Money & accounting</p>
        <h2 style={{ margin: '5px 0 0' }}>Owner Decisions + Accounting Airlock</h2>
        <p className="portal-note" style={{ marginTop: 8 }}>Owner-required classifications stay with you; accounting-lane exceptions stay visible without giving the accounting workspace owner authority.</p>
      </div>
      <div className="portal-summary-grid" style={{ marginTop: 14 }}>
        <a className="portal-summary-tile" href="#owner-accounting"><strong>{metrics.ownerAccounting}</strong><span>Require your decision</span></a>
        <a className="portal-summary-tile" href="#owner-accounting"><strong>{metrics.accountingExceptions}</strong><span>Total open accounting exceptions</span></a>
      </div>
      <div style={{ marginTop: 14 }}>
        {(data?.accountingExceptions || []).map(item => <div className="portal-row" key={item.id}>
          <div>
            <strong>{item.requires_owner_decision ? '🚨 ' : ''}{item.exception_type}</strong>
            <small>{item.assigned_lane} · {item.status} · {item.source_system || 'DANI'}</small>
            <small>{item.description}</small>
          </div>
          <span className="portal-pill">{item.requires_owner_decision ? 'OWNER' : 'ACCOUNTING'}</span>
        </div>)}
      </div>
    </section>

    <section className="portal-card" id="owner-comms">
      <div>
        <p className="portal-eyebrow">Communications + runtime</p>
        <h2 style={{ margin: '5px 0 0' }}>Inbox Attention & System Health</h2>
        <p className="portal-note" style={{ marginTop: 8 }}>Inbound business replies and governed automation exceptions surface here instead of being left inside external apps.</p>
      </div>
      <div className="portal-summary-grid" style={{ marginTop: 14 }}>
        <a className="portal-summary-tile" href="#owner-comms"><strong>{metrics.communicationAttention}</strong><span>Inbound communications flagged</span></a>
        <a className="portal-summary-tile" href="#owner-comms"><strong>{metrics.agentFailures}</strong><span>Agent runs failed / paused</span></a>
        <a className="portal-summary-tile" href="#owner-comms"><strong>{metrics.outboxExceptions}</strong><span>External actions not complete</span></a>
      </div>
      <div style={{ marginTop: 14 }}>
        {(data?.communicationAttention || []).slice(0, 8).map(item => <div className="portal-row" key={item.id}>
          <div>
            <strong>{item.priority === 'URGENT' ? '🚨 ' : ''}{item.subject || 'Inbound business communication'}</strong>
            <small>{item.sender_address || 'Unknown sender'} · {item.relationship_type || 'UNMATCHED'} · {item.priority}</small>
            {item.attention_reason && <small>{item.attention_reason}</small>}
          </div>
          <span className="portal-pill">{item.priority}</span>
        </div>)}
        {!metrics.communicationAttention && !metrics.agentFailures && !metrics.outboxExceptions && <div style={{ padding: 14, borderRadius: 12, background: '#f2f8f4', color: '#2d6a4f' }}>Communications and governed runtime queues are clear.</div>}
      </div>
    </section>

    <section className="portal-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <p className="portal-eyebrow">Your software layer</p>
          <h2 style={{ margin: '5px 0 0' }}>DANI-first, connected—not app-dependent.</h2>
          <p className="portal-note" style={{ marginTop: 10 }}>
            The goal is not to recreate every outside platform. DANI HQ gives you one place to see the business state,
            jump to the authoritative external system, and eventually add deeper API-based sync where credentials and
            permissions support it.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(245px,1fr))', gap: 12 }}>
        {OWNER_CONNECTED_SYSTEMS.map(system => <SystemCard key={system.key} system={system} />)}
      </div>
    </section>

    <section className="portal-card">
      <div>
        <p className="portal-eyebrow">Owner priorities</p>
        <h2 style={{ margin: '5px 0 0' }}>Everything important starts here.</h2>
      </div>
      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 10 }}>
        {OWNER_PRIORITY_LINKS.map(item => {
          const inner = <div style={{ border: '1px solid #e6d9c8', background: '#faf6ef', borderRadius: 13, padding: 14, height: '100%' }}>
            <strong style={{ color: '#6b1f2b' }}>{item.label}</strong>
            <p style={{ margin: '6px 0 0', color: '#75696a', fontSize: 12, lineHeight: 1.5 }}>{item.description}</p>
            <span style={{ display: 'inline-block', marginTop: 10, color: '#7a263a', fontWeight: 900, fontSize: 12 }}>Open →</span>
          </div>;
          return item.external
            ? <a key={item.label} href={item.href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>{inner}</a>
            : <Link key={item.label} to={item.href} style={{ textDecoration: 'none' }}>{inner}</Link>;
        })}
      </div>
    </section>

    <section className="portal-card">
      <p className="portal-eyebrow">Recommended operating rhythm</p>
      <h2 style={{ margin: '5px 0 0' }}>Use DANI HQ as the starting screen.</h2>
      <div className="portal-row"><div><strong>1. Check DANI HQ</strong><small>See what needs attention across sales, operations, field work, customers and cash.</small></div><span className="portal-pill">DANI</span></div>
      <div className="portal-row"><div><strong>2. Work the DANI-native transaction</strong><small>Requests, scope, quotes, jobs, providers, evidence and payment stay under DANI control.</small></div><span className="portal-pill">SYSTEM OF RECORD</span></div>
      <div className="portal-row"><div><strong>3. Open external systems only where their authority matters</strong><small>Asana for execution tasks, Notion for controlled documentation, DANI Financial Operations for accounting review, Stripe for payment authority, and so on.</small></div><span className="portal-pill">CONNECTED</span></div>
      <div className="portal-row"><div><strong>4. Add API synchronization in controlled phases</strong><small>True in-portal synchronization requires the relevant external API credentials/permissions in DANI's server environment. The architecture is ready for that phase without forcing a redesign.</small></div><span className="portal-pill">PHASE 2</span></div>
    </section>

    <footer className="portal-footer">
      <strong>Authority rule:</strong> DANI owns customer, service, commercial, operational, fulfillment and release state. Connected systems remain authoritative for their own domains until an explicit integration replaces or synchronizes that authority.
    </footer>
  </main>;
}

function OwnerHQLoader() {
  const [session, setSession] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data, error: authError }) => {
      if (!active) return;
      if (authError || !data.session) setError('Staff session required.');
      else setSession(data.session);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);
  if (loading) return <main className="portal-shell"><p>Checking owner access…</p></main>;
  if (error || !session) return <main className="portal-shell"><div className="portal-alert">{error || 'Staff session required.'}</div></main>;
  return <OwnerHq session={session} />;
}

export default function OwnerHQPage() {
  return <RequireStaffAuth><OwnerHQLoader /></RequireStaffAuth>;
}
