/* eslint-disable */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import RequireStaffAuth from '../../components/auth/RequireStaffAuth.jsx';
import { supabase } from '../../lib/supabaseClient.js';
import { capture } from '../../lib/posthogAnalytics.js';
import { OWNER_CONNECTED_SYSTEMS, OWNER_PRIORITY_LINKS } from '../../config/ownerConnectedSystems.js';
import { ownerAttentionNow, ownerAttentionDeferred } from '../../lib/operations/ownerAttentionRank2026.js';
import { isProspectingDue } from '../../lib/operations/ownerHqTruth2026.js';
import './PortalWorkspacePage.css';

const STAFF_ROLES = new Set(['admin', 'owner', 'staff_admin', 'staff']);

function money(value) {
  return '$' + Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STATUS_TONES = {
  RED: { background: '#fbe4e2', color: '#9b3346' },
  URGENT: { background: '#fbe4e2', color: '#9b3346' },
  BLOCKED: { background: '#fbe4e2', color: '#9b3346' },
  FAILED: { background: '#fbe4e2', color: '#9b3346' },
  YELLOW: { background: '#fbedd2', color: '#8a5a12' },
  HIGH: { background: '#fbedd2', color: '#8a5a12' },
  DUE: { background: '#fbedd2', color: '#8a5a12' },
  PENDING: { background: '#fbedd2', color: '#8a5a12' },
  GREEN: { background: '#e0f3e5', color: '#2d6a4f' },
  OK: { background: '#e0f3e5', color: '#2d6a4f' },
  RESOLVED: { background: '#e0f3e5', color: '#2d6a4f' },
  AUDITABLE: { background: '#e5eefb', color: '#2b5a9e' },
  UNKNOWN: { background: '#eee5d9', color: '#4d4243' },
};
function statusPillStyle(status) {
  return STATUS_TONES[String(status || '').toUpperCase()] || null;
}

function SystemCard({ system }) {
  const body = (
    <div style={{
      height: '100%', border: '1px solid #e6d9c8', borderRadius: 16, background: '#fff', padding: 18,
      boxShadow: '0 8px 28px rgba(0,0,0,.04)', textDecoration: 'none', color: '#21191a',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <div><div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.11em', color: '#9a6f36' }}>{system.type}</div><h3 style={{ margin: '5px 0 0', color: '#6b1f2b', fontSize: 18 }}>{system.name}</h3></div>
        <span style={{ borderRadius: 999, padding: '4px 8px', background: system.status === 'PRIMARY' ? '#edf8ef' : '#f5efe6', color: system.status === 'PRIMARY' ? '#2d6a4f' : '#6b5f60', fontSize: 9, fontWeight: 900, whiteSpace: 'nowrap' }}>{system.status}</span>
      </div>
      <p style={{ margin: '10px 0 15px', fontSize: 12, lineHeight: 1.5, color: '#75696a' }}>{system.description}</p>
      <span style={{ fontSize: 12, fontWeight: 900, color: '#7a263a' }}>{system.cta} {system.external ? '↗' : '→'}</span>
    </div>
  );
  return system.external ? <a href={system.href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>{body}</a> : <Link to={system.href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>{body}</Link>;
}

function OwnerHq({ session }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const didTrackLoad = useRef(false);
  const pollTimer = useRef(null);
  const authBlocked = useRef(false);
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
      if (!didTrackLoad.current) { didTrackLoad.current = true; capture('owner_hq_loaded', { sales_queue_count: (body.salesQueue || []).length, research_lead_count: (body.researchLeads || []).length, owner_accounting_decision_count: (body.accountingExceptions || []).filter(item => item.requires_owner_decision).length, communication_attention_count: (body.communicationAttention || []).length, owner_attention_count: (body.ownerAttention || []).length }); }
    } catch (e) { setError(e.message || 'Could not load DANI HQ.'); } finally { if (!background) setLoading(false); }
  };
  useEffect(() => { authBlocked.current = false; load(); pollTimer.current = window.setInterval(() => load({ background: true }), 30000); return stopPolling; }, [session?.access_token]); // eslint-disable-line react-hooks/exhaustive-deps

  const metrics = useMemo(() => {
    const requests=data?.requests||[], jobs=data?.jobs||[], providers=data?.providers||[], evidence=data?.evidence||[], payments=data?.payments||[], changes=data?.changes||[], appointments=data?.appointments||[], quotes=data?.estimates||[], ownerAttention=data?.ownerAttention||[], salesQueue=data?.salesQueue||[], researchLeads=data?.researchLeads||[], accountingExceptions=data?.accountingExceptions||[], communicationAttention=data?.communicationAttention||[], agentRuns=data?.agentRuns||[], actionOutbox=data?.actionOutbox||[], researchPrograms=data?.researchPrograms||[], researchWork=data?.researchWork||[], researchEvidence=data?.researchEvidence||[], researchSources=data?.researchSources||[], researchSnapshots=data?.researchSnapshots||[];
    const openRequests=requests.filter(r=>!['completed','cancelled','closed','job_created'].includes(String(r.status||'').toLowerCase()));
    const activeJobs=jobs.filter(j=>!['COMPLETED','CANCELLED'].includes(String(j.job_status||'').toUpperCase()));
    const atRisk=jobs.filter(j=>['DISPATCH_REVIEW','ASSIGNMENT_OFFERED','REWORK_REQUESTED','BLOCKED'].includes(String(j.job_status||'').toUpperCase()));
    const pendingEvidence=evidence.filter(e=>String(e.verification_status||'').toUpperCase()==='PENDING');
    const failedPayments=payments.filter(p=>['failed','rejected'].includes(String(p.payment_status||p.status||'').toLowerCase()));
    const pendingChanges=changes.filter(c=>String(c.status||'').toUpperCase()==='PENDING_APPROVAL');
    const today=new Date(); today.setHours(0,0,0,0);
    const todayAppointments=appointments.filter(a=>{const d=new Date(a.starts_at);return !Number.isNaN(d.getTime())&&d>=today&&d<new Date(today.getTime()+86400000);});
    const livePipelineQuotes=quotes.filter(q=>{const status=String(q.estimate_status||'').toLowerCase();const source=String(q.source_slug||'').toLowerCase();return source==='thumbtack'&&!['converted','approved','cancelled','declined','expired','superseded'].includes(status);});
    const quoteValue=livePipelineQuotes.reduce((sum,q)=>sum+Number(q.estimated_total||0),0);
    const unresolvedQuoteCount=quotes.filter(q=>['admin_quote_builder','danis_specials_owner_quote'].includes(String(q.source_slug||'').toLowerCase())).length;
    const falseInboundSla=item=>item?.domain==='SALES'&&item?.source_table==='dd_sales_queue'&&item?.reason==='Speed-to-lead SLA exceeded'&&['GMAIL_SENT','WEB_SOURCED','LINKEDIN_MESSAGE','LINKEDIN_MARKETPLACE','LINKEDIN_INVITE','HUBSPOT_DEAL'].includes(String(item?.metadata?.source||'').toUpperCase());
    const businessAttentionAll=ownerAttention.filter(item=>item?.domain!=='SOFTWARE_PLATFORM'&&!falseInboundSla(item));
    const businessOwnerAttention=ownerAttentionNow(businessAttentionAll), deferredOwnerAttention=ownerAttentionDeferred(businessAttentionAll);
    const now=new Date(); now.setHours(23,59,59,999);
    const salesDueRows=salesQueue.filter(item=>isProspectingDue(item,now)).sort((a,b)=>Number(b.priority_score||0)-Number(a.priority_score||0));
    const paidServiceRows=salesQueue.filter(item=>String(item.disposition||'').toUpperCase()==='PAYMENT_SUCCEEDED');
    return { openRequests:openRequests.length,activeJobs:activeJobs.length,providers:providers.length,atRisk:atRisk.length+failedPayments.length,pendingEvidence:pendingEvidence.length,pendingChanges:pendingChanges.length,todayAppointments:todayAppointments.length,quoteValue,livePipelineQuotes:livePipelineQuotes.length,unresolvedQuoteCount,ownerAttention:businessOwnerAttention.length,ownerAttentionRows:businessOwnerAttention,deferredOwnerAttentionRows:deferredOwnerAttention,systemHealthAttention:ownerAttention.filter(item=>item?.domain==='SOFTWARE_PLATFORM'),salesQueue:salesQueue.length,salesDue:salesDueRows.length,salesDueRows,paidServices:paidServiceRows.length,paidServiceRows,researchLeads:researchLeads.length,ownerAccounting:accountingExceptions.filter(item=>item.requires_owner_decision).length,accountingExceptions:accountingExceptions.length,communicationAttention:communicationAttention.length,agentFailures:agentRuns.filter(run=>['FAILED','BLOCKED','PAUSED'].includes(String(run.status||'').toUpperCase())).length,outboxExceptions:actionOutbox.filter(item=>!['SUCCEEDED','COMPLETED'].includes(String(item.status||'').toUpperCase())).length,researchPrograms:researchPrograms.length,researchOpen:researchWork.filter(item=>!['GREEN'].includes(String(item.status||'').toUpperCase())).length,researchReady:researchWork.filter(item=>['EVIDENCE_READY','REVIEW_READY','GREEN'].includes(String(item.status||'').toUpperCase())).length,researchConfirmed:researchEvidence.filter(item=>String(item.evidence_status||'').toUpperCase()==='CONFIRMED').length,researchSources:researchSources.length,researchChanged:researchSnapshots.filter(item=>item.changed).length,researchFailures:researchSources.filter(item=>item.last_error||(item.last_http_status&&Number(item.last_http_status)>=400)).length };
  },[data]);

  if (loading) return <main className="portal-shell"><p>Loading DANI HQ…</p></main>;
  if (error) return <main className="portal-shell"><div className="portal-alert">{error}</div></main>;
  const role=session.user?.app_metadata?.portal_role||session.user?.app_metadata?.role||'owner';
  return <main className="portal-shell">
    <header className="portal-hero"><div><p className="portal-eyebrow">DANI DECLARES • OWNER HQ</p><h1>DANI HQ</h1><p>Your browser-based company control center. DANI-native operations live here; connected platforms remain available from the same screen when they are the authority for a specific job.</p></div><div className="portal-hero-actions"><div className="portal-account-badge">Signed in as <strong>{session.user?.email}</strong></div><div className="portal-actions"><button className="portal-refresh" onClick={load}>Refresh</button><Link className="portal-primary" to="/portal/operations">Open Operations</Link></div></div></header>
    <section className="portal-status-banner"><div><strong>{role==='owner'?'Owner control':'Staff control'} — one DANI front door</strong><p style={{margin:'6px 0 0',color:'#6d6263'}}>You do not need a separate desktop application to reach the connected systems below. This portal is the DANI launchpad; the linked systems stay the authority where DANI has not replaced them.</p></div><span className="portal-pill">Live DANI data · refreshes quietly every 30s</span></section>
    {data?.morningBrief&&<section className="portal-card" id="morning-brief" style={{background:'linear-gradient(135deg, #6b1f2b 0%, #4a1620 100%)',color:'#fff',border:data.morningBrief.company_status==='RED'?'2px solid #f0a9a9':'1px solid #4a1620'}}><div><p className="portal-eyebrow" style={{color:'#f0cf78'}}>Morning Brief · verified state only</p><h2 style={{margin:'5px 0 0',color:'#fff'}}>DANI worked while you were away</h2><p style={{marginTop:8,color:'#f0e2e4',lineHeight:1.55}}>{data.morningBrief.headline}</p></div><div className="portal-summary-grid" style={{marginTop:14}}><a className="portal-summary-tile" href="#company-health"><strong>{data.morningBrief.company_status}</strong><span>Company state</span></a><a className="portal-summary-tile" href="#owner-attention"><strong>{metrics.ownerAttention}</strong><span>Needs Danielle</span></a><a className="portal-summary-tile" href="#company-health"><strong>{data.morningBrief.overnight_verified?.research_queued??0}</strong><span>Research queued</span></a><a className="portal-summary-tile" href="#company-health"><strong>{data.morningBrief.overnight_verified?.support_ready??0}/{data.morningBrief.overnight_verified?.services_total??0}</strong><span>Support-ready services</span></a><a className="portal-summary-tile" href="#software-platform"><strong>{data.morningBrief.software_platform?.status||'UNKNOWN'}</strong><span>Software & platform</span></a><Link className="portal-summary-tile" to="/portal/acquisition"><strong>{metrics.salesQueue}</strong><span>CRM / prospect records</span></Link></div></section>}
    <section className="portal-card" id="company-health"><div><p className="portal-eyebrow">Company controller</p><h2 style={{margin:'5px 0 0'}}>Business + software health</h2><p className="portal-note" style={{marginTop:8}}>GREEN is never inferred. RED, YELLOW and UNKNOWN stay visible until their evidence gates are actually satisfied.</p></div><div style={{marginTop:14}}>{(data?.companyDomains||[]).map(item=><div className="portal-row" key={item.domain} id={item.domain==='SOFTWARE_PLATFORM'?'software-platform':undefined}><div><strong>{item.domain.replaceAll('_',' ')}</strong><small>{item.summary}</small><small>Next: {item.next_autonomous_action||'Await verified evidence'}</small></div><span className="portal-pill" style={statusPillStyle(item.status)}>{item.status}</span></div>)}</div></section>
    <div className="portal-summary-grid"><a className="portal-summary-tile" href="#owner-attention"><strong>{metrics.ownerAttention}</strong><span>Needs Danielle</span></a><Link className="portal-summary-tile" to="/portal/acquisition"><strong>{metrics.salesDue}</strong><span>Prospecting due / overdue</span></Link><Link className="portal-summary-tile" to="/portal/operations"><strong>{metrics.activeJobs}</strong><span>Active jobs</span></Link><Link className="portal-summary-tile" to="/portal/operations"><strong>{metrics.paidServices}</strong><span>Paid services to fulfill</span></Link><a className="portal-summary-tile" href="#owner-accounting"><strong>{metrics.ownerAccounting}</strong><span>Money decisions</span></a><a className="portal-summary-tile" href="#owner-comms"><strong>{metrics.communicationAttention}</strong><span>Replies needing action</span></a><Link className="portal-summary-tile" to="/portal/operations"><strong>{metrics.atRisk}</strong><span>Operational exceptions</span></Link><Link className="portal-summary-tile" to="/portal/quotes"><strong>{money(metrics.quoteValue)}</strong><span>Verified open quote value</span></Link></div>
    <section className="portal-card" id="owner-attention"><div><p className="portal-eyebrow">Needs your attention</p><h2 style={{margin:'5px 0 0'}}>Owner Attention Queue</h2></div><div style={{marginTop:14}}>{metrics.ownerAttentionRows.length?metrics.ownerAttentionRows.map(item=><div className="portal-row" key={item.id}><div><strong>{item.reason}</strong><small>{item.domain} · {item.priority}</small>{(item.metadata?.governor?.next_action||item.recommended_action)&&<small>Next: {item.metadata?.governor?.next_action||item.recommended_action}</small>}</div><span className="portal-pill">{item.priority}</span></div>):<div>No open owner-attention items.</div>}</div></section>
    <section className="portal-card" id="owner-revenue"><div><p className="portal-eyebrow">Revenue control</p><h2 style={{margin:'5px 0 0'}}>Prospecting & Sales Follow-up</h2><p className="portal-note" style={{marginTop:8}}>Only dated actions still unresolved by newer canonical contact evidence count as due.</p></div><div className="portal-summary-grid" style={{marginTop:14}}><Link className="portal-summary-tile" to="/portal/acquisition"><strong>{metrics.salesDue}</strong><span>Due / overdue actions</span></Link><Link className="portal-summary-tile" to="/portal/acquisition"><strong>{metrics.salesQueue}</strong><span>CRM / prospect records</span></Link><Link className="portal-summary-tile" to="/portal/acquisition"><strong>{metrics.researchLeads}</strong><span>Research-only leads</span></Link></div><div style={{marginTop:14}}>{metrics.salesDueRows.slice(0,8).map(item=><div className="portal-row" key={item.id}><div><strong>{item.company_name||item.contact_name||'Sales lead'}</strong><small>{item.contact_name||'Contact pending'} · Priority {item.priority_score??'—'} · {item.disposition||'UNSET'}</small><small>Next: {item.next_action||'Follow up'} · due {item.next_action_date}</small></div><span className="portal-pill" style={statusPillStyle('DUE')}>DUE</span></div>)}</div></section>
    <section className="portal-card" id="research-engine"><div><p className="portal-eyebrow">Research intelligence</p><h2 style={{margin:'5px 0 0'}}>Research health</h2><p className="portal-note" style={{marginTop:8}}>Detailed release-blocked research remains in the research workspace; Owner HQ summarizes evidence health instead of treating every research gate as an owner action.</p></div><div className="portal-summary-grid" style={{marginTop:14}}><a className="portal-summary-tile" href="#research-engine"><strong>{metrics.researchOpen}</strong><span>Open research gates</span></a><a className="portal-summary-tile" href="#research-engine"><strong>{metrics.researchReady}</strong><span>Evidence / review ready</span></a><a className="portal-summary-tile" href="#research-engine"><strong>{metrics.researchConfirmed}</strong><span>Confirmed evidence claims</span></a><a className="portal-summary-tile" href="#research-engine"><strong>{metrics.researchFailures}</strong><span>Source check failures</span></a></div></section>
    <section className="portal-card" id="owner-accounting"><div><p className="portal-eyebrow">Money & accounting</p><h2 style={{margin:'5px 0 0'}}>Owner Decisions + Accounting Airlock</h2></div><div style={{marginTop:14}}>{(data?.accountingExceptions||[]).map(item=><div className="portal-row" key={item.id}><div><strong>{item.requires_owner_decision?'🚨 ':''}{item.exception_type}</strong><small>{item.assigned_lane} · {item.status}</small><small>{item.description}</small></div><span className="portal-pill">{item.requires_owner_decision?'OWNER':'ACCOUNTING'}</span></div>)}</div></section>
    <section className="portal-card" id="owner-comms"><div><p className="portal-eyebrow">Communications</p><h2 style={{margin:'5px 0 0'}}>Replies needing action</h2></div><div style={{marginTop:14}}>{(data?.communicationAttention||[]).map(item=><div className="portal-row" key={item.id}><div><strong>{item.subject||item.sender_address||'Communication'}</strong><small>{item.recommended_action||item.reason}</small></div></div>)}</div></section>
    <section className="portal-card"><div><p className="portal-eyebrow">Connected systems</p><h2 style={{margin:'5px 0 0'}}>Authority-aware launchpad</h2></div><div className="portal-card-grid" style={{marginTop:14}}>{OWNER_CONNECTED_SYSTEMS.map(system=><SystemCard key={system.name} system={system}/>)}</div></section>
  </main>;
}

export default function OwnerHQPage(){return <RequireStaffAuth allowedRoles={STAFF_ROLES}><OwnerHq/></RequireStaffAuth>;}
