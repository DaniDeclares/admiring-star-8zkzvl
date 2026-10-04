/* eslint-disable */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import RequireStaffAuth from '../../components/auth/RequireStaffAuth.jsx';
import { supabase } from '../../lib/supabaseClient.js';
import { capture } from '../../lib/posthogAnalytics.js';
import { OWNER_CONNECTED_SYSTEMS } from '../../config/ownerConnectedSystems.js';
import { ownerAttentionNow, ownerAttentionDeferred } from '../../lib/operations/ownerAttentionRank2026.js';
import { isProspectingDue } from '../../lib/operations/ownerHqTruth2026.js';
import './PortalWorkspacePage.css';
import RecurringServicesCard from './RecurringServicesCard.jsx';

function money(value) {
  return '$' + Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STATUS_TONES = {
  RED: { background: '#fbe4e2', color: '#9b3346' }, URGENT: { background: '#fbe4e2', color: '#9b3346' }, BLOCKED: { background: '#fbe4e2', color: '#9b3346' }, FAILED: { background: '#fbe4e2', color: '#9b3346' },
  YELLOW: { background: '#fbedd2', color: '#8a5a12' }, HIGH: { background: '#fbedd2', color: '#8a5a12' }, DUE: { background: '#fbedd2', color: '#8a5a12' }, PENDING: { background: '#fbedd2', color: '#8a5a12' },
  GREEN: { background: '#e0f3e5', color: '#2d6a4f' }, OK: { background: '#e0f3e5', color: '#2d6a4f' }, RESOLVED: { background: '#e0f3e5', color: '#2d6a4f' },
  AUDITABLE: { background: '#e5eefb', color: '#2b5a9e' }, UNKNOWN: { background: '#eee5d9', color: '#4d4243' },
};
function statusPillStyle(status) { return STATUS_TONES[String(status || '').toUpperCase()] || null; }

function SystemCard({ system }) {
  const body = <div className="owner-system-card">
    <div className="system-type">{system.type}</div><h3>{system.name}</h3>
    <p>{system.description}</p><span className="system-cta">{system.cta} {system.external ? '↗' : '→'}</span>
  </div>;
  return system.external ? <a href={system.href} target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>{body}</a> : <Link to={system.href} style={{textDecoration:'none'}}>{body}</Link>;
}

function OwnerHq({ session }) {
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const didTrackLoad = useRef(false); const pollTimer = useRef(null); const authBlocked = useRef(false);
  const stopPolling = () => { if (pollTimer.current) window.clearInterval(pollTimer.current); pollTimer.current = null; };
  const load = async ({ background = false } = {}) => {
    if (!session?.access_token || authBlocked.current) { stopPolling(); setError('Staff session required.'); if (!background) setLoading(false); return; }
    if (!background) setLoading(true); setError('');
    try {
      const response = await fetch('/api/portal-operations?ownerDashboard=1', { headers: { Authorization: 'Bearer ' + session.access_token }, cache: 'no-store' });
      const body = await response.json().catch(() => ({}));
      if (response.status === 401 || response.status === 403) { authBlocked.current = true; stopPolling(); setError(body.error || 'Your staff session expired. Please sign in again.'); return; }
      if (!response.ok || !body.success) throw new Error(body.error || 'Could not load DANI HQ.');
      setData(body);
      if (!didTrackLoad.current) { didTrackLoad.current = true; capture('owner_hq_loaded', { sales_queue_count:(body.salesQueue||[]).length, research_lead_count:(body.researchLeads||[]).length, owner_accounting_decision_count:(body.accountingExceptions||[]).filter(i=>i.requires_owner_decision).length, communication_attention_count:(body.communicationAttention||[]).length, owner_attention_count:(body.ownerAttention||[]).length }); }
    } catch (e) { setError(e.message || 'Could not load DANI HQ.'); } finally { if (!background) setLoading(false); }
  };
  useEffect(() => { authBlocked.current=false; load(); pollTimer.current=window.setInterval(()=>load({background:true}),30000); return stopPolling; }, [session?.access_token]);

  const metrics = useMemo(() => {
    const jobs=data?.jobs||[], payments=data?.payments||[], quotes=data?.estimates||[], ownerAttention=data?.ownerAttention||[], salesQueue=data?.salesQueue||[], accounting=data?.accountingExceptions||[], comms=data?.communicationAttention||[], agentRuns=data?.agentRuns||[], outbox=data?.actionOutbox||[], researchWork=data?.researchWork||[];
    const activeJobs=jobs.filter(j=>!['COMPLETED','CANCELLED'].includes(String(j.job_status||'').toUpperCase()));
    const atRisk=jobs.filter(j=>['DISPATCH_REVIEW','ASSIGNMENT_OFFERED','REWORK_REQUESTED','BLOCKED'].includes(String(j.job_status||'').toUpperCase())).length + payments.filter(p=>['failed','rejected'].includes(String(p.payment_status||p.status||'').toLowerCase())).length;
    const falseInboundSla=item=>item?.domain==='SALES'&&item?.source_table==='dd_sales_queue'&&item?.reason==='Speed-to-lead SLA exceeded'&&['GMAIL_SENT','WEB_SOURCED','LINKEDIN_MESSAGE','LINKEDIN_MARKETPLACE','LINKEDIN_INVITE','HUBSPOT_DEAL'].includes(String(item?.metadata?.source||'').toUpperCase());
    const attentionAll=ownerAttention.filter(item=>item?.domain!=='SOFTWARE_PLATFORM'&&!falseInboundSla(item));
    const attentionNow=ownerAttentionNow(attentionAll), deferred=ownerAttentionDeferred(attentionAll);
    const now=new Date(); now.setHours(23,59,59,999); const salesDueRows=salesQueue.filter(i=>isProspectingDue(i,now)).sort((a,b)=>Number(b.priority_score||0)-Number(a.priority_score||0));
    const paidServices=salesQueue.filter(i=>String(i.disposition||'').toUpperCase()==='PAYMENT_SUCCEEDED');
    const liveQuotes=quotes.filter(q=>String(q.source_slug||'').toLowerCase()==='thumbtack'&&!['converted','approved','cancelled','declined','expired','superseded'].includes(String(q.estimate_status||'').toLowerCase()));
    const quoteValue=liveQuotes.reduce((s,q)=>s+Number(q.estimated_total||0),0);
    const failedAgents=agentRuns.filter(r=>['FAILED','BLOCKED','PAUSED'].includes(String(r.status||'').toUpperCase())).length;
    const completedAgents=agentRuns.filter(r=>['SUCCEEDED','COMPLETED','GREEN'].includes(String(r.status||'').toUpperCase())).length;
    return { activeJobs:activeJobs.length, atRisk, ownerAttention:attentionNow.length, ownerAttentionRows:attentionNow, deferredOwnerAttentionRows:deferred, salesDue:salesDueRows.length, salesDueRows, paidServices:paidServices.length, quoteValue, ownerAccounting:accounting.filter(i=>i.requires_owner_decision).length, accountingExceptions:accounting.length, communicationAttention:comms.length, agentFailures:failedAgents, agentCompleted:completedAgents, outboxExceptions:outbox.filter(i=>!['SUCCEEDED','COMPLETED'].includes(String(i.status||'').toUpperCase())).length, researchOpen:researchWork.filter(i=>String(i.status||'').toUpperCase()!=='GREEN').length, researchReady:researchWork.filter(i=>['EVIDENCE_READY','REVIEW_READY','GREEN'].includes(String(i.status||'').toUpperCase())).length };
  },[data]);

  if (loading) return <main className="portal-shell"><p>Loading DANI HQ…</p></main>;
  if (error) return <main className="portal-shell"><div className="portal-alert">{error}</div></main>;
  const brief=data?.morningBrief; const supportReady=brief?.overnight_verified?.support_ready; const servicesTotal=brief?.business_health?.SERVICE_CATALOG?.metrics?.services_total ?? brief?.overnight_verified?.services_total;
  const supportLabel = Number.isFinite(Number(supportReady)) && Number(servicesTotal)>0 ? `${supportReady}/${servicesTotal}` : '—';
  const companyState=brief?.company_status||'UNKNOWN';

  return <main className="portal-shell owner-command-shell">
    <nav className="owner-command-nav" aria-label="Owner HQ">
      <div className="owner-command-brand"><strong>DANI DECLARES</strong><span>Owner command center</span></div>
      <a className="active" href="#overview">Overview</a>
      <Link to="/portal/acquisition">Sales <span className="nav-count">{metrics.salesDue}</span></Link>
      <Link to="/portal/operations">Operations <span className="nav-count">{metrics.activeJobs}</span></Link>
      <Link to="/portal/providers">Providers</Link><Link to="/portal/customers">Customers</Link>
      <a href="#money">Money <span className="nav-count">{metrics.ownerAccounting}</span></a>
      <a href="#research">Research</a><Link to="/portal/services">Catalog</Link><a href="#tech">Tech</a><a href="#connections">Connections</a>
    </nav>

    <div className="owner-command-main" id="overview">
      <header className="portal-hero"><div><p className="portal-eyebrow">Owner HQ</p><h1>Good afternoon, Danielle.</h1><p>Company truth, next actions and agent outcomes. Deep system detail stays available when you need it.</p></div><div className="portal-hero-actions"><div className="portal-account-badge">Signed in as <strong>{session.user?.email}</strong></div><div className="portal-actions"><button className="portal-refresh" onClick={load}>Refresh</button><Link className="portal-primary" to="/portal/operations">Open operations</Link></div></div></header>

      {brief && <section className="portal-card owner-command-brief"><div className="owner-command-section-head"><div><p className="portal-eyebrow">While you were away</p><h2>{brief.headline || 'DANI operating brief'}</h2><p>Verified state only · generated {brief.generated_at ? new Date(brief.generated_at).toLocaleString() : '—'}</p></div><span className="portal-pill" style={statusPillStyle(companyState)}>{companyState}</span></div><div className="portal-summary-grid"><a className="portal-summary-tile" href="#attention"><strong>{metrics.ownerAttention}</strong><span>Needs Danielle now</span></a><Link className="portal-summary-tile" to="/portal/acquisition"><strong>{metrics.salesDue}</strong><span>Revenue actions due</span></Link><Link className="portal-summary-tile" to="/portal/operations"><strong>{metrics.activeJobs}</strong><span>Active jobs</span></Link><a className="portal-summary-tile" href="#agents"><strong>{metrics.agentCompleted}</strong><span>Recent agent completions</span></a><a className="portal-summary-tile" href="#research"><strong>{brief.overnight_verified?.research_queued ?? metrics.researchOpen}</strong><span>Research in motion</span></a><Link className="portal-summary-tile" to="/portal/services"><strong>{supportLabel}</strong><span>Support-ready services</span></Link></div></section>}

      <div className="owner-command-grid">
        <section className="portal-card" id="attention"><div className="owner-command-section-head"><div><p className="portal-eyebrow">Needs your attention</p><h2>Danielle queue</h2><p className="owner-quiet">Only owner-only or genuinely interruptive work belongs here.</p></div><span className="portal-pill" style={metrics.ownerAttention?statusPillStyle('HIGH'):statusPillStyle('GREEN')}>{metrics.ownerAttention||'CLEAR'}</span></div>{metrics.ownerAttentionRows.length?metrics.ownerAttentionRows.slice(0,5).map(item=><div className="portal-row" key={item.id}><div><strong>{item.reason}</strong><small>{item.domain} · {item.metadata?.governor?.next_action||item.recommended_action}</small></div><span className="portal-pill" style={statusPillStyle(item.priority)}>{item.priority}</span></div>):<div className="portal-success">Nothing needs Danielle right now.</div>}{metrics.deferredOwnerAttentionRows.length>0&&<details className="owner-command-details"><summary>{metrics.deferredOwnerAttentionRows.length} deferred/system-held items</summary>{metrics.deferredOwnerAttentionRows.slice(0,8).map(item=><div className="portal-row" key={item.id}><div><strong>{item.reason}</strong><small>{item.metadata?.governor?.state?.replaceAll('_',' ').toLowerCase()}</small></div></div>)}</details>}</section>

        <section className="portal-card"><p className="portal-eyebrow">Money + revenue</p><h2>Cash-moving work</h2><div className="portal-summary-grid"><Link className="portal-summary-tile" to="/portal/quotes"><strong>{money(metrics.quoteValue)}</strong><span>Verified open quote value</span></Link><Link className="portal-summary-tile" to="/portal/acquisition"><strong>{metrics.salesDue}</strong><span>Follow-ups due</span></Link><Link className="portal-summary-tile" to="/portal/operations"><strong>{metrics.paidServices}</strong><span>Paid services to fulfill</span></Link><a className="portal-summary-tile" href="#money"><strong>{metrics.ownerAccounting}</strong><span>Money decisions</span></a></div></section>
      </div>

      <div className="owner-command-grid">
        <section className="portal-card"><div className="owner-command-section-head"><div><p className="portal-eyebrow">Commercial pipeline</p><h2>What can move revenue next</h2></div><Link className="owner-command-more" to="/portal/acquisition">Open Sales →</Link></div>{metrics.salesDueRows.slice(0,5).map(item=><div className="portal-row" key={item.id}><div><strong>{item.company_name||item.contact_name||'Sales lead'}</strong><small>{item.contact_name||'Contact pending'} · {item.disposition||'UNSET'} · next {item.next_action||'Follow up'}</small></div><span className="portal-pill" style={statusPillStyle('DUE')}>DUE</span></div>)}{!metrics.salesDue&&<div className="portal-success">No dated sales actions are due.</div>}</section>
        <section className="portal-card"><div className="owner-command-section-head"><div><p className="portal-eyebrow">Today’s operations</p><h2>Fulfillment state</h2></div><Link className="owner-command-more" to="/portal/operations">Open Operations →</Link></div><div className="portal-summary-grid"><Link className="portal-summary-tile" to="/portal/operations"><strong>{metrics.activeJobs}</strong><span>Active jobs</span></Link><Link className="portal-summary-tile" to="/portal/operations"><strong>{metrics.atRisk}</strong><span>Exceptions</span></Link></div><p className="owner-quiet">Paid work, dispatch, evidence and QA stay under DANI’s governed transaction path.</p></section>
      </div>

      <section className="portal-card" id="agents"><div className="owner-command-section-head"><div><p className="portal-eyebrow">Agent activity</p><h2>DANI worked; you review outcomes</h2><p className="owner-quiet">Agent traces stay inspectable, but the home view reports outcomes and exceptions instead of internal paperwork.</p></div></div><div className="owner-agent-summary"><div className="owner-agent-stat"><strong>{metrics.agentCompleted}</strong><span>recent completions</span></div><div className="owner-agent-stat"><strong>{metrics.agentFailures}</strong><span>failed / paused</span></div><div className="owner-agent-stat"><strong>{metrics.outboxExceptions}</strong><span>external actions incomplete</span></div><div className="owner-agent-stat"><strong>{metrics.researchReady}</strong><span>research ready for review</span></div></div></section>

      <section className="portal-card" id="money"><div className="owner-command-section-head"><div><p className="portal-eyebrow">Exception center</p><h2>Money, communications and governed holds</h2></div></div><div className="portal-summary-grid"><a className="portal-summary-tile" href="#money"><strong>{metrics.accountingExceptions}</strong><span>Accounting exceptions</span></a><a className="portal-summary-tile" href="#money"><strong>{metrics.communicationAttention}</strong><span>Replies needing review</span></a><a className="portal-summary-tile" href="#money"><strong>{metrics.outboxExceptions}</strong><span>External actions incomplete</span></a></div><details className="owner-command-details"><summary>Inspect open accounting exceptions</summary>{(data?.accountingExceptions||[]).slice(0,12).map(item=><div className="portal-row" key={item.id}><div><strong>{item.exception_type}</strong><small>{item.assigned_lane} · {item.description}</small></div><span className="portal-pill">{item.requires_owner_decision?'OWNER':'ACCOUNTING'}</span></div>)}</details><details className="owner-command-details"><summary>Inspect inbound communications</summary>{(data?.communicationAttention||[]).slice(0,8).map(item=><div className="portal-row" key={item.id}><div><strong>{item.subject||'Inbound business communication'}</strong><small>{item.sender_address||'Unknown sender'} · {item.relationship_type||'UNMATCHED'}</small></div><span className="portal-pill" style={statusPillStyle(item.priority)}>{item.priority}</span></div>)}</details></section>

      <section className="portal-card" id="research"><div className="owner-command-section-head"><div><p className="portal-eyebrow">Research + intelligence</p><h2>Research stays deep, not loud</h2><p className="owner-quiet">The home screen reports movement. Questions, sources, snapshots and evidence remain available below when you want to inspect them.</p></div><span className="portal-pill">{metrics.researchOpen} OPEN</span></div><details className="owner-command-details"><summary>Inspect current research work</summary>{(data?.researchWork||[]).slice(0,12).map(item=><div className="portal-row" key={item.id}><div><strong>{item.question}</strong><small>{item.priority} · {item.status} · {item.next_action||'Continue evidence collection'}</small></div><span className="portal-pill">{item.status}</span></div>)}</details><details className="owner-command-details"><summary>Inspect latest authority-source checks</summary>{(data?.researchSources||[]).slice(0,10).map(source=><div className="portal-row" key={source.id}><div><strong>{source.source_title}</strong><small>{source.authority_level} · {source.temporal_class} · HTTP {source.last_http_status??'—'}</small></div><span className="portal-pill">{source.last_error?'ERROR':'WATCHING'}</span></div>)}</details></section>

      <section className="portal-card" id="tech"><p className="portal-eyebrow">Company controller</p><h2>Business + software health</h2><div className="owner-command-health">{(data?.companyDomains||[]).map(item=><div className="owner-health-item" key={item.domain}><strong>{item.domain.replaceAll('_',' ')}</strong><small>{item.summary||item.next_autonomous_action||'Awaiting verified evidence'}</small><span className="portal-pill" style={statusPillStyle(item.status)}>{item.status}</span></div>)}</div></section>

      <section className="portal-card" id="connections"><div className="owner-command-section-head"><div><p className="portal-eyebrow">Connected authority</p><h2>Open another system only when its authority matters</h2></div></div><details className="owner-command-details"><summary>Show connected systems</summary><div className="owner-system-grid" style={{marginTop:12}}>{OWNER_CONNECTED_SYSTEMS.map(system=><SystemCard key={system.key} system={system}/>)}</div></details></section>

      <RecurringServicesCard session={session} ownerMode />
      <footer className="portal-footer"><strong>Authority rule:</strong> DANI owns customer, service, commercial, operational, fulfillment and release state. Connected systems remain authoritative for their own domains until an explicit integration replaces or synchronizes that authority.</footer>
    </div>
  </main>;
}

function OwnerHQLoader(){const[session,setSession]=React.useState(null);const[loading,setLoading]=React.useState(true);const[error,setError]=React.useState('');React.useEffect(()=>{let active=true;supabase.auth.getSession().then(({data,error:authError})=>{if(!active)return;if(authError||!data.session)setError('Staff session required.');else setSession(data.session);setLoading(false);});return()=>{active=false};},[]);if(loading)return <main className="portal-shell"><p>Checking owner access…</p></main>;if(error||!session)return <main className="portal-shell"><div className="portal-alert">{error||'Staff session required.'}</div></main>;return <OwnerHq session={session}/>;}
export default function OwnerHQPage(){return <RequireStaffAuth><OwnerHQLoader/></RequireStaffAuth>;}
