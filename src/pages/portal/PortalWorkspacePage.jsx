import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProviderNav from './ProviderNav.jsx';
import { Card, Empty, Requirement, buildProviderRequirements, statusLabel, formatDate, useProviderWorkspace, AccountBadge } from './providerWorkspaceShared.jsx';
import './PortalWorkspacePage.css';

const ROLE_LABELS = { provider: 'DANI DECLARES Provider', resident: 'DANI DECLARES', customer: 'DANI DECLARES', property_manager: 'DANI DECLARES', procurement: 'DANI DECLARES', staff_admin: 'My Portal' };

function ResidentInvitesCard({ session, properties }) {
  const [propertyId, setPropertyId] = useState(properties?.[0]?.id || '');
  const [maxUses, setMaxUses] = useState(1);
  const [busy, setBusy] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [invites, setInvites] = useState([]);
  const [error, setError] = useState('');
  const selectedProperty = properties.find(p => p.id === propertyId);
  const call = async (action, payload) => {
    const r = await fetch('/api/portal-operations', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ action, ...payload }) });
    const body = await r.json(); if (!r.ok || !body.success) throw new Error(body.error || 'Action failed.'); return body;
  };
  const loadInvites = async (id) => { if (!id) return; try { const body = await call('list_resident_invites', { propertyId: id }); setInvites(body.invites || []); } catch (e) { setError(e.message); } };
  const generate = async () => {
    if (!propertyId) return; setBusy(true); setError(''); setInviteUrl('');
    try { const body = await call('create_resident_invite', { propertyId, maxUses: Number(maxUses) || 1 }); setInviteUrl(body.inviteUrl); await loadInvites(propertyId); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  React.useEffect(() => { if (propertyId) loadInvites(propertyId); }, [propertyId]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!properties.length) return <Card title="Resident Invites"><Empty>No properties with resident access are on file yet. Contact DANI DECLARES to add your properties.</Empty></Card>;
  return <Card title="Resident Invites">
    <p className="portal-note">Generate a link for {selectedProperty?.property_name || 'a property'} and send it to your residents — everyone who signs up through it is automatically tracked back to your account and gets the verified apartment-resident rate. This is the only way residents unlock that discount.</p>
    <div className="portal-actions" style={{ marginTop: 12, flexWrap: 'wrap' }}>
      <select value={propertyId} onChange={e => { setPropertyId(e.target.value); setInviteUrl(''); }} style={{ padding: '10px 12px', borderRadius: 8 }}>
        {properties.map(p => <option key={p.id} value={p.id} disabled={!p.resident_access_enabled}>{p.property_name}{p.resident_access_enabled ? '' : ' (resident access not enabled)'}</option>)}
      </select>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Uses <input type="number" min="1" value={maxUses} onChange={e => setMaxUses(e.target.value)} style={{ width: 64, padding: '8px 10px', borderRadius: 8 }} /></label>
      <button className="portal-primary" disabled={busy || !selectedProperty?.resident_access_enabled} onClick={generate}>{busy ? 'Generating…' : 'Generate invite link'}</button>
    </div>
    {error && <div className="portal-alert" role="alert" style={{ marginTop: 10 }}>{error}</div>}
    {inviteUrl && <div className="portal-success" style={{ marginTop: 10, wordBreak: 'break-all' }}>{inviteUrl}</div>}
    {invites.length > 0 && <div style={{ marginTop: 16 }}>
      <p className="portal-eyebrow">Existing invites for this property</p>
      {invites.map(inv => <div className="portal-row" key={inv.id}><div><strong>{inv.invited_email || 'Shared link'}</strong><small>{inv.status} · {inv.uses}/{inv.max_uses} used · Created {formatDate(inv.created_at)}</small></div></div>)}
    </div>}
  </Card>;
}

function PendingEstimatesQueue({ session }) {
  const [estimates,setEstimates]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const load=async()=>{
    setLoading(true);setError('');
    try{
      const r=await fetch('/api/portal-operations?estimates=1',{headers:{Authorization:`Bearer ${session.access_token}`}});
      const d=await r.json(); if(!r.ok||!d.success) throw new Error(d.error||'Could not load pending estimates.');
      setEstimates((d.estimates||[]).filter(x=>['needs_review','ready_to_send'].includes(x.estimate_status)));
    }catch(e){setError(e.message||'Could not load pending estimates.')}finally{setLoading(false);}
  };
  // Queue refresh is intentionally scoped to the authenticated staff session.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{load()},[]);
  return <Card title="Pending Estimates Queue">
    <p>Quotes that still need commercial review, plus estimates that have cleared review and are waiting for delivery.</p>
    {error&&<div className="portal-alert">{error}</div>}
    {loading?<p>Loading queue…</p>:estimates.length===0?<Empty>No pending estimates.</Empty>:estimates.slice(0,12).map(x=><div className="portal-row" key={x.id}>
      <div><strong>{x.public_reference} · {x.client_name||'Unnamed customer'}</strong><small>{x.source_slug||'Quote Builder'} · {x.estimate_status.replaceAll('_',' ')} · {x.created_at?formatDate(x.created_at):''}</small>{(!x.client_phone||!x.client_email)&&<small style={{color:'#8a1d2d',fontWeight:800}}>Intake incomplete: {!x.client_phone&&'phone'}{(!x.client_phone&&!x.client_email)&&' + '}{!x.client_email&&'email'}</small>}</div>
      <div style={{display:'flex',alignItems:'center',gap:10}}><strong>${Number(x.estimated_total||0).toFixed(2)}</strong><Link className="portal-primary" to={`/portal/estimates/${x.id}/review`}>Open Review</Link></div>
    </div>)}
    {estimates.length>12&&<p style={{marginTop:12,color:'#6d6263'}}>Showing the 12 most recent. Open Saved Quotes for the full queue.</p>}
  </Card>;
}

export default function PortalWorkspacePage() {
  const { session, snapshot, loading, error, message, load, act } = useProviderWorkspace();
  const [messageDrafts, setMessageDrafts] = useState({});
  const [paymentError, setPaymentError] = useState('');
  const sendJobMessage = async (jobId) => {
    const body = (messageDrafts[jobId] || '').trim();
    if (!body) return;
    await act('send_message', { jobId, body });
    setMessageDrafts(prev => ({ ...prev, [jobId]: '' }));
  };
  if (loading) return <main className="portal-shell"><p>Loading your DANI DECLARES workspace…</p></main>;
  if (error && !snapshot) return <main className="portal-shell"><div className="portal-alert">{error}</div></main>;
  const role = snapshot?.role || 'customer';
  if (role === 'staff_admin') return <main className="portal-shell"><header className="portal-hero"><div><p className="portal-eyebrow">MY PORTAL</p><h1>My Portal</h1><p>Your authenticated owner and operations control center for sales, quoting, contract acquisition, fulfillment, dispatch, QA, customers, providers and business operations.</p></div><div className="portal-hero-actions"><AccountBadge session={session} /><button className="portal-refresh" onClick={load}>Refresh</button></div></header><Card title="Contract Acquisition"><p>Move verified opportunities through qualification, pursuit, proposal, award and contract activation.</p><Link className="portal-primary" to="/portal/acquisition">Open Contract Acquisition</Link></Card><Card title="Operations Console"><p>Open the full operating console to manage work orders, quotes and fulfillment.</p><div className="portal-actions"><a className="portal-primary" href="/portal/operations">Open Operations Console</a><a className="portal-primary" href="/portal/provider-approval">Review Provider Applications</a></div></Card><Card title="Quote Desk"><p>Create, retrieve, review and continue governed quotes without changing catalog authority.</p><div className="portal-actions"><Link className="portal-primary" to="/portal/quotes">New Quote</Link><Link className="portal-primary" to="/portal/saved-quotes">Saved Quotes</Link></div></Card><PendingEstimatesQueue session={session}/><Card title="Business Control Principle"><p>My Portal is the daily owner/operator control layer. Customer and provider experiences feed work into it; approved commercial and pricing systems remain authoritative upstream.</p></Card><Card title="Account"><Link className="portal-primary" to="/portal/settings">Notification settings</Link></Card></main>;
  const isProvider = role === 'provider'; const isCommercial = ['property_manager', 'procurement'].includes(role);
  const application = snapshot?.application || null;
  const capabilities = snapshot?.capabilities || [];
  const isApprovedProvider = application?.application_status === 'APPROVED';
  const isSignedProvider = application?.agreement_status === 'EXECUTED';
  const requirements = isProvider ? buildProviderRequirements(application, capabilities) : [];
  const completeCount = requirements.filter(r => r.ok).length;
  const openAssignments = snapshot?.assignments?.filter(a => a.assignment_status === 'OFFERED').length || 0;
  const nextAppointment = snapshot?.appointments?.filter(a => a.appointment_status !== 'CANCELLED').sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))[0];
  const openTasks = snapshot?.tasks?.filter(t => t.status !== 'COMPLETED').length || 0;
  const pendingEvidence = snapshot?.evidence?.filter(e => e.verification_status === 'PENDING').length || 0;
  const lastPayout = snapshot?.payouts?.[0];
  const messageCount = snapshot?.messages?.length || 0;
  return <main className="portal-shell">
    <header className="portal-hero"><div><p className="portal-eyebrow">{isProvider ? 'DANI DECLARES PROVIDER' : 'DANI DECLARES'}</p><h1>{ROLE_LABELS[role] || 'DANI DECLARES'}</h1><p>{isProvider ? 'Assignments, dispatch instructions, field checklists, evidence and completion records — connected to the DANI DECLARES fulfillment system.' : 'Requests, services, projects, approvals, documents and financial records — connected to the same DANI DECLARES operating system.'}</p></div><div className="portal-hero-actions"><AccountBadge session={session} /><button className="portal-refresh" onClick={load}>Refresh</button></div></header>
    {isProvider && <ProviderNav isApprovedProvider={isApprovedProvider} agreementSigned={isSignedProvider} />}
    {error && <div className="portal-alert" role="alert">{error}</div>}{message && <div className="portal-success" role="status">{message}</div>}
    {isProvider ? (isApprovedProvider ? <>
      <div className="portal-summary-grid">
        <Link className="portal-summary-tile" to="/portal/field"><strong>Open DANI FIELD</strong><span>Today’s field workspace</span></Link>
        <Link className="portal-summary-tile" to="/portal/assignments"><strong>{openAssignments}</strong><span>Assignment{openAssignments === 1 ? '' : 's'} awaiting response</span></Link>
        <Link className="portal-summary-tile" to="/portal/schedule"><strong>{nextAppointment ? formatDate(nextAppointment.starts_at) : 'None scheduled'}</strong><span>Next appointment</span></Link>
        <Link className="portal-summary-tile" to="/portal/checklist"><strong>{openTasks}</strong><span>Open checklist item{openTasks === 1 ? '' : 's'}</span></Link>
        <Link className="portal-summary-tile" to="/portal/evidence"><strong>{pendingEvidence}</strong><span>Evidence pending verification</span></Link>
        <Link className="portal-summary-tile" to="/portal/payouts"><strong>{lastPayout ? `$${Number(lastPayout.amount || 0).toFixed(2)}` : 'None yet'}</strong><span>Most recent payout</span></Link>
        <Link className="portal-summary-tile" to="/portal/messages"><strong>{messageCount}</strong><span>Message{messageCount === 1 ? '' : 's'} on your jobs</span></Link>
        <Link className="portal-summary-tile" to="/portal/profile"><strong>View profile</strong><span>Contact details & documents</span></Link>
      </div>
      <Card title="Your Authorized Services">{capabilities.length ? capabilities.map(item => <div className="portal-row" key={item.id}><div><strong>{item.capability_description || item.canonical_sku}</strong><small>{item.canonical_sku ? `${item.canonical_sku} · ` : ''}{statusLabel(item.authorization_status)}</small></div></div>) : <Empty>No authorized services on file yet — contact DANI DECLARES if this looks wrong.</Empty>}</Card>
    </> : <>
      <div className="portal-status-banner"><div><strong>Application status: {statusLabel(application?.application_status)}</strong><p style={{ margin: '6px 0 0', color: '#6d6263' }}>DANI DECLARES reviews every requirement below before your account becomes dispatch-eligible. This is not yet an active provider account — nothing here can be assigned work until it's approved.</p></div><span className="portal-pill">{completeCount}/{requirements.length} complete</span></div>
      {application?.agreement_status !== 'EXECUTED' && <Card title="Sign your Provider Agreement"><p>Signing your Provider Agreement is the first step — it must be completed before you can upload documents or view your profile.</p><Link className="portal-primary" to="/portal/provider-agreement">Sign Provider Agreement →</Link></Card>}
      <Card title="Requirements">{requirements.map(item => <Requirement key={item.label} {...item} />)}<div className="portal-actions" style={{ marginTop: 14 }}><Link className="portal-primary" to="/portal/vendor-onboarding">Upload documents</Link></div></Card>
      <Card title="Selected Services">{capabilities.length ? capabilities.map(item => <div className="portal-row" key={item.id}><div><strong>{item.capability_description || item.canonical_sku}</strong><small>{statusLabel(item.authorization_status)}</small></div></div>) : <Empty>No services selected.</Empty>}</Card>
      <Card title="Submitted Documents">{(snapshot?.documents || []).length ? snapshot.documents.map(item => <div className="portal-row" key={item.id}><div><strong>{item.document_type.replaceAll('_', ' ')}</strong><small>{statusLabel(item.verification_status)} · Uploaded {formatDate(item.uploaded_at)}</small></div></div>) : <Empty>No documents uploaded yet.</Empty>}<div className="portal-actions" style={{ marginTop: 14 }}><Link className="portal-primary" to="/portal/vendor-onboarding">Upload documents</Link></div></Card>
    </>) : <>
      {role === 'property_manager' && <ResidentInvitesCard session={session} properties={snapshot?.properties || []} />}
      <Card title="Quotes & Proposals">{paymentError && <div className="portal-alert" role="alert" style={{ marginBottom: 12 }}>{paymentError}</div>}
        {(snapshot?.estimates || []).length ? snapshot.estimates.map(item => {
          const lines = Array.isArray(item.intake_answers?.lineItems) ? item.intake_answers.lineItems : [];
          const awaiting = item.estimate_status === 'sent';
          const approved = item.estimate_status === 'approved';
          return <div className="portal-row" key={item.id}>
            <div><strong>{item.public_reference}</strong><small>{item.estimate_status.replaceAll('_',' ')} · ${Number(item.estimated_total || 0).toFixed(2)} · {item.created_at ? formatDate(item.created_at) : ''}</small><small>{lines.map(line => line.serviceName || line.serviceSku).join(' + ') || 'Quote package'}</small></div>
            {awaiting && <div className="portal-actions"><button onClick={() => act('estimate_decision',{estimateId:item.id,decision:'APPROVED'})}>Approve quote</button><button className="secondary" onClick={() => act('estimate_decision',{estimateId:item.id,decision:'DECLINED'})}>Decline</button></div>}
            {approved && <div className="portal-actions"><button onClick={async () => { try { const r=await fetch('/api/portal-operations',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({action:'create_stripe_invoice',estimateId:item.id})}); const d=await r.json(); if(!r.ok||!d.success) throw new Error(d.error||'Could not open payment.'); if(d.invoice?.hosted_invoice_url) window.location.href=d.invoice.hosted_invoice_url; else throw new Error('Payment link was not returned.'); } catch(e) { setPaymentError(e.message||'Could not open payment.'); } }}>Continue to Payment</button></div>}
          </div>;
        }) : <Empty>No quotes are currently attached to this account.</Empty>}
      </Card>
      <Card title={isCommercial ? 'Commercial Requests & Jobs' : 'My Requests & Jobs'}>{snapshot.requests?.length ? snapshot.requests.map(item => <div className="portal-row" key={item.id}><div><strong>{item.service_needed || item.service_category || 'Service request'}</strong><small>{item.status} · {item.location_address || 'Location on file'}</small></div></div>) : <Empty>No requests are currently attached to this account.</Empty>}{snapshot.jobs?.map(item => <div className="portal-row" key={item.id}><div><strong>{item.job_title}</strong><small>{item.job_status} · {item.location_address || 'Location on file'}</small></div></div>)}</Card>
      <Card title="Invoices & Financial Records"><p className="portal-note">Invoices display finalized financial records. Customer payment remains processed through the configured payment processor; the portal does not collect raw card data.</p>{snapshot.invoices?.length ? snapshot.invoices.map(item => <div className="portal-row" key={item.id}><div><strong>{item.public_reference}</strong><small>{item.invoice_status} · Balance: ${Number(item.balance_due || 0).toFixed(2)}</small></div>{item.stripe_payment_link && item.invoice_status !== 'paid' && <a className="portal-primary" href={item.stripe_payment_link} target="_blank" rel="noreferrer">Pay invoice</a>}</div>) : <Empty>No invoices are currently attached to this workspace.</Empty>}</Card>
      <Card title="Change Orders & Approvals">{snapshot.changes?.length ? snapshot.changes.map(item => <div className="portal-row" key={item.id}><div><strong>{item.reason}</strong><small>{item.status} · {item.resolved_channel || 'Channel controlled'}</small></div>{item.status === 'PENDING_APPROVAL' && <div className="portal-actions"><button onClick={() => act('change_order_decision', { changeOrderId: item.id, decision: 'APPROVED' })}>Approve</button><button className="secondary" onClick={() => act('change_order_decision', { changeOrderId: item.id, decision: 'REJECTED', reason: 'Declined in portal.' })}>Reject</button></div>}</div>) : <Empty>No pending change orders.</Empty>}</Card>
      <Card title="Messages">{(() => {
        const messagesByJob = new Map();
        (snapshot.messages || []).forEach(m => { if (!messagesByJob.has(m.job_id)) messagesByJob.set(m.job_id, []); messagesByJob.get(m.job_id).push(m); });
        const jobs = snapshot.jobs || [];
        const jobsWithMessages = jobs.filter(job => messagesByJob.has(job.id) || jobs.length <= 5);
        return jobsWithMessages.length ? jobsWithMessages.map(job => <div key={job.id} style={{ marginBottom: 20 }}>
          <strong>{job.job_title || 'Job'}</strong>
          <div className="portal-message-list" style={{ marginTop: 8 }}>{(messagesByJob.get(job.id) || []).length ? messagesByJob.get(job.id).map(m => <div key={m.id} className="portal-message"><small>{m.sender_role} · {formatDate(m.created_at)}</small><p>{m.body}</p></div>) : <Empty>No messages on this job yet.</Empty>}</div>
          <div className="portal-message-compose"><textarea rows="2" value={messageDrafts[job.id] || ''} onChange={e => setMessageDrafts(prev => ({ ...prev, [job.id]: e.target.value }))} placeholder="Write a message about this job…" /><button onClick={() => sendJobMessage(job.id)}>Send</button></div>
        </div>) : <Empty>Messages will appear here once you have an active job.</Empty>;
      })()}</Card>
      <Card title="Self-Service & Support"><p>Start a new service request, request a quote, or contact DANI DECLARES support without leaving your account.</p><div className="portal-actions"><Link className="portal-primary" to="/request-service">Request service</Link><Link className="portal-primary" to="/contact">Contact support</Link><Link className="portal-primary" to="/portal/settings">Notification settings</Link></div></Card>
    </>}
    <footer className="portal-footer"><strong>Commercial boundary:</strong> DANI DECLARES pricing is resolved upstream and frozen before operational execution. Portals coordinate work; they do not invent or rewrite rates.</footer>
  </main>;
}
