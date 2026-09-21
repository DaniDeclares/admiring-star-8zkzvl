import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import RequireStaffAuth from '../../components/auth/RequireStaffAuth.jsx';
import { supabase } from '../../lib/supabaseClient.js';
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

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/portal-operations', {
        headers: { Authorization: 'Bearer ' + session.access_token },
      });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.error || 'Could not load DANI HQ.');
      setData(body);
    } catch (e) {
      setError(e.message || 'Could not load DANI HQ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const metrics = useMemo(() => {
    const requests = data?.requests || [];
    const jobs = data?.jobs || [];
    const providers = data?.providers || [];
    const evidence = data?.evidence || [];
    const payments = data?.payments || [];
    const changes = data?.changes || [];
    const appointments = data?.appointments || [];
    const quotes = data?.estimates || [];

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
    const quoteValue = quotes.reduce((sum, q) => sum + Number(q.estimated_total || 0), 0);
    return {
      openRequests: openRequests.length,
      activeJobs: activeJobs.length,
      providers: providers.length,
      atRisk: atRisk.length + failedPayments.length,
      pendingEvidence: pendingEvidence.length,
      pendingChanges: pendingChanges.length,
      todayAppointments: todayAppointments.length,
      quoteValue,
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
      <span className="portal-pill">Live from DANI data</span>
    </section>

    <div className="portal-summary-grid">
      <Link className="portal-summary-tile" to="/portal/operations"><strong>{metrics.openRequests}</strong><span>Open requests</span></Link>
      <Link className="portal-summary-tile" to="/portal/operations"><strong>{metrics.activeJobs}</strong><span>Active jobs</span></Link>
      <Link className="portal-summary-tile" to="/portal/provider-approval"><strong>{metrics.providers}</strong><span>Provider records</span></Link>
      <Link className="portal-summary-tile" to="/portal/operations"><strong>{metrics.todayAppointments}</strong><span>Appointments today</span></Link>
      <Link className="portal-summary-tile" to="/portal/evidence"><strong>{metrics.pendingEvidence}</strong><span>Evidence pending QA</span></Link>
      <Link className="portal-summary-tile" to="/portal/operations"><strong>{metrics.atRisk}</strong><span>At-risk / payment exceptions</span></Link>
      <Link className="portal-summary-tile" to="/portal/operations"><strong>{metrics.pendingChanges}</strong><span>Change orders pending</span></Link>
      <Link className="portal-summary-tile" to="/portal/quotes"><strong>{money(metrics.quoteValue)}</strong><span>Quote value currently in DANI</span></Link>
    </div>

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
      <div className="portal-row"><div><strong>3. Open external systems only where their authority matters</strong><small>Asana for execution tasks, Notion for controlled documentation, QuickBooks for accounting, Stripe for payment authority, and so on.</small></div><span className="portal-pill">CONNECTED</span></div>
      <div className="portal-row"><div><strong>4. Add API synchronization in controlled phases</strong><small>True in-portal synchronization requires the relevant external API credentials/permissions in DANI's server environment. The architecture is ready for that phase without forcing a redesign.</small></div><span className="portal-pill">PHASE 2</span></div>
    </section>

    <footer className="portal-footer">
      <strong>Authority rule:</strong> DANI owns customer, service, commercial, operational, fulfillment and release state. Connected systems remain authoritative for their own domains until an explicit integration replaces or synchronizes that authority.
    </footer>
  </main>;
}

export default function OwnerHQPage() {
  return <RequireStaffAuth><OwnerHq session={null} /></RequireStaffAuth>;
}
