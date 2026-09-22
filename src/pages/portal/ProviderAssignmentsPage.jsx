import React, { useState } from 'react';
import ProviderNav from './ProviderNav.jsx';
import { Card, Empty, LockedCard, formatDate, useProviderWorkspace, AccountBadge } from './providerWorkspaceShared.jsx';
import './PortalWorkspacePage.css';

export default function ProviderAssignmentsPage() {
  const { session, snapshot, loading, error, message, load, act } = useProviderWorkspace();
  const [counterById,setCounterById]=useState({});
  const [reasonById,setReasonById]=useState({});
  if (loading) return <main className="portal-shell"><p>Loading your DANI DECLARES workspace…</p></main>;
  if (error && !snapshot) return <main className="portal-shell"><div className="portal-alert">{error}</div></main>;
  if (snapshot?.role !== 'provider') return <main className="portal-shell"><div className="portal-alert">This page is only available to provider accounts.</div></main>;
  const isApproved = snapshot.application?.application_status === 'APPROVED';
  const isSigned = snapshot.application?.agreement_status === 'EXECUTED';
  return <main className="portal-shell">
    <header className="portal-hero"><div><p className="portal-eyebrow">DANI DECLARES PROVIDER</p><h1>Assignments</h1><p>Review proposed quote work before dispatch, then manage accepted jobs. Quote offers support Accept, Decline, or Counteroffer.</p></div><div className="portal-hero-actions"><AccountBadge session={session} /><button className="portal-refresh" onClick={load}>Refresh</button></div></header>
    <ProviderNav isApprovedProvider={isApproved} agreementSigned={isSigned} />
    {error && <div className="portal-alert" role="alert">{error}</div>}{message && <div className="portal-success" role="status">{message}</div>}
    {!isApproved ? <LockedCard title="Assignments">Assignments unlock once your application is approved.</LockedCard> : <>
      <Card title="Quote Assignment Offers">
        {snapshot.quoteAssignments?.length ? snapshot.quoteAssignments.map(item => <div className="portal-row" key={item.id} style={{alignItems:'flex-start'}}>
          <div>
            <strong>{item.scope_snapshot?.title || item.dd_estimates?.public_reference || 'Proposed DANI assignment'}</strong>
            <small>{item.status} · {item.dd_estimates?.location_address || 'Location on file'}</small>
            <small>Proposed provider compensation: {'$' + Number(item.proposed_compensation || 0).toFixed(2)}</small>
            {item.scope_snapshot?.summary && <p className="portal-note">{item.scope_snapshot.summary}</p>}
            {item.scope_snapshot?.components?.length ? <div className="portal-note"><strong>Your assigned work</strong><ul>{item.scope_snapshot.components.map((component,index)=><li key={component.componentCode||index}>{component.componentName||component.componentCode||'Work component'}{component.quantity!=null?` · ${component.quantity} ${component.unitType||''}`:''}</li>)}</ul></div> : null}
            {item.scope_snapshot?.inclusions?.length ? <div className="portal-note"><strong>Included</strong><ul>{item.scope_snapshot.inclusions.map((value,index)=><li key={index}>{String(value)}</li>)}</ul></div> : null}
            {item.scope_snapshot?.exclusions?.length ? <div className="portal-note"><strong>Not included</strong><ul>{item.scope_snapshot.exclusions.map((value,index)=><li key={index}>{String(value)}</li>)}</ul></div> : null}
            {item.scope_snapshot?.completionCriteria?.length ? <div className="portal-note"><strong>Completion standard</strong><ul>{item.scope_snapshot.completionCriteria.map((value,index)=><li key={index}>{String(value)}</li>)}</ul></div> : null}
            {item.scope_snapshot?.evidenceRequirements?.length ? <div className="portal-note"><strong>Evidence to submit</strong><ul>{item.scope_snapshot.evidenceRequirements.map((value,index)=><li key={index}>{String(value)}</li>)}</ul></div> : null}
            {item.resource_requirements_snapshot?.length ? <div className="portal-note"><strong>Resources you must provide/verify</strong><ul>{item.resource_requirements_snapshot.map((req,index)=><li key={req.code||index}>{req.name||req.code||'Required resource'}{req.minimumQuantity>1?` · qty ${req.minimumQuantity}`:''}{req.compensationTreatment?` · ${String(req.compensationTreatment).replaceAll('_',' ').toLowerCase()}`:''}</li>)}</ul></div> : null}
            {item.status === 'COUNTEROFFERED' && <small>Counteroffer submitted: {'$' + Number(item.counter_compensation || 0).toFixed(2)}{item.counter_reason ? ' · ' + item.counter_reason : ''}</small>}
          </div>
          {item.status === 'OFFERED' && <div className="portal-actions" style={{alignItems:'flex-start',flexWrap:'wrap'}}>
            <button onClick={() => act('estimate_assignment_response',{assignmentId:item.id,decision:'ACCEPT'})}>Accept</button>
            <button className="secondary" onClick={() => act('estimate_assignment_response',{assignmentId:item.id,decision:'DECLINE',reason:reasonById[item.id] || 'Provider declined proposed assignment.'})}>Decline</button>
            <input aria-label="Counteroffer amount" type="number" min="0" step="0.01" placeholder="Counteroffer $" value={counterById[item.id] || ''} onChange={e => setCounterById(prev => ({...prev,[item.id]:e.target.value}))}/>
            <input aria-label="Counteroffer reason" type="text" placeholder="Reason / scope adjustment" value={reasonById[item.id] || ''} onChange={e => setReasonById(prev => ({...prev,[item.id]:e.target.value}))}/>
            <button className="secondary" onClick={() => act('estimate_assignment_response',{assignmentId:item.id,decision:'COUNTEROFFER',counterCompensation:Number(counterById[item.id]),reason:reasonById[item.id] || null})}>Counteroffer</button>
          </div>}
        </div>) : <Empty>No quote assignments are waiting for your response.</Empty>}
      </Card>
      <Card title="Assignment Queue">{snapshot.assignments?.length ? snapshot.assignments.map(item => <div className="portal-row" key={item.id}><div><strong>{item.job?.job_title || 'Assigned Job'}</strong><small>{item.assignment_status} · {item.job?.location_address || 'Location on file'}{item.job?.sla_due_at ? ` · SLA due ${formatDate(item.job.sla_due_at)}` : ''}</small></div>{item.assignment_status === 'OFFERED' && <div className="portal-actions"><button onClick={() => act('assignment_response', { assignmentId: item.id, decision: 'ACCEPT' })}>Accept</button><button className="secondary" onClick={() => act('assignment_response', { assignmentId: item.id, decision: 'REJECT', reason: 'Provider declined assignment.' })}>Reject</button></div>}</div>) : <Empty />}</Card></>}
  </main>;
}
